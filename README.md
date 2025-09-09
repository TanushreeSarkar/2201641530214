# 🎉 URL Shortener - React App

Welcome to the **URL Shortener**, a sleek and user-friendly React-based web application designed to shorten URLs, track clicks, and provide insightful statistics—all managed entirely client-side! 🚀 Created as part of the *AffordMed Campus Hiring Evaluation*, this app highlights modern React practices, Material UI styling, and robust client-side architecture. Dive in and explore!

---

## 🌟 Features

- **URL Shortening**: Shorten up to 5 URLs concurrently with the option for custom shortcodes (4-10 alphanumeric characters) and configurable validity periods (default 30 minutes). 🔗
- **Click Tracking**: Detailed monitoring of total clicks, timestamps, source referrers, user agent info, and approximate geographic info when feasible. 📊
- **Statistics Page**: Comprehensive history view with rich insights including creation dates, expiry status, and click analytics with filtering and sorting capabilities. 📈
- **Custom Shortcodes**: Users can create memorable, unique custom codes adhering to validation rules. 🎨
- **Client-Side Validation**: Robust validation ensures URLs, shortcodes, and validity inputs are sane and secure before processing. ✅
- **Logging Integration**: Integrated logging middleware for both local debugging and remote server monitoring, as per the Campus Hiring Evaluation Pre-Test requirements. 🛠️
- **Seamless Redirects**: URLs redirect smoothly to original destinations with click logging and friendly error/expiry screens. 🔄
- **Responsive Design**: Built on Material UI for a clean, modern, and adaptive user experience across devices. 🎨

---

## 🛠️ Prerequisites

Make sure these are installed and ready:

- **Node.js** (v14.x or later) - [Download here](https://nodejs.org/)
- **npm** (included with Node.js) or **yarn**
- A modern code editor like **VS Code**, **WebStorm**, or **Sublime Text**
- Completion of the **Campus Hiring Evaluation - Pre-Test Setup** for logging server URL

---

## 🚀 Getting Started

Execute these steps to launch your app locally:

1. **Clone the Project**

```

git clone https://github.com/TanushreeSarkar/2201641530214.git
cd 2201641530214

```

2. **Install dependencies**

```

npm install

```

3. **Start the development server**

```

npm start

```

4. **Visit the app**

Open your browser and go to:

```

http://localhost:3000

```

---

## 🔧 Configuration Guide

- Open `src/utils/log.js`
- Replace the placeholder server URL with your Campus Hiring Evaluation logging server URL:
  
```

const SERVER_URL = 'https://your-test-server-url.com';

```

- If you don’t have a logging server, the app will gracefully fallback to local console logging.

---

## 💻 System Design & Architecture

### Architecture Overview

```

+--------------------------+       +-------------------------+
|      React Frontend       |  <--  |       User's Browser     |
|  (Client-Side SPA)        |       +-------------------------+
+--------------------------+
|
| (localStorage for persistence)
|
+---------------------------------------------------+
|            Client-side State Management            |
| - React Context + useReducer                        |
| - URL metadata stored locally with expiry logic    |
+---------------------------------------------------+
|
| (logging HTTP POST if SERVER_URL is set)
|
+--------------------------+
|      Logging Server       |
| (Optional Remote Backend) |
+--------------------------+

```

### Key Components

- **URL Context**: Manages all URL state (shortened URLs, clicks, expiry, metadata), persists to localStorage.
- **Shortener UI**: Form with input validation to generate shortened URLs, manage quotas, and assign custom codes.
- **Redirect Component**: Intercepts short URL paths, validates, logs click info, and redirects or shows expiry/error.
- **Statistics Dashboard**: Data-rich table with search, filter, sorting, and expanded click histories.
- **Logging Middleware**: Logs critical app events both locally and optionally to a remote server.

### Data Flow

1. User fills in original URL with optional shortcode and validity.
2. On successful validation, URL metadata saved in state + localStorage.
3. When a short link is visited:
   - Redirect component reads the shortcode from URL params.
   - Queries state (localStorage) for matching original URL and click data.
   - Logs the click with timestamp and referrer info.
   - Redirects the browser after a short countdown.
4. Statistics page reads full URL state for analytics and displays it interactively.

---

## 📁 Project Structure

```

url-shortener/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Shortener.js         \# URL input and shortening UI
│   │   ├── Statistics.js        \# Analytics dashboard
│   │   └── Redirect.js          \# Redirect and click logging handler
│   ├── context/
│   │   └── UrlContext.js        \# URL state management with Context API
│   ├── utils/
│   │   └── log.js               \# Logging utilities and server integration
│   ├── App.js                   \# Main routing \& UI chrome
│   ├── index.js                 \# React app entry point
│   ├── index.css                \# Global styling
│   └── reportWebVitals.js       \# Performance metrics helper
├── package.json
└── README.md

```

---

## 🎯 Future Enhancements

- Add backend integration for persistent multi-user URL management.
- Enhance click analytics with real IP geo-location via external services.
- Support bulk URL import/export.
- Introduce user authentication and personalized dashboards.
- Deploy as a PWA with offline capabilities.

---

## 🙏 Acknowledgements

Thanks to the **AffordMed Campus Hiring Evaluation** for inspiring this project and providing the platform to showcase modern React skills along with practical system design.

---

*Happy URL shortening!* 🎉🚀
