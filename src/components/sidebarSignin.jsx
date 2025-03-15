import axios from "axios";
// import { CustomButton } from "./CustomButton";
import { styled } from "@mui/material/styles";
import { CustomInput } from "./input";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../Url";
import { CustomButton } from "./button";

export function SidebarSignin() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSignin() {
        const email = emailRef.current?.value;
        const password = passwordRef.current?.value;
        console.log(email, password);
        if (!email || !password) {
            setError("Email and password are required!");
            return;
        }
        setLoading(true); // Set loading to true when the request starts

        try {
            const response = await axios.post(`${BACKEND_URL}signin`, {
                email,
                password
            });

            localStorage.setItem('authToken', response.data.token);
            navigate("/dashboard");

        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }
    return (
            <div className="fixed right-40 top-1/2 transform -translate-y-1/2 min-h-[24.5rem] bg-white border-r rounded-2xl w-full sm:w-2/3 md:w-1/2 lg:w-1/3 p-4 sm:p-6 shadow-lg">
                <div className="flex justify-start text-4xl ml-2 font-semibold">
                    <p>Welcome Back!</p>
                </div>

                <div className="flex justify-start items-center text-sm ml-4 font-extralight mt-3 gap-1">
                    <span>Don’t have an account?</span>
                    <a href="#" className="text-red-500 font-light underline ml-2 hover:text-red-600" onClick={() => navigate('/signup')}>
                        Register
                    </a>
                </div>
                {error && (
                    <div className="text-red-600 text-sm text-center mt-2">{error}</div>
                )}
    
                <div className="flex justify-center mt-4 mb-3 mx-3">
                    <CustomInput placeholder="Email Address" ref={emailRef} fullWidth radius="10px"/>
                </div>
                <div className="flex justify-center mt-2 mx-3">
                    <CustomInput type="password" placeholder="Password" ref={passwordRef} fullWidth radius="10px"/>
                </div>
                <div className="flex items-center mt-4 mb-8 ml-5">
                    <input
                        type="checkbox"
                        id="remember"
                        className="mr-2 w-5 h-5 border border-gray-300 rounded-md accent-[#FF3B3B]"
                    />
                    <label htmlFor="remember" className="text-xs font-extralight">Remember me</label>
        
                    <a href="#" className="ml-auto pr-6 text-xs font-extralight text-[#FF3B3B] underline hover:text-red-600">
                        Forgot Password?
                    </a>
                </div>
        
                {/* Login Button */}
                <div className="flex justify-center mt-12 mx-5" onClick={handleSignin}>
                    {!loading ? (
                        <CustomButton
                            bg="#FF3B3B"
                            color="white"
                            padding="12px 24px"
                            font="12px"
                            radius="10px"
                            hover="#C20000"
                            border="#C20000"
                            className="w-full"
                        >
                            Login
                        </CustomButton>
                    ) : (
                        <div className="flex justify-center mt-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#C20000] border-opacity-50"></div>
                        </div>
                    )}
                </div>
            </div>
        );
}