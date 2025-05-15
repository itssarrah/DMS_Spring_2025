import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { useState } from "react";

export default function Sidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  // Return nothing if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  const navLinks = [
    { path: "/dashboard", name: "Dashboard", icon: "📊" },
    { path: "/documents", name: "Documents", icon: "📄" },
    { path: "/users", name: "Users", icon: "👥" },
    { path: "/list", name: "API Users", icon: "💾" },
  ];

  // Helper function to check if a nav item is active
  const isActive = (path) => {
    if (path === "/dashboard" && location.pathname === "/dashboard") {
      return true;
    }
    if (path === "/documents" && location.pathname.includes("/documents")) {
      return true;
    }
    if (path === "/users" && location.pathname.includes("/users")) {
      return true;
    }
    return false;
  };

  return (
    <div
      className={`bg-gray-800 text-white transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      } min-h-screen flex flex-col fixed`}
    >
      {/* Toggle button */}
      <button
        className="self-end p-4 text-gray-400 hover:text-white"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? "→" : "←"}
      </button>

      {/* Logo and App name */}
      <div className="p-4 flex items-center justify-center">
        <img
          src="/logo.jpg"
          alt="DocMedia Logo"
          className="w-10 h-10 object-cover rounded-md"
        />
        {!isCollapsed && <h1 className="ml-3 text-xl font-bold">DocMedia</h1>}
      </div>

      {/* User Profile Section */}
      <div className={`mt-6 ${isCollapsed ? "px-2" : "px-6"} mb-8`}>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mb-2">
            <span className="text-2xl">{user.name?.charAt(0) || "U"}</span>
          </div>

          {!isCollapsed && (
            <>
              <h2 className="text-lg font-medium">{user.name || "User"}</h2>
              <p className="text-sm text-gray-400">{user.email || ""}</p>
              <div className="mt-2 px-3 py-1 bg-blue-600 text-xs rounded-full">
                {user.role || "User"}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`flex items-center ${
                  isCollapsed ? "justify-center px-2" : "px-6"
                } py-3 hover:bg-gray-700 transition-colors ${
                  isActive(link.path)
                    ? "bg-gray-700 border-l-4 border-blue-500"
                    : ""
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                {!isCollapsed && <span className="ml-3">{link.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Create new document button */}
      <div className={`my-4 ${isCollapsed ? "px-2" : "px-6"}`}>
        <Link
          to="/documents/new"
          className={`flex items-center ${
            isCollapsed ? "justify-center" : ""
          } bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors`}
        >
          <span>+</span>
          {!isCollapsed && <span className="ml-2">New Document</span>}
        </Link>
      </div>

      {/* Logout */}
      <div className="mt-auto mb-6">
        <button
          onClick={handleLogout}
          className={`flex items-center ${
            isCollapsed ? "justify-center px-2" : "px-6"
          } py-3 text-gray-400 hover:text-white hover:bg-red-600 transition-colors w-full`}
        >
          <span className="text-xl">🚪</span>
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </div>
  );
}
