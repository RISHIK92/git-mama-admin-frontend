import React from "react";
import { SidebarSignin } from "../components/sidebarSignin";

export function Signin() {
  return (
    <div className="h-screen bg-[#F8F8F8]">
      <div className="absolute left-52 top-[7%] sm:w-2/3 md:w-1/2 lg:w-1/3 sm:p-6">
        <div>
          <img
            src="https://res.cloudinary.com/df622sxkk/image/upload/v1747778280/Group_17_hn00uo.png"
            className="ml-10 h-20 w-56"
          />
        </div>
        <p className="text-4xl font-medium mt-6 ml-6 font-jakarta">
          <span className="text-black">Thoughtful</span>
          <span className="text-[#FF3B3B]"> Gifts</span>,
        </p>
        <p className="text-4xl font-medium font-jakarta">
          <span className="text-black">Timeless</span>
          <span className="text-[#FF3B3B]"> Memories</span>!
        </p>
      </div>
      <div>
        <img
          src="https://res.cloudinary.com/dvweoxpun/image/upload/v1740155218/Sparkles_mi0bxr.png"
          className="absolute bottom-0 w-[38rem] object-contain"
        />
      </div>
      <div>
        <SidebarSignin />
      </div>
    </div>
  );
}
