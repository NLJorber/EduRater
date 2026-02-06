"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";

const AVATAR_OPTIONS = [
  { seed: "Felix", style: "avataaars-neutral" },
  { seed: "Luna", style: "avataaars-neutral" },
  { seed: "Milo", style: "avataaars-neutral" },
  { seed: "Zoe", style: "avataaars-neutral" },
  { seed: "Nova", style: "avataaars-neutral" },
  { seed: "Aria", style: "avataaars-neutral" },
  { seed: "Leo", style: "avataaars-neutral" },
  { seed: "Kai", style: "avataaars-neutral" },
  { seed: "Ivy", style: "avataaars-neutral" },
  { seed: "Ezra", style: "avataaars-neutral" },
  { seed: "Mira", style: "avataaars-neutral" },
  { seed: "Riley", style: "avataaars-neutral" },
  { seed: "Theo", style: "avataaars-neutral" },
  { seed: "Emery", style: "fun-emoji" },
  { seed: "Eliza", style: "fun-emoji" },
  { seed: "Sunny", style: "thumbs" },
  { seed: "Parker", style: "thumbs" },
  { seed: "Quinn", style: "thumbs" },
];
const DEFAULT_OPTION = AVATAR_OPTIONS[0];

function buildAvatarUrl(seed, style) {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(
    seed
  )}`;
}

export default function ProfileAvatarPicker({ session }) {
  const userId = session?.user?.id;
  const [avatarSeed, setAvatarSeed] = useState(DEFAULT_OPTION.seed);
  const [avatarStyle, setAvatarStyle] = useState(DEFAULT_OPTION.style);
  const [loading, setLoading] = useState(Boolean(userId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [displayName, setDisplayName] = useState("User");

  const avatarUrl = useMemo(
    () => buildAvatarUrl(avatarSeed, avatarStyle),
    [avatarSeed, avatarStyle]
  );

  useEffect(() => {
    const fetchAvatar = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabaseClient
        .from("profile_settings")
        .select("avatar_seed, avatar_style, display_name")
        .eq("user_id", userId)
        .maybeSingle();

      if (fetchError) {
        setError(fetchError.message);
      } else if (data) {
        const match = AVATAR_OPTIONS.find(
          (option) =>
            option.seed === data.avatar_seed &&
            option.style === data.avatar_style
        );
        if (match) {
          setAvatarSeed(match.seed);
          setAvatarStyle(match.style);
        }
        if (data.display_name) {
          setDisplayName(data.display_name);
        }
      }

      setLoading(false);
    };

    fetchAvatar();
  }, [userId]);

  const handleSelect = async (option) => {
    if (!userId || saving) return;
    if (option.seed === avatarSeed && option.style === avatarStyle) return;

    setAvatarSeed(option.seed);
    setAvatarStyle(option.style);
    setSaving(true);
    setError("");

    const { error: upsertError } = await supabaseClient
      .from("profile_settings")
      .upsert(
        {
          user_id: userId,
          avatar_style: option.style,
          avatar_seed: option.seed,
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      setError(upsertError.message);
    }

    setSaving(false);
  };

  return (
    <section className="mb-6 rounded-2xl border border-brand-brown/40 bg-white/70 p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 overflow-hidden rounded-full border border-brand-brown bg-white">
            <img src={avatarUrl} alt="Selected avatar" className="h-full w-full" />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-brown">
              Choose your avatar
            </p>
            <p className="text-xs text-brand-brown/70">
              You can only pick from the defaults.
            </p>
            <p className="text-xs text-brand-brown/80">
              Display name: <span className="font-semibold">{displayName}</span>
            </p>
          </div>
        </div>

        {loading ? (
          <span className="text-xs text-brand-brown/70">Loading avatars...</span>
        ) : null}
        {saving ? (
          <span className="text-xs text-brand-brown/70">Saving...</span>
        ) : null}
        {error ? (
          <span className="text-xs text-red-600">Error: {error}</span>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
        {AVATAR_OPTIONS.map((option) => {
          const url = buildAvatarUrl(option.seed, option.style);
          const isSelected =
            option.seed === avatarSeed && option.style === avatarStyle;
          return (
            <button
              key={`${option.style}-${option.seed}`}
              type="button"
              onClick={() => handleSelect(option)}
              className={`group flex items-center justify-center rounded-xl border p-2 transition ${
                isSelected
                  ? "border-brand-orange bg-brand-orange/20"
                  : "border-brand-brown/30 bg-white hover:border-brand-brown"
              }`}
              aria-label={`Select avatar ${option.seed}`}
            >
              <img
                src={url}
                alt=""
                className="h-12 w-12 rounded-full bg-white"
                loading="lazy"
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
