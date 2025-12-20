/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,html}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Hacker Minimalist palette
                'gf-dark': {
                    900: '#0a0a0a',
                    800: '#121212',
                    700: '#1a1a1a',
                    600: '#242424',
                    500: '#2d2d2d',
                },
                'gf-accent': {
                    purple: '#a855f7',
                    blue: '#06b6d4',
                    red: '#ef4444',
                },
            },
            fontFamily: {
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
