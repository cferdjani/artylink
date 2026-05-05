import { dirname } from "path";
import { fileURLToPath } from "url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const config = {
  plugins: {
    // Force Tailwind v4 to resolve/scan from this Next.js app directory even if
    // the repo has another Node project and lockfiles above.
    "@tailwindcss/postcss": { base: projectRoot },
  },
};

export default config;
