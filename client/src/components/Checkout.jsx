import React, { useState } from 'react';
import axios from 'axios';

const Checkout = ({ user, setPage }) => {
    const [address, setAddress] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:8000/api/orders/checkout', {
                userId: user.id,
                shippingAddress: address,
                paymentDetails: { cardNumber } 
            });
            
            // Localized payment success alert
            alert("Payment Authorized! Order placed safely via Indian Gateway Escrow.");
            setPage('shop');
        } catch (err) {
            alert("Payment declined or error processing transaction. Please verify card details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '40px auto', padding: '30px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'sans-serif' }}>
            <h3>🔒 Secure Checkout (Rupee Gateway)</h3>
            <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                
                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Delivery Address</label>
                <input 
                    type="text" 
                    placeholder="Flat No, Street, City, State - Pincode" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    required 
                    style={inputStyle} 
                />
                
                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Card Number</label>
                <input 
                    type="text" 
                    placeholder="4111 2222 3333 4444" 
                    maxLength="16" 
                    value={cardNumber} 
                    onChange={(e) => setCardNumber(e.target.value)} 
                    required 
                    style={inputStyle} 
                />
                
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ width: '50%' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Expiry Date</label>
                        <input type="text" placeholder="MM/YY" required style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ width: '50%' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>CVV</label>
                        <input type="password" placeholder="***" maxLength="3" required style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading} 
                    style={{ padding: '12px', background: '#5cb85c', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
                >
                    {loading ? "Authorizing Secure Escrow..." : "Pay Now Safely"}
                </button>
            </form>
        </div>
    );
};

const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '15px' };

export default Checkout;