import React, { useState } from 'react';
import axios from 'axios';

const Admin = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [mainimg, setMainimg] = useState('');
    const [message, setMessage] = useState('');

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const res = await axios.post('http://localhost:8000/api/admin/add-product', {
                title, description, price: Number(price), mainimg
            });
            setMessage(res.data.message);
            setTitle(''); setDescription(''); setPrice(''); setMainimg('');
        } catch (err) {
            setMessage("Failed to register item.");
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '40px auto', padding: '30px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'sans-serif' }}>
            <h2>Admin Control Panel (Add Inventory)</h2>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="text" placeholder="Product Title" value={title} onChange={(e) => setTitle(e.target.value)} required style={formInput} />
                <textarea placeholder="Product Description" value={description} onChange={(e) => setDescription(e.target.value)} required style={{ ...formInput, height: '80px' }} />
                <input type="number" placeholder="Price ($)" value={price} onChange={(e) => setPrice(e.target.value)} required style={formInput} />
                <input type="text" placeholder="Image URL (e.g. https://images.unsplash.com/...)" value={mainimg} onChange={(e) => setMainimg(e.target.value)} style={formInput} />
                <button type="submit" style={{ padding: '12px', background: '#292b2c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Publish Item Live
                </button>
            </form>
            {message && <p style={{ marginTop: '15px', color: 'green', fontWeight: 'bold' }}>{message}</p>}
        </div>
    );
};

const formInput = { padding: '10px', fontSize: '15px', borderRadius: '4px', border: '1px solid #ccc' };

export default Admin;