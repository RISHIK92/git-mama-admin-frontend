import { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../Url";

export function AllCategoryPage() {
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [categoryData, setCategoryData] = useState({
        categories: [],
        occasions: [],
        recipients: []
    });
    const [activeTab, setActiveTab] = useState("categories");
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [categoryDocId, setCategoryDocId] = useState(null);
    
    const token = localStorage.getItem("authToken");
    
    useEffect(() => {
        fetchCategories();
    }, []);
    
    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${BACKEND_URL}get-categories`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Handle the new response structure
            if (response.data.categories && response.data.categories.length > 0) {
                const data = response.data.categories[0];
                setCategoryDocId(data.id);
                
                setCategoryData({
                    categories: Array.isArray(data.categories) 
                        ? data.categories.map((name, index) => ({ id: `cat-${index}`, category: name })) 
                        : [],
                    occasions: Array.isArray(data.occasions) 
                        ? data.occasions.map((name, index) => ({ id: `occ-${index}`, category: name })) 
                        : [],
                    recipients: Array.isArray(data.recipients) 
                        ? data.recipients.map((name, index) => ({ id: `rec-${index}`, category: name })) 
                        : []
                });
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDeleteCategory = async (itemId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this item?");
        if (!confirmDelete) return;
        
        setIsLoading(true);
        try {
            // Extract the item index from the ID
            const parts = itemId.split('-');
            if (parts.length !== 2) {
                throw new Error("Invalid item ID format");
            }
            
            // Use the delete-category-by-id endpoint
            await axios.delete(`${BACKEND_URL}delete-category-by-id/${itemId}?type=${activeTab}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Update local state based on which tab is active
            setCategoryData(prevData => {
                const updatedData = { ...prevData };
                updatedData[activeTab] = prevData[activeTab].filter(item => item.id !== itemId);
                return updatedData;
            });
            
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("Failed to delete item. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAddCategory = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const itemName = formData.get("categoryName");
        const itemType = formData.get("categoryType") || activeTab;
        
        setIsLoading(true);
        try {
            await axios.post(`${BACKEND_URL}add-category`, {
                type: itemType,
                name: itemName
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setShowAddCategory(false);
            fetchCategories(); // Refetch all data
        } catch (error) {
            console.error("Error adding item:", error);
            alert("Failed to add item. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleEditCategory = async (e) => {
        e.preventDefault();
        if (!editItem) return;
        
        const formData = new FormData(e.target);
        const newItemName = formData.get("name");
        
        setIsLoading(true);
        try {
            await axios.put(`${BACKEND_URL}update-category/${categoryDocId}`, {
                type: activeTab,
                oldName: editItem.category,
                newName: newItemName
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setEditItem(null);
            fetchCategories(); // Refetch all data
        } catch (error) {
            console.error("Error updating item:", error);
            alert("Failed to update item. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Get current items based on active tab and search term
    const getCurrentItems = () => {
        const items = categoryData[activeTab] || [];
        return items.filter(item => 
            item.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };
    
    const filteredItems = getCurrentItems();
    return (
        <div className="px-3 w-1/2">
            <div className="text-2xl font-semibold flex items-center mb-4">
                Categories Management
            </div>
            
            <div className="border-b border-gray-200 mb-4">
                <nav className="flex -mb-px">
                    <button
                        className={`py-2 px-4 border-b-2 ${activeTab === 'categories' 
                            ? 'border-red-500 text-red-500' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('categories')}
                    >
                        Categories
                    </button>
                    <button
                        className={`py-2 px-4 border-b-2 ${activeTab === 'occasions' 
                            ? 'border-red-500 text-red-500' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('occasions')}
                    >
                        Occasions
                    </button>
                    <button
                        className={`py-2 px-4 border-b-2 ${activeTab === 'recipients' 
                            ? 'border-red-500 text-red-500' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('recipients')}
                    >
                        Recipients
                    </button>
                </nav>
            </div>
            
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 bg-white rounded-lg border shadow-sm p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium capitalize">{activeTab}</h3>
                        <div className="flex space-x-2">
                            <div className="relative w-[250px]">
                                <input 
                                    type="text" 
                                    placeholder={`Search ${activeTab}...`}
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
                                onClick={() => setShowAddCategory(true)}
                                disabled={isLoading}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Add {activeTab != "categories" ? activeTab.slice(0, -1) : "category"}
                            </button>
                        </div>
                    </div>
                    
                    <div className="overflow-y-auto max-h-[calc(100vh-240px)]">
                        {isLoading ? (
                            <div className="text-center py-10">
                                <p className="text-lg text-gray-500">Loading...</p>
                            </div>
                        ) : filteredItems.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredItems.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {item.category}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <button 
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                    onClick={() => setEditItem(item)}
                                                    disabled={isLoading}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    className="text-red-600 hover:text-red-900"
                                                    onClick={() => handleDeleteCategory(item.id)}
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
                                <p className="text-lg text-gray-500">No {activeTab} found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Add Modal */}
            {showAddCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-medium mb-4">Add New {activeTab.slice(0, -1)}</h3>
                        <form onSubmit={handleAddCategory}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Type
                                </label>
                                <select 
                                    name="categoryType"
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    defaultValue={activeTab}
                                >
                                    <option value="categories">Category</option>
                                    <option value="occasions">Occasion</option>
                                    <option value="recipients">Recipient</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <input 
                                    type="text" 
                                    name="categoryName"
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button 
                                    type="button"
                                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                                    onClick={() => setShowAddCategory(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                    disabled={isLoading}
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Edit Modal */}
            {editItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-medium mb-4">Edit {activeTab.slice(0, -1)}</h3>
                        <form onSubmit={handleEditCategory}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <input 
                                    type="text" 
                                    name="name"
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    defaultValue={editItem.category}
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
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}