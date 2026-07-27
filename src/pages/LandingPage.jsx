/**
 * @license
 * © 2026 Tania Joseline Recendis Díaz. Todos los derechos reservados.
 * Autor: Tania Joseline Recendis Díaz
 */

import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Button, Grid, Chip, Stack, Link as MuiLink, Fade, Paper, Avatar 
} from '@mui/material';
import { 
  ChatCircleText, Brain, ShieldCheck, Heart, 
  MapPin, Phone, BookOpen, Sparkle, ArrowUpRight, Plant, User, SignOut, ArrowRight 
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

// IMPORTAMOS LIBRERÍA DE ANIMACIÓN
import Lottie from "lottie-react";

// --- ANIMACIONES LOTTIE ---
import hojasTopAnim from '../assets/animations/hojas_top.json'; 
import sunriseAnim from '../assets/animations/sunrise.json';
import pensamientosAnim from '../assets/animations/pensamientos.json';

// IMPORTAMOS EL FORMULARIO
import AuthForm from '../components/auth/AuthForm';

// FIREBASE
import { auth } from '../services/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// ESTILOS Y COMPONENTES LOCALES
import '../styles/LandingPage.css';
import FallingLeaves from '../components/FallingLeaves';
import Footer from '../components/Footer';
import Header from '../components/Header'; 
import fondoLanding from '../assets/backgrounddash/hojas.png'; 

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // DETECTAR USUARIO
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <Box 
        sx={{
            backgroundImage: `url(${fondoLanding})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            overflowX: 'hidden',
            position: 'relative'
        }}
    >
      {/* DECORACIÓN: HOJAS ANIMADAS SUPERIORES */}
      <Box sx={{ 
          position: 'absolute', 
          top: 90,       
          left: -30,     
          width: 320,    
          zIndex: 10, 
          pointerEvents: 'none', 
          filter: 'drop-shadow(0px 10px 10px rgba(0,0,0,0.1))'
      }}>
          <Lottie animationData={hojasTopAnim} loop={true} />
      </Box>

      {/* HEADER */}
      <Header />

      <Box sx={{ flex: 1 }}> 
        <FallingLeaves />

        {/* --- HERO SECTION --- */}
        <Container maxWidth="lg" sx={{ pt: 12, pb: 8, position: 'relative', zIndex: 2 }}>
            <Grid container spacing={5} alignItems="center">
                
                {/* TEXTO DE BIENVENIDA */}
                <Grid item xs={12} md={7}>
                    <Box className="animate-up delay-100">
                        <Chip 
                            icon={<Sparkle weight="fill" />} 
                            label="Inteligencia Emocional Orgánica" 
                            className="hero-chip"
                        />
                        <h1 className="hero-title">
                            Nutre tu mente, <br />
                            <span style={{ color: '#0369A1' }}>fortalece tu raíz.</span>
                        </h1>
                        <Typography className="hero-subtitle" sx={{ maxWidth: '90%' }}>
                            SAVIA es un ecosistema vivo. Utilizamos inteligencia afectiva para ayudarte a entender tus emociones y crecer desde adentro.
                        </Typography>
                        
                        {/* Botón extra si ya está logueado */}
                        {currentUser && (
                            <Button 
                                variant="contained" 
                                size="large"
                                onClick={() => navigate('/dashboard')}
                                endIcon={<ArrowRight />}
                                sx={{ 
                                    mt: 3, borderRadius: 50, px: 4, py: 1.5,
                                    background: 'linear-gradient(90deg, #0288D1 0%, #03A9F4 100%)',
                                    fontWeight: 'bold', boxShadow: '0 4px 15px rgba(2, 136, 209, 0.4)'
                                }}
                            >
                                Ir a mi Dashboard
                            </Button>
                        )}
                    </Box>
                </Grid>

                {/* LOGIN / REGISTRO / TARJETA USUARIO */}
                <Grid item xs={12} md={5}>
                    <Fade in={!loadingUser} timeout={1000}>
                        <Box sx={{ mt: {xs: 4, md: 0} }}>
                             {currentUser ? (
                                <Paper elevation={10} sx={{ 
                                    p: 4, borderRadius: 5, textAlign: 'center',
                                    bgcolor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255,255,255,0.9)'
                                }}>
                                    <Avatar sx={{ width: 80, height: 80, margin: '0 auto', mb: 2, bgcolor: '#E1F5FE' }}>
                                        {currentUser.photoURL ? (
                                            <img src={currentUser.photoURL} alt="user" style={{ width: '100%' }} />
                                        ) : (
                                            <User size={40} color="#0288D1" />
                                        )}
                                    </Avatar>
                                    
                                    <Typography variant="h5" fontWeight="800" color="#334155">
                                        ¡Hola, {currentUser.displayName ? currentUser.displayName.split(' ')[0] : 'Viajero'}!
                                    </Typography>
                                    <Typography variant="body2" color="#64748B" mb={3}>
                                        Tu espacio seguro está listo.
                                    </Typography>

                                    <Button 
                                        fullWidth variant="contained" size="large"
                                        onClick={() => navigate('/dashboard')}
                                        sx={{ 
                                            borderRadius: 3, py: 1.5, fontWeight: 'bold', mb: 2,
                                            background: 'linear-gradient(90deg, #2E7D32 0%, #43A047 100%)',
                                            boxShadow: '0 4px 15px rgba(46, 125, 50, 0.3)'
                                        }}
                                    >
                                        Continuar a Savia
                                    </Button>

                                    <Button 
                                        size="small" color="error" startIcon={<SignOut />} onClick={handleLogout}
                                        sx={{ opacity: 0.7 }}
                                    >
                                        Cerrar Sesión
                                    </Button>
                                </Paper>

                             ) : (
                                <AuthForm />
                             )}
                        </Box>
                    </Fade>
                </Grid>
            </Grid>
        </Container>

        {/* --- BENTO GRID --- */}
        <Container maxWidth="lg" sx={{ mb: 10, mt: 5 }}>
            <Box className="bento-container animate-up delay-300">
                
                {/* TARJETA MISIÓN + SOL */}
                <Box className="glass-panel span-8" sx={{ position: 'relative', overflow: 'hidden' }}>
                    <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={12} md={7}>
                             <Stack direction="row" alignItems="center" gap={2} mb={2}>
                                <div className="icon-circle" style={{ background: '#FFEBEE', color: '#EF5350' }}>
                                    <Heart weight="fill" />
                                </div>
                                <Typography variant="h5" fontWeight="800">Nuestra Misión</Typography>
                            </Stack>
                            <Typography variant="h6" fontWeight="500" color="text.secondary" lineHeight={1.6}>
                                Savia está aquí para sostenerte cuando el clima se pone difícil. Respira profundamente, no estás solo en este proceso.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Box sx={{ width: '100%', maxWidth: 220, mt: {xs: 2, md: 0} }}>
                                <Lottie animationData={sunriseAnim} loop={true} />
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* --- 2. TARJETA SEGURIDAD (CORREGIDA) --- */}
                {/* Icono a la izquierda, Animación a la derecha */}
                <Box className="glass-panel span-4">
                    <Grid container alignItems="center" justifyContent="space-between">
                        {/* IZQUIERDA: Contenido original */}
                        <Grid item xs={7}>
                            <div className="icon-circle" style={{ background: '#E0F2FE', color: '#0288D1', marginBottom: '12px' }}>
                                <ShieldCheck weight="fill" />
                            </div>
                            <Typography variant="h5" fontWeight="800" gutterBottom sx={{ fontSize: '1.3rem' }}>
                                Seguridad
                            </Typography>
                            <Typography variant="body2" color="text.secondary" lineHeight={1.4}>
                                Tus pensamientos son sagrados y están encriptados.
                            </Typography>
                        </Grid>

                        {/* DERECHA: Animación Pensamientos */}
                        <Grid item xs={5} display="flex" justifyContent="center">
                            <Box sx={{ width: '100%', maxWidth: 120 }}>
                                <Lottie animationData={pensamientosAnim} loop={true} />
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

            </Box>
        </Container>

        {/* --- SAVIA IA SECTION --- */}
        <Container maxWidth="lg">
            <Box className="lumi-section animate-up delay-300">
                <div className="glow-blob"></div>
                <Grid container spacing={6} alignItems="center" position="relative" zIndex={2}>
                    <Grid item xs={12} md={4} display="flex" justifyContent="center">
                        <div className="lumi-avatar-container">
                            <Plant size={100} weight="duotone" color="#38BDF8" />
                        </div>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Chip label="Inteligencia Viva" sx={{ bgcolor: 'rgba(56, 189, 248, 0.2)', color: '#7DD3FC', fontWeight: 700, mb: 2 }} />
                        <Typography variant="h3" fontWeight="800" gutterBottom>
                            Hola, soy Savia.
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 400, lineHeight: 1.8, mb: 4 }}>
                            No juzgo, solo acompaño y nutro tus pensamientos para ayudarte a florecer.
                        </Typography>
                        
                        <Button 
                            variant="contained" size="large"
                            sx={{ bgcolor: 'white', color: '#0F172A', borderRadius: '50px', fontWeight: 'bold' }}
                            onClick={scrollToTop}
                        >
                            Hablar con Savia
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Container>
      </Box>

      {/* FOOTER */}
      <Box sx={{ bgcolor: 'white' }}>
         <Footer />
      </Box>

    </Box>
  );
};

export default LandingPage;