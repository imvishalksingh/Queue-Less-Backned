const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  const {name, email, password, role } = req.body;
  const supabase = req.supabase;

  const hashed = await bcrypt.hash(password, 10);
  const { data, error } = await supabase.from("users").insert({
   name, email, password: hashed, role
  }).select().single();

  if (error) return res.status(500).json({ error });

  res.json(data);
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const supabase = req.supabase;

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) return res.status(401).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Invalid password" });

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "2h"
  });

  res.json({ token });
});


app.get("/auth/me", (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: decoded }); // send user info from token
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});


module.exports = router;
