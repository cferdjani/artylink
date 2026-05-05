import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "ArtyLink Platform",
        short_name: "ArtyLink",
        description: "Trouvez les meilleurs artisans près de chez vous.",
        start_url: "/",
        display: "standalone",
        background_color: "#f8fafc",
        theme_color: "#2563eb",
        icons: [
            {
                src: "/favicon.ico",
                sizes: "any",
                type: "image/x-icon",
            },
            // Note: Add proper 192x192 and 512x512 icons to /public for production PWA
        ],
    };
}
