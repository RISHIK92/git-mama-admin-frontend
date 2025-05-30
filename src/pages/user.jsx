import { useState, useEffect } from "react";
import axios from "axios";
import { CustomButton } from "../components/button";
import { Card } from "../components/card";
import { Add } from "../components/add";
import { BACKEND_URL } from "../Url";
import { Search } from "../components/search";
import { Filter } from "lucide-react";

export function UserPage() {
    const [showAddUser, setShowAddUser] = useState(false);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const token = localStorage.getItem("authToken");
    
    useEffect(() => {
        fetchUsers();
    }, []);
    
    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${BACKEND_URL}get-users`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUsers(response.data.admin);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDelete = async (userId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this user?");
        if (!confirmDelete) return;
        
        setIsLoading(true);
        try {
            await axios.delete(`${BACKEND_URL}delete-user/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Update local state
            setUsers(currentUsers => currentUsers.filter(user => user.id !== userId));
            
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const filteredUsers = users.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return (
        <div className="p-6">
            <div className="flex items-center mb-6">
                <div className="text-2xl font-semibold flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-red-500">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Customer information
                </div>
            </div>
            
            <div className="flex justify-between mb-4">
                <div className="relative w-[300px]">
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="w-full pl-8 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <button className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                        <Filter size={16} />
                    </button>
                </div>
{/*                 
                <button 
                    className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md flex items-center"
                    onClick={() => setShowAddUser(true)}
                    disabled={isLoading}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add New Customer
                </button> */}
            </div>
            
            {showAddUser ? (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    {/* <Add 
                        name="User" 
                        role="User" 
                        onClose={() => setShowAddUser(false)} 
                        fetch={() => fetchUsers()}
                    /> */}
                </div>
            ) : (
                <div className="bg-white rounded-lg border shadow-sm p-6">
                    {isLoading ? (
                        <div className="text-center py-10">
                            <p className="text-lg text-gray-500">Loading...</p>
                        </div>
                    ) : filteredUsers.length > 0 ? (
                        <div>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Phone
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <img 
                                                            className="h-10 w-10 rounded-full" 
                                                            src="src/icons/OIP.jpeg"
                                                            alt="" 
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.firstName} {user.lastName}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {user.phone || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <button 
                                                    className="text-red-600 hover:text-red-900 mr-3"
                                                    onClick={() => handleDelete(user.id)}
                                                    disabled={isLoading}
                                                >
                                                    Delete
                                                </button>
                                                <button 
                                                    className="text-red-600 hover:text-red-900"
                                                    disabled={isLoading}
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-lg text-gray-500">No customers found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}