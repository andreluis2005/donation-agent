/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./app/**/*.{js,ts,jsx,tsx}",
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: {
				blue: {
					400: "#4B6CB7", // Light blue for hover states, accents
					500: "#1E3A8A", // Primary darker blue for buttons, highlights
					600: "#1E40AF", // Darker blue for hover
					700: "#182848", // Gradient dark blue
					900: "#1E1B4B", // Deep blue for backgrounds
					950: "#0F172A", // Very dark blue for dark mode backgrounds
				},
			},
		},
	},
	plugins: [],
};
