import { useState, useEffect } from "react";
import axios from "axios";
import { Box } from "../components/box";
import { Tag, Ticket, Trash2, Edit2, Plus, Calendar, CheckCircle, XCircle } from "lucide-react";
import { BACKEND_URL } from "../Url";

export function CouponPage() {
    const [coupons, setCoupons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [formData, setFormData] = useState({
        code: "",
        description: "",
        discountType: "PERCENTAGE",
        discountValue: "",
        minPurchaseAmount: "",
        maxDiscountAmount: "",
        startDate: "",
        endDate: "",
        isActive: true,
        usageLimit: "",
        perUserLimit: "",
        applicableUserIds: [],
        applicableProductIds: [],
        applicableCategories: [],
        applicableOccasions: [],
        applicableRecipients: []
    });
    
    // Select options
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [occasions, setOccasions] = useState([]);
    const [recipients, setRecipients] = useState([]);

    useEffect(() => {
        fetchCoupons();
        fetchSelectOptions();
    }, []);

    const fetchCoupons = () => {
        const token = localStorage.getItem("authToken");
        setIsLoading(true);
        
        axios.get(`${BACKEND_URL}coupons`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            setCoupons(response.data);
            setIsLoading(false);
        })
        .catch(error => {
            console.error("Error fetching coupons:", error);
            setIsLoading(false);
        });
    };

    const fetchSelectOptions = () => {
        const token = localStorage.getItem("authToken");
        
        // Fetch users
        axios.get(`${BACKEND_URL}users`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            setUsers(response.data);
        })
        .catch(error => {
            console.error("Error fetching users:", error);
        });
        
        // Fetch products
        axios.get(`${BACKEND_URL}products`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            setProducts(response.data);
        })
        .catch(error => {
            console.error("Error fetching products:", error);
        });
        
        // Fetch categories
        axios.get(`${BACKEND_URL}categories`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            setCategories(response.data.map(item => item.category));
        })
        .catch(error => {
            console.error("Error fetching categories:", error);
        });
        
        // Fetch occasions
        axios.get(`${BACKEND_URL}occasions`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            setOccasions(response.data.map(item => item.occasions));
        })
        .catch(error => {
            console.error("Error fetching occasions:", error);
        });
        
        // Fetch recipients
        axios.get(`${BACKEND_URL}recipients`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            setRecipients(response.data.map(item => item.recipients));
        })
        .catch(error => {
            console.error("Error fetching recipients:", error);
        });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox') {
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };
    
    const handleMultiSelectChange = (e) => {
        const { name } = e.target;
        const options = Array.from(e.target.selectedOptions).map(option => option.value);
        setFormData({ ...formData, [name]: options });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const token = localStorage.getItem("authToken");
        
        const payload = {
            ...formData,
            discountValue: parseFloat(formData.discountValue),
            minPurchaseAmount: formData.minPurchaseAmount ? parseFloat(formData.minPurchaseAmount) : null,
            maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
            usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
            perUserLimit: formData.perUserLimit ? parseInt(formData.perUserLimit) : null,
            applicableUserIds: formData.applicableUserIds.map(id => parseInt(id)),
            applicableProductIds: formData.applicableProductIds.map(id => parseInt(id))
        };
        
        if (editingCoupon) {
            axios.put(`${BACKEND_URL}coupons/${editingCoupon.id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(() => {
                resetForm();
                fetchCoupons();
            })
            .catch(error => {
                console.error("Error updating coupon:", error);
                alert("Failed to update coupon. Please try again.");
            });
        } else {
            // Create new coupon
            axios.post(`${BACKEND_URL}coupons`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(() => {
                resetForm();
                fetchCoupons();
            })
            .catch(error => {
                console.error("Error creating coupon:", error);
                alert("Failed to create coupon. Please try again.");
            });
        }
    };
    
    const handleEdit = (coupon) => {
        const startDate = new Date(coupon.startDate).toISOString().substr(0, 10);
        const endDate = new Date(coupon.endDate).toISOString().substr(0, 10);
        
        setFormData({
            ...coupon,
            startDate,
            endDate
        });
        
        setEditingCoupon(coupon);
        setShowForm(true);
        window.scrollTo(0, 0);
    };
    
    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this coupon?")) {
            const token = localStorage.getItem("authToken");
            
            axios.delete(`${BACKEND_URL}coupons/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(() => {
                fetchCoupons();
            })
            .catch(error => {
                console.error("Error deleting coupon:", error);
                alert("Failed to delete coupon. Please try again.");
            });
        }
    };
    
    const resetForm = () => {
        setFormData({
            code: "",
            description: "",
            discountType: "PERCENTAGE",
            discountValue: "",
            minPurchaseAmount: "",
            maxDiscountAmount: "",
            startDate: "",
            endDate: "",
            isActive: true,
            usageLimit: "",
            perUserLimit: "",
            applicableUserIds: [],
            applicableProductIds: [],
            applicableCategories: [],
            applicableOccasions: [],
            applicableRecipients: []
        });
        setEditingCoupon(null);
        setShowForm(false);
    };
    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };
    
    const isExpired = (dateString) => {
        const endDate = new Date(dateString);
        const now = new Date();
        return endDate < now;
    };

    return (
        <div className="p-6 ml-72">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <Ticket className="mr-2 text-custom-red h-5 w-5" />
                    <h1 className="text-2xl font-bold">Coupon Management</h1>
                </div>
                <button 
                    className="bg-custom-red hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? (
                        <>
                            <XCircle size={16} className="mr-2" /> Cancel
                        </>
                    ) : (
                        <>
                            <Plus size={16} className="mr-2" /> Add Coupon
                        </>
                    )}
                </button>
            </div>
            
            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-xl font-bold mb-4">
                        {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
                    </h2>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Code*
                                </label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                    pattern="[A-Z0-9]+"
                                    title="Coupon code must be uppercase letters and numbers only"
                                />
                                <p className="text-xs text-gray-500 mt-1">Uppercase letters and numbers only (e.g., SUMMER25)</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    placeholder="e.g., Summer Sale Discount"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Discount Type*
                                </label>
                                <select
                                    name="discountType"
                                    value={formData.discountType}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                >
                                    <option value="PERCENTAGE">Percentage (%)</option>
                                    <option value="FIXED">Fixed Amount (₹)</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Discount Value*
                                </label>
                                <input
                                    type="number"
                                    name="discountValue"
                                    value={formData.discountValue}
                                    onChange={handleChange}
                                    min="0"
                                    step={formData.discountType === "PERCENTAGE" ? "1" : "0.01"}
                                    max={formData.discountType === "PERCENTAGE" ? "100" : ""}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {formData.discountType === "PERCENTAGE" ? "Enter value from 0-100" : "Enter amount in ₹"}
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Minimum Purchase Amount
                                </label>
                                <input
                                    type="number"
                                    name="minPurchaseAmount"
                                    value={formData.minPurchaseAmount}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full p-2 border rounded"
                                    placeholder="Optional"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Maximum Discount Amount
                                </label>
                                <input
                                    type="number"
                                    name="maxDiscountAmount"
                                    value={formData.maxDiscountAmount}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full p-2 border rounded"
                                    placeholder="Optional (for percentage discounts)"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Start Date*
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    End Date*
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Total Usage Limit
                                </label>
                                <input
                                    type="number"
                                    name="usageLimit"
                                    value={formData.usageLimit}
                                    onChange={handleChange}
                                    min="1"
                                    className="w-full p-2 border rounded"
                                    placeholder="Optional (unlimited if blank)"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Per User Limit
                                </label>
                                <input
                                    type="number"
                                    name="perUserLimit"
                                    value={formData.perUserLimit}
                                    onChange={handleChange}
                                    min="1"
                                    className="w-full p-2 border rounded"
                                    placeholder="Optional (unlimited if blank)"
                                />
                            </div>
                            
                            <div className="md:col-span-2">
                                <div className="flex items-center mb-4">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-medium">
                                        Active
                                    </label>
                                </div>
                            </div>
                            
                            <div className="md:col-span-2">
                                <h3 className="text-lg font-medium mb-3">Target Restrictions (Optional)</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Leave fields blank to apply coupon to all users/products. Select multiple items by holding Ctrl (Windows) or Cmd (Mac).
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Applicable Users
                                </label>
                                <select
                                    name="applicableUserIds"
                                    multiple
                                    value={formData.applicableUserIds}
                                    onChange={handleMultiSelectChange}
                                    className="w-full p-2 border rounded h-32"
                                >
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.firstName} {user.lastName} ({user.email})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Leave blank to apply to all users</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Applicable Products
                                </label>
                                <select
                                    name="applicableProductIds"
                                    multiple
                                    value={formData.applicableProductIds}
                                    onChange={handleMultiSelectChange}
                                    className="w-full p-2 border rounded h-32"
                                >
                                    {products.map(product => (
                                        <option key={product.id} value={product.id}>
                                            {product.name} (₹{product.price})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Leave blank to apply to all products</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Applicable Categories
                                </label>
                                <select
                                    name="applicableCategories"
                                    multiple
                                    value={formData.applicableCategories}
                                    onChange={handleMultiSelectChange}
                                    className="w-full p-2 border rounded h-32"
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Leave blank to apply to all categories</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Applicable Occasions
                                </label>
                                <select
                                    name="applicableOccasions"
                                    multiple
                                    value={formData.applicableOccasions}
                                    onChange={handleMultiSelectChange}
                                    className="w-full p-2 border rounded h-32"
                                >
                                    {occasions.map(occasion => (
                                        <option key={occasion} value={occasion}>
                                            {occasion}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Leave blank to apply to all occasions</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Applicable Recipients
                                </label>
                                <select
                                    name="applicableRecipients"
                                    multiple
                                    value={formData.applicableRecipients}
                                    onChange={handleMultiSelectChange}
                                    className="w-full p-2 border rounded h-32"
                                >
                                    {recipients.map(recipient => (
                                        <option key={recipient} value={recipient}>
                                            {recipient}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Leave blank to apply to all recipients</p>
                            </div>
                        </div>
                        
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-custom-red hover:bg-red-700 text-white rounded-lg flex items-center"
                            >
                                <CheckCircle size={16} className="mr-2" />
                                {editingCoupon ? "Update Coupon" : "Create Coupon"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-medium">All Coupons</h2>
                </div>
                
                {isLoading ? (
                    <div className="p-6 text-center">Loading coupons...</div>
                ) : coupons.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        No coupons found. Create your first coupon to get started.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validity</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restrictions</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {coupons.map(coupon => (
                                    <tr key={coupon.id} className="hover:bg-gray-50">
                                        <td className="py-4 px-4">
                                            <div className="font-medium text-gray-900">{coupon.code}</div>
                                            <div className="text-xs text-gray-500">{coupon.description}</div>
                                        </td>
                                        <td className="py-4 px-4">
                                            {coupon.discountType === "PERCENTAGE" ? (
                                                <div>{coupon.discountValue}% off</div>
                                            ) : (
                                                <div>₹{coupon.discountValue} off</div>
                                            )}
                                            {coupon.minPurchaseAmount && (
                                                <div className="text-xs text-gray-500">
                                                    Min: ₹{coupon.minPurchaseAmount}
                                                </div>
                                            )}
                                            {coupon.maxDiscountAmount && (
                                                <div className="text-xs text-gray-500">
                                                    Max: ₹{coupon.maxDiscountAmount}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center">
                                                <Calendar size={14} className="mr-1 text-gray-500" />
                                                <span>{formatDate(coupon.startDate)}</span>
                                            </div>
                                            <div className="flex items-center text-xs text-gray-500">
                                                <span>to</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Calendar size={14} className="mr-1 text-gray-500" />
                                                <span>{formatDate(coupon.endDate)}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            {coupon.isActive ? (
                                                isExpired(coupon.endDate) ? (
                                                    <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded-full text-xs">Expired</span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                                                )
                                            ) : (
                                                <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded-full text-xs">Inactive</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div>{coupon.usageCount} used</div>
                                            {coupon.usageLimit && (
                                                <div className="text-xs text-gray-500">
                                                    Limit: {coupon.usageCount}/{coupon.usageLimit}
                                                </div>
                                            )}
                                            {coupon.perUserLimit && (
                                                <div className="text-xs text-gray-500">
                                                    {coupon.perUserLimit} per user
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-4">
                                            {(coupon.applicableUserIds?.length > 0 || 
                                              coupon.applicableProductIds?.length > 0 || 
                                              coupon.applicableCategories?.length > 0 || 
                                              coupon.applicableOccasions?.length > 0 || 
                                              coupon.applicableRecipients?.length > 0) ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {coupon.applicableUserIds?.length > 0 && (
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                            {coupon.applicableUserIds.length} Users
                                                        </span>
                                                    )}
                                                    {coupon.applicableProductIds?.length > 0 && (
                                                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                                            {coupon.applicableProductIds.length} Products
                                                        </span>
                                                    )}
                                                    {coupon.applicableCategories?.length > 0 && (
                                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                                            {coupon.applicableCategories.length} Categories
                                                        </span>
                                                    )}
                                                    {coupon.applicableOccasions?.length > 0 && (
                                                        <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-xs">
                                                            {coupon.applicableOccasions.length} Occasions
                                                        </span>
                                                    )}
                                                    {coupon.applicableRecipients?.length > 0 && (
                                                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                                                            {coupon.applicableRecipients.length} Recipients
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 text-sm">No restrictions</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEdit(coupon)}
                                                    className="p-1 text-blue-600 hover:text-blue-800"
                                                    title="Edit Coupon"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(coupon.id)}
                                                    className="p-1 text-red-600 hover:text-red-800"
                                                    title="Delete Coupon"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}