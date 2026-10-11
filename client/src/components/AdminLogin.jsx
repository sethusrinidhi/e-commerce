import React, { useState } from 'react';
import axios from 'axios';

export default function AdminLogin({ onLoginSuccess, setPage }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            console.log("Attempting Admin login for:", email);
            const res = await axios.post('http://localhost:5000/api/login', { email, password });
            
            console.log("Backend response received:", res.data);

            // 🔍 Safety check: Double check your backend payload structure!
            // If your backend structure looks like { token, usertype } instead of { user: { usertype } }, adjust here.
            const user = res.data.user || res.data; 
            
            if (user?.usertype === 'admin') {
                onLoginSuccess(user, res.data.token);
                setPage('admin'); 
            } else {
                setError('Access Denied: This account does not have admin clearance.');
            }
        } catch (err) {
            // 🔥 Print the exact error into the browser inspector console
            console.error("Login Form Error Catch:", err);
            console.error("Server Response Data:", err.response?.data);

            setError(err.response?.data?.message || 'Invalid credentials or connection error.');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
            <form onSubmit={handleSubmit} style={{ background: '#1e293b', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', color: '#fff', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ textAlign: 'center', margin: '0 0 10px 0', color: '#e11d48' }}>🛡️ Admin Gateway</h2>
                <p style={{ textAlign: 'center', color: '#aaa', fontSize: '14px', marginTop: '-10px' }}>Authorized Staff Operations Only</p>
                
                {error && <div style={{ background: 'rgba(225, 29, 72, 0.1)', color: '#e11d48', padding: '10px', borderRadius: '6px', fontSize: '14px', border: '1px solid rgba(225, 29, 72, 0.2)' }}>{error}</div>}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500' }}>Admin Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#111c24', color: '#fff' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500' }}>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#111c24', color: '#fff' }} />
                </div>

                <button type="submit" style={{ padding: '12px', background: '#e11d48', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                    Verify & Authenticate
                </button>

                <button type="button" onClick={() => setPage('shop')} style={{ background: 'transparent', color: '#aaa', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
                    Return to Public Shop
                </button>
            </form>
        </div>
    );
}