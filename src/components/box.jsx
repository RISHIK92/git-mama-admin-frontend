import { Admin } from "../icons/admin";
import { Users } from "../icons/users";

export function Box({ Icon,color,text,heading,textColor }) {
    return (
        <div className={`h-40 w-64 ${color} ${textColor} rounded-xl`}>
            <div className="mt-4 ml-3">
                <Icon className="w-10 h-10" />
            </div>
            <div className="mt-4 ml-3 text-md">
                <p>{heading}</p>
            </div>
            <div className="mt-4 text-right mr-2 font-bold text-3xl">
                <p>{text}</p>
            </div>
        </div>
    )
}