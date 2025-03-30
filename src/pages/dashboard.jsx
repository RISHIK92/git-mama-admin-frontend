import { useState, useEffect } from "react";
import axios from "axios";
import { Box } from "../components/box";
import { Search } from "../components/search";
import { Sidebar } from "../components/sidebar";
import { SearchIcon } from "../icons/search";
import { Notification } from "../icons/notifications";
import { Package, ShoppingCart, CreditCard, Home, Users } from "lucide-react";
import { BACKEND_URL } from "../Url";
import { UserPage } from "./user";
import { ProductPage } from "./product";
import { CategoryPage } from "./category";
import { CustomizeHomePage } from "./customized";

export function Dashboard() {
    const [activeItem, setActiveItem] = useState("Dashboard");
    const [totalProducts, setTotalProducts] = useState(541);
    const [totalUsers, setTotalUsers] = useState("2.3K");
    const [totalSales, setTotalSales] = useState("₹30L");
    const [pendingOrders, setPendingOrders] = useState(21);
    const [adminName, setAdminName] = useState('');

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
    }, []);

    const renderContent = () => {
        switch (activeItem) {
            case "Users":
                return <UserPage />;
            case "Products":
                return <ProductPage />;
            case "Orders":
                return <div className="p-6 ml-72">Orders Content</div>;
            case "Coupons":
                return <div className="p-6 ml-72">Coupons Content</div>;
            case "Categories":
                return <CategoryPage />;
            case "Customize":
                return <CustomizeHomePage />;
            default:
                return (
                    <div className="p-6 ml-72">
                        <div className="flex mt-4 mb-6">
                            <Home className="mt-1.5 mr-2 text-custom-red h-5 w-5"/>
                            <h1 className="text-2xl font-bold">Welcome back {adminName}</h1>
                        </div>
                        <div>
                            <h2 className="text-lg font-medium mb-4">Product Statistics</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                                    <h3 className="text-xl font-bold text-center mb-8">line plot</h3>
                                    <div className="h-32 flex items-center justify-center">
                                        {/* Line chart would go here */}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-4 text-center">Total vs orders delivered graph</p>
                                </div>
                                <div className="border rounded-lg p-4">
                                    <h3 className="text-xl font-bold text-center mb-8">count plot</h3>
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

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
            <div className="flex-1">
                {renderContent()}
            </div>
        </div>
    );
}

function StatCard({ icon, text, heading }) {
    return (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="text-4xl font-bold text-red-500 mb-2">{text}</div>
            <div className="flex items-center text-gray-600 text-sm">
                <span className="mr-2">{icon}</span>
                <span>{heading}</span>
            </div>
        </div>
    );
}