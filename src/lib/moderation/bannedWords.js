import fs from "fs";
import path from "path";

let bannedSet = null;

function loadBannedWords() {
  if (bannedSet) return bannedSet;

  const filePath = path.join(process.cwd(), "src", "lib", "moderation", "en.txt");
  const raw = fs.readFileSync(filePath, "utf8");

  bannedSet = new Set(
    raw
      .split(/\r?\n/)
      .map((w) => w.trim().toLowerCase())
      .filter(Boolean)
  );

  return bannedSet;
}

// tokenize text into words, normalize, check membership
export function containsBannedWord(text) {
  if (!text) return false;

  const set = loadBannedWords();
  const words = String(text).toLowerCase().match(/[a-z0-9']+/g) || [];

  for (const w of words) {
    if (set.has(w)) return true;
  }
  return false;
}

export function reviewIsClean(review) {
  return !containsBannedWord(review.title) && !containsBannedWord(review.body);
}
