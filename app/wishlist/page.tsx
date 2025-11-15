"use client";

import { ProductItem, SectionTitle } from "@/components";
import { Loader } from "@/components/Loader";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import apiClient from "@/lib/api";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";

type Product = {
  id: string;
  title: string;
  price: number;
  mainImage?: string;
  slug?: string;
  inStock?: number;
};

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const { wishQuantity, setWishlist } = useWishlistStore();

  // Local state for products; starts empty so SSR and first client paint match
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false); // marks client hydration complete
  const [products, setProducts] = useState<Product[]>([]);

  const userEmail = session?.user?.email ?? null;

  // Avoid showing dynamic values until mounted to prevent text mismatch
  useEffect(() => {
    setHydrated(true);
  }, []);

  const fetchUserId = async (): Promise<string | null> => {
    if (!userEmail) return null;
    const res = await apiClient.get(`/api/users/email/${userEmail}`, { cache: "no-store" });
    const user = await res.json();
    return user?.id ? String(user.id) : null;
  };

  const fetchWishlistRows = async (userId: string) => {
    const res = await apiClient.get(`/api/wishlist/${userId}`, { cache: "no-store" });
    const rows = await res.json(); // [{ id, userId, productId }]
    // Populate the store strictly with product ids as strings
    setWishlist(rows.map((r: any) => ({ id: String(r.productId) })));
    return rows as Array<{ productId: string | number }>;
  };

  const fetchProductsByIds = async (ids: string[]) => {
    const uniqueIds = Array.from(new Set(ids));
    if (uniqueIds.length === 0) {
      setProducts([]);
      return;
    }
    const calls = uniqueIds.map((pid) => apiClient.get(`/api/products/${pid}`, { cache: "no-store" }));
    const responses = await Promise.allSettled(calls);
    const jsons = await Promise.all(
      responses.map(async (r) => (r.status === "fulfilled" ? r.value.json().catch(() => null) : null))
    );
    const list = (jsons.filter(Boolean) as Product[]).filter((p) => p && p.id);
    setProducts(list);
  };

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (status === "loading") return;
      setLoading(true);
      try {
        const userId = await fetchUserId();
        if (!userId) {
          setProducts([]);
          return;
        }
        const rows = await fetchWishlistRows(userId);
        const productIds = rows.map((r) => String(r.productId));
        await fetchProductsByIds(productIds);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, userEmail, wishQuantity]);

  return (
    <div className="bg-white">
      <SectionTitle title="Wishlist Page" path="Home | Wishlist" />

      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
          {/* Render static heading on server; append count only after hydration */}
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Wishlist Items{hydrated ? ` (${wishQuantity})` : ""}
          </h1>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader />
            </div>
          ) : (
            <div className="grid grid-cols-4 justify-items-center max-w-screen-2xl mx-auto py-10 gap-x-2 px-10 gap-y-8 max-xl:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
              {products.length > 0 ? (
                products.map((product:any) => (
                  <ProductItem key={product.id} product={product} color="black" />
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <p>No items in your wishlist.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
