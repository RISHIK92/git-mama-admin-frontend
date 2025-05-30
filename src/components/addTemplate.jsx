import { useState, useEffect } from "react";
import { X, Upload, Plus, Trash, Layers, Scissors, Image, Move, RotateCw, Maximize2, Minimize2 } from "lucide-react";
import axios from "axios";
import { BACKEND_URL } from "../Url";

const TemplateCreatorModal = ({ isOpen, onClose, productId, onSuccess }) => {
  const [templateData, setTemplateData] = useState({
    name: "",
    description: "",
    isActive: true,
    orderIndex: 0,
    productId: productId
  });
  
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [svgFile, setSvgFile] = useState(null);
  const [svgPreview, setSvgPreview] = useState(null);
  
  const [customizableAreas, setCustomizableAreas] = useState([]);
  const [activeAreaIndex, setActiveAreaIndex] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'areas', 'preview'
  
  // Shape options for customizable areas
  const shapeOptions = [
    { value: 'rectangle', label: 'Rectangle' },
    { value: 'circle', label: 'Circle' },
    { value: 'triangle', label: 'Triangle' },
    { value: 'hexagon', label: 'Hexagon' }
  ];
  
  // File type options
  const fileTypeOptions = [
    { value: 'image/jpeg', label: 'JPEG' },
    { value: 'image/png', label: 'PNG' },
    { value: 'image/svg+xml', label: 'SVG' }
  ];

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setTemplateData({
      name: "",
      description: "",
      isActive: true,
      orderIndex: 0,
      productId: productId
    });
    setThumbnail(null);
    setThumbnailPreview(null);
    setSvgFile(null);
    setSvgPreview(null);
    setCustomizableAreas([]);
    setActiveAreaIndex(null);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
  
    setTemplateData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
    
    if (errors.thumbnail) {
      setErrors(prev => ({ ...prev, thumbnail: null }));
    }
  };

  const handleSvgChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setSvgFile(file);
    
    // Read SVG file content
    const reader = new FileReader();
    reader.onload = (event) => {
      setSvgPreview(event.target.result);
    };
    reader.readAsText(file);
    
    if (errors.svgFile) {
      setErrors(prev => ({ ...prev, svgFile: null }));
    }
  };

  const addCustomizableArea = () => {
    const newArea = {
      name: `Area ${customizableAreas.length + 1}`,
      description: "",
      shape: "rectangle",
      centerX: 50,
      centerY: 50,
      width: 100,
      height: 100,
      radius: null,
      defaultScale: 1.0,
      defaultRotation: 0.0,
      defaultPositionX: 0.0,
      defaultPositionY: 0.0,
      orderIndex: customizableAreas.length,
      allowedFormats: ["image/jpeg", "image/png"],
      maxFileSizeMB: 5.0
    };
    
    setCustomizableAreas(prev => [...prev, newArea]);
    setActiveAreaIndex(customizableAreas.length);
  };

  const removeCustomizableArea = (index) => {
    setCustomizableAreas(prev => prev.filter((_, i) => i !== index));
    if (activeAreaIndex === index) {
      setActiveAreaIndex(null);
    } else if (activeAreaIndex > index) {
      setActiveAreaIndex(activeAreaIndex - 1);
    }
  };

  const updateCustomizableArea = (index, field, value) => {
    setCustomizableAreas(prev => {
      const updatedAreas = [...prev];
      updatedAreas[index] = {
        ...updatedAreas[index],
        [field]: field === 'allowedFormats' ? 
          (updatedAreas[index].allowedFormats.includes(value) ?
            updatedAreas[index].allowedFormats.filter(f => f !== value) :
            [...updatedAreas[index].allowedFormats, value]) :
          value
      };
      return updatedAreas;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!templateData.name.trim()) newErrors.name = "Template name is required";
    if (!svgFile) newErrors.svgFile = "SVG template file is required";
    if (customizableAreas.length === 0) newErrors.areas = "At least one customizable area is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('authToken');
      
      // First upload the thumbnail and SVG files
      const formData = new FormData();
      formData.append('thumbnail', thumbnail);
      formData.append('svg', svgFile);
      
      const uploadResponse = await axios.post(`${BACKEND_URL}templates/upload-files`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const { thumbnailUrl, svgUrl } = uploadResponse.data;
      
      // Create the template
      const templateResponse = await axios.post(`${BACKEND_URL}templates`, {
        ...templateData,
        thumbnailUrl,
        svgData: svgUrl,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const templateId = templateResponse.data.id;
      
      // Create customizable areas
      await Promise.all(
        customizableAreas.map(area => 
          axios.post(`${BACKEND_URL}templates/${templateId}/areas`, area, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );
      
      // Handle success
      onSuccess();
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error creating template:", error);
      
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert("Failed to create template. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
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
          <h2 className="text-xl font-semibold">Create New Customization Template</h2>
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
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-3 font-medium ${activeTab === 'basic' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
          >
            Basic Info
          </button>
          <button 
            onClick={() => setActiveTab('areas')}
            className={`px-4 py-3 font-medium ${activeTab === 'areas' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
          >
            Customizable Areas
          </button>
          <button 
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-3 font-medium ${activeTab === 'preview' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
          >
            Preview
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-6">
                {/* Template Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={templateData.name} 
                    onChange={handleChange} 
                    className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>
                
                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea 
                    id="description" 
                    name="description" 
                    value={templateData.description} 
                    onChange={handleChange} 
                    rows="4" 
                    className="w-full p-2 border border-gray-300 rounded-md"
                  ></textarea>
                </div>
                
                {/* Active Status */}
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="isActive" 
                    name="isActive" 
                    checked={templateData.isActive} 
                    onChange={handleChange} 
                    className="h-4 w-4 text-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Template is active
                  </label>
                </div>
                
                {/* Order Index */}
                <div>
                  <label htmlFor="orderIndex" className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input 
                    type="number" 
                    id="orderIndex" 
                    name="orderIndex" 
                    value={templateData.orderIndex} 
                    onChange={handleChange} 
                    min="0" 
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              {/* Right column */}
              <div className="space-y-6">
                {/* Thumbnail Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thumbnail Image <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {thumbnailPreview ? (
                      <div className="relative inline-block">
                        <img 
                          src={thumbnailPreview} 
                          alt="Thumbnail preview" 
                          className="h-48 object-contain mx-auto"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setThumbnail(null);
                            setThumbnailPreview(null);
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Image className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-2">
                          <label 
                            htmlFor="thumbnail-upload" 
                            className="cursor-pointer rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white"
                          >
                            Upload Thumbnail
                          </label>
                          <input 
                            id="thumbnail-upload" 
                            name="thumbnail-upload" 
                            type="file" 
                            accept="image/*" 
                            onChange={handleThumbnailChange} 
                            className="hidden" 
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">PNG, JPG, JPEG up to 5MB</p>
                      </div>
                    )}
                  </div>
                  {errors.thumbnail && <p className="mt-1 text-sm text-red-500">{errors.thumbnail}</p>}
                </div>
                
                {/* SVG Template Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SVG Template File <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {svgFile ? (
                      <div className="relative">
                        <div className="flex items-center justify-center p-4 bg-gray-100 rounded">
                          <Layers className="h-8 w-8 text-gray-500 mr-2" />
                          <span className="text-sm font-medium">{svgFile.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSvgFile(null);
                            setSvgPreview(null);
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Layers className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-2">
                          <label 
                            htmlFor="svg-upload" 
                            className="cursor-pointer rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white"
                          >
                            Upload SVG
                          </label>
                          <input 
                            id="svg-upload" 
                            name="svg-upload" 
                            type="file" 
                            accept=".svg,image/svg+xml" 
                            onChange={handleSvgChange} 
                            className="hidden" 
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">SVG file only</p>
                      </div>
                    )}
                  </div>
                  {errors.svgFile && <p className="mt-1 text-sm text-red-500">{errors.svgFile}</p>}
                </div>
              </div>
            </div>
          )}
          
          {/* Customizable Areas Tab */}
          {activeTab === 'areas' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Customizable Areas</h3>
                <button
                  type="button"
                  onClick={addCustomizableArea}
                  className="flex items-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  <Plus size={16} className="mr-1" />
                  Add Area
                </button>
              </div>
              
              {errors.areas && <p className="text-sm text-red-500">{errors.areas}</p>}
              
              {customizableAreas.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500">No customizable areas added yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Area List */}
                  <div className="space-y-4">
                    {customizableAreas.map((area, index) => (
                      <div 
                        key={index} 
                        className={`p-4 border rounded-md cursor-pointer ${activeAreaIndex === index ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                        onClick={() => setActiveAreaIndex(index)}
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">{area.name}</h4>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCustomizableArea(index);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{area.description || 'No description'}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {area.shape}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Area Editor */}
                  {activeAreaIndex !== null && (
                    <div className="p-4 border border-gray-200 rounded-md">
                      <h4 className="font-medium mb-4">Edit Area: {customizableAreas[activeAreaIndex].name}</h4>
                      
                      <div className="space-y-4">
                        {/* Area Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Area Name
                          </label>
                          <input 
                            type="text" 
                            value={customizableAreas[activeAreaIndex].name} 
                            onChange={(e) => updateCustomizableArea(activeAreaIndex, 'name', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        
                        {/* Description */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea 
                            value={customizableAreas[activeAreaIndex].description} 
                            onChange={(e) => updateCustomizableArea(activeAreaIndex, 'description', e.target.value)}
                            rows="2" 
                            className="w-full p-2 border border-gray-300 rounded-md"
                          ></textarea>
                        </div>
                        
                        {/* Shape Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Shape
                          </label>
                          <select
                            value={customizableAreas[activeAreaIndex].shape} 
                            onChange={(e) => updateCustomizableArea(activeAreaIndex, 'shape', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            {shapeOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Shape Parameters */}
                        <div className="grid grid-cols-2 gap-4">
                          {customizableAreas[activeAreaIndex].shape === 'circle' || 
                           customizableAreas[activeAreaIndex].shape === 'hexagon' ? (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Radius (px)
                              </label>
                              <input 
                                type="number" 
                                value={customizableAreas[activeAreaIndex].radius || ''} 
                                onChange={(e) => updateCustomizableArea(activeAreaIndex, 'radius', parseFloat(e.target.value))}
                                min="1"
                                step="1"
                                className="w-full p-2 border border-gray-300 rounded-md"
                              />
                            </div>
                          ) : (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Width (px)
                                </label>
                                <input 
                                  type="number" 
                                  value={customizableAreas[activeAreaIndex].width || ''} 
                                  onChange={(e) => updateCustomizableArea(activeAreaIndex, 'width', parseFloat(e.target.value))}
                                  min="1"
                                  step="1"
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Height (px)
                                </label>
                                <input 
                                  type="number" 
                                  value={customizableAreas[activeAreaIndex].height || ''} 
                                  onChange={(e) => updateCustomizableArea(activeAreaIndex, 'height', parseFloat(e.target.value))}
                                  min="1"
                                  step="1"
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                />
                              </div>
                            </>
                          )}
                        </div>
                        
                        {/* Position */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Center X (%)
                            </label>
                            <input 
                              type="number" 
                              value={customizableAreas[activeAreaIndex].centerX} 
                              onChange={(e) => updateCustomizableArea(activeAreaIndex, 'centerX', parseFloat(e.target.value))}
                              min="0"
                              max="100"
                              step="1"
                              className="w-full p-2 border border-gray-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Center Y (%)
                            </label>
                            <input 
                              type="number" 
                              value={customizableAreas[activeAreaIndex].centerY} 
                              onChange={(e) => updateCustomizableArea(activeAreaIndex, 'centerY', parseFloat(e.target.value))}
                              min="0"
                              max="100"
                              step="1"
                              className="w-full p-2 border border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                        
                        {/* Default Transformations */}
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              <Move size={14} className="inline mr-1" />
                              Position X
                            </label>
                            <input 
                              type="number" 
                              value={customizableAreas[activeAreaIndex].defaultPositionX} 
                              onChange={(e) => updateCustomizableArea(activeAreaIndex, 'defaultPositionX', parseFloat(e.target.value))}
                              step="0.1"
                              className="w-full p-2 border border-gray-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              <Move size={14} className="inline mr-1" />
                              Position Y
                            </label>
                            <input 
                              type="number" 
                              value={customizableAreas[activeAreaIndex].defaultPositionY} 
                              onChange={(e) => updateCustomizableArea(activeAreaIndex, 'defaultPositionY', parseFloat(e.target.value))}
                              step="0.1"
                              className="w-full p-2 border border-gray-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              <Maximize2 size={14} className="inline mr-1" />
                              Scale
                            </label>
                            <input 
                              type="number" 
                              value={customizableAreas[activeAreaIndex].defaultScale} 
                              onChange={(e) => updateCustomizableArea(activeAreaIndex, 'defaultScale', parseFloat(e.target.value))}
                              min="0.1"
                              max="5"
                              step="0.1"
                              className="w-full p-2 border border-gray-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              <RotateCw size={14} className="inline mr-1" />
                              Rotation (°)
                            </label>
                            <input 
                              type="number" 
                              value={customizableAreas[activeAreaIndex].defaultRotation} 
                              onChange={(e) => updateCustomizableArea(activeAreaIndex, 'defaultRotation', parseFloat(e.target.value))}
                              min="-180"
                              max="180"
                              step="1"
                              className="w-full p-2 border border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                        
                        {/* Allowed File Formats */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Allowed File Formats
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {fileTypeOptions.map(option => (
                              <div key={option.value} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`format-${activeAreaIndex}-${option.value}`}
                                  checked={customizableAreas[activeAreaIndex].allowedFormats.includes(option.value)}
                                  onChange={() => updateCustomizableArea(activeAreaIndex, 'allowedFormats', option.value)}
                                  className="h-4 w-4 text-red-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`format-${activeAreaIndex}-${option.value}`} className="ml-2 text-sm text-gray-700">
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Max File Size */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Maximum File Size (MB)
                          </label>
                          <input 
                            type="number" 
                            value={customizableAreas[activeAreaIndex].maxFileSizeMB} 
                            onChange={(e) => updateCustomizableArea(activeAreaIndex, 'maxFileSizeMB', parseFloat(e.target.value))}
                            min="0.1"
                            max="20"
                            step="0.1"
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Template Preview</h3>
              
              {!svgPreview ? (
                <div className="relative border border-gray-200 rounded-md p-4 bg-gray-50">
                  {/* SVG Preview Container */}
                  <div 
                    className="relative mx-auto bg-white" 
                    style={{ 
                      width: '100px', 
                      height: '100px',
                      backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                      backgroundSize: '20px 20px',
                      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                    }}
                  >
                    {/* Render SVG */}
                    <div 
                      className="absolute inset-0" 
                      dangerouslySetInnerHTML={{ __html: svgPreview }}
                    />
                    
                    {/* Render customizable areas */}
                    {customizableAreas.map((area, index) => {
                      const isActive = activeAreaIndex === index;
                      const areaStyle = {
                        position: 'absolute',
                        left: `${area.centerX - (area.width ? area.width/2 : area.radius || 0)}%`,
                        top: `${area.centerY - (area.height ? area.height/2 : area.radius || 0)}%`,
                        width: area.width ? `${area.width}%` : `${(area.radius || 0) * 2}%`,
                        height: area.height ? `${area.height}%` : `${(area.radius || 0) * 2}%`,
                        borderRadius: area.shape === 'circle' ? '50%' : '0',
                        backgroundColor: isActive ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)',
                        border: `2px dashed ${isActive ? '#ef4444' : '#3b82f6'}`,
                        pointerEvents: 'none'
                      };
                      
                      if (area.shape === 'triangle') {
                        areaStyle.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
                      } else if (area.shape === 'hexagon') {
                        areaStyle.clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
                      }
                      
                      return (
                        <div 
                          key={index}
                          style={areaStyle}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveAreaIndex(index);
                          }}
                        >
                          <div className="absolute -top-6 left-0 text-xs font-medium px-2 py-1 bg-white rounded shadow">
                            {area.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Areas Summary */}
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Customizable Areas</h4>
                    {customizableAreas.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {customizableAreas.map((area, index) => (
                          <div 
                            key={index} 
                            className={`p-3 border rounded-md cursor-pointer ${activeAreaIndex === index ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                            onClick={() => setActiveAreaIndex(index)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium">{area.name}</h5>
                                <p className="text-sm text-gray-500">{area.description || 'No description'}</p>
                              </div>
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {area.shape}
                              </span>
                            </div>
                            <div className="mt-2 text-xs text-gray-600">
                              <p>Position: {area.centerX}%, {area.centerY}%</p>
                              {area.width && area.height && (
                                <p>Size: {area.width} × {area.height}px</p>
                              )}
                              {area.radius && (
                                <p>Radius: {area.radius}px</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No areas defined yet</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                  <Layers className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-500">Upload an SVG template to see preview</p>
                </div>
              )}
            </div>
          )}
          
          {/* Form Actions */}
          <div className="flex justify-between items-center mt-8 pt-4 border-t">
            <div>
              {activeTab !== 'basic' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'areas' ? 'basic' : 'areas')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Back
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              {activeTab !== 'preview' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'basic' ? 'areas' : 'preview')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Next
                </button>
              )}
              
              {activeTab === 'preview' && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create Template'
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateCreatorModal;