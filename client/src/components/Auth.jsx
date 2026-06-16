import React, { useState } from 'react';
import axios from 'axios';

const Auth = ({ type, setPage, setUser }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        const url = type === 'register' ? 'http://localhost:8000/api/register' : 'http://localhost:8000/api/login';
        const payload = type === 'register' ? { username, email, password } : { email, password };

        try {
            const res = await axios.post(url, payload);
            setMessage(res.data.message);
            
            if (type === 'login' && res.data.user) {
                // FIXED: Now correctly passes both user data and JWT token up to App.jsx
                setUser(res.data.user, res.data.token);
                setPage('shop');
            } else if (type === 'register') {
                setTimeout(() => setPage('login'), 1500);
            }
        } catch (err) {
            setMessage(err.response?.data?.message || err.response?.data?.error || "Something went wrong!");
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'sans-serif' }}>
            <h2>{type === 'register' ? 'Create an Account' : 'Login to ShopEZ'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {type === 'register' && (
                    <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required style={inputStyle} />
                )}
                <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
                
                {type === 'login' && (
                    <p style={{ textAlign: 'right', margin: '0', fontSize: '13px' }}>
                        <span style={{ color: '#d9534f', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setPage('forgot')}>
                            Forgot Password?
                        </span>
                    </p>
                )}
                
                <button type="submit" style={submitBtnStyle}>{type === 'register' ? 'Register' : 'Login'}</button>
            </form>
            
            {message && <p style={{ marginTop: '15px', color: message.includes('Successful') || message.includes('successfully') ? 'green' : 'red' }}>{message}</p>}
            
            <p style={{ marginTop: '15px', fontSize: '14px' }}>
                {type === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
                <span style={{ color: '#0275d8', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setPage(type === 'register' ? 'login' : 'register')}>
                    {type === 'register' ? 'Login here' : 'Register here'}
                </span>
            </p>
        </div>
    );
};

const inputStyle = { padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' };
const submitBtnStyle = { padding: '10px', fontSize: '16px', background: '#0275d8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

export default Auth;