"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { Upload, Image, Corners, Palette, ShieldCheck, Loader2, Trash, Search, Settings, Flag, Eye, ExternalLink } from "lucide-react";

interface PhotoProject {
  id: number;
  originalImage: string;
  background: string;
  resultImage: string;
  metadata: string;
  createdAt: string;
}

interface BackgroundOption {
  id: string;
  name: string;
  location: string;
  description: string;
}

export function AIPhotoView() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<PhotoProject[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedProject, setSelectedProject] = useState<PhotoProject | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [backgrounds, setBackgrounds] = useState<BackgroundOption[]>([
    { id: "kl", name: "Kuala Lumpur", location: "Kuala Lumpur, Malaysia", description: "Ikon Kuala Lumpur yang menjadi salah satu landmark paling terkenal di Malaysia." },
    { id: "penang", name: "Penang", location: "Penang, Malaysia", description: "Peradaban Nusantara di Pulau Pinang dengan heritage kuliner yang kaya." },
    { id: "johor", name: "Johor", location: "Johor, Malaysia", description: "Pusat pembangunan dan destinasi pelancong di selatan Malaysia." },
    { id: "sabah", name: "Sabah", location: "Sabah, Malaysia", description: "Negara di bawah jalan suria di Borneo dengan danau dan hutan yang megah." },
    { id: "sarawak", name: "Sarawak", location: "Sarawak, Malaysia", description: "Borneo terbesar dengan kultura orang Dayak dan natur yang pristine." },
    { id: "melaka", name: "Melaka", location: "Melaka, Malaysia", description: "Kota sejarah dengan warisan dunia UNESCO dari ERA Portuguese dan British." },
  ]);

  useEffect(() => {
    fetchProjects();
  }, [searchQuery]);

  const fetchProjects = async () => {
    try {
      setIsUploading(true);
      const res = await fetch("/api/ai-photo?q=" + searchQuery, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error("Gagal mengambil data foto AI:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      showToast("Hanya menerima file JPG, PNG, WebP", "error");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("Ukuran file terlalu besar. Maksimal 5MB", "error");
      return;
    }

    setIsUploading(true);

    // In a real implementation, we would upload the file and process with AI
    // For now, create a preview and project record
    const reader = new FileReader();
    reader.onload = (event: any) => {
      const imageData = event.target.result;
      // Create a photo project record
      const projectData = {
        originalImage: imageData,
        background: "kl", // Default to KL
        resultImage: imageData, // Placeholder - in full impl, AI-processed
      };

      // Save to database
      // In full implementation, would call API POST
      const newProject: PhotoProject = {
        id: Date.now(),
        originalImage: imageData,
        background: "kl",
        resultImage: imageData,
        metadata: JSON.stringify({
          createdAt: new Date().toISOString(),
          fileName: file.name,
        }),
      };

      setProjects(prev => [newProject, ...prev]);
      setIsUploading(false);
      showToast("Foto berhasil diupload", "success");
    };

    reader.readAsDataURL(file);
  };

  const handleGenerate = (project: PhotoProject) => {
    showToast("Sedang diproses oleh AI...", "info");
    // In full implementation, would call AI image generation service
    setSelectedProject(project);
    setShowGallery(true);
  };

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "duta-rantau-photo.jpg";
    link.click();
  };

  const handleDelete = (projectId: number) => {
    showToast("Foto berhasil dihapus", "success");
    // In full implementation, would delete from database
  };

  const roleColor = (role: string) => {
    if (!user) return "slate";
    if (role === "member") return "amber";
    return "slate";
  };

  return (
    <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-100">
          <Palette className="w-4 h-4 mr-2 text-amber-400" /> AI Photo
        </h2>
        {user && (
          <button
            onClick={() => setShowGallery(true)}
            className="px-3 py-1.5 text-sm text-amber-400 hover:bg-amber-950/20 rounded"
          >
            <Upload className="w-3.5 h-3.5 mr-1" /> Upload Foto
          </button>
        )}
      </div>

      {/* Upload Section */}
      {(!user || isUploading) && (
        <div className="mb-4 p-4 rounded-xl bg-slate-800/50 text-center text-slate-400">
          <p className="text-sm">Silakan login untuk mengupload foto</p>
        </div>
      )}

      {user && !isUploading && (
        <div className="mb-6">
          <p className="text-[10px] text-slate-500 uppercase mb-3">Unggah Foto Sendiri</p>
          <div className="border rounded-2xl bg-slate-800 p-4 cursor-pointer hover:bg-slate-700 transition-colors" onClick={() => document.getElementById("file-upload")?.click()}>
            <div className="w-16 h-16 rounded-xl bg-slate-700 flex items-center justify-center mb-3">
              <Upload className="w-8 h-8 text-amber-400" />
            </div>
            <p className="text-center text-sm text-slate-400">Klik atau seret foto di sini</p>
            <p className="text-xs text-slate-500">JPEG, PNG, WebP • Maksimal 5MB</p>
            <input
              id="file-upload"
              type="file"
              hidden
              onChange={handleFileChange}
            />
          </div>
        </div>
      )}

      {/* Projects Gallery */}
      {projects.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-80 overflow-y-auto">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group border rounded-xl bg-slate-900 overflow-hidden hover:border-amber-500/30 transition-colors cursor-pointer"
              onClick={() => handleGenerate(project)}
            >
              {project.resultImage && project.resultImage.startsWith("http")
                ? (
                  <img
                    src={project.resultImage}
                    alt={project.originalImage}
                    className="w-full h-24 object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-24 bg-slate-700 flex items-center justify-center text-slate-400"
                  >
                    <Loader2 className="w-4 h-4 text-amber-400" />
                  </div>
                )}
              <div className="p-2">
                <p className="font-medium text-sm line-clamp-1 truncate">
                  {project.background}
                </p>
                <p className="text-[8px] text-slate-500 mt-1">AI processed</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No projects state */}
      {projects.length === 0 && user && !isUploading && (
        <div className="mt-6 text-center text-slate-500">
          {"Belum ada foto. "}{"Unggah foto sendiri untuk mendapatkan background Malaysia AI."}
        </div>
      )}

      {/* Gallery Modal */}
      {showGallery && selectedProject && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 rounded-2xl max-w-2xl max-h-90 w-full flex flex-col">
            <img
              src={selectedProject.resultImage}
              alt="AI Photo Result"
              className="w-full h-64 object-cover rounded-t-2xl"
            />
            <div className="p-4">
              <p className="text-[10px] text-slate-500 mb-2">{selectedProject.background}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(selectedProject.resultImage)}
                  className="flex-1 py-1 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 text-sm font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Download
                </button>
                <button
                  onClick={() => setShowGallery(false)}
                  className="flex-1 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}