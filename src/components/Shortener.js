import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import { ContentCopy, Delete, Launch } from '@mui/icons-material';
import { useUrl } from '../context/UrlContext';
import { Log } from '../utils/log';

const Shortener = () => {
  const { urls, maxUrls, addUrl, isShortcodeAvailable } = useUrl();
  const [formData, setFormData] = useState({
    url: '',
    customShortcode: '',
    validityPeriod: 30
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Validation functions
  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateShortcode = (shortcode) => {
    if (!shortcode) return true; // Optional field
    const regex = /^[a-zA-Z0-9]{4,10}$/;
    return regex.test(shortcode);
  };

  const generateRandomShortcode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else if (!validateUrl(formData.url)) {
      newErrors.url = 'Please enter a valid URL (include http:// or https://)';
    }

    if (formData.customShortcode && !validateShortcode(formData.customShortcode)) {
      newErrors.customShortcode = 'Shortcode must be 4-10 alphanumeric characters';
    }

    if (formData.customShortcode && !isShortcodeAvailable(formData.customShortcode)) {
      newErrors.customShortcode = 'This shortcode is already taken';
    }

    if (formData.validityPeriod < 1 || formData.validityPeriod > 10080) { // Max 1 week
      newErrors.validityPeriod = 'Validity must be between 1 and 10080 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    Log('client', 'info', 'shortener', 'Form submission attempted');

    if (urls.length >= maxUrls) {
      setSnackbar({
        open: true,
        message: `Maximum of ${maxUrls} URLs allowed`,
        severity: 'error'
      });
      return;
    }

    if (!validateForm()) {
      Log('client', 'warn', 'shortener', 'Form validation failed', errors);
      return;
    }

    let shortcode = formData.customShortcode || generateRandomShortcode();

    // Ensure shortcode is unique
    while (!isShortcodeAvailable(shortcode)) {
      shortcode = generateRandomShortcode();
    }

    try {
      const newUrl = addUrl(formData.url, shortcode, formData.validityPeriod);

      setSnackbar({
        open: true,
        message: 'URL shortened successfully!',
        severity: 'success'
      });

      // Reset form
      setFormData({
        url: '',
        customShortcode: '',
        validityPeriod: 30
      });

      Log('client', 'info', 'shortener', 'URL shortened successfully', { 
        shortcode, 
        originalUrl: formData.url 
      });
    } catch (error) {
      Log('client', 'error', 'shortener', 'Failed to shorten URL', error);
      setSnackbar({
        open: true,
        message: 'Failed to shorten URL. Please try again.',
        severity: 'error'
      });
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnackbar({
        open: true,
        message: 'Copied to clipboard!',
        severity: 'success'
      });
      Log('client', 'info', 'shortener', 'URL copied to clipboard');
    } catch (error) {
      Log('client', 'error', 'shortener', 'Failed to copy to clipboard', error);
      setSnackbar({
        open: true,
        message: 'Failed to copy to clipboard',
        severity: 'error'
      });
    }
  };

  const getShortUrl = (shortcode) => {
    return `${window.location.origin}/${shortcode}`;
  };

  const formatExpiryTime = (expiryTime) => {
    if (!expiryTime) return 'Never expires';
    const expiry = new Date(expiryTime);
    const now = new Date();
    const diffMinutes = Math.floor((expiry - now) / (1000 * 60));

    if (diffMinutes <= 0) return 'Expired';
    if (diffMinutes < 60) return `${diffMinutes} minutes`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours`;
    return `${Math.floor(diffMinutes / 1440)} days`;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom align="center">
        URL Shortener
      </Typography>
      <Typography variant="subtitle1" gutterBottom align="center" color="textSecondary">
        Shorten up to {maxUrls} URLs with custom shortcodes and expiry times
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL to shorten"
                placeholder="https://example.com/very-long-url"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                error={!!errors.url}
                helperText={errors.url}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Custom Shortcode (Optional)"
                placeholder="mylink"
                value={formData.customShortcode}
                onChange={(e) => handleInputChange('customShortcode', e.target.value)}
                error={!!errors.customShortcode}
                helperText={errors.customShortcode || '4-10 alphanumeric characters'}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Validity Period</InputLabel>
                <Select
                  value={formData.validityPeriod}
                  onChange={(e) => handleInputChange('validityPeriod', e.target.value)}
                  label="Validity Period"
                >
                  <MenuItem value={5}>5 minutes</MenuItem>
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={60}>1 hour</MenuItem>
                  <MenuItem value={360}>6 hours</MenuItem>
                  <MenuItem value={1440}>24 hours</MenuItem>
                  <MenuItem value={10080}>7 days</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={urls.length >= maxUrls}
              >
                Shorten URL ({urls.length}/{maxUrls})
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {urls.length > 0 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Your Shortened URLs
          </Typography>
          {urls.map((url) => (
            <Card key={url.id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Original URL
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        wordBreak: 'break-all',
                        fontSize: '0.9rem'
                      }}
                    >
                      {url.originalUrl}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Short URL
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          wordBreak: 'break-all',
                          fontSize: '0.9rem',
                          flexGrow: 1
                        }}
                      >
                        {getShortUrl(url.shortcode)}
                      </Typography>
                      <Tooltip title="Copy URL">
                        <IconButton 
                          size="small" 
                          onClick={() => copyToClipboard(getShortUrl(url.shortcode))}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Open URL">
                        <IconButton 
                          size="small" 
                          onClick={() => window.open(url.originalUrl, '_blank')}
                        >
                          <Launch fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Chip 
                        label={`${url.clicks} clicks`} 
                        color="primary" 
                        variant="outlined" 
                        size="small"
                      />
                      <Chip 
                        label={`Expires: ${formatExpiryTime(url.expiryTime)}`} 
                        color="secondary" 
                        variant="outlined" 
                        size="small"
                      />
                      <Typography variant="caption" color="textSecondary">
                        Created: {new Date(url.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Shortener;