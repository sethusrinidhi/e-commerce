import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Cart = ({ user, token, setPage }) => {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            // In a production app, fetch from backend via userId or Token
            // For now, we fetch items matched to this user
            const res = await axios.get(`http://localhost:8000/api/cart/${user.id}`);
            setCartItems(res.data);
            calculateTotal(res.data);
        } catch (err) {
            console.error("Error fetching cart", err);
        }
    };

    const calculateTotal = (items) => {
        const sum = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        setTotal(sum);
    };

    const handleCheckout = () => {
        if(cartItems.length === 0) return alert("Your cart is empty!");
        setPage('checkout');
    };

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
            <h2>Your Shopping Cart</h2>
            {cartItems.length === 0 ? (
                <p>Your cart is empty. Go back to the <span style={{color:'blue', cursor:'pointer'}} onClick={() => setPage('shop')}>Marketplace</span>.</p>
            ) : (
                <div>
                    {cartItems.map((item) => (
                        <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #eee' }}>
                            <img src={item.mainimg} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                            <div style={{ flex: 1, marginLeft: '20px' }}>
                                <h4>{item.title}</h4>
                                <p>${item.price} x {item.quantity}</p>
                            </div>
                            <div><strong>${item.price * item.quantity}</strong></div>
                        </div>
                    ))}
                    <div style={{ textAlign: 'right', marginTop: '20px', fontSize: '20px' }}>
                        <strong>Grand Total: ${total}</strong>
                    </div>
                    <button onClick={handleCheckout} style={{ width: '100%', marginTop: '20px', padding: '15px', background: '#5cb85c', color: 'white', border: 'none', borderRadius: '4px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Proceed to Secure Checkout
                    </button>
                </div>
            )}
        </div>
    );
};

export default Cart;