
// Emoji IDs that are allowed for reactions
export const VALID_EMOJI_IDS = [
  "pixel-perfect",
  "code-ninja",
  "design-magic",
  "ship-it",
  "mind-blown",
  "coffee-code",
  "bug-squash",
  "aha-moment",
  "party-parrot",
  "rubber-duck",
  "git-merge",
  "deploy-rocket",
];

// Validate if an emoji ID is allowed
export function isValidEmojiId(emojiId: string): boolean {
  return VALID_EMOJI_IDS.includes(emojiId);
}
