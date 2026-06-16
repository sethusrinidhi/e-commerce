import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import shopRoutes from './routes/shopRoutes.js'; 
import cartRoutes from './routes/cart.js'; // 👈 1. Added your Cart router import here

// Load environment configurations
dotenv.config();

const app = express();

// Middleware 
app.use(express.json()); 
app.use(cors());        

// Use our ShopEZ API routes
app.use('/api', shopRoutes); 
app.use('/api', cartRoutes); // 👈 2. Added this line! Your backend will now accept /api/cart/remove/:id

// Default testing route
app.get('/', (req, res) => {
    res.send("ShopEZ Backend Server is Running Successfully!");
});

// Port configuration
const PORT = process.env.PORT || 8000;

// Connect to MongoDB and start the server
const mongoURI = "mongodb://127.0.0.1:27017/ShopEZ";
mongoose.connect(mongoURI)
    .then(() => {
        console.log("Connected to your MongoDB database successfully.");
        app.listen(PORT, () => {
            console.log(`App server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database connection failed:", error.message);
    });