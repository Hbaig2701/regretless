"use client";

export default function Community() {
  return (
    <div>
      <h1 className="font-heading text-3xl font-normal mb-6">Community</h1>
      <div className="bg-white rounded-xl card-shadow p-8 text-center">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9B9B9B"
          strokeWidth="1.5"
          className="mx-auto mb-4"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <p className="text-muted italic">
          Community feed coming soon. Shared memories from other members will
          appear here.
        </p>
      </div>
    </div>
  );
}
