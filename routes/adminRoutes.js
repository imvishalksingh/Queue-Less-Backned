const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

// 📌 Get dashboard stats (admin only)
router.get("/stats", auth(["admin"]), async (req, res) => {
  const supabase = req.supabase;

  const [tokenCount, userCount, branchCount] = await Promise.all([
    supabase.from("tokens").select("*"),
    supabase.from("users").select("*"),
    supabase.from("branches").select("*")
  ]);

  res.json({
    total_tokens: tokenCount.data?.length || 0,
    total_users: userCount.data?.length || 0,
    total_branches: branchCount.data?.length || 0
  });
});

// 📌 List all users (admin only)
router.get("/users", auth(["admin"]), async (req, res) => {
  const supabase = req.supabase;

  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, role, created_at");

  if (error) return res.status(500).json({ error: error.message });

  res.json({ users: data });
});

module.exports = router;
