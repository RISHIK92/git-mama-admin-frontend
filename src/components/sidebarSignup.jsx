import axios from "axios";
import { CustomButton } from "./button";
import { CustomInput } from "./input";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../Url";

export function SidebarSignup({ setFilter }) {
    const emailRef = useRef();
    const passwordRef = useRef();
    const firstNameRef = useRef();
    const lastNameRef = useRef();
    const numberRef = useRef();
    const cityRef = useRef();
    const confirmPasswordRef = useRef();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSignup() {
        const email = emailRef.current?.value;
        const password = passwordRef.current?.value;
        const firstName = firstNameRef.current?.value;
        const lastName = lastNameRef.current?.value;
        const phone = numberRef.current?.value;
        const city = cityRef.current?.value;

        console.log(email, password);
        
        if (!email || !password || !firstName || !lastName || !phone || !city) {
            setError("All fields are required!");
            setTimeout(() => {
                setError("")
            }, 2500);
            return;
        }
        const confirmPassword = confirmPasswordRef.current?.value;
        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            setTimeout(() => setError(""), 2500);
            return;
        }


        setLoading(true); // Set loading to true when request starts

        try {
            const response = await axios.post(`${BACKEND_URL}register`, {
                email,
                password,
                firstName,
                lastName,
                phone
            });

            if (![200, 201].includes(response.status)) {
                setError(response.data?.message || "Registration failed.");
                setTimeout(() => setError(""), 2500);
                return;
            }            
            navigate("/signin");

        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed right-40 top-1/2 transform -translate-y-1/2 min-h-[32.5rem] bg-white border-r rounded-2xl w-full sm:w-2/3 md:w-1/2 lg:w-1/3 p-4 sm:p-6 shadow-lg">
            <div className="flex justify-start text-4xl ml-2 font-semibold mt-4">
                <p>Register</p>
            </div>

            <div className="flex justify-start items-center text-sm ml-4 font-extralight mt-3 gap-1">
                <span>Already have an account?</span>
                <a href="#" className="text-red-500 font-light underline ml-1 hover:text-red-600"
                    onClick={() => navigate('/signin')}>
                        Login
                    </a>
            </div>

            <div className="flex justify-center gap-4 mt-4 mb-4 mx-5">
                <CustomInput placeholder="First Name" ref={firstNameRef} radius="10px"/>
                <CustomInput placeholder="Last Name" ref={lastNameRef} radius="10px"/>
            </div>

            <div className="flex justify-center mb-4 mx-5">
                <CustomInput type="text" placeholder="Email" ref={emailRef} radius="10px" fullWidth/>
            </div>

            <div className="flex justify-center gap-4 mb-4 mx-5">
                <CustomInput placeholder="Phone Number" ref={numberRef} type="number" radius="10px"/>
                <CustomInput placeholder="City" ref={cityRef} type="text" radius="10px"/>
            </div>

            <div className="flex justify-center gap-4 mt-2 mb-6 mx-5">
                <CustomInput placeholder="Password" ref={passwordRef} type="password" radius="10px"/>
                <CustomInput placeholder="Confirm Password" ref={confirmPasswordRef} type="password" radius="10px"/>
            </div>

            {error && (
                <div className="text-red-600 text-sm text-center mt-2">{error}</div>
            )}

            <div className="flex justify-center mt-4 mx-5">
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
                        onClick={handleSignup}
                    >
                        Register Now
                    </CustomButton>
                ) : (
                    <div className="flex justify-center mt-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#C20000] border-opacity-50"></div>
                    </div>
                )}
            </div>

            <p className="mx-6 mt-6 font-extralight text-xs">By clicking on Register Now, you are agreeing to our</p>

            <div className="flex text-sm font-extralight">
                <a href="#" className="text-red-500 underline ml-6 hover:text-red-600" onClick={() => navigate('/terms')}>
                    Terms and Conditions
                </a>
                <p className="pt-0.5 pl-1">&</p>
                <a href="#" className="text-red-500 pl-1 underline hover:text-red-600" onClick={() => navigate('/privacy')}>
                    Privacy Policy
                </a>
            </div>
        </div>
    );
}
