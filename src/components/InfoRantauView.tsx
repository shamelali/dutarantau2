"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { Search, MapPin, Layout, Building2, Heart, Shield, Calendar, Globe, TextBook, Phone, CreditCard, Mobile, Food, Store, Users, Settings, Eye, Sun, Moon, Map, Music, Palette } from "lucide-react";

interface CategoryFilter {
  label: string;
  value: string;
}

export function InfoRantauView() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [categories, setCategories] = useState<CategoryFilter[]>([
    { label: "Semua", value: "" },
    { label: "Malaysia", value: "malaysia" },
    { label: "Transport", value: "transport" },
    { label: "Akomodasi", value: "accommodation" },
    { label: "Pendidikan", value: "education" },
    { label: "Kesehatan", value: "healthcare" },
    { label: "Perbankan", value: "banking" },
    { label: "Telekomunikasi", value: "telecom" },
    { label: "Makanan", value: "food" },
    { label: "Belanja", value: "shopping" },
    { label: "Legal", value: "legal_basics" },
    { label: "Budaya", value: "culture" },
    { label: "Travel", value: "travel" },
    { label: "Pelayanan Publik", value: "public_services" },
  ]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, searchQuery]);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/inforantau?q=" + searchQuery + "&category=" + (selectedCategory || ""), {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles);
      }
    } catch (error) {
      console.error("Gagal mengambil info rantau:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    fetchArticles();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    fetchArticles();
  };

  const categoryColors: Record<string, string> = {
    malaysia: "text-blue-400",
    transport: "text-emerald-400",
    accommodation: "text-amber-400",
    education: "text-sky-400",
    healthcare: "text-red-400",
    banking: "text-yellow-400",
    telecom: "text-purple-400",
    food: "text-orange-400",
    shopping: "text-green-400",
    legal_basics: "text-pink-400",
    culture: "text-fuchsia-400",
    travel: "text-lime-400",
    public_services: "text-teal-400",
  };

  return (
    <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-100">
          <Info className="w-4 h-4 mr-2 text-amber-400" /> Info Rantau
        </h2>
        {user && (
          <button
            onClick={() => showToast("Fitur konten terbaru akan segera hadir", "info")}
            className="px-3 py-1.5 text-sm text-amber-400 hover:bg-amber-950/20 rounded"
          >
            <Star className="w-3.5 h-3.5 mr-1" /> Berita Terbaru
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            aria-label="Cari informasi"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Cari panduan, tips, atau informasi..."
            className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/80 transition-all"
            disabled={isLoading}
            aria-label="Cari informasi rantau"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-1.5 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {showFilters ? "Sembunyikan Filter" : "Filter"}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mt-3 p-3 rounded-bg-slate-800 border border-slate-700">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Kategori</p>
          <div className="grid grid-cols-3 gap-1">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`p-1 rounded text-[8px] font-medium ${
                  selectedCategory === cat.value
                    ? "bg-amber-600 text-amber-400"
                    : "hover:bg-slate-700 text-slate-300 transition-colors"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Articles List */}
      {isLoading ? (
        <div className="mt-4 h-64 flex items-center justify-center text-slate-400">
          Memuat informasi...
        </div>
      ) : articles.length === 0 ? (
        <div className="mt-6 text-center text-slate-500">
          {searchQuery
            ? "Tidak ditemukan informasi untuk: " + searchQuery
            : "Belum ada panduan informasi. Check back soon!"}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-80 overflow-y-auto">
          {articles.map((article) => (
            <div
              key={article.id}
              className="group border rounded-xl bg-slate-900 overflow-hidden hover:border-amber-500/30 transition-colors cursor-pointer"
              onClick={() => window.open(`/article/${article.slug}`, "_blank")}
            >
              <div className="p-3">
                <p className="font-medium text-sm line-clamp-2 truncate">
                  {article.title}
                </p>
                <p className="text-[8px] text-slate-500 mt-1">
                  {article.category}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && articles.length === 0 && !searchQuery && (
        <div className="mt-6 p-4 rounded-xl bg-slate-800/50 text-center text-slate-400">
          <p className="text-[11px]">
            {"Belum ada panduan informasi. "}{"Fitur akan segera hadir dengan konten berkualitas dari KBRI/KJRI dan komunitas."}
          </p>
        </div>
      )}
    </div>
  );
}