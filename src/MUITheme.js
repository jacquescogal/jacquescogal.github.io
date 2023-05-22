import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
      type: 'light',
      primary: {
        main: '#FBBA51',
        contrastText: 'rgba(255,255,255,0.87)',
        dark: '#f57f17',
      },
      secondary: {
        main: '#e57373',
        contrastText: 'rgba(255,255,255,0.87)',
      },
    },
  });

export default theme;
