"use client";

import React, { useState, useEffect } from "react";
import {
  Lightbulb,
  Plus,
  Search,
  ThumbsUp,
  MessageSquare,
  Eye,
  CheckCircle2,
  Clock,
  Building2,
  Filter,
  ShieldCheck,
  Sparkles,
  ArrowUpDown
} from "lucide-react";
import { useToast } from "./Toast";
import { useAuth } from "./AuthProvider";

interface SuggestViewProps {
  onOpenCreateSuggest: () => void;
  onSelectSuggestion: (id: number) => void;
  globalSearch: string;
}

export function SuggestView({ onOpenCreateSuggest, onSelectSuggestion, globalSearch }: SuggestViewProps) {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [sortBy, setSortBy] = useState("upvotes"); // 'upvotes', 'latest', 'oldest'

  const categories = [
    "All",
    "Legal & Consular",
    "Jobs & Work",
    "Housing & Living",
    "Culinary & Culture",
    "Events & Social",
    "App Feature",
  ];

  const statuses = [
    { id: "All", label: "Semua Status" },
    { id: "open", label: "Open (Diskusi Terbuka)" },
    { id: "under_review", label: "Dalam Kajian KBRI" },
    { id: "planned", label: "Direncanakan" },
    { id: "implemented", label: "Terwujud (Implemented)" },
  ];

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "All") params.append("category", selectedCategory);
      if (selectedStatus !== "All") params.append("status", selectedStatus);
      if (selectedCity !== "All Cities") params.append("targetCity", selectedCity);
      if (globalSearch) params.append("search", globalSearch);
      if (sortBy) params.append("sortBy", sortBy);

      const res = await fetch(`/api/suggestions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [selectedCategory, selectedStatus, selectedCity, sortBy, globalSearch]);

  const handleToggleUpvote = async (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal("login");
      return;
    }

    // Optimistic state update
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === item.id) {
          const nextHasUpvoted = !i.hasUpvoted;
          return {
            ...i,
            hasUpvoted: nextHasUpvoted,
            upvotesCount: nextHasUpvoted ? i.upvotesCount + 1 : Math.max(i.upvotesCount - 1, 0),
          };
        }
        return i;
      })
    );

    try {
      const res = await fetch(`/api/suggestions/${item.id}/upvote`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        showToast(data.hasUpvoted ? "Dukungan (Upvote) ditambahkan!" : "Dukungan dibatalkan", "info");
      }
    } catch (err) {
      fetchSuggestions();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "implemented":
        return <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Terwujud</span>;
      case "under_review":
        return <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-700 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Dalam Kajian KBRI</span>;
      case "planned":
        return <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-950 text-blue-300 border border-blue-700 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Direncanakan</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">Diskusi Terbuka</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Kotak Usulan Komunitas (Suggest)</h1>
              <p className="text-xs text-slate-400">Sampaikan gagasan, berikan upvote, dan pantau status implementasi dari KBRI</p>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenCreateSuggest}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Buat Usulan Baru</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        
        {/* Category Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <span className="text-xs font-bold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Kategori:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border ${
                selectedCategory === cat
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md"
                  : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
              }`}
            >
              {cat === "All" ? "Semua Kategori" : cat}
            </button>
          ))}
        </div>

        {/* Status Dropdown, City Dropdown, Sort Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/60">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">Status Usulan</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">Wilayah / Kota</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="All Cities">Semua Kota</option>
              <option value="Kuala Lumpur">Kuala Lumpur</option>
              <option value="Penang">Penang</option>
              <option value="Johor Bahru">Johor Bahru</option>
              <option value="Singapore">Singapore</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">Urutkan Berdasarkan</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="upvotes">🔥 Paling Banyak Didukung (Upvotes)</option>
              <option value="latest">⚡ Terbaru (Latest)</option>
              <option value="oldest">⌛ Terlama</option>
            </select>
          </div>
        </div>
      </div>

      {/* Suggestion Cards List */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Memuat daftar usulan komunitas...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 px-4 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
            <Lightbulb className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Belum Ada Usulan Ditemukan</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tidak ada usulan sesuai filter ini. Jadilah perantau pertama yang menyampaikan ide baru!
          </p>
          <button
            onClick={onOpenCreateSuggest}
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs shadow-lg"
          >
            Buat Usulan Baru
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectSuggestion(item.id)}
              className="cursor-pointer p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all space-y-4 flex flex-col justify-between group shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {getStatusBadge(item.status)}
                  <span className="text-[11px] font-bold text-slate-400">📍 {item.targetCity}</span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>

                {/* Official Response quote if present */}
                {item.officialResponse && (
                  <div className="p-3 rounded-2xl bg-blue-950/60 border border-blue-800/60 text-xs text-blue-200">
                    <p className="font-bold text-[10px] uppercase text-blue-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Tanggapan Resmi KBRI:
                    </p>
                    <p className="line-clamp-2 italic text-[11px] mt-0.5">"{item.officialResponse}"</p>
                  </div>
                )}
              </div>

              {/* Author & Upvote Action Bar */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={item.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.authorName}`}
                    alt={item.authorName}
                    className="w-7 h-7 rounded-full object-cover border border-amber-400/40"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-200">{item.authorName}</p>
                    <p className="text-[10px] text-slate-400">{item.authorProfession}</p>
                  </div>
                </div>

                <button
                  onClick={(e) => handleToggleUpvote(e, item)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                    item.hasUpvoted
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                      : "bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${item.hasUpvoted ? "fill-slate-950" : ""}`} />
                  <span>{item.upvotesCount}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
