const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Define the schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,  // This creates an index automatically
        trim: true,
        lowercase: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email address']
    },
    password: { 
        type: String, 
        required: true 
    },
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    // Financial information
    nonCurrentAssets: {
        type: Number,
        default: 0
    },
    nonCurrentAssetsDesc: {
        type: String,
        default: ''
    },
    liabilities: {
        type: Number,
        default: 0
    },
    liabilitiesDesc: {
        type: String,
        default: ''
    },
    equity: {
        type: Number,
        default: 0
    },
    equityDesc: {
        type: String,
        default: ''
    },
    currency: {
        type: String,
        enum: ['USD', 'LKR', 'INR', 'CAD', 'AUD'],
        default: 'USD'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
});

// Hash password before saving the user document
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Add index for better query performance (only on businessName since email is already indexed)
userSchema.index({ businessName: 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;
