import React, { useState } from 'react';
import axios from 'axios';

const Auth = ({ type, setPage, setUser }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);
        
        const url = type === 'register' ? 'http://localhost:8000/api/register' : 'http://localhost:8000/api/login';
        const payload = type === 'register' ? { username, email, password } : { email, password };

        try {
            const res = await axios.post(url, payload);
            setMessage(res.data.message || "Successful!");
            
            if (type === 'login' && res.data.user) {
                // Passes both user payload data and secure verification token up to App.jsx
                setUser(res.data.user, res.data.token);
                setPage('shop');
            } else if (type === 'register') {
                setTimeout(() => setPage('login'), 1500);
            }
        } catch (err) {
            setMessage(err.response?.data?.message || err.response?.data?.error || "Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    // Dynamic configuration engine for our cute lovable interface theme mapping
    const isRegister = type === 'register';
    const dynamicEmoji = isRegister ? '✨👋💖' : '🔒✨🔑';
    const isSuccessMessage = message.includes('Successful') || message.includes('successfully') || message.includes('created');

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                
                {/* LOVABLE REACTION BADGE */}
                <div style={emojiFrameStyle}>
                    <span style={emojiStyle}>{dynamicEmoji}</span>
                </div>

                {/* COLORFUL BRAND ACCENT HEADER */}
                <h2 style={gradientTitleStyle}>
                    {isRegister ? 'Create an Account' : 'Login to SHOP SC'}
                </h2>
                <p style={subtitleStyle}>
                    {isRegister ? 'Join us today to unlock premium luxury pieces!' : 'Welcome back, beautiful soul! Let’s get you inside.'}
                </p>

                <form onSubmit={handleSubmit} style={formStyle}>
                    {isRegister && (
                        <div style={inputContainerStyle}>
                            <label style={labelStyle}>Username</label>
                            <input 
                                type="text" 
                                placeholder="Your lovely name" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                required 
                                style={inputStyle} 
                            />
                        </div>
                    )}

                    <div style={inputContainerStyle}>
                        <label style={labelStyle}>Email Address</label>
                        <input 
                            type="email" 
                            placeholder="name@domain.com" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            style={inputStyle} 
                        />
                    </div>

                    <div style={inputContainerStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={labelStyle}>Password</label>
                            {!isRegister && (
                                <span style={forgotLinkStyle} onClick={() => setPage('forgot')}>
                                    Forgot Password?
                                </span>
                            )}
                        </div>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            style={inputStyle} 
                        />
                    </div>

                    <button type="submit" disabled={loading} style={submitButtonStyle}>
                        {loading ? 'Processing... ✨' : isRegister ? 'Create Account 🌸' : 'Sign In Safely 🚀'}
                    </button>
                </form>

                {/* DYNAMIC NOTIFICATION TOAST BOX */}
                {message && (
                    <div style={{
                        ...messageBoxStyle,
                        color: isSuccessMessage ? '#2e7d32' : '#d32f2f',
                        background: isSuccessMessage ? 'rgba(46, 125, 50, 0.1)' : 'rgba(211, 47, 47, 0.1)',
                        borderColor: isSuccessMessage ? 'rgba(46, 125, 50, 0.2)' : 'rgba(211, 47, 47, 0.2)'
                    }}>
                        {isSuccessMessage ? '🎉 ' : '⚠️ '}{message}
                    </div>
                )}

                {/* FOOTER SWITCHER LINK */}
                <div style={toggleBoxStyle}>
                    <p style={toggleTextStyle}>
                        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <span style={toggleLinkStyle} onClick={() => setPage(isRegister ? 'login' : 'register')}>
                            {isRegister ? 'Login here' : 'Register free'}
                        </span>
                    </p>
                </div>

            </div>
        </div>
    );
};

/* ==========================================================================
   PREMIUM SYSTEM UI INTERFACE STYLING
   ========================================================================== */

const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    padding: '60px 20px',
    background: 'var(--bg)'
};

const cardStyle = {
    width: '100%',
    maxWidth: '440px',
    padding: '40px',
    borderRadius: '20px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow)',
    textAlign: 'center',
    position: 'relative'
};

const emojiFrameStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'var(--code-bg)',
    border: '1px solid var(--border)',
    marginBottom: '20px'
};

const emojiStyle = {
    fontSize: '32px',
    lineHeight: '1'
};

const gradientTitleStyle = {
    fontSize: '28px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    margin: '0 0 8px 0',
    background: 'linear-gradient(135deg, #aa3bff 0%, #0275d8 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block'
};

const subtitleStyle = {
    fontSize: '14px',
    color: 'var(--text)',
    margin: '0 0 32px 0',
    lineHeight: '1.5'
};

const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    textAlign: 'left'
};

const inputContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
};

const labelStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-h)'
};

const inputStyle = {
    padding: '12px 14px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text-h)',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s'
};

const forgotLinkStyle = {
    fontSize: '13px',
    color: 'var(--accent)',
    cursor: 'pointer',
    fontWeight: '500',
    textDecoration: 'none'
};

const submitButtonStyle = {
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '8px',
    boxShadow: '0 4px 12px rgba(170, 59, 255, 0.25)',
    transition: 'opacity 0.2s, transform 0.1s'
};

const messageBoxStyle = {
    marginTop: '20px',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    border: '1px solid',
    textAlign: 'left',
    lineHeight: '1.4'
};

const toggleBoxStyle = {
    marginTop: '32px',
    paddingTop: '20px',
    borderTop: '1px solid var(--border)'
};

const toggleTextStyle = {
    margin: 0,
    fontSize: '14px',
    color: 'var(--text)'
};

const toggleLinkStyle = {
    color: 'var(--accent)',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none'
};

export default Auth;