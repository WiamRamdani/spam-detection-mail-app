from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str


class EmailRequest(BaseModel):
    subject: str
    body: str
    
class UserUpdate(BaseModel):
    full_name: str | None = None
    avatar: str | None = None  # base64
    
class EmailSend(BaseModel):
    subject: str
    body: str
    sender_id: int
    receiver_email: str