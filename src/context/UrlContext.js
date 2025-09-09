import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Log } from '../utils/log';

const UrlContext = createContext();

const initialState = {
  urls: [],
  maxUrls: 5,
};

// Load state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('urlShortenerState');
    if (serializedState === null) {
      return initialState;
    }
    const state = JSON.parse(serializedState);
    const now = new Date().getTime();
    const validUrls = state.urls.filter(url => !url.expiryTime || url.expiryTime > now);
    return { ...state, urls: validUrls };
  } catch (err) {
    Log('client', 'error', 'context', 'Failed to load state from localStorage');
    return initialState;
  }
};

// Save state to localStorage
const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('urlShortenerState', serializedState);
  } catch (err) {
    Log('client', 'error', 'context', 'Failed to save state to localStorage');
  }
};

const urlReducer = (state, action) => {
  let newState;

  switch (action.type) {
    case 'ADD_URL':
      newState = {
        ...state,
        urls: [...state.urls, action.payload]
      };
      break;

    case 'INCREMENT_CLICKS':
      newState = {
        ...state,
        urls: state.urls.map(url =>
          url.shortcode === action.payload.shortcode
            ? {
                ...url,
                clicks: url.clicks + 1,
                clickHistory: [
                  ...url.clickHistory,
                  {
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    referrer: document.referrer || 'Direct',
                    ip: 'Unknown' // Client-side limitation
                  }
                ]
              }
            : url
        )
      };
      break;

    case 'REMOVE_EXPIRED':
      const now = new Date().getTime();
      newState = {
        ...state,
        urls: state.urls.filter(url => !url.expiryTime || url.expiryTime > now)
      };
      break;

    default:
      return state;
  }

  saveState(newState);
  return newState;
};

export const UrlProvider = ({ children }) => {
  const [state, dispatch] = useReducer(urlReducer, initialState, loadState);

  // Cleanup expired URLs periodically
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'REMOVE_EXPIRED' });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const addUrl = (originalUrl, shortcode, validityMinutes = 30) => {
    const now = new Date();
    const expiryTime = validityMinutes ? now.getTime() + validityMinutes * 60 * 1000 : null;

    const newUrl = {
      id: Date.now().toString(),
      originalUrl,
      shortcode,
      createdAt: now.toISOString(),
      expiryTime,
      clicks: 0,
      clickHistory: []
    };

    dispatch({ type: 'ADD_URL', payload: newUrl });
    Log('client', 'info', 'context', `URL added: ${shortcode} -> ${originalUrl}`);
    return newUrl;
  };

  const incrementClicks = (shortcode) => {
    dispatch({ type: 'INCREMENT_CLICKS', payload: { shortcode } });
    Log('client', 'info', 'context', `Click recorded for: ${shortcode}`);
  };

  const getUrlByShortcode = (shortcode) => {
    const url = state.urls.find(u => u.shortcode === shortcode);
    if (url && url.expiryTime && url.expiryTime < new Date().getTime()) {
      Log('client', 'warn', 'context', `Accessed expired URL: ${shortcode}`);
      return null;
    }
    return url;
  };

  const isShortcodeAvailable = (shortcode) => {
    return !state.urls.some(url => url.shortcode === shortcode);
  };

  const value = {
    urls: state.urls,
    maxUrls: state.maxUrls,
    addUrl,
    incrementClicks,
    getUrlByShortcode,
    isShortcodeAvailable,
  };

  return (
    <UrlContext.Provider value={value}>
      {children}
    </UrlContext.Provider>
  );
};

export const useUrl = () => {
  const context = useContext(UrlContext);
  if (!context) {
    throw new Error('useUrl must be used within a UrlProvider');
  }
  return context;
};
