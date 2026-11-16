import Employee from '../models/Employee.js';
import Task from '../models/Task.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { startOfToday, activeStatuses } from '../utils/date.js';
export const dashboard=asyncHandler(async(_req,res)=>{
  const [employeeTotal,employeeActive,employeeInactive,employeeLeave,taskTotal,statusCounts,overdue,workload]=await Promise.all([
    Employee.countDocuments(),Employee.countDocuments({status:'Active'}),Employee.countDocuments({status:'Inactive'}),Employee.countDocuments({status:'On Leave'}),
    Task.countDocuments(),Task.aggregate([{$group:{_id:'$status',count:{$sum:1}}}]),
    Task.countDocuments({dueDate:{$lt:startOfToday()},status:{$nin:['Completed','Cancelled']}}),
    Employee.find().select('fullName employeeId activeTaskCount').sort({activeTaskCount:-1}).limit(10)
  ]);
  const counts=Object.fromEntries(statusCounts.map(x=>[x._id,x.count]));
  res.json({success:true,data:{employees:{total:employeeTotal,active:employeeActive,inactive:employeeInactive,onLeave:employeeLeave},tasks:{total:taskTotal,todo:counts.Todo||0,inProgress:counts['In Progress']||0,completed:counts.Completed||0,cancelled:counts.Cancelled||0,overdue},workload:workload.map(e=>({employee:e.fullName,employeeId:e.employeeId,activeTasks:e.activeTaskCount}))}});
});
