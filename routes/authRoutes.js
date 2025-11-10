import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "ajd82k!Lm4uX0qZb79";

// --- Register ---
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const newUser = new User({ email, password });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, email: newUser.email });
  } catch (err) {
    res.status(500).json({ message: "Error registering user", error: err.message });
  }
});

// --- Login ---
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id },JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, email: user.email });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
});

export default router;
