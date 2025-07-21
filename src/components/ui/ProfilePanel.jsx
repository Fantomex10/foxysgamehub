// =================================================================================
// FILE: src/components/ui/ProfilePanel.jsx
// DESCRIPTION: The left-side panel for user profile info.
// =================================================================================
import React from 'react';
import myProfilePic from '../../assets/foxyfcg_small.png';
const ProfilePanel = ({ isOpen, onClose }) => {
    return (
        <>
            {/* Backdrop for mobile */}
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/60 z-30 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            />
            {/* The Panel Itself */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-gray-800 border-r border-purple-800 shadow-2xl z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'transform-none' : '-translate-x-full'}`}
            >
                <div className="flex flex-col h-full p-4">
                    <div className="flex items-center justify-between pb-4 border-b border-purple-700">
                        <div className="flex items-center gap-3">
                            <img src={myProfilePic} alt="Your Profile Logo" className="h-12 w-12 rounded-full" />
                            <h2 className="text-xl font-bold text-yellow-300">Profile</h2>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-3xl font-bold">&times;</button>
                    </div>

                    <nav className="flex-grow mt-4">
                        <ul>
                            <li className="text-gray-300 hover:bg-gray-700 rounded-md p-2 cursor-pointer transition-colors">Stats (soon)</li>
                            <li className="text-gray-300 hover:bg-gray-700 rounded-md p-2 cursor-pointer transition-colors">Friends (soon)</li>
                            <li className="text-gray-300 hover:bg-gray-700 rounded-md p-2 cursor-pointer transition-colors">Settings (soon)</li>
                        </ul>
                    </nav>

                    <div className="mt-auto">
                        <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50" disabled>
                            Logout (soon)
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfilePanel;