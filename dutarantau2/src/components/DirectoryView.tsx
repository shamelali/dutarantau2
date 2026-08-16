"use client";

import React from "react";
import { Building2, Users, MapPin, ExternalLink, ShieldCheck, MessageCircle } from "lucide-react";
import { useToast } from "./Toast";

export function DirectoryView() {
  const { showToast } = useToast();

  const hubs = [
    {
      city: "Kuala Lumpur & Selangor",
      country: "Malaysia",
      membersCount: "4,200+",
      lead: "Budi Santoso & PPI UM",
      description: "Hub terbesar diaspora Indonesia, pekerja IT, profesional, dan mahasiswa di Lembah Klang.",
      chatGroup: "https://t.me/duta_rantau_kl",
      image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&auto=format&fit=crop&q=80",
    },
    {
      city: "Penang & Northern Region",
      country: "Malaysia",
      membersCount: "1,850+",
      lead: "Dewi Kartika & Komunitas Minang",
      description: "Pusat kuliner, pengusaha UMKM, dan pekerja sektor hospitality & industri Georgetown.",
      chatGroup: "https://t.me/duta_rantau_penang",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
    },
    {
      city: "Johor Bahru & Southern Hub",
      country: "Malaysia",
      membersCount: "2,100+",
      lead: "Sutrisno & Relawan Iskandar",
      description: "Komunitas pekerja komuter SG-MY dan sektor logistik pelabuhan Johor.",
      chatGroup: "https://t.me/duta_rantau_johor",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80",
    },
    {
      city: "Singapore Chapter",
      country: "Singapore",
      membersCount: "3,100+",
      lead: "Reza Pratama",
      description: "Jejaring profesional tech, perbankan, dan mahasiswa S1/S2/S3 di Singapura.",
      chatGroup: "https://t.me/duta_rantau_sg",
      image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&auto=format&fit=crop&q=80",
    },
    {
      city: "Sydney Hub",
      country: "Australia",
      membersCount: "1,200+",
      lead: "Maya Indah",
      description: "Jejaring diaspora Indonesia di New South Wales Australia.",
      chatGroup: "https://t.me/duta_rantau_sydney",
      image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&auto=format&fit=crop&q=80",
    },
    {
      city: "Tokyo Chapter",
      country: "Japan",
      membersCount: "950+",
      lead: "Kenji Rasyid",
      description: "Komunitas pekerja magang Kenshusei, IT, dan PPI Kanto Jepang.",
      chatGroup: "https://t.me/duta_rantau_tokyo",
      image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80",
    },
  ];

  const handleJoinChat = (hubName: string) => {
    showToast(`Membuka tautan Komunitas WhatsApp/Telegram: ${hubName}`, "info");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/40">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Direktori Hub & Komunitas Kota</h1>
            <p className="text-xs text-slate-400">Temukan grup silaturahmi perantau Indonesia berdasarkan kota tempat tinggal Anda</p>
          </div>
        </div>
      </div>

      {/* Hub Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hubs.map((hub, idx) => (
          <div
            key={idx}
            className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-blue-500/50 transition-all flex flex-col justify-between group shadow-xl"
          >
            <div>
              <div className="relative h-40 overflow-hidden bg-slate-950">
                <img
                  src={hub.image}
                  alt={hub.city}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-xs font-bold text-amber-400">
                  📍 {hub.country}
                </div>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-white">{hub.city}</h3>
                  <span className="text-xs font-bold text-emerald-400">{hub.membersCount} Anggota</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{hub.description}</p>
                <p className="text-[11px] text-amber-400/90 font-medium">Koordinator: {hub.lead}</p>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                onClick={() => handleJoinChat(hub.city)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Gabung Grup Whatsapp / Telegram</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
