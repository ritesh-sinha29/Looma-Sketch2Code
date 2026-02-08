// Custom emoji configuration for Looma chat
// These are unique, fun, design/development-themed emoji

export interface EmojiConfig {
  id: string;
  name: string;
  unicode: string; // Fallback Unicode emoji
  imageUrl?: string; // Optional custom image (can be added later)
  description: string;
}

export const EMOJI_LIST: EmojiConfig[] = [
  {
    id: "pixel-perfect",
    name: "Pixel Perfect",
    unicode: "🎯",
    description: "Perfect alignment celebration",
  },
  {
    id: "code-ninja",
    name: "Code Ninja",
    unicode: "🥷",
    description: "Ninja-level coding skills",
  },
  {
    id: "design-magic",
    name: "Design Magic",
    unicode: "✨",
    description: "Magical design work",
  },
  {
    id: "ship-it",
    name: "Ship It!",
    unicode: "🚢",
    description: "Ready to deploy",
  },
  {
    id: "mind-blown",
    name: "Mind Blown",
    unicode: "🤯",
    description: "Amazing idea or solution",
  },
  {
    id: "coffee-code",
    name: "Coffee Code",
    unicode: "☕",
    description: "Fueling the coding session",
  },
  {
    id: "bug-squash",
    name: "Bug Squash",
    unicode: "🐛",
    description: "Crushing those bugs",
  },
  {
    id: "aha-moment",
    name: "Aha Moment",
    unicode: "💡",
    description: "Lightbulb moment",
  },
  {
    id: "party-parrot",
    name: "Party Parrot",
    unicode: "🦜",
    description: "Celebration time",
  },
  {
    id: "rubber-duck",
    name: "Rubber Duck",
    unicode: "🦆",
    description: "Debugging helper",
  },
  {
    id: "git-merge",
    name: "Git Merge",
    unicode: "🔀",
    description: "Successful merge",
  },
  {
    id: "deploy-rocket",
    name: "Deploy Rocket",
    unicode: "🚀",
    description: "Launching to production",
  },
];

// Helper to get emoji by ID
export function getEmojiById(id: string): EmojiConfig | undefined {
  return EMOJI_LIST.find((emoji) => emoji.id === id);
}

// Helper to validate emoji ID
export function isValidEmoji(id: string): boolean {
  return EMOJI_LIST.some((emoji) => emoji.id === id);
}

// Get all emoji IDs (for server-side validation)
export function getAllEmojiIds(): string[] {
  return EMOJI_LIST.map((emoji) => emoji.id);
}
