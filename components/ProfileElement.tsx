// *********************
// Role of the component: Cart icon and quantity that will be located in the header
// Name of the component: CartElement.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <CartElement />
// Input parameters: no input parameters
// Output: Cart icon and quantity
// *********************

"use client";
import Link from "next/link";
import React from "react";
import { FaCartShopping } from "react-icons/fa6";
import { useProductStore } from "@/app/_zustand/store";
import Image from "next/image";
import toast from "react-hot-toast";
import { signOut, useSession } from "next-auth/react";

const CartElement = () => {
  const handleLogout = () => {
    setTimeout(() => signOut(), 1000);
    toast.success("Logout successful!");
  };
  const { allQuantity } = useProductStore();
  return (
    <div className="relative">
      {/* <span className="block w-6 h-6 bg-blue-600 text-white rounded-full flex justify-center items-center absolute top-[-17px] right-[-22px]">
                { allQuantity }
              </span> */}
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="w-10">
          <Image
            src="/randomuser.jpg"
            alt="random profile photo"
            width={30}
            height={30}
            className="w-full h-full rounded-full"
          />
        </div>
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li>
            <Link href="/profile">Profile</Link>
          </li>
          <li onClick={handleLogout}>
            <Link href="#">Logout</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CartElement;
