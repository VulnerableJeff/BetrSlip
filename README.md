README.md

# 🧠 BetrSlip — AI Sports Betting Assistant

**BetrSlip** is an AI-driven web app that helps you analyze sportsbook screenshots, detect betting legs, and build smarter parlays.  
Simply upload your bet slip or scoreboard — the app automatically parses your selections, calculates implied probabilities, and gives real-time AI suggestions for higher-confidence picks.

---

## 🚀 Features

✅ **Screenshot Upload + OCR Parsing**  
- Upload Hard Rock, DraftKings, or FanDuel bet slips.  
- AI detects teams, odds, and markets automatically.  

🤖 **AI-Powered Suggestions**  
- Get smart betting recommendations and similar props.  
- Generate 80% confidence parlays in one click.

📊 **Dynamic Parlay Builder**  
- Add/remove legs instantly and view live implied win chance.  
- Combine across multiple sports (NBA, NFL, UFC, etc).

🎨 **Modern & Responsive UI**  
- Clean dark interface with mobile optimization.  
- Built with **React + TypeScript + TailwindCSS**.

⚙️ **Optional OpenAI Integration**  
- AI explanations and reasoning for each leg.  
- Plug in your own API key via `.env` file (see below).

---

## 🧩 Tech Stack

- **Frontend:** React, TypeScript, Vite  
- **Styling:** Tailwind CSS  
- **AI / OCR:** OpenAI API, Tesseract.js  
- **Data:** Local state + optional API hooks  

---

## 🧠 Setup Instructions

### 1️⃣ Clone the repo
```bash
git clone https://github.com/VulnerableJeff/BetrSlip.git
cd BetrSlip

2️⃣ Install dependencies

npm install

3️⃣ Configure environment

Create a .env file based on .env.example:

VITE_OPENAI_API_KEY=your_api_key_here

4️⃣ Run the dev server

npm run dev

Visit http://localhost:5173 to open the app.


---

🧰 Folder Structure

BetrSlip/
│
├── src/
│   ├── components/         # UI components
│   ├── api/                # AI + Odds API functions
│   ├── ocr/                # Image-to-text parser
│   ├── lib/                # Utilities and helpers
│   └── App.tsx             # Main app
│
├── public/
│   └── logo.png            # BetrSlip logo
│
├── .env.example            # Example API key file
└── README.md


---

🧤 Environment Variables

Variable	Description

VITE_OPENAI_API_KEY	Your OpenAI API key for AI suggestions and analysis


⚠️ Do not commit .env — it’s ignored by default.


---

🧑‍💻 Contributing

Want to help?

1. Fork this repo


2. Create a branch: git checkout -b feature/new-feature


3. Commit changes: git commit -m "Add new feature"


4. Push: git push origin feature/new-feature


5. Submit a pull request




---

📜 License

MIT License © 2025 Vulnerable Jeff


---

🌎 Roadmap

[ ] Auto-detect sportsbook (Hard Rock, FanDuel, DraftKings)

[ ] Cross-sport parlay builder

[ ] Probability engine + value betting module

[ ] Shareable AI reports / PDF export

[ ] Multi-language support

[ ] Mobile PWA version



---

💬 Credits

Logo Design: by Vulnerable Jeff

Development: GPT-5 + Jeff

Inspired by: modern AI betting tools like ParLay AI, Rithmm, and EdgeFinder.



---

🧠 “Smarter bets. Better slips. BetrSlip.”

---

Would you like me to make it **auto-formatted with emojis, badges (like “Built with React”, “Powered by OpenAI”), and dark mode screenshots** for a more polished GitHub landing page look?
