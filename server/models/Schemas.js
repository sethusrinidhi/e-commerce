import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ==========================================
// 1. USER SCHEMA
// ==========================================
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    usertype: { type: String, enum: ['user', 'admin'], default: 'user' },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null }
}, {
    timestamps: true,
    toJSON: {
        transform(doc, ret) {
            delete ret.password;
            delete ret.otp;
            delete ret.otpExpires;
            delete ret.__v;
            return ret;
        }
    }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) return next();
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (err) {
        next(err);
    }
});

// ==========================================
// 2. PRODUCT SCHEMA
// ==========================================
const productSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    detailedDescription: String,
    price: { type: Number, required: true, min: [0, 'Price cannot be negative'] },
    mainimg: { type: String, default: '' },
    gallery: [{ type: String, default: [] }],
    stock: { type: Number, required: true, default: 0, min: [0, 'Stock cannot be negative'] },
    specifications: { type: Map, of: String, default: {} }
}, { timestamps: true });

// ==========================================
// 3. CART SCHEMA
// ==========================================
const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    mainimg: { type: String, default: '' },
    quantity: { type: Number, default: 1, min: 1 }
}, { timestamps: true });

// ==========================================
// 4. ORDER SCHEMA
// ==========================================
const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    address: { type: String, required: true },
    items: [{
        title: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        mainimg: { type: String }
    }],
    totalPrice: { type: Number, required: true },
    paymentmethod: { type: String, required: true, trim: true },
    orderstatus: { 
        type: String, 
        enum: ['Placed', 'Paid', 'Paid & Processing', 'Shipped', 'Delivered', 'Cancelled'], 
        default: 'Placed' 
    },
    trackingNumber: {
        type: String,
        default: () => 'TRK-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000)
    },
    estimatedDelivery: {
        type: Date,
        default: () => new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
    }
}, { timestamps: true });

// ==========================================
// MODELS EXPORT
// ==========================================
export const User = mongoose.model('User', userSchema);
export const Product = mongoose.model('Product', productSchema);
export const Cart = mongoose.model('Cart', cartSchema);
export const Orders = mongoose.model('Orders', orderSchema);