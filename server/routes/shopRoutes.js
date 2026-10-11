import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, Product, Cart, Orders } from '../models/Schemas.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_KEY_DONT_SHARE";

// ==========================================
// 🛡️ IMPROVED MIDDLEWARE
// ==========================================
const verifyUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Access Denied: No token" });
    const token = authHeader.replace('Bearer ', '');
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        return res.status(403).json({ message: "Session expired" });
    }
};

const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Access Denied: No token" });
    const token = authHeader.replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.usertype !== 'admin') return res.status(403).json({ message: "Admin only" });
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Session expired" });
    }
};

// ==========================================
// 1. AUTHENTICATION (REGISTER & LOGIN)
// ==========================================
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, usertype } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists!" });

        const newUser = new User({ username, email, password, usertype: usertype || 'user' });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(401).json({ message: "Invalid email or password!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid email or password!" });

        const token = jwt.sign({ id: user._id, usertype: user.usertype }, JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ 
            success: true,
            message: "Authentication Successful", 
            token, 
            user: { id: user._id, username: user.username, email: user.email, usertype: user.usertype } 
        });
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({ message: err.message });
    }
});

// ==========================================
// 1B. PASSWORD RESET
// ==========================================
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "No account found." });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
        await user.save();
        console.log(`OTP for ${email}: ${otp}`);
        res.status(200).json({ message: "OTP sent to console." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({ email, otp, otpExpires: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });
        user.password = newPassword;
        user.otp = null;
        user.otpExpires = null;
        await user.save();
        res.status(200).json({ message: "Password updated." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ==========================================
// 2. PRODUCTS
// ==========================================
router.get('/products', async (req, res) => {
    try { 
        const products = await Product.find(); 
        res.status(200).json(products); 
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
});

// 🌟 SINGLE PRODUCT DETAILS LOOKUP ROUTE
router.get('/products/:id', async (req, res) => {
    try {
        const requestedId = req.params.id;
        let product = null;

        if (requestedId && requestedId.match(/^[0-9a-fA-F]{24}$/)) {
            product = await Product.findById(requestedId);
        }

        if (!product) {
            product = await Product.findOne({ 
                $or: [{ id: requestedId }, { _id: requestedId }] 
            });
        }

        if (!product) {
            return res.status(404).json({ success: false, message: "Product specs could not be located." });
        }

        res.status(200).json(product);
    } catch (err) {
        console.error("Error fetching product by ID:", err);
        res.status(500).json({ message: err.message });
    }
});

router.post('/admin/add-product', verifyAdmin, async (req, res) => {
    try { 
        const newProduct = new Product(req.body); 
        await newProduct.save(); 
        res.status(201).json(newProduct); 
    } catch (err) { 
        res.status(400).json({ message: err.message }); 
    }
});

// ==========================================
// 3. CART
// ==========================================
router.post('/cart/add', verifyUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, price, mainimg, quantity = 1, variant } = req.body;

        let cartItem = await Cart.findOne({ userId, title, variant });

        if (cartItem) {
            cartItem.quantity += Number(quantity);
            await cartItem.save();
        } else {
            cartItem = new Cart({
                userId,
                title,
                price,
                mainimg: mainimg || '',
                quantity: Number(quantity),
                variant: variant || ''
            });
            await cartItem.save();
        }

        const updatedCart = await Cart.find({ userId });
        res.status(200).json({ success: true, message: "Added to cart successfully!", cart: updatedCart });
    } catch (err) {
        console.error("Cart add error:", err);
        res.status(400).json({ success: false, message: err.message });
    }
});

router.get('/cart/:userId', verifyUser, async (req, res) => {
    try { 
        const items = await Cart.find({ userId: req.params.userId }); 
        res.status(200).json(items); 
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
});

// ==========================================
// 4. ORDERS & USER VAULT
// ==========================================
router.post('/orders/checkout', verifyUser, async (req, res) => {
    try {
        const cartItems = await Cart.find({ userId: req.user.id });
        const total = cartItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
        
        const newOrder = new Orders({ 
            userId: req.user.id, 
            address: req.body.shippingAddress, 
            items: cartItems, 
            totalPrice: total, 
            paymentmethod: req.body.paymentMethod, 
            orderstatus: req.body.paymentMethod === 'COD' ? 'Placed' : 'Paid' 
        });
        
        await newOrder.save();
        await Cart.deleteMany({ userId: req.user.id });
        res.status(200).json({ success: true, orderId: newOrder._id });
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
});

// GET USER ORDERS BY PARAMETER
router.get('/user-orders/:userId', verifyUser, async (req, res) => {
    try {
        const history = await Orders.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders: history });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET MY ORDERS VIA JWT USER ID
router.get('/orders/my-orders', verifyUser, async (req, res) => {
    try {
        const history = await Orders.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders: history });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// USER CANCEL ORDER
router.put('/orders/:id/cancel', verifyUser, async (req, res) => {
    try {
        const order = await Orders.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { orderstatus: "Cancelled" }, { new: true });
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.status(200).json({ success: true, message: "Order cancelled successfully", order });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ==========================================
// 5. ADMIN ORDERS PIPELINE
// ==========================================
router.get('/admin/orders', verifyAdmin, async (req, res) => {
    try {
        const orders = await Orders.find().sort({ createdAt: -1 }); 
        res.status(200).json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ADMIN UPDATE ORDER STATUS
router.put('/admin/orders/:id/status', verifyAdmin, async (req, res) => {
    try {
        const { orderstatus } = req.body;
        const updatedOrder = await Orders.findByIdAndUpdate(
            req.params.id,
            { orderstatus },
            { new: true }
        );
        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        res.json({ success: true, order: updatedOrder });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==========================================
// 6. WISHLIST
// ==========================================
router.post('/wishlist/add', verifyUser, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { $addToSet: { wishlist: req.body.productId } });
        res.status(200).json({ message: "Added to wishlist" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;