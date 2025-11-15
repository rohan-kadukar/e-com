// *********************
// Role of the component: Buy Now button that adds product to the cart and redirects to the checkout page
// Name of the component: BuyNowSingleProductBtn.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <BuyNowSingleProductBtn product={product} quantityCount={quantityCount} />
// Input parameters: SingleProductBtnProps interface
// Output: Button with buy now functionality
// *********************

"use client";
import { useProductStore } from "@/app/_zustand/store";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const BuyNowSingleProductBtn = ({
  product,
  quantityCount,
}: SingleProductBtnProps) => {
  const router = useRouter();
  const { addToCart, calculateTotals } = useProductStore();
  const { data: session, status }: any = useSession(); // add status
  const [employeeEmail, setEmployeeEmail] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return; // wait until session resolves
    const email = session?.user?.email ?? null; // safe access
    if (!email) {
      toast.error("Email Id not found, please login");
      setEmployeeEmail(null);
      return;
    }
    setEmployeeEmail(email);
  }, [status, session?.user?.email]);

  const handleAddToCart = () => {
    addToCart({
      id: product?.id.toString(),
      title: product?.title,
      price: product?.price,
      image: product?.mainImage,
      amount: quantityCount,
    });
    calculateTotals();
    toast.success("Product added to the cart");
    router.push("/checkout");
  };

  const isDisabled = status === "loading" || !employeeEmail;

  return (
    <button
      onClick={handleAddToCart}
      className={`btn w-[200px] text-lg border border-blue-500 hover:border-blue-500 border-1 font-normal ${
        isDisabled
          ? "bg-blue-300 text-white cursor-not-allowed"
          : "bg-blue-500 text-white hover:bg-white hover:scale-110 hover:text-blue-500"
      } transition-all uppercase ease-in max-[500px]:w-full`}
      disabled={isDisabled}
      aria-disabled={isDisabled}
    >
      Buy Now
    </button>
  );
};

export default BuyNowSingleProductBtn;
