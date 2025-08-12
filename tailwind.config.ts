import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
          950: 'var(--color-primary-950)',
        }
      },
      fontFamily: {
        'grenze-gotisch': 'var(--font-grenze-gotisch)',
        'gluten': 'var(--font-gluten)',
        'fredoka': 'var(--font-fredoka)',
        'newsreader': 'var(--font-newsreader)',
        'playwrite-us-modern': 'var(--font-playwrite-us-modern)',
        'phudu': 'var(--font-phudu)',
        'playfair': 'var(--font-playfair)',
        'michroma': 'var(--font-michroma)',
        'advent-pro': 'var(--font-advent-pro)',
        'inter': 'var(--font-inter)',
      }
    }
  }
} satisfies Config;
