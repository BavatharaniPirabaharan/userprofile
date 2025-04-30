const User = require('../models/User');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    console.log("Request headers:", req.headers);
    console.log("User from token:", req.user);
    
    // Check if req.user has an id property, otherwise try userId
    const userId = req.user.id || req.user.userId;
    
    if (!userId) {
      console.error("No user ID found in token:", req.user);
      return res.status(401).json({ message: 'User ID not found in token' });
    }
    
    console.log("Attempting to find user with ID:", userId);
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      console.error("User not found for ID:", userId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log("User found successfully:", user);
    res.json(user);
  } catch (error) {
    console.error("Error in getProfile:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    console.log("Update profile request body:", req.body);
    console.log("User from token:", req.user);
    
    const userId = req.user.id || req.user.userId;
    
    if (!userId) {
      console.error("No user ID found in token:", req.user);
      return res.status(401).json({ message: 'User ID not found in token' });
    }
    
    console.log("Attempting to find user with ID:", userId);
    const {
      firstName,
      lastName,
      businessName,
      phoneNumber,
      nonCurrentAssets,
      nonCurrentAssetsDesc,
      liabilities,
      liabilitiesDesc,
      equity,
      equityDesc,
      currency,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found for ID:", userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log("User found, updating fields");
    // Update user fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.businessName = businessName || user.businessName;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.nonCurrentAssets = nonCurrentAssets || user.nonCurrentAssets;
    user.nonCurrentAssetsDesc = nonCurrentAssetsDesc || user.nonCurrentAssetsDesc;
    user.liabilities = liabilities || user.liabilities;
    user.liabilitiesDesc = liabilitiesDesc || user.liabilitiesDesc;
    user.equity = equity || user.equity;
    user.equityDesc = equityDesc || user.equityDesc;
    user.currency = currency || user.currency;

    console.log("Saving updated user");
    await user.save();
    console.log("User saved successfully");
    
    const updatedUser = await User.findById(userId).select('-password');
    console.log("Updated user retrieved:", updatedUser);
    res.json(updatedUser);
  } catch (error) {
    console.error("Error in updateProfile:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete user profile
exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in token' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: 'User profile deleted successfully' });
  } catch (error) {
    console.error("Error in deleteProfile:", error);
    res.status(500).json({ message: 'Server error' });
  }
}; 