import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Shop = ({ user, setPage }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/products');
            setProducts(res.data);
        } catch (err) {
            console.error("Error loading products", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (product) => {
        if (!user) return alert("Please log in to add items to your cart!");
        try {
            await axios.post('http://localhost:8000/api/cart/add', {
                userId: user.id,
                title: product.title,
                price: product.price,
                mainimg: product.mainimg,
                quantity: 1
            });
            alert(`${product.title} added to cart!`);
        } catch (err) {
            alert("Could not add item to cart.");
        }
    };

    const handleBuyNow = async (product) => {
        if (!user) return alert("Please log in to purchase items!");
        try {
            // Instant checkout workflow: push to cart first, then bounce straight to checkout view
            await axios.post('http://localhost:8000/api/cart/add', {
                userId: user.id,
                title: product.title,
                price: product.price,
                mainimg: product.mainimg,
                quantity: 1
            });
            setPage('checkout');
        } catch (err) {
            alert("Buy Now checkout initialization failed.");
        }
    };

    // 🔒 GATING CHECK: If user state is missing, show Login Prompt screen instead of catalog
    if (!user) {
        return (
            <div style={{ textAlign: 'center', padding: '50px 20px', fontFamily: 'sans-serif' }}>
                <div style={{ fontSize: '64px' }}>🛍️</div>
                <h2>Welcome to ShopEZ Premium</h2>
                <p style={{ color: '#666', maxWidth: '400px', margin: '10px auto 25px auto', lineHeight: '1.5' }}>
                    Discover top-tier luxury Apple smartphones and high-fashion designer clothing sets at unbeatable prices.
                </p>
                <button 
                    onClick={() => setPage('login')} 
                    style={{ padding: '12px 34px', background: '#0275d8', color: 'white', border: 'none', borderRadius: '25px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(2,117,216,0.3)' }}
                >
                    Log In to Explore Catalog
                </button>
            </div>
        );
    }

    if (loading) return <h3 style={{ textAlign: 'center', marginTop: '50px' }}>Loading luxury goods...</h3>;

    return (
        <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Premium Marketplace</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
                {products.map((product) => (
                    <div key={product._id} style={{ border: '1px solid #e1e1e1', borderRadius: '12px', overflow: 'hidden', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                        <img src={product.mainimg} alt={product.title} style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
                        <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>{product.title}</h3>
                                <p style={{ fontSize: '14px', color: '#666', margin: '0 0 15px 0', lineHeight: '1.4' }}>{product.description}</p>
                            </div>
                            <div>
                                {/* Currency updated to Indian Rupees symbol */}
                                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#111', marginBottom: '15px' }}>₹{product.price.toLocaleString('en-IN')}</div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => handleAddToCart(product)} style={{ flex: 1, padding: '10px', background: '#fff', border: '2px solid #0275d8', color: '#0275d8', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                                        🛒 +Cart
                                    </button>
                                    <button onClick={() => handleBuyNow(product)} style={{ flex: 1, padding: '10px', background: '#5cb85c', border: 'none', color: 'white', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                                        ⚡ Buy Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Shop;