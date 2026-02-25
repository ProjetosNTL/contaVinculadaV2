import type { Config } from 'tailwindcss'

export default {
    darkMode: 'class',
    content: [
        './app/**/*.{vue,js,ts,jsx,tsx}',
        './components/**/*.{vue,js,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './plugins/**/*.{js,ts}',
        './app.vue'
    ],
    theme: {
        extend: {},
    },
    plugins: [],
} satisfies Config
