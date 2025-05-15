import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  setCurrentDocument,
  clearCurrentDocument,
  deleteDocument,
} from "../store/documentSlice";

export default function DocumentView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { currentDocument, loading } = useSelector((state) => state.documents);

  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Load document data
    if (id) {
      dispatch(setCurrentDocument(Number(id)));
    }

    // Cleanup
    return () => {
      dispatch(clearCurrentDocument());
    };
  }, [isAuthenticated, id, dispatch, navigate]);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle document deletion
  const handleDelete = () => {
    if (confirmDelete) {
      dispatch(deleteDocument(currentDocument.id));
      navigate("/documents");
    } else {
      setConfirmDelete(true);
    }
  };

  // Cancel delete confirmation
  const cancelDelete = () => {
    setConfirmDelete(false);
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <p className="text-xl text-gray-600">Loading document...</p>
      </div>
    );
  }

  if (!currentDocument) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">
            Document Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The document you are looking for does not exist or has been removed.
          </p>
          <Link
            to="/documents"
            className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition"
          >
            Back to Documents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">
            {currentDocument.title}
          </h1>

          <div className="flex space-x-3">
            <Link
              to="/documents"
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition"
            >
              Back to List
            </Link>

            {/* Only show edit button if user is the creator or an admin */}
            {(user.id === currentDocument.createdBy ||
              user.role === "admin") && (
              <Link
                to={`/documents/edit/${currentDocument.id}`}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Edit
              </Link>
            )}

            {/* Only show delete button if user is the creator or an admin */}
            {(user.id === currentDocument.createdBy ||
              user.role === "admin") && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                {confirmDelete ? "Confirm Delete" : "Delete"}
              </button>
            )}

            {/* Cancel delete confirmation */}
            {confirmDelete && (
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Document metadata */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <div className="mt-1">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    currentDocument.status === "published"
                      ? "bg-green-100 text-green-800"
                      : currentDocument.status === "approved"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {currentDocument.status.charAt(0).toUpperCase() +
                    currentDocument.status.slice(1)}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Created By</p>
              <p className="mt-1 font-medium">
                {/* This would normally display the user name from a users array */}
                User ID: {currentDocument.createdBy}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="mt-1">{formatDate(currentDocument.createdAt)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="mt-1">{formatDate(currentDocument.updatedAt)}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              {currentDocument.tags && currentDocument.tags.length > 0 ? (
                currentDocument.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 italic">No tags</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Description</p>
            <p className="text-gray-700">
              {currentDocument.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* Document content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Content</h2>
          <div className="prose max-w-none">
            {/* If content is markdown, you could use a markdown parser here */}
            <div className="whitespace-pre-wrap">{currentDocument.content}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
