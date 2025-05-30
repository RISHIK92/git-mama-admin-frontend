import { useState, useEffect } from "react";
import axios from "axios";
import { Star, Edit, Trash2, Plus, X } from "lucide-react";
import { BACKEND_URL } from "../Url";

export function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState({
    name: "",
    content: "",
    rating: 5,
    imageUrl: "",
    isActive: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${BACKEND_URL}testimonials`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTestimonials(response.data);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      setError("Failed to load testimonials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentTestimonial({
      ...currentTestimonial,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleRatingChange = (rating) => {
    setCurrentTestimonial({
      ...currentTestimonial,
      rating,
    });
  };

  const resetForm = () => {
    setCurrentTestimonial({
      name: "",
      content: "",
      rating: 5,
      imageUrl: "",
      isActive: true,
    });
    setIsEditing(false);
  };

  const openModal = (testimonial = null) => {
    if (testimonial) {
      setCurrentTestimonial(testimonial);
      setIsEditing(true);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");

    try {
      if (isEditing) {
        await axios.put(
          `${BACKEND_URL}testimonials/${currentTestimonial.id}`,
          currentTestimonial,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(`${BACKEND_URL}testimonials`, currentTestimonial, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      fetchTestimonials();
      closeModal();
    } catch (error) {
      console.error("Error saving testimonial:", error);
      setError("Failed to save testimonial");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) {
      return;
    }

    const token = localStorage.getItem("authToken");

    try {
      await axios.delete(`${BACKEND_URL}testimonials/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTestimonials();
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      setError("Failed to delete testimonial");
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          className={`${
            i <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="p-4 md:p-6 h-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Testimonials</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
        >
          <Plus size={16} className="mr-2" />
          Add Testimonial
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className={`bg-white p-4 rounded-lg border shadow-sm ${
                !testimonial.isActive ? "opacity-50" : ""
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  {testimonial.imageUrl ? (
                    <img
                      src={testimonial.imageUrl}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full object-cover mr-3"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <span className="text-gray-500 font-bold">
                        {testimonial.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <div className="flex">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openModal(testimonial)}
                    className="p-1 text-gray-500 hover:text-blue-500"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    className="p-1 text-gray-500 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-2">{testimonial.content}</p>
              {!testimonial.isActive && (
                <span className="text-xs text-gray-500 font-medium">
                  (Inactive)
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal for adding/editing testimonials */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">
                {isEditing ? "Edit Testimonial" : "Add New Testimonial"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={currentTestimonial.name}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Image URL (optional)
                </label>
                <input
                  type="text"
                  name="imageUrl"
                  value={currentTestimonial.imageUrl}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Rating
                </label>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(star)}
                      className="focus:outline-none mr-1"
                    >
                      <Star
                        size={24}
                        className={`${
                          star <= currentTestimonial.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Content
                </label>
                <textarea
                  name="content"
                  value={currentTestimonial.content}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                  required
                ></textarea>
              </div>
              {isEditing && (
                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={currentTestimonial.isActive}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label htmlFor="isActive" className="text-gray-700">
                    Active
                  </label>
                </div>
              )}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                >
                  {isEditing ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {testimonials.length === 0 && !isLoading && (
        <div className="bg-white p-8 rounded-lg border shadow-sm flex flex-col items-center justify-center">
          <div className="text-gray-500 mb-4 text-center">
            No testimonials available. Add your first testimonial to get
            started.
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
          >
            <Plus size={16} className="mr-2" />
            Add Testimonial
          </button>
        </div>
      )}
    </div>
  );
}
