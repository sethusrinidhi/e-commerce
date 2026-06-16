import express from 'express';
const router = express.Router();
import { Cart } from '../models/Schemas.js'; // 🔥 Uses your central collection schema

// 🗑️ DELETE ROUTE: Removes a specific item from the cart collection by its unique ID
router.delete('/cart/remove/:id', async (req, res) => {
    try {
        const itemId = req.params.id;
        let deletedItem = null;
        
        // 1. Try deleting by a standard 24-character MongoDB ObjectId structure first
        if (itemId.match(/^[0-9a-fA-F]{24}$/)) {
            deletedItem = await Cart.findByIdAndDelete(itemId);
        }
        
        // 2. Fallback: If it's an old stuck item without a traditional cart document ID, match via Title string to force delete it!
        if (!deletedItem) {
            deletedItem = await Cart.deleteOne({ title: itemId });
        }
        
        // Return a success response back to your React app
        res.status(200).json({ message: "Item successfully removed from cart! ✨" });
    } catch (err) {
        console.error("Error deleting cart item:", err);
        res.status(500).json({ error: "Internal server error. Could not drop item. 🥺" });
    }
});

// 👑 THE CRUCIAL FIX: Uses modern export default so index.js can import it perfectly
export default router;