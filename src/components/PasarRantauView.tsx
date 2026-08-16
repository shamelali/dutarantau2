"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { Search, ShoppingBag, Users, Filter, Menu, X, LogOut } from "lucide-react";

interface ProductItem {
  id: number;
  name: string;
  price: string;
  description: string;
  image: string;
  sellerName: string;
  verificationStatus: string;
}

interface SellerItem {
  id: number;
  storeName: string;
  description: string;
  rating: number;
  verificationStatus: string;
}

export function PasarRantauView() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [sellers, setSellers] = useState<SellerItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [searchQuery, selectedCategory]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/pasar?q=" + searchQuery + "&category=" + (selectedCategory || ""), {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        setSellers(data.sellers);
      }
    } catch (error) {
      console.error("Gagal mengambil data marketplace:", error);
      showToast("Gagal memuat data marketplace", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    fetchData();
  };

  const handleCategoryFilter = (category: string | null) => {
    setSelectedCategory(category);
    fetchData();
  };

  const handleBuy = (productId: number) => {
    showToast("Fitur pembelian akan segera hadir", "info");
  };

  const handleAddToCart = (productId: number) => {
    showToast("Produk ditambahkan ke keranjang", "success");
  };

  return (
    <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-100">
          <ShoppingBag className="w-4 h-4 mr-2 text-emerald-400" /> Pasar Rantau
        </h2>
        {user && (
          <button
            onClick={() => showToast("Fitur penjualan akan segera hadir", "info")}
            className="px-3 py-1.5 text-sm text-amber-400 hover:bg-amber-950/20 rounded"
          >
            <Users className="w-3.5 h-3.5 mr-1" /> Jual Produk
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Cari produk Indonesia..."
            className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/80 transition-all"
            disabled={isLoading}
            aria-label="Cari produk"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleCategoryFilter(null)}
            className="px-3 py-1.5 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors ${
              !selectedCategory ? "border-amber-500/30 amber-400" : "hidden"
            }"
          >
            Semua Kategori
          </button>
          <span className="text-[10px] text-amber-400/70">•</span>
          <button
            onClick={() => handleCategoryFilter("makanan")}
            className="px-3 py-1.5 text-xs font-medium rounded ${
              selectedCategory === "makanan" ? "bg-slate-800 text-white" : "hover:bg-slate-800/50"
            }"
          >
            Makanan
          </button>
          <button
            onClick={() => handleCategoryFilter("produk_indonesia")}
            className="px-3 py-1.5 text-xs font-medium rounded ${
              selectedCategory === "produk_indonesia" ? "bg-slate-800 text-white" : "hover:bg-slate-800/50"
            }"
          >
            Produk Indonesia
          </button>
          <button
            onClick={() => handleCategoryFilter("fashion")}
            className="px-3 py-1.5 text-xs font-medium rounded ${
              selectedCategory === "fashion" ? "bg-slate-800 text-white" : "hover:bg-slate-800/50"
            }"
          >
            Fashion
          </button>
        </div>
      </div>

      {/* Products List */}
      {isLoading ? (
        <div className="mt-4 h-64 flex items-center justify-center text-slate-400">
          Sedang memuat...
        </div>
      ) : products.length === 0 ? (
        <div className="mt-6 text-center text-slate-500">
          {searchQuery
            ? "Tidak ditemukan produk untuk: " + searchQuery
            : "Belum ada produk di pasar. Jual produk favoritmu!"}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {products.map((product) => (
            <div
              key={product.id}
              className="group border rounded-xl bg-slate-900 overflow-hidden hover:border-amber-500/30 transition-colors"
            >
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div
                  className="w-full h-48 bg-slate-800 flex items-center justify-center text-slate-500"
                >
                  <span className="text-xl">🛒</span>
                </div>
              )}
              <div className="p-3">
                <p className="font-medium truncate line-clamp-2">{product.name}</p>
                <p className="text-amber-500 font-medium mt-1">Rp {product.price}</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">
                  {product.description.substring(0, 80)}...
                </p>
                <div className="mt-2 flex gap-2">
                  <span
                    className={`text-xs rounded ${
                      product.verificationStatus === "verified_seller"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : product.verificationStatus === "member_seller"
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-slate-700/30 text-slate-300"
                    }`}
                  >
                    {product.verificationStatus}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sellers Section */}
      {sellers.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-700">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Penjual Terverifikasi</h3>
          <div className="grid grid-cols-2 gap-3">
            {sellers.map((seller) => (
              <div
                key={seller.id}
                className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-center"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center mb-2">
                  <span className="text-amber-400">{seller.rating > 0 ? seller.rating : "─"}</span>
                </div>
                <p className="text-[10px] line-clamp-1">{seller.storeName}</p>
                <p className="text-[10px] text-slate-500 mt-1">{seller.description.substring(0, 50)}...</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA for non-members */}
      {!user && (
        <div className="mt-6 p-4 rounded-xl bg-slate-800/50 text-center text-slate-400">
          <p className="text-[11px]">
            {"Belum punya akun? "}{"Masuk / Daftar "}{"untuk menjual di Pasar Rantau."}
          </p>
        </div>
      )}
    </div>
  );
}