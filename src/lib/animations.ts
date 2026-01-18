import type { Variants, Transition } from "framer-motion";

// Spring configurations
export const springConfig: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

export const softSpring: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 25,
};

export const bouncySpring: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 17,
};

// Transition presets
export const smoothTransition: Transition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

export const quickTransition: Transition = {
  duration: 0.2,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

export const iosEase = [0.32, 0.72, 0, 1] as [number, number, number, number];

// Framer Motion Variants
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: iosEase,
    },
  },
  exit: { 
    opacity: 0, 
    y: 10,
    transition: {
      duration: 0.25,
    },
  },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.25,
      ease: iosEase,
    },
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

export const slideInRight: Variants = {
  initial: { x: "100%", opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 35,
    },
  },
  exit: { 
    x: "100%",
    opacity: 0,
    transition: {
      duration: 0.25,
      ease: iosEase,
    },
  },
};

export const slideInLeft: Variants = {
  initial: { x: "-100%" },
  animate: { 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 35,
    },
  },
  exit: { 
    x: "-100%",
    transition: { duration: 0.25 },
  },
};

export const slideInUp: Variants = {
  initial: { y: "100%" },
  animate: { 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 35,
    },
  },
  exit: { 
    y: "100%",
    transition: { duration: 0.25 },
  },
};

// Stagger children animations
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

export const staggerItemFast: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
};

// Page transition
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.35,
      ease: iosEase,
    },
  },
  exit: { 
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
    },
  },
};

// Card hover animation
export const cardHover = {
  y: -2,
  transition: {
    type: "spring" as const,
    stiffness: 400,
    damping: 25,
  },
};

export const cardTap = {
  scale: 0.995,
  transition: { duration: 0.1 },
};

// Button press animation
export const buttonHover = {
  scale: 1.02,
  transition: { duration: 0.15 },
};

export const buttonTap = {
  scale: 0.97,
  transition: { duration: 0.1 },
};

// Drawer/Sheet animation
export const drawerTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 35,
};

// Sidebar animation
export const sidebarVariants: Variants = {
  expanded: { 
    width: 240,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
  collapsed: { 
    width: 64,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
};

// Active indicator pill
export const activeIndicator: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
    },
  },
};

// Number counter animation config
export const counterTransition: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 30,
};
