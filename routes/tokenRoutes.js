const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

// 📌 Create a token for a branch
router.post("/create", auth(["user"]), async (req, res) => {
  const { branch_id } = req.body;
  const supabase = req.supabase;
  const user_id = req.user.id;

  // Get the last token number in this branch
  const { data: last, error: lastErr } = await supabase
    .from("tokens")
    .select("number")
    .eq("branch_id", branch_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (lastErr && lastErr.code !== "PGRST116") return res.status(500).json({ error: lastErr.message });

  const newNumber = last ? last.number + 1 : 1;

  const { data, error } = await supabase.from("tokens").insert({
    user_id,
    branch_id,
    number: newNumber,
    status: "waiting"
  }).select().single();

  if (error) return res.status(500).json({ error });

  res.json({ token: data });
});


// 📌 Get waiting queue for a branch
router.get("/queue/:branch_id", auth(["admin", "staff"]), async (req, res) => {
  const { branch_id } = req.params;
  const supabase = req.supabase;

  const { data, error } = await supabase
    .from("tokens")
    .select("*")
    .eq("branch_id", branch_id)
    .eq("status", "waiting")
    .order("number", { ascending: true });

  if (error) return res.status(500).json({ error });

  res.json({ queue: data });
});


// 📌 Call next token (change its status to 'called')
router.post("/call-next", auth(["admin", "staff"]), async (req, res) => {
  const { branch_id } = req.body;
  const supabase = req.supabase;

  // Get the first 'waiting' token
  const { data: nextToken, error: findError } = await supabase
    .from("tokens")
    .select("*")
    .eq("branch_id", branch_id)
    .eq("status", "waiting")
    .order("number", { ascending: true })
    .limit(1)
    .single();

  if (findError) return res.status(500).json({ error: "No token in queue" });

  // Update status to 'called'
  const { data: updated, error: updateError } = await supabase
    .from("tokens")
    .update({ status: "called" })
    .eq("id", nextToken.id)
    .select()
    .single();

  if (updateError) return res.status(500).json({ error: updateError });

  res.json({ token: updated });
});

module.exports = router; // ✅ REQUIRED

