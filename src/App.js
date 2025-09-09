import React, { useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Shortener from './components/Shortener';
import Statistics from './components/Statistics';
import Redirect from './components/Redirect';
import { UrlProvider } from './context/UrlContext';
import { Log } from './utils/log';
import { Button, AppBar, Toolbar, Typography, Container } from '@mui/material';

function App() {
  useEffect(() => {
    Log('client', 'info', 'app', 'Application initialized');
  }, []);

  return (
    <UrlProvider>
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              URL Shortener
            </Typography>
            <Button color="inherit" component={Link} to="/">
              Shorten
            </Button>
            <Button color="inherit" component={Link} to="/statistics">
              Statistics
            </Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<Shortener />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/:shortcode" element={<Redirect />} />
          </Routes>
        </Container>
      </div>
    </UrlProvider>
  );
}

export default App;