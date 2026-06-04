"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Experience, ExperienceStatus, CATEGORIES } from "@/lib/types";
import { getAllExperiences } from "@/lib/services/experiences";
import {
  getExperiencesByStatus,
  abandonExperience,
  postponeExperience,
  setExperienceStatus,
  getStatusCounts,
} from "@/lib/services/experience-status";
import { getMemories } from "@/lib/services/memories";
import { MemoryWithExperience } from "@/lib/types";
import CategoryBadge from "@/components/CategoryBadge";

type Tab = "in_progress" | "saved" | "memories";

export default function Journal() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("in_progress");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [inProgress, setInProgress] = useState<ExperienceStatus[]>([]);
  const [saved, setSaved] = useState<ExperienceStatus[]>([]);
  const [memories, setMemories] = useState<MemoryWithExperience[]>([]);
  const [counts, setCounts] = useState({ in_progress: 0, saved: 0 });
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [exps, ip, sv, mems, cnt] = await Promise.all([
        getAllExperiences(),
        getExperiencesByStatus("in_progress"),
        getExperiencesByStatus("saved"),
        getMemories(),
        getStatusCounts(),
      ]);
      setExperiences(exps);
      setInProgress(ip);
      setSaved(sv);
      setMemories(mems);
      setCounts(cnt);
    } catch (err) {
      console.error("Failed to load journal data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getExp = (id: string) => experiences.find((e) => e.id === id);

  const handleAbandon = async (experienceId: string) => {
    await abandonExperience(experienceId);
    await loadData();
  };

  const handlePostpone = async (experienceId: string) => {
    if (counts.saved >= 15) {
      setMessage("Your saved list is full. Start or let go of a saved experience to make room.");
      return;
    }
    await postponeExperience(experienceId);
    await loadData();
  };

  const handleComplete = (experienceId: string) => {
    router.push(`/journal/publish/${experienceId}`);
  };

  const handleStartNow = async (experienceId: string) => {
    if (counts.in_progress >= 3) {
      setMessage("Complete or abandon an active experience before starting a new one.");
      return;
    }
    await setExperienceStatus(experienceId, "in_progress");
    await loadData();
    setActiveTab("in_progress");
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "in_progress", label: "In Progress" },
    { key: "saved", label: "Saved" },
    { key: "memories", label: "Memories" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted font-heading text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-normal mb-5">My Journal</h1>

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setMessage(null); }}
            className={`pb-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "text-dark border-b-2 border-dark"
                : "text-muted hover:text-dark"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Message */}
      {message && (
        <div className="mb-4 p-3 bg-amber/10 rounded-lg text-sm text-amber border border-amber/20">
          {message}
        </div>
      )}

      {/* In Progress Tab */}
      {activeTab === "in_progress" && (
        <div className="space-y-4">
          {inProgress.length === 0 && (
            <p className="text-muted italic text-center py-8">
              No experiences in progress. Accept one from Today&apos;s Invitation!
            </p>
          )}
          {inProgress.map((status) => {
            const exp = getExp(status.experience_id);
            if (!exp) return null;
            return (
              <div
                key={status.id}
                className="bg-white rounded-xl card-shadow border-l-4 border-l-amber p-5"
              >
                <h3 className="font-heading text-lg mb-1">{exp.title}</h3>
                <p className="text-dark/60 italic text-sm mb-4">
                  &ldquo;{exp.description}&rdquo;
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAbandon(exp.id)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs text-muted border border-border rounded-lg hover:border-dark/30 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    ABANDON
                  </button>
                  <button
                    onClick={() => handlePostpone(exp.id)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs text-muted border border-border rounded-lg hover:border-dark/30 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                    POSTPONE
                  </button>
                  <button
                    onClick={() => handleComplete(exp.id)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs bg-dark text-white rounded-lg font-medium hover:bg-dark-light transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    COMPLETE
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Saved Tab */}
      {activeTab === "saved" && (
        <div className="space-y-4">
          {saved.length === 0 && (
            <p className="text-muted italic text-center py-8">
              No saved experiences. Save some from Today&apos;s Invitation!
            </p>
          )}
          {saved.map((status) => {
            const exp = getExp(status.experience_id);
            if (!exp) return null;
            return (
              <div
                key={status.id}
                className="bg-white rounded-xl card-shadow p-5"
              >
                <h3 className="font-heading text-lg mb-1">{exp.title}</h3>
                <p className="text-dark/60 text-sm mb-4">{exp.description}</p>
                <button
                  onClick={() => handleStartNow(exp.id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg text-sm text-dark hover:border-dark/30 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  START NOW
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Memories Tab */}
      {activeTab === "memories" && (
        <div className="space-y-4">
          {memories.length === 0 && (
            <p className="text-muted italic text-center py-8">
              No memories yet. Complete an experience to create your first memory!
            </p>
          )}
          {memories.map((memory) => (
            <div
              key={memory.id}
              className="bg-white rounded-xl card-shadow p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <CategoryBadge categoryId={memory.experience.category_id} />
                <span className="text-xs text-muted">
                  {new Date(memory.completed_at).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-heading text-lg mb-2">
                {memory.experience.title}
              </h3>
              {memory.photo_url && (
                <div className="mb-3 rounded-lg overflow-hidden">
                  <img
                    src={memory.photo_url}
                    alt=""
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
              {memory.reflection && (
                <p className="text-dark/60 italic text-sm mb-2">
                  &ldquo;{memory.reflection}&rdquo;
                </p>
              )}
              {memory.location_text && (
                <p className="text-xs text-muted flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {memory.location_text}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
