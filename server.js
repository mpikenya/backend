const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// --- Import all your route files ---
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const galleryRoutes = require('./routes/galleryRoutes.js');
const newsRoutes = require('./routes/newsRoutes.js');
const contactRoutes = require('./routes/contactRoutes.js'); 
const volunteerRoutes = require("./routes/volunteerRoutes");
const userRoutes = require("./routes/userRoutes.js");
const chatbotRoutes = require("./routes/chatbot.routes.js"); // <--- ADD THIS LINE

// --- Use your routes ---
app.use("/api", galleryRoutes);
app.use("/api", newsRoutes);
app.use("/api", contactRoutes);
app.use("/api", volunteerRoutes);
app.use("/api", chatbotRoutes); // <--- AND ADD THIS LINE

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB Connection Error:", err));