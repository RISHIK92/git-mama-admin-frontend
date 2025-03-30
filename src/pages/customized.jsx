import React, { useState, useEffect } from "react";
import { 
  Save, 
  Plus, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  X, 
  Edit, 
  ArrowUpDown,
  Info,
  RefreshCw,
  LoaderPinwheel
} from "lucide-react";
import axios from "axios";
import { BACKEND_URL } from "../Url";

export const CustomizeHomePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Home page data
  const [homeData, setHomeData] = useState({
    heroBanner: {
      images: [],
      titles: [],
      subtitles: []
    },
    flashSale: {
      description: "Hurry Up! Flash Sale",
      enabled: true
    },
    advert: {
      images: []
    },
    occasions: {
      occasionName: [],
      occasionImages: []
    },
    customSections: []
  });

  // Temporary states for image uploads with tracking of which section/index
  const [imageUploads, setImageUploads] = useState({
    heroBanner: { files: {}, previews: {} },
    advert: { files: {}, previews: {} },
    occasion: { files: {}, previews: {} }
  });
  
  const [uploadingImage, setUploadingImage] = useState({ section: null, index: null });

  // Fetch existing home page data
  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(`${BACKEND_URL}home`, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        if (response.data) {
          const data = response.data;
          const heroBanner = data.heroBanner || [];
          const occasions = data.occasions || [];
          const customSections = data.customSections
          console.log(customSections)
  
          setHomeData(prevData => ({
            ...prevData,
            heroBanner: {
              images: heroBanner.images || [],
              titles: heroBanner.titles || [],
              subtitles: heroBanner.subtitles || []
            },
            flashSale: {
              description: "Hurry Up! Flash Sale",
              enabled: prevData.flashSale?.enabled ?? false
            },
            advert: {
              images: data.advert?.images || []
            },
            occasions: {
              occasionName: occasions.occasionName || [],
              occasionImages: occasions.occasionImages || []
            },
            customSections: customSections.map(section => ({
              category: section.category || "",
              title: section.title || "",
              enabled: section.enabled ?? false
            }))
          }));
        }
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch home page data:", err);
        setError("Failed to load home page data. Please try again.");
        setLoading(false);
      }
    };
  
    fetchHomeData();
  }, []);
  
    const validateImageFile = (file) => {
        // Maximum allowed file size (5MB)
        const MAX_FILE_SIZE = 5 * 1024 * 1024; 
        
        if (file.size > MAX_FILE_SIZE) {
        setError(`Image size exceeds the maximum allowed size (5MB)`);
        return false;
        }
        
        // Check file type
        if (!file.type.match('image.*')) {
        setError(`Only image files are allowed`);
        return false;
        }
        
        return true;
    };
  
  // Update handleImageSelect to use validation
  const handleImageSelect = (section, index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!validateImageFile(file)) {
      e.target.value = null;
      return;
    }
    
    // Create a preview URL for the selected image
    const previewUrl = URL.createObjectURL(file);
    
    setImageUploads(prev => ({
      ...prev,
      [section]: {
        files: { ...prev[section].files, [index]: file },
        previews: { ...prev[section].previews, [index]: previewUrl }
      }
    }));
  };
  
  // Clear image preview when component unmounts
  useEffect(() => {
    return () => {
      // Revoke all object URLs to avoid memory leaks
      Object.values(imageUploads).forEach(section => {
        Object.values(section.previews).forEach(URL.revokeObjectURL);
      });
    };
  }, []);

  // Save all homepage data
  const saveHomeData = async () => {
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(`${BACKEND_URL}home`, homeData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      setSuccess("Home page data saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
      setSaving(false);
    } catch (err) {
      console.error("Failed to save home page data:", err);
      setError("Failed to save home page data. Please try again.");
      setSaving(false);
    }
  };

// Update uploadImage function in CustomizeHomePage.jsx
const uploadImage = async (section, index) => {
    if (!imageUploads[section].files[index]) return null;
    
    // Set uploading state
    setUploadingImage({ section, index });
    
    try {
      const formData = new FormData();
      formData.append("image", imageUploads[section].files[index]);
      formData.append("section", section);
      formData.append("index", index);
      
      const token = localStorage.getItem("authToken");
      const response = await axios.post(`${BACKEND_URL}upload-s3-image`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data.url) {
        if (section === "heroBanner") {
          updateHeroBannerSlide(index, "images", response.data.url);
        } else if (section === "advert") {
          updateAdvertImage(index, response.data.url);
        } else if (section === "occasion") {
          updateOccasion(index, "image", response.data.url);
        }
        
        setImageUploads(prev => ({
          ...prev,
          [section]: {
            files: { ...prev[section].files, [index]: null },
            previews: { ...prev[section].previews, [index]: null }
          }
        }));
        
        setSuccess(`Image uploaded successfully to S3!`);
        setTimeout(() => setSuccess(null), 3000);
      }
      return response.data.url;
    } catch (err) {
      console.error(`Failed to upload ${section} image to S3:`, err);
      setError(`Failed to upload image to S3. ${err.response?.data?.message || 'Please try again.'}`);
      return null;
    } finally {
      setUploadingImage({ section: null, index: null });
    }
  };

  // Add new hero banner slide
  const addHeroBannerSlide = () => {
    setHomeData(prev => ({
      ...prev,
      heroBanner: {
        ...prev.heroBanner,
        images: [...prev.heroBanner.images, ""],
        titles: [...prev.heroBanner.titles, "New Title"],
        subtitles: [...prev.heroBanner.subtitles, "New Subtitle"]
      }
    }));
  };

  // Remove hero banner slide
  const removeHeroBannerSlide = (index) => {
    setHomeData(prev => ({
      ...prev,
      heroBanner: {
        ...prev.heroBanner,
        images: prev.heroBanner.images.filter((_, i) => i !== index),
        titles: prev.heroBanner.titles.filter((_, i) => i !== index),
        subtitles: prev.heroBanner.subtitles.filter((_, i) => i !== index)
      }
    }));
    
    // Also remove any uploaded images or previews
    setImageUploads(prev => {
      const newFiles = { ...prev.heroBanner.files };
      const newPreviews = { ...prev.heroBanner.previews };
      
      delete newFiles[index];
      if (newPreviews[index]) {
        URL.revokeObjectURL(newPreviews[index]);
        delete newPreviews[index];
      }
      
      return {
        ...prev,
        heroBanner: {
          files: newFiles,
          previews: newPreviews
        }
      };
    });
  };

  // Update hero banner slide
  const updateHeroBannerSlide = (index, field, value) => {
    setHomeData(prev => {
      const newHeroBanner = { ...prev.heroBanner };
      newHeroBanner[field][index] = value;
      return { ...prev, heroBanner: newHeroBanner };
    });
  };

  // Add new occasion
  const addOccasion = () => {
    setHomeData(prev => ({
      ...prev,
      occasions: {
        ...prev.occasions,
        occasionName: [...prev.occasions.occasionName, "New Occasion"],
        occasionImages: [...prev.occasions.occasionImages, ""]
      }
    }));
  };

  // Remove occasion
  const removeOccasion = (index) => {
    setHomeData(prev => ({
      ...prev,
      occasions: {
        ...prev.occasions,
        occasionName: prev.occasions.occasionName.filter((_, i) => i !== index),
        occasionImages: prev.occasions.occasionImages.filter((_, i) => i !== index)
      }
    }));
    
    // Also remove any uploaded images or previews
    setImageUploads(prev => {
      const newFiles = { ...prev.occasion.files };
      const newPreviews = { ...prev.occasion.previews };
      
      delete newFiles[index];
      if (newPreviews[index]) {
        URL.revokeObjectURL(newPreviews[index]);
        delete newPreviews[index];
      }
      
      return {
        ...prev,
        occasion: {
          files: newFiles,
          previews: newPreviews
        }
      };
    });
  };

  // Update occasion
  const updateOccasion = (index, field, value) => {
    setHomeData(prev => {
      const newOccasions = { ...prev.occasions };
      if (field === "name") {
        newOccasions.occasionName[index] = value;
      } else if (field === "image") {
        newOccasions.occasionImages[index] = value;
      }
      return { ...prev, occasions: newOccasions };
    });
  };

  // Add new advertisement image
  const addAdvertImage = () => {
    setHomeData(prev => ({
      ...prev,
      advert: {
        ...prev.advert,
        images: [...prev.advert.images, ""]
      }
    }));
  };

  // Remove advertisement image
  const removeAdvertImage = (index) => {
    setHomeData(prev => ({
      ...prev,
      advert: {
        ...prev.advert,
        images: prev.advert.images.filter((_, i) => i !== index)
      }
    }));
    
    // Also remove any uploaded images or previews
    setImageUploads(prev => {
      const newFiles = { ...prev.advert.files };
      const newPreviews = { ...prev.advert.previews };
      
      delete newFiles[index];
      if (newPreviews[index]) {
        URL.revokeObjectURL(newPreviews[index]);
        delete newPreviews[index];
      }
      
      return {
        ...prev,
        advert: {
          files: newFiles,
          previews: newPreviews
        }
      };
    });
  };

  // Update advertisement image
  const updateAdvertImage = (index, value) => {
    setHomeData(prev => {
      const newAdvert = { ...prev.advert };
      newAdvert.images[index] = value;
      return { ...prev, advert: newAdvert };
    });
  };

  // Add new custom section
  const addCustomSection = () => {
    setHomeData(prev => ({
      ...prev,
      customSections: [
        ...prev.customSections,
        { category: "", title: "New Section", enabled: true }
      ]
    }));
  };

  // Remove custom section
  const removeCustomSection = (index) => {
    setHomeData(prev => ({
      ...prev,
      customSections: prev.customSections.filter((_, i) => i !== index)
    }));
  };

  // Update custom section
  const updateCustomSection = (index, field, value) => {
    setHomeData(prev => {
      const newSections = [...prev.customSections];
      newSections[index] = { ...newSections[index], [field]: value };
      return { ...prev, customSections: newSections };
    });
  };

  // Move section up/down in order
  const moveCustomSection = (index, direction) => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === homeData.customSections.length - 1)) {
      return;
    }

    setHomeData(prev => {
      const newSections = [...prev.customSections];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      const temp = newSections[index];
      newSections[index] = newSections[targetIndex];
      newSections[targetIndex] = temp;
      return { ...prev, customSections: newSections };
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 ml-72 flex flex-col h-screen">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Customize Home Page</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <LoaderPinwheel className="h-12 w-12 text-red-500 animate-spin" />
            <p className="mt-4 text-gray-600">Loading home page data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to get an image to display (either from actual data or preview)
  const getImageToDisplay = (section, index) => {
    // First check if there's a preview for this image
    if (imageUploads[section].previews[index]) {
      return imageUploads[section].previews[index];
    }
    
    // Otherwise use the actual image from the data
    if (section === "heroBanner") {
      return homeData.heroBanner.images[index] || "";
    } else if (section === "advert") {
      return homeData.advert.images[index] || "";
    } else if (section === "occasion") {
      return homeData.occasions.occasionImages[index] || "";
    }
    return "";
  };

  // Check if image is currently being uploaded
  const isUploading = (section, index) => {
    return uploadingImage.section === section && uploadingImage.index === index;
  };

  return (
    <div className="p-6 ml-72">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Customize Home Page</h1>
        <button
          onClick={saveHomeData}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:bg-gray-400"
        >
          {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Status messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex justify-between items-center">
          <div className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex justify-between items-center">
          <div className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-green-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="space-y-8">
        {/* Hero Banner Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ImageIcon className="h-5 w-5 mr-2 text-red-500" />
            Hero Banner Slides
          </h2>
          
          <div className="space-y-4">
            {homeData.heroBanner.images.map((_, index) => (
              <div key={`hero-${index}`} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">Slide {index + 1}</h3>
                  <button 
                    onClick={() => removeHeroBannerSlide(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Image</label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 border rounded-lg bg-white p-1 h-32 relative">
                        {getImageToDisplay("heroBanner", index) ? (
                          <img 
                            src={getImageToDisplay("heroBanner", index)} 
                            alt={`Hero slide ${index + 1}`}
                            className="h-full w-auto mx-auto object-contain"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            <ImageIcon className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col space-y-2">
                        <label className="cursor-pointer flex items-center justify-center px-3 py-2 border rounded-md text-xs bg-gray-100 hover:bg-gray-200">
                          <Upload className="h-3 w-3 mr-1" />
                          <span>Select</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleImageSelect("heroBanner", index, e)}
                          />
                        </label>
                        <button
                          onClick={() => uploadImage("heroBanner", index)}
                          disabled={!imageUploads.heroBanner.files[index] || isUploading("heroBanner", index)}
                          className="flex items-center justify-center px-3 py-2 border rounded-md text-xs bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-300 disabled:text-gray-500"
                        >
                          {isUploading("heroBanner", index) ? 
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : 
                            <Upload className="h-3 w-3 mr-1" />
                          }
                          <span>{isUploading("heroBanner", index) ? "Uploading..." : "Upload"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={homeData.heroBanner.titles[index] || ""}
                        onChange={(e) => updateHeroBannerSlide(index, "titles", e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Slide title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                      <input
                        type="text"
                        value={homeData.heroBanner.subtitles[index] || ""}
                        onChange={(e) => updateHeroBannerSlide(index, "subtitles", e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Slide subtitle"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <button
              onClick={addHeroBannerSlide}
              className="flex items-center text-sm px-4 py-2 border border-dashed rounded-md text-gray-600 hover:bg-gray-50 w-full justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Slide
            </button>
          </div>
        </section>

        {/* Flash Sale Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <ImageIcon className="h-5 w-5 mr-2 text-red-500" />
              Flash Sale
            </h2>
            <label className="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={homeData.flashSale.enabled}
                onChange={(e) => setHomeData(prev => ({
                  ...prev,
                  flashSale: {
                    ...prev.flashSale,
                    enabled: e.target.checked
                  }
                }))}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              <span className="ms-3 text-sm font-medium text-gray-700">Enabled</span>
            </label>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={homeData.flashSale.description}
                onChange={(e) => setHomeData(prev => ({
                  ...prev,
                  flashSale: {
                    ...prev.flashSale,
                    description: e.target.value
                  }
                }))}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Flash sale description"
              />
            </div>
            <p className="text-sm text-gray-500 italic">
              Note: Flash sale products are managed in the Products section with the "Flash Sale" tag.
            </p>
          </div>
        </section>

        {/* Gifts for Occasions Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ImageIcon className="h-5 w-5 mr-2 text-red-500" />
            Gifts for Occasions
          </h2>
          
          <div className="space-y-4">
            {homeData.occasions.occasionName.map((name, index) => (
              <div key={`occasion-${index}`} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">Occasion {index + 1}</h3>
                  <button 
                    onClick={() => removeOccasion(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Image</label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 border rounded-lg bg-white p-1 h-32 relative">
                        {getImageToDisplay("occasion", index) ? (
                          <img 
                            src={getImageToDisplay("occasion", index)} 
                            alt={`Occasion ${name}`}
                            className="h-full w-auto mx-auto object-contain"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            <ImageIcon className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col space-y-2">
                        <label className="cursor-pointer flex items-center justify-center px-3 py-2 border rounded-md text-xs bg-gray-100 hover:bg-gray-200">
                          <Upload className="h-3 w-3 mr-1" />
                          <span>Select</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleImageSelect("occasion", index, e)}
                          />
                        </label>
                        <button
                          onClick={() => uploadImage("occasion", index)}
                          disabled={!imageUploads.occasion.files[index] || isUploading("occasion", index)}
                          className="flex items-center justify-center px-3 py-2 border rounded-md text-xs bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-300 disabled:text-gray-500"
                        >
                          {isUploading("occasion", index) ? 
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : 
                            <Upload className="h-3 w-3 mr-1" />
                          }
                          <span>{isUploading("occasion", index) ? "Uploading..." : "Upload"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Occasion Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => updateOccasion(index, "name", e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Occasion name"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button
              onClick={addOccasion}
              className="flex items-center text-sm px-4 py-2 border border-dashed rounded-md text-gray-600 hover:bg-gray-50 w-full justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Occasion
            </button>
          </div>
        </section>

    <section className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ImageIcon className="h-5 w-5 mr-2 text-red-500" />
            Advertisement Banners
        </h2>
  
        <div className="space-y-4">
            {homeData.advert.images.map((_, index) => (
            <div key={`advert-${index}`} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between mb-2">
                <h3 className="font-medium">Banner {index + 1}</h3>
                <button 
                    onClick={() => removeAdvertImage(index)}
                    className="text-red-500 hover:text-red-700"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
                </div>
            
                <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Image</label>
                <div className="flex items-center space-x-2">
                    <div className="flex-1 border rounded-lg bg-white p-1 h-32 relative">
                    {getImageToDisplay("advert", index) ? (
                        <img 
                        src={getImageToDisplay("advert", index)} 
                        alt={`Advertisement ${index + 1}`}
                        className="h-full w-auto mx-auto object-contain"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                        <ImageIcon className="h-8 w-8" />
                        </div>
                    )}
                    </div>
                    <div className="flex flex-col space-y-2">
                    <label className="cursor-pointer flex items-center justify-center px-3 py-2 border rounded-md text-xs bg-gray-100 hover:bg-gray-200">
                        <Upload className="h-3 w-3 mr-1" />
                        <span>Select</span>
                        <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageSelect("advert", index, e)}
                        />
                    </label>
                    <button
                        onClick={() => uploadImage("advert", index)}
                        disabled={!imageUploads.advert.files[index] || isUploading("advert", index)}
                        className="flex items-center justify-center px-3 py-2 border rounded-md text-xs bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-300 disabled:text-gray-500"
                    >
                        {isUploading("advert", index) ? 
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : 
                        <Upload className="h-3 w-3 mr-1" />
                        }
                        <span>{isUploading("advert", index) ? "Uploading..." : "Upload"}</span>
                        </button>
                    </div>
                </div>
                </div>
            </div>
        ))}
        <button
        onClick={addAdvertImage}
        className="flex items-center text-sm px-4 py-2 border border-dashed rounded-md text-gray-600 hover:bg-gray-50 w-full justify-center"
        >
        <Plus className="h-4 w-4 mr-2" />
        Add Advertisement
        </button>
    </div>
    </section>

        {/* Custom Sections */}
        <section className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ImageIcon className="h-5 w-5 mr-2 text-red-500" />
            Custom Product Sections
          </h2>
          
          <div className="space-y-4">
            {homeData.customSections.map((section, index) => (
              <div key={`custom-${index}`} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">Section {index + 1}</h3>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => moveCustomSection(index, 'up')}
                      disabled={index === 0}
                      className="text-gray-500 hover:text-gray-700 disabled:text-gray-300"
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => removeCustomSection(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      value={section.category}
                      onChange={(e) => updateCustomSection(index, "category", e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Category name (e.g., Birthday, Valentines)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Products with this category will be displayed in this section
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateCustomSection(index, "title", e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Section title"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={section.enabled}
                          onChange={(e) => updateCustomSection(index, "enabled", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                        <span className="ms-3 text-sm font-medium text-gray-700">Enabled</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <button
              onClick={addCustomSection}
              className="flex items-center text-sm px-4 py-2 border border-dashed rounded-md text-gray-600 hover:bg-gray-50 w-full justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Section
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CustomizeHomePage;