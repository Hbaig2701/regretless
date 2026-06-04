"use client";

import { useState, useEffect } from "react";
import { UserState } from "@/lib/types";
import { getUserState, updateProfile } from "@/lib/services/user-state";
import { getCategoryCompletionCounts } from "@/lib/services/memories";
import { generateReflection, getPrimaryFocus } from "@/lib/services/reflection";
import {
  computeVitality,
  getVitalityInputs,
  VitalityBreakdown,
  DEFAULT_CHRONOLOGICAL_AGE,
} from "@/lib/services/vitality";

export default function Profile() {
  const [userState, setUserState] = useState<UserState | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<number, number>>({});
  const [vitality, setVitality] = useState<VitalityBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  async function load() {
    try {
      const [us, cc, memories] = await Promise.all([
        getUserState(),
        getCategoryCompletionCounts(),
        getVitalityInputs(),
      ]);
      setUserState(us);
      setCategoryCounts(cc);
      setVitality(computeVitality(memories, us.age ?? DEFAULT_CHRONOLOGICAL_AGE));
    } catch (err) {
      console.error("Failed to load profile data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading || !userState || !vitality) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted font-heading text-lg">Loading...</div>
      </div>
    );
  }

  const totalExperiences = Object.values(categoryCounts).reduce(
    (sum, c) => sum + c,
    0
  );
  const primaryFocus = getPrimaryFocus(categoryCounts);
  const reflection = generateReflection(categoryCounts);
  const initial = userState.name.charAt(0).toUpperCase();
  const memberSince = new Date(userState.member_since).toLocaleDateString();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-3xl font-normal">Profile</h1>
        <button
          onClick={() => setSettingsOpen(true)}
          aria-label="Edit profile"
          className="p-2 text-muted hover:text-dark transition-colors"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* User Card */}
      <div className="bg-white rounded-xl card-shadow p-5 mb-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-dark flex items-center justify-center text-white font-heading text-xl flex-shrink-0">
          {initial}
        </div>
        <div>
          <h2 className="font-heading text-lg">{userState.name}</h2>
          <p className="text-sm text-muted">
            {userState.location} &middot; Member since {memberSince}
          </p>
        </div>
      </div>

      {/* Cognitive Age Hero */}
      <CognitiveAgeHero vitality={vitality} />

      {/* Score Breakdown */}
      <div className="bg-white rounded-xl card-shadow p-5 mb-4">
        <h3 className="font-heading text-base mb-1">What's driving your score</h3>
        <p className="text-xs text-muted mb-4">
          Every completion adds weighted points. More variety, harder challenges, and
          recent activity bend your cognitive age down.
        </p>
        <BreakdownRow
          label="Weighted volume"
          hint="Time, effort & social challenge"
          value={vitality.components.volume}
          max={60}
        />
        <BreakdownRow
          label="Category diversity"
          hint={`${vitality.diversityPct}% spread across 12 domains`}
          value={vitality.components.diversity}
          max={25}
        />
        <BreakdownRow
          label="Recent activity"
          hint={`${vitality.recentCompletions} in last 30 days`}
          value={vitality.components.recency}
          max={15}
          last
        />
      </div>

      {/* Expansion Report — secondary */}
      <div className="bg-dark rounded-xl card-shadow p-6 mb-4 border-l-4 border-l-amber">
        <h2 className="font-heading text-xl text-white mb-1">
          Expansion Report
        </h2>
        <p className="text-sm text-white/50 mb-4">
          Based on your recent activity.
        </p>
        <div className="flex gap-6">
          <div>
            <div className="text-4xl font-heading text-white">
              {totalExperiences}
            </div>
            <div className="text-[0.65rem] uppercase tracking-wider text-white/40 mt-1">
              Experiences
            </div>
          </div>
          <div>
            <div className="text-3xl font-heading text-white">
              {primaryFocus || "—"}
            </div>
            <div className="text-[0.65rem] uppercase tracking-wider text-white/40 mt-1">
              Primary Focus
            </div>
          </div>
        </div>
      </div>

      {/* AI Reflection */}
      <div className="bg-white rounded-xl card-shadow p-5 border-l-4 border-l-amber">
        <div className="flex items-center gap-2 mb-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C4973B" strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span className="font-medium text-sm">AI Reflection</span>
        </div>
        <p className="text-sm italic text-amber leading-relaxed">
          {reflection}
        </p>
      </div>

      {settingsOpen && userState && (
        <SettingsModal
          userState={userState}
          onClose={() => setSettingsOpen(false)}
          onSaved={async () => {
            setSettingsOpen(false);
            await load();
          }}
        />
      )}
    </div>
  );
}

