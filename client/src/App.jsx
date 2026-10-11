import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import Admin from './components/Admin'; 
import Cart from './components/Cart';        
import Checkout from './components/Checkout'; 
import ForgotPassword from './components/ForgotPassword';
import MyOrders from './components/MyOrders.jsx'; 
import ProductDetails from './components/ProductDetails'; 
import HomePortal from './components/HomePortal'; 

function App() {
    const [page, setPage] = useState('login'); 
    const [user, setUser] = useState(null);   
    const [token, setToken] = useState('');   
    const [products, setProducts] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [selectedProductId, setSelectedProductId] = useState(null);

    // Fetch products catalog
    useEffect(() => {
        axios.get('http://localhost:8000/api/shop/products')
            .then(res => setProducts(res.data))
            .catch(err => console.error("Error fetching inventory catalog:", err));
    }, []);

 // Fetch user cart count
    useEffect(() => {
        if (user && token) {
            axios.get(`http://localhost:8000/api/shop/cart/${user.id || user._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    const items = res.data?.items || res.data || [];
                    setCartCount(items.length);
                })
                .catch(err => console.error("Error fetching cart count:", err));
        } else {
            setCartCount(0);
        }
    }, [user, token, page]);

    const handleUserLoginSuccess = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        setPage(userData?.usertype === 'admin' ? 'admin' : 'home');
    };

    const handleLogout = () => {
        setUser(null);
        setToken('');
        setPage('login');
    };

    const viewProductDetails = (id) => {
        setSelectedProductId(id);
        setPage('product-details');
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            
            {page !== 'home' && page !== 'login' && page !== 'register' && page !== 'admin-login' && page !== 'admin' && (
                <Navbar user={user} setPage={setPage} setUser={setUser} />
            )}

            {page !== 'home' && page !== 'login' && page !== 'register' && page !== 'admin-login' && page !== 'admin' && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', margin: '15px 0' }}>
                    <button 
                        onClick={() => setPage('home')} 
                        style={{ padding: '8px 18px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        ✨ Back to SC Premium World
                    </button>
                    {user && user.usertype === 'admin' && (
                        <button 
                            onClick={() => setPage('admin')} 
                            style={{ padding: '8px 18px', background: '#e11d48', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            🛠️ Go to Admin Panel
                        </button>
                    )}
                </div>
            )}
            
            {page === 'home' && (
                <HomePortal 
                    setPage={setPage}
                    setCategoryId={viewProductDetails} 
                    products={products}
                    cartCount={cartCount}
                    user={user}
                    handleLogout={handleLogout}
                />
            )}

            {page === 'cart' && <Cart user={user} token={token} setPage={setPage} />}
            {page === 'checkout' && <Checkout user={user} setPage={setPage} />}
            {page === 'forgot' && <ForgotPassword setPage={setPage} />} 
            {page === 'orders' && <MyOrders user={user} token={token} setPage={setPage} />}
            {page === 'product-details' && (
                <ProductDetails 
                    productId={selectedProductId} 
                    setPage={setPage} 
                    user={user}
                />
            )}
            
            {page === 'login' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                    <Auth type="login" setPage={setPage} setUser={handleUserLoginSuccess} />
                    <button 
                        onClick={() => setPage('admin-login')} 
                        style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', textDecoration: 'underline', marginTop: '20px', cursor: 'pointer' }}
                    >
                        🔐 Security Officer / Admin Entrance
                    </button>
                </div>
            )}
            
            {page === 'register' && <Auth type="register" setPage={setPage} setUser={() => {}} />}
            
            {page === 'admin-login' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                    <Auth 
                        type="admin-login" 
                        setPage={setPage} 
                        setUser={(userData, userToken) => {
                            if (userData?.usertype === 'admin') {
                                handleUserLoginSuccess(userData, userToken);
                            } else {
                                alert('Verification Failed: You do not possess Administrative status.');
                                setPage('login');
                            }
                        }} 
                    />
                    <button onClick={() => setPage('login')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', textDecoration: 'underline', marginTop: '20px', cursor: 'pointer' }}>
                        ⬅️ Go back to Standard User Login
                    </button>
                </div>
            )}
            
            {page === 'admin' && (
                user?.usertype === 'admin' ? <Admin token={token} setPage={setPage} /> : (
                    <div style={{ textAlign: 'center', marginTop: '50px', color: '#ef4444' }}>
                        <h3>Security Clearance Denied: Admin Status Required 🔒</h3>
                        <button onClick={() => setPage('login')} style={{ marginTop: '10px', padding: '8px 16px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                            Return to Security Login
                        </button>
                    </div>
                )
            )}
        </div>
    );
}

export default App;