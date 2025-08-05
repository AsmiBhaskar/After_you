import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Typography } from '@mui/material';

// Simple theme for testing
const simpleTheme = {
  palette: {
    mode: 'light',
  },
};

function App() {
  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        AfterYou - Legacy Message System
      </Typography>
      <Typography variant="body1">
        The application is loading. If you see this, the basic setup is working!
      </Typography>
    </Box>
  );
}

export default App;
