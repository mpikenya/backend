// routes/auth.routes.js

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Admin = require("../models/Admin");

// ────────────────────────────
// ─── User Registration ─────
// ────────────────────────────
router.post("/register", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "Please fill in all fields." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// ─────────────────────────
// ─── User Login ─────────
// ─────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Basic field validation
  if (!email || !password) {
    return res.status(400).json({ message: "Please fill in all fields." });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });

    // If user doesn't exist
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // If password is missing in DB (data inconsistency)
    if (!user.password) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Compare input password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send response
    res.json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error." });
  }
});



// ───────────────────────────
// ─── Admin Login Route ─────
// ───────────────────────────
// POST /api/auth/admin
router.post("/admin", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find admin
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 3. Sign token — ✅ THIS IS WHERE YOU PUT IT
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 4. Return token and maybe some profile info
    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─────────────────────────────────────
// ─── Manual Admin Creation Route ─────
// ─────────────────────────────────────


// In your backend's auth routes file (e.g., auth.routes.js)
// THIS IS THE CORRECT, IDEMPOTENT WAY

// In your backend's auth.routes.js file (or similar)
// THIS IS THE CORRECTED CODE

router.post('/clerk-login', async (req, res) => {
  try {
    const { clerkUserId, email, name, photo } = req.body;

    if (!clerkUserId || !email) {
      return res.status(400).json({ message: "Clerk User ID and Email are required." });
    }

    // --- THE CRITICAL FIX IS HERE ---
    // We tell Mongoose to find a document that matches EITHER the clerkUserId OR the email.
    // This will find the user whether they are a returning Clerk user or an existing
    // email/password user logging in with Clerk for the first time.
    const filter = {
      $or: [
        { clerkUserId: clerkUserId },
        { email: email }
      ]
    };

    // Define the data to be set. We ensure the clerkUserId is always updated,
    // effectively linking the accounts.
    const update = {
      $set: {
        clerkUserId: clerkUserId, // This is key for linking
        email: email,
        name: name,
        photo: photo,
      },
    };

    const options = {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    };

    // This command will now do the following:
    // 1. Look for a user with the given clerkUserId OR email.
    // 2. If it finds the existing email/password user, it will ADD the clerkUserId to their record.
    // 3. If it finds nothing, it will create a new user with all the provided details.
    // 4. In NO CASE will it try to create a duplicate email.
    const user = await User.findOneAndUpdate(filter, update, options);

    res.status(200).json({ 
      message: "User successfully synced with the database.",
      user: user 
    });

  } catch (error) {
    // This error should now only trigger for actual database failures, not duplicate keys.
    console.error("Error during Clerk user sync:", error);
    res.status(500).json({ message: "Server error while syncing user." });
  }
});

module.exports = router;
