// @ts-check
import { defineConfig } from "astro/config";

import solidJs from "@astrojs/solid-js";

import react from "@astrojs/react";

import svelte from "@astrojs/svelte";

import vue from "@astrojs/vue";

import preact from "@astrojs/preact";

// https://astro.build/config
export default defineConfig({
  integrations: [solidJs(), react(), svelte(), vue(), preact()]
});