import z from "zod";

export const AVAILABLE_TAGS = [
  "Productivity",
  "AI",
  "Healthcare",
  "Edutech",
  "Fintech",
  "Web3",
  "Agents",
  "SaaS",
  "E-commerce",
  "Social Media",
  "Developer Tools",
  "Open Source",
  "Machine Learning",
  "Data Science",
  "Blockchain",
  "Crypto",
  "DeFi",
  "NFT",
  "Metaverse",
  "Gaming",
  "AR/VR",
  "Mobile App",
  "Web App",
  "Desktop App",
  "CLI",
  "API",
  "Library",
  "Framework",
  "CMS",
  "ERP",
  "CRM",
  "Automation",
  "Cybersecurity",
  "Privacy",
  "Identity",
  "Auth",
  "Database",
  "Cloud",
  "DevOps",
  "Testing",
  "Monitoring",
  "Analytics",
  "Marketing",
  "SEO",
  "Content",
  "Design",
  "UX/UI",
  "Accessibility",
  "Localization",
  "Education",
  "Research",
  "Environment",
  "Sustainability",
  "Non-profit",
  "Community",
];

export const styleGuideSchema = z.object({
  primary: z.object({
    name: z.string(), // e.g., "Royal Blue"
    hex: z.string(), // e.g., "#4169E1"
  }),
  secondary: z.object({
    name: z.string(),
    hex: z.string(),
  }),
  accent: z.object({
    name: z.string(),
    hex: z.string(),
  }),
  others: z.array(z.object({
    name: z.string(),
    hex: z.string(),
  })),
  fonts: z.array(z.object({
    name: z.string(), // e.g., "Inter", "Roboto"
    family: z.string(), // e.g., "sans-serif", "serif", "monospace"
  })),
});

export type StyleGuideData = z.infer<typeof styleGuideSchema>;