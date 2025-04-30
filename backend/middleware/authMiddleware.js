const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    // Extract the token from the 'Authorization' header and check its format
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        // Ensure JWT_SECRET is defined before proceeding
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: "Server configuration error: JWT_SECRET is missing" });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);
        req.user = decoded;  // Attach the decoded user info to the request
        next();
    } catch (error) {
        // Handle errors related to invalid token
        console.error(error);
        res.status(401).json({ message: "Token is not valid" });
    }
};

module.exports = authMiddleware;
