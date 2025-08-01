const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

// 📌 Create a new branch (admin only)
router.post("/create", auth(["admin"]), async (req, res) => {
  const { name, location } = req.body;
  const supabase = req.supabase;

  const { data, error } = await supabase
    .from("branches")
    .insert({ name, location })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json({ branch: data });
});

// 📌 Get all branches
router.get("/", auth(["admin", "staff", "user"]), async (req, res) => {
  const supabase = req.supabase;

  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  res.json({ branches: data });
});

// 📌 Update a branch (admin only)
router.put("/:id", auth(["admin"]), async (req, res) => {
  const { id } = req.params;
  const { name, location } = req.body;
  const supabase = req.supabase;

  const { data, error } = await supabase
    .from("branches")
    .update({ name, location })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json({ updated: data });
});

// 📌 Delete a branch (admin only)
router.delete("/:id", auth(["admin"]), async (req, res) => {
  const { id } = req.params;
  const supabase = req.supabase;

  const { error } = await supabase
    .from("branches")
    .delete()
    .eq("id", id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: "Branch deleted successfully" });
});

module.exports = router;
