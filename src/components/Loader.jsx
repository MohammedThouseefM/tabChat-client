import React from 'react';
import reactLogo from '../assets/react.svg';

const Loader = ({ fullScreen = true }) => {
    return (
        <div className={`loader-container ${fullScreen ? 'fixed' : 'block'}`}>
            <div className="loader-content">
                {/* Use specific logo if available, falling back to React logo */}
                <img src="/logo.png" alt="Loading..." className="loader-logo"
                    onError={(e) => { e.target.onerror = null; e.target.src = reactLogo; }}
                />
            </div>
        </div>
    );
};

export default Loader;
