"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, Plus, Phone, MapPin, CheckCircle2, ShieldCheck, HeartHandshake, ExternalLink } from "lucide-react";
import { useToast } from "./Toast";
import { useAuth } from "./AuthProvider";

interface EmergencyViewProps {
  onOpenCreateEmergency: () => void;
}

export function EmergencyView({ onOpenCreateEmergency }: EmergencyViewProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/emergency");
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleVolunteerHelp = (item: any) => {
    const rawNumber = item.contactNumber.replace(/[^0-9]/g, "");
    const text = encodeURIComponent(`Halo, saya relawan Duta Rantau melihat panggilan bantuan "${item.title}". Bagaimana kondisi saat ini?`);
    window.open(`https://wa.me/${rawNumber}?text=${text}`, "_blank");
  };

  const handleUpdateStatus = async (alertId: number, status: string) => {
    try {
      const res = await fetch(`/api/emergency/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast("Status panggilan bantuan diperbarui!", "success");
        fetchAlerts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Emergency Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border border-red-800/80 p-6 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-red-600 text-white border border-red-400 shadow-lg shadow-red-900/50 animate-bounce">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Pos Bantuan Darurat & Relawan</h1>
            <p className="text-xs text-red-200">Saling bantu sesama perantau dalam kondisi sakit, musibah, atau kendala dokumen</p>
          </div>
        </div>

        <button
          onClick={onOpenCreateEmergency}
          className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg shadow-red-900/50 transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Sampaikan Panggilan Bantuan</span>
        </button>
      </div>

      {/* Emergency Hotline Alert Banner */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Hotline Cepat KBRI & Ambulans Malaysia</p>
          <p className="text-sm font-bold text-white">Nomor Darurat Nasional: Dial 999 (Malaysia) | KBRI KL: +60 11-1222 3333</p>
        </div>
        <a
          href="tel:+601112223333"
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 flex items-center gap-2"
        >
          <Phone className="w-4 h-4" />
          <span>Panggil Hotline Sekarang</span>
        </a>
      </div>

      {/* Alerts Feed */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-slate-400">Memuat panggilan bantuan...</div>
      ) : alerts.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3 max-w-md mx-auto">
          <HeartHandshake className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">Tidak Ada Panggilan Bantuan Aktif</h3>
          <p className="text-xs text-slate-400">Semua kondisi aman dan terkendali. Terima kasih kepada seluruh relawan!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((item) => {
            const isResolved = item.status === "resolved";
            const isAssisted = item.status === "assisted";
            const isOwnerOrAdmin = user?.id === item.authorId || user?.role === "admin" || user?.role === "community_lead";

            return (
              <div
                key={item.id}
                className={`p-6 rounded-3xl border transition-all space-y-4 ${
                  isResolved
                    ? "bg-slate-950/60 border-slate-800/80 opacity-70"
                    : isAssisted
                    ? "bg-blue-950/40 border-blue-800/60"
                    : "bg-red-950/30 border-red-800/80 shadow-xl"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                        isResolved
                          ? "bg-slate-800 text-slate-400"
                          : isAssisted
                          ? "bg-blue-900 text-blue-200"
                          : "bg-red-600 text-white animate-pulse"
                      }`}
                    >
                      {isResolved ? "Telah Selesai" : isAssisted ? "Sedang Didampingi" : "Membutuhkan Bantuan Segera"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-slate-300">
                      {item.type}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-amber-400">
                    📍 {item.city} ({item.location})
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white">{item.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={item.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.authorName}`}
                      alt={item.authorName}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-bold text-slate-200">{item.authorName}</span>
                    <span className="text-slate-500">({item.contactNumber})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isResolved && (
                      <button
                        onClick={() => handleVolunteerHelp(item)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Saya Bisa Bantu (Kontak)</span>
                      </button>
                    )}

                    {isOwnerOrAdmin && !isResolved && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, "resolved")}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                      >
                        Tandai Selesai
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
