import { useState, useEffect } from "react";
import axios from "axios";
import { Box } from "../components/box";
import { Search } from "../components/search";
import { Sidebar } from "../components/sidebar";
import { SearchIcon } from "../icons/search";
import { Notification } from "../icons/notifications";
import { Package, ShoppingCart, CreditCard, Home, Users, Menu } from "lucide-react";
import { BACKEND_URL } from "../Url";
import { UserPage } from "./user";
import { ProductPage } from "./product";
import { CategoryPage } from "./category";
import { CustomizeHomePage } from "./customized";
import { OrderPage } from "./order";
import { FlashSale } from "../components/flashSale";
import { CouponPage } from "./couponPage";

export function Dashboard() {
    const [activeItem, setActiveItem] = useState("Dashboard");
    const [totalProducts, setTotalProducts] = useState(541);
    const [totalUsers, setTotalUsers] = useState("2.3K");
    const [totalSales, setTotalSales] = useState("₹30L");
    const [pendingOrders, setPendingOrders] = useState(21);
    const [adminName, setAdminName] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        // Fetch dashboard statistics
        axios.get(`${BACKEND_URL}dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            setAdminName(response.data.admin.firstName || "Admin");
            // Uncomment and adjust based on your actual API response
            setTotalProducts(response.data.products);
            setTotalUsers(response.data.users);
            // setTotalSales(response.data.salesTotal);
            // setPendingOrders(response.data.pendingOrderCount);
        })
        .catch(() => {
            console.error("Failed to fetch dashboard statistics.");
        });

        // Handle responsive sidebar
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        // Set initial state
        handleResize();

        // Add event listener
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const renderContent = () => {
        switch (activeItem) {
            case "Users":
                return <UserPage />;
            case "Products":
                return <ProductPage />;
            case "Orders":
                return <OrderPage />;
            case "Coupons":
                return <CouponPage />;
            case "Categories":
                return <CategoryPage />;
            case "Flash Sale":
                return <FlashSale />;
            case "Customize":
                return <CustomizeHomePage />;
            default:
                return (
                    <div className="p-4 md:p-6">
                        <div className="flex mt-4 mb-6">
                            <Home className="mt-1.5 mr-2 text-custom-red h-5 w-5"/>
                            <h1 className="text-xl md:text-2xl font-bold">Welcome back {adminName}</h1>
                        </div>
                        <div>
                            <h2 className="text-lg font-medium mb-4">Product Statistics</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                <StatCard icon={<Package size={20} />} text={totalProducts} heading="Total Products" />
                                <StatCard icon={<Users size={20} />} text={totalUsers} heading="Total Users" />
                                <StatCard icon={<CreditCard size={20} />} text={totalSales} heading="Total Sales" />
                                <StatCard icon={<ShoppingCart size={20} />} text={pendingOrders} heading="Pending Orders" />
                            </div>
                        </div>
                        
                        <div>
                            <h2 className="text-lg font-medium mb-4">Graphs</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="border rounded-lg p-4">
                                    <h3 className="text-lg md:text-xl font-bold text-center mb-4 md:mb-8">line plot</h3>
                                    <div className="h-32 flex items-center justify-center">
                                        {/* Line chart would go here */}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-4 text-center">Total vs orders delivered graph</p>
                                </div>
                                <div className="border rounded-lg p-4">
                                    <h3 className="text-lg md:text-xl font-bold text-center mb-4 md:mb-8">count plot</h3>
                                    <div className="h-32 flex items-center justify-center">
                                        {/* Count chart would go here */}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-4 text-center">Monthly revenue in graph</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // New function to close sidebar when an item is clicked (for mobile)
    const handleItemClick = (item) => {
        setActiveItem(item);
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <div className="fixed top-4 left-4 z-50 md:hidden">
                <button 
                    onClick={toggleSidebar} 
                    className="p-2 rounded-md bg-white shadow-md text-gray-600 hover:text-gray-900"
                    aria-label="Toggle menu"
                >
                    <Menu size={24} />
                </button>
            </div>

            <div className={`${sidebarOpen ? 'translate-x-0' : 'hidden'} 
                fixed md:relative z-40 transition-transform duration-300 ease-in-out md:translate-x-0`}
            >
                <Sidebar activeItem={activeItem} setActiveItem={handleItemClick} />
            </div>

            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            <div className="flex-1 overflow-x-hidden">
                <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:ml-72' : 'ml-0'}`}>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, text, heading }) {
    return (
        <div className="bg-white p-4 md:p-6 rounded-lg border shadow-sm">
            <div className="text-3xl md:text-4xl font-bold text-red-500 mb-2">{text}</div>
            <div className="flex items-center text-gray-600 text-sm">
                <span className="mr-2">{icon}</span>
                <span>{heading}</span>
            </div>
        </div>
    );
}