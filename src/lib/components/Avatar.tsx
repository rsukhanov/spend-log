"use client"

import { useUserStore } from "@lib/userStore";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function AvatarBox() {
  const { name, photo_url } = useUserStore();

  // return (
  //   <div className="flex flex-col items-center">
  //     {photo_url ? (
  //       <img
  //         src={photo_url}
  //         alt={name || "User"}
  //         className="w-10 h-10 rounded-full mb-1 object-cover"
  //       />
  //     ) : (
  //       <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mb-1">
  //         <span className="text-white font-semibold text-sm">
  //           {name ? name?.charAt(0).toUpperCase() : 'U'}
  //         </span>
  //       </div>
  //   )}
  //   <span className="text-xs text-gray-600">{name || "User Name"}</span>
  // </div>)

  return (
    <Avatar>
      <AvatarImage src={photo_url}/>
      <AvatarFallback>{name ? name?.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
    </Avatar>
  )
}