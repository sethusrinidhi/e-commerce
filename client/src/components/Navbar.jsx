import React from 'react';

const Navbar = ({ user, setPage, setUser }) => {
    const handleLogout = () => {
        setUser(null);
        setPage('login');
    };

    return (
        <nav style={navStyle}>
            {/* BRAND LOGO / BRANDING ENGINE */}
            <h1 style={logoStyle} onClick={() => setPage('shop')}>
                SHOP<span style={{ color: 'var(--accent)' }}>SC</span>
            </h1>

            {/* ACTION TRIGGERS MATRIX */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {user ? (
                    <>
                        <span style={welcomeTextStyle}>
                            Welcome, <strong style={{ color: 'var(--text-h)' }}>{user.username}</strong> 
                            <span style={badgeStyle}>{user.usertype}</span>
                        </span>
                        
                        <button onClick={() => setPage('shop')} style={btnStyle}>
                            🛍️ Shop
                        </button>
                        
                        {user.usertype === 'admin' && (
                            <button onClick={() => setPage('admin')} style={{ ...btnStyle, background: 'var(--text-h)', color: 'var(--bg)' }}>
                                🛡️ Admin
                            </button>
                        )}
                        
                        <button onClick={handleLogout} style={logoutBtnStyle}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setPage('login')} style={loginBtnStyle}>
                            Login
                        </button>
                        <button onClick={() => setPage('register')} style={btnStyle}>
                            Register
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

/* ==========================================================================
   ADVANCED PREMIUM UI STYLE TOKENS
   ========================================================================== */

const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '16px 40px',
    background: 'var(--bg)',
    borderBottom: '1px solid var(--border)',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(8px)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
};

const logoStyle = {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
    color: 'var(--text-h)',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'transform 0.2s ease'
};

const welcomeTextStyle = {
    fontSize: '15px',
    color: 'var(--text)',
    marginRight: '8px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
};

const badgeStyle = {
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    background: 'var(--code-bg)',
    color: 'var(--text)',
    padding: '2px 8px',
    borderRadius: '12px',
    border: '1px solid var(--border)'
};

const btnStyle = {
    padding: '10px 20px',
    background: 'var(--accent)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 2px 4px rgba(170, 59, 255, 0.15)',
    transition: 'opacity 0.2s ease, transform 0.1s ease'
};

const loginBtnStyle = {
    ...btnStyle,
    background: 'transparent',
    color: 'var(--text-h)',
    border: '1px solid var(--border)',
    boxShadow: 'none'
};

const logoutBtnStyle = {
    ...btnStyle,
    background: 'rgba(217, 83, 79, 0.1)',
    color: '#d9534f',
    boxShadow: 'none',
    border: '1px solid rgba(217, 83, 79, 0.2)'
};

export default Navbar;