"use client"

import { useUserStore } from "@lib/userStore";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function AvatarBox() {
  const { name, photo_url, preferred_currency } = useUserStore();

  return (
    <Avatar>
      <AvatarImage src={photo_url}/>
      <AvatarFallback>{name ? name?.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
    </Avatar>
  )
}