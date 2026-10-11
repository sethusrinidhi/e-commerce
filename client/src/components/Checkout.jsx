import React, { useState } from 'react';
import axios from 'axios';

const Checkout = ({ setPage }) => {
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery'); // Default selection
    const [cardNumber, setCardNumber] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // 1. Fetch the user's secret authorization token saved at login
        const token = localStorage.getItem('token');

        if (!token) {
            alert("Session missing! Please log in to your account again to complete checkout.");
            setLoading(false);
            return;
        }

        try {
            // 2. ✅ FIXED URL: Added /shop prefix -> /api/shop/orders/checkout
            const res = await axios.post(
                'http://localhost:8000/api/shop/orders/checkout', 
                {
                    shippingAddress: address,
                    paymentMethod: paymentMethod // Passes "Cash on Delivery", "PhonePe", or "Card"
                },
                {
                    headers: {
                        // 🔒 Links this order directly to whoever is currently logged in via your verifyUser middleware
                        'Authorization': `Bearer ${token}` 
                    }
                }
            );

            alert(res.data.message || "Order placed safely! 🎉");
            
            // Redirect them to their profile orders tab
            setPage('my-orders'); 
        } catch (err) {
            // Read the exact error details sent from our node server validation guards
            const errorMsg = err.response?.data?.message || "Error processing your request.";
            alert(`Checkout Interrupted: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '40px auto', padding: '30px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'sans-serif', backgroundColor: '#fff' }}>
            <h3>🔒 Secure Checkout</h3>
            <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                
                {/* --- SHIPPING DETAILS --- */}
                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Shipping Delivery Address</label>
                <input 
                    type="text" 
                    placeholder="Flat No, House/Street Details, City, Pincode" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    required 
                    style={inputStyle} 
                />
                
                {/* --- PAYMENT METHOD SELECTOR --- */}
                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Select Payment Option</label>
                <select 
                    value={paymentMethod} 
                    onChange={(e) => setPaymentMethod(e.target.value)} 
                    style={inputStyle}
                >
                    <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                    <option value="PhonePe">PhonePe / UPI Gateway</option>
                    <option value="Card">Credit or Debit Card</option>
                </select>

                {/* --- CONDITIONAL FIELD RENDER: Show Card Details only if "Card" is selected --- */}
                {paymentMethod === 'Card' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', border: '1px dashed #bbb', padding: '15px', borderRadius: '4px', backgroundColor: '#fafafa' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>Card Number</label>
                            <input 
                                type="text" 
                                placeholder="4111 2222 3333 4444" 
                                maxLength="16" 
                                value={cardNumber} 
                                onChange={(e) => setCardNumber(e.target.value)} 
                                required={paymentMethod === 'Card'}
                                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} 
                            />
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ width: '50%' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px' }}>Expiry Date</label>
                                <input type="text" placeholder="MM/YY" required={paymentMethod === 'Card'} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ width: '50%' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px' }}>CVV</label>
                                <input type="password" placeholder="***" maxLength="3" required={paymentMethod === 'Card'} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* --- ORDER DEPLOYMENT TRIGGER BUTTON --- */}
                <button 
                    type="submit" 
                    disabled={loading} 
                    style={{ padding: '12px', background: '#5cb85c', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
                >
                    {loading ? "Processing Order Flow..." : paymentMethod === 'Cash on Delivery' ? "Confirm Order (COD)" : "Authorize Secure Payment"}
                </button>
            </form>
        </div>
    );
};

const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '15px' };

export default Checkout;