import { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../Url";
import { X } from "lucide-react";

function EditProductModal({ isOpen, onClose, productId, onProductUpdated }) {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: 0,
    discount: 0,
    discountedPrice: 0,
    deliveryFee: 0,
    isCustomizable: false,
    categoryId: "",
    subsectionId: "",
    occasion: "",
    recipients: "",
    keepExistingImages: true,
    deleteTemplates: false,
    customizationTemplates: [],
  });
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subsections, setSubsections] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (isOpen && productId) {
      fetchProductDetails();
      fetchAllData();
    }
  }, [isOpen, productId]);

  const fetchAllData = async () => {
    try {
      const [categoriesRes, occasionsRes, recipientsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}get-category`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`${BACKEND_URL}get-occasion`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`${BACKEND_URL}get-recipient`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      setCategories(categoriesRes.data.categories);
      setOccasions(occasionsRes.data.occasions);
      setRecipients(recipientsRes.data.recipients);

      // If product data is already loaded, fetch subsections for its category
      if (product.categoryId) {
        const selectedCat = categoriesRes.data.categories.find(
          (cat) => cat.id.toString() === product.categoryId
        );
        if (selectedCat) {
          fetchSubsections(selectedCat.categories || selectedCat.category);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchProductDetails = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const productData = response.data.product;

      setProduct({
        ...productData,
        categoryId: productData.categoryId || "",
        subsectionId: productData.subsectionId || "",
        occasion: productData.occasion || "",
        recipients: productData.recipients || "",
        keepExistingImages: true,
        deleteTemplates: false,
      });
      setImages(productData.images || []);

      // Fetch subsections for the product's category
      if (productData.categoryId) {
        const selectedCat = categories.find(
          (cat) => cat.id.toString() === productData.categoryId
        );
        if (selectedCat) {
          fetchSubsections(selectedCat.categories || selectedCat.category);
        }
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      setError("Failed to fetch product details");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubsections = async (categoryName) => {
    try {
      const response = await axios.get(`${BACKEND_URL}get-sections`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.categories) {
        const categoryWithSubsections = response.data.categories.find(
          (cat) => cat.category === categoryName
        );

        if (categoryWithSubsections && categoryWithSubsections.subCategory) {
          setSubsections(
            categoryWithSubsections.subCategory.map((name, index) => ({
              id: index + 1,
              name: name,
            }))
          );
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

    setProduct((prev) => {
      const newValue =
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseFloat(value)
          : value;

      const updatedProduct = {
        ...prev,
        [name]: newValue,
      };

      // When category changes, fetch subsections
      if (name === "categoryId") {
        const selectedCat = categories.find(
          (cat) => cat.id.toString() === value
        );
        if (selectedCat) {
          fetchSubsections(selectedCat.categories || selectedCat.category);
        }
        // Reset subsection when category changes
        updatedProduct.subsectionId = "";
      }

      return updatedProduct;
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setProduct((prev) => ({
      ...prev,
      images: files,
    }));
  };

  const handleTemplateChange = (index, field, value) => {
    setProduct((prev) => {
      const updatedTemplates = [...prev.customizationTemplates];
      updatedTemplates[index] = {
        ...updatedTemplates[index],
        [field]: value,
      };
      return {
        ...prev,
        customizationTemplates: updatedTemplates,
      };
    });
  };

  const handleAreaChange = (templateIndex, areaIndex, field, value) => {
    setProduct((prev) => {
      const updatedTemplates = [...prev.customizationTemplates];
      const updatedAreas = [
        ...updatedTemplates[templateIndex].customizableAreas,
      ];
      updatedAreas[areaIndex] = {
        ...updatedAreas[areaIndex],
        [field]: value,
      };
      updatedTemplates[templateIndex] = {
        ...updatedTemplates[templateIndex],
        customizableAreas: updatedAreas,
      };
      return {
        ...prev,
        customizationTemplates: updatedTemplates,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();

      // Get the actual category name (not ID)
      const selectedCategory = categories.find(
        (cat) => cat.id.toString() === product.categoryId
      );
      const categoryName = selectedCategory
        ? selectedCategory.categories || selectedCategory.category
        : "";

      // Get subsection name (not ID)
      const selectedSubsection = subsections.find(
        (sec) => sec.id.toString() === product.subsectionId
      );
      const subsectionName = selectedSubsection
        ? selectedSubsection.name
        : product.subsectionId;

      // Append all fields
      Object.keys(product).forEach((key) => {
        if (key === "customizationTemplates") {
          formData.append(key, JSON.stringify(product[key]));
        } else if (key === "categoryId") {
          formData.append("categoryId", categoryName);
        } else if (key === "subsectionId") {
          formData.append("subsectionId", subsectionName);
        } else if (key !== "images") {
          formData.append(key, product[key]);
        }
      });

      if (product.images && product.images.length > 0) {
        product.images.forEach((file, index) => {
          formData.append(`images`, file);
        });
      }

      const response = await axios.put(
        `${BACKEND_URL}update-product/${productId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccess("Product updated successfully!");
      if (onProductUpdated) {
        onProductUpdated(response.data.product);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error updating product:", error);
      setError(error.response?.data?.error || "Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Edit Product</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {isLoading && !product.name ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-3 text-gray-600">Loading product details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 text-green-500 rounded-md">
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={product.name || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category*
                </label>
                <select
                  name="categoryId"
                  value={product.categoryId || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.categories || category.category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subsection
                </label>
                <select
                  name="subsectionId"
                  value={product.subsectionId || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select Subsection</option>
                  {subsections.map((subsection) => (
                    <option key={subsection.id} value={subsection.id}>
                      {subsection.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Occasion
                </label>
                <select
                  name="occasion"
                  value={product.occasion || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select Occasion</option>
                  {occasions.map((occasion) => (
                    <option key={occasion.id} value={occasion.occasions}>
                      {occasion.occasions}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipients
                </label>
                <select
                  name="recipients"
                  value={product.recipients || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select Recipient</option>
                  {recipients.map((recipient) => (
                    <option key={recipient.id} value={recipient.recipients}>
                      {recipient.recipients}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Fee (₹)
                </label>
                <input
                  type="number"
                  name="deliveryFee"
                  value={product.deliveryFee || 0}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isCustomizable"
                  checked={product.isCustomizable || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-red-500 rounded focus:ring-2 focus:ring-red-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Is Customizable
                </label>
              </div> */}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="keepExistingImages"
                  checked={product.keepExistingImages || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-red-500 rounded focus:ring-2 focus:ring-red-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Keep Existing Images
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description*
              </label>
              <textarea
                name="description"
                value={product.description || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                rows="3"
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹)*
                </label>
                <input
                  type="number"
                  name="price"
                  value={product.price || 0}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={product.discount || 0}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discounted Price (₹)
                </label>
                <input
                  type="number"
                  name="discountedPrice"
                  value={product.discountedPrice || 0}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Images
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                accept="image/*"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload new images to replace existing ones (unless "Keep
                Existing Images" is checked)
              </p>
            </div>

            {images.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Images
                </label>
                <div className="flex flex-wrap gap-3">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="relative w-20 h-20 border rounded-md overflow-hidden"
                    >
                      <img
                        src={image.mainImage || image.displayImage}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.isCustomizable && (
              <div className="mb-4 border-t pt-4">
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Customization Templates
                </h3>

                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    name="deleteTemplates"
                    checked={product.deleteTemplates || false}
                    onChange={handleChange}
                    className="h-4 w-4 text-red-500 rounded focus:ring-2 focus:ring-red-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Delete All Existing Templates
                  </label>
                </div>

                {product.customizationTemplates?.map((template, tIndex) => (
                  <div key={tIndex} className="mb-6 p-4 border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Template Name
                        </label>
                        <input
                          type="text"
                          value={template.name || ""}
                          onChange={(e) =>
                            handleTemplateChange(tIndex, "name", e.target.value)
                          }
                          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={template.isActive !== false}
                          onChange={(e) =>
                            handleTemplateChange(
                              tIndex,
                              "isActive",
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-red-500 rounded focus:ring-2 focus:ring-red-500"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                          Active
                        </label>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Template Thumbnail
                      </label>
                      <input
                        type="file"
                        onChange={(e) =>
                          handleTemplateChange(
                            tIndex,
                            "thumbnail",
                            e.target.files[0]
                          )
                        }
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        accept="image/*"
                      />
                      {template.thumbnailUrl && (
                        <div className="mt-2 w-20 h-20 border rounded-md overflow-hidden">
                          <img
                            src={template.thumbnailUrl}
                            alt="Template thumbnail"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Template SVG
                      </label>
                      <input
                        type="file"
                        onChange={(e) =>
                          handleTemplateChange(tIndex, "svg", e.target.files[0])
                        }
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        accept=".svg"
                      />
                    </div>

                    <h4 className="text-md font-medium text-gray-700 mb-2">
                      Customizable Areas
                    </h4>
                    {template.customizableAreas?.map((area, aIndex) => (
                      <div key={aIndex} className="mb-4 p-3 border rounded-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Area Name
                            </label>
                            <input
                              type="text"
                              value={area.name || ""}
                              onChange={(e) =>
                                handleAreaChange(
                                  tIndex,
                                  aIndex,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Shape
                            </label>
                            <select
                              value={area.shape || "rectangle"}
                              onChange={(e) =>
                                handleAreaChange(
                                  tIndex,
                                  aIndex,
                                  "shape",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                              <option value="rectangle">Rectangle</option>
                              <option value="circle">Circle</option>
                              <option value="polygon">Polygon</option>
                            </select>
                          </div>
                        </div>

                        {/* More area fields can be added here */}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-100"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-red-300"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default EditProductModal;
