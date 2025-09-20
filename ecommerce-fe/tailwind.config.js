/** @type {import('tailwindcss').Config} */
export default {
content: [
'./index.html',
'./src/**/*.{js,jsx,ts,tsx}',
],
theme: {
extend: {
colors: {
base: {
bg: '#0a0a0a',
card: '#121212',
soft: '#1b1b1b',
line: '#262626',
text: '#e6e6e6',
mute: '#a3a3a3'
},
brand: {
50: '#e9f3ff',
100: '#d3e7ff',
500: '#3b82f6',
600: '#2563eb'
}
},
borderRadius: {
xl2: '1.25rem'
},
boxShadow: {
soft: '0 8px 24px rgba(0,0,0,0.25)'
}
},
},
darkMode: 'class',
plugins: [],
}