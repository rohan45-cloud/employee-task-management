import mongoose from "mongoose";
const taskSchema = new mongoose.Schema(
  {
    taskId: { type: String, unique: true },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    description: { type: String, trim: true, maxlength: 2000 },
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    employeeSnapshot: {
      employeeId: String,
      fullName: String,
      email: String,
      department: String,
    },
    department: {
      type: String,
      required: true,
      enum: ["Development", "Design", "QA", "HR", "Sales"],
    },
    priority: {
      type: String,
      required: true,
      enum: ["Low", "Medium", "High", "Critical"],
    },
    status: {
      type: String,
      enum: ["Todo", "In Progress", "Completed", "Cancelled"],
      default: "Todo",
    },
    startDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    completedDate: Date,
  },
  { timestamps: true },
);

taskSchema.pre("validate", function (next) {
  if (this.startDate && this.dueDate && this.dueDate < this.startDate) {
    this.invalidate("dueDate", "Due date cannot be earlier than start date.");
  }
  next();
});
taskSchema.pre("save", async function (next) {
  if (!this.taskId && this.isNew) {
    // Time + random suffix avoids duplicate IDs when tasks are created concurrently.
    this.taskId = `TSK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }
  next();
});
export default mongoose.model("Task", taskSchema);
