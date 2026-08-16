"use client";

import React, { useState, useEffect } from "react";
import { Briefcase, Plus, MapPin, Phone, MessageSquare, Tag, Home, ShoppingBag, Truck, ExternalLink } from "lucide-react";
import { useToast } from "./Toast";
import { useAuth } from "./AuthProvider";

interface JobsViewProps {
  onOpenCreateJob: () => void;
  globalSearch: string;
}

export function JobsView({ onOpenCreateJob, globalSearch }: JobsViewProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("All");

  const types = [
    { id: "All", label: "Semua Lapak" },
    { id: "job", label: "💼 Lowongan Kerja" },
    { id: "housing", label: "🏠 Kamar & Kost" },
    { id: "service", label: "📦 Jastip & Jasa" },
    { id: "marketplace", label: "🍲 Kuliner & UMKM" },
  ];

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType !== "All") params.append("type", selectedType);
      if (globalSearch) params.append("search", globalSearch);

      const res = await fetch(`/api/jobs?${params.toString()}`);
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
    fetchJobs();
  }, [selectedType, globalSearch]);

  const handleContactWhatsApp = (item: any) => {
    const rawNumber = item.contactInfo.replace(/[^0-9]/g, "");
    const text = encodeURIComponent(`Halo ${item.authorName}, saya melihat lapak "${item.title}" Anda di Duta Rantau. Apakah masih tersedia?`);
    window.open(`https://wa.me/${rawNumber}?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/40">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Kerja & Lapak Rantau</h1>
            <p className="text-xs text-slate-400">Temukan lowongan kerja, sewa kamar, jastip resmi, dan usaha UMKM diaspora</p>
          </div>
        </div>

        <button
          onClick={onOpenCreateJob}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Pasang Lapak / Lowongan</span>
        </button>
      </div>

      {/* Type Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {types.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedType(t.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 border ${
              selectedType === t.id
                ? "bg-blue-600 text-white border-blue-400 shadow-md"
                : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Memuat data lapak diaspora...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3 max-w-md mx-auto">
          <Briefcase className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">Belum Ada Lapak Ditemukan</h3>
          <p className="text-xs text-slate-400">Jadilah perantau pertama yang menawarkan lowongan atau jasa!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-4 group shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800 uppercase tracking-wider">
                    {item.type}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    {item.priceOrSalary}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <img
                      src={item.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.authorName}`}
                      alt={item.authorName}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-semibold text-slate-200">{item.authorName}</span>
                  </div>
                  <span>📍 {item.city}</span>
                </div>

                <button
                  onClick={() => handleContactWhatsApp(item)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Hubungi via WhatsApp</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
