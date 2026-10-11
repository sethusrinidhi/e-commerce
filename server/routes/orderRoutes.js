import express from 'express';
import { Orders, Cart } from '../models/Schemas.js';
import { verifyUser, verifyAdmin } from '../middleware/auth.js'; 

const router = express.Router();

// ==========================================
// 1. GET ALL ORDERS FOR LOGGED-IN USER
// ==========================================
router.get('/my-orders', verifyUser, async (req, res) => {
    try {
        const rawId = req.user.id || req.user._id;
        if (!rawId) {
            return res.status(400).json({ success: false, message: 'Invalid session' });
        }
        const userIdStr = rawId.toString();

        const orderHistory = await Orders.find({
            $or: [{ userId: userIdStr }, { userId: rawId }]
        }).sort({ date: -1 });

        return res.status(200).json({ success: true, orders: orderHistory });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching history', error: error.message });
    }
});

// ==========================================
// 2. CHECKOUT & CREATE NEW ORDER
// ==========================================
router.post('/checkout', verifyUser, async (req, res) => {
    try {
        const rawId = req.user.id || req.user._id;
        if (!rawId) return res.status(400).json({ success: false, message: 'Auth expired' });
        
        const userId = rawId.toString();
        const { address, paymentmethod } = req.body;

        if (!address || !paymentmethod) {
            return res.status(400).json({ success: false, message: 'Details required' });
        }

        const cartItems = await Cart.find({ $or: [{ userId: userId }, { userId: rawId }] });

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        let totalPrice = 0;
        const itemsForOrder = cartItems.map(item => {
            totalPrice += item.price * item.quantity;
            return { title: item.title, price: item.price, quantity: item.quantity, mainimg: item.mainimg };
        });

        // 🎯 PROFESSIONAL E-COMMERCE PAYMENT STATUS LOGIC
        // Online payments (Card / PhonePe) are marked as 'Paid' instantly.
        // Cash on Delivery stays 'Placed' for the delivery boy to collect cash.
        let initialStatus = 'Placed';
        if (paymentmethod === 'Card' || paymentmethod === 'PhonePe') {
            initialStatus = 'Paid';
        }

        const newOrder = new Orders({
            userId: userId, 
            address,
            items: itemsForOrder,
            totalPrice,
            paymentmethod,
            orderstatus: initialStatus,
            date: new Date()
        });

        const savedOrder = await newOrder.save();
        await Cart.deleteMany({ $or: [{ userId: userId }, { userId: rawId }] });

        return res.status(201).json({ success: true, message: 'Order processed!', order: savedOrder });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Checkout failed', error: error.message });
    }
});

// ==========================================
// 3. ADMIN: GET ALL ORDERS
// ==========================================
router.get('/all-orders', verifyAdmin, async (req, res) => {
    try {
        const allOrders = await Orders.find({}).sort({ date: -1 });
        return res.status(200).json({ success: true, orders: allOrders });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Admin fetch error', error: error.message });
    }
});

// ==========================================
// 4. ADMIN: UPDATE ORDER STATUS
// ==========================================
router.put('/update-status/:id', verifyAdmin, async (req, res) => {
    try {
        const { orderstatus } = req.body;
        const orderId = req.params.id;

        const updatedOrder = await Orders.findByIdAndUpdate(
            orderId,
            { orderstatus },
            { new: true }
        );

        if (!updatedOrder) return res.status(404).json({ success: false, message: 'Order not found' });

        return res.status(200).json({ success: true, message: 'Updated!', order: updatedOrder });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Update failed', error: error.message });
    }
});

export default router;