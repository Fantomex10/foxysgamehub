// =================================================================================
// FILE: src/context/ModalProvider.jsx
// =================================================================================
import React, { createContext, useState, useContext, useCallback } from 'react';

const ModalContext = createContext(null);

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
    const [modalState, setModalState] = useState({ isOpen: false });

    const showConfirm = useCallback(({ title, message, onConfirm, onCancel }) => {
        setModalState({
            isOpen: true,
            title,
            message,
            onConfirm: () => {
                onConfirm();
                setModalState({ isOpen: false });
            },
            onCancel: () => {
                if (onCancel) onCancel();
                setModalState({ isOpen: false });
            },
        });
    }, []);

    const value = {
        ...modalState,
        showConfirm,
        closeModal: () => setModalState({ isOpen: false }),
    };

    return (
        <ModalContext.Provider value={value}>
            {children}
        </ModalContext.Provider>
    );
};
