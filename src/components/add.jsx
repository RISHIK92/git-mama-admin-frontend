import { useState } from "react";
import axios from "axios";

export function Add({ name, role, onClose, fetch }) {
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleRegister = async () => {
        if (!data.name || !data.email || !data.password) {
            setMessage("All fields are required!");
            return;
        }
        let endpoint;
        try {
            switch (role) {
                case "User":
                    endpoint = "/api/register-user";
                    break;
                case "Admin":
                    endpoint = "/api/register-admin";
                    break;
                case "Creator":
                    endpoint = "/api/register-creator";
                    break;
                default:
                    console.error("Invalid role selected");
                    return;
            }
            await axios.post(`http://localhost:3000${endpoint}`, {
                name: data.name,
                email: data.email,
                password: data.password,
            });

            setMessage(`${role} registered successfully!`);
            setData({ name: "", email: "", password: "" });
            fetch();
            onClose();
        } catch (err) {
            setMessage(err.response?.data?.message || "Something went wrong!");
        }
    };

    return (
        <div className="h-auto w-96 bg-[#FFD9C4] rounded-3xl p-8 shadow-lg">
            <div className="text-center">
                <p className="text-2xl font-semibold tracking-wide">
                    <span className="text-custom-orange">{name}</span>
                    <span className="text-[#151445]"> Register</span>
                </p>
            </div>

            {message && <p className="text-sm text-center mt-2 text-red-500">{message}</p>}

            <div className="mt-6 space-y-4">
                <div>
                    <label className="block text-sm text-gray-600">Full Name</label>
                    <input type="text" name="name" placeholder="Enter full name"
                        className="mt-1 w-full rounded-xl p-3 focus:outline-custom-orange"
                        value={data.name} onChange={handleChange} />
                </div>

                <div>
                    <label className="block text-sm text-gray-600">Email</label>
                    <input type="email" name="email" placeholder="Enter email address"
                        className="mt-1 w-full rounded-xl p-3 focus:outline-custom-orange"
                        value={data.email} onChange={handleChange} />
                </div>

                <div>
                    <label className="block text-sm text-gray-600">Password</label>
                    <input type="password" name="password" placeholder="Enter password"
                        className="mt-1 w-full rounded-xl p-3 focus:outline-custom-orange"
                        value={data.password} onChange={handleChange} />
                </div>
            </div>

            <div className="flex justify-center mt-6">
                <button type="button" className="w-full py-3 rounded-xl bg-custom-orange text-white font-medium transition duration-300 hover:bg-[#ff9a66]"
                    onClick={handleRegister}>Register</button>
            </div>

            <div className="flex justify-center mt-3">
                <button className="text-gray-500 text-sm" onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}
