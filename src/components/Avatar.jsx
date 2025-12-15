import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Avatar = ({ src, name, size = '40px', style = {}, userId }) => {
    const [error, setError] = useState(false);

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const baseStyle = {
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',
        flexShrink: 0,
        ...style,
    };

    const content = (
        <div
            style={{
                ...baseStyle,
                backgroundColor: 'var(--accent-color)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: `calc(${size} * 0.4)`,
                fontWeight: '600',
                textTransform: 'uppercase',
                border: '1px solid rgba(255,255,255,0.1)',
            }}
        >
            {getInitials(name)}
        </div>
    );

    const imgContent = src && !error ? (
        <img
            src={src}
            alt={name}
            style={baseStyle}
            onError={() => setError(true)}
        />
    ) : content;

    if (userId) {
        return (
            <Link to={`/users/${userId}`} style={{ textDecoration: 'none', display: 'block' }}>
                {imgContent}
            </Link>
        );
    }

    return imgContent;
};

export default Avatar;
