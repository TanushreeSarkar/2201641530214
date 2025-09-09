import React, { useState, useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Collapse
} from '@mui/material';
import { 
  ContentCopy, 
  Launch, 
  ExpandMore, 
  ExpandLess,
  TrendingUp,
  Link as LinkIcon,
  Schedule,
  Mouse
} from '@mui/icons-material';
import { useUrl } from '../context/UrlContext';
import { Log } from '../utils/log';

const Statistics = () => {
  const { urls } = useUrl();
  const [sortBy, setSortBy] = useState('createdAt');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState({});

  // Filter and sort URLs
  const filteredAndSortedUrls = useMemo(() => {
    let filtered = urls.filter(url => {
      // Search filter
      const matchesSearch = !searchTerm || 
        url.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        url.shortcode.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const now = new Date().getTime();
      const isExpired = url.expiryTime && url.expiryTime < now;

      let matchesStatus = true;
      if (filterStatus === 'active') {
        matchesStatus = !isExpired;
      } else if (filterStatus === 'expired') {
        matchesStatus = isExpired;
      }

      return matchesSearch && matchesStatus;
    });

    // Sort URLs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'clicks':
          return b.clicks - a.clicks;
        case 'createdAt':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'expiryTime':
          if (!a.expiryTime && !b.expiryTime) return 0;
          if (!a.expiryTime) return 1;
          if (!b.expiryTime) return -1;
          return a.expiryTime - b.expiryTime;
        case 'shortcode':
          return a.shortcode.localeCompare(b.shortcode);
        default:
          return 0;
      }
    });

    return filtered;
  }, [urls, sortBy, filterStatus, searchTerm]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    const now = new Date().getTime();
    const totalUrls = urls.length;
    const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
    const activeUrls = urls.filter(url => !url.expiryTime || url.expiryTime > now).length;
    const expiredUrls = urls.filter(url => url.expiryTime && url.expiryTime < now).length;

    return {
      totalUrls,
      totalClicks,
      activeUrls,
      expiredUrls,
      averageClicks: totalUrls > 0 ? (totalClicks / totalUrls).toFixed(1) : 0
    };
  }, [urls]);

  const getShortUrl = (shortcode) => {
    return `${window.location.origin}/${shortcode}`;
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatExpiryStatus = (expiryTime) => {
    if (!expiryTime) {
      return { status: 'Never expires', color: 'success', isExpired: false };
    }

    const now = new Date().getTime();
    const expiry = new Date(expiryTime);

    if (expiryTime < now) {
      return { status: 'Expired', color: 'error', isExpired: true };
    }

    const diffMinutes = Math.floor((expiry - now) / (1000 * 60));
    let timeLeft = '';

    if (diffMinutes < 60) {
      timeLeft = `${diffMinutes}m left`;
    } else if (diffMinutes < 1440) {
      timeLeft = `${Math.floor(diffMinutes / 60)}h left`;
    } else {
      timeLeft = `${Math.floor(diffMinutes / 1440)}d left`;
    }

    return { 
      status: timeLeft, 
      color: diffMinutes < 60 ? 'warning' : 'info',
      isExpired: false 
    };
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      Log('client', 'info', 'statistics', 'URL copied to clipboard');
    } catch (error) {
      Log('client', 'error', 'statistics', 'Failed to copy to clipboard', error);
    }
  };

  const toggleRowExpansion = (urlId) => {
    setExpandedRows(prev => ({
      ...prev,
      [urlId]: !prev[urlId]
    }));
  };

  const renderClickHistory = (clickHistory) => {
    if (!clickHistory || clickHistory.length === 0) {
      return <Typography variant="body2" color="textSecondary">No clicks yet</Typography>;
    }

    return (
      <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
        {clickHistory.slice().reverse().map((click, index) => (
          <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" display="block">
              <strong>Time:</strong> {formatDateTime(click.timestamp)}
            </Typography>
            <Typography variant="caption" display="block">
              <strong>Source:</strong> {click.referrer}
            </Typography>
            <Typography variant="caption" display="block" sx={{ wordBreak: 'break-all' }}>
              <strong>User Agent:</strong> {click.userAgent.substring(0, 80)}
              {click.userAgent.length > 80 && '...'}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom align="center">
        URL Statistics
      </Typography>

      {/* Summary Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <LinkIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6">{stats.totalUrls}</Typography>
              <Typography color="textSecondary">Total URLs</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Mouse color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6">{stats.totalClicks}</Typography>
              <Typography color="textSecondary">Total Clicks</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6">{stats.averageClicks}</Typography>
              <Typography color="textSecondary">Avg Clicks</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Schedule color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6">{stats.activeUrls}</Typography>
              <Typography color="textSecondary">Active URLs</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Schedule color="error" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6">{stats.expiredUrls}</Typography>
              <Typography color="textSecondary">Expired URLs</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Search URLs or shortcodes"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort by"
              >
                <MenuItem value="createdAt">Creation Date</MenuItem>
                <MenuItem value="clicks">Click Count</MenuItem>
                <MenuItem value="expiryTime">Expiry Time</MenuItem>
                <MenuItem value="shortcode">Shortcode</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Filter"
              >
                <MenuItem value="all">All URLs</MenuItem>
                <MenuItem value="active">Active Only</MenuItem>
                <MenuItem value="expired">Expired Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* URLs Table */}
      {filteredAndSortedUrls.length === 0 ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            {urls.length === 0 
              ? "No URLs created yet. Go to the shortener to create your first URL!"
              : "No URLs match your current filters."
            }
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Shortcode</TableCell>
                <TableCell>Original URL</TableCell>
                <TableCell align="center">Clicks</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Created</TableCell>
                <TableCell align="center">Actions</TableCell>
                <TableCell align="center">Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedUrls.map((url) => {
                const expiryStatus = formatExpiryStatus(url.expiryTime);
                const shortUrl = getShortUrl(url.shortcode);

                return (
                  <React.Fragment key={url.id}>
                    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {url.shortcode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {url.originalUrl}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={url.clicks} 
                          color="primary" 
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={expiryStatus.status}
                          color={expiryStatus.color}
                          variant={expiryStatus.isExpired ? "filled" : "outlined"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="caption">
                          {formatDateTime(url.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Copy Short URL">
                          <IconButton 
                            size="small" 
                            onClick={() => copyToClipboard(shortUrl)}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Open Original URL">
                          <IconButton 
                            size="small" 
                            onClick={() => window.open(url.originalUrl, '_blank')}
                          >
                            <Launch fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          size="small"
                          onClick={() => toggleRowExpansion(url.id)}
                        >
                          {expandedRows[url.id] ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </TableCell>
                    </TableRow>

                    {/* Expandable row for click history */}
                    <TableRow>
                      <TableCell colSpan={7} sx={{ py: 0 }}>
                        <Collapse in={expandedRows[url.id]} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
                            <Typography variant="h6" gutterBottom>
                              Click History ({url.clickHistory.length} clicks)
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Short URL:
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  fontFamily="monospace"
                                  sx={{ wordBreak: 'break-all', mb: 2 }}
                                >
                                  {shortUrl}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Recent Clicks:
                                </Typography>
                                {renderClickHistory(url.clickHistory)}
                              </Grid>
                            </Grid>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Statistics;