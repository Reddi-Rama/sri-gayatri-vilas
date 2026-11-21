import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Sri Gayatri Vilas",
    short_name: "SGV",
    description:
      "A table full of goodness in Vizianagaram. Explore the menu and order from Sri Gayatri Vilas.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#180706",
    theme_color: "#180706",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
