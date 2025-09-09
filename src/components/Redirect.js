import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Paper, 
  Button,
  Alert
} from '@mui/material';
import { Launch, Home, Schedule } from '@mui/icons-material';
import { useUrl } from '../context/UrlContext';
import { Log } from '../utils/log';

const Redirect = () => {
  const { shortcode } = useParams();
  const navigate = useNavigate();
  const { getUrlByShortcode, incrementClicks } = useUrl();
  const [status, setStatus] = useState('loading'); // loading, found, not_found, expired
  const [urlData, setUrlData] = useState(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const handleRedirect = async () => {
      Log('client', 'info', 'redirect', `Attempting to redirect shortcode: ${shortcode}`);

      if (!shortcode) {
        setStatus('not_found');
        return;
      }

      try {
        const url = getUrlByShortcode(shortcode);

        if (!url) {
          Log('client', 'warn', 'redirect', `Shortcode not found: ${shortcode}`);
          setStatus('not_found');
          return;
        }

        // Check if URL is expired
        const now = new Date().getTime();
        if (url.expiryTime && url.expiryTime < now) {
          Log('client', 'warn', 'redirect', `Shortcode expired: ${shortcode}`);
          setStatus('expired');
          setUrlData(url);
          return;
        }

        setUrlData(url);
        setStatus('found');

        // Increment click count
        incrementClicks(shortcode);

        Log('client', 'info', 'redirect', `Successful redirect for shortcode: ${shortcode}`, {
          originalUrl: url.originalUrl,
          clicks: url.clicks + 1
        });

        // Start countdown for redirect
        const countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              // Redirect to original URL
              window.location.href = url.originalUrl;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(countdownInterval);

      } catch (error) {
        Log('client', 'error', 'redirect', 'Error during redirect process', error);
        setStatus('not_found');
      }
    };

    handleRedirect();
  }, [shortcode, getUrlByShortcode, incrementClicks]);

  const handleManualRedirect = () => {
    if (urlData) {
      window.location.href = urlData.originalUrl;
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const formatExpiryDate = (expiryTime) => {
    if (!expiryTime) return 'Never expires';
    return new Date(expiryTime).toLocaleString();
  };

  if (status === 'loading') {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="60vh"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Looking up URL...
        </Typography>
      </Box>
    );
  }

  if (status === 'not_found') {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Typography variant="h4" color="error" gutterBottom>
          404 - URL Not Found
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          The shortened URL <strong>/{shortcode}</strong> could not be found.
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          This could mean:
        </Typography>
        <Box sx={{ textAlign: 'left', maxWidth: 400, mx: 'auto', mb: 3 }}>
          <Typography variant="body2" color="textSecondary" component="ul">
            <li>The URL has expired</li>
            <li>The shortcode was mistyped</li>
            <li>The URL was never created</li>
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Home />}
          onClick={handleGoHome}
          size="large"
        >
          Go to URL Shortener
        </Button>
      </Paper>
    );
  }

  if (status === 'expired') {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Schedule color="error" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h4" color="error" gutterBottom>
          URL Expired
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          The shortened URL <strong>/{shortcode}</strong> has expired.
        </Typography>

        {urlData && (
          <Box sx={{ mt: 3, mb: 3 }}>
            <Alert severity="info" sx={{ textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>Original URL:</strong> {urlData.originalUrl}
              </Typography>
              <Typography variant="body2">
                <strong>Created:</strong> {new Date(urlData.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="body2">
                <strong>Expired:</strong> {formatExpiryDate(urlData.expiryTime)}
              </Typography>
              <Typography variant="body2">
                <strong>Total Clicks:</strong> {urlData.clicks}
              </Typography>
            </Alert>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            startIcon={<Launch />}
            onClick={handleManualRedirect}
            disabled={!urlData}
          >
            Visit Original URL Anyway
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Home />}
            onClick={handleGoHome}
          >
            Create New Short URL
          </Button>
        </Box>
      </Paper>
    );
  }

  if (status === 'found' && urlData) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Typography variant="h4" color="primary" gutterBottom>
          Redirecting...
        </Typography>

        <Box sx={{ mb: 4 }}>
          <CircularProgress 
            variant="determinate" 
            value={((3 - countdown) / 3) * 100}
            size={80}
            thickness={4}
          />
          <Typography variant="h5" sx={{ mt: 2 }}>
            {countdown}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            seconds remaining
          </Typography>
        </Box>

        <Alert severity="success" sx={{ textAlign: 'left', mb: 3 }}>
          <Typography variant="body2">
            <strong>Short URL:</strong> {window.location.origin}/{shortcode}
          </Typography>
          <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
            <strong>Redirecting to:</strong> {urlData.originalUrl}
          </Typography>
          <Typography variant="body2">
            <strong>Total Clicks:</strong> {urlData.clicks + 1}
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            startIcon={<Launch />}
            onClick={handleManualRedirect}
            size="large"
          >
            Redirect Now
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Home />}
            onClick={handleGoHome}
          >
            Cancel & Go Home
          </Button>
        </Box>
      </Paper>
    );
  }

  return null;
};

export default Redirect;