import { createTheme } from '@mui/material/styles';
import SlalomSansRegular from '../assets/fonts/SlalomSans-Regular.woff2';
import SlalomSansBold from '../assets/fonts/SlalomSans-Bold.woff2';
import SlalomSansItalic from '../assets/fonts/SlalomSans-Italic.woff2';
import SlalomSansBoldItalic from '../assets/fonts/SlalomSans-BoldItalic.woff2';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0c62fb',
    },
    secondary: {
      main: '#1be1f2',
    },
    info: {
      main: '#c7b9ff',
    },
    error: {
      main: '#ff4d5f',
    },
    warning: {
      main: '#deff4d',
    },
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0c62fb',
    },
    secondary: {
      main: '#1be1f2',
    },
    info: {
      // main: '#c7b9ff', // Slalom Purple, replaced with a gray below
      main: '#7e8289',
    },
    error: {
      main: '#ff4d5f',
    },
    warning: {
      main: '#ffcc00',
      // main: '#deff4d', // Slalom color, but it's terrible
    },
  },
  typography: {
    fontFamily: [
      'Slalom Sans',
      'Raleway',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Slalom Sans';
          font-style: normal;
          font-display: swap;
          font-weight: 400;
          src: 
            local('Slalom Sans'),
            local('SlalomSans-Regular'),
            url(${SlalomSansRegular}) format('woff2');
          unicodeRange: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF;
        },
        @font-face {
          font-family: 'Slalom Sans Bold';
          font-style: bold;
          font-display: swap;
          font-weight: 700;
          src: 
            local('Slalom Sans Bold'),
            local('SlalomSans-Bold'),
            url(${SlalomSansBold}) format('woff2');
          unicodeRange: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF;
        },
        @font-face {
          font-family: 'Slalom Sans Italic';
          font-style: italic;
          font-display: swap;
          font-weight: 400;
          src:
            local('Slalom Sans Italic'),
            local('SlalomSans-Italic'),
            url(${SlalomSansItalic}) format('woff2');
          unicodeRange: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF;
        },
        @font-face {
          font-family: 'Slalom Sans Bold Italic';
          font-style: bold italic;
          font-display: swap;
          font-weight: 700;
          src:
            local('Slalom Sans Bold Italic'),
            local('SlalomSans-BoldItalic'),
            url(${SlalomSansBoldItalic}) format('woff2');
          unicodeRange: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF;
        }
      `,
    },
  },
});