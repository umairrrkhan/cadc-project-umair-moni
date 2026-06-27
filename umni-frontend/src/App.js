import './App.css';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import CreateAccountPage from './pages/createAccountPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import UserProfilePage from './pages/userProfilePage';
import LibraryPage from './pages/LibraryPage';

function App() {
    const token = localStorage.getItem('token');
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage/>} />
                <Route path="/create-account" element={<CreateAccountPage/>} />
                <Route path="/home/:chatId" element={token ? <HomePage/> : <Navigate to="/login" />} />
                <Route path="/home" element={token ? <HomePage/> : <Navigate to="/login" />} />
                <Route path="/profile" element={token ? <UserProfilePage/> : <Navigate to="/login" />} />
                <Route path="/chat/:chatId" element={token ? <HomePage/> : <Navigate to="/login" />} />
                <Route path="/login" element={<LoginPage/>} />
                <Route path="*" element={<Navigate to="/login" />} />
                <Route path="/library" element={token ? <LibraryPage/> : <Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
