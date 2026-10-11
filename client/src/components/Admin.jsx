import React, { useState, useEffect } from 'react';

const Admin = ({ token, setPage, setUser }) => {
  const [activeTab, setActiveTab] = useState('products');
  const [productMessage, setProductMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // 🌟 Core Form State
  const [product, setProduct] = useState({
    title: '',
    price: '',
    category: 'Electronics', 
    mainimg: '',
    description: '',
    stock: ''
  });

  // 📸 Dynamic Multi-Image Gallery State (Array of image URLs)
  const [galleryUrls, setGalleryUrls] = useState(['', '']);

  // 🛠️ Dynamic Category Specs State
  const [categorySpecs, setCategorySpecs] = useState({
    brand: '',
    color: '',
    warranty: '',
    modelNumber: ''
  });

  // Orders pipeline states
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const getCleanToken = () => {
    let activeToken = token || localStorage.getItem('token');
    if (activeToken && activeToken.startsWith('"') && activeToken.endsWith('"')) {
      activeToken = activeToken.slice(1, -1);
    }
    return activeToken;
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('token');
    if (setUser) setUser(null);
    setPage('login');
  };

  // Gallery URL handlers
  const handleGalleryChange = (index, value) => {
    const updated = [...galleryUrls];
    updated[index] = value;
    setGalleryUrls(updated);
  };

  const addGalleryField = () => {
    setGalleryUrls((prev) => [...prev, '']);
  };

  const removeGalleryField = (index) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (product.category === 'Electronics') {
      setCategorySpecs({ brand: '', color: '', warranty: '', modelNumber: '' });
    } else if (product.category === 'Clothing') {
      setCategorySpecs({ sizeS: false, sizeM: false, sizeL: false, sizeXL: false, material: '', color: '', brand: '' });
    } else if (product.category === 'Home & Kitchen') {
      setCategorySpecs({ material: '', dimensions: '', weight: '', warranty: '' });
    } else {
      setCategorySpecs({ brand: '', color: '' }); 
    }
  }, [product.category]);

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  // 📦 Fetch Orders (Using relative path for Vercel multi-service routing)
  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const activeToken = getCleanToken();
      const response = await fetch('/api/shop/admin/orders', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      const data = await response.json();
      if (response.ok) {
        setOrders(Array.isArray(data) ? data : (data.orders || []));
      } else {
        setOrdersError(data.message || 'Failed to sync orders.');
      }
    } catch (err) {
      setOrdersError('Failed to establish pipeline connection.');
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const activeToken = getCleanToken();
      const response = await fetch(`/api/shop/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({ orderstatus: newStatus })
      });
      const data = await response.json();
      if (response.ok) {
        setOrders((prev) => prev.map(o => o._id === orderId ? { ...o, orderstatus: newStatus } : o));
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      alert('Unable to send status change instruction to server.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setUpdatingId(orderId);
    try {
      const activeToken = getCleanToken();
      const response = await fetch(`/api/shop/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({ orderstatus: 'Cancelled' })
      });
      const data = await response.json();
      if (response.ok) {
        setOrders((prev) => prev.map(o => o._id === orderId ? { ...o, orderstatus: 'Cancelled' } : o));
        alert('Order has been successfully cancelled.');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      alert('Unable to transmit cancellation payload.');
    } finally {
      setUpdatingId(null);
    }
  };

  // 🚀 Publish Product with Multi-Images
  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    setProductMessage('');

    const cleanGallery = galleryUrls.map(url => url.trim()).filter(url => url !== '');

    try {
      const activeToken = getCleanToken();

      const payload = {
        title: product.title,
        price: parseFloat(product.price),
        category: product.category,
        mainimg: product.mainimg,
        description: product.description,
        stock: parseInt(product.stock) || 0,
        gallery: cleanGallery,
        specifications: categorySpecs
      };

      const response = await fetch('/api/shop/admin/add-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        setProductMessage('🎉 Product and multi-image gallery published successfully!');
        setProduct({ title: '', price: '', category: 'Electronics', mainimg: '', description: '', stock: '' });
        setGalleryUrls(['', '']);
      } else {
        setProductMessage(`⚠️ Error: ${data.message || 'Failed to publish item'}`);
      }
    } catch (err) {
      setProductMessage('⚠️ Connection error reaching server.');
    }
  };

  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.totalPrice || 0), 0);
  const pendingOrdersCount = orders.filter(o => o.orderstatus !== 'Delivered' && o.orderstatus !== 'Cancelled').length;
  const completedOrdersCount = orders.filter(o => o.orderstatus === 'Delivered').length;

  const filteredOrders = orders.filter(ord => 
    ord._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ord.address && ord.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#080B12', color: '#f8fafc', padding: '30px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', color: '#38bdf8', fontWeight: '800' }}>⚡ EnterpriseSync Control Center</h1>
            <p style={{ margin: '6px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>System Command Console — Operated by Sunnychanu</p>
          </div>
          <button onClick={handleAdminLogout} style={{ padding: '10px 20px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid #ef4444', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
            🔒 Logout
          </button>
        </div>

        {/* Analytics Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>REVENUE</span>
            <h2 style={{ margin: '8px 0 0 0', color: '#4ade80', fontSize: '26px' }}>₹ {totalRevenue.toFixed(2)}</h2>
          </div>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>TOTAL ORDERS</span>
            <h2 style={{ margin: '8px 0 0 0', color: '#38bdf8', fontSize: '26px' }}>{orders.length}</h2>
          </div>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>PENDING</span>
            <h2 style={{ margin: '8px 0 0 0', color: '#fbbf24', fontSize: '26px' }}>{pendingOrdersCount}</h2>
          </div>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>DELIVERED</span>
            <h2 style={{ margin: '8px 0 0 0', color: '#a78bfa', fontSize: '26px' }}>{completedOrdersCount}</h2>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', background: '#0f172a', padding: '6px', borderRadius: '12px', marginBottom: '30px', gap: '6px', border: '1px solid #1e293b' }}>
          <button onClick={() => setActiveTab('products')} style={{ flex: 1, padding: '14px 20px', fontSize: '15px', fontWeight: '700', border: 'none', background: activeTab === 'products' ? '#0284c7' : 'transparent', color: '#ffffff', cursor: 'pointer', borderRadius: '8px' }}>
            📦 Catalog & Product Designer
          </button>
          <button onClick={() => setActiveTab('orders')} style={{ flex: 1, padding: '14px 20px', fontSize: '15px', fontWeight: '700', border: 'none', background: activeTab === 'orders' ? '#0284c7' : 'transparent', color: '#ffffff', cursor: 'pointer', borderRadius: '8px' }}>
            📋 Advanced Order Control Center ({orders.length})
          </button>
        </div>

        {/* CATALOG & PRODUCT DESIGNER TAB */}
        {activeTab === 'products' && (
          <div style={{ background: '#0f172a', padding: '30px', borderRadius: '16px', border: '1px solid #1e293b' }}>
            <div style={{ marginBottom: '25px', borderBottom: '1px solid #1e293b', paddingBottom: '15px' }}>
              <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '22px' }}>🚀 Creative Product Architect</h2>
              <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>Publish catalog items with main hero image and secondary gallery views.</p>
            </div>
            
            {productMessage && (
              <div style={{ padding: '14px', borderRadius: '8px', marginBottom: '20px', background: productMessage.includes('🎉') ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: productMessage.includes('🎉') ? '#4ade80' : '#f87171', fontWeight: '600', fontSize: '14px' }}>
                {productMessage}
              </div>
            )}

            <form onSubmit={handleAddProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#cbd5e1', marginBottom: '4px' }}>Product Title</label>
                  <input type="text" name="title" required value={product.title} onChange={handleProductChange} placeholder="e.g., Sony WH-1000XM5" style={{ width: '100%', padding: '10px 14px', background: '#080B12', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#cbd5e1', marginBottom: '4px' }}>Price (INR ₹)</label>
                  <input type="number" name="price" required value={product.price} onChange={handleProductChange} placeholder="₹ 29999" style={{ width: '100%', padding: '10px 14px', background: '#080B12', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#cbd5e1', marginBottom: '4px' }}>Inventory Stock</label>
                  <input type="number" name="stock" required value={product.stock} onChange={handleProductChange} placeholder="e.g., 50" style={{ width: '100%', padding: '10px 14px', background: '#080B12', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '15px', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#cbd5e1', marginBottom: '4px' }}>Main Primary Image URL (Cover)</label>
                  <input type="text" name="mainimg" required value={product.mainimg} onChange={handleProductChange} placeholder="https://images.unsplash.com/.../main.jpg" style={{ width: '100%', padding: '10px 14px', background: '#080B12', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#38bdf8', marginBottom: '4px' }}>Category</label>
                  <select name="category" value={product.category} onChange={handleProductChange} style={{ width: '100%', padding: '10px 14px', background: '#080B12', border: '1px solid #0284c7', color: '#38bdf8', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', boxSizing: 'border-box' }}>
                    <option value="Electronics">Electronics 💻</option>
                    <option value="Clothing">Clothing 👕</option>
                    <option value="Home & Kitchen">Home & Kitchen 🍳</option>
                  </select>
                </div>
              </div>

              {product.mainimg && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#080B12', padding: '10px', borderRadius: '8px', border: '1px dashed #334155' }}>
                  <img src={product.mainimg} alt="Cover Preview" onError={(e) => { e.target.style.display = 'none'; }} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                  <span style={{ fontSize: '12px', color: '#38bdf8' }}>✓ Cover Image Linked</span>
                </div>
              )}

              {/* 📸 SECTION: MULTI-IMAGE GALLERY MANAGER */}
              <div style={{ background: '#080B12', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '15px' }}>🖼️ Product Image Gallery (Multiple Angles)</h4>
                    <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '12px' }}>Add multiple high-res image links for storefront gallery views.</p>
                  </div>
                  <button type="button" onClick={addGalleryField} style={{ padding: '8px 14px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                    + Add Image Link
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {galleryUrls.map((url, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#64748b', minWidth: '80px' }}>Image #{idx + 1}:</span>
                        <input 
                          type="text" 
                          value={url} 
                          onChange={(e) => handleGalleryChange(idx, e.target.value)} 
                          placeholder="https://images.unsplash.com/.../angle2.jpg" 
                          style={{ flex: 1, padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }} 
                        />
                        {galleryUrls.length > 1 && (
                          <button type="button" onClick={() => removeGalleryField(idx)} style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                            ✕
                          </button>
                        )}
                      </div>

                      {url.trim() && (
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginLeft: '90px' }}>
                          <img src={url} alt={`Gallery Preview ${idx + 1}`} onError={(e) => { e.target.style.display = 'none'; }} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #38bdf8' }} />
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Gallery Thumbnail #{idx + 1} Ready</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#cbd5e1', marginBottom: '4px' }}>Product Narrative / Description</label>
                <textarea name="description" rows="3" required value={product.description} onChange={handleProductChange} placeholder="Write product highlights..." style={{ width: '100%', padding: '10px 14px', background: '#080B12', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontFamily: 'inherit', fontSize: '13px', boxSizing: 'border-box' }} />
              </div>

              <button type="submit" style={{ padding: '14px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '15px', marginTop: '10px' }}>
                🚀 Publish Product with Gallery
              </button>
            </form>
          </div>
        )}

        {/* ORDER CONTROL CENTER TAB */}
        {activeTab === 'orders' && (
          <div style={{ background: '#0f172a', padding: '30px', borderRadius: '16px', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid #1e293b', paddingBottom: '15px' }}>
              <div>
                <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '22px' }}>📋 System Order Pipeline</h2>
                <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>Dispatch shipping packages, monitor checkout totals, and process quick cancellations.</p>
              </div>
              <input 
                type="text" 
                placeholder="🔍 Search orders by ID or Address..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '10px 16px', background: '#080B12', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '13px', minWidth: '280px' }}
              />
            </div>

            {ordersLoading && <p style={{ color: '#38bdf8', fontWeight: '600' }}>Syncing secure transaction pipelines...</p>}
            {ordersError && <p style={{ color: '#ef4444', fontWeight: 'bold' }}>⚠️ {ordersError}</p>}
            {!ordersLoading && !ordersError && filteredOrders.length === 0 && (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>No orders found matching search query.</p>
            )}
            
            {!ordersLoading && filteredOrders.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {filteredOrders.map((ord) => (
                  <div key={ord._id} style={{ border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', background: '#080B12' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#38bdf8', textTransform: 'uppercase' }}>ORDER IDENTIFIER</span>
                        <h4 style={{ margin: '2px 0 0 0', color: '#f8fafc', fontFamily: 'monospace' }}>ID: #{ord._id}</h4>
                      </div>

                      <div>
                        {ord.orderstatus === 'Cancelled' ? (
                          <span style={{ padding: '6px 12px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid #ef4444', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                            ❌ Order Cancelled
                          </span>
                        ) : ord.orderstatus === 'Delivered' ? (
                          <span style={{ padding: '6px 12px', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid #22c55e', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                            ✅ Delivered successfully
                          </span>
                        ) : (
                          <button 
                            onClick={() => handleCancelOrder(ord._id)} 
                            disabled={updatingId === ord._id}
                            style={{ padding: '8px 14px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                          >
                            ⚠️ Cancel Placed Order
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', padding: '14px', background: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b', marginBottom: '15px' }}>
                      <div>
                        <small style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Total Paid</small>
                        <strong style={{ fontSize: '15px', color: '#4ade80' }}>₹ {ord.totalPrice}</strong>
                      </div>
                      <div>
                        <small style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Payment Method</small>
                        <strong style={{ fontSize: '13px', color: '#cbd5e1' }}>{ord.paymentmethod || 'Prepaid COD'}</strong>
                      </div>
                      <div>
                        <small style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Destination</small>
                        <span style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ord.address}</span>
                      </div>
                    </div>
                    
                    <div style={{ margin: '15px 0', padding: '14px', background: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b' }}>
                      <strong style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#94a3b8' }}>📦 Package Shipment Contents:</strong>
                      {ord.items?.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', borderBottom: i === ord.items.length - 1 ? 'none' : '1px solid #1e293b', color: '#cbd5e1' }}>
                          <span>{item.title} <strong>x {item.quantity}</strong></span>
                          <span style={{ fontWeight: '600' }}>₹ {item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <label style={{ fontSize: '13px', fontWeight: '700', color: '#94a3b8' }}>Change Shipping Status:</label>
                      <select 
                        value={ord.orderstatus || 'Placed'} 
                        disabled={updatingId === ord._id || ord.orderstatus === 'Cancelled'}
                        onChange={(e) => handleUpdateStatus(ord._id, e.target.value)}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #334155', background: '#080B12', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
                      >
                        <option value="Placed">Placed 📦</option>
                        <option value="Paid & Processing">Paid & Processing ⚙️</option>
                        <option value="Shipped">Shipped 🚚</option>
                        <option value="Delivered">Delivered ✅</option>
                      </select>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Admin;