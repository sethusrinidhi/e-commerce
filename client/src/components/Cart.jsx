import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Cart = ({ user, token, setPage }) => {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const activeToken = token || localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8000/api/shop/cart/${user?.id || user?._id}`, {
                headers: { 'Authorization': `Bearer ${activeToken}` }
            });
            const items = res.data?.items || res.data || [];
            setCartItems(items);
            calculateTotal(items);
        } catch (err) {
            console.error("Error fetching cart", err);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = (items) => {
        const sum = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        setTotal(sum);
    };

    const handleRemoveItem = async (itemId) => {
        const updatedCart = cartItems.filter(item => item._id !== itemId);
        setCartItems(updatedCart);
        calculateTotal(updatedCart);

        try {
            const activeToken = token || localStorage.getItem('token');
            await axios.delete(`http://localhost:8000/api/shop/cart/remove/${itemId}`, {
                headers: { 'Authorization': `Bearer ${activeToken}` }
            });
        } catch (err) {
            try {
                const activeToken = token || localStorage.getItem('token');
                await axios.delete(`http://localhost:8000/api/shop/cart/${itemId}`, {
                    headers: { 'Authorization': `Bearer ${activeToken}` }
                });
            } catch (fallbackErr) {
                console.error("Failed to delete item from backend.", fallbackErr);
            }
        }
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) return alert("Your cart is empty! 🛒");
        setPage('checkout');
    };

    if (loading) return <h3 style={loadingTextStyle}>Reviewing your bag... 🔮✨</h3>;

    return (
        <div style={cartPageContainer}>
            <h2 style={gradientTitleStyle}>Your Shopping Bag 🛍️💝</h2>
            
            {cartItems.length === 0 ? (
                <div style={emptyCartContainer}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛒✨</div>
                    <h3 style={{ color: 'var(--text-h)', margin: '0 0 8px 0' }}>Your cart feels so light!</h3>
                    <p style={{ color: 'var(--text)', margin: '0 0 24px 0', fontSize: '15px' }}>
                        Let's fill it with top-tier luxury items!
                    </p>
                    {/* SINGLE UNIFIED BACK-TO-SHOP BUTTON */}
                    <button onClick={() => setPage('home')} style={shopButtonStyle}>
                        ← Go Explore Marketplace
                    </button>
                </div>
            ) : (
                <div style={cartLayoutGrid}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {cartItems.map((item) => (
                            <div key={item._id} style={cartItemCard}>
                                <img src={item.mainimg} alt={item.title} style={itemImageStyle} />
                                <div style={itemDetailsStyle}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={itemTitleStyle}>{item.title}</h4>
                                        <p style={itemMetaStyle}>
                                            ₹{item.price?.toLocaleString('en-IN')} <span style={{ color: 'var(--text)' }}>x</span> {item.quantity}
                                        </p>
                                    </div>
                                    <div style={itemRightSideStyle}>
                                        <div style={itemLineTotalStyle}>
                                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                        </div>
                                        <button 
                                            onClick={() => handleRemoveItem(item._id)} 
                                            style={removeButtonStyle}
                                        >
                                            🗑️ Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={summaryCardStyle}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: 'var(--text-h)' }}>Order Summary</h3>
                        <div style={summaryRow}>
                            <span>Subtotal ({cartItems.length} items)</span>
                            <span>₹{total.toLocaleString('en-IN')}</span>
                        </div>
                        <div style={summaryRow}>
                            <span>Shipping Protection</span>
                            <span style={{ color: '#2e7d32', fontWeight: '600' }}>FREE ✨</span>
                        </div>
                        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />
                        <div style={{ ...summaryRow, fontSize: '18px', fontWeight: '700', color: 'var(--text-h)' }}>
                            <span>Grand Total</span>
                            <span style={{ color: 'var(--accent)' }}>₹{total.toLocaleString('en-IN')}</span>
                        </div>

                        <button onClick={handleCheckout} style={checkoutButtonStyle}>
                            Proceed to Secure Checkout 🚀
                        </button>
                        
                        {/* SINGLE UNIFIED SECONDARY BUTTON */}
                        <button onClick={() => setPage('home')} style={backToShopButtonStyle}>
                            ← Continue Shopping
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const cartPageContainer = { maxWidth: '1200px', margin: '40px auto', padding: '0 24px' };
const gradientTitleStyle = { fontSize: '32px', fontWeight: '800', marginBottom: '32px', background: 'linear-gradient(135deg, #aa3bff 0%, #0275d8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' };
const loadingTextStyle = { textAlign: 'center', marginTop: '80px', color: 'var(--text)' };
const cartLayoutGrid = { display: 'grid', gridTemplateColumns: '1fr minmax(320px, 380px)', gap: '32px', alignItems: 'start' };
const cartItemCard = { display: 'flex', gap: '20px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', alignItems: 'center' };
const itemImageStyle = { width: '90px', height: '90px', objectFit: 'cover', borderRadius: '10px' };
const itemDetailsStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' };
const itemTitleStyle = { margin: '0 0 6px 0', fontSize: '18px', fontWeight: '600', color: 'var(--text-h)' };
const itemMetaStyle = { margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--accent)' };
const itemRightSideStyle = { textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' };
const itemLineTotalStyle = { fontSize: '18px', fontWeight: '700', color: 'var(--text-h)' };
const removeButtonStyle = { background: 'rgba(186, 60, 60, 0.06)', border: 'none', color: '#ba3c3c', cursor: 'pointer', fontSize: '13px', fontWeight: '600', padding: '4px 8px', borderRadius: '6px' };
const summaryCardStyle = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', position: 'sticky', top: '100px' };
const summaryRow = { display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: 'var(--text)', marginBottom: '14px' };
const checkoutButtonStyle = { width: '100%', padding: '14px', background: 'var(--accent)', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '24px' };
const backToShopButtonStyle = { width: '100%', padding: '12px', background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', marginTop: '12px' };
const emptyCartContainer = { textAlign: 'center', padding: '60px 40px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '20px', maxWidth: '520px', margin: '40px auto' };
const shopButtonStyle = { padding: '12px 28px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '30px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' };

export default Cart;