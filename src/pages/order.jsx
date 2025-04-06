import { useState, useEffect } from "react";
import axios from "axios";
import { Box } from "../components/box";
import { Search } from "../components/search";
import { MoreVertical, ChevronLeft, ChevronRight, CheckCircle, Clock, X, Truck, Package, Menu } from "lucide-react";
import { BACKEND_URL } from "../Url";

export function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const statusIcons = {
    "INITIATED": <Clock className="text-yellow-500" size={18} />,
    "PAID": <CheckCircle className="text-green-500" size={18} />,
    "FAILED": <X className="text-red-500" size={18} />,
    "CANCELLED": <X className="text-red-500" size={18} />
  };

  const deliveryIcons = {
    "Ordered": <Package className="text-blue-500" size={18} />,
    "Shipped": <Truck className="text-purple-500" size={18} />,
    "Delivered": <CheckCircle className="text-green-500" size={18} />,
    "Cancelled": <X className="text-red-500" size={18} />
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${BACKEND_URL}orders?page=${currentPage}&status=${filterStatus}&search=${searchTerm}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOrders(response.data.orders);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch orders");
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${BACKEND_URL}orders/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOrderDetails(response.data);
      setShowModal(true);
    } catch (err) {
      console.error("Failed to fetch order details", err);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(
        `${BACKEND_URL}orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchOrders();
      if (selectedOrder === orderId) {
        fetchOrderDetails(orderId);
      }
    } catch (err) {
      console.error("Failed to update order status", err);
    }
  };

  const updateDeliveryStatus = async (orderId, delivery) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(
        `${BACKEND_URL}orders/${orderId}/delivery`,
        { delivery },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchOrders();
      if (selectedOrder === orderId) {
        fetchOrderDetails(orderId);
      }
    } catch (err) {
      console.error("Failed to update delivery status", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filterStatus, searchTerm]);

  useEffect(() => {
    if (selectedOrder) {
      fetchOrderDetails(selectedOrder);
    }
  }, [selectedOrder]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => {
      setSelectedOrder(null);
      setOrderDetails(null);
    }, 300);
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Order Management</h1>
      
      <div className="flex flex-col md:flex-row justify-between mb-4 md:mb-6 gap-3">
        <div className="w-full md:w-64">
          <Search placeholder="Search order ID or user..." onSearch={handleSearch} />
        </div>
        
        <div className="flex space-x-2">
          <select 
            className="border rounded p-2 w-full md:w-auto"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="ALL">All Orders</option>
            <option value="INITIATED">Initiated</option>
            <option value="PAID">Paid</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : (
        <div className="w-full overflow-x-auto">
          <div className="bg-white shadow rounded-lg min-w-full">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Delivery</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No orders found</td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr 
                        key={order.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedOrder(order.id)}
                      >
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{formatDate(order.createdAt)}</td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.user.firstName} {order.user.lastName}</td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(order.amount)}</td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {statusIcons[order.status]}
                            <span className="ml-2 text-sm text-gray-500">{order.status}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="flex items-center">
                            {deliveryIcons[order.delivery]}
                            <span className="ml-2 text-sm text-gray-500">{order.delivery}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            className="text-gray-400 hover:text-gray-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order.id);
                            }}
                          >
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="px-4 md:px-6 py-4 flex flex-col md:flex-row items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-500 mb-3 md:mb-0">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  className="p-2 rounded border disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  className="p-2 rounded border disabled:opacity-50"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showModal && orderDetails && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeModal}
          ></div>
          <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${showModal ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
            <div 
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">Order #{orderDetails.id}</h2>
                <button 
                  className="text-gray-400 hover:text-gray-700"
                  onClick={closeModal}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-6">
                      <h3 className="font-medium mb-3 text-gray-700">Order Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-500">Order Date:</span>
                          <span>{formatDate(orderDetails.createdAt)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-500">Customer:</span>
                          <span>{orderDetails.user.firstName} {orderDetails.user.lastName}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-500">Email:</span>
                          <span className="text-sm truncate">{orderDetails.user.email}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-500">Phone:</span>
                          <span>{orderDetails.user.phone || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-500">Razorpay ID:</span>
                          <span className="text-xs truncate">{orderDetails.razorpayOrderId}</span>
                        </div>
                        {orderDetails.razorpayPaymentId && (
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-500">Payment ID:</span>
                            <span className="text-xs truncate">{orderDetails.razorpayPaymentId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  
                    <div className="mb-6">
                      <h3 className="font-medium mb-3 text-gray-700">Shipping Address</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {orderDetails.shippingAddress ? (
                          <div className="text-sm">
                            <p className="mb-1">{orderDetails.shippingAddress.name}</p>
                            <p className="mb-1">{orderDetails.shippingAddress.line1}</p>
                            {orderDetails.shippingAddress.line2 && <p className="mb-1">{orderDetails.shippingAddress.line2}</p>}
                            <p className="mb-1">{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.postalCode}</p>
                            <p className="mb-1">{orderDetails.shippingAddress.country}</p>
                            <p>{orderDetails.shippingAddress.phone}</p>
                          </div>
                        ) : (
                          <p className="text-gray-500">No shipping address provided</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="mb-6">
                      <h3 className="font-medium mb-3 text-gray-700">Order Status</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex space-x-2 mb-4">
                          <select 
                            className="border rounded p-2 flex-grow"
                            value={orderDetails.status}
                            onChange={(e) => updateOrderStatus(orderDetails.id, e.target.value)}
                          >
                            <option value="INITIATED">Initiated</option>
                            <option value="PAID">Paid</option>
                            <option value="FAILED">Failed</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </div>
                        
                        <h4 className="font-medium mb-2 text-gray-600">Delivery Status</h4>
                        <div className="flex space-x-2">
                          <select 
                            className="border rounded p-2 flex-grow"
                            value={orderDetails.delivery}
                            onChange={(e) => updateDeliveryStatus(orderDetails.id, e.target.value)}
                          >
                            <option value="Ordered">Ordered</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="font-medium mb-3 text-gray-700">Payment Summary</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-500">Subtotal:</span>
                          <span>{formatCurrency(orderDetails.amount - (orderDetails.useWallet ? orderDetails.walletAmount : 0))}</span>
                        </div>
                        {orderDetails.useWallet && orderDetails.walletAmount > 0 && (
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-500">Wallet Amount:</span>
                            <span>-{formatCurrency(orderDetails.walletAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>{formatCurrency(orderDetails.amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-medium mb-3 text-gray-700">Order Items</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {orderDetails.orderItems.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-2 text-sm">{item.product.name}</td>
                              <td className="px-4 py-2 text-sm">{item.quantity}</td>
                              <td className="px-4 py-2 text-sm text-right">{formatCurrency(item.price)}</td>
                              <td className="px-4 py-2 text-sm text-right">{formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                
                {orderDetails.notes && (
                  <div>
                    <h3 className="font-medium mb-2 text-gray-700">Order Notes</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">{orderDetails.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}