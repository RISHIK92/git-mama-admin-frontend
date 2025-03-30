import { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../Url";

export function AllCategoryPage() {
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [showAddSubcategory, setShowAddSubcategory] = useState(false);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [error, setError] = useState(null);
    
    const token = localStorage.getItem("authToken");
    
    useEffect(() => {
        fetchCategories();
    }, []);
    
    const fetchCategories = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${BACKEND_URL}get-category`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (response.data && response.data.categories) {
                setCategories(response.data.categories);
                
                // Update selected category if it exists in the new data
                if (selectedCategory) {
                    const updatedCategory = response.data.categories.find(
                        cat => cat.id === selectedCategory.id
                    );
                    setSelectedCategory(updatedCategory || null);
                }
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            setError("Failed to load categories. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
    };
    
    const handleDeleteCategory = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this category?");
        if (!confirmDelete) return;
        
        setIsLoading(true);
        setError(null);
        try {
            await axios.delete(`${BACKEND_URL}delete-category/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Update local state
            setCategories(prevCategories => prevCategories.filter(cat => cat.id !== id));
            
            if (selectedCategory && selectedCategory.id === id) {
                setSelectedCategory(null);
            }
            
        } catch (error) {
            console.error("Error deleting category:", error);
            setError("Failed to delete category. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAddCategory = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const categoryName = formData.get("categoryName");
        
        setIsLoading(true);
        setError(null);
        try {
            await axios.post(`${BACKEND_URL}add-category`, {
                categories: categoryName,
                subCategories: []
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setShowAddCategory(false);
            fetchCategories(); // Refetch all data
        } catch (error) {
            console.error("Error adding category:", error);
            setError("Failed to add category. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleEditCategory = async (e) => {
        e.preventDefault();
        if (!editItem) return;
        
        const formData = new FormData(e.target);
        const newCategoryName = formData.get("name");
        
        setIsLoading(true);
        setError(null);
        try {
            await axios.put(`${BACKEND_URL}update-category/${editItem.id}`, {
                categories: newCategoryName
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setEditItem(null);
            fetchCategories(); // Refetch all data
        } catch (error) {
            console.error("Error updating category:", error);
            setError("Failed to update category. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAddSubcategory = async (e) => {
        e.preventDefault();
        if (!selectedCategory) return;
        
        const formData = new FormData(e.target);
        const subcategoryName = formData.get("subcategoryName");
        
        setIsLoading(true);
        setError(null);
        try {
            await axios.post(`${BACKEND_URL}add-subcategory/${selectedCategory.id}`, {
                subcategory: subcategoryName
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setShowAddSubcategory(false);
            fetchCategories(); // Refetch all data
        } catch (error) {
            console.error("Error adding subcategory:", error);
            setError("Failed to add subcategory. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDeleteSubcategory = async (categoryId, subcategoryName) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this subcategory?");
        if (!confirmDelete) return;
        
        setIsLoading(true);
        setError(null);
        try {
            await axios.delete(`${BACKEND_URL}delete-subcategory/${categoryId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: { subcategory: subcategoryName }
            });
            
            fetchCategories(); // Refetch to ensure consistency
            
        } catch (error) {
            console.error("Error deleting subcategory:", error);
            setError("Failed to delete subcategory. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Filter categories based on search term
    const filteredCategories = categories.filter(cat => 
        cat.categories.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return (
        <div className="w-full">
            <div className="text-2xl font-semibold flex items-center mb-4">
                Categories Management
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
                {/* Categories Column */}
                <div className="col-span-6 bg-white rounded-lg border shadow-sm p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Categories</h3>
                        <div className="flex space-x-2">
                            <div className="relative w-[250px]">
                                <input 
                                    type="text" 
                                    placeholder="Search categories..."
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
                                Add Category
                            </button>
                        </div>
                    </div>
                    
                    <div className="overflow-y-auto max-h-[calc(100vh-240px)]">
                        {isLoading ? (
                            <div className="text-center py-10">
                                <p className="text-lg text-gray-500">Loading...</p>
                            </div>
                        ) : filteredCategories.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Subcategories
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredCategories.map((category) => (
                                        <tr 
                                            key={category.id}
                                            className={selectedCategory && selectedCategory.id === category.id ? 'bg-red-50' : ''}
                                            onClick={() => handleCategorySelect(category)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap cursor-pointer">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {category.categories}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap cursor-pointer">
                                                <div className="text-sm text-gray-900">
                                                    {category.subCategories?.length || 0}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button 
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditItem(category);
                                                    }}
                                                    disabled={isLoading}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    className="text-red-600 hover:text-red-900"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteCategory(category.id);
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
                                <p className="text-lg text-gray-500">No categories found</p>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Subcategories Column */}
                <div className="col-span-6 bg-white rounded-lg border shadow-sm p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">
                            {selectedCategory ? `Subcategories for ${selectedCategory.categories}` : 'Subcategories'}
                        </h3>
                        <button 
                            className={`bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md flex items-center ${!selectedCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => setShowAddSubcategory(true)}
                            disabled={isLoading || !selectedCategory}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Add Subcategory
                        </button>
                    </div>
                    
                    <div className="overflow-y-auto max-h-[calc(100vh-240px)]">
                        {isLoading && selectedCategory ? (
                            <div className="text-center py-10">
                                <p className="text-lg text-gray-500">Loading...</p>
                            </div>
                        ) : selectedCategory ? (
                            selectedCategory.subCategories && selectedCategory.subCategories.length > 0 ? (
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
                                        {selectedCategory.subCategories.map((subcategory, idx) => (
                                            <tr key={idx}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {subcategory}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <button 
                                                        className="text-red-600 hover:text-red-900"
                                                        onClick={() => handleDeleteSubcategory(selectedCategory.id, subcategory)}
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
                                    <p className="text-lg text-gray-500">No subcategories found</p>
                                    <p className="text-sm text-gray-400 mt-2">Add a subcategory to {selectedCategory.categories}</p>
                                </div>
                            )
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-lg text-gray-500">Select a category to view subcategories</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Add Category Modal */}
            {showAddCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-medium mb-4">Add New Category</h3>
                        <form onSubmit={handleAddCategory}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category Name
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
                                    {isLoading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Add Subcategory Modal */}
            {showAddSubcategory && selectedCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-medium mb-4">Add Subcategory to {selectedCategory.categories}</h3>
                        <form onSubmit={handleAddSubcategory}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Parent Category
                                </label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 border rounded-md bg-gray-100"
                                    value={selectedCategory.categories}
                                    readOnly
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Subcategory Name
                                </label>
                                <input 
                                    type="text" 
                                    name="subcategoryName"
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button 
                                    type="button"
                                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                                    onClick={() => setShowAddSubcategory(false)}
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
            
            {/* Edit Category Modal */}
            {editItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-medium mb-4">Edit Category</h3>
                        <form onSubmit={handleEditCategory}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category Name
                                </label>
                                <input 
                                    type="text" 
                                    name="name"
                                    defaultValue={editItem.categories}
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