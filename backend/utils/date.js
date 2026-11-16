export const startOfToday = () => {
  const d = new Date(); d.setUTCHours(0,0,0,0); return d;
};
export const isOverdue = task =>
  !['Completed','Cancelled'].includes(task.status) && new Date(task.dueDate) < startOfToday();
export const activeStatuses = ['Todo', 'In Progress'];
export const transitions = {
  'Todo': ['In Progress', 'Cancelled'],
  'In Progress': ['Completed', 'Cancelled'],
  'Completed': [],
  'Cancelled': []
};
