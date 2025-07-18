 
// =================================================================================
// FILE: src/components/ui/MenuPanel.jsx (NEW)
// DESCRIPTION: The new right-side panel for in-game actions.
// =================================================================================
import React from 'react';

const MenuPanel = ({ isOpen, onClose, onGoToLobby, onOpenOptions, onQuitGame }) => {
    const menuItems = [
        { label: 'Go to Lobby', action: onGoToLobby, icon: 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1' },
        { label: 'Options', action: onOpenOptions, icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
        { label: 'Quit Game', action: onQuitGame, icon: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1', isDanger: true },
    ];

    return (
        <>
            {/* Backdrop for mobile */}
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/60 z-30 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            />
            {/* The Panel Itself */}
            <div
                className={`fixed top-0 right-0 h-full w-64 bg-gray-800 border-l border-purple-800 shadow-2xl z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'transform-none' : 'translate-x-full'}`}
            >
                <div className="flex flex-col h-full p-4">
                    <div className="flex items-center justify-between pb-4 border-b border-purple-700">
                        <h2 className="text-xl font-bold text-yellow-300">Menu</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-2xl font-bold">×</button>
                    </div>

                    <nav className="flex-grow mt-4">
                        <ul className="space-y-2">
                            {menuItems.map(({ label, action, icon, isDanger }) => (
                                <li key={label}>
                                    <button
                                        onClick={action}
                                        className={`w-full flex items-center gap-3 p-3 rounded-md font-semibold transition-colors ${
                                            isDanger
                                            ? 'text-red-300 hover:bg-red-900/50'
                                            : 'text-gray-200 hover:bg-gray-700'
                                        }`}
                                    >
                                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}></path>
                                        </svg>
                                        <span>{label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </div>
        </>
    );
};

export default MenuPanel;
