import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [documentStats, setDocumentStats] = useState({
    total: 0,
    drafts: 0,
    published: 0,
    approved: 0,
  });
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get authenticated user info from localStorage
  const getTokenAndUser = () => {
    try {
      const serializedUser = localStorage.getItem("user");
      
      if (serializedUser === null) {
        return { token: null, userId: null, roles: [] };
      }
      const user = JSON.parse(serializedUser);
      return { token: user.token, userId: user.id, roles: user.roles || [] };
    } catch (error) {
      console.error("Could not load token from storage:", error);
      return { token: null, userId: null, roles: [] };
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { token, userId } = getTokenAndUser();
        if (!token) {
          throw new Error("No authentication token found");
        }

        const userResponse = await axios.get(`http://localhost:8080/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(userResponse.data);

        // Get department IDs from user
        const userDepartmentIds = userResponse.data.departments.map(dep => dep.id);
        // Fetch all documents
        const documentsResponse = await axios.get("http://localhost:8083/api/documents", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Filter documents where document.department.id is in user's departments
        const userDocuments = documentsResponse.data.filter(doc =>
          doc.departmentId && userDepartmentIds.includes(doc.departmentId)
        );

        
        // Calculate document statistics
        const stats = {
          total: userDocuments.length,
          drafts: userDocuments.filter(doc => doc.status === "draft").length,
          published: userDocuments.filter(doc => doc.status === "published").length,
          approved: userDocuments.filter(doc => doc.status === "approved").length,
        };
        
        setDocumentStats(stats);
        
        // Sort documents by updated date and take the most recent 5
        const sorted = [...userDocuments].sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        ).slice(0, 5);
        
        setRecentDocuments(sorted);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto text-center py-12">
          <p className="text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto text-center py-12">
          <p className="text-lg text-red-600">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-8">Dashboard</h1>

        {/* Welcome card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-secondary mb-2">
            Welcome back, {user?.fullName}!
          </h2>
          <p className="text-gray-600">
            Here's an overview of your document management system.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-500">Total Documents</p>
            <p className="text-2xl font-bold text-primary">
              {documentStats.total}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-500">Draft Documents</p>
            <p className="text-2xl font-bold text-yellow-500">
              {documentStats.drafts}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-500">Published Documents</p>
            <p className="text-2xl font-bold text-green-500">
              {documentStats.published}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-500">Approved Documents</p>
            <p className="text-2xl font-bold text-blue-500">
              {documentStats.approved}
            </p>
          </div>
        </div>

        {/* Recent documents */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-secondary">
              Recent Documents
            </h2>
            <Link
              to="/documents"
              className="text-sm text-primary hover:underline"
            >
              View all documents
            </Link>
          </div>

          {recentDocuments.length > 0 ? (
            <div className="space-y-4">
              {recentDocuments.map((doc) => (
                <div key={doc.id} className="border-b pb-4 last:border-0">
                  <Link
                    to={`/documents/view/${doc.id}`}
                    className="block hover:bg-gray-50 rounded p-2 -mx-2"
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium text-gray-800">{doc.title}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          doc.status === "published"
                            ? "bg-green-100 text-green-800"
                            : doc.status === "approved"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {doc.status ? doc.status.charAt(0).toUpperCase() +
                          doc.status.slice(1) : "Draft"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {doc.description}
                    </p>
                    <div className="text-xs text-gray-400 mt-2">
                      Last updated:{" "}
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              No documents found. Create your first document now!
            </p>
          )}

          <div className="mt-6">
            <Link
              to="/documents/new"
              className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition"
            >
              Create New Document
            </Link>
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-secondary mb-4">
            Quick Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/documents"
              className="flex items-center p-3 border rounded-lg hover:bg-gray-50"
            >
              <span className="text-lg mr-2">📄</span>
              <span>All Documents</span>
            </Link>
            {user && (user.role === "admin" || user.role === "manager") && (
              <Link
                to="/users"
                className="flex items-center p-3 border rounded-lg hover:bg-gray-50"
              >
                <span className="text-lg mr-2">👥</span>
                <span>User Management</span>
              </Link>
            )}
            <Link
              to="/profile"
              className="flex items-center p-3 border rounded-lg hover:bg-gray-50"
            >
              <span className="text-lg mr-2">👤</span>
              <span>My Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;