import React, { useState, useEffect } from 'react';
import './HomePortal.css';

function HomePortal({ setPage, setCategoryId, products = [], cartCount = 0, user, handleLogout }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeBannerIdx, setActiveBannerIdx] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('All');

    // SC World Curated Banner Slideshow
    const banners = [
        {
            id: 1,
            title: "SC Neo Gen 5G",
            subtitle: "Exclusive member access starts tonight. Dynamic processing, ultimate mobile design.",
            tagline: "SC PREMIUM EXCLUSIVE",
            bgGradient: "linear-gradient(135deg, #090d16 0%, #111827 100%)",
            accentColor: "#60a5fa"
        },
        {
            id: 2,
            title: "SC Premium Wardrobe Elite",
            subtitle: "Curated collections. Handcrafted threads. Up to 40% off for verified users.",
            tagline: "SC APPAREL LINE",
            bgGradient: "linear-gradient(135deg, #1e1b4b 0%, #2e1065 100%)",
            accentColor: "#f43f5e"
        },
        {
            id: 3,
            title: "SC Intelligent Spaces",
            subtitle: "Redefining modern living automation. Elevate your living standards seamlessly.",
            tagline: "SC LUXURY LIVING",
            bgGradient: "linear-gradient(135deg, #022c22 0%, #064e3b 100%)",
            accentColor: "#34d399"
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveBannerIdx((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [banners.length]);

    // Align category IDs exactly with database values
    const categories = [
        { id: 'All', label: 'For You', icon: '✨' },
        { id: 'Clothing', label: 'Clothing', icon: '👕' },
        { id: 'Electronics', label: 'Electronics', icon: '💻' },
        { id: 'Home & Kitchen', label: 'Home & Kitchen', icon: '🍳' }
    ];

    // 🔍 Smart, Bulletproof Category & Search Filter
    const filteredProducts = products.filter(product => {
        const title = (product.title || '').toLowerCase();
        const description = (product.description || '').toLowerCase();
        const category = (product.category || '').toLowerCase();
        const query = searchTerm.toLowerCase().trim();

        // Strict category match logic
        let matchesCategory = false;
        if (selectedCategory === 'All') {
            matchesCategory = true;
        } else {
            matchesCategory = category === selectedCategory.toLowerCase() ||
                              (selectedCategory === 'Clothing' && (category.includes('cloth') || category.includes('fashion') || category.includes('apparel'))) ||
                              (selectedCategory === 'Electronics' && (category.includes('electronic') || category.includes('mobile') || category.includes('gadget'))) ||
                              (selectedCategory === 'Home & Kitchen' && (category.includes('home') || category.includes('kitchen')));
        }

        if (!query) return matchesCategory;

        const matchesText = title.includes(query) || description.includes(query) || category.includes(query);
        return matchesCategory && matchesText;
    });

    return (
        <div className="hp-container">
            
            {/* ================= SC PREMIUM WORLD HEADER ================= */}
            <header className="hp-header">
                <div className="hp-header-inner">
                    
                    {/* Brand Identifier */}
                    <div onClick={() => { setSelectedCategory('All'); setSearchTerm(''); }} className="hp-logo" style={{ cursor: 'pointer' }}>
                        <span className="hp-logo-primary">SHOP</span>
                        <span className="hp-logo-secondary">SC</span>
                    </div>

                    {/* Interactive Premium Search */}
                    <div className="hp-search-wrapper">
                        <input 
                            type="text" 
                            placeholder="Search mobile, clothes, decor..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="hp-search-input"
                        />
                        <span className="hp-search-icon">🔍</span>
                    </div>

                    {/* Actions and Navigation */}
                    <div className="hp-nav-actions">
                        <button onClick={() => setPage('cart')} className="hp-text-nav-btn">
                            <div className="hp-cart-wrapper">
                                🛒 Cart
                                {cartCount > 0 && <span className="hp-cart-badge">{cartCount}</span>}
                            </div>
                        </button>

                        <button onClick={() => setPage('orders')} className="hp-text-nav-btn">My Orders</button>

                        {user ? (
                            <div className="hp-dropdown-container">
                                <button className="hp-user-accent-btn">
                                    Welcome, <span className="hp-username-strong">{user.name || user.username || 'Member'}</span> <span className="hp-user-label-badge">USER</span> ▾
                                </button>
                                <div className="hp-dropdown-menu">
                                    <div className="hp-dropdown-item" onClick={() => setPage('orders')}>Manage Orders</div>
                                    {user.usertype === 'admin' && (
                                        <div className="hp-dropdown-item hp-dropdown-admin" onClick={() => setPage('admin')}>
                                            🛠️ Admin Panel
                                        </div>
                                    )}
                                    <hr className="hp-dropdown-divider" />
                                    <div className="hp-dropdown-item hp-dropdown-logout" onClick={handleLogout}>Logout</div>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setPage('login')} className="hp-login-btn">Login</button>
                        )}
                    </div>
                </div>
            </header>

            {/* ================= CATEGORY SCROLLBAR ================= */}
            <nav className="hp-category-nav">
                <div className="hp-category-container">
                    {categories.map((cat) => (
                        <div 
                            key={cat.id} 
                            onClick={() => { setSelectedCategory(cat.id); setSearchTerm(''); }}
                            className={`hp-category-item ${selectedCategory === cat.id ? 'hp-category-active' : ''}`}
                        >
                            <span className="hp-category-icon">{cat.icon}</span>
                            <span className="hp-category-label">{cat.label}</span>
                        </div>
                    ))}
                </div>
            </nav>

            {/* ================= HERO INTERACTIVE SLIDER ================= */}
            <section className="hp-hero-section">
                <div className="hp-banner-frame" style={{ background: banners[activeBannerIdx].bgGradient }}>
                    <div className="hp-banner-content">
                        <div className="hp-banner-text-side">
                            <span className="hp-banner-tagline" style={{ color: banners[activeBannerIdx].accentColor }}>
                                {banners[activeBannerIdx].tagline}
                            </span>
                            <h2 className="hp-banner-title">{banners[activeBannerIdx].title}</h2>
                            <p className="hp-banner-subtitle">{banners[activeBannerIdx].subtitle}</p>
                            <button onClick={() => { setSelectedCategory('All'); setSearchTerm(''); }} className="hp-banner-cta">
                                Explore SC Premium World ➔
                            </button>
                        </div>
                        
                        <div className="hp-banner-badge-wrapper">
                            <div className="hp-sales-badge">
                                <div className="hp-badge-top">SHOP SC</div>
                                <div className="hp-badge-mid">ELITE</div>
                                <div className="hp-badge-bot">PREMIUM SUITE</div>
                            </div>
                        </div>
                    </div>

                    <div className="hp-dots-wrapper">
                        {banners.map((_, idx) => (
                            <span 
                                key={idx} 
                                onClick={() => setActiveBannerIdx(idx)}
                                className={`hp-dot ${activeBannerIdx === idx ? 'hp-dot-active' : ''}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= PRODUCTS SECTIONS ================= */}
            <main className="hp-main-content">
                <div className="hp-grid-header">
                    <h3 className="hp-grid-title">
                        {searchTerm ? `Results for "${searchTerm}"` : selectedCategory === 'All' ? 'SC Curated Releases' : `SC ${selectedCategory}`}
                    </h3>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="hp-empty-grid">
                        <h3>No premium products listed under this collection currently.</h3>
                        <p className="hp-empty-subtitle">Try selecting a different category or clearing search terms.</p>
                    </div>
                ) : (
                    <div className="hp-product-grid">
                        {filteredProducts.map((prod) => (
                            <div 
                                key={prod._id || prod.id} 
                                onClick={() => { setCategoryId(prod._id || prod.id); setPage('product-details'); }}
                                className="hp-product-card"
                            >
                                <div className="hp-card-img-wrapper">
                                    <img 
                                        src={prod.mainimg || prod.images?.[0] || prod.image || 'https://via.placeholder.com/200'} 
                                        alt={prod.title} 
                                        className="hp-card-img" 
                                    />
                                </div>
                                <div className="hp-card-body">
                                    <h4 className="hp-card-title">{prod.title}</h4>
                                    <div className="hp-card-badge-row">
                                        <span className="hp-premium-badge">✨ {prod.category || 'Premium Item'}</span>
                                    </div>
                                    <div className="hp-card-price-row">
                                        <span className="hp-card-price">₹{prod.price?.toLocaleString('en-IN')}</span>
                                        <span className="hp-card-strike">
                                            ₹{((prod.price || 0) * 1.25).toFixed(0)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default HomePortal;