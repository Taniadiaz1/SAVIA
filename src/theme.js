import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2D9CDB', // Azul tranquilo (similar a la captura)
    },
    background: {
      default: '#F5F7FA', // Fondo gris muy claro
      paper: '#FFFFFF',
    },
    text: {
      primary: '#333333',
      secondary: '#828282',
    },
    // Definimos el color SOS específico del diseño [cite: 2]
    error: {
      main: '#FFEBEB', // Fondo rosado suave
      contrastText: '#EB5757', // Texto rojo
    },
  },
  shape: {
    borderRadius: 24, // Bordes muy redondeados para suavidad
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h1: { fontSize: '1.8rem', fontWeight: 700 },
    subtitle1: { fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.5px' },
  },
});

export default theme;