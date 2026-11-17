import Task from "../models/Task.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isOverdue, activeStatuses } from "../utils/date.js";
import {
  createTask,
  updateTask,
  changeTaskStatus,
  deleteTask,
} from "../services/taskService.js";

const filtersFrom = (q) => {
  const f = {};
  if (q.department) f.department = q.department;
  if (q.priority) f.priority = q.priority;
  if (q.status) f.status = q.status;
  if (q.dueFrom || q.dueTo) f.dueDate = {};
  if (q.dueFrom) f.dueDate.$gte = new Date(q.dueFrom);
  if (q.dueTo) f.dueDate.$lte = new Date(q.dueTo);
  if (q.search)
    f.$or = [
      { title: { $regex: q.search, $options: "i" } },
      { "employeeSnapshot.fullName": { $regex: q.search, $options: "i" } },
    ];
  return f;
};
const enrich = (doc) => {
  const x = doc.toObject ? doc.toObject() : doc;
  x.overdue = isOverdue(x);
  if (!x.assignedEmployee && x.employeeSnapshot)
    x.employee = x.employeeSnapshot;
  else x.employee = x.assignedEmployee;
  return x;
};
export const listTasks = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;
  const filter = filtersFrom(req.query);
  const allowed = ["createdAt", "dueDate", "title", "priority"];
  let sort;
  if (sortBy === "priority") sort = { priority: 1 };
  else
    sort = {
      [allowed.includes(sortBy) ? sortBy : "createdAt"]:
        sortOrder === "asc" ? 1 : -1,
    };
  const p = Math.max(1, Number(page)),
    l = Math.min(100, Math.max(1, Number(limit)));
  const [rows, total] = await Promise.all([
    Task.find(filter)
      .populate("assignedEmployee", "employeeId fullName email department")
      .sort(sort)
      .skip((p - 1) * l)
      .limit(l),
    Task.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data: rows.map(enrich),
    pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) },
  });
});
export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate(
    "assignedEmployee",
    "employeeId fullName email department",
  );
  if (!task)
    return res.status(404).json({ success: false, message: "Task not found." });
  res.json({ success: true, data: enrich(task) });
});
export const addTask = asyncHandler(async (req, res) => {
  const data = await createTask(req.body);
  res
    .status(201)
    .json({ success: true, data, message: "Task created successfully." });
});
export const editTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task)
    return res.status(404).json({ success: false, message: "Task not found." });
  if ("status" in req.body || "completedDate" in req.body)
    return res
      .status(400)
      .json({
        success: false,
        message:
          "Use the status endpoint to change task status. Completed Date is server-managed.",
      });
  const data = await updateTask(task, req.body);
  res.json({ success: true, data, message: "Task updated successfully." });
});
export const setTaskStatus = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task)
    return res.status(404).json({ success: false, message: "Task not found." });
  const data = await changeTaskStatus(task, req.body.status);
  res.json({ success: true, data, message: "Task status updated." });
});
export const removeTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task)
    return res.status(404).json({ success: false, message: "Task not found." });
  await deleteTask(task);
  res.json({ success: true, message: "Task deleted." });
});
export const exportTasks = asyncHandler(async (req, res) => {
  const rows = await Task.find(filtersFrom(req.query))
    .populate("assignedEmployee", "employeeId fullName email department")
    .sort({ createdAt: -1 });
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const header = [
    "Task ID",
    "Title",
    "Employee",
    "Department",
    "Priority",
    "Status",
    "Start Date",
    "Due Date",
    "Overdue",
    "Created Date",
    "Completed Date",
  ];
  const lines = [
    header,
    ...rows.map((t) => {
      const x = enrich(t);
      return [
        x.taskId,
        x.title,
        x.employee?.fullName || x.employeeSnapshot?.fullName,
        x.department,
        x.priority,
        x.status,
        x.startDate?.toISOString().slice(0, 10),
        x.dueDate?.toISOString().slice(0, 10),
        x.overdue ? "Yes" : "No",
        x.createdAt?.toISOString(),
        x.completedDate?.toISOString(),
      ];
    }),
  ];
  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="tasks-export.csv"',
  );
  res.send(lines.map((r) => r.map(esc).join(",")).join("\n"));
});
