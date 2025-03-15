export function SideBarItem({ icon, text, isActive, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center px-4 py-3 mb-1 rounded-md cursor-pointer transition-colors ${
                isActive 
                ? "bg-custom-red text-white" 
                : "text-gray-700 hover:bg-red-100"
            }`}
        >
            <span className="mr-3">{icon}</span>
            <span>{text}</span>
        </div>
    );
}