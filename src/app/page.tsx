"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Experience, ExperienceStatus, UserState, CATEGORIES } from "@/lib/types";
import { getAllExperiences, getNextInvitation } from "@/lib/services/experiences";
import { getAllStatuses, setExperienceStatus, getStatusCounts } from "@/lib/services/experience-status";
import { getUserState, updateFilters } from "@/lib/services/user-state";
import { getCategoryCompletionCounts } from "@/lib/services/memories";
import { computeVitality, getVitalityInputs, VitalityBreakdown, DEFAULT_CHRONOLOGICAL_AGE } from "@/lib/services/vitality";
import FilterBar from "@/components/FilterBar";
import CategoryBadge from "@/components/CategoryBadge";

const COLORS = {
  cream: "#FAF7F2",
  creamDark: "#F0EBE3",
  amber: "#C4973B",
  dark: "#2A2A2A",
  darkLight: "#3A3A3A",
  muted: "#9B9B9B",
  white: "#FFFFFF",
  border: "#E8E4DE",
};

export default function Home() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [statuses, setStatuses] = useState<ExperienceStatus[]>([]);
  const [userState, setUserState] = useState<UserState | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<number, number>>({});
  const [vitality, setVitality] = useState<VitalityBreakdown | null>(null);
  const [currentCard, setCurrentCard] = useState<{ experience: Experience; isSavedReminder: boolean } | null>(null);
  const [counts, setCounts] = useState({ in_progress: 0, saved: 0 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [swipeState, setSwipeState] = useState<{ x: number; startX: number; swiping: boolean }>({ x: 0, startX: 0, swiping: false });
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const forceNewCard = useRef(false);

  const loadData = useCallback(async () => {
    try {
      const [exps, sts, us, cc, cnt, mems] = await Promise.all([
        getAllExperiences(),
        getAllStatuses(),
        getUserState(),
        getCategoryCompletionCounts(),
        getStatusCounts(),
        getVitalityInputs(),
      ]);
      setExperiences(exps);
      setStatuses(sts);
      setUserState(us);
      setCategoryCounts(cc);
      setCounts(cnt);
      setVitality(computeVitality(mems, us.age ?? DEFAULT_CHRONOLOGICAL_AGE));

      // Check if we have a persisted card that's still valid (not acted upon)
      const persistedId = sessionStorage.getItem("currentInvitationId");
      const statusByExpId = new Map<string, string>();
      sts.forEach((s) => statusByExpId.set(s.experience_id, s.status));

      if (persistedId && !forceNewCard.current) {
        const persistedExp = exps.find((e) => e.id === persistedId);
        const persistedStatus = statusByExpId.get(persistedId);
        // Only reuse if the experience exists and hasn't been acted upon
        if (
          persistedExp &&
          persistedStatus !== "completed" &&
          persistedStatus !== "in_progress" &&
          persistedStatus !== "saved" &&
          persistedStatus !== "skipped"
        ) {
          setCurrentCard({ experience: persistedExp, isSavedReminder: false });
          setMessage(null);
          return;
        }
      }

      // Pick a new card
      const next = getNextInvitation(exps, sts, us, cc);
      setCurrentCard(next);
      if (next) {
        sessionStorage.setItem("currentInvitationId", next.experience.id);
      } else {
        sessionStorage.removeItem("currentInvitationId");
      }
      setMessage(null);
      forceNewCard.current = false;

      if (!next) {
        if (exps.length === 0) {
          setMessage("Loading experiences...");
        } else {
          setMessage("You've explored everything available. New experiences are on the way.");
        }
      }
    } catch (err) {
      console.error("Failed to load data:", err);
      setMessage("Something went wrong. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAction = async (action: "skip" | "save" | "accept", direction?: "left" | "right") => {
    if (!currentCard) return;

    const expId = currentCard.experience.id;

    if (action === "accept" && counts.in_progress >= 3) {
      setMessage("Complete or abandon an active experience before accepting a new one.");
      return;
    }
    if (action === "save" && counts.saved >= 15) {
      setMessage("Your saved list is full. Start or let go of a saved experience to make room.");
      return;
    }

    setExitDirection(direction || (action === "skip" ? "left" : action === "accept" ? "right" : null));
    await new Promise((r) => setTimeout(r, 300));

    try {
      if (action === "skip") {
        await setExperienceStatus(expId, "skipped");
      } else if (action === "save") {
        await setExperienceStatus(expId, "saved");
      } else if (action === "accept") {
        await setExperienceStatus(expId, "in_progress");
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }

    setExitDirection(null);
    setSwipeState({ x: 0, startX: 0, swiping: false });
    sessionStorage.removeItem("currentInvitationId");
    forceNewCard.current = true;
    await loadData();
  };

  const handleFilterChange = async (filters: Record<string, unknown>) => {
    try {
      const updated = await updateFilters(filters as Parameters<typeof updateFilters>[0]);
      setUserState(updated);
      // Filters changed — pick a new card matching new criteria
      const next = getNextInvitation(experiences, statuses, updated, categoryCounts);
      setCurrentCard(next);
      if (next) {
        sessionStorage.setItem("currentInvitationId", next.experience.id);
      } else {
        sessionStorage.removeItem("currentInvitationId");
      }
      if (!next) {
        setMessage("No experiences match your current filters. Try adjusting them.");
      } else {
        setMessage(null);
      }
    } catch (err) {
      console.error("Failed to update filters:", err);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setSwipeState({ x: 0, startX: e.clientX, swiping: true });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!swipeState.swiping) return;
    const deltaX = e.clientX - swipeState.startX;
    setSwipeState((s) => ({ ...s, x: deltaX }));
  };

  const handlePointerUp = () => {
    if (!swipeState.swiping) return;
    const threshold = 100;
    if (swipeState.x > threshold) {
      handleAction("accept", "right");
    } else if (swipeState.x < -threshold) {
      handleAction("skip", "left");
    } else {
      setSwipeState({ x: 0, startX: 0, swiping: false });
    }
  };

  const today = new Date().toISOString().split("T")[0];

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div className="font-heading" style={{ color: COLORS.muted, fontSize: "1.125rem" }}>Loading...</div>
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    position: "relative",
    zIndex: 1,
    backgroundColor: COLORS.white,
    borderRadius: "1rem",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)",
    border: `1px solid ${COLORS.border}`,
    overflow: "hidden",
    transition: "transform 0.3s ease, opacity 0.3s ease",
    touchAction: "pan-y",
    ...(swipeState.swiping && !exitDirection
      ? {
          transform: `translateX(${swipeState.x}px) rotate(${swipeState.x * 0.05}deg)`,
          opacity: 1 - Math.abs(swipeState.x) / 500,
          transition: "none",
        }
      : {}),
    ...(exitDirection === "left"
      ? { transform: "translateX(-120%) rotate(-10deg)", opacity: 0 }
      : {}),
    ...(exitDirection === "right"
      ? { transform: "translateX(120%) rotate(10deg)", opacity: 0 }
      : {}),
  };

  const btnBase: React.CSSProperties = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.75rem",
    borderRadius: "0.5rem",
    fontSize: "0.8rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s ease",
    border: `1px solid ${COLORS.border}`,
    backgroundColor: "transparent",
    color: COLORS.muted,
  };

  return (
    <div>
      {/* Filter Bar — needs high z-index to sit above the swipe card */}
      {userState && (
        <div style={{ position: "relative", zIndex: 100 }}>
        <FilterBar
          filterTime={userState.filter_time}
          filterPrice={userState.filter_price}
          filterParty={userState.filter_party}
          filterEnv={userState.filter_env}
          onFilterChange={handleFilterChange}
        />
        </div>
      )}

      {/* Date + Vitality Chip */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1rem", marginBottom: "0.25rem" }}>
        <p style={{ color: COLORS.amber, fontSize: "0.875rem", letterSpacing: "0.05em", margin: 0 }}>
          {today}
        </p>
        {vitality && (
          <a
            href="/profile"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.25rem 0.6rem 0.25rem 0.35rem",
              borderRadius: "9999px",
              background: "linear-gradient(135deg, #2A2A2A, #3A3A3A)",
              color: COLORS.white,
              fontSize: "0.7rem",
              fontWeight: 500,
              letterSpacing: "0.04em",
              textDecoration: "none",
              boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
            }}
            title={`Cognitive Age ${vitality.cognitiveAge.toFixed(1)} · ${vitality.tier.label}`}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "1.7rem",
                height: "1.4rem",
                padding: "0 0.4rem",
                borderRadius: "9999px",
                background: "linear-gradient(135deg, #C4973B, #E8C572)",
                color: COLORS.dark,
                fontWeight: 700,
                fontSize: "0.7rem",
                fontFamily: "Georgia, serif",
              }}
            >
              {vitality.cognitiveAge.toFixed(1)}
            </span>
            <span style={{ color: "rgba(255,255,255,0.85)" }}>
              cog age
            </span>
          </a>
        )}
      </div>
      <h1 className="font-heading" style={{ fontSize: "2rem", fontWeight: "normal", marginBottom: "1.5rem", color: COLORS.dark }}>
        Today&apos;s Invitation
      </h1>

      {/* Message */}
      {message && !currentCard && (
        <div style={{ backgroundColor: COLORS.white, borderRadius: "1rem", padding: "2rem", textAlign: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", border: `1px solid ${COLORS.border}` }}>
          <p style={{ color: COLORS.muted, fontStyle: "italic" }}>{message}</p>
        </div>
      )}

      {/* Constraint messages */}
      {message && currentCard && (
        <div style={{ marginBottom: "1rem", padding: "0.75rem", backgroundColor: "#C4973B1A", borderRadius: "0.5rem", fontSize: "0.875rem", color: COLORS.amber, border: "1px solid #C4973B33" }}>
          {message}
        </div>
      )}

      {/* Experience Card */}
      {currentCard && (
        <div
          ref={cardRef}
          style={cardStyle}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Category Banner */}
          <div style={{ backgroundColor: COLORS.creamDark, padding: "2.5rem 1.5rem", textAlign: "center" }}>
            <p className="font-heading" style={{ fontStyle: "italic", color: "rgba(42,42,42,0.5)", fontSize: "1.25rem" }}>
              {CATEGORIES[currentCard.experience.category_id]?.name}
            </p>
          </div>

          {/* Card Content */}
          <div style={{ padding: "1.5rem" }}>
            {/* Metadata Row */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              <CategoryBadge categoryId={currentCard.experience.category_id} truncate />
              <span style={{ fontSize: "0.75rem", color: COLORS.muted, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                {currentCard.experience.time_estimate}
              </span>
              <span style={{ fontSize: "0.75rem", color: COLORS.muted }}>
                ${currentCard.experience.price_estimate}
              </span>
              <span style={{ fontSize: "0.75rem", color: COLORS.muted, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                {currentCard.experience.party_size}
              </span>
            </div>

            {/* Saved badge */}
            {currentCard.isSavedReminder && (
              <span style={{ display: "inline-block", marginBottom: "0.5rem", padding: "0.125rem 0.5rem", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", backgroundColor: "#C4973B1A", color: COLORS.amber, borderRadius: "9999px", fontWeight: 500 }}>
                Saved
              </span>
            )}

            {/* Title */}
            <h2 className="font-heading" style={{ fontSize: "1.5rem", marginBottom: "0.75rem", color: COLORS.dark }}>
              {currentCard.experience.title}
            </h2>

            {/* Description */}
            <p style={{ color: "rgba(42,42,42,0.7)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              {currentCard.experience.description}
            </p>

            {/* Action Row */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => handleAction("skip", "left")} style={btnBase}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                SKIP
              </button>
              <button
                onClick={() => handleAction("save")}
                disabled={counts.saved >= 15}
                style={{ ...btnBase, opacity: counts.saved >= 15 ? 0.4 : 1 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                SAVE
              </button>
              <button
                onClick={() => handleAction("accept", "right")}
                disabled={counts.in_progress >= 3}
                style={{
                  ...btnBase,
                  backgroundColor: COLORS.dark,
                  color: COLORS.white,
                  border: "none",
                  opacity: counts.in_progress >= 3 ? 0.4 : 1,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                ACCEPT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
