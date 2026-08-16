"use client";

import React from "react";
import {
  LayoutDashboard,
  Lightbulb,
  Building2,
  Briefcase,
  Calendar,
  FileText,
  AlertTriangle,
  User,
  Heart,
  Phone,
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { useAuth } from "./AuthProvider";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export function Sidebar({ activeTab, setActiveTab, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const { user } = useAuth();

  const menuItems = [
    {
      id: "overview",
      label: "Ringkasan Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "suggest",
      label: "Kotak Usulan (Suggest)",
      icon: Lightbulb,
      badge: "Utama",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    },
    {
      id: "komuniti",
      label: "Direktori & Hub Kota",
      icon: Building2,
      badge: "8 Kota",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    },
    {
      id: "kerja",
      label: "Kerja & Lapak Rantau",
      icon: Briefcase,
      badge: null,
    },
    {
      id: "events",
      label: "Agenda & Event Rantau",
      icon: Calendar,
      badge: "3 Baru",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    },
    {
      id: "consular",
      label: "Panduan Konsuler & Paspor",
      icon: FileText,
      badge: null,
    },
    {
      id: "bantuan",
      label: "Pos Bantuan Darurat",
      icon: AlertTriangle,
      badge: "Urgent",
      badgeColor: "bg-red-500/20 text-red-300 border-red-500/40",
    },
    {
      id: "profil",
      label: "Profil & Akun Saya",
      icon: User,
      badge: null,
    },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-20 bottom-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col justify-between ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* User Status Card */}
          {user && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 flex items-center gap-3">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                alt={user.name}
                className="w-10 h-10 rounded-full border border-amber-400 object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-bold text-white truncate">{user.name}</p>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                </div>
                <p className="text-[10px] text-slate-400 truncate">{user.profession}</p>
                <p className="text-[10px] font-bold text-amber-400">{user.city}, {user.country}</p>
              </div>
            </div>
          )}

          {/* Nav Menu Items */}
          <nav className="space-y-1">
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Navigasi Komunitas
            </p>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all group ${
                    isActive
                      ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-950/40"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? "text-white" : "text-slate-400 group-hover:text-red-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  ) : (
                    <ChevronRight
                      className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                        isActive ? "opacity-100 text-white" : "text-slate-500"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Official KBRI Banner Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/60 to-slate-900 border border-blue-800/40 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
              <Phone className="w-4 h-4" />
              <span>Hotline KBRI KL 24/7</span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono font-bold">+60 11-1222 3333</p>
            <p className="text-[10px] text-slate-400">Layanan Darurat Perlindungan WNI & Konsuler</p>
            <a
              href="https://kemlu.go.id/kualalumpur"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 hover:underline pt-1"
            >
              <span>Portal Resmi Kemlu</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-900 text-center text-[10px] text-slate-500">
          <p className="font-bold text-slate-400">DUTA RANTAU v2.5</p>
          <p className="text-slate-500">Komuniti Indonesia Se-Malaysia & Global</p>
        </div>
      </aside>
    </>
  );
}
