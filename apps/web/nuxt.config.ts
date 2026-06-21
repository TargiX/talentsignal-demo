import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2026-06-18",
  modules: ["@pinia/nuxt", "shadcn-nuxt"],
  css: ["~/assets/styles/main.css"],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? (process.env.VERCEL ? "" : "http://localhost:4000")
    }
  },
  devtools: { enabled: false },
  shadcn: {
    prefix: "",
    componentDir: "@/components/ui"
  },
  typescript: {
    strict: true
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
