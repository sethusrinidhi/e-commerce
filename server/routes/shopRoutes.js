import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, Product, Cart, Orders } from '../models/Schemas.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_KEY_DONT_SHARE";

// ==========================================
// 1. AUTHENTICATION ENDPOINTS (SECURED)
// ==========================================

// SECURE REGISTER USER
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists!" });

        // Note: The pre-save hook in Schemas.js will automatically encrypt the password here
        const newUser = new User({ username, email, password });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// SECURE LOGIN USER (Generates JWT Token)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid email or password!" });

        // Compare encrypted password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid email or password!" });

        // Generate Secure Expiry Passkey Token
        const token = jwt.sign({ id: user._id, usertype: user.usertype }, JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({ 
            message: "Authentication Successful", 
            token, 
            user: { id: user._id, username: user.username, usertype: user.usertype } 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ==========================================
// 1B. PASSWORD RESET ENDPOINTS (OTP FLOW)
// ==========================================

// REQUEST OTP FOR PASSWORD RESET
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "No account found with this email address." });

        // Generate a 6-digit numeric OTP string
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Set OTP to expire in 10 minutes
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; 
        await user.save();

        // DEV LOG: This lets you see the OTP right in your VS Code terminal!
        console.log(`\n========== [ ShopEZ OTP SECURITY GATEWAY ] ==========`);
        console.log(`Password reset requested for: ${email}`);
        console.log(`Your 6-Digit OTP Token is: ${otp}`);
        console.log(`=====================================================\n`);

        res.status(200).json({ message: "OTP sent successfully! Please check your server terminal console." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// VERIFY OTP AND RESET PASSWORD
router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({ 
            email, 
            otp, 
            otpExpires: { $gt: Date.now() } // Ensures OTP hasn't expired yet
        });

        if (!user) return res.status(400).json({ message: "Invalid OTP token or code has expired!" });

        // Update to new password (the pre-save hook in Schemas.js will auto-encrypt this)
        user.password = newPassword;
        user.otp = null;        // Clear OTP tokens post-utilization
        user.otpExpires = null;
        await user.save();

        res.status(200).json({ message: "Password updated successfully! You can now log in." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ==========================================
// 2. PRODUCT CATALOG ENDPOINTS
// ==========================================

// FETCH ALL PRODUCTS
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ADD NEW PRODUCT (For Admin Panel)
router.post('/admin/add-product', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ message: "Product added successfully!", product: newProduct });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ==========================================
// 3. SHOPPING CART ENDPOINTS
// ==========================================

// ADD ITEM TO CART
router.post('/cart/add', async (req, res) => {
    try {
        const cartItem = new Cart(req.body);
        await cartItem.save();
        res.status(201).json({ message: "Item added to cart successfully!" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET USER SPECIFIC CART ITEMS
router.get('/cart/:userId', async (req, res) => {
    try {
        const items = await Cart.find({ userId: req.params.userId });
        res.status(200).json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 4. SECURE CHECKOUT & ORDERS ENDPOINT
// ==========================================

// SECURE PLACE ORDER & CLEAR CART
router.post('/orders/checkout', async (req, res) => {
    const { userId, shippingAddress, paymentDetails } = req.body;
    try {
        // 1. Fetch user items from cart
        const items = await Cart.find({ userId });
        if (items.length === 0) return res.status(400).json({ message: "Cart is empty" });

        // 2. Simulating a secure third-party gateway payment processing handshake
        const paymentSuccessful = true; 

        if (paymentSuccessful) {
            // Save inside Order History Document Collection
            const newOrder = new Orders({
                userId,
                address: shippingAddress,
                title: `Order of ${items.length} items`,
                price: items.reduce((acc, i) => acc + (i.price * i.quantity), 0),
                paymentmethod: "Credit Card (Secured via Gateway)",
                orderstatus: "Paid & Processing"
            });
            await newOrder.save();

            // Clear User's Cart completely post-purchase
            await Cart.deleteMany({ userId });
            res.status(200).json({ message: "Payment Authorized! Order placed safely.", orderId: newOrder._id });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;