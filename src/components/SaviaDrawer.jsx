// src/components/SaviaDrawer.jsx
import React, { useState } from 'react';
import { 
  Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, Collapse, Avatar, Stack 
} from '@mui/material';
import { 
  House, ChartLineUp, BookOpen, CaretDown, CaretUp, 
  Lifebuoy, ShieldCheck, FileText, Users, Brain, Plant 
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

const SaviaDrawer = ({ onClose, onOpenFuzzy }) => {
  const navigate = useNavigate();
  const [openAprende, setOpenAprende] = useState(false);
  const [openLegal, setOpenLegal] = useState(false);

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  // --- ESTILOS PERSONALIZADOS PARA LOS BOTONES (TIPO PÍLDORA) ---
  const pillStyle = {
    borderRadius: '16px', // Bordes muy redondeados
    mb: 1, // Margen inferior entre elementos
    mx: 2, // Margen lateral para que no pegue a los bordes
    py: 1.5, // Un poco más altos
    transition: 'all 0.3s ease',
    '&:hover': {
        bgcolor: '#E0F2FE', // Azul claro al pasar el mouse
        transform: 'translateX(5px)', // Pequeño movimiento a la derecha
    },
    '& .MuiListItemIcon-root': {
        minWidth: 45, // Espacio para el icono
    }
  };

  const nestedPillStyle = {
      ...pillStyle,
      mx: 3, // Más margen para los anidados
      bgcolor: 'rgba(255,255,255,0.6)', // Fondo semi-transparente
      '&:hover': { bgcolor: '#F1F5F9', transform: 'translateX(5px)' },
  };


  return (
    <Box sx={{ pb: 4 }}>
      {/* --- NUEVA CABECERA DEL DRAWER --- */}
      <Box 
        sx={{ 
            p: 4, 
            background: 'linear-gradient(135deg, #E0F2FE 0%, #F0F9FF 100%)',
            borderRadius: '0 0 30px 30px', // Forma orgánica abajo
            mb: 3
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} mb={1}>
            <Avatar sx={{ bgcolor: 'white', color: '#0284C7', boxShadow: '0 4px 12px rgba(2,132,199,0.2)' }}>
                <Plant size={24} weight="fill" />
            </Avatar>
            <Typography variant="h6" fontWeight="900" color="#0F172A" letterSpacing={1}>
            MENÚ SAVIA
            </Typography>
        </Stack>
        <Typography variant="body2" color="#475569" sx={{ ml: 1 }}>
            Explora tu ecosistema emocional.
        </Typography>
      </Box>

      {/* --- LISTA DE NAVEGACIÓN --- */}
      <List component="nav" sx={{ px: 1 }}>
        
        {/* 1. INICIO */}
        <ListItemButton onClick={() => handleNav('/')} sx={pillStyle}>
          <ListItemIcon><House size={26} weight="duotone" color="#334155" /></ListItemIcon>
          <ListItemText primary="Inicio" primaryTypographyProps={{ fontWeight: 700, color: '#334155' }} />
        </ListItemButton>

        {/* 2. MI HISTORIAL */}
        <ListItemButton onClick={() => handleNav('/dashboard')} sx={pillStyle}>
          <ListItemIcon><ChartLineUp size={26} weight="duotone" color="#0284C7" /></ListItemIcon>
          <ListItemText primary="Mi Historial" primaryTypographyProps={{ fontWeight: 700, color: '#0284C7' }} />
        </ListItemButton>

        {/* 3. APRENDE (Desplegable) */}
        <ListItemButton onClick={() => setOpenAprende(!openAprende)} sx={pillStyle} style={{ backgroundColor: openAprende ? '#F1F5F9' : '' }}>
          <ListItemIcon><BookOpen size={26} weight="duotone" color="#8B5CF6" /></ListItemIcon>
          <ListItemText primary="Aprende" primaryTypographyProps={{ fontWeight: 700, color: '#334155' }} />
          {openAprende ? <CaretUp size={20} color="#8B5CF6"/> : <CaretDown size={20} color="#94A3B8"/>}
        </ListItemButton>
        
        <Collapse in={openAprende} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ mt: 1 }}>
            <ListItemButton sx={nestedPillStyle}>
               <ListItemText primary="Glosario Emocional" secondary="Definiciones clave" />
            </ListItemButton>
            <ListItemButton sx={nestedPillStyle}>
               <ListItemText primary="Técnicas de Calma" secondary="Respiración" />
            </ListItemButton>
            {/* LINK AL MODAL DE LÓGICA DIFUSA (Destacado) */}
            <ListItemButton 
                onClick={onOpenFuzzy}
                sx={{ ...nestedPillStyle, bgcolor: '#FDF2F8 !important', '&:hover': { bgcolor: '#FCE7F3 !important' } }}
            >
               <ListItemIcon sx={{ minWidth: 35 }}><Brain size={22} color="#EC4899" weight="fill" /></ListItemIcon>
               <ListItemText 
                  primary="¿Cómo funciona SAVIA?" 
                  primaryTypographyProps={{ fontWeight: 800, color: '#BE185D' }}
               />
            </ListItemButton>
          </List>
        </Collapse>

        {/* 4. LEGAL (Desplegable) */}
        <ListItemButton onClick={() => setOpenLegal(!openLegal)} sx={pillStyle} style={{ backgroundColor: openLegal ? '#F1F5F9' : '' }}>
          <ListItemIcon><ShieldCheck size={26} weight="duotone" color="#10B981" /></ListItemIcon>
          <ListItemText primary="Información Legal" primaryTypographyProps={{ fontWeight: 700, color: '#334155' }} />
          {openLegal ? <CaretUp size={20} color="#10B981"/> : <CaretDown size={20} color="#94A3B8"/>}
        </ListItemButton>

        <Collapse in={openLegal} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ mt: 1 }}>
            <ListItemButton sx={nestedPillStyle}>
               <ListItemIcon sx={{ minWidth: 35 }}><FileText size={22} color="#64748B" /></ListItemIcon>
               <ListItemText primary="Política de Privacidad" />
            </ListItemButton>
            <ListItemButton sx={nestedPillStyle}>
               <ListItemIcon sx={{ minWidth: 35 }}><FileText size={22} color="#64748B" /></ListItemIcon>
               <ListItemText primary="Términos de Uso" />
            </ListItemButton>
            <ListItemButton sx={nestedPillStyle}>
               <ListItemIcon sx={{ minWidth: 35 }}><Users size={22} color="#64748B" /></ListItemIcon>
               <ListItemText primary="Créditos / Equipo" />
            </ListItemButton>
          </List>
        </Collapse>

        <Box sx={{ my: 2, mx: 4, borderBottom: '1px solid #E2E8F0' }} />

        {/* 5. CONTACTO (Destacado en rojo suave) */}
        <ListItemButton onClick={onClose} sx={{ ...pillStyle, bgcolor: '#FEF2F2', '&:hover': { bgcolor: '#FEE2E2' } }}>
          <ListItemIcon><Lifebuoy size={26} weight="duotone" color="#EF4444" /></ListItemIcon>
          <ListItemText primary="Ayuda / Contacto" primaryTypographyProps={{ fontWeight: 700, color: '#991B1B' }} />
        </ListItemButton>

      </List>
      
      <Box sx={{ position: 'absolute', bottom: 20, left: 0, width: '100%', textAlign: 'center', opacity: 0.6 }}>
        <Typography variant="caption" fontWeight="600" color="#94A3B8">SAVIA v1.2 (Beta)</Typography>
      </Box>
    </Box>
  );
};

export default SaviaDrawer;