import { Variants } from "framer-motion";

// Card Animation Variants
export const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 18,
      mass: 0.8
    }
  },
  hover: {
    y: -4,
    scale: 1.01,
    transition: { 
      type: "spring", 
      stiffness: 400,
      damping: 25
    }
  },
  tap: { 
    scale: 0.98 
  },
  dragging: { 
    opacity: 0.6, 
    scale: 1.05,
    rotate: 2,
    transition: {
      duration: 0.2
    }
  }
};

// Badge Animation Variants
export const badgeVariants: Variants = {
  initial: { 
    scale: 0.9, 
    opacity: 0 
  },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300
    }
  },
  hover: { 
    scale: 1.05, 
    y: -2,
    transition: {
      duration: 0.2
    }
  }
};

// Quick Action Button Variants (stagger animation)
export const quickActionVariants = {
  hidden: { 
    opacity: 0, 
    x: -10,
    scale: 0.8
  },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { 
      delay: i * 0.05,
      type: "spring",
      stiffness: 300
    }
  })
};

// Avatar Animation
export const avatarVariants: Variants = {
  initial: {
    scale: 1
  },
  hover: {
    scale: 1.15,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15
    }
  },
  tap: {
    scale: 0.95
  }
};

// Priority Badge Pulse (for critical tasks)
export const pulseBadgeVariants: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Deadline Urgency Animation (for overdue/urgent)
export const urgencyVariants: Variants = {
  pulse: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  glow: {
    boxShadow: [
      "0 0 0px rgba(239, 68, 68, 0)",
      "0 0 8px rgba(239, 68, 68, 0.4)",
      "0 0 0px rgba(239, 68, 68, 0)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Dialog Animation
export const dialogVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      bounce: 0.25,
      duration: 0.4
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.2
    }
  }
};

// Stagger children animation
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

export const staggerItem: Variants = {
  hidden: { 
    opacity: 0, 
    y: 10 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

// Confetti/Success Animation (for task completion)
export const successVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 0
  },
  animate: {
    scale: [0, 1.2, 1],
    opacity: [0, 1, 1],
    transition: {
      duration: 0.5,
      times: [0, 0.6, 1],
      ease: "easeOut"
    }
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
};
