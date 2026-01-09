## 🚀 Overview

**ApplyChey** is a sophisticated, enterprise-ready resume building platform that leverages Generative AI to help job seekers stand out. It goes beyond simple template filling by offering intelligent content generation, ATS (Applicant Tracking System) optimization analysis, and dynamic PDF generation.

## ✨ Key Features

*   **🤖 AI-Powered Content Enhancement**: Integrates with Google's **Gemini AI** to rewrite bullet points, generate professional summaries, and optimize language for specific job descriptions.
*   **📄 Dynamic PDF Generation**: Uses a custom-built PDF engine (`jspdf`) that supports:
    *   **Multiple Templates**: Classic, Executive, Modern Tech, and more.
    *   **Intelligent Layout**: Automatically adjusts font sizes and spacing (`Smart Fill` / `Auto-Compress`) to ensure resumes fit perfectly on one page without awkward whitespace or overflows.
    *   **ATS-Friendly Output**: Generates clean, searchable text layers.
*   **🎨 Enterprise UI/UX**: Built with **React 19**, **Vite**, and **Tailwind CSS v4** for a high-performance, responsive, and accessible interface.
*   **📊 Resume Analysis**: Provides real-time feedback on resume quality, keyword matching, and strict ATS compliance checks.
*   **🔥 Firebase Backend**: robust authentication, data storage, and serverless functions for secure user management.

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript, Vite
*   **Styling**: Tailwind CSS v4 (with PostCSS)
*   **AI**: Google Gemini API
*   **PDF Engine**: jsPDF (Custom Implementation)
*   **Backend/Auth**: Firebase (Auth, Firestore, Functions)
*   **Testing**: Vitest

## 🔧 Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd applychey---ai-resume
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file in the root directory and add your keys:
    ```env
    VITE_GEMINI_API_KEY=your_gemini_api_key
    VITE_FIREBASE_API_KEY=your_firebase_api_key
    # ... other firebase config keys
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    The app will run at `http://localhost:3000`.

## 🧪 Testing

We use **Vitest** for unit testing to ensure reliability, especially for the core PDF generation logic.

### Running Tests
To run the test suite:
```bash
npm run test
```

### What is tested?
*   **PDF Service**: Validates that PDFs are generated correctly for different templates.
*   **Font Mapping**: Ensures font fallbacks (e.g., Charter -> Times) work across different OS environments.
*   **AI Service**: Mocks and verifies interactions with the Gemini API.

## 🐛 Troubleshooting

**"Lost UI" / Styles Missing?**
This project uses **Tailwind CSS v4**. If styles break, ensure:
1.  You have `@tailwindcss/postcss` installed.
2.  Your `postcss.config.cjs` uses the correct plugin.
3.  Your `index.css` uses `@import "tailwindcss";` instead of the old `@tailwind` directives.

## 🤝 Contributing
Contributions are welcome! Please run tests before submitting a PR.
