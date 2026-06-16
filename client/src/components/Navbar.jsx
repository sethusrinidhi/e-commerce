import React from 'react';

const Navbar = ({ user, setPage, setUser }) => {
    const handleLogout = () => {
        setUser(null);
        setPage('login');
    };

    return (
        <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 30px', background: '#333', color: '#fff', alignItems: 'center' }}>
            <h2 style={{ margin: 0, cursor: 'pointer' }} onClick={() => setPage('shop')}>ShopEZ</h2>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                {user ? (
                    <>
                        <span>Welcome, <strong>{user.username}</strong> ({user.usertype})</span>
                        <button onClick={() => setPage('shop')} style={btnStyle}>Shop</button>
                        {user.usertype === 'admin' && (
                            <button onClick={() => setPage('admin')} style={btnStyle}>Admin Panel</button>
                        )}
                        <button onClick={handleLogout} style={{ ...btnStyle, background: '#d9534f' }}>Logout</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setPage('login')} style={btnStyle}>Login</button>
                        <button onClick={() => setPage('register')} style={btnStyle}>Register</button>
                    </>
                )}
            </div>
        </nav>
    );
};

const btnStyle = {
    padding: '8px 15px',
    background: '#5cb85c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
};

export default Navbar;