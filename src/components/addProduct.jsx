import { useState, useEffect } from "react";
import { X, Upload, Plus, Trash, Info } from "lucide-react";
import axios from "axios";
import { BACKEND_URL } from "../Url";

const AddProductModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discountedPrice: "",
    discount: 0,
    stock: "",
    youtubeLink: "",
    inclusiveOfTaxes: true,
    requirements: "",
    categoryId: "",
    subcategoryId: "",
    subsectionId: ""
  });
  
  const [displayImage, setDisplayImage] = useState(null);
  const [displayImagePreview, setDisplayImagePreview] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [subsections, setSubsections] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Fetch categories on mount
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);
  
  // Update subcategories when category changes
  useEffect(() => {
    if (formData.categoryId) {
      const selectedCat = categories.find(cat => cat.id.toString() === formData.categoryId);
      if (selectedCat && selectedCat.subCategories && selectedCat.subCategories.length > 0) {
        // Set subcategories from the selected category
        setSubcategories(selectedCat.subCategories);
        // Update the selectedCategory state with the category name
        setSelectedCategory(selectedCat.categories || selectedCat.category);
      } else if (selectedCat && selectedCat.subCategories.length == 0) {
        setSubcategories([]);
        setSelectedCategory(selectedCat.categories || selectedCat.category);
      }
       else {
        setSubcategories([]);
      }
      
      // Reset subcategory and subsection selection
      setFormData(prev => ({ ...prev, subcategoryId: "", subsectionId: "" }));
    } else {
      setSubcategories([]);
      setSelectedCategory("");
      setFormData(prev => ({ ...prev, subcategoryId: "", subsectionId: "" }));
    }
  }, [formData.categoryId, categories]);
  
  useEffect(() => {
    if (selectedCategory) {
      fetchSubsections(selectedCategory);
    } else {
      setSubsections([]);
      setFormData(prev => ({ ...prev, subsectionId: "" }));
    }
  }, [selectedCategory]);
  
  // Auto-calculate discount percentage when price and discounted price change
  useEffect(() => {
    if (formData.price && formData.discountedPrice) {
      const price = parseFloat(formData.price);
      const discountedPrice = parseFloat(formData.discountedPrice);
      
      if (price > 0 && discountedPrice > 0 && discountedPrice < price) {
        const calculatedDiscount = ((price - discountedPrice) / price) * 100;
        setFormData(prev => ({ ...prev, discount: calculatedDiscount.toFixed(2) }));
      }
    }
  }, [formData.price, formData.discountedPrice]);
  
  // Calculate discounted price when price and discount change
  useEffect(() => {
    if (formData.price && formData.discount) {
      const price = parseFloat(formData.price);
      const discount = parseFloat(formData.discount);
      
      if (price > 0 && discount > 0 && discount <= 100) {
        const calculatedDiscountedPrice = price - (price * (discount / 100));
        setFormData(prev => ({ ...prev, discountedPrice: calculatedDiscountedPrice.toFixed(2) }));
      }
    }
  }, [formData.price, formData.discount]);
  
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${BACKEND_URL}get-category`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Set categories from the response
      if (response.data && response.data.categories && Array.isArray(response.data.categories)) {
        setCategories(response.data.categories);
      } else {
        console.error("Invalid categories data format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  
  const fetchSubsections = async (categoryName) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${BACKEND_URL}get-sections`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.categories) {
        const categoryWithSubsections = response.data.categories.find(cat => 
          cat.category === categoryName
        );
        
        if (categoryWithSubsections && categoryWithSubsections.subCategory) {
          setSubsections(categoryWithSubsections.subCategory.map((name, index) => ({
            id: index + 1,
            name: name
          })));
        } else {
          setSubsections([]);
        }
      }
    } catch (error) {
      console.error("Error fetching subsections:", error);
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
  
    setFormData(prev => {
      const newValue = type === 'checkbox' ? checked : value;
      return {
        ...prev,
        [name]: newValue
      };
    });
  
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const handleDisplayImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setDisplayImage(file);
    setDisplayImagePreview(URL.createObjectURL(file));
    
    // Clear error
    if (errors.displayImage) {
      setErrors(prev => ({ ...prev, displayImage: null }));
    }
  };
  
  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const newImages = [...additionalImages, ...files];
    setAdditionalImages(newImages);
    
    // Create preview URLs for new files
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setAdditionalImagePreviews(prev => [...prev, ...newPreviews]);
    
    // Clear error
    if (errors.additionalImages) {
      setErrors(prev => ({ ...prev, additionalImages: null }));
    }
  };
  
  const removeAdditionalImage = (index) => {
    // Remove image and preview at the given index
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(additionalImagePreviews[index]);
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.price || isNaN(formData.price)) newErrors.price = "Valid price is required";
    if (!formData.discountedPrice || isNaN(formData.discountedPrice)) newErrors.discountedPrice = "Valid discounted price is required";
    if (!formData.stock || isNaN(formData.stock)) newErrors.stock = "Valid stock quantity is required";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";
    
    // Image validation
    if (!displayImage) newErrors.displayImage = "Main product image is required";
    
    // YouTube link validation (optional)
    if (formData.youtubeLink && !formData.youtubeLink.includes('youtube.com/') && !formData.youtubeLink.includes('youtu.be/')) {
      newErrors.youtubeLink = "Invalid YouTube link";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('authToken');
      
      // Create form data object for file upload
      const productData = new FormData();
      
      // Append text fields
      Object.keys(formData).forEach(key => {
        productData.append(key, formData[key]);
      });
      
      // Append main image
      productData.append('displayImage', displayImage);
      
      // Append additional images
      additionalImages.forEach(image => {
        productData.append('images', image);
      });
      
      // Send request to create product
      const response = await axios.post(`${BACKEND_URL}create-product`, productData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Handle success
      if (response.status === 201 || response.status === 200) {
        onSuccess(response.data);
        resetForm();
        onClose();
      }
    } catch (error) {
      console.error("Error creating product:", error);
      
      // Handle validation errors from backend
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        // Generic error
        alert("Failed to create product. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      discountedPrice: "",
      discount: 0,
      stock: "",
      youtubeLink: "",
      inclusiveOfTaxes: true,
      requirements: "",
      categoryId: "",
      subcategoryId: "",
      subsectionId: ""
    });
    
    setDisplayImage(null);
    setDisplayImagePreview(null);
    additionalImagePreviews.forEach(url => URL.revokeObjectURL(url));
    setAdditionalImages([]);
    setAdditionalImagePreviews([]);
    setSelectedCategory("");
    
    setErrors({});
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8 mx-4 relative">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Add New Product</h2>
          <button 
            onClick={handleClose} 
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-6">
              {/* Main Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Product Image <span className="text-red-500">*</span>
                </label>
                <div className={`border-2 border-dashed rounded-lg p-4 ${errors.displayImage ? 'border-red-500' : 'border-gray-300'}`}>
                  {displayImagePreview ? (
                    <div className="relative">
                      <img 
                        src={displayImagePreview} 
                        alt="Product preview" 
                        className="w-full h-64 object-contain"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          URL.revokeObjectURL(displayImagePreview);
                          setDisplayImage(null);
                          setDisplayImagePreview(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <label htmlFor="displayImage" className="cursor-pointer rounded-md font-medium text-red-500 hover:text-red-600">
                          Upload a file
                        </label>
                        <input 
                          id="displayImage" 
                          name="displayImage" 
                          type="file" 
                          accept="image/*" 
                          onChange={handleDisplayImageChange} 
                          className="sr-only" 
                        />
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                  )}
                </div>
                {errors.displayImage && <p className="mt-1 text-sm text-red-500">{errors.displayImage}</p>}
              </div>
              
              {/* Additional Images Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Images (up to 5)
                </label>
                <div className={`border-2 border-dashed rounded-lg p-4 ${errors.additionalImages ? 'border-red-500' : 'border-gray-300'}`}>
                  {additionalImagePreviews.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {additionalImagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={preview} 
                            alt={`Additional image ${index + 1}`} 
                            className="w-full h-32 object-cover rounded"
                          />
                          <button 
                            type="button"
                            onClick={() => removeAdditionalImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      ))}
                      
                      {/* Add more button (if less than 5 images) */}
                      {additionalImagePreviews.length < 5 && (
                        <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded h-32">
                          <label htmlFor="additionalImages" className="cursor-pointer text-center">
                            <Plus className="mx-auto h-6 w-6 text-gray-400" />
                            <span className="mt-1 block text-sm font-medium text-red-500">Add More</span>
                            <input 
                              id="additionalImages" 
                              name="additionalImages" 
                              type="file" 
                              accept="image/*"
                              multiple 
                              onChange={handleAdditionalImagesChange} 
                              className="sr-only" 
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <label htmlFor="additionalImages" className="cursor-pointer rounded-md font-medium text-red-500 hover:text-red-600">
                          Upload files
                        </label>
                        <input 
                          id="additionalImages" 
                          name="additionalImages" 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          onChange={handleAdditionalImagesChange} 
                          className="sr-only" 
                        />
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB each</p>
                    </div>
                  )}
                </div>
                {errors.additionalImages && <p className="mt-1 text-sm text-red-500">{errors.additionalImages}</p>}
              </div>
              
              {/* YouTube Video Link */}
              <div>
                <label htmlFor="youtubeLink" className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube Video Link
                </label>
                <input 
                  type="text" 
                  id="youtubeLink" 
                  name="youtubeLink" 
                  value={formData.youtubeLink} 
                  onChange={handleChange} 
                  placeholder="https://www.youtube.com/watch?v=..." 
                  className={`w-full p-2 border rounded-md ${errors.youtubeLink ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.youtubeLink && <p className="mt-1 text-sm text-red-500">{errors.youtubeLink}</p>}
                <p className="mt-1 text-xs text-gray-500">Optional: Include a YouTube video showcasing your product</p>
              </div>
              
              {/* Requirements */}
              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                  Image Requirements
                </label>
                <textarea 
                  id="requirements" 
                  name="requirements" 
                  value={formData.requirements} 
                  onChange={handleChange} 
                  rows="3" 
                  placeholder="Specify any requirements for customer image uploads..." 
                  className="w-full p-2 border border-gray-300 rounded-md"
                ></textarea>
                <p className="mt-1 text-xs text-gray-500">Provide guidelines for customers if they need to upload custom images</p>
              </div>
            </div>
            
            {/* Right column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>
              
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Description <span className="text-red-500">*</span>
                </label>
                <textarea 
                  id="description" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  rows="4" 
                  className={`w-full p-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                ></textarea>
                {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
              </div>
              
              {/* Pricing Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Original Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    id="price" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleChange} 
                    min="0" 
                    step="0.01" 
                    className={`w-full p-2 border rounded-md ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
                </div>
                
                <div>
                  <label htmlFor="discountedPrice" className="block text-sm font-medium text-gray-700 mb-2">
                    Discounted Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    id="discountedPrice" 
                    name="discountedPrice" 
                    value={formData.discountedPrice} 
                    onChange={handleChange} 
                    min="0" 
                    step="0.01" 
                    className={`w-full p-2 border rounded-md ${errors.discountedPrice ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.discountedPrice && <p className="mt-1 text-sm text-red-500">{errors.discountedPrice}</p>}
                </div>
                
                <div>
                  <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Percentage (%)
                  </label>
                  <input 
                    type="number" 
                    id="discount" 
                    name="discount" 
                    value={formData.discount} 
                    onChange={handleChange} 
                    min="0" 
                    max="100" 
                    step="0.01" 
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <p className="mt-1 text-xs text-gray-500">Auto-calculated based on prices</p>
                </div>
                
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    id="stock" 
                    name="stock" 
                    value={formData.stock} 
                    onChange={handleChange} 
                    min="0" 
                    className={`w-full p-2 border rounded-md ${errors.stock ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.stock && <p className="mt-1 text-sm text-red-500">{errors.stock}</p>}
                </div>
              </div>
              
              {/* Tax Inclusion */}
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="inclusiveOfTaxes" 
                  name="inclusiveOfTaxes" 
                  checked={formData.inclusiveOfTaxes} 
                  onChange={handleChange} 
                  className="h-4 w-4 text-red-500 border-gray-300 rounded"
                />
                <label htmlFor="inclusiveOfTaxes" className="ml-2 block text-sm text-gray-700">
                  Price is inclusive of all taxes
                </label>
              </div>
              
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select 
                  id="categoryId" 
                  name="categoryId" 
                  value={formData.categoryId}
                  onChange={handleChange} 
                  className={`w-full p-2 border rounded-md ${errors.categoryId ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.categories || category.category}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <p className="mt-1 text-sm text-red-500">{errors.categoryId}</p>}
              </div>
              
              {/* Subcategories (shown only if category is selected and has subcategories) */}
              {formData.categoryId && subcategories.length > 0 && (
                <div>
                  <label htmlFor="subcategoryId" className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory
                  </label>
                  <select 
                    id="subcategoryId" 
                    name="subcategoryId" 
                    value={formData.subcategoryId}
                    onChange={handleChange} 
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select a subcategory</option>
                    {subcategories.map((subCat, index) => (
                      <option key={index} value={subCat}>
                        {subCat}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Subsections (shown only if subcategory is selected and has subsections) */}
              {formData.categoryId && (
                <div>
                  <label htmlFor="subsectionId" className="block text-sm font-medium text-gray-700 mb-2">
                    Subsection
                  </label>
                  <select 
                    id="subsectionId" 
                    name="subsectionId" 
                    value={formData.subsectionId} 
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select a subsection</option>
                    {subsections.map(subsection => (
                      <option key={subsection.id} value={subsection.id}>
                        {subsection.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer buttons */}
          <div className="mt-8 flex justify-end gap-4 pt-4 border-t">
            <button 
              type="button" 
              onClick={handleClose} 
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 disabled:bg-red-300"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Adding Product...
                </span>
              ) : (
                "Add Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;