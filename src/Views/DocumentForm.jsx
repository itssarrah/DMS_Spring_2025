// Views/DocumentForm.jsx
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  addDocument,
  updateDocument,
  setCurrentDocument,
  clearCurrentDocument,
} from "../store/documentSlice";

export default function DocumentForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { currentDocument, loading } = useSelector((state) => state.documents);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "draft",
    tags: [],
    content: "",
  });

  // Tag input state
  const [tagInput, setTagInput] = useState("");

  // Determine if we're editing or creating
  const isEditMode = Boolean(id);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate("/login");
    }

    // Load document data if in edit mode
    if (isEditMode) {
      dispatch(setCurrentDocument(Number(id)));
    } else {
      dispatch(clearCurrentDocument());
    }

    // Cleanup
    return () => {
      dispatch(clearCurrentDocument());
    };
  }, [isAuthenticated, isEditMode, id, dispatch, navigate]);

  // Populate form when currentDocument changes
  useEffect(() => {
    if (currentDocument && isEditMode) {
      setFormData({
        title: currentDocument.title || "",
        description: currentDocument.description || "",
        status: currentDocument.status || "draft",
        tags: currentDocument.tags || [],
        content: currentDocument.content || "",
      });
    }
  }, [currentDocument, isEditMode]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle tag input
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  // Add a tag
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  // Add tag on enter key
  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Remove a tag
  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditMode) {
      dispatch(
        updateDocument({
          id: currentDocument.id,
          ...formData,
        })
      );
    } else {
      dispatch(
        addDocument({
          ...formData,
          createdBy: user.id,
        })
      );
    }

    navigate("/documents");
  };

  if (!isAuthenticated) return null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-8">
          {isEditMode ? "Edit Document" : "Create New Document"}
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Document title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="A brief description of this document"
                rows="2"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                {user.role === "admin" && (
                  <option value="approved">Approved</option>
                )}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex items-center mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagKeyDown}
                  className="flex-grow p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add tags (press Enter to add)"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="ml-2 px-4 py-3 bg-secondary text-white rounded-lg hover:bg-primary transition"
                >
                  Add
                </button>
              </div>

              {/* Tag list */}
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full flex items-center"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Document content..."
                rows="10"
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate("/documents")}
                className="px-4 py-2 border text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : isEditMode
                  ? "Update Document"
                  : "Create Document"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
