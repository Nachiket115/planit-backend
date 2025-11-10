import express from "express";
import Task from "../models/Task.js";
import protect from "../middleware/authMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all tasks
router.get("/", protect, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tasks", error: err.message });
  }
});

// Add new task

// Create a new task
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, priority, category, dueDate, status, timeRequired, repeat } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const newTask = new Task({
      user: req.user?.id,
      title,
      description,
      priority,
      category,
      dueDate: dueDate || null,
      status,
      timeRequired,
      repeat,
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ message: "Error creating task", error: err.message });
  }
});



// Update task
router.put("/:id", async (req, res) => {
  try {
    const { title, description, priority, category, dueDate, status, timeRequired, repeat, done } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, priority, category, dueDate, status, timeRequired, repeat, done },
      { new: true }
    );
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: "Error updating task", error: err.message });
  }
});


// Delete task
router.delete("/:id", protect, async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting task", error: err.message });
  }
});


export default router;
