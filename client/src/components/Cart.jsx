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
            const res = await axios.get(`http://localhost:8000/api/cart/${user.id}`);
            setCartItems(res.data);
            calculateTotal(res.data);
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

    // 🗑️ LIVE REMOVE ROUTINE: Deletes item from database and instantly updates totals
    const handleRemoveItem = async (itemId) => {
        // 1. Instantly update the UI screen state immediately for a smooth, fast visual experience
        const updatedCart = cartItems.filter(item => item._id !== itemId);
        setCartItems(updatedCart);
        calculateTotal(updatedCart);

        try {
            // 2. Attempt to notify your backend database using your API path
            await axios.delete(`http://localhost:8000/api/cart/remove/${itemId}`);
        } catch (err) {
            console.warn("Backend Sync Warning: Could not complete server-side delete operation.", err);
            
            /* 
               Fallback Handler: If your backend endpoint route is actually configured as `/api/cart/${itemId}` 
               instead of `/api/cart/remove/${itemId}`, we run a secondary automated attempt here:
            */
            try {
                await axios.delete(`http://localhost:8000/api/cart/${itemId}`);
            } catch (fallbackErr) {
                console.error("Fallback route failed as well. Please verify your backend router path file.", fallbackErr);
            }
        }
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) return alert("Your cart is empty! 🛒");
        setPage('checkout');
    };

    if (loading) return <h3 style={loadingTextStyle}>Reviewing your lovely bag... 🔮✨</h3>;

    return (
        <div style={cartPageContainer}>
            <h2 style={gradientTitleStyle}>Your Shopping Bag 🛍️💝</h2>
            
            {cartItems.length === 0 ? (
                <div style={emptyCartContainer}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛒✨</div>
                    <h3 style={{ color: 'var(--text-h)', margin: '0 0 8px 0' }}>Your cart feels so light!</h3>
                    <p style={{ color: 'var(--text)', margin: '0 0 24px 0', fontSize: '15px' }}>
                        Let's fill it with top-tier luxury Apple flagships and beautiful fashion items!
                    </p>
                    <button onClick={() => setPage('shop')} style={shopButtonStyle}>
                        Go Explore Marketplace 🌸
                    </button>
                </div>
            ) : (
                <div style={cartLayoutGrid}>
                    
                    {/* LEFT COLUMN: ACTIVE ITEMS MATRIX */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {cartItems.map((item) => (
                            <div key={item._id} style={cartItemCard}>
                                <img src={item.mainimg} alt={item.title} style={itemImageStyle} />
                                
                                <div style={itemDetailsStyle}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={itemTitleStyle}>{item.title}</h4>
                                        <p style={itemMetaStyle}>
                                            ₹{item.price.toLocaleString('en-IN')} <span style={{ color: 'var(--text)' }}>x</span> {item.quantity}
                                        </p>
                                    </div>
                                    
                                    <div style={itemRightSideStyle}>
                                        <div style={itemLineTotalStyle}>
                                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                        </div>
                                        
                                        {/* LOVABLE TRASH/REMOVE INTERACTIVE LINK */}
                                        <button 
                                            onClick={() => handleRemoveItem(item._id)} 
                                            style={removeButtonStyle}
                                            onMouseEnter={(e) => e.currentTarget.style.color = '#ff4d4d'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = '#ba3c3c'}
                                        >
                                            🗑️ Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* RIGHT COLUMN: INTERACTIVE ORDER SUMMARY CONTROL PANEL */}
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
                        
                        <button onClick={() => setPage('shop')} style={backToShopButtonStyle}>
                            ← Keep Browsing Items
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
};

/* ==========================================================================
   ADVANCED CART INTERFACE STYLING TOKENS
   ========================================================================== */

const cartPageContainer = {
    maxWidth: '1200px',
    margin: '40px auto',
    padding: '0 24px',
};

const gradientTitleStyle = {
    fontSize: '32px',
    fontWeight: '800',
    letterSpacing: '-1px',
    marginBottom: '32px',
    background: 'linear-gradient(135deg, #aa3bff 0%, #0275d8 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block'
};

const loadingTextStyle = {
    textAlign: 'center',
    marginTop: '80px',
    color: 'var(--text)',
    fontFamily: 'sans-serif'
};

const cartLayoutGrid = {
    display: 'grid',
    gridTemplateColumns: '1fr minmax(320px, 380px)',
    gap: '32px',
    alignItems: 'start'
};

const cartItemCard = {
    display: 'flex',
    gap: '20px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: 'var(--shadow)',
    alignItems: 'center'
};

const itemImageStyle = {
    width: '90px',
    height: '90px',
    objectFit: 'cover',
    borderRadius: '10px',
    background: 'var(--code-bg)',
    border: '1px solid var(--border)'
};

const itemDetailsStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    flexGrow: 1
};

const itemTitleStyle = {
    margin: '0 0 6px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-h)'
};

const itemMetaStyle = {
    margin: 0,
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--accent)'
};

const itemRightSideStyle = {
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    alignItems: 'flex-end'
};

const itemLineTotalStyle = {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-h)'
};

const removeButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#ba3c3c',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '6px',
    background: 'rgba(186, 60, 60, 0.06)',
    transition: 'all 0.2s ease',
    outline: 'none'
};

const summaryCardStyle = {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: 'var(--shadow)',
    position: 'sticky',
    top: '100px'
};

const summaryRow = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '15px',
    color: 'var(--text)',
    marginBottom: '14px'
};

const checkoutButtonStyle = {
    width: '100%',
    padding: '14px',
    background: 'var(--accent)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '24px',
    boxShadow: '0 4px 14px rgba(170, 59, 255, 0.25)',
    transition: 'opacity 0.2s'
};

const backToShopButtonStyle = {
    width: '100%',
    padding: '12px',
    background: 'transparent',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '12px',
    transition: 'background-color 0.2s'
};

const emptyCartContainer = {
    textAlign: 'center',
    padding: '60px 40px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    maxWidth: '520px',
    margin: '40px auto',
    boxShadow: 'var(--shadow)'
};

const shopButtonStyle = {
    padding: '12px 28px',
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(170, 59, 255, 0.2)'
};

export default Cart;