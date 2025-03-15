export const Search = ({ onClick, type = "text", placeholder = "Search...", image }) => {
    return (
        <div className="relative flex items-center">
            <input 
                type={type} 
                placeholder={placeholder} 
                className="bg-white px-10 py-2 font-extralight text-sm border border-gray-400 rounded-lg w-full focus:outline-none"
                onClick={onClick} 
            />
            {image && <span className="absolute left-3 flex items-center">{image}</span>}
        </div>
    );
};
