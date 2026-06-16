import mongoose from 'mongoose';
import { Product, Cart } from './models/Schemas.js'; // 👈 Added Cart import here

// Replace this connection string if your database name or URI is different
const MONGO_URI = "mongodb://localhost:27017/ShopEZ" || "mongodb://127.0.0.1:27017/ShopEZ";

const mockProducts = [
    // 📱 HIGH-END PHONES (ULTRA LUXURY TECH)
    {
        title: "Apple iPhone 16 Pro Max",
        description: "Titanium design, A18 Pro chip, Camera Control, and monumental battery life.",
        price: 199999,
        mainimg: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=60"
    },
    {
        title: "Apple iPhone 16 Plus",
        description: "Super-bright Super Retina XDR display powered by the ultra-fast A18 chip.",
        price: 89999,
        mainimg: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=500&auto=format&fit=crop&q=60"
    },
    {
        title: "Samsung Galaxy S26 Ultra",
        description: "Built-in S Pen, 200MP ultimate camera setup, and extreme Galaxy AI performance optimization.",
        price: 129999,
        mainimg: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=60"
    },
    // 👦 HIGH-FASHION BOYS COUTURE (₹10,000+)
    {
        title: "Boys Atelier Premium Varsity Jacket",
        description: "Limited edition luxury streetwear varsity jacket, woven with Italian leather accents and gold-threaded embroidery.",
        price: 24500,
        mainimg: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=500&auto=format&fit=crop&q=60"
    },
    {
        title: "Boys Savile Row Bespoke Suit Set",
        description: "Sharp bespoke 3-piece formal evening suit tuxedo, masterfully tailored using 100% fine Merino virgin wool.",
        price: 45999,
        mainimg: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500&auto=format&fit=crop&q=60"
    },
    // 👧 HIGH-FASHION GIRLS COUTURE (₹10,000+)
    {
        title: "Girls Royal Pastel Silk Gown",
        description: "Elegant layered silk tulle mesh party gown, individually hand-decorated with Swarovski crystal floral embroidery.",
        price: 38000,
        mainimg: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=500&auto=format&fit=crop&q=60"
    },
    {
        title: "Girls Runway Luxury Wool Trench Coat",
        description: "High-grade premium double-breasted winter overcoat, stylishly lined with signature mulberry silk insulation.",
        price: 29000,
        mainimg: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=500&auto=format&fit=crop&q=60"
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to database for seeding luxury collection...");
        
        // 🗑️ WIPES OUT THE OLD WRONG PRICED STUCK CART ITEMS!
        if (Cart) {
            await Cart.deleteMany({});
        } else {
            await mongoose.connection.collection('carts').deleteMany({});
        }
        console.log("🧹 Stale/glitched shopping bags emptied successfully!");
        
        // Clear existing low-rate items
        await Product.deleteMany({});
        
        // Insert the high-rate premium luxury catalog items
        await Product.insertMany(mockProducts);
        console.log("🚀 Elite Million-Tier Catalog Seeded Successfully with Premium Luxury Goods!");
        
        mongoose.connection.close();
    } catch (error) {
        console.error("Seeding failed:", error);
    }
};

seedDatabase();