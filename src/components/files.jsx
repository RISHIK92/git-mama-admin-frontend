import React, { useState } from "react";
import axios from "axios";

export function ImageUploader() {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleFileSelect = async (event) => {
        const files = event.target.files;

        if (files.length > 0) {
            setUploading(true);
            setError("");
            setSuccess("");

            const formData = new FormData();
            Array.from(files).forEach((file) => formData.append("images", file));

            try {
                const response = await axios.post("/api/upload", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
                setSuccess("Files uploaded successfully!");
            } catch (err) {
                setError("Failed to upload files. Please try again.");
            } finally {
                setUploading(false);
            }
        }
    };

    const triggerFileInput = () => {
        document.getElementById("image-input").click();
    };

    return (
        <div className="flex flex-col items-center bg-gray-100">
            <div onClick={triggerFileInput} className="cursor-pointer p-4 bg-blue-500 text-white rounded-lg text-center w-64 hover:bg-blue-600 transition duration-200">
                {uploading ? "Uploading..." : "Click to Upload Images"}
            </div>
            <input type="file" id="image-input" accept="image/*" className="hidden" onChange={handleFileSelect} />
            {success && <p className="mt-4 text-sm text-green-600">{success}</p>}
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            <p className="mt-2 text-sm text-gray-600">
                Only image files are allowed. You can select multiple images.
            </p>
        </div>
    );
}
