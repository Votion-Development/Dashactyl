import React from 'react';

const Alert = ({ message }) => {
    return (
        <div role="alert" style={{ display: message ? 'block' : 'none' }}>
            <div className="border border-red-400 rounded-b rounded-t bg-red-100 px-4 py-3 text-red-700">
                <p>{message}</p>
            </div>
        </div>
    )
};

export default Alert;