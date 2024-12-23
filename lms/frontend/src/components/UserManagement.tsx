import React, { useState, useEffect } from "react";
import { Edit, Plus, UserCheck, UserX } from "lucide-react"; // Updated icons
import api from "../utils/api";
import UserForm from "./UserForm";

interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isFormVisible, setFormVisible] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(""); // Search functionality
  const [currentPage, setCurrentPage] = useState<number>(1);
  const usersPerPage = 10;
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUsers = async () => {
    setLoading(true); // Set loading to true when fetching starts
    try {
      const response = await api.get("/users");
      setUsers(response.data);
      setLoading(false); // Set loading to false once data is fetched
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false); // Handle loading state even if an error occurs
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await api.post(`/users/${userId}/disable`);
      fetchUsers(); // Re-fetch users after status update
    } catch (error) {
      console.error(
        `Error ${isActive ? "disabling" : "enabling"} user:`,
        error
      );
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      await api.post(`/users/${userId}/reset-password`);
      alert("Password reset successfully");
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  };

  const handleEditUser = (userId: string) => {
    setCurrentUserId(userId);
    setFormVisible(true);
  };

  const handleAddUser = () => {
    setCurrentUserId(null);
    setFormVisible(true);
  };

  const handleCloseForm = () => {
    setFormVisible(false);
    setCurrentUserId(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const totalUsers = users.length;
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users
    .filter((user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(indexOfFirstUser, indexOfLastUser);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(totalUsers / usersPerPage); i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 border rounded ${i === currentPage
            ? "bg-sky-700 text-white"
            : "bg-white text-sky-500"
            }`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">User Management</h2>
        <button
          onClick={handleAddUser}
          className="flex items-center text-white bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded"
        >
          <Plus className="mr-2" /> Add User
        </button>
      </div>

      {/* Search Bar */}

      <div className="px-4 py-5">
        <input
          type="text"
          placeholder="Search users..."
          className="border border-gray-300 rounded-md px-4 py-2 w-full"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      {/* Loading Spinner */}
      {loading ? (
        <div className="flex items-center justify-center bg-none">
          <div className="animate-spin inline-block size-10 border-[4px] border-current border-t-transparent text-sky-600 rounded-full dark:text-sky-500" role="status" aria-label="loading">
            <span className="sr-only">Loading...</span>
          </div>
        </div>

      ) : (
        <div className="border-t border-gray-200 h-auto">
          {/* User Table */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  First Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reset Password
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.first_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.is_active ? "Active" : "Inactive"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex">
                    <button title="Edit user"
                      className={`text-green-600 hover:text-green-900 mr-2`}
                      onClick={() => handleEditUser(user.id)}
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      className={`text-${user.is_active ? "red" : "green"
                        }-600 hover:text-${user.is_active ? "red" : "green"
                        }-900 mr-2`}
                        onClick={() => {
                          if (window.confirm("Are you sure?")) {
                            handleToggleUserStatus(user.id, user.is_active);
                          }
                        }}
                    >
                      {user.is_active ? (
                        <UserX size={20} />
                      ) : (
                        <UserCheck size={20} />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleResetPassword(user.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="p-4 flex items-center justify-between">
        <p className="text-gray-600 text-sm">
          Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{" "}
          <span className="font-medium">{Math.min(indexOfLastUser, totalUsers)}</span>{" "}
          of <span className="font-medium">{totalUsers}</span> users
        </p>
        <div className="flex items-center space-x-2">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-2 py-1 border rounded ${currentPage === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white text-sky-500 hover:bg-sky-500 hover:text-white"
              }`}
          >
            &lt;
          </button>

          {/* Page Numbers */}
          {renderPageNumbers()}

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === Math.ceil(totalUsers / usersPerPage)}
            className={`px-2 py-1 border rounded ${currentPage === Math.ceil(totalUsers / usersPerPage)
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white text-sky-500 hover:bg-sky-500 hover:text-white"
              }`}
          >
            &gt;
          </button>
        </div>
      </div>


      {/* User Form Modal */}
      {isFormVisible && (
        <UserForm userId={currentUserId} onClose={handleCloseForm} />
      )}
    </div>
  );
};

export default UserManagement;
