import { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../Url";

export function OccasionsPage() {
    const [showAddOccasion, setShowAddOccasion] = useState(false);
    const [showAddSuboccasion, setShowAddSuboccasion] = useState(false);
    const [occasions, setOccasions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [selectedOccasion, setSelectedOccasion] = useState(null);
    const [error, setError] = useState(null);
    
    const token = localStorage.getItem("authToken");
    
    useEffect(() => {
        fetchOccasions();
    }, []);
    
    const fetchOccasions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${BACKEND_URL}get-occasion`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (response.data && response.data.occasions) {
                setOccasions(response.data.occasions);
                
                // Update selected occasion if it exists in the new data
                if (selectedOccasion) {
                    const updatedOccasion = response.data.occasions.find(
                        occ => occ.id === selectedOccasion.id
                    );
                    setSelectedOccasion(updatedOccasion || null);
                }
            }
        } catch (error) {
            console.error("Error fetching occasions:", error);
            setError("Failed to load occasions. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleOccasionSelect = (occasion) => {
        setSelectedOccasion(occasion);
    };
    
    const handleDeleteOccasion = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this occasion?");
        if (!confirmDelete) return;
        
        setIsLoading(true);
        setError(null);
        try {
            await axios.delete(`${BACKEND_URL}delete-occasion/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Update local state
            setOccasions(prevOccasions => prevOccasions.filter(occ => occ.id !== id));
            
            if (selectedOccasion && selectedOccasion.id === id) {
                setSelectedOccasion(null);
            }
            
        } catch (error) {
            console.error("Error deleting occasion:", error);
            setError("Failed to delete occasion. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAddOccasion = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const occasionName = formData.get("occasionName");
        
        setIsLoading(true);
        setError(null);
        try {
            await axios.post(`${BACKEND_URL}add-occasion`, {
                occasions: occasionName,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setShowAddOccasion(false);
            fetchOccasions(); // Refetch all data
        } catch (error) {
            console.error("Error adding occasion:", error);
            setError("Failed to add occasion. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleEditOccasion = async (e) => {
        e.preventDefault();
        if (!editItem) return;
        
        const formData = new FormData(e.target);
        const newOccasionName = formData.get("name");
        
        setIsLoading(true);
        setError(null);
        try {
            await axios.put(`${BACKEND_URL}update-occasion/${editItem.id}`, {
                occasions: newOccasionName
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setEditItem(null);
            fetchOccasions(); // Refetch all data
        } catch (error) {
            console.error("Error updating occasion:", error);
            setError("Failed to update occasion. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAddSuboccasion = async (e) => {
        e.preventDefault();
        if (!selectedOccasion) return;
        
        const formData = new FormData(e.target);
        const suboccasionName = formData.get("suboccasionName");
        
        setIsLoading(true);
        setError(null);
        try {
            await axios.post(`${BACKEND_URL}add-suboccasion/${selectedOccasion.id}`, {
                suboccasion: suboccasionName
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setShowAddSuboccasion(false);
            fetchOccasions(); // Refetch all data
        } catch (error) {
            console.error("Error adding suboccasion:", error);
            setError("Failed to add suboccasion. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDeleteSuboccasion = async (occasionId, suboccasionName) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this suboccasion?");
        if (!confirmDelete) return;
        
        setIsLoading(true);
        setError(null);
        try {
            await axios.delete(`${BACKEND_URL}delete-suboccasion/${occasionId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: { suboccasion: suboccasionName }
            });
            
            fetchOccasions(); // Refetch to ensure consistency
            
        } catch (error) {
            console.error("Error deleting suboccasion:", error);
            setError("Failed to delete suboccasion. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Filter occasions based on search term
    const filteredOccasions = occasions.filter(occ => 
        occ.occasions.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full mt-6">
            <div className="text-2xl font-semibold flex items-center mb-4">
                Occasions Management
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
            
            <div className="grid grid-cols-12 gap-6">
                {/* Occasions Column */}
                <div className="col-span-6 bg-white rounded-lg border shadow-sm p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Occasions</h3>
                        <div className="flex space-x-2">
                            <div className="relative w-[250px]">
                                <input 
                                    type="text" 
                                    placeholder="Search occasions..."
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
                                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md flex items-center"
                                onClick={() => setShowAddOccasion(true)}
                                disabled={isLoading}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Add Occasion
                            </button>
                        </div>
                    </div>
                    
                    <div className="overflow-y-auto max-h-[calc(100vh-240px)]">
                        {isLoading ? (
                            <div className="text-center py-10">
                                <p className="text-lg text-gray-500">Loading...</p>
                            </div>
                        ) : filteredOccasions.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Occasion
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredOccasions.map((occasion) => (
                                        <tr 
                                            key={occasion.id}
                                            className={selectedOccasion && selectedOccasion.id === occasion.id ? 'bg-red-50' : ''}
                                            onClick={() => handleOccasionSelect(occasion)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap cursor-pointer">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {occasion.occasions}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button 
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditItem(occasion);
                                                    }}
                                                    disabled={isLoading}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    className="text-red-600 hover:text-red-900"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteOccasion(occasion.id);
                                                    }}
                                                    disabled={isLoading}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-lg text-gray-500">No occasions found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Add Occasion Modal */}
            {showAddOccasion && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-medium mb-4">Add New Occasion</h3>
                        <form onSubmit={handleAddOccasion}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Occasion Name
                                </label>
                                <input 
                                    type="text" 
                                    name="occasionName"
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button 
                                    type="button"
                                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                                    onClick={() => setShowAddOccasion(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Edit Occasion Modal */}
            {editItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-medium mb-4">Edit Occasion</h3>
                        <form onSubmit={handleEditOccasion}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Occasion Name
                                </label>
                                <input 
                                    type="text" 
                                    name="name"
                                    defaultValue={editItem.occasions}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button 
                                    type="button"
                                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                                    onClick={() => setEditItem(null)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}