import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Inbox from "./pages/Inbox";
import Sent from "./pages/Sent";
import Spam from "./pages/Spam";
import Compose from "./pages/Compose";
import EmailDetail from "./pages/EmailDetail";
import Profile from "./pages/Profile";
import Trash from "./pages/Trash";
import Dashboard from "./pages/Dashboard";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/sent" element={<Sent />} />
        <Route path="/spam" element={<Spam />} />
        <Route path="/send-email" element={<Compose />} />
        <Route path="/email/:id" element={<EmailDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/trash" element={<Trash />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}