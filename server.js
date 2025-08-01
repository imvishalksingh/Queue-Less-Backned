require("dotenv").config();
const express = require("express");
const cors = require("cors");
const supabaseMiddleware = require("./middleware/superbase");

const app = express();
app.use(cors());
app.use(express.json());
app.use(supabaseMiddleware);

// 🔍 Health check
app.get("/", (req, res) => {
  res.send("✅ QueueLess API is running.");
});

// 📦 Routes
//app.use("/auth", require("./routes/authRoutes"));
//app.use("/tokens", require("./routes/tokenRoutes"));
//app.use("/branches", require("./routes/branchRoutes"));
//app.use("/admin", require("./routes/adminRoutes"));

const authRoutes = require("./routes/authRoutes");
console.log("authRoutes:", typeof authRoutes); // should log 'function'
app.use("/auth", authRoutes);

const tokenRoutes = require("./routes/tokenRoutes");
console.log("tokenRoutes:", typeof tokenRoutes);
app.use("/tokens", tokenRoutes);

const branchRoutes = require("./routes/branchRoutes");
console.log("branchRoutes:", typeof branchRoutes);
app.use("/branches", branchRoutes);

const adminRoutes = require("./routes/adminRoutes");
console.log("adminRoutes:", typeof adminRoutes);
app.use("/admin", adminRoutes);


// 🔥 Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 🚀 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 QueueLess API running on http://localhost:${PORT}`));
