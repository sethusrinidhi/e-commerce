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
            
            /* 💎 LUXURY FILTERING ENGINE: 
               Automatically prioritizes premium luxury goods valued above ₹10,000.
               If your database doesn't have them yet, it falls back to show all items.
            */
            const premiumItems = res.data.filter(product => product.price >= 10000);
            setProducts(premiumItems.length > 0 ? premiumItems : res.data);
        } catch (err) {
            console.error("Error loading products", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (product) => {
        if (!user) return alert("Please log in to add items to your cart! 🔒");
        try {
            await axios.post('http://localhost:8000/api/cart/add', {
                userId: user.id,
                title: product.title,
                price: product.price,
                mainimg: product.mainimg,
                quantity: 1
            });
            alert(`✨ Excellent choice! ${product.title} has been added to your vault.`);
        } catch (err) {
            alert("Could not add item to cart.");
        }
    };

    const handleBuyNow = async (product) => {
        if (!user) return alert("Please log in to purchase items! 🔒");
        try {
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

    if (!user) {
        return (
            <div style={gateContainerStyle}>
                <div style={emojiBadgeStyle}>💎</div>
                <h2 style={gradientTitleStyle}>Welcome to ShopSC Ultra-Premium</h2>
                <p style={gateDescriptionStyle}>
                    Unlock exclusive access to luxury tier flagships, elite consumer technology, and high-fashion assets starting above ₹10,000.
                </p>
                <button 
                    onClick={() => setPage('login')} 
                    style={gateButtonStyle}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    Enter the Showroom ✨
                </button>
            </div>
        );
    }

    if (loading) return <div style={loadingContainerStyle}><h3 style={loadingTextStyle}>Curating high-tier catalog... 📦💫</h3></div>;

    return (
        <div style={marketContainerStyle}>
            <div style={headerWrapperStyle}>
                <span style={superTagStyle}>ELITE COLLECTION</span>
                <h2 style={marketTitleStyle}>The Luxury Marketplace</h2>
                <div style={luxuryDivider}></div>
            </div>
            
            {/* PRODUCT INTERACTIVE GRID */}
            <div style={gridStyle}>
                {products.map((product) => (
                    <div 
                        key={product._id} 
                        style={cardStyle}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-10px)';
                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(170, 59, 255, 0.15)';
                            e.currentTarget.querySelector('.product-img').style.transform = 'scale(1.08)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.04)';
                            e.currentTarget.querySelector('.product-img').style.transform = 'scale(1)';
                        }}
                    >
                        {/* PREMIUM IMAGE BOX WITH GLOW OVERLAY */}
                        <div style={imageWrapperStyle}>
                            <img 
                                src={product.mainimg} 
                                alt={product.title} 
                                className="product-img"
                                style={productImageStyle} 
                            />
                            <div style={tagOverlay}>PREMIUM</div>
                        </div>
                        
                        <div style={cardContentStyle}>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={productTitleStyle}>{product.title}</h3>
                                <p style={productDescriptionStyle}>{product.description}</p>
                            </div>
                            
                            <div>
                                {/* High-Value Dynamic Localized Currency Layout */}
                                <div style={priceContainerStyle}>
                                    <span style={currencySymbolStyle}>₹</span>
                                    <span style={priceStyle}>{product.price.toLocaleString('en-IN')}</span>
                                </div>
                                
                                <div style={actionGroupStyle}>
                                    <button 
                                        onClick={() => handleAddToCart(product)} 
                                        style={cartButtonStyle}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                            e.currentTarget.style.borderColor = 'var(--accent)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                                        }}
                                    >
                                        🛒 Add to Bag
                                    </button>
                                    <button 
                                        onClick={() => handleBuyNow(product)} 
                                        style={buyButtonStyle}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                    >
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

/* ==========================================================================
   ADVANCED PREMIUM STYLING ENGINE (DARK LUXE INTERFACE)
   ========================================================================== */

const gateContainerStyle = {
    textAlign: 'center',
    padding: '80px 40px',
    maxWidth: '550px',
    margin: '60px auto',
    borderRadius: '24px',
    background: '#111215',
    border: '1px solid #22252a',
    boxShadow: '0 30px 60px rgba(0,0,0,0.4)'
};

const emojiBadgeStyle = {
    fontSize: '72px',
    marginBottom: '20px',
};

const gradientTitleStyle = {
    fontSize: '34px',
    fontWeight: '800',
    letterSpacing: '-1px',
    margin: '0 0 16px 0',
    background: 'linear-gradient(135deg, #c471ed 0%, #f64f59 50%, #12c2e9 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block'
};

const gateDescriptionStyle = {
    color: '#9aa0ac',
    maxWidth: '440px',
    margin: '0 auto 36px auto',
    fontSize: '16px',
    lineHeight: '1.7'
};

const gateButtonStyle = {
    padding: '16px 44px',
    background: 'linear-gradient(135deg, #aa3bff 0%, #6366f1 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(170, 59, 255, 0.35)',
    transition: 'all 0.3s ease'
};

const loadingContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '60vh'
};

const loadingTextStyle = {
    fontSize: '20px',
    color: '#aa3bff',
    fontWeight: '600'
};

const marketContainerStyle = {
    maxWidth: '1300px',
    margin: '50px auto',
    padding: '0 32px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
};

const headerWrapperStyle = {
    textAlign: 'center',
    marginBottom: '60px'
};

const superTagStyle = {
    fontSize: '12px',
    fontWeight: '800',
    letterSpacing: '3px',
    color: '#aa3bff',
    display: 'block',
    marginBottom: '8px'
};

const marketTitleStyle = {
    fontSize: '38px',
    fontWeight: '800',
    letterSpacing: '-1px',
    margin: '0 0 16px 0',
    color: '#111111'
};

const luxuryDivider = {
    width: '60px',
    height: '4px',
    background: 'linear-gradient(90deg, #aa3bff, #6366f1)',
    margin: '0 auto',
    borderRadius: '2px'
};

const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
    gap: '40px'
};

const cardStyle = {
    border: '1px solid rgba(0, 0, 0, 0.06)',
    borderRadius: '24px',
    overflow: 'hidden',
    background: '#ffffff',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
};

const imageWrapperStyle = {
    width: '100%',
    height: '280px',
    background: '#f7f8fa',
    overflow: 'hidden',
    position: 'relative'
};

const productImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
};

const tagOverlay = {
    position: 'absolute',
    top: '16px',
    left: '16px',
    background: '#111111',
    color: '#ffffff',
    padding: '6px 14px',
    borderRadius: '30px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1px'
};

const cardContentStyle = {
    padding: '28px',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
};

const productTitleStyle = {
    margin: '0 0 10px 0',
    fontSize: '22px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
    color: '#111111'
};

const productDescriptionStyle = {
    fontSize: '14px',
    color: '#555555',
    margin: 0,
    lineHeight: '1.6'
};

const priceContainerStyle = {
    display: 'flex',
    alignItems: 'baseline',
    gap: '2px',
    marginBottom: '24px'
};

const currencySymbolStyle = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111111'
};

const priceStyle = {
    fontSize: '32px',
    fontWeight: '800',
    color: '#111111',
    letterSpacing: '-0.5px'
};

const actionGroupStyle = {
    display: 'flex',
    gap: '14px'
};

const cartButtonStyle = {
    flex: 1,
    padding: '14px',
    background: 'transparent',
    border: '1px solid rgba(0,0,0,0.15)',
    color: '#111111',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
};

const buyButtonStyle = {
    flex: 1,
    padding: '14px',
    background: 'linear-gradient(135deg, #aa3bff 0%, #6366f1 100%)',
    border: 'none',
    color: '#ffffff',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(170, 59, 255, 0.25)',
    transition: 'all 0.2s ease'
};

export default Shop;