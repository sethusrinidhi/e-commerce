import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import Shop from './components/Shop';
import Admin from './components/Admin';
import Cart from './components/Cart';       
import Checkout from './components/Checkout'; 
import ForgotPassword from './components/ForgotPassword';

function App() {
    const [page, setPage] = useState('shop'); 
    const [user, setUser] = useState(null);   
    const [token, setToken] = useState('');   

    // Takes the fresh data and token sent back by Auth.jsx
    const handleLoginSuccess = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#fdfdfd' }}>
            <Navbar user={user} setPage={setPage} setUser={setUser} />
            
            <div style={{ textAlign: 'center', margin: '10px' }}>
                {user && (
                    <button 
                        onClick={() => setPage('cart')} 
                        style={{ padding: '8px 16px', background: '#0275d8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        🛒 Go To My Cart
                    </button>
                )}
            </div>
            
            {/* FIXED: Passed setPage to the Shop component to handle the instant Buy Now redirect */}
            {page === 'shop' && <Shop user={user} setPage={setPage} />}
            
            {page === 'login' && (
                <Auth 
                    type="login" 
                    setPage={setPage} 
                    setUser={(userData, userToken) => handleLoginSuccess(userData, userToken)} 
                />
            )}
            
            {page === 'register' && <Auth type="register" setPage={setPage} setUser={null} />}
            {page === 'admin' && <Admin />}
            {page === 'cart' && <Cart user={user} token={token} setPage={setPage} />}
            {page === 'checkout' && <Checkout user={user} setPage={setPage} />}
            {page === 'forgot' && <ForgotPassword setPage={setPage} />} 
        </div>
    );
}

export default App;