import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

export default function AdminDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("departments");
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form states
  const [newDepartment, setNewDepartment] = useState({ name: "", description: "" });
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [userAssignment, setUserAssignment] = useState({ userId: "", departmentId: "" });
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    roles: [] // e.g., ["ROLE_USER"] or ["ROLE_ADMIN"]
  });
  
  // Check if user is admin
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");
  const token = user.token;
  
  // Fetch departments
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/api/departments", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error("Failed to fetch departments");
      
      const data = await response.json();
      setDepartments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8083/api/categories", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error("Failed to fetch categories");
      
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/api/users", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error("Failed to fetch users");
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Create department
  const createDepartment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newDepartment)
      });
      
      if (!response.ok) throw new Error("Failed to create department");
      
      fetchDepartments();
      setNewDepartment({ name: "", description: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Create category
  const createCategory = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8083/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newCategory)
      });
      
      if (!response.ok) throw new Error("Failed to create category");
      
      fetchCategories();
      setNewCategory({ name: "", description: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Assign user to department
  const assignUserToDepartment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/users/${userAssignment.userId}/department/${userAssignment.departmentId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error("Failed to assign user to department");
      
      setUserAssignment({ userId: "", departmentId: "" });
      alert("User assigned to department successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Delete department
  const deleteDepartment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/departments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error("Failed to delete department");
      
      fetchDepartments();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Delete category
  const deleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8083/api/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error("Failed to delete category");
      
      fetchCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Remove user from department
  const removeUserFromDepartment = async (userId, departmentId) => {
    if (!window.confirm("Are you sure you want to remove this user from the department?")) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/users/${userId}/departments/${departmentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error("Failed to remove user from department");
      
      // Refresh data after operation
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle user registration
  const handleUserRegistration = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });

      if (!response.ok) throw new Error("Failed to register user");

      alert("User registered successfully");
      setNewUser({ username: "", email: "", password: "", roles: [] });
      // Optionally refresh the users list if on that tab
      if (activeTab === "users") {
        fetchUsers();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === "departments") {
      fetchDepartments();
    } else if (activeTab === "categories") {
      fetchCategories();
    } else if (activeTab === "users") {
      fetchUsers();
      fetchDepartments(); // Also fetch departments for the dropdown
    }
  }, [activeTab]);
  
  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700">
            You need administrator privileges to access this page.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-6">Admin Dashboard</h1>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
            <button 
              className="text-sm underline" 
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}
        
        {/* Tab navigation */}
        <div className="mb-6 border-b">
          <div className="flex">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "departments"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("departments")}
            >
              Departments
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "categories"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("categories")}
            >
              Categories
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "users"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("users")}
            >
              User Management
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "createUser"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("createUser")}
            >
              Create User
            </button>
          </div>
        </div>
        
        {/* Content based on active tab */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Departments Tab */}
          {activeTab === "departments" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Manage Departments</h2>
              
              {/* Create department form */}
              <form onSubmit={createDepartment} className="mb-6 bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Create New Department</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md"
                      value={newDepartment.name}
                      onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md"
                      value={newDepartment.description}
                      onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Department"}
                </button>
              </form>
              
              {/* Departments list */}
              <h3 className="font-medium mb-2">Existing Departments</h3>
              {loading && activeTab === "departments" ? (
                <p>Loading departments...</p>
              ) : departments.length === 0 ? (
                <p className="text-gray-500">No departments found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-3 text-left">ID</th>
                        <th className="py-2 px-3 text-left">Name</th>
                        <th className="py-2 px-3 text-left">Description</th>
                        <th className="py-2 px-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departments.map((dept) => (
                        <tr key={dept.id} className="border-t">
                          <td className="py-2 px-3">{dept.id}</td>
                          <td className="py-2 px-3">{dept.name}</td>
                          <td className="py-2 px-3">{dept.description}</td>
                          <td className="py-2 px-3">
                            <button
                              onClick={() => deleteDepartment(dept.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {/* Categories Tab */}
          {activeTab === "categories" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Manage Categories</h2>
              
              {/* Create category form */}
              <form onSubmit={createCategory} className="mb-6 bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Create New Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Category"}
                </button>
              </form>
              
              {/* Categories list */}
              <h3 className="font-medium mb-2">Existing Categories</h3>
              {loading && activeTab === "categories" ? (
                <p>Loading categories...</p>
              ) : categories.length === 0 ? (
                <p className="text-gray-500">No categories found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-3 text-left">ID</th>
                        <th className="py-2 px-3 text-left">Name</th>
                        <th className="py-2 px-3 text-left">Description</th>
                        <th className="py-2 px-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((cat) => (
                        <tr key={cat.id} className="border-t">
                          <td className="py-2 px-3">{cat.id}</td>
                          <td className="py-2 px-3">{cat.name}</td>
                          <td className="py-2 px-3">{cat.description}</td>
                          <td className="py-2 px-3">
                            <button
                              onClick={() => deleteCategory(cat.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {/* User Management Tab */}
          {activeTab === "users" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">User Management</h2>
              
              {/* Assign user to department form */}
              <form onSubmit={assignUserToDepartment} className="mb-6 bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Assign User to Department</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select User
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={userAssignment.userId}
                      onChange={(e) => setUserAssignment({...userAssignment, userId: e.target.value})}
                      required
                    >
                      <option value="">-- Select User --</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.username} ({user.email || user.fullName || "No details"})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Department
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={userAssignment.departmentId}
                      onChange={(e) => setUserAssignment({...userAssignment, departmentId: e.target.value})}
                      required
                    >
                      <option value="">-- Select Department --</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                  disabled={loading}
                >
                  {loading ? "Assigning..." : "Assign User to Department"}
                </button>
              </form>
              
              {/* Users list */}
              <h3 className="font-medium mb-2">User List</h3>
              {loading && activeTab === "users" ? (
                <p>Loading users...</p>
              ) : users.length === 0 ? (
                <p className="text-gray-500">No users found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-3 text-left">ID</th>
                        <th className="py-2 px-3 text-left">Username</th>
                        <th className="py-2 px-3 text-left">Full Name</th>
                        <th className="py-2 px-3 text-left">Email</th>
                        <th className="py-2 px-3 text-left">Departments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-t">
                          <td className="py-2 px-3">{user.id}</td>
                          <td className="py-2 px-3">{user.username}</td>
                          <td className="py-2 px-3">{user.fullName || "-"}</td>
                          <td className="py-2 px-3">{user.email || "-"}</td>
                          <td className="py-2 px-3">
                            {user.departments?.length > 0 ? (
                              <div>
                                {user.departments.map((dept, idx) => (
                                  <div key={idx} className="flex items-center mb-1">
                                    <span className="mr-2">{dept.name}</span>
                                    <button
                                      onClick={() => removeUserFromDepartment(user.id, dept.id)}
                                      className="text-xs text-red-600 hover:text-red-800"
                                    >
                                      (Remove)
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              "No departments"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Create User Tab */}
          {activeTab === "createUser" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Create New User</h2>
              <form onSubmit={handleUserRegistration} className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border rounded-md"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border rounded-md"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Roles</label>
                    <select
                      multiple
                      className="w-full px-3 py-2 border rounded-md"
                      value={newUser.roles}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          roles: Array.from(e.target.selectedOptions, (option) => option.value)
                        })
                      }
                    >
                      <option value="ROLE_USER">ROLE_USER</option>
                      <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Hold Ctrl (Cmd on Mac) to select multiple roles</p>
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Register User"}
                </button>
              </form>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}