const User = require('./models/User'); // Your User model
const asyncHandler = require('express-async-handler');

/**
 * @desc    Login or Register a user via Clerk SSO/OAuth
 * @route   POST /api/auth/clerk-login
 * @access  Public
 */
const clerkLogin = asyncHandler(async (req, res) => {
  const { clerkUserId, email, name, photo, googleId } = req.body;

  if (!clerkUserId || !email) {
    res.status(400);
    throw new Error('Clerk User ID and Email are required.');
  }

  // Find a user by their unique Clerk ID and update their info,
  // or create them if they don't exist.
  const user = await User.findOneAndUpdate(
    { clerkUserId: clerkUserId }, // The unique field to find the user by
    {
      // The data to set or update. $set prevents overwriting other fields.
      $set: {
        name: name,
        email: email,
        photo: photo,
        googleId: googleId, // Or whatever you call this field
      },
    },
    {
      upsert: true, // This is the magic: creates the document if it doesn't exist
      new: true,    // This returns the new/updated document, not the old one
      setDefaultsOnInsert: true // Ensures your schema defaults are applied on creation
    }
  );

  // By this point, the user is guaranteed to be in your database.
  // The 'user' variable holds their profile.

  // You can generate your own JWT token here if your app uses one
  // const token = generateToken(user._id);

  res.status(200).json({
    message: "User authenticated successfully.",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      photo: user.photo,
    },
    // token: token // Uncomment if you send a custom token
  });
});

module.exports = {
  clerkLogin,
  // ... other controller functions
};