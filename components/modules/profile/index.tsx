"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaCircleQuestion } from "react-icons/fa6";
import { sanitize } from "@/lib/sanitize";
import { useSession } from "next-auth/react";

// Types are optional; adjust as per your model
type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  amount: number; // quantity ordered
};

export const ProfileModule = () => {
  const [products, setProducts] = useState<Product[] | null>(null);
const [allQuantity, setAllQuantity] = useState(0);
const [total, setTotal] = useState(0);
const [error, setError] = useState<string | null>(null);
const { data: session }: any = useSession();

// Fetch all orders for an employee email and flatten products
useEffect(() => {
  const url = "http://localhost:3001/api/order/by-employee"; // POST returns { orders: [...] } for the email [file:55][file:49]
  const employeeEmail = session?.user?.email ? session.user.email : ""; // provide the target employee email here
  if(!employeeEmail || employeeEmail === ""){
    return;
  }
  (async () => {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: employeeEmail }),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `HTTP ${res.status}`);
      }

      const data: {
        orders: Array<{
          customerOrderId: string;
          customerOrder: {
            email: string;
            dateTime: string | null;
            status: string | null;
            total: number | null;
          };
          products: Array<{ id: string; title: string; mainImage: string | null; price: number; slug: string; quantity: number }>;
        }>;
      } = await res.json(); // Server groups orders with products per employee email [file:49]

      // Flatten all order products to a single Product[] for display
      const flattened: Product[] = (data.orders ?? []).flatMap((o) =>
        o.products.map((p) => ({
          id: String(p.id),
          title: p.title,
          price: Number(p.price) || 0,
          image: p.mainImage ?? "product_placeholder.jpg",
          amount: Number(p.quantity) || 0,
        }))
      ); // Normalize each line to your UI Product shape [file:49]

      setProducts(flattened); // Store read-only ordered products list [file:49]
    } catch (e: any) {
      setError(e?.message ?? "Failed to load employee orders"); // Basic error state [file:49]
      setProducts([]); // Keep UI stable [file:49]
    }
  })();
}, [session?.user?.email]); // Load once using POST with email in body [file:55]

// Derive quantity and totals whenever products change
useEffect(() => {
  if (!products || products.length === 0) {
    setAllQuantity(0);
    setTotal(0);
    return;
  }
  let qty = 0;
  let sum = 0;
  for (const p of products) {
    const amt = Number(p.amount) || 0;
    const price = Number(p.price) || 0;
    qty += amt;
    sum += amt * price;
  }
  setAllQuantity(qty);
  setTotal(sum); // Subtotal before shipping/tax [file:49]
}, [products]);


  return (
    <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
      <section aria-labelledby="order-heading" className="lg:col-span-7">
        <h2 id="order-heading" className="text-xl font-semibold text-gray-900">Order items</h2>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        {products && products.length > 0 && (
          <ul role="list" className="mt-4 divide-y divide-gray-200 border-b border-t border-gray-200">
            {products.map((product) => (
              <li key={product.id} className="flex py-6 sm:py-8">
                <div className="flex-shrink-0">
                  <Image
                    width={160}
                    height={160}
                    src={product.image ? `/${product.image}` : "/product_placeholder.jpg"}
                    alt={product.title}
                    className="h-24 w-24 rounded-md object-cover object-center sm:h-40 sm:w-40"
                  />
                </div>
                <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                  <div className="sm:grid sm:grid-cols-2 sm:gap-x-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        <Link href="#" className="hover:underline">
                          {sanitize(product.title)}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">Qty: {product.amount}</p>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <p className="text-sm font-medium text-gray-900">${product.price}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Line total: ${product.price * product.amount}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {products && products.length === 0 && (
          <p className="mt-4 text-sm text-gray-600">No items in this order.</p>
        )}
      </section>

      <section
        aria-labelledby="summary-heading"
        className="mt-12 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
      >
        <h2 id="summary-heading" className="text-lg font-medium text-gray-900">Order summary</h2>
        <dl className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-600">Items</dt>
            <dd className="text-sm font-medium text-gray-900">{allQuantity}</dd>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <dt className="text-sm text-gray-600">Subtotal</dt>
            <dd className="text-sm font-medium text-gray-900">${total}</dd>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <dt className="flex items-center text-sm text-gray-600">
              <span>Shipping</span>
              <a href="#" className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500">
                <span className="sr-only">Learn more about shipping</span>
                <FaCircleQuestion className="h-5 w-5" aria-hidden="true" />
              </a>
            </dt>
            <dd className="text-sm font-medium text-gray-900">$5.00</dd>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <dt className="text-sm text-gray-600">Tax (20%)</dt>
            <dd className="text-sm font-medium text-gray-900">${total / 5}</dd>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <dt className="text-base font-medium text-gray-900">Total</dt>
            <dd className="text-base font-medium text-gray-900">
              ${total === 0 ? 0 : Math.round(total + total / 5 + 5)}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
};
