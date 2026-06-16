import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// 1. USER SCHEMA (With Security & Recovery Fields)
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    usertype: { type: String, default: 'user' },
    otp: { type: String, default: null },         
    otpExpires: { type: Date, default: null }     
});

// Automatic Password Hashing Hook before saving to DB (FIXED for modern Mongoose)
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// 2. PRODUCT INVENTORY SCHEMA
const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    mainimg: { type: String, default: '' }
});

// 3. SHOPPING CART SCHEMA
const cartSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    mainimg: { type: String, default: '' },
    quantity: { type: Number, default: 1 }
});

// 4. ORDER HISTORY SCHEMA
const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    address: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    paymentmethod: { type: String, required: true },
    orderstatus: { type: String, default: 'Paid & Processing' },
    date: { type: Date, default: Date.now }
});

// Exporting All Models
export const User = mongoose.model('User', userSchema);
export const Product = mongoose.model('Product', productSchema);
export const Cart = mongoose.model('Cart', cartSchema);
export const Orders = mongoose.model('Orders', orderSchema);