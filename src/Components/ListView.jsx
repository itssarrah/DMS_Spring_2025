import React, { useState, useEffect } from "react";
import axios from "axios";

import {
  Search,
  Filter,
  X,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  UserPlus,
} from "lucide-react";

const EmployeeDataTable = () => {
  // State to store backend data
  const [backendData, setBackendData] = useState({
    data: [],
    filters: [],
    pagination: {
      current_page: 1,
      has_next: false,
      has_prev: false,
      per_page: 15,
      total_pages: 1,
      total_records: 0,
    },
    sort: {
      order: "asc",
      sort_by: "name",
    },
    status: "loading",
  });

  // State for query parameters
  const [queryParams, setQueryParams] = useState({
    page: 1,
    per_page: 15,
    search: "",
    sort_by: "name",
    order: "asc",
    filters: [],
  });

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [newFilter, setNewFilter] = useState({
    key: "name",
    op: "contains",
    value: "",
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    hire_date: new Date().toISOString().split("T")[0],
    position: "",
    department: "",
    status: "Active",
  });
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [addUserError, setAddUserError] = useState(null);

  // Available filter fields
  const filterFields = [
    { label: "Name", value: "name" },
    { label: "Email", value: "email" },
    { label: "Department", value: "department" },
    { label: "Position", value: "position" },
    { label: "Status", value: "status" },
  ];

  // Filter operators
  const filterOperators = [
    { label: "Contains", value: "contains" },
    { label: "Equals", value: "eq" },
    { label: "Greater than", value: "gt" },
    { label: "Less than", value: "lt" },
  ];

  // Status options
  const statusOptions = ["Active", "Inactive", "On Leave"];

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Construct the query parameters (pagination and sorting)
        const queryParamsObject = {
          page: queryParams.page,
          per_page: queryParams.per_page,
          sort_by: queryParams.sort_by,
          order: queryParams.order,
        };

        // Ensure filters are formatted properly
        const filters = Array.isArray(queryParams.filters)
          ? queryParams.filters
          : [];

        console.log("Sending request with filters:", filters);

        // Make the API call
        const response = await axios.post(
          "http://127.0.0.1:5000/api/users",
          filters, // Send filters as the request body
          { params: queryParamsObject } // Send pagination/sorting as query parameters
        );

        console.log("API Response:", response.data);
        setBackendData(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [queryParams]);

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setQueryParams((prev) => ({
      ...prev,
      search: searchInput,
      page: 1, // Reset to first page on new search
    }));
  };

  // Handle sorting
  const handleSort = (key) => {
    setQueryParams((prev) => ({
      ...prev,
      sort_by: key,
      order: prev.sort_by === key && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > backendData.pagination.total_pages) return;

    setQueryParams((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setNewFilter((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Add a new filter
  const handleAddFilter = () => {
    if (!newFilter.value.trim()) return;

    setQueryParams((prev) => ({
      ...prev,
      filters: [...prev.filters, newFilter],
      page: 1, // Reset to first page on new filter
    }));

    setNewFilter({ key: "name", op: "contains", value: "" });
    setShowFilterModal(false);
  };

  // Remove a filter
  const handleRemoveFilter = (index) => {
    setQueryParams((prev) => ({
      ...prev,
      filters: prev.filters.filter((_, i) => i !== index),
      page: 1, // Reset to first page when filter removed
    }));
  };

  // Handle new user form changes
  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Generate next ID for new user
  const getNextId = () => {
    if (!backendData.data || backendData.data.length === 0) return 1;
    const maxId = Math.max(
      ...backendData.data.map((user) => parseInt(user.id))
    );
    return maxId + 1;
  };

  // Submit new user (frontend only)
  const handleAddUser = (e) => {
    e.preventDefault();
    setIsAddingUser(true);
    setAddUserError(null);

    try {
      // Validate required fields
      if (
        !newUser.name ||
        !newUser.email ||
        !newUser.position ||
        !newUser.department
      ) {
        throw new Error("All required fields must be filled");
      }

      // Generate a new user with ID
      const userWithId = {
        ...newUser,
        id: getNextId().toString(),
      };

      // Update backendData with the new user
      setBackendData((prev) => {
        // Add to the data array
        const newData = [userWithId, ...prev.data];

        // Update pagination
        const newPagination = {
          ...prev.pagination,
          total_records: prev.pagination.total_records + 1,
          total_pages: Math.ceil(
            (prev.pagination.total_records + 1) / prev.pagination.per_page
          ),
        };

        return {
          ...prev,
          data: newData,
          pagination: newPagination,
        };
      });

      console.log("User added (frontend only):", userWithId);

      // Reset form and close modal
      setNewUser({
        name: "",
        email: "",
        hire_date: new Date().toISOString().split("T")[0],
        position: "",
        department: "",
        status: "Active",
      });
      setShowAddUserModal(false);
    } catch (err) {
      setAddUserError(err.message);
      console.error("Error adding user:", err);
    } finally {
      setIsAddingUser(false);
    }
  };

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-gray-100 text-gray-800";
      case "On Leave":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to get sort icon
  const getSortIcon = (key) => {
    if (queryParams.sort_by !== key) {
      return null;
    }
    return queryParams.order === "asc" ? (
      <ChevronUp className="h-3 w-3" />
    ) : (
      <ChevronDown className="h-3 w-3" />
    );
  };

  // Filter modal
  const FilterModal = () => (
    <div className="absolute right-0 top-12 bg-white p-4 rounded-md shadow-lg border border-gray-200 z-10 w-64">
      <h3 className="font-medium mb-2">Add Filter</h3>

      <div className="mb-2">
        <label className="block text-sm mb-1">Field</label>
        <select
          className="w-full p-2 border border-gray-300 rounded-md text-sm"
          value={newFilter.key}
          onChange={(e) => handleFilterChange("key", e.target.value)}
        >
          {filterFields.map((field) => (
            <option key={field.value} value={field.value}>
              {field.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-2">
        <label className="block text-sm mb-1">Operator</label>
        <select
          className="w-full p-2 border border-gray-300 rounded-md text-sm"
          value={newFilter.op}
          onChange={(e) => handleFilterChange("op", e.target.value)}
        >
          {filterOperators.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm mb-1">Value</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md text-sm"
          value={newFilter.value}
          onChange={(e) => handleFilterChange("value", e.target.value)}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button
          className="px-3 py-1 bg-gray-100 rounded-md text-sm"
          onClick={() => setShowFilterModal(false)}
        >
          Cancel
        </button>
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
          onClick={handleAddFilter}
        >
          Apply
        </button>
      </div>
    </div>
  );

  // Add User Modal
  const AddUserModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
      <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add New Employee</h3>
          <button
            onClick={() => setShowAddUserModal(false)}
            className="text-gray-500 hover:text-gray-700"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {addUserError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {addUserError}
          </div>
        )}

        <form onSubmit={handleAddUser}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={newUser.name}
              onChange={handleUserInputChange}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={newUser.email}
              onChange={handleUserInputChange}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="hire_date"
              className="block text-sm font-medium mb-1"
            >
              Hire Date
            </label>
            <input
              type="date"
              id="hire_date"
              name="hire_date"
              value={newUser.hire_date}
              onChange={handleUserInputChange}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="position"
              className="block text-sm font-medium mb-1"
            >
              Position *
            </label>
            <input
              type="text"
              id="position"
              name="position"
              value={newUser.position}
              onChange={handleUserInputChange}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="department"
              className="block text-sm font-medium mb-1"
            >
              Department *
            </label>
            <input
              type="text"
              id="department"
              name="department"
              value={newUser.department}
              onChange={handleUserInputChange}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="status" className="block text-sm font-medium mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={newUser.status}
              onChange={handleUserInputChange}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowAddUserModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm flex items-center"
              disabled={isAddingUser}
            >
              {isAddingUser ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Add Employee
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="w-[70vw] bg-white rounded-md shadow-sm border border-gray-200 mx-auto mt-8">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            USERS FROM API
          </h2>
          <div className="flex space-x-2">
            <button
              type="button"
              className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              onClick={() => setShowAddUserModal(true)}
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Employee</span>
            </button>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-8 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchInput}
                onChange={handleSearchChange}
              />
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            </form>
            <div className="relative">
              <button
                type="button"
                className="flex items-center space-x-1 px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-700 hover:bg-gray-200"
                onClick={() => setShowFilterModal(!showFilterModal)}
              >
                <Filter className="h-4 w-4" />
                <span>Add Filter</span>
              </button>
              {showFilterModal && <FilterModal />}
            </div>
          </div>
        </div>

        {/* Active filters */}
        <div className="flex flex-wrap gap-2">
          {queryParams.filters.map((filter, index) => (
            <div
              key={index}
              className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
            >
              <span className="font-medium mr-1">{filter.key}</span>
              <span>{filter.op}</span>
              <span className="mx-1">{filter.value}</span>
              <button
                type="button"
                onClick={() => handleRemoveFilter(index)}
                className="ml-1 focus:outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {queryParams.search && (
            <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
              <span className="font-medium mr-1">Search:</span>
              <span className="mx-1">{queryParams.search}</span>
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setQueryParams((prev) => ({ ...prev, search: "", page: 1 }));
                }}
                className="ml-1 focus:outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center p-8 text-red-500">
          Error loading data: {error}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    ID
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>NAME</span>
                      {getSortIcon("name")}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EMAIL
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("hire_date")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>HIRE DATE</span>
                      {getSortIcon("hire_date")}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    POSITION
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DEPARTMENT
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STATUS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backendData.data && backendData.data.length > 0 ? (
                  backendData.data.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {employee.id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">
                          {employee.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {employee.email}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {employee.hire_date}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {employee.position}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {employee.department}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            employee.status
                          )}`}
                        >
                          {employee.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No results found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {backendData.pagination && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(backendData.pagination.current_page - 1) *
                      backendData.pagination.per_page +
                      1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      backendData.pagination.current_page *
                        backendData.pagination.per_page,
                      backendData.pagination.total_records
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {backendData.pagination.total_records}
                  </span>{" "}
                  results
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(queryParams.page - 1)}
                    disabled={!backendData.pagination.has_prev}
                    className={`relative inline-flex items-center px-2 py-2 rounded-md text-sm font-medium ${
                      backendData.pagination.has_prev
                        ? "text-gray-700 bg-white hover:bg-gray-50"
                        : "text-gray-400 bg-gray-100 cursor-not-allowed"
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="flex items-center">
                    <span className="text-gray-700 text-sm">
                      Page {backendData.pagination.current_page} of{" "}
                      {backendData.pagination.total_pages}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePageChange(queryParams.page + 1)}
                    disabled={!backendData.pagination.has_next}
                    className={`relative inline-flex items-center px-2 py-2 rounded-md text-sm font-medium ${
                      backendData.pagination.has_next
                        ? "text-gray-700 bg-white hover:bg-gray-50"
                        : "text-gray-400 bg-gray-100 cursor-not-allowed"
                    }`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add User Modal */}
      {showAddUserModal && <AddUserModal />}
    </div>
  );
};

export default EmployeeDataTable;
