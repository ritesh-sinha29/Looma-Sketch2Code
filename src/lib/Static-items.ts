import z from "zod";

// Only contains tags that are realted to web / APP .
export const AVAILABLE_TAGS = [
  "Productivity",
  "Edutech",
  "Healthcare",
  "Fintech",
  "E-commerce",
  "Social Media",
  "Marketing",
  "Community",
  "Sustainability",
  "SaaS",
  "Web App",
  "Mobile App",
  "Desktop App",
  "Dashboard",
  "Landing Page",
  "Portfolio",
  "Developer Tools",
  "Open Source",
  "Startup",
  "Enterprise",
  "Design",
  "UX/UI",
  "Auth",
  "Analytics",
  "Automation",
  "CMS",
  "CRM",
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