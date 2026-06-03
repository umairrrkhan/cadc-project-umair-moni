import {motion} from 'framer-motion';
import {Link} from 'react-router-dom';  

const LandingPage = () => {
  return (
    <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white"
    >
        <h1 className="text-5xl font-bold mb-6">Ask UmNi</h1>
        <p className="text-xl mb-8 text-center max-w-lg">Your AI-powered assistant for all your questions. Get instant answers and insights with UmNi.</p>
        <Link to="/chat" className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition duration-300">Get Started</Link>
        
        <Link to="/login">
        
         <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition duration-300 mt-4">Login</button>
        
        </Link>

      
    </motion.div>

  );
};

export default LandingPage;