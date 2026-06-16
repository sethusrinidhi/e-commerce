import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = ({ setPage }) => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1); // Step 1: Input Email, Step 2: Verify OTP & Change Pass
    const [message, setMessage] = useState('');

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const res = await axios.post('http://localhost:8000/api/forgot-password', { email });
            setMessage(res.data.message);
            setStep(2); // Advance user interface to verification card form
        } catch (err) {
            setMessage(err.response?.data?.message || "Error processing request.");
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const res = await axios.post('http://localhost:8000/api/reset-password', { email, otp, newPassword });
            setMessage(res.data.message);
            setTimeout(() => setPage('login'), 2000); // Redirect back to login screen on success
        } catch (err) {
            setMessage(err.response?.data?.message || "Failed to update security credentials.");
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'sans-serif' }}>
            <h2>Account Recovery</h2>
            {message && <p style={{ color: message.includes('success') || message.includes('updated') ? 'green' : 'red', fontWeight: 'bold' }}>{message}</p>}

            {step === 1 ? (
                <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                    <p style={{ fontSize: '14px', color: '#666' }}>Enter your account email below. We'll send you a 6-digit secure token passcode.</p>
                    <input type="email" placeholder="Enter Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
                    <button type="submit" style={btnStyle}>Send Recovery Token</button>
                </form>
            ) : (
                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                    <input type="text" placeholder="Enter 6-Digit OTP Token" value={otp} onChange={(e) => setOtp(e.target.value)} required style={inputStyle} />
                    <input type="password" placeholder="Enter New Secure Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required style={inputStyle} />
                    <button type="submit" style={{ ...btnStyle, background: '#5cb85c' }}>Update Password</button>
                </form>
            )}
            <p style={{ marginTop: '20px', fontSize: '14px', textAlign: 'center' }}>
                <span style={{ color: '#0275d8', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setPage('login')}>Back to Login</span>
            </p>
        </div>
    );
};

const inputStyle = { padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' };
const btnStyle = { padding: '10px', fontSize: '16px', background: '#0275d8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };

export default ForgotPassword;