import Employee from '../models/Employee.js';
import Task from '../models/Task.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { activeStatuses } from '../utils/date.js';

export const listEmployees = asyncHandler(async (req,res) => {
  const { page=1, limit=10, search='', department='', status='', sortBy='createdAt', sortOrder='desc' } = req.query;
  const filter = {};
  if (department) filter.department = department;
  if (status) filter.status = status;
  if (search) filter.$or = [{ fullName:{ $regex:search, $options:'i' } }, { employeeId:{ $regex:search, $options:'i' } }, { email:{ $regex:search, $options:'i' } }];
  const allowed = ['createdAt','fullName','employeeId','joiningDate'];
  const sort = { [allowed.includes(sortBy)?sortBy:'createdAt']:sortOrder==='asc'?1:-1 };
  const p = Math.max(1,Number(page)), l = Math.min(100,Math.max(1,Number(limit)));
  const [data,total] = await Promise.all([Employee.find(filter).sort(sort).skip((p-1)*l).limit(l),Employee.countDocuments(filter)]);
  res.json({ success:true,data,pagination:{ page:p,limit:l,total,pages:Math.ceil(total/l) } });
});
export const getEmployee = asyncHandler(async(req,res)=>{
  const employee=await Employee.findById(req.params.id);
  if(!employee) return res.status(404).json({success:false,message:'Employee not found.'});
  res.json({success:true,data:employee});
});
export const createEmployee = asyncHandler(async(req,res)=>{
  const data={...req.body,email:String(req.body.email||'').trim().toLowerCase(),employeeId:String(req.body.employeeId||'').trim().toUpperCase()};
  const employee=await Employee.create(data);
  res.status(201).json({success:true,data:employee,message:'Employee created successfully.'});
});
export const updateEmployee = asyncHandler(async(req,res)=>{
  const employee=await Employee.findById(req.params.id);
  if(!employee) return res.status(404).json({success:false,message:'Employee not found.'});
  const data={...req.body};
  if(data.email) data.email=String(data.email).trim().toLowerCase();
  if(data.employeeId) data.employeeId=String(data.employeeId).trim().toUpperCase();
  if(data.status==='On Leave' && (!data.leaveStart || !data.leaveEnd)) return res.status(400).json({success:false,message:'Leave start and end dates are required.'});
  Object.assign(employee,data);
  await employee.save();
  res.json({success:true,data:employee,message:'Employee updated successfully.'});
});
export const deleteEmployee = asyncHandler(async(req,res)=>{
  const employee=await Employee.findById(req.params.id);
  if(!employee) return res.status(404).json({success:false,message:'Employee not found.'});
  const active=await Task.exists({assignedEmployee:employee._id,status:{$in:activeStatuses}});
  if(active) return res.status(400).json({success:false,message:'Cannot delete employee while Todo or In Progress tasks are assigned.'});
  await Task.updateMany({assignedEmployee:employee._id},{$set:{assignedEmployee:null}});
  await employee.deleteOne();
  res.json({success:true,message:'Employee deleted. Historical task snapshots were preserved.'});
});
