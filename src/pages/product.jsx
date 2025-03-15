import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../Url";
import { GridIcon, List, Search, Filter, Edit, Trash, PlusCircle } from "lucide-react";

// Simplified Product Card for grid view
const SimpleProductCard = ({ product, onEdit, onDelete, onClick }) => {
    const handleEdit = (e) => {
        e.stopPropagation();
        onEdit(product.id);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(product.id);
    };

    return (
        <div className="bg-white rounded-lg w-[270px] mb-8 cursor-pointer" onClick={onClick}>
            <div className="bg-[#D9D9D9] rounded-xl relative overflow-hidden w-[270px] h-[270px]">
                {product.discount && (
                    <div className="bg-[#FF3B3B] absolute text-white text-xs px-2 py-1 left-2 top-2 rounded-lg">
                        {Math.round(product.discount)}% off
                    </div>
                )}
                <img
                    src={product.images[0].displayImage}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute bottom-2 right-2 flex gap-2">
                    <button 
                        onClick={handleEdit}
                        className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                    >
                        <Edit size={16} className="text-blue-500" />
                    </button>
                    <button 
                        onClick={handleDelete}
                        className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                    >
                        <Trash size={16} className="text-red-500" />
                    </button>
                </div>
            </div>
            <div className="mt-3 w-[270px]">
                <h2 className="text-lg font-semibold truncate">{product.name}</h2>
                <div className="flex items-center gap-1 mt-1">
                    <span className="text-red-500 font-medium">₹{product.discountedPrice}</span>
                    {product.price > product.discountedPrice && (
                        <span className="text-gray-400 line-through">₹{product.price}</span>
                    )}
                </div>
                <p className="text-xs text-gray-500">
                    {product.inclusiveOfTaxes ? "Inclusive of all taxes" : "Exclusive of taxes"}
                </p>
            </div>
        </div>
    );
};

// List view product item
const ProductListItem = ({ product, onEdit, onDelete, onClick }) => {
    const handleEdit = (e) => {
        e.stopPropagation();
        onEdit(product.id);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(product.id);
    };

    return (
        <div 
            className="bg-white rounded-lg p-4 mb-4 flex border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={onClick}
        >
            <div className="bg-[#D9D9D9] rounded-xl relative overflow-hidden w-[120px] h-[120px] flex-shrink-0">
                {product.discount && (
                    <div className="bg-[#FF3B3B] absolute text-white text-xs px-2 py-1 left-2 top-2 rounded-lg">
                        {Math.round(product.discount)}% off
                    </div>
                )}
                <img
                    src={product.images[0].displayImage}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-xl"
                />
            </div>
            <div className="ml-4 flex-grow">
                <h2 className="text-lg font-semibold">{product.name}</h2>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                <div className="flex items-center gap-1 mt-2">
                    <span className="text-red-500 font-medium">₹{product.discountedPrice}</span>
                    {product.price > product.discountedPrice && (
                        <span className="text-gray-400 line-through">₹{product.price}</span>
                    )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    {product.inclusiveOfTaxes ? "Inclusive of all taxes" : "Exclusive of taxes"}
                </p>
                {product.stock <= 5 && product.stock > 0 && (
                    <p className="text-orange-500 text-xs font-medium mt-1">Only {product.stock} left in stock</p>
                )}
                {product.stock === 0 && (
                    <p className="text-red-500 text-xs font-medium mt-1">Out of stock</p>
                )}
            </div>
            <div className="flex flex-col gap-2 ml-4">
                <button 
                    onClick={handleEdit}
                    className="bg-blue-50 p-2 rounded-md hover:bg-blue-100"
                >
                    <Edit size={16} className="text-blue-500" />
                </button>
                <button 
                    onClick={handleDelete}
                    className="bg-red-50 p-2 rounded-md hover:bg-red-100"
                >
                    <Trash size={16} className="text-red-500" />
                </button>
            </div>
        </div>
    );
};

export function ProductPage() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const token = localStorage.getItem('authToken')
    
    const navigate = useNavigate();
    
    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [selectedCategory]);
    
    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}categories`);
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };
    
    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const url = selectedCategory === "all" 
                ? `${BACKEND_URL}get-products` 
                : `${BACKEND_URL}products/category/${selectedCategory}`;
                
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setProducts(response.data.product);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };
    
    const handleAddProduct = () => {
        navigate('/add-product');
    };
    
    const handleEditProduct = (productId) => {
        navigate(`/edit-product/${productId}`);
    };
    
    const handleDeleteClick = (productId) => {
        setProductToDelete(productId);
        setShowDeleteConfirm(true);
    };
    
    const confirmDelete = async () => {
        if (!productToDelete) return;
        
        try {
            await axios.delete(`${BACKEND_URL}delete-product/${productToDelete}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setProducts(products.filter(product => product.id !== productToDelete));
            setShowDeleteConfirm(false);
            setProductToDelete(null);
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };
    
    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setProductToDelete(null);
    };
    
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    return (
        <div className="p-6 ml-72">
            <div className="flex items-center justify-between mb-6">
                <div className="text-2xl font-semibold flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-red-500">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                        <line x1="9" y1="21" x2="9" y2="9"></line>
                    </svg>
                    Products
                </div>
                
                <button 
                    onClick={handleAddProduct}
                    className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                    <PlusCircle size={18} className="mr-2" />
                    Add Product
                </button>
            </div>
            
            <div className="flex justify-between mb-6">
                <div className="flex gap-4">
                    <div className="relative w-[300px]">
                        <input 
                            type="text" 
                            placeholder="Search products..." 
                            className="w-full pl-8 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <Search className="w-4 h-4" />
                        </span>
                    </div>
                    
                    <select 
                        className="pl-4 pr-8 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="flex items-center">
                    <span className="mr-2 text-sm text-gray-500">View:</span>
                    <button 
                        className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-red-100 text-red-500' : 'text-gray-500'}`}
                        onClick={() => setViewMode('grid')}
                    >
                        <GridIcon size={18} />
                    </button>
                    <button 
                        className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-red-100 text-red-500' : 'text-gray-500'}`}
                        onClick={() => setViewMode('list')}
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>
            
            {isLoading ? (
                <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-500">Loading products...</p>
                </div>
            ) : filteredProducts.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProducts.map(product => (
                            <SimpleProductCard 
                                key={product.id} 
                                product={product} 
                                onClick={() => handleProductClick(product.id)}
                                onEdit={handleEditProduct}
                                onDelete={handleDeleteClick}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredProducts.map(product => (
                            <ProductListItem 
                                key={product.id} 
                                product={product} 
                                onClick={() => handleProductClick(product.id)}
                                onEdit={handleEditProduct}
                                onDelete={handleDeleteClick}
                            />
                        ))}
                    </div>
                )
            ) : (
                <div className="text-center py-10 bg-white rounded-lg border shadow-sm">
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-16 w-16 mx-auto text-gray-400" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                        />
                    </svg>
                    <p className="mt-4 text-lg text-gray-500">No products found</p>
                    <p className="text-sm text-gray-400">Try changing your search or filter criteria</p>
                </div>
            )}
            
            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
                        <div className="flex justify-end gap-4">
                            <button 
                                className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-100"
                                onClick={cancelDelete}
                            >
                                Cancel
                            </button>
                            <button 
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}