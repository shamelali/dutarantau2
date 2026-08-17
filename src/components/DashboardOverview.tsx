"use client";

import React, { useEffect, useState } from "react";
import {
  Lightbulb,
  Users,
  Calendar,
  AlertTriangle,
  Plus,
  ArrowRight,
  ThumbsUp,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Plane,
  Building2,
  TrendingUp
} from "lucide-react";
import { useAuth } from "./AuthProvider";

interface DashboardOverviewProps {
  setActiveTab: (tab: string) => void;
  onOpenCreateSuggest: () => void;
  onOpenCreateEmergency: () => void;
  onSelectSuggestion: (id: number) => void;
}

export function DashboardOverview({
  setActiveTab,
  onOpenCreateSuggest,
  onOpenCreateEmergency,
  onSelectSuggestion,
}: DashboardOverviewProps) {
  const { user } = useAuth();

  const [topSuggestions, setTopSuggestions] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [activeEmergencyCount, setActiveEmergencyCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sugRes, evRes, emRes] = await Promise.all([
          fetch("/api/suggestions?sortBy=upvotes"),
          fetch("/api/events"),
          fetch("/api/emergency"),
        ]);

        if (sugRes.ok) {
          const sData = await sugRes.json();
          setTopSuggestions(sData.items?.slice(0, 3) || []);
        }
        if (evRes.ok) {
          const eData = await evRes.json();
          setUpcomingEvents(eData.items?.slice(0, 2) || []);
        }
        if (emRes.ok) {
          const emData = await emRes.json();
          const active = emData.items?.filter((i: any) => i.status === "seeking_help") || [];
          setActiveEmergencyCount(active.length);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Asymmetric Hero: Image Left, Text Right */}
      <section className="relative overflow-hidden rounded-3xl bg-gray-900 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 md:px-0 md:py-12 lg:max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-700/80 text-red-300 text-xs font-bold">
                <Plane className="w-3.5 h-3.5 text-amber-400" />
                <span>Web App Komuniti Indonesia di Malaysia & Regional</span>
              </p>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-4">
                DUTA <span className="text-red-500">RANTAU</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed">
                Komuniti orang Indonesia di Malaysia—berbagi pengalaman, dapatkan jawaban, dan temukan peluang untuk bekerja, hidup, dan beradaptasi di tanah ini.
              </p>
              <div className="mt-6 flex gap-3">
                <a
                  href="/suggest"
                  className="px-6 py-3 rounded-full bg-red-600 text-white font-medium transition-colors hover:bg-red-500"
                  aria-label="Mulai dengan Tanya DUTA"
                >
                  Tanya DUTA
                </a>
                <a
                  href="/kawan-rantau"
                  className="px-6 py-3 rounded-full bg-slate-800 text-slate-300 font-medium transition-colors hover:bg-slate-700"
                  aria-label="Jarak dengan Kawan Rantau"
                >
                  Kawan Rantau
                </a>
              </div>
            </div>

            <div className="relative lg:pt-20">
              <img
                src="https://cdn.pixabay.com/photo/2023/08/24/15/23/flag-indonesia-7969001_1280.jpg"
                alt="Komuniti Indonesia di Kuala Lumpur"
                className="w-full rounded-2xl object-cover hover:transition-transform hover:scale-105 duration-500"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services Grid */}
      <section className="my-16">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 px-6 sm:px-0">
          {/* Layanan RI */}
          <a href="/layanan-ri" className="group rounded-2xl bg-slate-900 overflow-hidden hover:shadow-lg transition-all duration-300">
            <img
              src="https://cdn.pixabay.com/photo/2023/08/24/15/23/flag-indonesia-7969001_1280.jpg"
              alt="Layanan RI Indonesia"
              className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="p-5">
              <h3 className="text-sm font-bold text-white group-hover:text-red-500 transition-colors mb-2">
                Layanan RI
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2">
                Layanan konsuler dan dokumentasi
              </p>
            </div>
          </a>

          {/* Kerja */}
          <a href="/kerja" className="group rounded-2xl bg-slate-900 overflow-hidden hover:shadow-lg transition-all duration-300">
            <img
              src="https://cdn.pixabay.com/photo/2022/03/19/11/06/penang-2764558_1280.jpg"
              alt="Lowongan kerja Malaysia"
              className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="p-5">
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-500 transition-colors mb-2">
                Kerja
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2">
                Lowongan kerja terbaru
              </p>
            </div>
          </a>

          {/* Pasar Rantau */}
          <a href="/pasar-rantau" className="group rounded-2xl bg-slate-900 overflow-hidden hover:shadow-lg transition-all duration-300">
            <img
              src="https://cdn.pixabay.com/photo/2023/05/30/13/46/carnival-8028612_1280.jpg"
              alt="Pasar Rantau pasar tradisional"
              className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="p-5">
              <h3 className="text-sm font-bold text-white group-hover:text-amber-500 transition-colors mb-2">
                Pasar Rantau
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2">
                Pasar tradisional dan produk
              </p>
            </div>
          </a>

          {/* Organisasi */}
          <a href="/organisasi" className="group rounded-2xl bg-slate-900 overflow-hidden hover:shadow-lg transition-all duration-300">
            <img
              src="https://cdn.pixabay.com/photo/2023/03/14/11/53/gamelan-7852175_1280.jpg"
              alt="Gamelan tradisi Indonesia"
              className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="p-5">
              <h3 className="text-sm font-bold text-white group-hover:text-amber-500 transition-colors mb-2">
                Organisasi
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2">
                Organisasi dan kebersamaan
              </p>
            </div>
          </a>
        </div>
      </section>

      {/* Quick Embassy Hotline */}
      <section className="p-6 rounded-3xl bg-gradient-to-br from-red-950/80 to-slate-900 border border-red-800/80 space-y-3">
        <div className="flex items-center gap-2 font-black text-xs text-red-300 uppercase tracking-wider">
          <Phone className="w-4 h-4 text-red-400" />
          <span>Bantuan & Hotline KBRI Kuala Lumpur</span>
        </div>
        <p className="text-xs leading-relaxed text-slate-300">
          Butuh penanganan darurat kecelakaan, paspor hilang, atau masalah legalitas?
        </p>
        <div className="p-3 rounded-2xl bg-red-900/40 border border-red-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-red-300">Hotline 24 Jam WhatsApp</p>
            <p className="text-sm font-mono font-bold text-white">+60 11-1222 3333</p>
          </div>
          <button
            onClick={() => setActiveTab("bantuan")}
            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow"
          >
            Hubungi
          </button>
        </div>
      </section>

      {/* Main Grid: Left Suggestion Highlights & Right Events / Embassy Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col (2 cols): Top Trending Suggestions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saran Terpopuler</span>
            <a href="/suggest" className="text-sm text-red-500 font-medium hover:underline">
              Lihat semua
            </a>
          </div>

          {/* Suggestions */}
          {isLoading ? (
            <p className="text-slate-500 py-8">Memuat saran...</p>
          ) : topSuggestions.length === 0 ? (
            <p className="text-slate-500 py-8">Belum ada saran terpopuler</p>
          ) : (
            <div className="space-y-3">
              {topSuggestions.map((item: any) => (
                <div
                  key={item.id}
                  onClick={() => onSelectSuggestion(item.id)}
                  className="cursor-pointer p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      {item.category}
                    </span>
                    <span className="text-slate-400 font-medium">📍 {item.targetCity}</span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      <span>{item.upvotes} upvotes</span>
                    </div>
                    <span className="text-slate-500"> {item.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Events & Embassy */}
        <div className="space-y-4">
          {/* Events */}
          <div>
            <div
              onClick={() => setActiveTab("events")}
              className="cursor-pointer p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Agenda Mendatang</span>
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">
                {upcomingEvents.length} Event
              </div>
              <p className="text-[11px] text-slate-400">Halal bihalal & bazaar</p>
            </div>

            {/* Emergency */}
            <div
              onClick={() => setActiveTab("bantuan")}
              className="cursor-pointer p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-red-500/50 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Bantuan Darurat</span>
                <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-white group-hover:text-red-400 transition-colors">
                {activeEmergencyCount} Panggilan
              </div>
              <p className="text-[11px] text-slate-400">Relawan siap membantu</p>
            </div>
          </div>

          {/* Embassy Banner */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400">Panduan Penting</span>
              <span className="text-sm text-amber-400 font-medium">Lihat semua</span>
            </div>
            <p className="text-sm text-slate-400 line-clamp-3">
              Panduan lengkap visa, pekerjaan, dan properti untuk orang Indonesia di Malaysia. Selalu verifikasi info resmi dengan KBRI & Imigresen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}