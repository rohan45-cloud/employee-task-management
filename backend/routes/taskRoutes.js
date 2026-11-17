import { Router } from "express";
import {
  listTasks,
  getTask,
  addTask,
  editTask,
  setTaskStatus,
  removeTask,
  exportTasks,
} from "../controllers/taskController.js";
const router = Router();
router.get("/export/csv", exportTasks);
router.route("/").get(listTasks).post(addTask);
router.put("/:id/status", setTaskStatus);
router.route("/:id").get(getTask).put(editTask).delete(removeTask);
export default router;
