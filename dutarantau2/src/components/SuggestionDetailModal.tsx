"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ThumbsUp,
  MessageSquare,
  Eye,
  CheckCircle2,
  Clock,
  Building2,
  Send,
  Trash2,
  ShieldCheck,
  User,
  Share2
} from "lucide-react";
import { useToast } from "./Toast";
import { useAuth } from "./AuthProvider";

interface SuggestionDetailModalProps {
  suggestionId: number | null;
  onClose: () => void;
  onUpdated: () => void;
}

export function SuggestionDetailModal({ suggestionId, onClose, onUpdated }: SuggestionDetailModalProps) {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [data, setData] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUpdatingStatus, setIsSubmittingStatus] = useState(false);

  // Official Response Form State for Staff/Lead
  const [statusInput, setStatusInput] = useState("");
  const [responseInput, setOfficialResponseInput] = useState("");

  const fetchDetail = async () => {
    if (!suggestionId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/suggestions/${suggestionId}`);
      if (res.ok) {
        const result = await res.json();
        setData(result.item);
        setComments(result.comments || []);
        setStatusInput(result.item.status);
        setOfficialResponseInput(result.item.officialResponse || "");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [suggestionId]);

  if (!suggestionId) return null;

  const handleUpvote = async () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    try {
      // Optimistic update
      setData((prev: any) => ({
        ...prev,
        hasUpvoted: !prev.hasUpvoted,
        upvotesCount: prev.hasUpvoted ? prev.upvotesCount - 1 : prev.upvotesCount + 1,
      }));

      const res = await fetch(`/api/suggestions/${suggestionId}/upvote`, { method: "POST" });
      const resData = await res.json();
      if (res.ok) {
        showToast(resData.hasUpvoted ? "Dukungan (Upvote) berhasil!" : "Dukungan dibatalkan.", "info");
        onUpdated();
      }
    } catch (err: any) {
      fetchDetail();
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal("login");
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/suggestions/${suggestionId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      const resData = await res.json();
      if (res.ok) {
        showToast("Komentar ditambahkan!", "success");
        setComments((prev) => [resData.comment, ...prev]);
        setNewComment("");
      } else {
        showToast(resData.error, "error");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleUpdateStatusAndResponse = async () => {
    if (!user) return;
    setIsSubmittingStatus(true);
    try {
      const res = await fetch(`/api/suggestions/${suggestionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusInput, officialResponse: responseInput }),
      });
      const resData = await res.json();
      if (res.ok) {
        showToast("Status & Tanggapan Resmi berhasil diperbarui!", "success");
        setData((prev: any) => ({ ...prev, status: statusInput, officialResponse: responseInput }));
        onUpdated();
      } else {
        showToast(resData.error, "error");
      }
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  const handleDeleteSuggestion = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus usulan ini?")) return;
    try {
      const res = await fetch(`/api/suggestions/${suggestionId}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Usulan dihapus.", "info");
        onUpdated();
        onClose();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "implemented":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Terwujud (Implemented)</span>;
      case "under_review":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-700 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Dalam Kajian KBRI</span>;
      case "planned":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-950 text-blue-300 border border-blue-700 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Direncanakan</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">Diskusi Terbuka (Open)</span>;
    }
  };

  const isAdminOrStaff = user?.role === "embassy_staff" || user?.role === "community_lead" || user?.role === "admin";
  const isOwner = user?.id === data?.authorId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Memuat detail usulan...</p>
          </div>
        ) : !data ? (
          <p className="text-center text-slate-400 py-8">Usulan tidak ditemukan.</p>
        ) : (
          <div className="space-y-6">
            {/* Header badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(data.status)}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-400">
                  {data.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-400">
                  📍 {data.targetCity}
                </span>
              </div>
              {(isOwner || isAdminOrStaff) && (
                <button
                  onClick={handleDeleteSuggestion}
                  className="p-2 text-red-400 hover:bg-red-950/50 rounded-xl transition-colors text-xs font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
              )}
            </div>

            {/* Title & Description */}
            <div>
              <h2 className="text-2xl font-black text-white leading-snug mb-3">{data.title}</h2>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{data.description}</p>
            </div>

            {/* Author bar & upvote button */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={data.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.authorName}`}
                  alt={data.authorName}
                  className="w-10 h-10 rounded-full border border-amber-400/50 object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1">
                    {data.authorName}
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  </p>
                  <p className="text-[10px] text-slate-400">{data.authorProfession} • {data.authorCity}</p>
                </div>
              </div>

              <button
                onClick={handleUpvote}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  data.hasUpvoted
                    ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${data.hasUpvoted ? "fill-slate-950" : ""}`} />
                <span>{data.upvotesCount} Dukungan</span>
              </button>
            </div>

            {/* KBRI / Community Official Response Box */}
            {data.officialResponse && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/80 to-slate-900 border border-blue-800/80 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                  <ShieldCheck className="w-4.5 h-4.5 text-blue-400" />
                  <span>Tanggapan Resmi KBRI / Koordinator Komunitas:</span>
                </div>
                <p className="text-xs text-blue-100 leading-relaxed italic bg-blue-950/40 p-3 rounded-xl border border-blue-900">
                  "{data.officialResponse}"
                </p>
              </div>
            )}

            {/* Admin / KBRI Staff Edit Response Form */}
            {isAdminOrStaff && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Panel Pengurus / KBRI Staff</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Update Status Usulan</label>
                    <select
                      value={statusInput}
                      onChange={(e) => setStatusInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                    >
                      <option value="open">Open (Diskusi Terbuka)</option>
                      <option value="under_review">Dalam Kajian KBRI</option>
                      <option value="planned">Direncanakan (Planned)</option>
                      <option value="implemented">Terwujud (Implemented)</option>
                      <option value="closed">Ditutup</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Tulis Tanggapan Resmi</label>
                  <textarea
                    rows={2}
                    value={responseInput}
                    onChange={(e) => setOfficialResponseInput(e.target.value)}
                    placeholder="Masukkan tanggapan resmi dari KBRI / Tim Pengurus..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUpdateStatusAndResponse}
                  disabled={isUpdatingStatus}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  {isUpdatingStatus ? "Menyimpan..." : "Simpan Tanggapan Resmi"}
                </button>
              </div>
            )}

            {/* Comments Discussion Section */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>Diskusi Komunitas ({comments.length})</span>
              </h4>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Tulis masukan atau tanggapan Anda..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Kirim
                </button>
              </form>

              {/* Comments Feed */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-4">Belum ada komentar. Jadilah yang pertama memberikan masukan!</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={c.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.authorName}`}
                            alt={c.authorName}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="text-xs font-bold text-slate-200">{c.authorName}</span>
                          {c.authorRole === "embassy_staff" && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-blue-950 text-blue-300 border border-blue-800">
                              KBRI Staff
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {new Date(c.createdAt).toLocaleDateString("id-ID", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 pl-7">{c.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
