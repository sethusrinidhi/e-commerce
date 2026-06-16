import mongoose from 'mongoose';
import { Product } from './models/Schemas.js';

// Replace this connection string if your database name or URI is different
const MONGO_URI = "mongodb://localhost:27017/ShopEZ" || "mongodb://127.0.0.1:27017/ShopEZ";

const mockProducts = [
    // 📱 HIGH-END PHONES
    {
        title: "Apple iPhone 16 Pro Max",
        description: "Titanium design, A18 Pro chip, Camera Control, and monumental battery life.",
        price: 1199,
        mainimg: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=60"
    },
    {
        title: "Apple iPhone 16 Plus",
        description: "Super-bright Super Retina XDR display powered by the ultra-fast A18 chip.",
        price: 899,
        mainimg: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=500&auto=format&fit=crop&q=60"
    },
    {
        title: "Samsung Galaxy S26 Ultra",
        description: "Built-in S Pen, 200MP ultimate camera setup, and extreme Galaxy AI performance optimization.",
        price: 1299,
        mainimg: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=60"
    },
    // 👦 BOYS CLOTHING
    {
        title: "Boys Premium Varsity Jacket",
        description: "Classic urban streetwear varsity bomber jacket woven with premium cotton blends.",
        price: 85,
        mainimg: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=500&auto=format&fit=crop&q=60"
    },
    {
        title: "Boys Designer Slim-Fit Suit Set",
        description: "Sharp 3-piece formal evening suit tuxedo tailored perfectly for young gentlemen.",
        price: 150,
        mainimg: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500&auto=format&fit=crop&q=60"
    },
    // 👧 GIRLS CLOTHING
    {
        title: "Girls Royal Pastel Princess Dress",
        description: "Elegant layered tulle mesh party gown decorated with beautiful floral embroidery.",
        price: 120,
        mainimg: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=500&auto=format&fit=crop&q=60"
    },
    {
        title: "Girls Designer Autumn Trench Coat",
        description: "High-grade luxury double-breasted winter overcoat stylishly tailored with premium wool lining.",
        price: 95,
        mainimg: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=500&auto=format&fit=crop&q=60"
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to database for seeding...");
        
        // Clear existing empty or old products
        await Product.deleteMany({});
        
        // Insert luxury catalog items
        await Product.insertMany(mockProducts);
        console.log("🚀 Premium Catalog Seeded Successfully with iPhones and Clothes!");
        
        mongoose.connection.close();
    } catch (error) {
        console.error("Seeding failed:", error);
    }
};

seedDatabase();