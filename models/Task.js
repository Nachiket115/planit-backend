import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String },
  priority: { type: String, default: "Medium" },
  category: { type: String, default: "Work" },
  dueDate: { type: Date },
  status: { type: String, default: "Scheduled" },
  timeRequired: { type: String },
  repeat: {
  type: String,
  enum: ["None", "Daily", "Weekly"],
  default: "None",
  },
  done: { type: Boolean, default: false },
}, { timestamps: true });

const Task = mongoose.model("Task", taskSchema);
export default Task;
