import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { 
  Home,               
  BarChart,           
  ChatBubbleOutline,  
  SmartToy,
  AddCircleOutline // Usamos este icono para el "+"
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

const BottomNavbar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();

  // Determinar pestaña activa
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path === '/') return 0;
    if (path === '/dashboard') return 1;
    if (path === '/community') return 2;
    if (path === '/new-entry') return 3; // El "+" será el índice 3
    if (path === '/lumi') return 4;
    return 0;
  };

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 100 
      }} 
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={getCurrentTab()}
        onChange={(event, newValue) => {
          switch (newValue) {
            case 0: navigate('/'); break;         // Inicio
            case 1: navigate('/dashboard'); break; // Estadísticas
            case 2: navigate('/community'); break; // Chat (Comunidad)
            case 3: navigate('/new-entry'); break; // Diario (+)
            case 4: navigate('/lumi'); break;      // Savia IA
            default: break;
          }
        }}
        sx={{ 
          height: 80, 
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          '& .Mui-selected': { color: theme.palette.primary.main } 
        }}
      >
        <BottomNavigationAction label="Inicio" icon={<Home />} />
        <BottomNavigationAction label="Estadísticas" icon={<BarChart />} />
        <BottomNavigationAction label="Chat" icon={<ChatBubbleOutline />} />
        
        {/* BOTÓN DE NUEVA ENTRADA (+) AQUÍ, AL LADO DE SAVIA IA */}
        <BottomNavigationAction label="Diario" icon={<AddCircleOutline sx={{ fontSize: 28 }} />} />
        
        <BottomNavigationAction label="Savia IA" icon={<SmartToy />} />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNavbar;