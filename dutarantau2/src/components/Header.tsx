"use client";

import React, { useState } from "react";
import { useAuth } from "./AuthProvider";
import {
  Search,
  Menu,
  PhoneCall,
  UserCheck,
  ChevronDown,
  Sparkles,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Plane,
  HeartHandshake,
  Lightbulb,
  Briefcase,
  BookOpen,
  Users
} from "lucide-react";
import { useToast } from "./Toast";

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  globalSearch: string;
  setGlobalSearch: (search: string) => void;
}

export function Header({
  onToggleMobileSidebar,
  activeTab,
  setActiveTab,
  globalSearch,
  setGlobalSearch,
}: HeaderProps) {
  const { user, personas, switchPersona, logout, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);

  const handlePersonaSelect = async (pId: number) => {
    setIsPersonaMenuOpen(false);
    const success = await switchPersona(pId);
    if (success) {
      showToast("Persona berhasil diganti!", "success");
    }
  };

  const navBadges = [
    { id: "suggest", label: "Suggest (Usulan)", icon: Lightbulb, color: "hover:border-amber-500 hover:text-amber-400" },
    { id: "info", label: "Info & Paspor", icon: BookOpen, color: "hover:border-blue-500 hover:text-blue-400" },
    { id: "kerja", label: "Kerja & Lapak", icon: Briefcase, color: "hover:border-emerald-500 hover:text-emerald-400" },
    { id: "komuniti", label: "Komuniti Kota", icon: Users, color: "hover:border-purple-500 hover:text-purple-400" },
    { id: "bantuan", label: "Bantuan Darurat", icon: HeartHandshake, color: "hover:border-red-500 hover:text-red-400" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 text-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Left: Mobile Toggle & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Visual Logo inspired by DUTA RANTAU Graphic Artwork */}
            <div
              onClick={() => setActiveTab("overview")}
              className="cursor-pointer flex items-center gap-3 group"
            >
              {/* Badge Icon */}
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border-2 border-red-600/80 shadow-lg shadow-red-950/50 flex items-center justify-center overflow-hidden transform group-hover:scale-105 transition-transform duration-300">
                {/* Airplane trail graphic line */}
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-transparent to-red-500/20" />
                <Plane className="absolute top-1.5 right-1.5 w-4 h-4 text-amber-400 transform rotate-45 group-hover:translate-x-1 transition-transform" />
                
                {/* Center text DR */}
                <div className="relative font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-amber-300 text-xl leading-none">
                  D<span className="text-red-500">R</span>
                </div>

                {/* Sub flag accent line */}
                <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-white to-amber-500" />
              </div>

              {/* Title & Tagline */}
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black tracking-tight text-white font-sans">
                    DUTA <span className="text-red-500">RANTAU</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-red-950 text-red-400 border border-red-800">
                    Malaysia & Global
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400/90 tracking-wide">
                  <span>BERSAMA</span>
                  <span className="text-red-500">•</span>
                  <span>TERHUBUNG</span>
                  <span className="text-amber-400">•</span>
                  <span>BERDAYA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Cari usulan, event, lowongan kerja, atau panduan konsuler..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/80 transition-all"
              />
              {globalSearch && (
                <button
                  onClick={() => setGlobalSearch("")}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right Actions & Persona Switcher */}
          <div className="flex items-center gap-3">
            {/* Quick Emergency Call Button */}
            <button
              onClick={() => setActiveTab("bantuan")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-950/80 hover:bg-red-900 border border-red-700/80 text-red-200 text-xs font-bold transition-all shadow-md shadow-red-950/30 animate-pulse"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Bantuan Darurat</span>
            </button>

            {/* Persona Switcher / Auth User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-amber-400 object-cover"
                  />
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-slate-100 leading-tight truncate max-w-[110px]">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-amber-400 font-medium leading-tight">
                      {user.role === "embassy_staff" ? "Staf KBRI" : user.role === "community_lead" ? "Ketua Komunitas" : user.city}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Persona Switcher Dropdown */}
                {isPersonaMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in duration-150 text-slate-100">
                    <div className="px-3 py-2 border-b border-slate-800 mb-2">
                      <p className="text-xs text-slate-400 font-medium">Masuk Sebagai:</p>
                      <p className="text-sm font-bold text-white flex items-center gap-1.5">
                        {user.name}
                        {user.verified && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                      </p>
                      <p className="text-xs text-amber-400 font-semibold">{user.profession}</p>
                    </div>

                    <div className="mb-2">
                      <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        Ganti Persona Demo (1-Click)
                      </p>
                      <div className="space-y-1 mt-1 max-h-48 overflow-y-auto">
                        {personas.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handlePersonaSelect(p.id)}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                              p.id === user.id ? "bg-red-950/60 text-white font-bold border border-red-800/60" : "hover:bg-slate-800/80 text-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`}
                                alt={p.name}
                                className="w-6 h-6 rounded-full object-cover shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="truncate font-medium">{p.name}</p>
                                <p className="text-[10px] text-slate-400 truncate">{p.profession}</p>
                              </div>
                            </div>
                            {p.id === user.id && <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 space-y-1">
                      <button
                        onClick={() => {
                          setIsPersonaMenuOpen(false);
                          setActiveTab("profil");
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        Pengaturan Profil Saya
                      </button>
                      <button
                        onClick={() => {
                          setIsPersonaMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/50 rounded-xl"
                      >
                        <LogOut className="w-4 h-4" />
                        Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal("login")}
                className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-900/30 transition-all"
              >
                Masuk / Daftar
              </button>
            )}
          </div>
        </div>

        {/* Sub-navigation Badges Bar inspired by Duta Rantau artwork */}
        <div className="flex items-center gap-2 py-2 overflow-x-auto no-scrollbar border-t border-slate-800/60 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Akses Pintas:</span>
          {navBadges.map((badge) => {
            const Icon = badge.icon;
            const isActive = activeTab === badge.id;
            return (
              <button
                key={badge.id}
                onClick={() => setActiveTab(badge.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all shrink-0 border text-xs ${
                  isActive
                    ? "bg-slate-800 text-white border-amber-400 shadow-sm"
                    : `bg-slate-900/80 text-slate-300 border-slate-800 ${badge.color}`
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                <span>{badge.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
