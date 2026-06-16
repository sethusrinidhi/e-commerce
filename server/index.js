import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import shopRoutes from './routes/shopRoutes.js'; // <-- Added this line

// Load environment configurations
dotenv.config();

const app = express();

// Middleware 
app.use(express.json()); 
app.use(cors());        

// Use our ShopEZ API routes
app.use('/api', shopRoutes); // <-- Added this line. All routes now start with /api

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