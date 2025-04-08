/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"], // Or 'media' if you prefer OS-based dark mode
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './app/**/*.{js,ts,jsx,tsx,mdx}',
      './src/**/*.{js,ts,jsx,tsx,mdx}', // Adjust content paths as needed
    ],
    theme: {
      extend: {
        colors: {
           // Map CSS variables to Tailwind color names
          border: 'hsl(var(--border))', // Example if you add --border variable
          input: 'hsl(var(--input))', // Example
          ring: 'hsl(var(--ring))', // Example
          background: 'hsl(var(--background))',
          foreground: 'hsl(var(--foreground))',
          // You might define primary, secondary colors etc. here too
          // based on CSS variables or directly
          primary: {
            DEFAULT: 'hsl(var(--primary))', // Example
            foreground: 'hsl(var(--primary-foreground))', // Example
          },
          // ... other semantic colors if using Shadcn/UI convention
        },
         // If you want to use the Geist fonts mentioned in global.css
        fontFamily: {
          sans: ['var(--font-geist-sans)', 'Arial', 'sans-serif'], // Fallback
          mono: ['var(--font-geist-mono)', 'monospace'], // Fallback
        },
        // Add other theme extensions like borderRadius, keyframes etc. if needed
      },
    },
    plugins: [
       // Add any Tailwind plugins like require('@tailwindcss/forms') if needed
    ],
  }