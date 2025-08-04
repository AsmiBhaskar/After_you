import { createTheme } from '@mui/material/styles';

// "AfterYou" - Poetic theme inspired by legacy messages and time
const afterYouTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6B73FF', // Soft indigo - digital mystique
      light: '#9FA5FF',
      dark: '#3F47CC',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF6B9D', // Gentle rose - emotional connection
      light: '#FF9FBF',
      dark: '#CC3770',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FAFBFF', // Almost white with slight blue tint
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2D3436', // Dark charcoal
      secondary: '#636E72', // Medium gray
    },
    grey: {
      100: '#F8F9FA',
      200: '#E9ECEF',
      300: '#DEE2E6',
      400: '#CED4DA',
      500: '#ADB5BD',
      600: '#6C757D',
      700: '#495057',
      800: '#343A40',
      900: '#212529',
    },
    divider: '#E9ECEF',
    success: {
      main: '#00B894',
      light: '#55C4A7',
      dark: '#00A085',
    },
    warning: {
      main: '#FDCB6E',
      light: '#FFD93D',
      dark: '#E17055',
    },
    error: {
      main: '#E17055',
      light: '#FF7675',
      dark: '#D63031',
    },
    info: {
      main: '#74B9FF',
      light: '#A29BFE',
      dark: '#0984E3',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(107, 115, 255, 0.15)',
          },
        },
        contained: {
          background: 'linear-gradient(45deg, #6B73FF 30%, #9FA5FF 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #3F47CC 30%, #6B73FF 90%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 20px rgba(107, 115, 255, 0.08)',
          border: '1px solid #F1F3F4',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
        },
        elevation3: {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#E9ECEF',
            },
            '&:hover fieldset': {
              borderColor: '#6B73FF',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#6B73FF',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        colorPrimary: {
          backgroundColor: '#E8EAFF',
          color: '#3F47CC',
        },
        colorSecondary: {
          backgroundColor: '#FFE8F0',
          color: '#CC3770',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#2D3436',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          borderBottom: '1px solid #F1F3F4',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FAFBFF',
          borderRight: '1px solid #F1F3F4',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: '#E8EAFF',
            color: '#3F47CC',
            '&:hover': {
              backgroundColor: '#E8EAFF',
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover': {
            backgroundColor: 'rgba(107, 115, 255, 0.08)',
          },
        },
      },
    },
  },
  transitions: {
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
  },
});

export default afterYouTheme;
