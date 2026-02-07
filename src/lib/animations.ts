/**
 * Centralized animation configuration for Framer Motion
 * Ensures consistent animation timing and easing across the application
 */

import { Variants } from "framer-motion";

// Animation durations (in seconds)
export const ANIMATION_DURATION = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.4,
} as const;

// Custom easing curves
export const EASING = {
  smooth: [0.25, 0.1, 0.25, 1] as const,
  spring: [0.5, 1, 0.89, 1] as const,
} as const;

// Stagger delay for list animations (in seconds)
export const STAGGER_DELAY = 0.05;

/**
 * Message entry animation variants
 * Used for individual messages appearing in the chat
 */
export const messageVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION.slow,
      ease: EASING.smooth,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: ANIMATION_DURATION.fast },
  },
};

/**
 * Reduced motion variants for accessibility
 * Only animates opacity, no movement
 */
export const messageVariantsReduced: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: ANIMATION_DURATION.fast },
  },
  exit: { opacity: 0 },
};

/**
 * Container variants for message list
 * Enables stagger effect for multiple messages
 */
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: STAGGER_DELAY,
    },
  },
};

/**
 * Message hover effect variants
 */
export const messageHoverVariants: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.005,
    transition: { duration: ANIMATION_DURATION.fast },
  },
};

/**
 * Typing indicator dot animation
 */
export const typingDotVariants: Variants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/**
 * Online status badge animation
 */
export const presenceBadgeVariants: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
    },
  },
  exit: { scale: 0, opacity: 0 },
};

/**
 * Emoji reaction animation
 */
export const reactionVariants: Variants = {
  initial: { scale: 0, rotate: -10 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20,
    },
  },
  hover: {
    scale: 1.2,
    transition: { duration: ANIMATION_DURATION.fast },
  },
  tap: { scale: 0.9 },
};

/**
 * Sidebar expand/collapse animation
 */
export const sidebarVariants: Variants = {
  collapsed: {
    width: 0,
    opacity: 0,
    transition: { duration: ANIMATION_DURATION.normal },
  },
  expanded: {
    width: 320,
    opacity: 1,
    transition: { duration: ANIMATION_DURATION.normal },
  },
};

/**
 * Send button pulse animation
 */
export const sendButtonVariants: Variants = {
  idle: { scale: 1 },
  ready: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
  tap: { scale: 0.95 },
};
