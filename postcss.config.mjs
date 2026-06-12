import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prefixPluginPath = path.resolve(__dirname, "postcss-custom-prefix.js");

const config = {
  plugins: [
    "@tailwindcss/postcss",
    prefixPluginPath
  ],
};

export default config;
