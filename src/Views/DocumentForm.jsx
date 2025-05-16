import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchUserDepartments,
  selectUserDepartments,
  selectDepartmentsLoading,
  fetchDepartments,
  selectAllDepartments,
} from "../store/departmentSlice";

import {
  fetchCategories,
  selectAllCategories,
  selectCategoriesLoading,
} from "../store/categorySlice";

import {
  fetchDocumentById,
  createDocument,
  updateDocumentAsync,
  selectCurrentDocument,
  selectDocumentsLoading,
  clearCurrentDocument,
} from "../store/documentSlice";

import axios from "axios";

export default function DocumentForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Get departments and categories from Redux store
  const departments = useSelector(selectAllDepartments);

  // State variables update
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const currentDocument = useSelector(selectCurrentDocument);
  const loading = useSelector(selectDocumentsLoading);

  // Get user's departments from Redux store - changed from departments to userDepartments
  const userDepartments = useSelector(selectUserDepartments);
  const departmentsLoading = useSelector(selectDepartmentsLoading);
  const categories = useSelector(selectAllCategories);
  const categoriesLoading = useSelector(selectCategoriesLoading);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "draft",
    tags: [],
    content: "",
    departmentId: "",
    categoryId: "",
  });

  // File state
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [fileError, setFileError] = useState("");

  // Tag input state
  const [tagInput, setTagInput] = useState("");

  // Determine if we're editing or creating
  const isEditMode = Boolean(id);

  // Update useEffect to fetch user departments instead of all departments
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate("/login");
    }

    // Load document data if in edit mode
    if (isEditMode) {
      dispatch(fetchDocumentById(Number(id)));
    } else {
      dispatch(clearCurrentDocument());
    }

    // Fetch user's departments instead of all departments
    dispatch(fetchUserDepartments());
    dispatch(fetchCategories());

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
        departmentId: currentDocument.departmentId || "",
        categoryId: currentDocument.categoryId || "",
      });
    }
  }, [currentDocument, isEditMode]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setFileError("File size exceeds 10MB limit");
        setSelectedFile(null);
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setFileError("Only PDF and Word documents are allowed");
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
      setFileError("");
    }
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
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user has permission to create in this department
    const selectedDepartmentId = Number(formData.departmentId);
    const userHasAccess = userDepartments.some(dept => dept.id === selectedDepartmentId);

    if (!userHasAccess && !isEditMode) {
      setFileError('You do not have permission to create documents in this department');
      return;
    }

    let fileData = {};

    // Upload file if selected
    if (selectedFile) {
      try {
        setFileUploading(true);

        // Create FormData for file upload
        const fileFormData = new FormData();
        fileFormData.append('file', selectedFile);

        // Upload to storage service
        const uploadResponse = await axios.post(
          'http://localhost:8000/api/storage/upload',
          fileFormData,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        setFileUploading(false);

        // Get filename from response
        fileData = {
          fileName: uploadResponse.data.filename,
          fileType: selectedFile.type,
        };
      } catch (error) {
        setFileUploading(false);
        setFileError('Error uploading file: ' + (error.response?.data?.message || error.message));
        return;
      }
    }
    
    // Prepare final data for API
    const documentData = {
      ...formData,
      ...fileData,
      departmentId: Number(formData.departmentId),
      categoryId: Number(formData.categoryId),
      // Convert tags array to string if the API expects it that way
      tags: formData.tags.join(',')
    };
    
    try {
      if (isEditMode) {
        await dispatch(updateDocumentAsync({
          id: currentDocument.id,
          ...documentData
        })).unwrap();
      } else {
        await dispatch(createDocument({
          ...documentData,
          createdBy: user.id,
        })).unwrap();
      }
      navigate("/documents");
    } catch (error) {
      console.error("Failed to save document:", error);
    }
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

            {/* Department Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                required
                disabled={departmentsLoading}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Department</option>
                {departmentsLoading ? (
                  <option value="" disabled>Loading departments...</option>
                ) : userDepartments.length > 0 ? (
                  userDepartments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No departments assigned to you</option>
                )}
              </select>
              {departmentsLoading && (
                <div className="mt-1 text-sm text-gray-500">
                  Loading departments...
                </div>
              )}
              {!departmentsLoading && userDepartments.length === 0 && (
                <div className="mt-1 text-sm text-red-500">
                  You don't have any assigned departments. Please contact an administrator.
                </div>
              )}
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                disabled={categoriesLoading}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Category</option>
                {categoriesLoading ? (
                  <option value="" disabled>Loading categories...</option>
                ) : (
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                )}
              </select>
              {categoriesLoading && (
                <div className="mt-1 text-sm text-gray-500">
                  Loading categories...
                </div>
              )}
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

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document File
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="p-2 border rounded w-full"
                  accept=".pdf,.doc,.docx"
                />
              </div>
              {selectedFile && (
                <div className="mt-2 text-sm text-green-600">
                  Selected file: {selectedFile.name}
                </div>
              )}
              {fileError && (
                <div className="mt-2 text-sm text-red-600">
                  {fileError}
                </div>
              )}
              {!isEditMode && !selectedFile && (
                <div className="mt-2 text-sm text-gray-500">
                  Upload a PDF or Word document (max 10MB)
                </div>
              )}
              {isEditMode && currentDocument?.fileName && !selectedFile && (
                <div className="mt-2 text-sm text-gray-600">
                  Current file: {currentDocument.fileName}
                  <span className="ml-2 text-blue-500">(Leave empty to keep current file)</span>
                </div>
              )}
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
                Additional Notes
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Additional notes or document content..."
                rows="6"
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
                disabled={loading || fileUploading || departmentsLoading || categoriesLoading}
              >
                {loading || fileUploading
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