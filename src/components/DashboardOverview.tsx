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



/* Hero Landing Section with Cultural Background */
<section className="relative min-h-[400px] bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 overflow-hidden">
  <div className="absolute inset-0">
    <img
      src="https://cdn.pixabay.com/photo/2016/08/18/15/43/petronas-2212018_1280.jpg"
      alt="DUTA RANTAU Komuniti Indonesia di Malaysia"
      className="object-cover w-full h-full"
      loading="lazy"
      width={1920}
      height={1080}
    />
  </div>
  <div className="relative z-10 flex flex-col items-center pt-12 pb-8 text-center text-slate-100">
    <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
      DUTA <span className="text-red-500">RANTAU</span>
    </h1>
    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mt-4">
      Komuniti Indonesia di Malaysia & Global
    </p>
    <div className="mt-6 flex gap-2 px-6 sm:px-0">
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
  </section>  useEffect(() => {
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
      
      {/* Hero Welcome Banner inspired by prompt artwork */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-700/80 text-red-300 text-xs font-bold">
            <Plane className="w-3.5 h-3.5 text-amber-400" />
            <span>Web App Komuniti Indonesia di Malaysia & Regional</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Selamat Datang di <span className="text-red-500">Duta Rantau</span>, {user?.name.split(" ")[0]}!
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Wadah resmi usulan, jejaring komunitas, lowongan kerja, agenda silaturahmi, dan bantuan darurat bagi seluruh diaspora & perantau Indonesia.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCreateSuggest}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <Lightbulb className="w-4 h-4 fill-slate-950" />
              <span>Sampaikan Usulan (Suggest)</span>
            </button>

            <button
              onClick={onOpenCreateEmergency}
              className="px-5 py-3 rounded-2xl bg-red-950 hover:bg-red-900 text-red-200 border border-red-700/80 font-bold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>Sinyal Bantuan Darurat</span>
            </button>

            <button
              onClick={() => setActiveTab("consular")}
              className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
            >
              Panduan Paspor KBRI
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab("suggest")}
          className="cursor-pointer p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Usulan Komunitas</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Lightbulb className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors">
            {topSuggestions.length}+ Gagasan
          </div>
          <p className="text-[11px] text-slate-400">Suara usulan teratas diaspora</p>
        </div>

        <div
          onClick={() => setActiveTab("komuniti")}
          className="cursor-pointer p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Hub Kota</span>
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors">
            8 Wilayah
          </div>
          <p className="text-[11px] text-slate-400">KL, Penang, Johor, SG, dll</p>
        </div>

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

      {/* Main Grid: Left Suggestion Highlights & Right Events / Embassy Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col (2 cols): Top Trending Suggestions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-black text-white">Usulan Terpopuler Komunitas (Suggest)</h2>
            </div>
            <button
              onClick={() => setActiveTab("suggest")}
              className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="py-8 text-center text-slate-500 text-xs">Memuat usulan terpopuler...</div>
            ) : topSuggestions.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectSuggestion(item.id)}
                className="cursor-pointer p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all space-y-3 group"
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
                    <img
                      src={item.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.authorName}`}
                      alt={item.authorName}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="font-semibold text-slate-300">{item.authorName}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-bold text-amber-400">
                      <ThumbsUp className="w-3.5 h-3.5 fill-amber-400" />
                      {item.upvotesCount}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {item.status === "under_review" ? "Dalam Kajian KBRI" : item.status === "implemented" ? "Terwujud" : "Open"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Upcoming Events & Quick Contacts */}
        <div className="space-y-6">
          
          {/* Upcoming Events Box */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Agenda Terdekat</span>
              </h3>
              <button
                onClick={() => setActiveTab("events")}
                className="text-[11px] font-bold text-emerald-400 hover:underline"
              >
                Lihat Agenda
              </button>
            </div>

            <div className="space-y-3">
              {upcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setActiveTab("events")}
                  className="cursor-pointer p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition-all flex gap-3"
                >
                  <img
                    src={ev.imageUrl}
                    alt={ev.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 space-y-1">
                    <p className="text-xs font-bold text-white truncate">{ev.title}</p>
                    <p className="text-[10px] text-emerald-400 font-semibold">{ev.date} • {ev.time}</p>
                    <p className="text-[10px] text-slate-400 truncate">📍 {ev.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Embassy Hotline Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-red-950/80 to-slate-900 border border-red-800/80 space-y-3 text-red-100">
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
          </div>

        </div>
      </div>
    </div>
  );
}
