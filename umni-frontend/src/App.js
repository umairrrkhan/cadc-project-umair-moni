import logo from './logo.svg';
import './App.css';

import { BrowserRouter, Routes , Route ,Navigate } from 'react-router-dom'; 

import LandingPage from './pages/LandingPage';



function App() {
  return (
    <authprovider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage/>} />
      

      </Routes>
    </BrowserRouter>
    </authprovider>
  );
}

export default App;
