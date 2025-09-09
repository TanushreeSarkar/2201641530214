# 🎉 URL Shortener - React App

Welcome to the **URL Shortener**, a sleek and user-friendly React-based web application built to shorten URLs, track clicks, and provide insightful statistics—all managed client-side! 🚀 Created as part of the *AffordMed Campus Hiring Evaluation*, this app showcases modern React practices, Material UI styling, and robust client-side logic. Let's dive in! 🌟

---

## 🌟 Features

- **URL Shortening**: Shorten up to 5 URLs at once with custom shortcodes and optional validity periods (defaults to 30 minutes). 🔗
- **Click Tracking**: Monitor total clicks, timestamps, sources, and coarse-grained geographical locations for each shortened URL. 📊
- **Statistics Page**: View a detailed history of all shortened URLs with creation and expiry details. 📈
- **Custom Shortcodes**: Allow users to set their own unique shortcodes (alphanumeric, 4-10 chars). 🎨
- **Client-Side Validation**: Ensure inputs (URLs, validity, shortcodes) meet requirements before processing. ✅
- **Logging Integration**: Extensively uses a custom logging middleware (as per pre-test setup) for debugging and monitoring. 🛠️
- **Redirection**: Seamlessly redirect users from shortcodes to original URLs with click logging. 🔄
- **Responsive Design**: Built with Material UI for a clean, modern, and clutter-free UI. 🎨

---

## 🛠️ Prerequisites

Before you get started, ensure you have the following installed:

- **Node.js** (v14.x or later) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- A code editor (e.g., VS Code, Sublime Text) 💻

You'll also need to have completed the **Campus Hiring Evaluation - Pre-Test Setup** and registered as instructed in the document. This provides the logging test server URL (replace the placeholder in `src/utils/log.js`).

---

## 🚀 Getting Started

Follow these simple steps to run the project locally:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/url-shortener.git
   cd url-shortener