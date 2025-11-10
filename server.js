// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import taskRouters from "./routes/taskRoutes.js";
import cron from "node-cron";
import Task from "./models/Task.js";
import "./utils/emailScheduler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRouters);
app.use("/api/health", (req, res) => {
  res.send("API is running nicely :)");
});

// starting the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

//  Repeat Task Duplication Logic
cron.schedule("0 0 * * *", async () => {
  console.log("⏰ Running daily repeat task check...");
  try {
    const today = new Date();
    const tasks = await Task.find({ repeat: { $in: ["Daily", "Weekly"] } });

    for (const task of tasks) {
      const dueDate = new Date(task.dueDate);
      const diffDays = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));

      // Duplicate only when due date has passed or is today
      if (diffDays >= 0) {
        const newDueDate = new Date(task.dueDate);
        if (task.repeat === "Daily") newDueDate.setDate(newDueDate.getDate() + 1);
        if (task.repeat === "Weekly") newDueDate.setDate(newDueDate.getDate() + 7);

        const newTask = new Task({
          title: task.title,
          description: task.description,
          priority: task.priority,
          category: task.category,
          dueDate: newDueDate,
          status: "Scheduled",
          user: task.user,
          repeat: task.repeat,
        });
        await newTask.save();

        console.log(`✅ Repeated task "${task.title}" for ${task.repeat}`);
      }
    }
  } catch (err) {
    console.error("Error duplicating repeat tasks:", err.message);
  }
});
