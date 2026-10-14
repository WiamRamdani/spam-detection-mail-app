from fastapi import FastAPI, Depends, HTTPException
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from database import SessionLocal, Email, User
from sqlalchemy.orm import Session
from sqlalchemy import Integer, func
from auth import get_current_user
from auth import create_access_token
from passlib.context import CryptContext
from schemas import UserRegister, UserLogin, EmailRequest, UserUpdate, EmailSend


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# charger modèle (on le fera après)
from pathlib import Path

MODEL_PATH = str(Path(__file__).resolve().parent / "bert_spam_model")

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)

model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model.to(device)
model.eval()

@app.get("/")
def home():
    return {"message": "API Spam Detection"}




@app.get("/profile")
def get_me(user_id: int = Depends(get_current_user)):
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    db.close()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "avatar": user.avatar
    }

@app.put("/profile")
def update_me(data: UserUpdate, user_id: int = Depends(get_current_user)):
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        db.close()
        raise HTTPException(status_code=404, detail="User not found")
    if data.full_name is not None:
        user.full_name = data.full_name
    if data.avatar is not None:
        user.avatar = data.avatar
    db.commit()
    db.close()
    return {"message": "Profile updated"}

@app.post("/register")
def register(user: UserRegister):
    db = SessionLocal()

    # check email exist
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed_password = pwd_context.hash(user.password)

    new_user = User(
        email=user.email,
        password=hashed_password,
        full_name=user.full_name
    )

    db.add(new_user)
    db.commit()
    db.close()

    return {"message": "User created"}


@app.post("/login")
def login(user: UserLogin):
    db = SessionLocal()

    u = db.query(User).filter(User.email == user.email).first()

    if not u:
        raise HTTPException(status_code=404, detail="User not found")

    if not pwd_context.verify(user.password, u.password):
        raise HTTPException(status_code=401, detail="Wrong password")

    token = create_access_token({"user_id": u.id})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": u.id
    }

def predict_email(text):

    enc = tokenizer(
        text,
        truncation=True,
        padding='max_length',
        max_length=128,
        return_tensors='pt'
    )

    model.eval()

    with torch.no_grad():

        logits = model(
            input_ids=enc['input_ids'].to(device),
            attention_mask=enc['attention_mask'].to(device)
        ).logits

    probs = torch.softmax(logits, dim=1)

    prob = probs[0][1].item()

    prediction = 1 if prob >= 0.5 else 0

    return prediction, prob

@app.post("/predict")
def predict(email: EmailRequest):
    text = email.subject + " " + email.body

    prediction, prob = predict_email(text)

    return {
        "prediction": int(prediction),
        "probability": float(prob)
    }
    
    
@app.get("/inbox")
def inbox(user_id: int = Depends(get_current_user)):
    db = SessionLocal()

    emails = db.query(Email).filter(
        Email.prediction == 0,
        Email.receiver_id == user_id,
        Email.deleted == False
    ).all()

    db.close()
    return emails

@app.get("/spam")
def spam(user_id: int = Depends(get_current_user)):
    db = SessionLocal()

    emails = db.query(Email).filter(
        Email.prediction == 1,
        Email.receiver_id == user_id,
        Email.deleted == False
    ).all()

    db.close()
    return emails

@app.get("/email/{id}")
def get_email(id: int):
    db = SessionLocal()

    email = db.query(Email).filter(Email.id == id).first()

    if not email:
        db.close()
        raise HTTPException(status_code=404, detail="Email not found")

    sender = db.query(User).filter(User.id == email.sender_id).first()
    receiver = db.query(User).filter(User.id == email.receiver_id).first()

    result = {
        "id": email.id,
        "subject": email.subject,
        "body": email.body,
        "prediction": email.prediction,
        "probability": email.probability,

        "sender_email": sender.email if sender else "Unknown",
        "receiver_email": receiver.email if receiver else "Unknown"
    }

    db.close()
    return result
   
@app.put("/mark-not-spam/{email_id}")
def mark_not_spam(email_id: int):
    db = SessionLocal()

    email = db.query(Email).filter(Email.id == email_id).first()

    if not email:
        return {"error": "Email not found"}

    # changer label
    email.prediction = 0
    email.feedback = 1  # marquer comme corrigé par user

    db.commit()
    db.close()

    return {"message": "Email moved to Inbox"} 
    


@app.post("/send-email")
def send_email(email: EmailSend, user_id: int = Depends(get_current_user)):
    db = SessionLocal()

    receiver = db.query(User).filter(User.email == email.receiver_email).first()
    if not receiver:
        db.close()
        raise HTTPException(status_code=404, detail="Receiver not found")

    receiver_email = receiver.email
    receiver_id = receiver.id

    text = email.subject + " " + email.body
    prediction, prob = predict_email(text)

    new_email = Email(
        subject=email.subject,
        body=email.body,
        sender_id=user_id,
        receiver_id=receiver_id,
        prediction=int(prediction),
        probability=float(prob),
    )

    db.add(new_email)
    db.commit()
    db.close()

    return {
        "message": "Email sent",
        "receiver": receiver_email,  
        "is_spam": int(prediction),
        "probability": float(prob)
    }
    
    
@app.get("/sent")
def sent(user_id: int = Depends(get_current_user)):
    db = SessionLocal()

    emails = db.query(Email).filter(
        Email.sender_id == user_id,
        Email.deleted == False
    ).all()

    db.close()
    return emails

