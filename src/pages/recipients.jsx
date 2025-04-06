import { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../Url";

export function RecipientsPage() {
    const [showAddRecipient, setShowAddRecipient] = useState(false);
    const [showAddGroup, setShowAddGroup] = useState(false);
    const [recipients, setRecipients] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [error, setError] = useState(null);
    
    const token = localStorage.getItem("authToken");
    
    useEffect(() => {
        fetchRecipients();
    }, []);
    
    const fetchRecipients = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${BACKEND_URL}get-recipient`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (response.data && response.data.recipients) {
                setRecipients(response.data.recipients);
                
                // Update selected recipient if it exists in the new data
                if (selectedRecipient) {
                    const updatedRecipient = response.data.recipients.find(
                        rec => rec.id === selectedRecipient.id
                    );
                    setSelectedRecipient(updatedRecipient || null);
                }
            }
        } catch (error) {
            console.error("Error fetching recipients:", error);
            setError("Failed to load recipients. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRecipientSelect = (recipient) => {
        setSelectedRecipient(recipient);
    };
    
    const handleDeleteRecipient = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this recipient?");
        if (!confirmDelete) return;
        
        setIsLoading(true);
        setError(null);
        try {
            await axios.delete(`${BACKEND_URL}delete-recipient/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Update local state
            setRecipients(prevRecipients => prevRecipients.filter(rec => rec.id !== id));
            
            if (selectedRecipient && selectedRecipient.id === id) {
                setSelectedRecipient(null);
            }
            
        } catch (error) {
            console.error("Error deleting recipient:", error);
            setError("Failed to delete recipient. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAddRecipient = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const recipientName = formData.get("recipientName");
        
        setIsLoading(true);
        setError(null);
        try {
            await axios.post(`${BACKEND_URL}add-recipient`, {
                recipients: recipientName,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setShowAddRecipient(false);
            fetchRecipients();
        } catch (error) {
            console.error("Error adding recipient:", error);
            setError("Failed to add recipient. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleEditRecipient = async (e) => {
        e.preventDefault();
        if (!editItem) return;
        
        const formData = new FormData(e.target);
        const newRecipientName = formData.get("name");
        
        setIsLoading(true);
        setError(null);
        try {
            await axios.put(`${BACKEND_URL}update-recipient/${editItem.id}`, {
                recipients: newRecipientName
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setEditItem(null);
            fetchRecipients(); // Refetch all data
        } catch (error) {
            console.error("Error updating recipient:", error);
            setError("Failed to update recipient. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAddGroup = async (e) => {
        e.preventDefault();
        if (!selectedRecipient) return;
        
        const formData = new FormData(e.target);
        const groupName = formData.get("groupName");
        
        setIsLoading(true);
        setError(null);
        try {
            await axios.post(`${BACKEND_URL}add-group/${selectedRecipient.id}`, {
                group: groupName
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setShowAddGroup(false);
            fetchRecipients(); // Refetch all data
        } catch (error) {
            console.error("Error adding group:", error);
            setError("Failed to add group. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDeleteGroup = async (recipientId, groupName) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this group?");
        if (!confirmDelete) return;
        
        setIsLoading(true);
        setError(null);
        try {
            await axios.delete(`${BACKEND_URL}delete-group/${recipientId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: { group: groupName }
            });
            
            fetchRecipients(); // Refetch to ensure consistency
            
        } catch (error) {
            console.error("Error deleting group:", error);
            setError("Failed to delete group. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Filter recipients based on search term
    const filteredRecipients = recipients.filter(rec => 
        rec.recipients.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return (
        <div className="lg:w-1/2 mt-6">
            <div className="text-xl sm:text-2xl font-semibold flex items-center mb-4">
                Recipients Management
            </div>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <span>{error}</span>
                    <button 
                        className="float-right font-bold"
                        onClick={() => setError(null)}
                    >
                        &times;
                    </button>
                </div>
            )}
            
            <div className="w-full">
                {/* Recipients Column */}
                <div className="w-full bg-white rounded-lg border shadow-sm p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-3 sm:space-y-0">
                        <h3 className="text-lg font-medium">Recipients</h3>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                            <div className="relative w-full sm:w-[250px]">
                                <input 
                                    type="text" 
                                    placeholder="Search recipients..."
                                    className="w-full pl-8 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                            </div>
                            <button 
                                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md flex items-center justify-center w-full sm:w-auto"
                                onClick={() => setShowAddRecipient(true)}
                                disabled={isLoading}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Add Recipient
                            </button>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <div className="overflow-y-auto max-h-[calc(100vh-240px)]">
                            {isLoading ? (
                                <div className="text-center py-10">
                                    <p className="text-lg text-gray-500">Loading...</p>
                                </div>
                            ) : filteredRecipients.length > 0 ? (
                                <div className="min-w-full">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Recipient
                                                </th>
                                                <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredRecipients.map((recipient) => (
                                                <tr 
                                                    key={recipient.id}
                                                    className={selectedRecipient && selectedRecipient.id === recipient.id ? 'bg-red-50' : ''}
                                                    onClick={() => handleRecipientSelect(recipient)}
                                                >
                                                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap cursor-pointer">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {recipient.recipients}
                                                        </div>
                                                    </td>
                                                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm">
                                                        <div className="flex space-x-2">
                                                            <button 
                                                                className="text-blue-600 hover:text-blue-900"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEditItem(recipient);
                                                                }}
                                                                disabled={isLoading}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button 
                                                                className="text-red-600 hover:text-red-900"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteRecipient(recipient.id);
                                                                }}
                                                                disabled={isLoading}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-lg text-gray-500">No recipients found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Add Recipient Modal */}
            {showAddRecipient && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">Add New Recipient</h3>
                        <form onSubmit={handleAddRecipient}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Recipient Name
                                </label>
                                <input 
                                    type="text" 
                                    name="recipientName"
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                                <button 
                                    type="button"
                                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 w-full sm:w-auto"
                                    onClick={() => setShowAddRecipient(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 w-full sm:w-auto"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Edit Recipient Modal */}
            {editItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">Edit Recipient</h3>
                        <form onSubmit={handleEditRecipient}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Recipient Name
                                </label>
                                <input 
                                    type="text" 
                                    name="name"
                                    defaultValue={editItem.recipients}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                                <button 
                                    type="button"
                                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 w-full sm:w-auto"
                                    onClick={() => setEditItem(null)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 w-full sm:w-auto"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Add Group Modal */}
            {showAddGroup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">Add New Group</h3>
                        <form onSubmit={handleAddGroup}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Group Name
                                </label>
                                <input 
                                    type="text" 
                                    name="groupName"
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                                <button 
                                    type="button"
                                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 w-full sm:w-auto"
                                    onClick={() => setShowAddGroup(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 w-full sm:w-auto"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}