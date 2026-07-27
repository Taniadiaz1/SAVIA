// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, IconButton, Avatar, Stack, Drawer, Tooltip 
} from '@mui/material';
import { List as ListIcon, UserCircle, SignOut } from '@phosphor-icons/react'; 
import { useNavigate } from 'react-router-dom';

// --- IMPORTS DE FIREBASE ---
import { auth } from '../services/firebaseConfig';
import { signOut, onAuthStateChanged } from 'firebase/auth';

import SaviaDrawer from './SaviaDrawer';
import FuzzyLogicModal from './FuzzyLogicModal';

const Header = () => {
  const navigate = useNavigate();
  
  // Estado para saber si hay alguien logueado
  const [user, setUser] = useState(null);
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fuzzyModalOpen, setFuzzyModalOpen] = useState(false);

  // 1. ESCUCHAMOS SI HAY USUARIO
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenFuzzy = () => {
    setDrawerOpen(false);
    setFuzzyModalOpen(true);
  };

  // 2. FUNCIÓN DE CERRAR SESIÓN
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Sesión cerrada.");
      navigate('/'); // Regresa al Landing
      window.location.reload(); // Limpia estados visuales
    } catch (error) {
      console.error("Error al salir:", error);
    }
  };

  return (
    <>
      {/* --- BARRA SUPERIOR --- */}
      <Box 
        sx={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '15px 20px', bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0,0,0,0.05)',
          position: 'sticky', top: 0, zIndex: 1100
        }}
      >
        {/* LADO IZQUIERDO: MENÚ + LOGO */}
        <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton size="small" sx={{ color: '#334155' }} onClick={() => setDrawerOpen(true)}>
              <ListIcon size={26} weight="bold" />
            </IconButton>
            <Typography 
              variant="h5" fontWeight="900" color="#0F172A" 
              sx={{ letterSpacing: '2px', cursor: 'pointer', fontFamily: '"Roboto", sans-serif' }}
              onClick={() => navigate(user ? '/dashboard' : '/')}
            >
              SAVIA
            </Typography>
        </Stack>
        
        {/* LADO DERECHO: ACCIONES */}
        <Stack direction="row" alignItems="center" spacing={1}>
            
            {/* BOTÓN DE SALIR (Solo visible si hay usuario) */}
            {user && (
                <Tooltip title="Cerrar Sesión">
                    <IconButton 
                        onClick={handleLogout} 
                        size="small"
                        sx={{ 
                            color: '#EF5350', 
                            bgcolor: '#FFEBEE',
                            border: '1px solid #FFCDD2',
                            marginRight: 1,
                            '&:hover': { bgcolor: '#FFCDD2' } 
                        }}
                    >
                        <SignOut size={24} weight="bold" />
                    </IconButton>
                </Tooltip>
            )}

            {/* AVATAR DE PERFIL */}
            <Tooltip title={user ? "Ver mi Historial" : "Ingresar"}>
                <IconButton 
                    size="small" 
                    // AQUÍ ESTÁ EL CAMBIO: Si hay usuario -> va a /history
                    onClick={() => navigate(user ? '/history' : '/')}
                >
                   <Avatar sx={{ width: 36, height: 36, bgcolor: '#E0F2FE', border: '1px solid #E2E8F0' }}>
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt="User" style={{ width: '100%', height: '100%' }} />
                      ) : (
                        <UserCircle size={28} color="#0284C7" weight="duotone" />
                      )}
                   </Avatar>
                </IconButton>
            </Tooltip>
        </Stack>
      </Box>

      {/* --- DRAWER (MENÚ LATERAL) --- */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
            sx: {
                width: 320,
                background: 'linear-gradient(160deg, #F8FAFC 0%, #EFF6FF 100%)',
                borderRight: '1px solid rgba(255,255,255,0.8)',
                boxShadow: '10px 0 30px rgba(0,0,0,0.05)',
            }
        }}
      >
        <SaviaDrawer 
            onClose={() => setDrawerOpen(false)} 
            onOpenFuzzy={handleOpenFuzzy}
        />
      </Drawer>

      <FuzzyLogicModal open={fuzzyModalOpen} onClose={() => setFuzzyModalOpen(false)} />
    </>
  );
};

export default Header;