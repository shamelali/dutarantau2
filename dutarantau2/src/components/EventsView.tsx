"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Plus, MapPin, Clock, Users, CheckCircle2, Share2, Tag } from "lucide-react";
import { useToast } from "./Toast";
import { useAuth } from "./AuthProvider";

interface EventsViewProps {
  onOpenCreateEvent: () => void;
  globalSearch: string;
}

export function EventsView({ onOpenCreateEvent, globalSearch }: EventsViewProps) {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    "Social Gathering",
    "Culinary & Pasaran",
    "Webinar & Skill",
    "Sports & Fun",
  ];

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "All") params.append("category", selectedCategory);
      if (globalSearch) params.append("search", globalSearch);

      const res = await fetch(`/api/events?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, globalSearch]);

  const handleRsvp = async (eventItem: any) => {
    if (!user) {
      openAuthModal("login");
      return;
    }

    const nextStatus = eventItem.userRsvpStatus === "going" ? "cancel" : "going";

    // Optimistic
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventItem.id) {
          const isGoing = nextStatus === "going";
          return {
            ...e,
            userRsvpStatus: isGoing ? "going" : null,
            attendeesCount: isGoing ? e.attendeesCount + 1 : Math.max(e.attendeesCount - 1, 0),
          };
        }
        return e;
      })
    );

    try {
      const res = await fetch(`/api/events/${eventItem.id}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        showToast(nextStatus === "going" ? "Kehadiran Anda telah dikonfirmasi!" : "RSVP dibatalkan", "info");
      }
    } catch (err) {
      fetchEvents();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Agenda & Kegiatan Komunitas</h1>
            <p className="text-xs text-slate-400">Ikuti silaturahmi, pasar kuliner, webinar, dan acara kumpul diaspora</p>
          </div>
        </div>

        <button
          onClick={onOpenCreateEvent}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Buat Agenda Acara</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 border ${
              selectedCategory === cat
                ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md"
                : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
            }`}
          >
            {cat === "All" ? "Semua Agenda" : cat}
          </button>
        ))}
      </div>

      {/* Event Cards */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Memuat agenda kegiatan...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3 max-w-md mx-auto">
          <Calendar className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">Belum Ada Agenda Ditampilkan</h3>
          <p className="text-xs text-slate-400">Jadilah panitia pertama yang menerbitkan acara silaturahmi!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all overflow-hidden flex flex-col justify-between group shadow-xl"
            >
              <div>
                {/* Event Cover Image */}
                <div className="relative h-44 overflow-hidden bg-slate-950">
                  <img
                    src={ev.imageUrl}
                    alt={ev.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-[10px] font-bold text-amber-400">
                    {ev.category}
                  </div>
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-xs font-bold text-emerald-400">
                    📍 {ev.city}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                    {ev.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-300 font-medium">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>{ev.date} • {ev.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span className="truncate">{ev.location}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {ev.description}
                  </p>
                </div>
              </div>

              {/* Attendance & RSVP Button Footer */}
              <div className="p-5 pt-0 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white">{ev.attendeesCount}</span>
                    <span>/ {ev.capacity} Hadir</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Penyelenggara: {ev.organizerName}</span>
                </div>

                <button
                  onClick={() => handleRsvp(ev)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                    ev.userRsvpStatus === "going"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-700 shadow-inner"
                      : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{ev.userRsvpStatus === "going" ? "Sudah Mendaftar (Akan Hadir)" : "Daftar Hadir (RSVP)"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
