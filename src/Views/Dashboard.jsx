// Views/Dashboard.jsx
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { documents } = useSelector((state) => state.documents);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Get recent documents (last 3)
  const recentDocuments = [...documents]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 3);

  // Count documents by status
  const documentStats = documents.reduce(
    (stats, doc) => {
      stats.total++;
      if (doc.status === "draft") stats.drafts++;
      if (doc.status === "published") stats.published++;
      if (doc.status === "approved") stats.approved++;
      return stats;
    },
    { total: 0, drafts: 0, published: 0, approved: 0 }
  );

  if (!isAuthenticated) return null;

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
                        {doc.status.charAt(0).toUpperCase() +
                          doc.status.slice(1)}
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
            <Link
              to="/users"
              className="flex items-center p-3 border rounded-lg hover:bg-gray-50"
            >
              <span className="text-lg mr-2">👥</span>
              <span>User Management</span>
            </Link>
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
}
