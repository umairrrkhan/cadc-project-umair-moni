import logo from './logo.svg';
import './App.css';

import { BrowserRouter, Routes , Route ,Navigate } from 'react-router-dom'; 

import LandingPage from './pages/LandingPage';
import CreateAccountPage from './pages/createAccountPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';



function App() {
   const token = localStorage.getItem('token');
  return (
    <authprovider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        <Route path="/create-account" element={<CreateAccountPage/>} />
        <Route path="/home" element={token ? <HomePage/> : <Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
    </authprovider>
  );
}

export default App;
