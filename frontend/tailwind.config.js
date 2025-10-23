export default {
  content: ["./index.html","./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
  extend: {
    fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui"] },
    colors: {
      brand:  { 50:"#eef6ff", 100:"#d9eaff", 200:"#b9d8ff", 300:"#8ac0ff", 400:"#59a5ff", 500:"#2d8cff", 600:"#0D6EFD", 700:"#0B5ED7", 800:"#0a4ab0", 900:"#083a8a" },
      accent: { 50:"#f4f2ff", 100:"#e7e1ff", 200:"#cfc3ff", 300:"#b2a1ff", 400:"#947dff", 500:"#7a5bff", 600:"#5f3bff", 700:"#4b2fcb", 800:"#3a259e", 900:"#2a1a73" },
    },
    boxShadow: {
      soft: "0 10px 30px -12px rgba(0,0,0,.20)",
      card: "0 8px 30px -14px rgba(13,110,253,.35)"
    },
    borderRadius: { xl: "14px", "2xl":"20px" }
  },
},
  plugins: [],
};
