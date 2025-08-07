// routes/admin.routes.js

const express = require("express");
const router = express.Router();
const verifyAdmin = require("../middlewares/verifyAdmin");
const { addAdmin } = require('../controllers/adminController');

// Import your authentication middleware

const Admin = require("../models/Admin");
const News = require('../models/NewsPosts');
const Gallery = require('../models/GalleryImage');
const User = require('../models/user');
;

router.post('/add-admin', verifyAdmin, addAdmin);


router.get('/users', verifyAdmin, async (req, res) => {
  try {
    // Simply find all documents in the 'User' collection.
    // No need to filter by role.
    const users = await User.find({}).select('-password'); // .select('-password') is a security best practice
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error." });
  }
});

router.delete('/users/:id', verifyAdmin, async (req, res) => {
  try {
    // Find the user in the User collection and delete them.
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "User removed successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error." });
  }
});

router.get('/personnel', verifyAdmin, async (req, res) => {
  try {
    // This line correctly finds all documents in the "admins" collection,
    // which is exactly what you want.
    const admins = await Admin.find({}).select('-password');
    res.json(admins);
  } catch (error) {
    console.error("Error fetching admin personnel:", error);
    res.status(500).json({ message: "Server error." });
  }
});

router.get("/dashboard", verifyAdmin, async (req, res) => {
  try {
    const adminId = req.user.id; // extracted from token by middleware

    const admin = await Admin.findById(adminId).select("-password"); // exclude password

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json(admin);
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    // Run database queries in parallel for better performance
    const [newsCount, imageCount] = await Promise.all([
      News.countDocuments(), // Counts all documents in the News collection
      Gallery.countDocuments(), // Counts all documents in the Gallery collection
    ]);

    // For "Recent Uploads", you might query items from the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUploads = await News.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    // You could also add recent images to this count if desired

    // Send the data back to the frontend as a JSON object
    res.json({
      totalNews: newsCount,
      totalImages: imageCount,
      recentUploadsCount: recentUploads,
    });

  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Server error while fetching stats." });
  }
});

module.exports = router;
