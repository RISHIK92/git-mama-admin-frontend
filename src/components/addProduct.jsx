import { useState, useEffect } from "react";
import {
  X,
  Upload,
  Plus,
  Trash,
  Info,
  Copy,
  Layers,
  Scissors,
  Image as ImageIcon,
} from "lucide-react";
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
    subsectionId: "",
    deliveryFee: "",
    isCustomizable: false,
    customizationTemplates: [],
    recipients: [],
    occasion: [],
  });

  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [displayImage, setDisplayImage] = useState(null);
  const [displayImagePreview, setDisplayImagePreview] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [subsections, setSubsections] = useState([]);
  const [occasionOptions, setOccasionOptions] = useState([]);
  const [recipientOptions, setRecipientOptions] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("basic");

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    thumbnailFile: null,
    thumbnailPreview: null,
    svgFile: null,
    svgPreview: null,
    customizableAreas: [],
  });

  const [newArea, setNewArea] = useState({
    name: "",
    description: "",
    shape: "rectangle",
    centerX: 50,
    centerY: 50,
    width: 100,
    height: 100,
    radius: 50,
    defaultScale: 1.0,
    defaultRotation: 0.0,
    defaultPositionX: 0.0,
    defaultPositionY: 0.0,
    maxFileSizeMB: 5.0,
    allowedFormats: ["image/jpeg", "image/png"],
  });

  // Fetch categories on mount
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchOccasions();
      fetchRecipients();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.categoryId) {
      const selectedCat = categories.find(
        (cat) => cat.id.toString() === formData.categoryId
      );
      if (selectedCat) {
        setSubcategories(selectedCat.subCategories || []);
        setSelectedCategory(selectedCat.categories || selectedCat.category);
      } else {
        setSubcategories([]);
        setSelectedCategory("");
      }
      setFormData((prev) => ({ ...prev, subcategoryId: "", subsectionId: "" }));
    } else {
      setSubcategories([]);
      setSelectedCategory("");
      setFormData((prev) => ({ ...prev, subcategoryId: "", subsectionId: "" }));
    }
  }, [formData.categoryId, categories]);

  useEffect(() => {
    if (selectedCategory) {
      fetchSubsections(selectedCategory);
    } else {
      setSubsections([]);
      setFormData((prev) => ({ ...prev, subsectionId: "" }));
    }
  }, [selectedCategory]);

  // Auto-calculate discount percentage when price and discounted price change
  useEffect(() => {
    if (formData.price && formData.discountedPrice) {
      const price = parseFloat(formData.price);
      const discountedPrice = parseFloat(formData.discountedPrice);

      if (price > 0 && discountedPrice > 0 && discountedPrice < price) {
        const calculatedDiscount = ((price - discountedPrice) / price) * 100;
        setFormData((prev) => ({
          ...prev,
          discount: calculatedDiscount.toFixed(2),
        }));
      }
    }
  }, [formData.price]);

  // Calculate discounted price when price and discount change
  useEffect(() => {
    if (formData.price && formData.discount) {
      const price = parseFloat(formData.price);
      const discount = parseFloat(formData.discount);

      if (price > 0 && discount > 0 && discount <= 100) {
        const calculatedDiscountedPrice = price - price * (discount / 100);
        setFormData((prev) => ({
          ...prev,
          discountedPrice: calculatedDiscountedPrice.toFixed(2),
        }));
      }
    }
  }, [formData.price, formData.discount]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${BACKEND_URL}get-category`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (
        response.data &&
        response.data.categories &&
        Array.isArray(response.data.categories)
      ) {
        setCategories(
          response.data.categories.map((cat) => ({
            ...cat,
            // Ensure we have either categories or category field
            displayName: cat.categories || cat.category,
          }))
        );
      } else {
        console.error("Invalid categories data format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSubsections = async (categoryName) => {
    try {
      const token = localStorage.getItem("authToken");
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

  const fetchOccasions = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${BACKEND_URL}get-occasion`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (
        response.data &&
        response.data.occasions &&
        Array.isArray(response.data.occasions)
      ) {
        setOccasionOptions(response.data.occasions);
      }
    } catch (error) {
      console.error("Error fetching occasions:", error);
    }
  };

  const fetchRecipients = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${BACKEND_URL}get-recipient`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.recipients) {
        setRecipientOptions(response.data.recipients);
      }
    } catch (error) {
      console.error("Error fetching recipients:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      const newValue = type === "checkbox" ? checked : value;
      return {
        ...prev,
        [name]: newValue,
      };
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleArrayChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedArray = [...prev[name]];
      const index = updatedArray.indexOf(value);

      if (e.target.checked) {
        if (index === -1) {
          updatedArray.push(value);
        }
      } else {
        if (index !== -1) {
          updatedArray.splice(index, 1);
        }
      }

      return {
        ...prev,
        [name]: updatedArray,
      };
    });
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMainImage(file);
    setMainImagePreview(URL.createObjectURL(file));

    if (errors.mainImage) {
      setErrors((prev) => ({ ...prev, mainImage: null }));
    }
  };

  const handleDisplayImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setDisplayImage(file);
    setDisplayImagePreview(URL.createObjectURL(file));

    if (errors.displayImage) {
      setErrors((prev) => ({ ...prev, displayImage: null }));
    }
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImages = [...additionalImages, ...files];
    setAdditionalImages(newImages);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setAdditionalImagePreviews((prev) => [...prev, ...newPreviews]);

    if (errors.additionalImages) {
      setErrors((prev) => ({ ...prev, additionalImages: null }));
    }
  };

  const removeAdditionalImage = (index) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(additionalImagePreviews[index]);
    setAdditionalImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Template and Area handlers
  const handleTemplateThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setNewTemplate((prev) => ({
      ...prev,
      thumbnailFile: file,
      thumbnailPreview: URL.createObjectURL(file),
    }));
  };

  const handleTemplateSvgChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setNewTemplate((prev) => ({
      ...prev,
      svgFile: file,
      svgPreview: URL.createObjectURL(file),
    }));
  };

  const handleNewTemplateChange = (e) => {
    const { name, value } = e.target;
    setNewTemplate((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewAreaChange = (e) => {
    const { name, value, type } = e.target;
    const parsedValue = type === "number" ? parseFloat(value) : value;

    setNewArea((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleAddArea = () => {
    if (!newArea.name) {
      alert("Please provide a name for the area");
      return;
    }

    setNewTemplate((prev) => ({
      ...prev,
      customizableAreas: [...prev.customizableAreas, newArea],
    }));

    // Reset area form
    setNewArea({
      name: "",
      description: "",
      shape: "rectangle",
      centerX: 50,
      centerY: 50,
      width: 100,
      height: 100,
      radius: 50,
      defaultScale: 1.0,
      defaultRotation: 0.0,
      defaultPositionX: 0.0,
      defaultPositionY: 0.0,
      maxFileSizeMB: 5.0,
      allowedFormats: ["image/jpeg", "image/png"],
    });
  };

  const handleRemoveArea = (index) => {
    setNewTemplate((prev) => {
      const updatedAreas = [...prev.customizableAreas];
      updatedAreas.splice(index, 1);
      return {
        ...prev,
        customizableAreas: updatedAreas,
      };
    });
  };

  const handleAddTemplate = () => {
    if (!newTemplate.name) {
      alert("Please provide a name for the template");
      return;
    }

    if (!newTemplate.thumbnailFile) {
      alert("Please upload a thumbnail for the template");
      return;
    }

    if (!newTemplate.svgFile) {
      alert("Please upload an SVG file for the template");
      return;
    }

    if (newTemplate.customizableAreas.length === 0) {
      alert("Please add at least one customizable area");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      customizationTemplates: [
        ...prev.customizationTemplates,
        {
          ...newTemplate,
          id: Date.now(), // Temporary ID for UI
        },
      ],
    }));

    // Reset template form
    setNewTemplate({
      name: "",
      thumbnailFile: null,
      thumbnailPreview: null,
      svgFile: null,
      svgPreview: null,
      customizableAreas: [],
    });
  };

  const handleRemoveTemplate = (index) => {
    setFormData((prev) => {
      const updatedTemplates = [...prev.customizationTemplates];
      updatedTemplates.splice(index, 1);
      return {
        ...prev,
        customizationTemplates: updatedTemplates,
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.price || isNaN(formData.price))
      newErrors.price = "Valid price is required";
    if (!formData.discountedPrice || isNaN(formData.discountedPrice))
      newErrors.discountedPrice = "Valid discounted price is required";
    if (!formData.stock || isNaN(formData.stock))
      newErrors.stock = "Valid stock quantity is required";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";

    // Image validation
    if (!mainImage) newErrors.mainImage = "Main product image is required";
    if (!displayImage) newErrors.displayImage = "Display image is required";

    // If product is customizable, check if at least one template is added
    if (
      formData.isCustomizable &&
      formData.customizationTemplates.length === 0
    ) {
      newErrors.customizationTemplates =
        "At least one customization template is required";
    }

    // YouTube link validation (optional)
    if (
      formData.youtubeLink &&
      !formData.youtubeLink.includes("youtube.com/") &&
      !formData.youtubeLink.includes("youtu.be/")
    ) {
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
      const token = localStorage.getItem("authToken");

      // Create form data object for file upload
      const productData = new FormData();

      // Get the actual category name (not ID)
      const selectedCategory = categories.find(
        (cat) => cat.id.toString() === formData.categoryId
      );
      const categoryName = selectedCategory
        ? selectedCategory.categories || selectedCategory.category
        : "";

      // Get subcategory name (not ID)
      const selectedSubcategory = subcategories.find(
        (sub) => sub === formData.subcategoryId
      );
      const subcategoryName = selectedSubcategory || formData.subcategoryId;

      // Get subsection name (not ID)
      const selectedSubsection = subsections.find(
        (sec) => sec.name === formData.subsectionId
      );
      const subsectionName = selectedSubsection
        ? selectedSubsection.name
        : formData.subsectionId;

      // Append all fields
      productData.append("name", formData.name);
      productData.append("description", formData.description);
      productData.append("price", formData.price);
      productData.append("discountedPrice", formData.discountedPrice);
      productData.append("discount", formData.discount);
      productData.append("stock", formData.stock);
      productData.append("youtubeLink", formData.youtubeLink);
      productData.append("inclusiveOfTaxes", formData.inclusiveOfTaxes);
      productData.append("requirements", formData.requirements);
      productData.append("categoryId", categoryName); // Send category name
      productData.append("subcategoryId", subcategoryName); // Send subcategory name
      productData.append("subsectionId", subsectionName); // Send subsection name
      productData.append("isCustomizable", formData.isCustomizable);

      // Append recipients and occasions (already names)
      formData.recipients.forEach((recipient) => {
        productData.append("recipients[]", recipient);
      });

      formData.occasion.forEach((occasion) => {
        productData.append("occasion[]", occasion);
      });

      // Rest of your existing code for images and customization templates...
      // Append all required images
      productData.append("mainImage", mainImage);
      productData.append("displayImage", displayImage);

      // Append additional images
      additionalImages.forEach((image) => {
        productData.append("images", image);
      });

      // Process customization templates
      formData.customizationTemplates.forEach((template, index) => {
        productData.append(
          `customizationTemplates[${index}][name]`,
          template.name
        );

        if (template.thumbnailFile) {
          productData.append(
            `customizationTemplates[${index}][thumbnail]`,
            template.thumbnailFile
          );
        }
        if (template.svgFile) {
          productData.append(
            `customizationTemplates[${index}][svg]`,
            template.svgFile
          );
        }

        template.customizableAreas.forEach((area, areaIndex) => {
          productData.append(
            `customizationTemplates[${index}][customizableAreas][${areaIndex}][name]`,
            area.name
          );
          productData.append(
            `customizationTemplates[${index}][customizableAreas][${areaIndex}][description]`,
            area.description || ""
          );
          productData.append(
            `customizationTemplates[${index}][customizableAreas][${areaIndex}][shape]`,
            area.shape
          );
          productData.append(
            `customizationTemplates[${index}][customizableAreas][${areaIndex}][centerX]`,
            area.centerX
          );
          productData.append(
            `customizationTemplates[${index}][customizableAreas][${areaIndex}][centerY]`,
            area.centerY
          );
          productData.append(
            `customizationTemplates[${index}][customizableAreas][${areaIndex}][width]`,
            area.width || 0
          );
          productData.append(
            `customizationTemplates[${index}][customizableAreas][${areaIndex}][height]`,
            area.height || 0
          );
          productData.append(
            `customizationTemplates[${index}][customizableAreas][${areaIndex}][radius]`,
            area.radius || 0
          );
          productData.append(
            `customizationTemplates[${index}][customizableAreas][${areaIndex}][defaultScale]`,
            area.defaultScale
          );
          productData.append(
            `customizationTemplates[${index}][customizableAreas][${areaIndex}][defaultRotation]`,
            area.defaultRotation
          );
          productData.append(
            `customizationTemplates[${index}][customizableAreas][${areaIndex}][defaultPositionX]`,
            area.defaultPositionX
          );
          productData.append(
            `customizationTemplates[${index}][customizableAreas][${areaIndex}][defaultPositionY]`,
            area.defaultPositionY
          );
          productData.append(
            `customizationTemplates[${index}][customizableAreas][${areaIndex}][maxFileSizeMB]`,
            area.maxFileSizeMB
          );
          productData.append(
            `customizationTemplates[${index}][customizableAreas][${areaIndex}][allowedFormats]`,
            JSON.stringify(area.allowedFormats)
          );
        });
      });

      // Send request to create product
      const response = await axios.post(`${BACKEND_URL}products`, productData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Handle success
      if (response.status === 201 || response.status === 200) {
        onSuccess(response.data);
        resetForm();
        onClose();
      }
    } catch (error) {
      console.error("Error creating product:", error);

      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
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
      subsectionId: "",
      isCustomizable: false,
      customizationTemplates: [],
      recipients: [],
      occasion: [],
    });

    setMainImage(null);
    setMainImagePreview(null);
    setDisplayImage(null);
    setDisplayImagePreview(null);
    additionalImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setAdditionalImages([]);
    setAdditionalImagePreviews([]);
    setSelectedCategory("");

    setNewTemplate({
      name: "",
      thumbnailFile: null,
      thumbnailPreview: null,
      svgFile: null,
      svgPreview: null,
      customizableAreas: [],
    });

    setNewArea({
      name: "",
      description: "",
      shape: "rectangle",
      centerX: 50,
      centerY: 50,
      width: 100,
      height: 100,
      radius: 50,
      defaultScale: 1.0,
      defaultRotation: 0.0,
      defaultPositionX: 0.0,
      defaultPositionY: 0.0,
      maxFileSizeMB: 5.0,
      allowedFormats: ["image/jpeg", "image/png"],
    });

    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl my-8 mx-4 relative">
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

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("basic")}
            className={`px-4 py-3 font-medium ${
              activeTab === "basic"
                ? "text-red-500 border-b-2 border-red-500"
                : "text-gray-500"
            }`}
          >
            Basic Info
          </button>
          <button
            onClick={() => setActiveTab("images")}
            className={`px-4 py-3 font-medium ${
              activeTab === "images"
                ? "text-red-500 border-b-2 border-red-500"
                : "text-gray-500"
            }`}
          >
            Images
          </button>
          <button
            onClick={() => setActiveTab("customization")}
            className={`px-4 py-3 font-medium ${
              activeTab === "customization"
                ? "text-red-500 border-b-2 border-red-500"
                : "text-gray-500"
            }`}
          >
            Customization
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Information Tab */}
          {activeTab === "basic" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Product Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className={`w-full p-2 border rounded-md ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                  ></textarea>
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.description}
                    </p>
                  )}
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
                  <label
                    htmlFor="inclusiveOfTaxes"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Price is inclusive of all taxes
                  </label>
                </div>

                {/* Pricing Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="price"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
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
                      className={`w-full p-2 border rounded-md ${
                        errors.price ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.price}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="discountedPrice"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Discounted Price (₹){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="discountedPrice"
                      name="discountedPrice"
                      value={formData.discountedPrice}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className={`w-full p-2 border rounded-md ${
                        errors.discountedPrice
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.discountedPrice && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.discountedPrice}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="discount"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
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
                    <p className="mt-1 text-xs text-gray-500">
                      Auto-calculated based on prices
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="stock"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Stock Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      min="0"
                      className={`w-full p-2 border rounded-md ${
                        errors.stock ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.stock && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.stock}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="deliveryFee"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Delivery Fee (₹)
                </label>
                <input
                  type="number"
                  id="deliveryFee"
                  name="deliveryFee"
                  value={formData.deliveryFee}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Optional: Additional delivery charge for this product
                </p>
              </div>

              {/* Right column */}
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="categoryId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${
                      errors.categoryId ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.categories || category.category}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.categoryId}
                    </p>
                  )}
                </div>

                {formData.categoryId && subcategories.length > 0 && (
                  <div>
                    <label
                      htmlFor="subcategoryId"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
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

                {/* Subsections */}
                {formData.categoryId && (
                  <div>
                    <label
                      htmlFor="subsectionId"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
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
                      {subsections.map((subsection) => (
                        <option key={subsection.id} value={subsection.name}>
                          {subsection.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Occasions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Occasions
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {occasionOptions.map((occasion, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`occasion-${index}`}
                          name="occasion"
                          value={occasion.occasions}
                          checked={formData.occasion.includes(
                            occasion.occasions
                          )}
                          onChange={handleArrayChange}
                          className="h-4 w-4 text-red-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`occasion-${index}`}
                          className="ml-2 text-sm text-gray-700"
                        >
                          {occasion.occasions}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recipients */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipients
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {recipientOptions.map((recipient, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`recipient-${index}`}
                          name="recipients"
                          value={recipient.recipients}
                          checked={formData.recipients.includes(
                            recipient.recipients
                          )}
                          onChange={handleArrayChange}
                          className="h-4 w-4 text-red-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`recipient-${index}`}
                          className="ml-2 text-sm text-gray-700"
                        >
                          {recipient.recipients}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* YouTube Video Link */}
                <div>
                  <label
                    htmlFor="youtubeLink"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    YouTube Video Link
                  </label>
                  <input
                    type="text"
                    id="youtubeLink"
                    name="youtubeLink"
                    value={formData.youtubeLink}
                    onChange={handleChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className={`w-full p-2 border rounded-md ${
                      errors.youtubeLink ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.youtubeLink && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.youtubeLink}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Optional: Include a YouTube video showcasing your product
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Images Tab */}
          {activeTab === "images" && (
            <div className="space-y-6">
              {/* Main Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Product Image <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {mainImagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={mainImagePreview}
                        alt="Product preview"
                        className="h-48 object-contain mx-auto"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setMainImage(null);
                          setMainImagePreview(null);
                        }}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <label
                          htmlFor="main-image-upload"
                          className="cursor-pointer rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white"
                        >
                          Upload Image
                        </label>
                        <input
                          id="main-image-upload"
                          name="main-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleMainImageChange}
                          className="hidden"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG, JPEG up to 5MB
                      </p>
                    </div>
                  )}
                </div>
                {errors.mainImage && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.mainImage}
                  </p>
                )}
              </div>

              {/* Display Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Product Image <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {displayImagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={displayImagePreview}
                        alt="Product preview"
                        className="h-48 object-contain mx-auto"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setDisplayImage(null);
                          setDisplayImagePreview(null);
                        }}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <label
                          htmlFor="display-image-upload"
                          className="cursor-pointer rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white"
                        >
                          Upload Image
                        </label>
                        <input
                          id="display-image-upload"
                          name="display-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleDisplayImageChange}
                          className="hidden"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG, JPEG up to 5MB
                      </p>
                    </div>
                  )}
                </div>
                {errors.displayImage && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.displayImage}
                  </p>
                )}
              </div>

              {/* Additional Images Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Product Images (up to 5)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {additionalImagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Additional product preview ${index + 1}`}
                          className="h-24 w-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeAdditionalImage(index)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    ))}

                    {additionalImages.length < 5 && (
                      <div className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer">
                        <label
                          htmlFor="additional-images-upload"
                          className="cursor-pointer"
                        >
                          <Plus className="h-8 w-8 text-gray-400" />
                          <span className="text-xs text-gray-500">Add</span>
                        </label>
                        <input
                          id="additional-images-upload"
                          name="additional-images-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleAdditionalImagesChange}
                          className="hidden"
                          multiple
                        />
                      </div>
                    )}
                  </div>
                </div>
                {errors.additionalImages && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.additionalImages}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Customization Tab */}
          {activeTab === "customization" && (
            <div className="space-y-6">
              {/* Customization Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isCustomizable"
                  name="isCustomizable"
                  checked={formData.isCustomizable}
                  onChange={handleChange}
                  className="h-4 w-4 text-red-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isCustomizable"
                  className="ml-2 block text-sm text-gray-700"
                >
                  This product can be customized
                </label>
              </div>

              {formData.isCustomizable && (
                <>
                  {/* Existing Templates */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Customization Templates
                    </h3>

                    {formData.customizationTemplates.length > 0 ? (
                      <div className="space-y-4">
                        {formData.customizationTemplates.map(
                          (template, index) => (
                            <div
                              key={index}
                              className="border border-gray-200 rounded-md p-4"
                            >
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium">{template.name}</h4>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTemplate(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  Remove
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                {template.thumbnailPreview && (
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      Thumbnail:
                                    </p>
                                    <img
                                      src={template.thumbnailPreview}
                                      alt={`Thumbnail for ${template.name}`}
                                      className="h-24 object-contain"
                                    />
                                  </div>
                                )}

                                {template.svgPreview && (
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      SVG Preview:
                                    </p>
                                    <div className="h-24 bg-gray-100 flex items-center justify-center">
                                      <ImageIcon
                                        className="text-gray-400"
                                        size={32}
                                      />
                                      <span className="ml-2 text-xs">
                                        SVG file uploaded
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="mt-3">
                                <p className="text-xs font-medium text-gray-700 mb-1">
                                  Customizable Areas:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {template.customizableAreas.map(
                                    (area, areaIndex) => (
                                      <span
                                        key={areaIndex}
                                        className="text-xs bg-gray-100 px-2 py-1 rounded"
                                      >
                                        {area.name} ({area.shape})
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No templates added yet.
                      </p>
                    )}

                    {errors.customizationTemplates && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.customizationTemplates}
                      </p>
                    )}
                  </div>

                  {/* Add New Template Section */}
                  <div className="border-t pt-4 mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Add New Customization Template
                    </h3>

                    <div className="space-y-4">
                      {/* Template Name */}
                      <div>
                        <label
                          htmlFor="template-name"
                          className="block text-sm text-gray-700 mb-1"
                        >
                          Template Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="template-name"
                          name="name"
                          value={newTemplate.name}
                          onChange={handleNewTemplateChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>

                      {/* Template Thumbnail */}
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Thumbnail Image{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                          {newTemplate.thumbnailPreview ? (
                            <div className="relative inline-block">
                              <img
                                src={newTemplate.thumbnailPreview}
                                alt="Template thumbnail preview"
                                className="h-32 object-contain mx-auto"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setNewTemplate((prev) => ({
                                    ...prev,
                                    thumbnailFile: null,
                                    thumbnailPreview: null,
                                  }))
                                }
                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          ) : (
                            <div>
                              <Upload className="mx-auto h-8 w-8 text-gray-400" />
                              <div className="mt-2">
                                <label
                                  htmlFor="template-thumbnail-upload"
                                  className="cursor-pointer rounded-md bg-red-500 px-3 py-1 text-sm font-semibold text-white"
                                >
                                  Upload Thumbnail
                                </label>
                                <input
                                  id="template-thumbnail-upload"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleTemplateThumbnailChange}
                                  className="hidden"
                                />
                              </div>
                              <p className="mt-1 text-xs text-gray-500">
                                PNG, JPG, JPEG up to 5MB
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Template SVG */}
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          SVG File <span className="text-red-500">*</span>
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                          {newTemplate.svgPreview ? (
                            <div className="relative">
                              <div className="h-32 bg-gray-100 flex items-center justify-center">
                                <ImageIcon
                                  className="text-gray-400"
                                  size={32}
                                />
                                <span className="ml-2">SVG file uploaded</span>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setNewTemplate((prev) => ({
                                    ...prev,
                                    svgFile: null,
                                    svgPreview: null,
                                  }))
                                }
                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          ) : (
                            <div>
                              <Upload className="mx-auto h-8 w-8 text-gray-400" />
                              <div className="mt-2">
                                <label
                                  htmlFor="template-svg-upload"
                                  className="cursor-pointer rounded-md bg-red-500 px-3 py-1 text-sm font-semibold text-white"
                                >
                                  Upload SVG
                                </label>
                                <input
                                  id="template-svg-upload"
                                  type="file"
                                  accept=".svg"
                                  onChange={handleTemplateSvgChange}
                                  className="hidden"
                                />
                              </div>
                              <p className="mt-1 text-xs text-gray-500">
                                SVG file only
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Customizable Areas */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Customizable Areas
                        </h4>

                        {newTemplate.customizableAreas.length > 0 ? (
                          <div className="space-y-3 mb-4">
                            {newTemplate.customizableAreas.map(
                              (area, index) => (
                                <div
                                  key={index}
                                  className="border border-gray-200 rounded-md p-3"
                                >
                                  <div className="flex justify-between items-center">
                                    <h5 className="font-medium text-sm">
                                      {area.name} ({area.shape})
                                    </h5>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveArea(index)}
                                      className="text-red-500 hover:text-red-700 text-sm"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    {area.description}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 mb-4">
                            No areas added yet.
                          </p>
                        )}

                        {/* Add New Area Form */}
                        <div className="border border-gray-200 rounded-md p-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">
                            Add New Customizable Area
                          </h5>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Area Name */}
                            <div>
                              <label
                                htmlFor="area-name"
                                className="block text-xs text-gray-700 mb-1"
                              >
                                Area Name{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                id="area-name"
                                name="name"
                                value={newArea.name}
                                onChange={handleNewAreaChange}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                              />
                            </div>

                            {/* Area Description */}
                            <div>
                              <label
                                htmlFor="area-description"
                                className="block text-xs text-gray-700 mb-1"
                              >
                                Description
                              </label>
                              <input
                                type="text"
                                id="area-description"
                                name="description"
                                value={newArea.description}
                                onChange={handleNewAreaChange}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                              />
                            </div>

                            {/* Shape */}
                            <div>
                              <label
                                htmlFor="area-shape"
                                className="block text-xs text-gray-700 mb-1"
                              >
                                Shape <span className="text-red-500">*</span>
                              </label>
                              <select
                                id="area-shape"
                                name="shape"
                                value={newArea.shape}
                                onChange={handleNewAreaChange}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                              >
                                <option value="rectangle">Rectangle</option>
                                <option value="circle">Circle</option>
                                <option value="triangle">Triangle</option>
                                <option value="hexagon">Hexagon</option>
                              </select>
                            </div>

                            {/* Max File Size */}
                            <div>
                              <label
                                htmlFor="area-maxFileSizeMB"
                                className="block text-xs text-gray-700 mb-1"
                              >
                                Max File Size (MB){" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                id="area-maxFileSizeMB"
                                name="maxFileSizeMB"
                                value={newArea.maxFileSizeMB}
                                onChange={handleNewAreaChange}
                                min="0.1"
                                step="0.1"
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                              />
                            </div>

                            {/* Shape-specific dimensions */}
                            {newArea.shape === "rectangle" ||
                            newArea.shape === "triangle" ? (
                              <>
                                <div>
                                  <label
                                    htmlFor="area-width"
                                    className="block text-xs text-gray-700 mb-1"
                                  >
                                    Width (px){" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    id="area-width"
                                    name="width"
                                    value={newArea.width}
                                    onChange={handleNewAreaChange}
                                    min="1"
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                  />
                                </div>
                                <div>
                                  <label
                                    htmlFor="area-height"
                                    className="block text-xs text-gray-700 mb-1"
                                  >
                                    Height (px){" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    id="area-height"
                                    name="height"
                                    value={newArea.height}
                                    onChange={handleNewAreaChange}
                                    min="1"
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                  />
                                </div>
                              </>
                            ) : newArea.shape === "circle" ||
                              newArea.shape === "hexagon" ? (
                              <div>
                                <label
                                  htmlFor="area-radius"
                                  className="block text-xs text-gray-700 mb-1"
                                >
                                  Radius (px){" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  id="area-radius"
                                  name="radius"
                                  value={newArea.radius}
                                  onChange={handleNewAreaChange}
                                  min="1"
                                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                />
                              </div>
                            ) : null}

                            {/* Center Position */}
                            <div>
                              <label
                                htmlFor="area-centerX"
                                className="block text-xs text-gray-700 mb-1"
                              >
                                Center X (%){" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                id="area-centerX"
                                name="centerX"
                                value={newArea.centerX}
                                onChange={handleNewAreaChange}
                                min="0"
                                max="100"
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="area-centerY"
                                className="block text-xs text-gray-700 mb-1"
                              >
                                Center Y (%){" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                id="area-centerY"
                                name="centerY"
                                value={newArea.centerY}
                                onChange={handleNewAreaChange}
                                min="0"
                                max="100"
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                              />
                            </div>

                            {/* Default Transformations */}
                            <div>
                              <label
                                htmlFor="area-defaultScale"
                                className="block text-xs text-gray-700 mb-1"
                              >
                                Default Scale{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                id="area-defaultScale"
                                name="defaultScale"
                                value={newArea.defaultScale}
                                onChange={handleNewAreaChange}
                                min="0.1"
                                step="0.1"
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="area-defaultRotation"
                                className="block text-xs text-gray-700 mb-1"
                              >
                                Default Rotation (degrees){" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                id="area-defaultRotation"
                                name="defaultRotation"
                                value={newArea.defaultRotation}
                                onChange={handleNewAreaChange}
                                min="0"
                                max="360"
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleAddArea}
                            className="mt-4 px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                          >
                            Add Area
                          </button>
                        </div>
                      </div>

                      {/* Add Template Button */}
                      <button
                        type="button"
                        onClick={handleAddTemplate}
                        className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                      >
                        Add Template
                      </button>
                    </div>
                  </div>

                  {/* Additional Customization Requirements */}
                  <div className="mt-6">
                    <label
                      htmlFor="requirements"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Customization Requirements / Instructions
                    </label>
                    <textarea
                      id="requirements"
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Add any special requirements or instructions for customers who want to customize this product..."
                      className="w-full p-2 border border-gray-300 rounded-md"
                    ></textarea>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
