import Employee from "../models/Employee.js";
import Task from "../models/Task.js";
import { activeStatuses, transitions } from "../utils/date.js";

const bad = (message) => Object.assign(new Error(message), { status: 400 });
const snapshot = (e) => ({
  employeeId: e.employeeId,
  fullName: e.fullName,
  email: e.email,
  department: e.department,
});

async function validateEmployee(employeeId, startDate) {
  const employee = await Employee.findById(employeeId);
  if (!employee)
    throw Object.assign(new Error("Assigned employee not found."), {
      status: 404,
    });
  if (employee.status === "Inactive")
    throw bad("Inactive employees cannot be assigned tasks.");
  const start = new Date(startDate);
  if (
    employee.status === "On Leave" &&
    employee.leaveStart &&
    employee.leaveEnd &&
    start >= new Date(employee.leaveStart) &&
    start <= new Date(employee.leaveEnd)
  ) {
    throw bad(
      "Employee is on leave during the task start date. Please choose another employee or date.",
    );
  }
  return employee;
}

// Atomic reservation: only one concurrent request can claim the final capacity slot.
async function reserveSlot(employeeId) {
  const result = await Employee.updateOne(
    {
      _id: employeeId,
      status: { $in: ["Active", "On Leave"] },
      activeTaskCount: { $lt: 3 },
    },
    { $inc: { activeTaskCount: 1 } },
  );
  if (!result.modifiedCount) {
    const employee = await Employee.findById(employeeId);
    if (!employee)
      throw Object.assign(new Error("Assigned employee not found."), {
        status: 404,
      });
    if (employee.status === "Inactive")
      throw bad("Inactive employees cannot be assigned tasks.");
    throw bad(
      "Employee already has 3 active tasks. Please choose another employee.",
    );
  }
}
async function releaseSlot(employeeId) {
  if (employeeId)
    await Employee.updateOne(
      { _id: employeeId, activeTaskCount: { $gt: 0 } },
      { $inc: { activeTaskCount: -1 } },
    );
}
export async function createTask(data) {
  if (new Date(data.dueDate) < new Date(data.startDate))
    throw bad("Due date cannot be earlier than start date.");
  const employee = await validateEmployee(
    data.assignedEmployee,
    data.startDate,
  );
  await reserveSlot(employee._id);
  try {
    return await Task.create({
      ...data,
      assignedEmployee: employee._id,
      employeeSnapshot: snapshot(employee),
      status: "Todo",
    });
  } catch (e) {
    await releaseSlot(employee._id);
    throw e;
  }
}
export async function updateTask(task, data) {
  if (["Completed", "Cancelled"].includes(task.status))
    throw bad("Completed and Cancelled tasks cannot be edited.");
  const startDate = data.startDate || task.startDate;
  const dueDate = data.dueDate || task.dueDate;
  if (new Date(dueDate) < new Date(startDate))
    throw bad("Due date cannot be earlier than start date.");
  const oldId = String(task.assignedEmployee || "");
  const newId = String(data.assignedEmployee || oldId);
  let employee = await validateEmployee(newId, startDate);
  const active = activeStatuses.includes(task.status);
  if (active && oldId !== newId) await reserveSlot(employee._id);
  Object.assign(task, data);
  task.assignedEmployee = employee._id;
  task.employeeSnapshot = snapshot(employee);
  await task.save();
  if (active && oldId !== newId) await releaseSlot(oldId);
  return task;
}
export async function changeTaskStatus(task, nextStatus) {
  if (!transitions[task.status]?.includes(nextStatus))
    throw bad(`Invalid status transition: ${task.status} → ${nextStatus}.`);
  task.status = nextStatus;
  if (nextStatus === "Completed") {
    task.completedDate = new Date();
    await releaseSlot(task.assignedEmployee);
  } else if (nextStatus === "Cancelled") {
    task.completedDate = undefined;
    await releaseSlot(task.assignedEmployee);
  }
  return task.save();
}
export async function deleteTask(task) {
  if (activeStatuses.includes(task.status))
    await releaseSlot(task.assignedEmployee);
  await task.deleteOne();
}
