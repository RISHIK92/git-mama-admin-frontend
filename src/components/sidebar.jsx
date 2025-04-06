import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../Url";
import { SearchIcon } from "../icons/search";
import { Search } from "../components/search";
import { SideBarItem } from "./sidebarItem";
import { Logout } from "../icons/logout";

import { Home, Pencil } from "lucide-react";
import { Users } from "lucide-react";
import { Package } from "lucide-react";
import { ShoppingCart } from "lucide-react";
import { Tag } from "lucide-react";
import { Folder } from "lucide-react";
import { User } from "lucide-react";

export function Sidebar({ activeItem, setActiveItem }) {
    const [adminName, setAdminName] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        
        axios.get(`${BACKEND_URL}dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            setAdminName(response.data.admin.firstName || "Admin");
        })
        .catch(() => {
            console.error("Failed to fetch admin name.");
            setAdminName("Admin");
        })
        .finally(() => {
            setLoading(false);
        });
    }, []);
    
    if (loading) {
        return (
            <div className="h-screen w-72 flex items-center justify-center bg-white border-r">
                <p className="text-gray-600">Loading...</p>
            </div>
        );
    }
    
    return (
        <div className="h-screen bg-gradient-to-b from-white to-red-100 border-r w-72 fixed left-0 top-0">
            <div className="text-md pt-4">
                <div className="flex justify-center items-center h-16">
                <div className="mt-6 h-20 w-40">
                    <img src="https://res.cloudinary.com/dvweoxpun/image/upload/v1740154234/photomama1_chtuu9.png" alt="Logo"/>
                </div>
                </div>
                <div className="relative mt-4 mx-4 mb-4">
                    <Search type="text" placeholder="Search..." image={<SearchIcon className="w-4 h-4 text-gray-400" />} />
                </div>
            </div>
            
            <div className="mt-8 mx-4">
                <SideBarItem 
                    icon={<Home size={20} />} 
                    text="Dashboard" 
                    isActive={activeItem === "Dashboard"} 
                    onClick={() => setActiveItem("Dashboard")} 
                />
                <SideBarItem 
                    icon={<Users size={20} />} 
                    text="Users" 
                    isActive={activeItem === "Users"} 
                    onClick={() => setActiveItem("Users")} 
                />
                <SideBarItem 
                    icon={<Package size={20} />} 
                    text="Products" 
                    isActive={activeItem === "Products"} 
                    onClick={() => setActiveItem("Products")} 
                />
                <SideBarItem 
                    icon={<ShoppingCart size={20} />} 
                    text="Orders" 
                    isActive={activeItem === "Orders"} 
                    onClick={() => setActiveItem("Orders")} 
                />
                <SideBarItem 
                    icon={<Tag size={20} />} 
                    text="Coupons" 
                    isActive={activeItem === "Coupons"} 
                    onClick={() => setActiveItem("Coupons")} 
                />
                <SideBarItem 
                    icon={<Tag size={20} />} 
                    text="Flash Sale" 
                    isActive={activeItem === "Flash Sale"} 
                    onClick={() => setActiveItem("Flash Sale")} 
                />
                <SideBarItem 
                    icon={<Folder size={20} />} 
                    text="Categories" 
                    isActive={activeItem === "Categories"} 
                    onClick={() => setActiveItem("Categories")} 
                />
                <SideBarItem 
                    icon={<Pencil size={20} />}
                    text="Customize"
                    isActive={activeItem === "Customize"}
                    onClick={() => setActiveItem("Customize")}
                />
            </div>
            
            <div className="absolute bottom-20 w-full px-6">
                <button className="flex items-center justify-between w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md">
                    <span>₹ INR - Rupees</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6"/>
                    </svg>
                </button>
            </div>
            
            <div className="absolute bottom-4 left-4 w-full px-4 border-t border-gray-200 pt-4 flex items-center">
                <div className="bg-gray-300 rounded-full p-2 mr-3 flex items-center justify-center">
                    <User size={24} className="text-gray-700" />
                </div>
                <div>
                    <p className="font-medium">{adminName}</p>
                    <p className="text-sm text-red-500">Admin</p>
                </div>
            </div>
        </div>
    );
}