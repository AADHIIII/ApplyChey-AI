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
*   Firebase account (for authentication and database)
*   Google Gemini API key

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
    Create a `.env` file in the root directory (copy from `.env.example`):
    ```bash
    cp .env.example .env
    ```
    
    Then fill in your credentials:
    ```env
    # Firebase Configuration (Get from Firebase Console)
    VITE_FIREBASE_API_KEY=your_firebase_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

    # Google Gemini AI API Key (Get from https://aistudio.google.com/apikey)
    VITE_GEMINI_API_KEY=your_gemini_api_key

    # Rate Limiting (optional - defaults shown)
    VITE_MAX_API_CALLS_PER_MINUTE=10
    VITE_MAX_API_CALLS_PER_HOUR=50
    ```

    **Security Note:** Never commit your `.env` file. It's already in `.gitignore`.

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    The app will run at `http://localhost:3000`.

## 🔐 Security Features

This application implements comprehensive security measures:

- **Environment Variable Protection**: All API keys stored securely in `.env`
- **Rate Limiting**: Client-side API call limits to prevent abuse
- **Input Validation**: Comprehensive validation and sanitization
- **Error Boundaries**: Graceful error handling throughout the app
- **Security Headers**: XSS, clickjacking, and MIME-type sniffing protection
- **Secure Storage**: Encrypted local storage for sensitive data

See [SECURITY.md](./SECURITY.md) for detailed security documentation.

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
