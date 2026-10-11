import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import shopRoutes from './routes/shopRoutes.js'; 
import cartRoutes from './routes/cart.js'; 
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();

const app = express();

app.use(express.json()); 
app.use(cors());        

// Mount routers with distinct namespaces
app.use('/api/shop', shopRoutes);       
app.use('/api/cart', cartRoutes);       
app.use('/api/orders', orderRoutes);    

app.get('/', (req, res) => {
    res.send("ShopEZ Backend Server is Running Successfully!");
});

const PORT = process.env.PORT || 8000;
const mongoURI = "mongodb://127.0.0.1:27017/ShopEZ";

mongoose.connect(mongoURI)
    .then(() => {
        console.log("Connected to MongoDB successfully.");
        app.listen(PORT, () => {
            console.log(`App server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database connection failed:", error.message);
    });