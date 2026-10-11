import React, { useEffect, useState } from 'react';

const AdminOrders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAllOrders = async () => {
    try {
      let activeToken = token || localStorage.getItem('token');
      if (activeToken && activeToken.startsWith('"') && activeToken.endsWith('"')) {
        activeToken = activeToken.slice(1, -1);
      }

      // Updated to match your backend route prefix
      const response = await fetch('http://localhost:8000/api/shop/all-orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        }
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setOrders(data.orders || []);
      } else {
        setError(data.message || 'Failed to fetch admin orders');
      }
    } catch (err) {
      setError('Connection error reaching server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      let activeToken = token || localStorage.getItem('token');
      if (activeToken && activeToken.startsWith('"') && activeToken.endsWith('"')) {
        activeToken = activeToken.slice(1, -1);
      }

      // Aligned with your backend route: router.put('/update-status/:id', ...)
      const response = await fetch(`http://localhost:8000/api/shop/update-status/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({ orderstatus: newStatus })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // Update local state smoothly
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? { ...order, orderstatus: newStatus } : order
          )
        );
        alert(`Order status updated to "${newStatus}"!`);
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Unable to send status change instruction to server.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading system orders...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', padding: '40px' }}>⚠️ {error}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        <h2 style={{ margin: '0 0 5px 0' }}>
          🛠️ Admin Order Control Panel
        </h2>
        <p style={{ margin: '0', color: '#666', fontSize: '13px' }}>
          📋 System Order Pipeline — Dispatch shipping packages, monitor checkout totals, and process quick cancellations
        </p>
      </div>

      {orders.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>No orders found in database.</p>
      ) : (
        orders.map((order) => (
          <div 
            key={order._id} 
            style={{ 
              border: '1px solid #ccc', 
              borderRadius: '8px', 
              padding: '20px', 
              marginBottom: '25px', 
              background: '#fcfcfc',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px', gap: '10px' }}>
              <div>
                <strong>Order ID:</strong> <span style={{ fontFamily: 'monospace' }}>{order._id}</span>
              </div>
              <div>
                <strong>Placed:</strong> {new Date(order.date).toLocaleString()}
              </div>
            </div>

            {/* Address and total */}
            <div style={{ marginBottom: '15px', fontSize: '15px' }}>
              <p style={{ margin: '0 0 5px 0' }}><strong>Customer ID:</strong> {order.userId}</p>
              <p style={{ margin: '0 0 5px 0' }}><strong>Shipping Address:</strong> {order.address}</p>
              <p style={{ margin: '0 0 5px 0' }}><strong>Payment Method:</strong> {order.paymentmethod}</p>
              <p style={{ margin: '0', color: '#28a745', fontSize: '18px' }}>
                <strong>Revenue:</strong> ₹{order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}
              </p>
            </div>

            {/* Product Items */}
            <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '4px', padding: '10px', marginBottom: '15px' }}>
              <strong style={{ display: 'block', marginBottom: '10px' }}>Items Summary:</strong>
              {order.items && order.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px', borderBottom: '1px dashed #eee', paddingBottom: '5px' }}>
                  <span>{item.title} <strong>(x{item.quantity})</strong></span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Status Manager Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#e9ecef', padding: '10px 15px', borderRadius: '6px' }}>
              <strong>Manage Status:</strong>
              <select 
                value={order.orderstatus || 'Placed'} 
                disabled={updatingId === order._id}
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                style={{ 
                  padding: '6px 12px', 
                  borderRadius: '4px', 
                  border: '1px solid #aaa', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  backgroundColor: '#fff'
                }}
              >
                <option value="Placed">Placed 📦</option>
                <option value="Paid & Processing">Paid & Processing ⚙️</option>
                <option value="Shipped">Shipped 🚚</option>
                <option value="Delivered">Delivered ✅</option>
                <option value="Cancelled">Cancelled ❌</option>
              </select>

              {updatingId === order._id && <span style={{ fontSize: '12px', color: '#666' }}>Updating...</span>}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminOrders;