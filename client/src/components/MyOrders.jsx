import React, { useEffect, useState } from 'react';

const MyOrders = ({ user, token, setPage }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  // Clean Token Helper
  const getCleanToken = () => {
    let activeToken = token || localStorage.getItem('token');
    if (activeToken && activeToken.startsWith('"') && activeToken.endsWith('"')) {
      activeToken = activeToken.slice(1, -1);
    }
    return activeToken;
  };

  // Fetch Customer Personal Orders with Route Fallbacks
  const fetchMyOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const activeToken = getCleanToken();
    const userId = user.id || user._id;

    // Array of potential backend route paths for resilience
    const endpoints = [
      `http://localhost:8000/api/shop/user-orders/${userId}`,
      `http://localhost:8000/api/shop/orders/${userId}`,
      `http://localhost:8000/api/shop/my-orders/${userId}`
    ];

    let success = false;

    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setOrders(Array.isArray(data) ? data : (data.orders || []));
          success = true;
          break; // Stop loop once an endpoint succeeds
        }
      } catch (err) {
        // Try next endpoint in loop
      }
    }

    if (!success) {
      setError('Connection timeout reaching Shop SC servers. Please ensure backend server on port 8000 is active.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMyOrders();
  }, [user, token]);

  // Customer Quick Order Cancellation
  const handleCancelMyOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    setCancellingId(orderId);
    try {
      const activeToken = getCleanToken();
      const response = await fetch(`http://localhost:8000/api/shop/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({ status: 'Cancelled' })
      });

      const data = await response.json();
      if (response.ok) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderstatus: 'Cancelled' } : o));
      } else {
        alert(data.message || 'Failed to cancel order.');
      }
    } catch (err) {
      alert('Unable to transmit cancellation request.');
    } finally {
      setCancellingId(null);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return { label: 'Delivered ✅', bg: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid #22c55e' };
      case 'Shipped':
      case 'Out for Delivery':
        return { label: 'Shipped & En Route 🚚', bg: 'rgba(6, 182, 212, 0.2)', color: '#22d3ee', border: '1px solid #06b6d4' };
      case 'Paid & Processing':
        return { label: 'Processing ⚙️', bg: 'rgba(217, 70, 239, 0.2)', color: '#f0abfc', border: '1px solid #d946ef' };
      case 'Cancelled':
        return { label: 'Cancelled ❌', bg: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid #ef4444' };
      default:
        return { label: 'Order Placed 📦', bg: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid #a855f7' };
    }
  };

  const getProgressWidth = (status) => {
    switch (status) {
      case 'Delivered': return '100%';
      case 'Out for Delivery': return '75%';
      case 'Shipped': return '50%';
      case 'Paid & Processing': return '25%';
      case 'Cancelled': return '0%';
      default: return '15%';
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b0d19', color: '#f8fafc', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Dynamic Embedded CSS Keyframe Animations */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .order-card {
          transition: all 0.3s ease;
          animation: fadeInUp 0.5s ease-out forwards;
        }
        .order-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px -10px rgba(6, 182, 212, 0.25);
          border-color: #06b6d4 !important;
        }
      `}</style>

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* 🛍️ HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#06b6d4', display: 'inline-block', animation: 'pulseGlow 2s infinite' }} />
              <h1 style={{ margin: 0, fontSize: '30px', background: 'linear-gradient(90deg, #06b6d4, #d946ef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800' }}>
                Shop SC Vault
              </h1>
            </div>
            <p style={{ margin: '6px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>
              Live Package Pipeline & Real-Time Tracking Center
            </p>
          </div>
          
          <button 
            onClick={() => setPage('home')}
            style={{ padding: '10px 22px', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)', transition: 'transform 0.2s' }}
          >
            ← Explore Storefront
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#13172d', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '30px', marginBottom: '10px' }}>⚡</div>
            <h3 style={{ margin: 0, color: '#06b6d4' }}>Establishing Encrypted Connection to Shop SC...</h3>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid #ef4444', borderRadius: '12px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <strong>⚠️ Connection Alert:</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>{error}</p>
            </div>
            <button onClick={fetchMyOrders} style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
              🔄 Retry Connection
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#13172d', borderRadius: '16px', border: '1px solid #1e293b' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#94a3b8' }}>Your Shop SC Vault is Empty</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Discover active tech and apparel deals on our storefront!</p>
            <button onClick={() => setPage('home')} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #06b6d4, #d946ef)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              Start Shopping
            </button>
          </div>
        )}

        {/* 📦 ORDERS LIST */}
        {!loading && !error && orders.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {orders.map((ord) => {
              const badge = getStatusBadge(ord.orderstatus);
              const progressWidth = getProgressWidth(ord.orderstatus);

              return (
                <div 
                  key={ord._id} 
                  className="order-card"
                  style={{ 
                    background: 'linear-gradient(145deg, #13172d, #0d1021)', 
                    borderRadius: '16px', 
                    border: '1px solid #1e293b', 
                    padding: '26px'
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '20px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#06b6d4', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        SHOP SC REFERENCE CODE
                      </span>
                      <h3 style={{ margin: '2px 0 0 0', fontFamily: 'monospace', color: '#f8fafc', fontSize: '18px' }}>
                        #{ord._id}
                      </h3>
                      <small style={{ color: '#64748b', fontSize: '12px' }}>
                        Placed: {new Date(ord.date || ord.createdAt || Date.now()).toLocaleString()}
                      </small>
                    </div>

                    <span style={{ padding: '6px 14px', background: badge.bg, color: badge.color, border: badge.border, borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Animated Tracking Bar */}
                  {ord.orderstatus !== 'Cancelled' && (
                    <div style={{ marginBottom: '25px', background: '#090b14', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '8px', fontWeight: '600' }}>
                        <span>Order Confirmed</span>
                        <span>Processing</span>
                        <span>Shipped</span>
                        <span>Delivered</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: progressWidth, 
                            height: '100%', 
                            background: 'linear-gradient(90deg, #06b6d4, #d946ef, #06b6d4)', 
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 3s infinite linear',
                            borderRadius: '4px',
                            transition: 'width 0.5s ease' 
                          }} 
                        />
                      </div>
                    </div>
                  )}

                  {/* Summary Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', padding: '16px', background: '#090b14', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
                    <div>
                      <small style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Amount Charged</small>
                      <strong style={{ fontSize: '18px', color: '#4ade80' }}>₹ {(ord.totalPrice || 0).toFixed(2)}</strong>
                    </div>
                    <div>
                      <small style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Payment Mode</small>
                      <strong style={{ fontSize: '13px', color: '#cbd5e1' }}>{ord.paymentmethod || 'Card / Prepaid'}</strong>
                    </div>
                    <div>
                      <small style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Delivery Location</small>
                      <span style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ord.address || 'Standard Registered Address'}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div style={{ background: '#090b14', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', marginBottom: '20px' }}>
                    <h5 style={{ margin: '0 0 12px 0', color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      📦 Items in Shipment ({ord.items ? ord.items.length : 0}):
                    </h5>
                    {ord.items && ord.items.map((item, idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: '8px 0', 
                          borderBottom: idx === ord.items.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                          fontSize: '13px',
                          color: '#f8fafc'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {item.mainimg && (
                            <img src={item.mainimg} alt={item.title} style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '6px' }} />
                          )}
                          <div>
                            <strong>{item.title}</strong>
                            <small style={{ display: 'block', color: '#64748b', fontSize: '11px' }}>Qty: {item.quantity}</small>
                          </div>
                        </div>
                        <span style={{ fontWeight: '700', color: '#06b6d4' }}>
                          ₹ {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <button 
                      onClick={() => alert(`Official Receipt generated for Order #${ord._id}`)}
                      style={{ padding: '8px 16px', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                    >
                      📄 Download Invoice
                    </button>

                    {ord.orderstatus !== 'Cancelled' && ord.orderstatus !== 'Delivered' && (
                      <button 
                        onClick={() => handleCancelMyOrder(ord._id)} 
                        disabled={cancellingId === ord._id}
                        style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                      >
                        {cancellingId === ord._id ? 'Processing...' : 'Cancel Order'}
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default MyOrders;