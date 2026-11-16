import mongoose from 'mongoose';
const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, trim: true, uppercase: true, unique: true },
  fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  phone: { type: String, required: true, trim: true },
  department: { type: String, required: true, enum: ['Development','Design','QA','HR','Sales'] },
  role: { type: String, required: true, trim: true },
  joiningDate: { type: Date, required: true },
  status: { type: String, enum: ['Active','Inactive','On Leave'], default: 'Active' },
  skills: [{ type: String, trim: true }],
  leaveStart: Date,
  leaveEnd: Date,
  activeTaskCount: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

employeeSchema.pre('validate', function(next) {
  if (this.status === 'On Leave') {
    if (!this.leaveStart || !this.leaveEnd || this.leaveEnd < this.leaveStart) {
      this.invalidate('leaveStart', 'Valid leave start and end dates are required when employee is On Leave.');
    }
  } else {
    this.leaveStart = undefined;
    this.leaveEnd = undefined;
  }
  next();
});
export default mongoose.model('Employee', employeeSchema);
