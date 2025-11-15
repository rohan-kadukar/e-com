// components/WishlistHeart.tsx
"use client";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import apiClient from "@/lib/api";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import React, { useMemo } from "react";

export default function WishlistHeart({ product }: { product: any }) {
  const { data: session } = useSession();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlistStore();

  // Normalize ids to string for comparison and store usage
  const productId = useMemo(() => String(product?.id), [product?.id]);

  const isInWishlist = wishlist.some((w) => w.id === productId);

  const getUserId = async (): Promise<string | null> => {
    try {
      const email = session?.user?.email;
      if (!email) return null;
      const res = await apiClient.get(`/api/users/email/${email}`, { cache: "no-store" });
      const user = await res.json();
      return user?.id ? String(user.id) : null;
    } catch {
      return null;
    }
  };

  const handleAdd = async () => {
    const userId = await getUserId();
    if (!userId) {
      toast.error("Please login to use wishlist");
      return;
    }

    // optimistic update
    addToWishlist({
      id: productId,
      title: product.title,
      price: product.price,
      image: product.mainImage,
      slug: product.slug,
      stockAvailabillity: product.inStock,
    });

    const res = await apiClient.post(
      `/api/wishlist`,
      { userId, productId }, // both strings
      { cache: "no-store" }
    );

    if (!res.ok) {
      // rollback on failure
      removeFromWishlist(productId);
      const data = await res.json().catch(() => ({}));
      toast.error(data?.message || "Failed to add");
      return;
    }

    toast.success("Added to wishlist");
  };

  const handleRemove = async () => {
    const userId = await getUserId();
    if (!userId) {
      toast.error("Please login to use wishlist");
      return;
    }

    // optimistic update
    removeFromWishlist(productId);

    const res = await apiClient.delete(`/api/wishlist/${userId}/${productId}`, { cache: "no-store" });

    if (!res.ok) {
      // rollback on failure
      addToWishlist({ id: productId });
      const data = await res.json().catch(() => ({}));
      toast.error(data?.message || "Failed to remove");
      return;
    }

    toast.success("Removed from wishlist");
  };
  
  return (
    <span className="text-error flex items-center gap-x-1 cursor-pointer">
      {isInWishlist ? <FaHeart onClick={handleRemove} /> : <FaRegHeart onClick={handleAdd} />}
    </span>
  );
}
