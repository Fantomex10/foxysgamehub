// =================================================================================
// FILE: src/components/ui/ConfirmDialog.jsx
// =================================================================================
import React from 'react';
import { useModal } from '../../context/ModalProvider';

const ConfirmDialog = () => {
    const { isOpen, title, message, onConfirm, onCancel, closeModal } = useModal();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-sm border-2 border-purple-700 text-white">
                <h2 className="text-xl font-bold text-yellow-300 mb-4">{title || 'Confirm'}</h2>
                <p className="text-gray-300 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel || closeModal}
                        className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
