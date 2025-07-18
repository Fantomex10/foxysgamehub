// =================================================================================
// FILE: src/components/SplashScreen.jsx
// =================================================================================
import React from 'react';
import splashPoster from '../assets/foxyfcg.jpg'; // Assuming this path is correct for your image

const SplashScreen = () => (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center z-50 overflow-hidden">
        <img
            src={splashPoster} // Use the imported image variable
            alt="Welcome"
            className="max-w-full max-h-full object-contain" // Ensures image is contained within bounds, preventing scroll
        />
    </div>
);

export default SplashScreen;
