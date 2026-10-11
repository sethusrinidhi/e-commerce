import React from 'react';
import './Navbar.css';

const Navbar = ({ user, setPage, setUser }) => {
    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('token');
        setPage('login');
    };

    return (
        <nav className="navbar-container">
            {/* BRAND LOGO / BRANDING ENGINE */}
            <h1 className="navbar-logo" onClick={() => setPage('shop')}>
                SHOP<span>SC</span>
            </h1>

            {/* ACTION TRIGGERS MATRIX */}
            <div className="navbar-actions">
                {user ? (
                    <>
                        <span className="navbar-welcome">
                            Welcome, <strong className="navbar-username">{user.username}</strong> 
                            <span className="navbar-badge">{user.usertype}</span>
                        </span>

                        {/* Standard Cart Option - Simplified layout condition */}
                        {user.usertype !== 'admin' && (
                            <>
                                <button onClick={() => setPage('cart')} className="navbar-btn navbar-btn-accent">
                                    🛒 Cart
                                </button>
                                
                                <button onClick={() => setPage('orders')} className="navbar-btn navbar-btn-outline">
                                    📦 My Orders
                                </button>
                            </>
                        )}
                        
                        {user.usertype === 'admin' && (
                            <button onClick={() => setPage('admin')} className="navbar-btn navbar-btn-admin">
                                🛡️ Admin
                            </button>
                        )}
                        
                        <button onClick={handleLogout} className="navbar-btn navbar-btn-logout">
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setPage('login')} className="navbar-btn navbar-btn-outline">
                            Login
                        </button>

                        <button onClick={() => setPage('register')} className="navbar-btn navbar-btn-accent">
                            Register
                        </button>

                        <span 
                            onClick={() => setPage('admin-login')} 
                            className="navbar-admin-link"
                        >
                            Staff Portal
                        </span>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;