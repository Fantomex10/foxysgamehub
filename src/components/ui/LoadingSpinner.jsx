// =================================================================================
// FILE: src/components/ui/LoadingSpinner.jsx
// =================================================================================
import React from 'react';

const LoadingSpinner = ({ message = "Loading..." }) => (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-yellow-400"></div>
        {message && <p className="text-lg font-semibold text-white">{message}</p>}
    </div>
);

export default LoadingSpinner;
