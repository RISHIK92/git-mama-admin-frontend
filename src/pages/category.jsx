import { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../Url";
import { AllCategoryPage } from "./allCategories";

export function CategoryPage() {
    const [showAddSection, setShowAddSection] = useState(false);
    const [showAddSubsection, setShowAddSubsection] = useState(false);
    const [sections, setSections] = useState([]);
    const [selectedSection, setSelectedSection] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [editItem, setEditItem] = useState(null);
    
    const token = localStorage.getItem("authToken");
    
    useEffect(() => {
        fetchSections();
    }, []);
    
    const fetchSections = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${BACKEND_URL}get-sections`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSections(response.data.categories);
        } catch (error) {
            console.error("Error fetching sections:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSectionSelect = (section) => {
        setSelectedSection(section);
    };
    
    const handleDeleteSection = async (sectionId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this section? This will also delete all subsections within it.");
        if (!confirmDelete) return;
        
        setIsLoading(true);
        try {
            await axios.delete(`${BACKEND_URL}delete-section/${sectionId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setSections(currentSections => 
                currentSections.filter(section => section.id !== sectionId)
            );
            
            if (selectedSection && selectedSection.id === sectionId) {
                setSelectedSection(null);
            }
            
        } catch (error) {
            console.error("Error deleting section:", error);
            alert("Failed to delete section. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDeleteSubsection = async (subsectionName) => {
        if (!selectedSection) return;
        
        const confirmDelete = window.confirm("Are you sure you want to delete this subsection?");
        if (!confirmDelete) return;
        
        setIsLoading(true);
        try {
            await axios.delete(`${BACKEND_URL}delete-subsection`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    categoryId: selectedSection.id,
                    subcategoryName: subsectionName
                }
            });
            
            // Update the local state
            setSections(currentSections => {
                return currentSections.map(section => {
                    if (section.id === selectedSection.id) {
                        return {
                            ...section,
                            subCategory: section.subCategory.filter(sub => sub !== subsectionName)
                        };
                    }
                    return section;
                });
            });
            
            // Update selected section as well
            setSelectedSection(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    subCategory: prev.subCategory.filter(sub => sub !== subsectionName)
                };
            });
            
        } catch (error) {
            console.error("Error deleting subsection:", error);
            alert("Failed to delete subsection. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAddSection = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const sectionName = formData.get("sectionName");
        
        setIsLoading(true);
        try {
            await axios.post(`${BACKEND_URL}add-section`, {
                category: sectionName
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setShowAddSection(false);
            fetchSections();
        } catch (error) {
            console.error("Error adding section:", error);
            alert("Failed to add section. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAddSubsection = async (e) => {
        e.preventDefault();
        if (!selectedSection) return;
        
        const formData = new FormData(e.target);
        const subsectionName = formData.get("subsectionName");
        
        setIsLoading(true);
        try {
            await axios.post(`${BACKEND_URL}add-subsection`, {
                categoryId: selectedSection.id,
                subcategoryName: subsectionName
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setShowAddSubsection(false);
            fetchSections();
        } catch (error) {
            console.error("Error adding subsection:", error);
            alert("Failed to add subsection. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleEditSection = async (e) => {
        e.preventDefault();
        if (!editItem || editItem.type !== 'section') return;
        
        const formData = new FormData(e.target);
        const newSectionName = formData.get("name");
        
        setIsLoading(true);
        try {
            await axios.put(`${BACKEND_URL}update-section/${editItem.data.id}`, {
                category: newSectionName
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setEditItem(null);
            fetchSections();
        } catch (error) {
            console.error("Error updating section:", error);
            alert("Failed to update section. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleEditSubsection = async (e) => {
        e.preventDefault();
        if (!editItem || editItem.type !== 'subsection' || !selectedSection) return;
        
        const formData = new FormData(e.target);
        const newSubsectionName = formData.get("name");
        
        setIsLoading(true);
        try {
            await axios.put(`${BACKEND_URL}update-subsection`, {
                categoryId: selectedSection.id,
                oldSubcategoryName: editItem.data,
                newSubcategoryName: newSubsectionName
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setEditItem(null);
            fetchSections();
        } catch (error) {
            console.error("Error updating subsection:", error);
            alert("Failed to update subsection. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const filteredSections = sections.filter(section => 
        section.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return (
        <div className="p-6 ml-72">
            <AllCategoryPage />
            <div className="text-2xl font-semibold flex items-center my-5 ml-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-red-500">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                Navbar Sections & Subsections
            </div>
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-6 bg-white rounded-lg border shadow-sm p-4">
                    <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Section</h3>
                        <div className="flex space-x-2">
                            <div className="relative w-[250px]">
                                <input 
                                    type="text" 
                                    placeholder="Search sections..." 
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
                                onClick={() => setShowAddSection(true)}
                                disabled={isLoading}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Add Section
                            </button>
                        </div>
                    </div>
                    
                    <div className="overflow-y-auto max-h-[calc(100vh-240px)]">
                        {isLoading ? (
                            <div className="text-center py-10">
                                <p className="text-lg text-gray-500">Loading...</p>
                            </div>
                        ) : filteredSections.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Subsections
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredSections.map((section) => (
                                        <tr 
                                            key={section.id}
                                            className={selectedSection && selectedSection.id === section.id ? 'bg-red-50' : ''}
                                            onClick={() => handleSectionSelect(section)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap cursor-pointer">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {section.category}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap cursor-pointer">
                                                <div className="text-sm text-gray-900">
                                                    {section.subCategory?.length || 0}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <button 
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditItem({ type: 'section', data: section });
                                                    }}
                                                    disabled={isLoading}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    className="text-red-600 hover:text-red-900"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteSection(section.id);
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
                                <p className="text-lg text-gray-500">No sections found</p>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Subsections Column */}
                <div className="col-span-6 bg-white rounded-lg border shadow-sm p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Subsections</h3>
                        <button 
                            className={`bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md flex items-center ${!selectedSection ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => setShowAddSubsection(true)}
                            disabled={isLoading || !selectedSection}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Add Subsection
                        </button>
                    </div>
                    
                    <div className="overflow-y-auto max-h-[calc(100vh-240px)]">
                        {selectedSection ? (
                            selectedSection.subCategory && selectedSection.subCategory.length > 0 ? (
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
                                        {selectedSection.subCategory.map((subsection) => (
                                            <tr key={subsection}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {subsection}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <button 
                                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                                        onClick={() => setEditItem({ type: 'subsection', data: subsection })}
                                                        disabled={isLoading}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        className="text-red-600 hover:text-red-900"
                                                        onClick={() => handleDeleteSubsection(subsection)}
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
                                    <p className="text-lg text-gray-500">No subsections found</p>
                                    <p className="text-sm text-gray-400 mt-2">Add a subsection to {selectedSection.category}</p>
                                </div>
                            )
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-lg text-gray-500">Select a section to view subsections</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Add Section Modal */}
            {showAddSection && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-medium mb-4">Add New Section</h3>
                        <form onSubmit={handleAddSection}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Section Name
                                </label>
                                <input 
                                    type="text" 
                                    name="sectionName"
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button 
                                    type="button"
                                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                                    onClick={() => setShowAddSection(false)}
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
            
            {/* Add Subsection Modal */}
            {showAddSubsection && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-medium mb-4">Add New Subsection</h3>
                        <form onSubmit={handleAddSubsection}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Parent Section
                                </label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 border rounded-md bg-gray-100"
                                    value={selectedSection?.category || ''}
                                    disabled
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Subsection Name
                                </label>
                                <input 
                                    type="text" 
                                    name="subsectionName"
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button 
                                    type="button"
                                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                                    onClick={() => setShowAddSubsection(false)}
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
            <h3 className="text-lg font-medium mb-4">
                Edit {editItem.type === 'section' ? 'Section' : 'Subsection'}
            </h3>
            <form onSubmit={editItem.type === 'section' ? handleEditSection : handleEditSubsection}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                    </label>
                    <input 
                        type="text" 
                        name="name"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        defaultValue={editItem.type === 'section' ? editItem.data.category : editItem.data}
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