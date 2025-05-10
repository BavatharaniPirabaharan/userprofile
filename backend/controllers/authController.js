const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Register User
const registerUser = async (req, res) => {
    const { 
        firstName, 
        lastName, 
        email, 
        password, 
        businessName, 
        phoneNumber,
        nonCurrentAssets,
        nonCurrentAssetsDesc,
        liabilities,
        liabilitiesDesc,
        equity,
        equityDesc,
        currency
    } = req.body;

    console.log('Registration attempt with email:', email);

    // Initialize errors object for field-specific validation
    const errors = {};

    // Check if required fields are provided
    if (!firstName) errors.firstName = "First name is required";
    if (!lastName) errors.lastName = "Last name is required";
    if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";
    if (!businessName) errors.businessName = "Business name is required";
    if (!phoneNumber) errors.phoneNumber = "Phone number is required";

    // Validate email format if provided
    if (email && !email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
        errors.email = "Please enter a valid email address";
    }

    // Validate password length if provided
    if (password && password.length < 6) {
        errors.password = "Password must be at least 6 characters long";
    }

    // Validate phone number format if provided
    if (phoneNumber && !phoneNumber.match(/^[0-9]{10}$/)) {
        errors.phoneNumber = "Please enter a valid phone number (10 digits)";
    }

    // If there are validation errors, return them
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ 
            success: false,
            message: "Validation failed", 
            errors 
        });
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        console.log('Existing user check:', existingUser);
        
        if (existingUser) {
            return res.status(409).json({ 
                success: false,
                message: "User with this email already exists" 
            });
        }

        // Create a new user
        const newUser = new User({ 
            firstName,
            lastName,
            email, 
            password: password,
            businessName,
            phoneNumber,
            nonCurrentAssets: nonCurrentAssets ? Number.parseFloat(nonCurrentAssets) : 0,
            nonCurrentAssetsDesc: nonCurrentAssetsDesc || '',
            liabilities: liabilities ? Number.parseFloat(liabilities) : 0,
            liabilitiesDesc: liabilitiesDesc || '',
            equity: equity ? Number.parseFloat(equity) : 0,
            equityDesc: equityDesc || '',
            currency: currency || 'USD'
        });

        console.log('New user object created:', newUser);

        // Save the new user to the database
        const savedUser = await newUser.save();
        console.log('User saved successfully:', savedUser);

        // Generate JWT token
        const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', {
            expiresIn: "1h"
        });

        res.status(201).json({ 
            success: true,
            message: "User registered successfully",
            data: {
                token,
                user: {
                    id: savedUser._id,
                    firstName: savedUser.firstName,
                    lastName: savedUser.lastName,
                    email: savedUser.email,
                    businessName: savedUser.businessName,
                    phoneNumber: savedUser.phoneNumber,
                    nonCurrentAssets: savedUser.nonCurrentAssets,
                    nonCurrentAssetsDesc: savedUser.nonCurrentAssetsDesc,
                    liabilities: savedUser.liabilities,
                    liabilitiesDesc: savedUser.liabilitiesDesc,
                    equity: savedUser.equity,
                    equityDesc: savedUser.equityDesc,
                    currency: savedUser.currency
                }
            }
        });
    } catch (error) {
        console.error("Registration error details:", error);
        
        // Handle specific MongoDB errors
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            for (const key of Object.keys(error.errors)) {
                validationErrors[key] = error.errors[key].message;
            }
            return res.status(400).json({ 
                success: false,
                message: "Validation failed", 
                errors: validationErrors 
            });
        }
        
        // Handle other errors
        res.status(500).json({ 
            success: false,
            message: "Server error during registration",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Login User
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Initialize errors object for field-specific validation
    const errors = {};

    // Check if email and password are provided
    if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";

    // If there are validation errors, return them
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ 
            success: false,
            message: "Validation failed", 
            errors 
        });
    }

    try {
        // Find user by email
        const user = await User.findOne({ email });
        console.log('User found:', user ? 'Yes' : 'No');
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid email or password" 
            });
        }

        // Compare the password using the model method
        const isMatch = await user.comparePassword(password);
        console.log('Password match:', isMatch ? 'Yes' : 'No');
        
        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid email or password" 
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', {
            expiresIn: "1h"
        });

        res.status(200).json({
            success: true,
            data: {
                token: token,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    businessName: user.businessName,
                    phoneNumber: user.phoneNumber,
                    nonCurrentAssets: user.nonCurrentAssets,
                    nonCurrentAssetsDesc: user.nonCurrentAssetsDesc,
                    liabilities: user.liabilities,
                    liabilitiesDesc: user.liabilitiesDesc,
                    equity: user.equity,
                    equityDesc: user.equityDesc,
                    currency: user.currency
                }
            },
            message: "Login successful"
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ 
            success: false,
            message: "Server error during login",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = { registerUser, loginUser };
