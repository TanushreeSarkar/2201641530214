// Simple logging utility for the URL shortener application
// Replace the SERVER_URL with your actual test server URL from the pre-test setup

const SERVER_URL = 'https://your-test-server-url.com'; // Replace with actual URL from pre-test setup

export const Log = async (source, level, component, message, data = null) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    source,
    level,
    component,
    message,
    data,
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  // Console logging for development
  const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
  console[consoleMethod](`[${level.toUpperCase()}] ${component}: ${message}`, data || '');

  // Send to server (if SERVER_URL is configured)
  try {
    if (SERVER_URL && SERVER_URL !== 'https://your-test-server-url.com') {
      await fetch(`${SERVER_URL}/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
        // Don't wait for response to avoid blocking UI
      }).catch(err => {
        console.warn('Failed to send log to server:', err.message);
      });
    }
  } catch (error) {
    console.warn('Logging service unavailable:', error.message);
  }

  // Store logs locally for debugging
  try {
    const logs = JSON.parse(localStorage.getItem('appLogs') || '[]');
    logs.push(logEntry);

    // Keep only last 100 logs to prevent storage bloat
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }

    localStorage.setItem('appLogs', JSON.stringify(logs));
  } catch (error) {
    console.warn('Failed to store log locally:', error.message);
  }
};

// Utility function to get logs for debugging
export const getLogs = () => {
  try {
    return JSON.parse(localStorage.getItem('appLogs') || '[]');
  } catch (error) {
    console.error('Failed to retrieve logs:', error.message);
    return [];
  }
};

// Clear logs utility
export const clearLogs = () => {
  try {
    localStorage.removeItem('appLogs');
    console.log('Logs cleared');
  } catch (error) {
    console.error('Failed to clear logs:', error.message);
  }
};