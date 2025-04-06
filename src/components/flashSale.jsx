import { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../Url";
import { Calendar, Clock, Tag, Percent, Search, Plus, Trash2, Save } from "lucide-react";
import { format } from "date-fns";

export function FlashSale() {
  const [flashSales, setFlashSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16), // Default to tomorrow
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFlashSales();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchTerm, products]);

  const fetchFlashSales = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${BACKEND_URL}flash-sales`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFlashSales(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch flash sales:", err);
      setError("Failed to fetch flash sales. Please try again.");
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${BACKEND_URL}get-products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data.product);

    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to fetch products. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleProductSelect = (product) => {
    // Add product to selected products if not already there
    if (!selectedProducts.some(p => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, { 
        ...product, 
        salePrice: '0', 
        discount: '0' 
      }]);
    }
    setSearchTerm("");
    setFilteredProducts([]);
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const handleProductPriceChange = (id, field, value) => {
    setSelectedProducts(selectedProducts.map(product => {
      if (product.id === id) {
        const updatedProduct = { ...product, [field]: value };
        
        // Auto-calculate the other value based on what's being edited
        if (field === 'salePrice') {
          const originalPrice = Number(product.price);
          const newSalePrice = Number(value);
          const discountPercent = ((originalPrice - newSalePrice) / originalPrice * 100).toFixed(2);
          updatedProduct.discount = discountPercent;
        } else if (field === 'discount') {
          const originalPrice = Number(product.price);
          const discountPercent = Number(value);
          const newSalePrice = (originalPrice - (originalPrice * discountPercent / 100)).toFixed(2);
          updatedProduct.salePrice = newSalePrice;
        }
        
        return updatedProduct;
      }
      return product;
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      startTime: new Date().toISOString().slice(0, 16),
      endTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    });
    setSelectedProducts([]);
    setIsCreating(false);
    setIsEditing(false);
    setSelectedSale(null);
    setError("");
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedProducts.length === 0) {
      setError("Please select at least one product for the flash sale.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      
      const payload = {
        ...formData,
        items: selectedProducts.map(product => ({
          productId: product.id,
          salePrice: parseFloat(product.salePrice),
          discount: parseFloat(product.discount)
        }))
      };
      
      if (isEditing && selectedSale) {
        await axios.put(`${BACKEND_URL}flash-sales/${selectedSale.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${BACKEND_URL}flash-sales`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setLoading(false);
      resetForm();
      fetchFlashSales();
    } catch (err) {
      console.error("Failed to save flash sale:", err);
      setError("Failed to save flash sale. Please try again.");
      setLoading(false);
    }
  };

  const handleEditSale = (sale) => {
    setIsEditing(true);
    setSelectedSale(sale);
    setFormData({
      title: sale.title,
      description: sale.description,
      startTime: new Date(sale.startTime).toISOString().slice(0, 16),
      endTime: new Date(sale.endTime).toISOString().slice(0, 16),
    });
    
    // Fetch detailed sale information including products
    const fetchSaleDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(`${BACKEND_URL}flash-sales/${sale.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Map the products with their flash sale prices and discounts
        const saleProducts = response.data.items.map(item => {
          const product = products.find(p => p.id === item.productId);
          return {
            ...product,
            salePrice: item.salePrice.toString(),
            discount: item.discount.toString()
          };
        });
        
        setSelectedProducts(saleProducts);
      } catch (err) {
        console.error("Failed to fetch sale details:", err);
        setError("Failed to fetch sale details. Please try again.");
      }
    };
    
    fetchSaleDetails();
  };

  const handleDeleteSale = async (saleId) => {
    if (!window.confirm("Are you sure you want to delete this flash sale?")) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      await axios.delete(`${BACKEND_URL}flash-sales/${saleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setLoading(false);
      fetchFlashSales();
    } catch (err) {
      console.error("Failed to delete flash sale:", err);
      setError("Failed to delete flash sale. Please try again.");
      setLoading(false);
    }
  };

  const toggleActiveSale = async (sale) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.patch(`${BACKEND_URL}flash-sales/${sale.id}/toggle`, {
        active: !sale.active
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchFlashSales();
    } catch (err) {
      console.error("Failed to toggle flash sale status:", err);
      setError("Failed to update flash sale status. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Flash Sales</h1>
        {!isCreating && !isEditing && (
          <button 
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-red-500 text-white rounded-md flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Create Flash Sale
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {(isCreating || isEditing) ? (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-bold mb-4">
            {isEditing ? "Edit Flash Sale" : "Create New Flash Sale"}
          </h2>
          <form onSubmit={handleCreateSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="Flash Sale Title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="Flash Sale Description"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Add Products</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 pl-10 border rounded-md"
                  placeholder="Search products..."
                />
                <Search className="absolute left-3 top-3 text-gray-400" size={16} />
              </div>
              
              {filteredProducts.length > 0 && (
                <div className="mt-2 border rounded-md max-h-48 overflow-y-auto">
                  {filteredProducts.map(product => (
                    <div 
                      key={product.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="flex items-center">
                        {product.images && product.images.length > 0 && (
                          <img 
                            src={product.images[0].displayImage} 
                            alt={product.name} 
                            className="w-10 h-10 object-cover rounded-md mr-2"
                          />
                        )}
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">₹{parseFloat(product.price).toFixed(2)}</p>
                        </div>
                      </div>
                      <Plus size={16} className="text-red-500" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {selectedProducts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Selected Products</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount (%)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedProducts.map(product => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">₹{parseFloat(product.price).toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={product.salePrice}
                              onChange={(e) => handleProductPriceChange(product.id, 'salePrice', e.target.value)}
                              className="w-24 p-1 border rounded-md"
                              required
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={product.discount}
                              onChange={(e) => handleProductPriceChange(product.id, 'discount', e.target.value)}
                              className="w-24 p-1 border rounded-md"
                              required
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(product.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-500 text-white rounded-md flex items-center"
                disabled={loading}
              >
                <Save size={18} className="mr-2" />
                {loading ? "Saving..." : "Save Flash Sale"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : flashSales.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <p className="text-gray-500">No flash sales found. Create your first flash sale.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {flashSales.map(sale => (
                <div key={sale.id} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold">{sale.title}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditSale(sale)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSale(sale.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{sale.description}</p>
                  
                  <div className="flex flex-wrap gap-3 mb-3">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar size={14} className="mr-1" />
                      <span>
                        {format(new Date(sale.startTime), "MMM d, yyyy")} - {format(new Date(sale.endTime), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock size={14} className="mr-1" />
                      <span>
                        {format(new Date(sale.startTime), "h:mm a")} - {format(new Date(sale.endTime), "h:mm a")}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        sale.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {sale.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={sale.active}
                          onChange={() => toggleActiveSale(sale)}
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <h4 className="text-sm font-medium mb-2">Sale Products: {sale.items?.length || 0}</h4>
                    {sale.items && sale.items.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {sale.items.map((item, index) => (
                          <div key={index} className="bg-gray-100 rounded-lg px-3 py-1 text-sm">
                            <div className="flex items-center">
                              <Tag size={12} className="mr-1 text-red-500" />
                              <span>{item.productName || `Product #${item.productId}`}</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Percent size={10} className="mr-1" />
                              <span>{item.discount}% off</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}