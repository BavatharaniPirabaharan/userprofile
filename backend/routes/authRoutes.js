const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Single-step registration route
router.post("/register", registerUser);

// Login route
router.post("/login", loginUser);

// Protected route for user profile
router.get("/me", authMiddleware, (req, res) => {
    res.status(200).json({ message: "User profile data", user: req.user });
});

module.exports = router;
