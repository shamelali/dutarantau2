"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { DashboardOverview } from "@/components/DashboardOverview";
import { SuggestView } from "@/components/SuggestView";
import { EventsView } from "@/components/EventsView";
import { JobsView } from "@/components/JobsView";
import { ConsularView } from "@/components/ConsularView";
import { EmergencyView } from "@/components/EmergencyView";
import { DirectoryView } from "@/components/DirectoryView";
import { ProfileView } from "@/components/ProfileView";
import { AuthModal } from "@/components/AuthModal";

// Modals
import { CreateSuggestModal } from "@/components/CreateSuggestModal";
import { CreateEventModal } from "@/components/CreateEventModal";
import { CreateJobModal } from "@/components/CreateJobModal";
import { CreateEmergencyModal } from "@/components/CreateEmergencyModal";
import { SuggestionDetailModal } from "@/components/SuggestionDetailModal";

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");
  const [globalSearch, setGlobalSearch] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals state
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<number | null>(null);

  // Refresh trigger counter for views when modals submit
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => setRefreshKey((prev) => prev + 1);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Header
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        globalSearch={globalSearch}
        setGlobalSearch={setGlobalSearch}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-8">
        
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
        />

        {/* Center Main Dashboard Content */}
        <main className="flex-1 min-w-0 lg:pl-64">
          {activeTab === "overview" && (
            <DashboardOverview
              setActiveTab={setActiveTab}
              onOpenCreateSuggest={() => setIsSuggestModalOpen(true)}
              onOpenCreateEmergency={() => setIsEmergencyModalOpen(true)}
              onSelectSuggestion={(id) => setSelectedSuggestionId(id)}
            />
          )}

          {activeTab === "suggest" && (
            <SuggestView
              key={refreshKey}
              onOpenCreateSuggest={() => setIsSuggestModalOpen(true)}
              onSelectSuggestion={(id) => setSelectedSuggestionId(id)}
              globalSearch={globalSearch}
            />
          )}

          {activeTab === "events" && (
            <EventsView
              key={refreshKey}
              onOpenCreateEvent={() => setIsEventModalOpen(true)}
              globalSearch={globalSearch}
            />
          )}

          {activeTab === "kerja" && (
            <JobsView
              key={refreshKey}
              onOpenCreateJob={() => setIsJobModalOpen(true)}
              globalSearch={globalSearch}
            />
          )}

          {activeTab === "consular" && (
            <ConsularView globalSearch={globalSearch} />
          )}

          {activeTab === "bantuan" && (
            <EmergencyView
              key={refreshKey}
              onOpenCreateEmergency={() => setIsEmergencyModalOpen(true)}
            />
          )}

          {activeTab === "komuniti" && <DirectoryView />}

          {activeTab === "profil" && <ProfileView />}
        </main>
      </div>

      {/* Global Auth Modal */}
      <AuthModal />

      {/* Create Resource Modals */}
      <CreateSuggestModal
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
        onSuccess={handleRefresh}
      />

      <CreateEventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSuccess={handleRefresh}
      />

      <CreateJobModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        onSuccess={handleRefresh}
      />

      <CreateEmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onSuccess={handleRefresh}
      />

      {/* Suggestion Detail Modal */}
      <SuggestionDetailModal
        suggestionId={selectedSuggestionId}
        onClose={() => setSelectedSuggestionId(null)}
        onUpdated={handleRefresh}
      />
    </div>
  );
}
