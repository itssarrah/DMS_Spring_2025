// Views/DocumentManagement.jsx
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  setFilters,
  clearFilters,
  setCurrentDocument,
  deleteDocument,
} from "../store/documentSlice";

export default function DocumentManagement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { documents, filters } = useSelector((state) => state.documents);

  // Local state for search and pagination
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || "");
  const [selectedStatus, setSelectedStatus] = useState(filters.status || "all");
  const [selectedTag, setSelectedTag] = useState(filters.tags[0] || "all");
  const [sortField, setSortField] = useState("updatedAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Apply filters when local state changes
  useEffect(() => {
    dispatch(
      setFilters({
        searchTerm,
        status: selectedStatus === "all" ? null : selectedStatus,
        tags: selectedTag === "all" ? [] : [selectedTag],
      })
    );
  }, [searchTerm, selectedStatus, selectedTag, dispatch]);

  // Get all unique tags from documents
  const allTags = [...new Set(documents.flatMap((doc) => doc.tags || []))];

  // Filter documents based on filters
  const filteredDocuments = documents.filter((doc) => {
    // Search term filter
    const matchesSearch =
      !filters.searchTerm ||
      doc.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(filters.searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = !filters.status || doc.status === filters.status;

    // Tags filter
    const matchesTags =
      filters.tags.length === 0 ||
      filters.tags.some((tag) => doc.tags && doc.tags.includes(tag));

    // Filter documents for regular users to see only their own documents
    const matchesUser = user.role === "admin" || doc.createdBy === user.id;

    return matchesSearch && matchesStatus && matchesTags && matchesUser;
  });

  // Sort filtered documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle date fields
    if (sortField === "createdAt" || sortField === "updatedAt") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Paginate documents
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDocuments = sortedDocuments.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(sortedDocuments.length / itemsPerPage);

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Handle view document
  const handleViewDocument = (documentId) => {
    dispatch(setCurrentDocument(documentId));
    navigate(`/documents/view/${documentId}`);
  };

  // Handle edit document
  const handleEditDocument = (documentId) => {
    dispatch(setCurrentDocument(documentId));
    navigate(`/documents/edit/${documentId}`);
  };

  // Handle delete document
  const handleDeleteDocument = (documentId) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      dispatch(deleteDocument(documentId));
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSelectedTag("all");
    dispatch(clearFilters());
  };

  if (!isAuthenticated) return null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">
            Document Management
          </h1>
          <Link
            to="/documents/new"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition"
          >
            Create New Document
          </Link>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="approved">Approved</option>
              </select>
            </div>

            {/* Tag Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tag
              </label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="all">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters */}
            <div className="flex items-end">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 border text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center">
                      Title
                      {sortField === "title" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hidden md:table-cell"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      Status
                      {sortField === "status" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hidden lg:table-cell"
                    onClick={() => handleSort("updatedAt")}
                  >
                    <div className="flex items-center">
                      Last Updated
                      {sortField === "updatedAt" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
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
                            {doc.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 hidden md:block">
                            {doc.description.length > 60
                              ? `${doc.description.slice(0, 60)}...`
                              : doc.description}
                          </div>
                          <div className="flex flex-wrap mt-1 gap-1 md:hidden">
                            <span
                              className={`px-2 py-0.5 text-xs rounded-full ${
                                doc.status === "published"
                                  ? "bg-green-100 text-green-800"
                                  : doc.status === "approved"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {doc.status}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            doc.status === "published"
                              ? "bg-green-100 text-green-800"
                              : doc.status === "approved"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                        {new Date(doc.updatedAt).toLocaleDateString()}
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
                      No documents found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {sortedDocuments.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center">
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
                  {Math.min(indexOfLastItem, sortedDocuments.length)} of{" "}
                  {sortedDocuments.length} documents
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
                  return pageNum;
                }).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 mx-1 border rounded ${
                      currentPage === page
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 mx-1 border rounded ${
                    currentPage === totalPages
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