@app.get("/trash")
def trash(user_id: int = Depends(get_current_user)):
    db = SessionLocal()
    emails = db.query(Email).filter(
        Email.deleted == True
    ).filter(
        (Email.receiver_id == user_id) | (Email.sender_id == user_id)
    ).all()
    db.close()
    return emails


@app.put("/email/{email_id}/trash")
def move_to_trash(email_id: int, user_id: int = Depends(get_current_user)):
    db = SessionLocal()
    email = db.query(Email).filter(Email.id == email_id).first()
    if not email:
        db.close()
        raise HTTPException(status_code=404, detail="Email not found")
    email.deleted = True
    db.commit()
    db.close()
    return {"message": "Email moved to trash"}

@app.put("/email/{email_id}/restore")
def restore_email(email_id: int, user_id: int = Depends(get_current_user)):
    db = SessionLocal()
    email = db.query(Email).filter(Email.id == email_id).first()
    if not email:
        db.close()
        raise HTTPException(status_code=404, detail="Email not found")
    email.deleted = False
    db.commit()
    db.close()
    return {"message": "Email restored"}

@app.delete("/email/{email_id}")
def delete_email_permanently(email_id: int, user_id: int = Depends(get_current_user)):
    db = SessionLocal()
    email = db.query(Email).filter(Email.id == email_id).first()
    if not email:
        db.close()
        raise HTTPException(status_code=404, detail="Email not found")
    db.delete(email)
    db.commit()
    db.close()
    return {"message": "Email permanently deleted"}


@app.put("/mark-spam/{email_id}")
def mark_spam(email_id: int, user_id: int = Depends(get_current_user)):
    db = SessionLocal()
    email = db.query(Email).filter(Email.id == email_id).first()
    if not email:
        db.close()
        raise HTTPException(status_code=404, detail="Email not found")
    email.prediction = 1
    email.feedback = 1
    db.commit()
    db.close()
    return {"message": "Email marked as spam"}

@app.get("/email/{id}/keywords")
def get_keywords(id: int):
    db = SessionLocal()
    email = db.query(Email).filter(Email.id == id).first()
    if not email:
        db.close()
        raise HTTPException(status_code=404, detail="Not found")
    
    text = email.subject + " " + email.body
    db.close()

    # Extrait les mots importants via le vectorizer + coefficients
    vectorizer = model.named_steps["tfidfvectorizer"]  # adapte selon ton pipeline
    classifier = model.named_steps["logisticregression"]  # adapte selon ton pipeline
    
    features = vectorizer.transform([text])
    feature_names = vectorizer.get_feature_names_out()
    coefs = classifier.coef_[0]
    
    # Mots présents dans le texte avec leur score
    present = features.toarray()[0]
    scored = [
        {"word": feature_names[i], "score": float(coefs[i]), "present": True}
        for i in range(len(present)) if present[i] > 0
    ]
    
    # Trie par score absolu décroissant, garde top 15
    scored.sort(key=lambda x: abs(x["score"]), reverse=True)
    return scored[:15]


@app.get("/dashboard/stats")
def dashboard_stats(user_id: int = Depends(get_current_user)):
    db = SessionLocal()

    total_received = db.query(Email).filter(
        Email.receiver_id == user_id, Email.deleted == False
    ).count()

    total_spam = db.query(Email).filter(
        Email.receiver_id == user_id, Email.prediction == 1, Email.deleted == False
    ).count()

    total_sent = db.query(Email).filter(
        Email.sender_id == user_id, Email.deleted == False
    ).count()

    total_corrected = db.query(Email).filter(
        Email.receiver_id == user_id, Email.feedback == 1
    ).count()

    avg_prob = db.query(func.avg(Email.probability)).filter(
        Email.receiver_id == user_id, Email.deleted == False
    ).scalar() or 0

    # Distribution par jour (7 derniers jours)
    from datetime import datetime, timedelta
    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    daily = db.query(
        func.date(Email.created_at).label("day"),
        func.sum(func.cast(Email.prediction == 0, Integer)).label("ham"),
        func.sum(func.cast(Email.prediction == 1, Integer)).label("spam"),
    ).filter(
        Email.receiver_id == user_id,
        Email.created_at >= seven_days_ago,
        Email.deleted == False
    ).group_by(func.date(Email.created_at)).all()

    daily_data = [
        {"day": str(row.day), "ham": int(row.ham or 0), "spam": int(row.spam or 0)}
        for row in daily
    ]

    db.close()

    return {
        "total_received": total_received,
        "total_spam": total_spam,
        "total_sent": total_sent,
        "total_corrected": total_corrected,
        "avg_probability": float(avg_prob),
        "spam_rate": (total_spam / total_received * 100) if total_received > 0 else 0,
        "daily": daily_data,
    }


@app.get("/dashboard/top-senders")
def top_senders(user_id: int = Depends(get_current_user)):
    db = SessionLocal()

    results = db.query(
        User.email,
        func.count(Email.id).label("count")
    ).join(Email, Email.sender_id == User.id).filter(
        Email.receiver_id == user_id, Email.deleted == False
    ).group_by(User.email).order_by(func.count(Email.id).desc()).limit(5).all()

    db.close()
    return [{"email": r.email, "count": r.count} for r in results]
Base.metadata.create_all(bind=engine)
