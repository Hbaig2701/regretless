import { CATEGORIES } from "@/lib/types";

/**
 * Rule-based AI reflection for V1.
 * Isolated in a single function so it can be replaced with a Claude API call later.
 *
 * Future LLM upgrade: Replace this function body with a Claude API call that receives
 * the user's full experience history, category distribution, and recent completions,
 * and returns a personalized reflection paragraph.
 */
export function generateReflection(
  categoryCounts: Record<number, number>
): string {
  const totalExperiences = Object.values(categoryCounts).reduce(
    (sum, c) => sum + c,
    0
  );

  if (totalExperiences === 0) {
    return "You haven't completed any experiences yet. Start with today's invitation to begin mapping your life!";
  }

  // Find top category
  let topCatId = 1;
  let topCount = 0;
  let lowestCatId = 1;
  let lowestCount = Infinity;
  let allHaveAtLeastOne = true;

  for (let i = 1; i <= 12; i++) {
    const count = categoryCounts[i] || 0;
    if (count > topCount) {
      topCount = count;
      topCatId = i;
    }
    if (count < lowestCount) {
      lowestCount = count;
      lowestCatId = i;
    }
    if (count === 0) allHaveAtLeastOne = false;
  }

  const topCategory = CATEGORIES[topCatId].name;
  const suggestedCategory = CATEGORIES[lowestCatId].name;

  if (allHaveAtLeastOne) {
    return `You're building a well-rounded life map! Keep pushing into ${suggestedCategory} to deepen that area.`;
  }

  return `You seem to be gravitating towards ${topCategory}. Consider balancing this by trying something from the '${suggestedCategory}' category next week.`;
}

/**
 * Get the primary focus category (the one with most completions)
 */
export function getPrimaryFocus(
  categoryCounts: Record<number, number>
): string | null {
  let topCatId = 0;
  let topCount = 0;

  for (let i = 1; i <= 12; i++) {
    const count = categoryCounts[i] || 0;
    if (count > topCount) {
      topCount = count;
      topCatId = i;
    }
  }

  if (topCount === 0) return null;
  return CATEGORIES[topCatId].short;
}
