"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Experience } from "@/lib/types";
import { getExperienceById } from "@/lib/services/experiences";
import { setExperienceStatus } from "@/lib/services/experience-status";
import { createMemory, uploadPhoto } from "@/lib/services/memories";

export default function PublishMemory() {
  const router = useRouter();
  const params = useParams();
  const experienceId = params.id as string;

  const [experience, setExperience] = useState<Experience | null>(null);
  const [reflection, setReflection] = useState("");
  const [locationText, setLocationText] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [shared, setShared] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const exp = await getExperienceById(experienceId);
        setExperience(exp);
      } catch (err) {
        console.error("Failed to load experience:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [experienceId]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("Please select a JPEG or PNG image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be under 10MB.");
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handlePublish = async () => {
    if (!experience) return;
    setPublishing(true);

    try {
      let photoUrl: string | undefined;

      // Upload photo if selected
      if (photoFile) {
        photoUrl = await uploadPhoto(photoFile);
      }

      // Create memory
      await createMemory({
        experience_id: experience.id,
        reflection: reflection || undefined,
        location_text: locationText || undefined,
        photo_url: photoUrl,
        shared,
      });

      // Mark experience as completed
      await setExperienceStatus(experience.id, "completed");

      // Navigate to journal memories tab
      router.push("/journal?tab=memories");
    } catch (err) {
      console.error("Failed to publish memory:", err);
      alert("Failed to publish memory. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted font-heading text-lg">Loading...</div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="text-center py-8">
        <p className="text-muted">Experience not found.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-muted hover:text-dark mb-6 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </button>

      <div className="bg-white rounded-xl card-shadow p-6">
        {/* Title */}
        <h1 className="font-heading text-2xl mb-2">{experience.title}</h1>
        <p className="text-dark/60 italic text-sm mb-6">
          &ldquo;{experience.description}&rdquo;
        </p>

        {/* Photo Upload */}
        <label className="block mb-5 cursor-pointer">
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={handlePhotoSelect}
            className="hidden"
          />
          {photoPreview ? (
            <div className="rounded-lg overflow-hidden border border-border">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center gap-2 hover:border-amber/50 transition-colors">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9B9B9B" strokeWidth="1.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
              <span className="text-sm text-muted">Add Photo</span>
            </div>
          )}
        </label>

        {/* Location */}
        <div className="mb-5">
          <div className="flex items-center gap-2 border border-border rounded-lg px-4 py-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B9B9B" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <input
              type="text"
              placeholder="Location"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted"
            />
          </div>
        </div>

        {/* Reflection */}
        <div className="mb-5">
          <textarea
            placeholder="Reflection..."
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            rows={4}
            className="w-full border border-border rounded-lg px-4 py-3 bg-transparent outline-none text-sm placeholder:text-muted resize-none focus:border-amber/50 transition-colors"
          />
        </div>

        {/* Share toggle */}
        <div className="mb-6">
          <label className="flex items-center gap-3 bg-cream rounded-lg px-4 py-3 cursor-pointer">
            <input
              type="checkbox"
              checked={shared}
              onChange={(e) => setShared(e.target.checked)}
              className="w-4 h-4 rounded border-border accent-amber"
            />
            <div>
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                Share to Community?
              </div>
              <p className="text-xs text-muted">
                If unchecked, this remains private.
              </p>
            </div>
          </label>
        </div>

        {/* Publish Button */}
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="w-full py-3.5 bg-dark text-white rounded-lg font-medium text-sm hover:bg-dark-light transition-colors disabled:opacity-50"
        >
          {publishing ? "Publishing..." : "Publish Memory"}
        </button>
      </div>
    </div>
  );
}