function CognitiveAgeHero({ vitality }: { vitality: VitalityBreakdown }) {
  const { chronologicalAge, baselineAge, peakAge, cognitiveAge, yearsAhead } =
    vitality;
  const range = baselineAge - peakAge;
  const positionPct =
    range > 0
      ? Math.max(0, Math.min(1, (baselineAge - cognitiveAge) / range)) * 100
      : 0;
  const chronoPct =
    range > 0
      ? Math.max(0, Math.min(1, (baselineAge - chronologicalAge) / range)) * 100
      : 50;
  const aheadLabel =
    yearsAhead < -0.1
      ? `${Math.abs(yearsAhead).toFixed(1)} yrs younger`
      : yearsAhead > 0.1
      ? `${yearsAhead.toFixed(1)} yrs older`
      : "at your real age";

  return (
    <div
      className="rounded-xl card-shadow p-6 mb-4 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #2A2A2A 0%, #3A3A3A 55%, #1F1F1F 100%)",
      }}
    >
      <div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(196,151,59,0.28), transparent 70%)",
        }}
      />
      <div className="relative pointer-events-none">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[0.6rem] uppercase tracking-[0.18em] text-amber/80">
            Cognitive Age
          </span>
          <span className="text-[0.6rem] uppercase tracking-[0.18em] text-white/30">
            · {vitality.tier.label}
          </span>
        </div>
        <p className="text-sm text-white/60 italic mb-4">
          {vitality.tier.description}
        </p>

        <div className="flex items-end gap-4 mb-5">
          <div>
            <div className="text-[5rem] leading-none font-heading text-white tabular-nums">
              {cognitiveAge.toFixed(1)}
            </div>
            <div className="text-xs text-white/40 mt-1">
              vs chronological {chronologicalAge}
            </div>
          </div>
          <div className="pb-2">
            <div
              className="inline-block px-2.5 py-1 rounded-full text-xs font-medium"
              style={{
                background:
                  yearsAhead < 0
                    ? "rgba(196,151,59,0.15)"
                    : "rgba(255,255,255,0.08)",
                color: yearsAhead < 0 ? "#E8C572" : "rgba(255,255,255,0.7)",
                border:
                  yearsAhead < 0
                    ? "1px solid rgba(196,151,59,0.35)"
                    : "1px solid rgba(255,255,255,0.12)",
              }}
            >
              {aheadLabel}
            </div>
          </div>
        </div>

        {/* Timeline scale: peak (left, best) → baseline (right, sedentary) */}
        <div className="relative">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${positionPct}%`,
                background: "linear-gradient(90deg, #E8C572, #C4973B)",
                transition: "width 1.2s ease-out",
              }}
            />
          </div>
          {/* Chronological-age marker */}
          <div
            className="absolute -top-1.5 w-px h-5"
            style={{
              left: `${chronoPct}%`,
              background: "rgba(255,255,255,0.4)",
              transform: "translateX(-0.5px)",
            }}
          />
          <div
            className="absolute -top-6 text-[0.55rem] uppercase tracking-wider text-white/50"
            style={{
              left: `${chronoPct}%`,
              transform: "translateX(-50%)",
            }}
          >
            you
          </div>
          <div className="flex justify-between text-[0.6rem] uppercase tracking-wider text-white/40 mt-2">
            <span>peak {peakAge}</span>
            <span>sedentary {baselineAge}</span>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
          <div>
            <div className="text-[0.55rem] uppercase tracking-widest text-white/40">
              Aging Rate
            </div>
            <div className="font-heading text-white text-base">
              {vitality.agingRate.toFixed(2)}×
            </div>
          </div>
          <div>
            <div className="text-[0.55rem] uppercase tracking-widest text-white/40">
              Vitality Score
            </div>
            <div className="font-heading text-white text-base">
              {vitality.score}
              <span className="text-white/40 text-xs"> / 100</span>
            </div>
          </div>
          <div>
            <div className="text-[0.55rem] uppercase tracking-widest text-white/40">
              Years Saved
            </div>
            <div className="font-heading text-amber text-base">
              {vitality.reductionYears.toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  hint,
  value,
  max,
  last,
}: {
  label: string;
  hint: string;
  value: number;
  max: number;
  last?: boolean;
}) {
  const pct = Math.max(0, Math.min(1, value / max)) * 100;
  return (
    <div className={last ? "" : "mb-4"}>
      <div className="flex items-baseline justify-between mb-1.5">
        <div>
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-muted">{hint}</div>
        </div>
        <div className="text-sm font-heading text-dark tabular-nums">
          {value.toFixed(1)}
          <span className="text-muted text-xs"> / {max}</span>
        </div>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-amber rounded-full"
          style={{ width: `${pct}%`, transition: "width 1s ease-out" }}
        />
      </div>
    </div>
  );
}

function SettingsModal({
  userState,
  onClose,
  onSaved,
}: {
  userState: UserState;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(userState.name);
  const [location, setLocation] = useState(userState.location);
  const [age, setAge] = useState<string>(
    userState.age != null ? String(userState.age) : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const ageNum = age.trim() === "" ? undefined : parseInt(age, 10);
      if (ageNum !== undefined && (Number.isNaN(ageNum) || ageNum < 1 || ageNum > 120)) {
        throw new Error("Age must be between 1 and 120.");
      }
      await updateProfile({
        name: name.trim() || userState.name,
        location: location.trim() || userState.location,
        ...(ageNum !== undefined ? { age: ageNum } : {}),
      });
      onSaved();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save changes.";
      setError(message);
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-md card-shadow p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl">Settings</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-muted hover:text-dark"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <label className="block mb-3">
          <div className="text-xs uppercase tracking-wider text-muted mb-1">Name</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:border-amber"
          />
        </label>

        <label className="block mb-3">
          <div className="text-xs uppercase tracking-wider text-muted mb-1">Location</div>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:border-amber"
          />
        </label>

        <label className="block mb-1">
          <div className="text-xs uppercase tracking-wider text-muted mb-1">
            Chronological age
          </div>
          <input
            type="number"
            inputMode="numeric"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="e.g. 27"
            className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:border-amber"
          />
        </label>
        <p className="text-xs text-muted mb-4">
          Your real age. Cognitive age starts ~5 years above this and drops as you
          complete challenges.
        </p>

        {error && (
          <div className="mb-3 p-2 text-xs text-amber bg-amber/10 border border-amber/30 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2.5 rounded-md border border-border text-sm text-muted hover:text-dark"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-md bg-dark text-white text-sm font-medium disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
