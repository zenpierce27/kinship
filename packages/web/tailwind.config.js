/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tier: {
          stranger: '#6b7280',
          acquaintance: '#9ca3af',
          contact: '#3b82f6',
          colleague: '#22c55e',
          friend: '#06b6d4',
          close_friend: '#8b5cf6',
          inner_circle: '#ec4899',
        }
      }
    }
  },
  plugins: [],
}
