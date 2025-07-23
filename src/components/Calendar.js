import React, { useState, useEffect } from "react";
import { supabase } from "./SupabaseClient";
import "./Calendar.css";

const ComplianceDeadlines = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // Default to list view
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "Company",
    due_date: "",
    priority: "Medium",
    status: "Pending",
    assigned_to: "",
  });

  const complianceTypes = [
    "All",
    "Tax",
    "Finance",
    "Company",
    "Legal Agreements",
    "Shipments",
    "KYC",
  ];
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("All Tasks");
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortOption, setSortOption] = useState("deadline");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        throw new Error("No user session found");
      }

      const { data, error } = await supabase
        .from("calendar")
        .select("*")
        .eq("user_id", sessionData.session.user.id)
        .order("due_date", { ascending: true });

      if (error) throw error;

      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = () => {
    setShowForm(true);
  };

  const handleCloseModal = () => {
    setShowForm(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      // Get the current user session
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        console.error("User is not authenticated");
        alert("You must be logged in to create a task.");
        return;
      }

      // Prepare the new task object
      const newTask = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        due_date: formData.due_date,
        priority: formData.priority,
        status: formData.status,
        assigned_to: formData.assigned_to || null, // Optional field

        user_id: sessionData.session.user.id, // Associate the task with the logged-in user
        created_at: new Date().toISOString(), // Add a timestamp
      };

      console.log("New Task:", newTask); // Debugging: Log the task object

      // Insert the new task into the "calendar" table
      const { data, error } = await supabase.from("calendar").insert([newTask]);

      if (error) {
        console.error("Supabase Insert Error:", error); // Debugging: Log the error
        alert("Failed to add task. Please try again.");
        return;
      }

      console.log("Task added successfully:", data); // Debugging: Log the response

      // Refresh the task list and reset the form
      await fetchTasks();
      setFormData({
        title: "",
        description: "",
        type: "Company",
        due_date: "",
        priority: "Medium",
        status: "Pending",
        assigned_to: "",
      });
      setSelectedTags([]);
      setShowForm(false); // Close the form modal
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add task. Please try again.");
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle tag click to toggle selection
  const handleTagClick = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const { error } = await supabase
        .from("calendar")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) {
        console.error("Error updating status:", error);
        alert("Failed to update task status. Please try again.");
        return;
      }

      // Update the task in the local state to avoid a full refetch
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update task status. Please try again.");
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortOption === "deadline") {
      return new Date(a.due_date) - new Date(b.due_date); // Sort by deadline
    } else if (sortOption === "priority") {
      const priorityOrder = { high: 1, medium: 2, low: 3 }; // Priority order
      return (
        priorityOrder[a.priority.toLowerCase()] -
        priorityOrder[b.priority.toLowerCase()]
      ); // Sort by priority
    }
    return 0;
  });

  const filteredTasks = sortedTasks.filter((task) => {
    // Filter by category
    if (activeCategory !== "All" && task.type !== activeCategory) {
      return false;
    }
    
    // Filter by tab
    if (activeTab === "All Tasks") {
      return true; // Show all tasks
    } else if (activeTab === "Ongoing") {
      return task.status === "In Progress"; // Show tasks with status "In Progress"
    } else if (activeTab === "Blocked") {
      return task.status === "Blocked"; // Show tasks with status "Blocked"
    } else if (activeTab === "Completed") {
      return task.status === "Completed"; // Show tasks with status "Completed"
    }
    return false; // Default case
  });

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <h2>Tasks</h2>
        <p>Manage and track your company's tasks and to-dos</p>
        
        <div className="tasks-actions">
          <button className="add-task-button" onClick={handleAddTask}>
            <span>+</span> Start a New Task <span>▼</span>
          </button>
          
          <div className="view-controls">
            <div className="view-options">
              <button
                className={`list-view-button ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <span className="icon">☰</span>
              </button>
              <button
                className={`grid-view-button ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <span className="icon">▦</span>
              </button>
            </div>
            
            <div className="sort-control">
              <select
                className="sort-dropdown"
                value={sortOption}
                onChange={handleSortChange}
              >
                <option value="deadline">Sort by Deadline</option>
                <option value="priority">Sort by Priority</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="filter-buttons tab-buttons">
        {["All Tasks", "Ongoing", "Blocked", "Completed"].map((tab) => (
          <button
            key={tab}
            className={`filter-button ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Categories Section */}
      <div className="categories-section">
        <div className="categories-label">Categories:</div>
        <div className="filter-buttons category-buttons">
          {complianceTypes.map((type) => (
            <button
              key={type}
              className={`filter-button ${activeCategory === type ? "active" : ""}`}
              onClick={() => setActiveCategory(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Task count */}
      <div className="tasks-count">
        <h3>Tasks <span className="count">({filteredTasks.length})</span></h3>
      </div>

      {showForm && (
        <div className="deadline-form-overlay" onClick={handleCloseModal}>
          <div
            className="deadline-form-container"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
          >
            <h3>Create New Company Task</h3>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                  placeholder="Enter task title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  required
                  placeholder="Enter task description"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="due_date">Deadline</label>
                  <input
                    type="date"
                    id="due_date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="type">Category</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleFormChange}
                    required
                  >
                    {complianceTypes.slice(1).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="assigned_to">Assigned To (optional)</label>
                <input
                  type="text"
                  id="assigned_to"
                  name="assigned_to"
                  value={formData.assigned_to}
                  onChange={handleFormChange}
                  placeholder="Enter assignee name"
                />
              </div>

              {/* Company Tags */}
              <div className="form-group company-tags">
                <label>Company Tags</label>
                <div className="tags-container">
                  {["documentation", "policy", "operations", "structure"].map((tag) => (
                    <span
                      key={tag}
                      className={`tag ${selectedTags.includes(tag) ? "selected" : ""}`}
                      onClick={() => handleTagClick(tag)}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="no-tasks">No tasks found</div>
      ) : (
        <div className="tasks-list">
          {filteredTasks.map((task, index) => (
            <div key={index} className={`task-item ${viewMode}-view`}>
              <div className="task-icon">
                {task.type === "Finance" && "📊"}
                {task.type === "Tax" && "📋"}
                {task.type === "Company" && "👤"}
                {task.type === "Legal Agreements" && "📄"}
                {task.type === "Shipments" && "📦"}
                {task.type === "KYC" && "🔍"}
              </div>
              <div className="task-content">
                <div className="task-header">
                  <div className="task-title">
                    <h3>{task.title}</h3>
                    <p className="task-description">{task.description}</p>
                  </div>
                </div>
                <div className="task-tags">
                  <span className="task-tag">{task.type}</span>
                  {task.recurring && <span className="task-tag">Recurring</span>}
                </div>
              </div>
              <div className="task-meta">
                <div className="task-date">
                  <span className="meta-icon">📅</span> {task.due_date}
                </div>
                <div className={`priority ${task.priority.toLowerCase()}`}>
                  {task.priority}
                </div>
                <div className="status-wrapper">
                  <span className={`status-indicator status-${task.status.toLowerCase().replace(/\s+/g, '-')}`}></span>
                  <select 
                    className="task-status-dropdown"
                    value={task.status}
                    onChange={(e) => {
                      handleStatusChange(task.id, e.target.value);
                    }}
                  >
                    <option value="Pending">
                      Pending
                    </option>
                    <option value="In Progress">
                      In Progress
                    </option>
                    <option value="Blocked">
                      Blocked
                    </option>
                    <option value="Completed">
                      Completed
                    </option>
                  </select>
                </div>
                <div className="assigned-to">
                  <span className="meta-icon">👤</span> {task.assigned_to}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComplianceDeadlines;
