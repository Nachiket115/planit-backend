import cron from "node-cron";
import nodemailer from "nodemailer";
import Task from "../models/Task.js";
import dotenv from "dotenv";

dotenv.config();

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

console.log("Email User:", emailUser ? "Loaded" : "Not Set");
console.log("Email Pass:", emailPass ? "Loaded" : "Not Set");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


cron.schedule("0 0 9 * * *", async () => {
  console.log("🔔 Running email reminder job...");

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  
  const todayStr = today.toISOString().split("T")[0];
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  try {
    // Find tasks due today or tomorrow
    const tasks = await Task.find({
      dueDate: { $in: [todayStr, tomorrowStr] },
      status: { $ne: "Completed" },
    }).populate("user", "email");

    for (const task of tasks) {
      if (!task.user || !task.user.email) continue;

      const mailOptions = {
        from: `"Planit" <${process.env.EMAIL_USER}>`,
        to: task.user.email,
        subject: `⏰ Reminder: ${task.title} is due soon`,
        text: `Hello! Your task "${task.title}" is due on ${task.dueDate}.
        
Priority: ${task.priority}
Category: ${task.category}
Status: ${task.status}

Please make sure to complete it on time!`,
      };

      await transporter.sendMail(mailOptions);
      console.log(`📧 Planit: Reminder sent to ${task.user.email} for "${task.title}"`);
    }
  } catch (err) {
    console.error("Error sending email reminders:", err);
  }
});
