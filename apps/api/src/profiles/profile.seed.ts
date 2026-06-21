import { DiscoveryProfile } from "./profile.types";

export const seededProfiles: DiscoveryProfile[] = [
  {
    id: "pf-lina",
    handle: "lina.park",
    displayName: "Lina Park",
    city: "Berlin, Germany",
    intent: "Looking to collaborate on a project",
    bio: "Product designer with 6+ years of experience building user-centered products for B2B SaaS and marketplaces. Passionate about design systems, accessibility, and creating delightful user experiences.",
    compatibility: 92,
    trustScore: 96,
    tags: ["Figma", "User Research", "Design Systems", "Prototyping", "Accessibility"],
    lastActive: "2 min ago",
    avatarTone: "coral"
  },
  {
    id: "pf-mateo",
    handle: "mateo.alvarez",
    displayName: "Mateo Alvarez",
    city: "Madrid, Spain",
    intent: "Frontend collaboration",
    bio: "Frontend engineer focused on product-led teams, reviewable UI contracts, and clean Nuxt component architecture.",
    compatibility: 88,
    trustScore: 89,
    tags: ["Vue", "TypeScript", "Nuxt"],
    lastActive: "15 min ago",
    avatarTone: "emerald"
  },
  {
    id: "pf-aisha",
    handle: "aisha.okafor",
    displayName: "Aisha Okafor",
    city: "Lagos, Nigeria",
    intent: "Backend systems",
    bio: "Backend engineer comfortable with NestJS, SQL data models, queues, and reliable product infrastructure.",
    compatibility: 85,
    trustScore: 92,
    tags: ["NestJS", "PostgreSQL", "Redis"],
    lastActive: "Online now",
    avatarTone: "indigo"
  },
  {
    id: "pf-ethan",
    handle: "ethan.lin",
    displayName: "Ethan Lin",
    city: "Singapore",
    intent: "DevOps collaboration",
    bio: "DevOps engineer who likes practical deployment workflows, observability, and low-friction team operations.",
    compatibility: 80,
    trustScore: 88,
    tags: ["AWS", "Terraform", "Kubernetes"],
    lastActive: "45 min ago",
    avatarTone: "emerald"
  },
  {
    id: "pf-sofia",
    handle: "sofia.rossi",
    displayName: "Sofia Rossi",
    city: "Milan, Italy",
    intent: "Product strategy",
    bio: "Product manager looking for builders who can translate early discovery into working product increments.",
    compatibility: 78,
    trustScore: 86,
    tags: ["Strategy", "Roadmaps", "Analytics"],
    lastActive: "1h ago",
    avatarTone: "coral"
  }
];
