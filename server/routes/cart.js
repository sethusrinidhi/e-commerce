import express from 'express';
import { Cart } from '../models/Schemas.js'; 
import { verifyUser } from '../middleware/auth.js';

const router = express.Router();

// ==========================================
// 🛒 ADD ITEM TO CART ROUTE
// ==========================================
const handleAddToCart = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized session' });
        }

        const { title, price, mainimg, quantity = 1 } = req.body;

        if (!title || price === undefined) {
            return res.status(400).json({ success: false, message: 'Product title and price are required' });
        }

        // Check if item already exists in user's cart
        let cartItem = await Cart.findOne({ userId, title });

        if (cartItem) {
            cartItem.quantity += Number(quantity);
            await cartItem.save();
        } else {
            cartItem = new Cart({
                userId,
                title,
                price,
                mainimg: mainimg || '',
                quantity: Number(quantity)
            });
            await cartItem.save();
        }

        const updatedCart = await Cart.find({ userId });
        return res.status(200).json({ 
            success: true, 
            message: 'Item added to bag successfully! ✨', 
            cart: updatedCart 
        });

    } catch (error) {
        console.error("Error adding to cart:", error);
        return res.status(500).json({ success: false, message: 'Server error adding item to cart', error: error.message });
    }
};

// Support both /add and root / endpoints for flexibility
router.post('/add', verifyUser, handleAddToCart);
router.post('/', verifyUser, handleAddToCart);

// (Keep your delete routes below...)
export default router;