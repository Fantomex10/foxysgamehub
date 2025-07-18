// =================================================================================
// FILE: src/components/ui/Header.jsx
// DESCRIPTION: Cleaned-up header with Profile icon on left, Menu icon on right.
// =================================================================================
import React, { useState, useRef, useEffect } from 'react';
import myProfilePic from '../../assets/foxyfcg_small.png';

const Header = ({ isInGame, gameData, onProfileClick, onMenuClick }) => {
    const [isInfoDropdownOpen, setIsInfoDropdownOpen] = useState(false);
    const infoDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (infoDropdownRef.current && !infoDropdownRef.current.contains(event.target)) {
                setIsInfoDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCopyCode = () => {
        if(gameData?.joinCode) {
            navigator.clipboard.writeText(gameData.joinCode);
            setIsInfoDropdownOpen(false); // Close dropdown after copying
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-gray-900/80 backdrop-blur-sm border-b border-purple-800 flex items-center justify-between px-4 z-20">
            {/* Left side: Profile Button */}
            <div>
                <button onClick={onProfileClick} className="rounded-full h-10 w-10 overflow-hidden hover:ring-2 ring-yellow-400 transition-all">
                    <img src={myProfilePic} alt="Profile" className="h-full w-full object-cover" />
                </button>
            </div>

            {/* Center: Game Info Dropdown */}
            <div className="absolute left-1/2 -translate-x-1/2" ref={infoDropdownRef}>
                {isInGame && gameData && (
                    <>
                        <button onClick={() => setIsInfoDropdownOpen(prev => !prev)} className="bg-gray-700/50 hover:bg-gray-700 text-gray-200 font-bold py-1.5 px-4 rounded-lg text-sm border border-transparent hover:border-purple-500 transition-all">
                            {gameData.gameName || 'Game Info'}
                        </button>
                        {isInfoDropdownOpen && (
                            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 bg-gray-700 border border-purple-600 rounded-lg shadow-xl p-3 text-center">
                                <p className="text-gray-200 text-sm font-bold mb-1 truncate">{gameData.gameName}</p>
                                <p className="text-gray-400 text-xs mb-2">{gameData.gameType || 'Classic'}</p>
                                <div className="pt-1">
                                    <p className="text-gray-300 text-xs">Join Code:</p>
                                    <button onClick={handleCopyCode} className="w-full font-mono mt-1 opacity-90 bg-black/20 px-1.5 py-0.5 rounded text-yellow-300 text-base hover:bg-black/50 transition-colors">
                                        {gameData.joinCode}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Right side: Menu Button */}
            <div className="flex items-center gap-3">
                {isInGame && (
                    <button onClick={onMenuClick} className="text-gray-300 hover:text-yellow-300 transition-colors p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
