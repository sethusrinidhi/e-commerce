// client/src/components/ProductDetails.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProductDetails({ productId, setPage, user }) {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [adding, setAdding] = useState(false);

    // Selected variants state
    const [activeImgIndex, setActiveImgIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedStorage, setSelectedStorage] = useState(null);

    useEffect(() => {
        const fetchProductSpecs = async () => {
            try {
                setLoading(true);
                // 🌟 FIXED: Added /shop prefix to match backend product routes
                const res = await axios.get(`http://localhost:8000/api/shop/products/${productId}`);
                
                const data = res.data;
                setProduct(data);
                
                // Initialize default selections safely
                const category = determineCategory(data);
                if (category === 'electronics') {
                    setSelectedColor(data.colors?.[0] || "#E86C45"); 
                    setSelectedStorage(data.storage?.[0] || "256GB");
                } else if (category === 'clothing') {
                    setSelectedSize(data.sizes?.[0] || "M");
                } else if (category === 'footwear') {
                    setSelectedSize(data.sizes?.[0] || "8");
                }
                
                setLoading(false);
            } catch (err) {
                console.error("Error fetching product details:", err);
                setError(err.response?.data?.message || "Failed to retrieve product details.");
                setLoading(false);
            }
        };

        if (productId) {
            fetchProductSpecs();
        }
    }, [productId]);

    const determineCategory = (prod) => {
        if (!prod) return 'general';
        const cat = prod.category?.toLowerCase() || '';
        const title = prod.title?.toLowerCase() || '';
        
        if (cat.includes('elect') || cat.includes('phone') || title.includes('iphone') || title.includes('macbook')) {
            return 'electronics';
        }
        if (cat.includes('foot') || cat.includes('shoe') || title.includes('shoe') || title.includes('sneaker')) {
            return 'footwear';
        }
        if (cat.includes('cloth') || cat.includes('apparel') || title.includes('shirt') || title.includes('hoodie')) {
            return 'clothing';
        }
        return 'general';
    };

    const handleAddToBag = async () => {
        if (!user) {
            alert("🔒 Please login to add items to your cart!");
            setPage('login');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert("Your session token has expired. Please login again.");
            setPage('login');
            return;
        }

        setAdding(true);
        const currentCategory = determineCategory(product);
        let variantString = "";
        if (currentCategory === 'electronics') {
            variantString = `${selectedColor} / ${selectedStorage}`;
        } else {
            variantString = selectedSize ? `Size: ${selectedSize}` : "";
        }

        try {
            // 🌟 FIXED: Corrected cart add endpoint with /shop prefix and Authorization header
            await axios.post('http://localhost:8000/api/shop/cart/add', {
                title: product.title,
                price: product.price,
                variant: variantString,
                quantity: 1,
                mainimg: product.images?.[0] || product.mainimg || product.image || ""
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            alert(`✨ Successfully added to Cart with specs: ${variantString || "Standard Asset"}`);
        } catch (err) {
            console.error("Add to cart error:", err);
            alert(err.response?.data?.message || "Could not add item to cart.");
        } finally {
            setAdding(false);
        }
    };

    if (loading) return <div style={loaderStyle}>Decrypting Product Specifications...</div>;
    if (error || !product) return <div style={errorStyle}>⚠️ {error || "Specifications Offline"}</div>;

    const productImages = product.images && product.images.length > 0 
        ? product.images 
        : [product.mainimg || product.image || 'https://via.placeholder.com/600'];

    const originalPrice = product.originalPrice || (product.price * 1.4);
    const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);
    const category = determineCategory(product);

    return (
        <div style={containerStyle}>
            {/* Breadcrumb Back Button */}
            <button onClick={() => setPage('home')} style={backBtnStyle}>← Back to Gallery</button>

            <div style={gridStyle}>
                
                {/* LEFT SIDE: MULTI-IMAGE SLIDER */}
                <div style={gallerySectionStyle}>
                    <div style={mainImgWrapperStyle}>
                        <img src={productImages[activeImgIndex]} alt={product.title} style={mainImgStyle} />
                    </div>
                    {productImages.length > 1 && (
                        <div style={thumbnailContainerStyle}>
                            {productImages.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt="thumbnail"
                                    onClick={() => setActiveImgIndex(idx)}
                                    style={{
                                        ...thumbnailStyle,
                                        border: activeImgIndex === idx ? '2px solid #7c3aed' : '2px solid transparent'
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT SIDE: CATEGORY AWARE CONFIGURATION */}
                <div style={detailSectionStyle}>
                    <div>
                        <span style={brandTagStyle}>{category.toUpperCase()} CATALOGUE</span>
                        <h1 style={titleStyle}>{product.title}</h1>
                    </div>

                    {/* Pricing with reference Discount Engine */}
                    <div style={dealContainerStyle}>
                        <div>
                            <span style={discountBadgeStyle}>↓{discountPercent}% OFF</span>
                            <span style={originalPriceStyle}>₹{originalPrice.toLocaleString('en-IN')}</span>
                            <span style={currentPriceStyle}>₹{product.price.toLocaleString('en-IN')}</span>
                        </div>
                        <div style={hotDealBadgeStyle}>Hot Deal</div>
                    </div>

                    <p style={descStyle}>{product.description}</p>

                    {/* ================= DYNAMIC VARIANT SELECTORS ================= */}
                    
                    {category === 'electronics' && (
                        <div style={variantWrapperStyle}>
                            <div style={{ marginBottom: '15px' }}>
                                <span style={sectionLabelStyle}>Select Finish</span>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                    {(product.colors || ["#E86C45", "#1C1C1E", "#E3E4E5"]).map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            style={{
                                                ...colorSwatchStyle,
                                                background: color,
                                                outline: selectedColor === color ? '3px solid #7c3aed' : '1px solid #d1d5db'
                                            }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <span style={sectionLabelStyle}>Select Storage Capacity</span>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                    {(product.storage || ["128GB", "256GB", "512GB", "1TB"]).map((storage) => (
                                        <button
                                            key={storage}
                                            onClick={() => setSelectedStorage(storage)}
                                            style={{
                                                ...badgeOptionStyle,
                                                background: selectedStorage === storage ? '#f5f3ff' : '#ffffff',
                                                border: selectedStorage === storage ? '2px solid #7c3aed' : '1px solid #d1d5db',
                                                color: selectedStorage === storage ? '#7c3aed' : '#374151',
                                                fontWeight: selectedStorage === storage ? '700' : '500'
                                            }}
                                        >
                                            {storage}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {category === 'footwear' && (
                        <div style={variantWrapperStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={sectionLabelStyle}>Select UK/US Size</span>
                                <span style={sizeChartLinkStyle}>Size Chart</span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                {(product.sizes || ["6", "7", "8", "9", "10"]).map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        style={{
                                            ...badgeOptionStyle,
                                            background: selectedSize === size ? '#f5f3ff' : '#ffffff',
                                            border: selectedSize === size ? '2px solid #7c3aed' : '1px solid #d1d5db',
                                            color: selectedSize === size ? '#7c3aed' : '#374151'
                                        }}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {category === 'clothing' && (
                        <div style={variantWrapperStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={sectionLabelStyle}>Select Garment Size</span>
                                <span style={sizeChartLinkStyle}>Sizing Guide</span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                {(product.sizes || ["S", "M", "L", "XL", "XXL"]).map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        style={{
                                            ...badgeOptionStyle,
                                            background: selectedSize === size ? '#f5f3ff' : '#ffffff',
                                            border: selectedSize === size ? '2px solid #7c3aed' : '1px solid #d1d5db',
                                            color: selectedSize === size ? '#7c3aed' : '#374151'
                                        }}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Checkout Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                        <button onClick={handleAddToBag} disabled={adding} style={addToCartBtnStyle}>
                            🛒 {adding ? 'Adding to Cart...' : 'Add to Cart'}
                        </button>
                        <button onClick={() => setPage('checkout')} style={buyNowBtnStyle}>
                            ⚡ Instant Checkout (Buy Now)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ================= THE ARCHITECTURAL STYLES ================= */
const containerStyle = { maxWidth: '1200px', margin: '30px auto', padding: '0 20px', fontFamily: 'system-ui, -apple-system, sans-serif' };
const backBtnStyle = { background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', marginBottom: '20px', fontSize: '14px', fontWeight: '500' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px' };
const gallerySectionStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const mainImgWrapperStyle = { background: '#f9fafb', borderRadius: '16px', padding: '20px', border: '1px solid #f3f4f6', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '420px', overflow: 'hidden' };
const mainImgStyle = { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' };
const thumbnailContainerStyle = { display: 'flex', gap: '10px', justifyContent: 'center' };
const thumbnailStyle = { width: '65px', height: '65px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s' };
const detailSectionStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const brandTagStyle = { fontSize: '12px', color: '#7c3aed', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px' };
const titleStyle = { fontSize: '28px', fontWeight: '800', color: '#111827', marginTop: '4px' };
const dealContainerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#fcfdfd', border: '1px solid #f3f4f6', borderRadius: '10px' };
const discountBadgeStyle = { color: '#16a34a', fontWeight: '800', fontSize: '20px', marginRight: '8px' };
const originalPriceStyle = { textDecoration: 'line-through', color: '#9ca3af', fontSize: '15px', marginRight: '8px' };
const currentPriceStyle = { fontSize: '24px', fontWeight: '800', color: '#111827' };
const hotDealBadgeStyle = { background: '#10b981', color: 'white', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '4px' };
const descStyle = { fontSize: '15px', color: '#4b5563', lineHeight: '1.6' };
const variantWrapperStyle = { background: '#f9fafb', padding: '15px', borderRadius: '12px', border: '1px solid #f3f4f6' };
const sectionLabelStyle = { fontWeight: '700', color: '#374151', fontSize: '14px' };
const sizeChartLinkStyle = { color: '#2563eb', fontSize: '13px', fontWeight: '600', cursor: 'pointer' };

const colorSwatchStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    cursor: 'pointer',
    border: '2px solid white',
    boxShadow: '0 0 0 1px #d1d5db',
    transition: 'transform 0.1s ease'
};

const badgeOptionStyle = {
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.15s ease'
};

const addToCartBtnStyle = { background: '#7c3aed', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' };
const buyNowBtnStyle = { background: '#111827', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' };
const loaderStyle = { textAlign: 'center', padding: '100px', fontSize: '18px', color: '#666' };
const errorStyle = { textAlign: 'center', padding: '80px', fontSize: '18px', color: '#e11d48' };

export default ProductDetails;