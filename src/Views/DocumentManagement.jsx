// Views/DocumentManagement.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function DocumentManagement() {
  const navigate = useNavigate();

  // State
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
    const fetchDocumentsForUser = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { token, userId } = getTokenAndUser();
        if (!token || !userId) {
          navigate('/login');
          return;
        }

        // Step 1: Fetch user info
        const userResponse = await axios.get(`http://localhost:8080/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!userResponse.data) {
          throw new Error("Could not fetch user data");
        }
        
        const userData = userResponse.data;
        setUser(userData);

        // Step 2: Extract user's department IDs
        const userDepartmentIds = userData.departments?.map(dep => dep.id) || [];

        // Step 3: Fetch all documents
        const documentsResponse = await axios.get("http://localhost:8083/api/documents", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!documentsResponse.data) {
          throw new Error("Could not fetch documents");
        }

        // Step 4: Filter documents based on user's departments
        const userDocuments = documentsResponse.data.filter(doc =>
          !doc.departmentId || userDepartmentIds.includes(doc.departmentId)
        );

        setDocuments(userDocuments);
      } catch (err) {
        console.error("Error fetching documents or user data:", err);
        setError(err.response?.data?.message || err.message || "An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentsForUser();
  }, [navigate]);

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDocuments = documents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(documents.length / itemsPerPage);

  const handleViewDocument = (documentId) => {
    navigate(`/documents/view/${documentId}`);
  };

  const handleEditDocument = (documentId) => {
    navigate(`/documents/edit/${documentId}`);
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    
    setLoading(true);
    try {
      const { token } = getTokenAndUser();
      if (!token) {
        navigate('/login');
        return;
      }
      
      await axios.delete(`http://localhost:8083/api/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDocuments((docs) => docs.filter((doc) => doc.id !== documentId));
    } catch (err) {
      console.error("Failed to delete document", err);
      setError(err.response?.data?.message || err.message || "Failed to delete document");
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authenticated
  if (!user && !loading) {
    navigate('/login');
    return null;
  }

  // Get status display class
  const getStatusClass = (status) => {
    switch(status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Document Management</h1>
          <Link
            to="/documents/new"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition"
          >
            Create New Document
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={() => setError(null)}
                    className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {loading ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">Loading documents...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentDocuments.length > 0 ? (
                    currentDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                              onClick={() => handleViewDocument(doc.id)}
                            >
                              {doc.title || "Untitled Document"}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 hidden md:block">
                              {doc.description && doc.description.length > 60
                                ? `${doc.description.slice(0, 60)}...`
                                : doc.description || "No description"}
                            </div>
                            <div className="flex flex-wrap mt-1 gap-1 md:hidden">
                              <span
                                className={`px-2 py-0.5 text-xs rounded-full ${getStatusClass(doc.status)}`}
                              >
                                {doc.status || "draft"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getStatusClass(doc.status)}`}
                          >
                            {doc.status || "draft"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                          {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewDocument(doc.id)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditDocument(doc.id)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No documents found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && documents.length > 0 && (
            <div className="flex flex-col md:flex-row justify-between items-center mt-4">
              <div className="flex items-center mb-4 md:mb-0">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="mr-2 p-2 border rounded-lg"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-500">
                  Showing {indexOfFirstItem + 1} to{" "}
                  {Math.min(indexOfLastItem, documents.length)} of{" "}
                  {documents.length} documents
                </span>
              </div>

              <div className="flex">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 mx-1 border rounded ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 mx-1 border rounded ${
                        currentPage === pageNum
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`px-3 py-1 mx-1 border rounded ${
                    currentPage === totalPages || totalPages === 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}