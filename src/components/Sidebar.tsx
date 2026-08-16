"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import {
  MapPin,
  Filter,
  ChevronDown,
  Users,
  LogOut,
  ShieldCheck,
  Heart,
  Building,
  Briefcase,
  HeartHandshake,
  Users,
  Calendar,
  LogOut,
} from "lucide-react";
import { useToast } from "./Toast";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  isMobileOpen,
  setIsMobileOpen,
}: SidebarProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const menuItems = [
    { id: "overview", label: "Beranda", icon: Building, href: "/" },
    { id: "suggest", label: "Tanya DUTA", icon: Lightbulb, href: "/suggest" },
    { id: "layanan", label: "Layanan RI", icon: Building, href: "/layanan-ri" },
    { id: "jaga", label: "Jaga Diri", icon: HeartHandshake, href: "/bantuan" },
    { id: "kawan", label: "Kawan Rantau", icon: Users, href: "/kawan-rantau" },
    { id: "kerja", label: "Kerja", icon: Briefcase, href: "/kerja" },
    { id: "pasar", label: "Pasar Rantau", icon: ShoppingBag, href: "/pasar-rantau" },
    { id: "organisasi", label: "Organisasi", icon: Users, href: "/organisasi" },
    { id: "info", label: "Info Rantau", icon: BookOpen, href: "/info-rantau" },
    { id: "profil", label: "Profil Saya", icon: UserIcon, href: "/profil" },
  ];

  // Close mobile sidebar on link click
  useEffect(() => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  }, [isMobileOpen]);

  return (
    <aside
      className="fixed left-0 top-0 h-full w-64 bg-slate-950 border-r border-slate-800 z-50 transition-transform duration-300 ${
        isMobileOpen ? "transform translate-x-0" : "transform translate-x-full"
      }"
      aria-label="Menu navigasi"
    >
      <div className="h-full p-6 pt-8">
        {/* Close button for mobile */}
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Tutup menu"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        )}

        {/* Logo / Home link */}
        <div className="mb-8 text-center">
          <div
            onClick={() => setActiveTab("overview")}
            className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border-2 border-red-600/80 shadow-lg mx-auto mb-3"
          >
            <Plane
              className="absolute top-1.5 right-1.5 w-3 h-3 text-amber-400 transform rotate-45"
            />
            <div
              className="relative font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-amber-300 text-xl leading-none"
            >
              D<span className="text-red-500">R</span>
            </div>
          </div>
          <h2 className="text-lg font-bold text-slate-100">DUTA RANTAU</h2>
          <p className="text-sm text-slate-400">Komuniti Indonesia di Malaysia</h2>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (isMobileOpen) setIsMobileOpen(false);
              }}
              className{
                `w-full px-3 py-3 rounded-xl text-left text-sm transition-colors ${
                  activeTab === item.id
                    ? "bg-slate-800 text-white border-amber-500"
                    : "hover:bg-slate-800/80 text-slate-300"
                }`
              }
              aria-label={item.label}
            >
              <div className="flex items-center gap-3">
                <icon className={`w-4 h-4 ${activeTab === item.id ? "text-amber-500" : "text-slate-400"}`} />{/* eslint-disable jsx/no-lucide */}
                <span className="font-medium truncate">{item.label}</span>
              </div>
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        {user ? (
          <div className="mt-6 pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-500 uppercase mb-2">Akses Cepat</p>
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab("profil")}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-sm"
              >
                <UserIcon className="w-3.5 h-3.5 mr-2" /> Profil Saya
              </button>
              <button
                onClick={() => logout()}
                className="w-full py-2 px-3 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 transition-colors text-sm"
              >
                <LogOut className="w-3.5 h-3.5 mr-2" /> Keluar
              </button>
            </div>
          )
        : (
          <p className="text-center text-slate-500 mt-6">
            <a href="/masuk-daftar" className="text-amber-400 hover:text-white">Masuk / Daftar</a> untuk mengakses semua fitur
          </p>
        }
        }
      </div>
    </aside>
  );
}
