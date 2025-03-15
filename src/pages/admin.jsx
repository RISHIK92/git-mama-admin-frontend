import { useState, useEffect } from "react";
import axios from "axios";
import { CustomButton } from "../components/button";
import { Card } from "../components/card";
import { Add } from "../components/add";

export function AdminPage() {
    const [showAddAdmin, setShowAddAdmin] = useState(false);
    const [admins, setAdmins] = useState([]);

    const token = localStorage.getItem("authToken");

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/admins", {
                headers: {
                    token: token,
                },
            });
            setAdmins(response.data);
        } catch (error) {
            console.error("Error fetching admins:", error);
        }
    };

    const handleDelete = async (adminid) => {
        try {
            await axios.delete(`http://localhost:3000/api/admin-delete/${adminid}`, {
                headers: {
                    token: token
                }
            })
            fetchAdmins();
        } catch(error) {
            console.log("Error Deleting Admin:", error)
        }
    }

    return (
        <div>
            <div className="bg-custom-light">
                <div className="absolute left-1 right-2 top-2 bottom-4 bg-[#F8F8F8] rounded-2xl h-[100vh] shadow-md ml-64">
                    <div className="text-2xl font-semibold mt-12">
                        <div className="flex justify-between">
                            <p className="ml-6">
                                <span className="text-[#151445]">Admin List</span>
                            </p>
                            <CustomButton variant="primary" text="Add Admin" size="custom" onClick={() => setShowAddAdmin(true)} />
                        </div>
                        <hr className="mt-4 border m-8"></hr>
                    </div>

                    {showAddAdmin ? (
                        <div className="flex justify-center items-center mt-6">
                            <Add name="Admin" role="Admin" onClose={() => setShowAddAdmin(false)} fetch={() => fetchAdmins()}/>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 ml-6 mr-6 max-h-[80vh] overflow-y-auto">
                            {admins.map((admin, index) => (
                                <Card key={index} profileImage="src/icons/OIP.jpeg" name={admin.name} email={admin.email} userid={admin.id} date={admin.createdAt ? new Date(admin.createdAt).toISOString().split('T')[0] : 'N/A'} onClick={() => handleDelete(admin.id)}/>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
