import React, { useEffect, useMemo, useState } from "react";
import {
  Routes,
  Route,
  NavLink,
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Plus,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "./api";
const departments = ["Development", "Design", "QA", "HR", "Sales"],
  priorities = ["Low", "Medium", "High", "Critical"],
  statuses = ["Todo", "In Progress", "Completed", "Cancelled"];
const date = (v) => (v ? new Date(v).toISOString().slice(0, 10) : "");
function Shell({ children }) {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brandmark">P</span>
          <div>
            <b>PeopleDesk</b>
            <small>WORKSPACE</small>
          </div>
        </div>
        <div className="navlabel">OVERVIEW</div>
        <NavLink to="/dashboard">
          <LayoutDashboard />
          Dashboard
        </NavLink>
        <div className="navlabel">MANAGEMENT</div>
        <NavLink to="/employees">
          <Users />
          Employees
        </NavLink>
        <NavLink to="/tasks">
          <ClipboardList />
          Tasks
        </NavLink>
        <div className="sidefoot">
          Roots Media Marketing
          <br />
          <small>Employee operations</small>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <span>
            Workspace <b>/ Management</b>
          </span>
          <span className="avatar">RM</span>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
function Heading({ eyebrow, title, desc, action }) {
  return (
    <div className="heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      {action}
    </div>
  );
}
function Stat({ label, value, sub, icon: Icon }) {
  return (
    <div className="stat">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">
          <Icon size={18} />
        </span>
      </div>
      <strong>{value ?? "—"}</strong>
      {sub && <small>{sub}</small>}
    </div>
  );
}
function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .get("/dashboard")
      .then((r) => setData(r.data.data))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);
  return (
    <>
      <Heading
        eyebrow="OVERVIEW"
        title="Dashboard"
        desc="A clear view of your people and work."
        action={
          <button className="btn light" onClick={() => location.reload()}>
            <RefreshCw size={16} /> Refresh
          </button>
        }
      />
      {loading ? (
        <div className="panel">Loading dashboard…</div>
      ) : (
        data && (
          <>
            <div className="section-title">People</div>
            <div className="stats four">
              <Stat
                label="Total employees"
                value={data.employees.total}
                icon={Users}
              />
              <Stat label="Active" value={data.employees.active} icon={Users} />
              <Stat
                label="Inactive"
                value={data.employees.inactive}
                icon={Users}
              />
              <Stat
                label="On leave"
                value={data.employees.onLeave}
                icon={Users}
              />
            </div>
            <div className="section-title">Tasks</div>
            <div className="stats six">
              <Stat
                label="Total tasks"
                value={data.tasks.total}
                icon={ClipboardList}
              />
              <Stat
                label="To do"
                value={data.tasks.todo}
                icon={ClipboardList}
              />
              <Stat
                label="In progress"
                value={data.tasks.inProgress}
                icon={ClipboardList}
              />
              <Stat
                label="Completed"
                value={data.tasks.completed}
                icon={ClipboardList}
              />
              <Stat
                label="Cancelled"
                value={data.tasks.cancelled}
                icon={ClipboardList}
              />
              <Stat
                label="Overdue"
                value={data.tasks.overdue}
                icon={ClipboardList}
              />
            </div>
            <div className="panel">
              <div className="panelhead">
                <div>
                  <h3>Employee workload</h3>
                  <p>Current active task allocation</p>
                </div>
                <Link className="textlink" to="/employees">
                  View employees →
                </Link>
              </div>
              <div className="tablewrap">
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Employee ID</th>
                      <th>Active tasks</th>
                      <th>Capacity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.workload.map((x) => (
                      <tr key={x.employeeId}>
                        <td className="person">{x.employee}</td>
                        <td>{x.employeeId}</td>
                        <td>{x.activeTasks}</td>
                        <td>
                          <div className="progress">
                            <i
                              style={{
                                width: `${Math.min(100, (x.activeTasks / 3) * 100)}%`,
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )
      )}
    </>
  );
}
function useListData(endpoint) {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState([]),
    [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 }),
    [loading, setLoading] = useState(true);
  const query = params.toString();
  useEffect(() => {
    setLoading(true);
    api
      .get(`${endpoint}?${query}`)
      .then((r) => {
        setData(r.data.data);
        setPagination(r.data.pagination);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [endpoint, query]);
  const change = (key, value) => {
    const p = new URLSearchParams(params);
    if (value) p.set(key, value);
    else p.delete(key);
    if (key !== "page") p.set("page", "1");
    setParams(p);
  };
  return { data, pagination, loading, params, change, setParams };
}
function Pagination({ pagination, change }) {
  return (
    <div className="pagination">
      <span>
        Showing page {pagination.page} of {Math.max(1, pagination.pages)} ·{" "}
        {pagination.total} records
      </span>
      <div>
        <button
          disabled={pagination.page <= 1}
          onClick={() => change("page", String(pagination.page - 1))}
        >
          <ChevronLeft size={16} />
        </button>
        <b>{pagination.page}</b>
        <button
          disabled={pagination.page >= pagination.pages}
          onClick={() => change("page", String(pagination.page + 1))}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
function Employees() {
  const { data, pagination, loading, params, change } =
    useListData("/employees");
  const [search, setSearch] = useState(params.get("search") || "");
  const del = async (id) => {
    if (!confirm("Delete this employee?")) return;
    try {
      await api.delete("/employees/" + id);
      toast.success("Employee deleted");
      change("refresh", Date.now().toString());
    } catch (e) {
      toast.error(e.message);
    }
  };
  return (
    <>
      <Heading
        eyebrow="PEOPLE"
        title="Employees"
        desc="Manage employee profiles, departments and availability."
        action={
          <Link className="btn primary" to="/employees/add">
            <Plus size={17} /> Add employee
          </Link>
        }
      />
      <div className="toolbar">
        <div className="searchbox">
          <Search size={17} />
          <input
            placeholder="Search name, ID or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && change("search", search)}
          />
          <button onClick={() => change("search", search)}>Search</button>
        </div>
        <select
          value={params.get("department") || ""}
          onChange={(e) => change("department", e.target.value)}
        >
          <option value="">All departments</option>
          {departments.map((x) => (
            <option>{x}</option>
          ))}
        </select>
        <select
          value={params.get("status") || ""}
          onChange={(e) => change("status", e.target.value)}
        >
          <option value="">All statuses</option>
          {["Active", "Inactive", "On Leave"].map((x) => (
            <option>{x}</option>
          ))}
        </select>
      </div>
      <div className="panel">
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">Loading employees…</td>
                </tr>
              ) : (
                data.map((e) => (
                  <tr key={e._id}>
                    <td>
                      <div className="person">{e.fullName}</div>
                      <small>{e.email}</small>
                    </td>
                    <td>{e.employeeId}</td>
                    <td>{e.department}</td>
                    <td>{e.role}</td>
                    <td>
                      <span
                        className={
                          "pill " + e.status.toLowerCase().replace(" ", "-")
                        }
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="actions">
                      <Link to={`/employees/${e._id}`} title="View">
                        <Eye />
                      </Link>
                      <Link to={`/employees/edit/${e._id}`} title="Edit">
                        <Pencil />
                      </Link>
                      <button onClick={() => del(e._id)} title="Delete">
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
              {!loading && !data.length && (
                <tr>
                  <td colSpan="6" className="empty">
                    No employees found. Add your first employee.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination pagination={pagination} change={change} />
      </div>
    </>
  );
}
function Tasks() {
  const { data, pagination, loading, params, change } = useListData("/tasks");
  const [search, setSearch] = useState(params.get("search") || "");
  const del = async (id) => {
    if (!confirm("Delete this task?")) return;
    try {
      await api.delete("/tasks/" + id);
      toast.success("Task deleted");
      change("refresh", Date.now().toString());
    } catch (e) {
      toast.error(e.message);
    }
  };
  const status = async (id, value) => {
    try {
      await api.put(`/tasks/${id}/status`, { status: value });
      toast.success("Status updated");
      change("refresh", Date.now().toString());
    } catch (e) {
      toast.error(e.message);
    }
  };
  const exportCsv = () => {
    const p = new URLSearchParams(params);
    p.delete("page");
    p.delete("limit");
    window.open(`${api.defaults.baseURL}/tasks/export/csv?${p}`, "_blank");
  };
  return (
    <>
      <Heading
        eyebrow="WORK MANAGEMENT"
        title="Tasks"
        desc="Assign, prioritize and track work across your team."
        action={
          <div className="headactions">
            <button className="btn light" onClick={exportCsv}>
              <Download size={16} /> Export CSV
            </button>
            <Link className="btn primary" to="/tasks/add">
              <Plus size={17} /> Add task
            </Link>
          </div>
        }
      />
      <div className="toolbar wrap">
        <div className="searchbox">
          <Search size={17} />
          <input
            placeholder="Search task or employee…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && change("search", search)}
          />
          <button onClick={() => change("search", search)}>Search</button>
        </div>
        <select
          value={params.get("department") || ""}
          onChange={(e) => change("department", e.target.value)}
        >
          <option value="">Department</option>
          {departments.map((x) => (
            <option>{x}</option>
          ))}
        </select>
        <select
          value={params.get("priority") || ""}
          onChange={(e) => change("priority", e.target.value)}
        >
          <option value="">Priority</option>
          {priorities.map((x) => (
            <option>{x}</option>
          ))}
        </select>
        <select
          value={params.get("status") || ""}
          onChange={(e) => change("status", e.target.value)}
        >
          <option value="">Status</option>
          {statuses.map((x) => (
            <option>{x}</option>
          ))}
        </select>
        <select
          value={params.get("sortBy") || "createdAt"}
          onChange={(e) => change("sortBy", e.target.value)}
        >
          <option value="createdAt">Newest</option>
          <option value="dueDate">Due date</option>
          <option value="priority">Priority</option>
          <option value="title">Title</option>
        </select>
        <input
          aria-label="Due from"
          type="date"
          value={params.get("dueFrom") || ""}
          onChange={(e) => change("dueFrom", e.target.value)}
        />
        <input
          aria-label="Due to"
          type="date"
          value={params.get("dueTo") || ""}
          onChange={(e) => change("dueTo", e.target.value)}
        />
      </div>
      <div className="panel">
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Employee</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">Loading tasks…</td>
                </tr>
              ) : (
                data.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <b>{t.taskId}</b>
                      <div>{t.title}</div>
                      <small>{t.department}</small>
                    </td>
                    <td>
                      {t.employee?.fullName ||
                        t.employeeSnapshot?.fullName ||
                        "Deleted employee"}
                    </td>
                    <td>
                      <span className={"priority " + t.priority.toLowerCase()}>
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      <select
                        className="statusselect"
                        value={t.status}
                        onChange={(e) => status(t._id, e.target.value)}
                      >
                        {[
                          t.status,
                          ...(t.status === "Todo"
                            ? ["In Progress", "Cancelled"]
                            : t.status === "In Progress"
                              ? ["Completed", "Cancelled"]
                              : []),
                        ]
                          .filter((x, i, a) => a.indexOf(x) === i)
                          .map((x) => (
                            <option>{x}</option>
                          ))}
                      </select>
                    </td>
                    <td className={t.overdue ? "overdue" : ""}>
                      {date(t.dueDate)}
                      {t.overdue && <small>Overdue</small>}
                    </td>
                    <td className="actions">
                      <Link to={`/tasks/${t._id}`}>
                        <Eye />
                      </Link>
                      {!["Completed", "Cancelled"].includes(t.status) && (
                        <Link to={`/tasks/edit/${t._id}`}>
                          <Pencil />
                        </Link>
                      )}
                      <button onClick={() => del(t._id)}>
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
              {!loading && !data.length && (
                <tr>
                  <td colSpan="6" className="empty">
                    No tasks found. Create your first task.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination pagination={pagination} change={change} />
      </div>
    </>
  );
}
const blankEmployee = {
  employeeId: "",
  fullName: "",
  email: "",
  phone: "",
  department: "Development",
  role: "",
  joiningDate: "",
  status: "Active",
  skills: "",
  leaveStart: "",
  leaveEnd: "",
};
function EmployeeForm() {
  const { id } = useParams(),
    nav = useNavigate(),
    [form, setForm] = useState(blankEmployee),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (id)
      api
        .get("/employees/" + id)
        .then((r) => {
          const e = r.data.data;
          setForm({
            ...e,
            joiningDate: date(e.joiningDate),
            leaveStart: date(e.leaveStart),
            leaveEnd: date(e.leaveEnd),
            skills: (e.skills || []).join(", "),
          });
        })
        .catch((e) => toast.error(e.message));
  }, [id]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...form,
        skills: form.skills
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      };
      if (payload.status !== "On Leave") {
        delete payload.leaveStart;
        delete payload.leaveEnd;
      }
      if (id) await api.put("/employees/" + id, payload);
      else await api.post("/employees", payload);
      toast.success(id ? "Employee updated" : "Employee created");
      nav("/employees");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <button className="back" onClick={() => nav("/employees")}>
        <ArrowLeft size={16} /> Back to employees
      </button>
      <Heading
        eyebrow="PEOPLE"
        title={id ? "Edit employee" : "Add employee"}
        desc="Enter employee information and availability details."
      />
      <form className="formpanel" onSubmit={submit}>
        <div className="formgrid">
          <Field label="Employee ID" required>
            <input
              required
              value={form.employeeId}
              onChange={(e) => set("employeeId", e.target.value)}
              placeholder="EMP-001"
            />
          </Field>
          <Field label="Full name" required>
            <input
              required
              minLength="2"
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
            />
          </Field>
          <Field label="Email" required>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
          <Field label="Phone" required>
            <input
              required
              pattern="[+0-9() -]{7,20}"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>
          <Field label="Department" required>
            <select
              value={form.department}
              onChange={(e) => set("department", e.target.value)}
            >
              {departments.map((x) => (
                <option>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Role" required>
            <input
              required
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              placeholder="e.g. Frontend Developer"
            />
          </Field>
          <Field label="Joining date" required>
            <input
              type="date"
              required
              value={form.joiningDate}
              onChange={(e) => set("joiningDate", e.target.value)}
            />
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            >
              {["Active", "Inactive", "On Leave"].map((x) => (
                <option>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Skills (comma separated)" wide>
            <input
              value={form.skills}
              onChange={(e) => set("skills", e.target.value)}
              placeholder="React, Node.js, MongoDB"
            />
          </Field>
          {form.status === "On Leave" && (
            <>
              <Field label="Leave start" required>
                <input
                  type="date"
                  required
                  value={form.leaveStart}
                  onChange={(e) => set("leaveStart", e.target.value)}
                />
              </Field>
              <Field label="Leave end" required>
                <input
                  type="date"
                  required
                  min={form.leaveStart}
                  value={form.leaveEnd}
                  onChange={(e) => set("leaveEnd", e.target.value)}
                />
              </Field>
            </>
          )}
        </div>
        <div className="formfooter">
          <button
            type="button"
            className="btn light"
            onClick={() => nav("/employees")}
          >
            Cancel
          </button>
          <button disabled={busy} className="btn primary">
            {busy ? "Saving…" : "Save employee"}
          </button>
        </div>
      </form>
    </>
  );
}
function Field({ label, required, wide, children }) {
  return (
    <label className={wide ? "field wide" : "field"}>
      <span>
        {label}
        {required && " *"}
      </span>
      {children}
    </label>
  );
}
function TaskForm() {
  const { id } = useParams(),
    nav = useNavigate(),
    [employees, setEmployees] = useState([]),
    [busy, setBusy] = useState(false),
    [form, setForm] = useState({
      title: "",
      description: "",
      assignedEmployee: "",
      department: "Development",
      priority: "Medium",
      startDate: "",
      dueDate: "",
    });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  useEffect(() => {
    api
      .get("/employees?limit=100&status=Active")
      .then((r) => setEmployees(r.data.data))
      .catch((e) => toast.error(e.message));
    if (id)
      api
        .get("/tasks/" + id)
        .then((r) => {
          const t = r.data.data;
          setForm({
            ...t,
            assignedEmployee: t.assignedEmployee?._id || "",
            startDate: date(t.startDate),
            dueDate: date(t.dueDate),
          });
        })
        .catch((e) => toast.error(e.message));
  }, [id]);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (id) await api.put("/tasks/" + id, form);
      else await api.post("/tasks", form);
      toast.success(id ? "Task updated" : "Task created");
      nav("/tasks");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <button className="back" onClick={() => nav("/tasks")}>
        <ArrowLeft size={16} /> Back to tasks
      </button>
      <Heading
        eyebrow="WORK MANAGEMENT"
        title={id ? "Edit task" : "Add task"}
        desc="Define the work, choose an owner and set a due date."
      />
      <form className="formpanel" onSubmit={submit}>
        <div className="formgrid">
          <Field label="Task title" required wide>
            <input
              required
              minLength="3"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Enter task title"
            />
          </Field>
          <Field label="Assigned employee" required>
            <select
              required
              value={form.assignedEmployee}
              onChange={(e) => set("assignedEmployee", e.target.value)}
            >
              <option value="">Select employee</option>
              {employees.map((x) => (
                <option value={x._id}>
                  {x.fullName} · {x.activeTaskCount}/3 active
                </option>
              ))}
            </select>
          </Field>
          <Field label="Department" required>
            <select
              value={form.department}
              onChange={(e) => set("department", e.target.value)}
            >
              {departments.map((x) => (
                <option>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Priority" required>
            <select
              value={form.priority}
              onChange={(e) => set("priority", e.target.value)}
            >
              {priorities.map((x) => (
                <option>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Start date" required>
            <input
              type="date"
              required
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
            />
          </Field>
          <Field label="Due date" required>
            <input
              type="date"
              required
              min={form.startDate}
              value={form.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
            />
          </Field>
          <Field label="Description" wide>
            <textarea
              rows="4"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Add task details…"
            />
          </Field>
        </div>
        <div className="formnote">
          New tasks always start as Todo. Status changes are made from the task
          list or details view.
        </div>
        <div className="formfooter">
          <button
            type="button"
            className="btn light"
            onClick={() => nav("/tasks")}
          >
            Cancel
          </button>
          <button disabled={busy} className="btn primary">
            {busy ? "Saving…" : "Save task"}
          </button>
        </div>
      </form>
    </>
  );
}
function Details({ type }) {
  const { id } = useParams(),
    nav = useNavigate(),
    [data, setData] = useState(null);
  useEffect(() => {
    api
      .get(`/${type}/${id}`)
      .then((r) => setData(r.data.data))
      .catch((e) => toast.error(e.message));
  }, [type, id]);
  if (!data) return <div className="panel">Loading details…</div>;
  const employee = type === "employees";
  return (
    <>
      <button className="back" onClick={() => nav(-1)}>
        <ArrowLeft size={16} /> Back
      </button>
      <Heading
        eyebrow={employee ? "PEOPLE" : "WORK MANAGEMENT"}
        title={employee ? data.fullName : data.title}
        desc={employee ? data.employeeId : data.taskId}
        action={
          <Link className="btn primary" to={`/${type}/edit/${id}`}>
            <Pencil size={16} /> Edit
          </Link>
        }
      />
      <div className="detailgrid">
        {(employee
          ? [
              ["Email", data.email],
              ["Phone", data.phone],
              ["Department", data.department],
              ["Role", data.role],
              ["Joining date", date(data.joiningDate)],
              ["Status", data.status],
              ["Skills", (data.skills || []).join(", ") || "—"],
              [
                "Leave period",
                data.status === "On Leave"
                  ? `${date(data.leaveStart)} to ${date(data.leaveEnd)}`
                  : "—",
              ],
            ]
          : [
              ["Description", data.description || "—"],
              [
                "Employee",
                data.employee?.fullName ||
                  data.employeeSnapshot?.fullName ||
                  "Deleted employee",
              ],
              ["Department", data.department],
              ["Priority", data.priority],
              ["Status", data.status],
              ["Start date", date(data.startDate)],
              ["Due date", date(data.dueDate)],
              ["Overdue", data.overdue ? "Yes" : "No"],
              ["Created date", date(data.createdAt)],
              ["Completed date", date(data.completedDate) || "—"],
            ]
        ).map(([k, v]) => (
          <div className="detailitem">
            <small>{k}</small>
            <b>{v}</b>
          </div>
        ))}
      </div>
    </>
  );
}
function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/employees/add" element={<EmployeeForm />} />
        <Route path="/employees/edit/:id" element={<EmployeeForm />} />
        <Route path="/employees/:id" element={<Details type="employees" />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/tasks/add" element={<TaskForm />} />
        <Route path="/tasks/edit/:id" element={<TaskForm />} />
        <Route path="/tasks/:id" element={<Details type="tasks" />} />
        <Route
          path="*"
          element={<div className="panel">Page not found.</div>}
        />
      </Routes>
    </Shell>
  );
}
export default App;
