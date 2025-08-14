/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: { 
    extend: {
      color: {
        'custom-blue': '#4db8ff',
      },
    } 
  },
  plugins: [],
}
