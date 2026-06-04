"use client";

import { useState, useEffect } from "react";
import { CATEGORIES } from "@/lib/types";
import { getCategoryCompletionCounts } from "@/lib/services/memories";
import { getUserState } from "@/lib/services/user-state";
import {
  computeVitality,
  getVitalityInputs,
  VitalityBreakdown,
  DEFAULT_CHRONOLOGICAL_AGE,
} from "@/lib/services/vitality";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";
import { Radar } from "react-chartjs-2";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

export default function LifeMap() {
  const [categoryCounts, setCategoryCounts] = useState<Record<number, number>>({});
  const [vitality, setVitality] = useState<VitalityBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [counts, memories, us] = await Promise.all([
          getCategoryCompletionCounts(),
          getVitalityInputs(),
          getUserState(),
        ]);
        setCategoryCounts(counts);
        setVitality(
          computeVitality(memories, us.age ?? DEFAULT_CHRONOLOGICAL_AGE)
        );
      } catch (err) {
        console.error("Failed to load category counts:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const labels = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const dataValues = Array.from({ length: 12 }, (_, i) => categoryCounts[i + 1] || 0);
  const maxValue = Math.max(...dataValues, 3);

  const chartData = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: "rgba(196, 151, 59, 0.2)",
        borderColor: "rgba(196, 151, 59, 0.8)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(196, 151, 59, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 1,
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    events: [],
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: maxValue,
        ticks: {
          stepSize: 1,
          display: false,
        },
        grid: {
          color: "rgba(0,0,0,0.06)",
        },
        angleLines: {
          color: "rgba(0,0,0,0.06)",
        },
        pointLabels: {
          font: {
            size: 12,
            family: "-apple-system, BlinkMacSystemFont, sans-serif",
          },
          color: "#2A2A2A",
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted font-heading text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-normal mb-6">Life Map</h1>

      {/* Vitality Banner */}
      {vitality && <VitalityBanner vitality={vitality} />}

      {/* Radar Chart */}
      <div
        className="bg-white rounded-xl card-shadow p-4 mb-6"
        style={{ touchAction: "pan-y" }}
      >
        <Radar data={chartData} options={chartOptions} />
      </div>

      {/* Category Grid */}
      <div className="bg-white rounded-xl card-shadow p-4">
        <div className="grid grid-cols-2 gap-px bg-border">
          {Array.from({ length: 12 }, (_, i) => {
            const catId = i + 1;
            const cat = CATEGORIES[catId];
            const count = categoryCounts[catId] || 0;
            return (
              <div
                key={catId}
                className="bg-white p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted w-5">{catId}</span>
                  <span className="text-sm font-medium">{cat.name}</span>
                </div>
                <span className="text-amber font-bold text-lg">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function VitalityBanner({ vitality }: { vitality: VitalityBreakdown }) {
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
      className="rounded-xl card-shadow p-4 mb-6 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #2A2A2A 0%, #3A3A3A 55%, #1F1F1F 100%)",
      }}
    >
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(196,151,59,0.25), transparent 70%)",
        }}
      />
      <div className="relative pointer-events-none">
        <div className="flex items-end justify-between mb-2">
          <div>
            <div className="text-[0.55rem] uppercase tracking-[0.18em] text-amber/80">
              Cognitive Age
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-heading text-white leading-none tabular-nums">
                {cognitiveAge.toFixed(1)}
              </span>
              <span className="text-[0.65rem] text-white/40">
                vs {chronologicalAge}
              </span>
            </div>
          </div>
          <div
            className="px-2 py-0.5 rounded-full text-[0.65rem] font-medium"
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

        <div className="relative mt-3">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${positionPct}%`,
                background: "linear-gradient(90deg, #E8C572, #C4973B)",
                transition: "width 1.2s ease-out",
              }}
            />
          </div>
          <div
            className="absolute -top-1 w-px h-3.5"
            style={{
              left: `${chronoPct}%`,
              background: "rgba(255,255,255,0.4)",
            }}
          />
          <div className="flex justify-between text-[0.55rem] uppercase tracking-wider text-white/40 mt-1.5">
            <span>peak {peakAge}</span>
            <span>sedentary {baselineAge}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
