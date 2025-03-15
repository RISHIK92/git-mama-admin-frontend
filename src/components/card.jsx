import { Delete } from "../icons/delete";

export function Card({ profileImage, name, email, number, userid, date, onClick }) {
    return (
        <div className="grid grid-cols-7 gap-4 flex-none h-24 w-full bg-custom-light rounded-md items-center text-black">
            <div className="col-span-1 flex justify-center">
                <img src={profileImage} alt="Profile" className="h-16 w-16 rounded-md object-cover border-2 border-white" />
            </div>

            <div className="col-span-1 flex items-center text-black">
                <p className="text-sm font-normal">{name}</p>
            </div>

            <div className="col-span-1">
                <p className="text-sm text-black">{email}</p>
            </div>

            <div className="col-span-1">
                <p className="text-sm text-black">{number}</p>
            </div>

            <div className="col-span-1 flex items-center">
                <p className="text-sm text-black">{userid}</p>
            </div>

            <div className="col-span-1 ml-12 flex items-center">
                <p className="text-xs text-gray-400">{date}</p>
            </div>

            <button className="col-span-1 ml-28 flex items-end" onClick={() => onClick(userid)}>
                <Delete />
            </button>
        </div>
    );
}
