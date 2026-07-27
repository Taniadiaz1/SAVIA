/**
 * @license
 * © 2026 Tania Joseline Recendis Díaz. Todos los derechos reservados.
 * Autor: Tania Joseline Recendis Díaz
 */

import React, { useState } from 'react';
import { 
  Box, Container, Typography, TextField, Button, Stack, Alert, CircularProgress, InputAdornment, IconButton, Paper, Fade
} from '@mui/material';
import { 
  Envelope, Lock, Eye, EyeSlash, GoogleLogo, User, ArrowLeft 
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import hojasBg from '../assets/backgrounddash/hojas.png'; 

// FIREBASE
import { auth, googleProvider, db } from '../services/firebaseConfig'; 
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  sendEmailVerification 
} from 'firebase/auth';

// 🔥 IMPORTANTE: Agregamos getDoc
import { doc, setDoc, getDoc } from 'firebase/firestore';

const Login = () => {
  const navigate = useNavigate();

  // Estados
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // 1. LOGIN CON GOOGLE (CORREGIDO PARA NO SOBRESCRIBIR ADMIN)
  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 🔥 PROTECCIÓN DE ROLES 🔥
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // Usuario existente (ej: Admin): Solo actualizamos fecha
        await setDoc(userDocRef, {
            lastLogin: new Date()
        }, { merge: true });
      } else {
        // Usuario nuevo: Rol por defecto 'user'
        await setDoc(userDocRef, {
            name: user.displayName,
            email: user.email,
            role: "user",
            createdAt: new Date(),
            lastLogin: new Date()
        });
      }

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError("Error al entrar con Google.");
      setLoading(false);
    }
  };

  // 2. LOGIN / REGISTRO CORREO
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfoMsg('');

    try {
      if (isRegistering) {
        // --- REGISTRO ---
        if (name.length < 2) throw { code: 'custom/short-name' };
        
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(res.user, { displayName: name });
        
        // Guardar en BD (Siempre rol user porque es nuevo)
        await setDoc(doc(db, "users", res.user.uid), {
            name: name,
            email: email,
            role: "user",
            createdAt: new Date(),
            lastLogin: new Date(),
            emailVerified: false // 🔥 IMPORTANTE: Marcamos como NO verificado
        });

        // 🔥 ENVÍO DE CORREO DE VERIFICACIÓN MEJORADO 🔥
        const actionCodeSettings = {
            url: window.location.origin + '/dashboard',
            handleCodeInApp: true
        };

        try {
            await sendEmailVerification(res.user, actionCodeSettings);
            console.log("✅ Correo de verificación enviado exitosamente a:", res.user.email);
            setInfoMsg("¡Cuenta creada! Revisa tu correo para validar (revisa spam también). No podrás acceder hasta verificar tu correo.");
        } catch (emailErr) {
            console.error("❌ Error al enviar correo:", emailErr);
            
            // Mensajes específicos según el error
            if (emailErr.code === 'auth/too-many-requests') {
                setInfoMsg("Cuenta creada, pero no se pudo enviar el correo. Demasiados intentos. Espera unos minutos.");
            } else {
                setInfoMsg("¡Cuenta creada! Revisa tu correo (puede estar en spam). Si no llega, contacta soporte.");
            }
        }
        
        setLoading(false);
        // 🔥 NO NAVEGAMOS AL DASHBOARD, el usuario debe verificar primero

      } else {
        // --- LOGIN ---
        const res = await signInWithEmailAndPassword(auth, email, password);
        
        // 🔥 VERIFICAMOS SI EL CORREO ESTÁ VERIFICADO
        if (!res.user.emailVerified) {
            setError("Por favor verifica tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.");
            setLoading(false);
            // Cerramos la sesión porque no está verificado
            await auth.signOut();
            return; // 🔥 NO DEJAMOS PASAR
        }

        // Actualizar último login sin tocar rol
        await setDoc(doc(db, "users", res.user.uid), {
            lastLogin: new Date(),
            emailVerified: true // Actualizamos en BD también
        }, { merge: true });

        // Solo si está verificado, dejamos pasar
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/wrong-password') setError("Contraseña incorrecta.");
      else if (err.code === 'auth/user-not-found') setError("Usuario no encontrado.");
      else if (err.code === 'auth/invalid-credential') setError("Credenciales incorrectas.");
      else if (err.code === 'auth/email-already-in-use') setError("El correo ya existe.");
      else if (err.code === 'auth/weak-password') setError("La contraseña es muy corta (min 6).");
      else if (err.code === 'auth/invalid-email') setError("Correo electrónico inválido.");
      else if (err.code === 'custom/short-name') setError("Escribe un nombre válido.");
      else setError("Ocurrió un error. Intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
          minHeight: '100vh', backgroundImage: `url(${hojasBg})`, backgroundSize: 'cover',
          display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2
      }}>
        <Container maxWidth="xs">
          <Fade in={true} timeout={800}>
            <Paper elevation={10} sx={{ 
                p: 4, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' 
            }}>
                <IconButton onClick={() => navigate('/')} sx={{ mb: 1, color: '#64748B' }}><ArrowLeft /></IconButton>

                <Box textAlign="center" mb={3}>
                    <Typography variant="h5" fontWeight="900" color="#1E293B">{isRegistering ? 'Crear Cuenta' : 'Bienvenido'}</Typography>
                    <Typography variant="body2" color="#64748B">{isRegistering ? 'Únete a Savia hoy' : 'Ingresa para continuar'}</Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {infoMsg && <Alert severity="success" sx={{ mb: 2 }}>{infoMsg}</Alert>}

                <form onSubmit={handleEmailAuth}>
                    <Stack spacing={2}>
                        {isRegistering && (
                            <TextField fullWidth placeholder="Tu Nombre" value={name} onChange={e => setName(e.target.value)}
                                InputProps={{ startAdornment: <InputAdornment position="start"><User color="#94A3B8"/></InputAdornment> }} />
                        )}
                        <TextField fullWidth placeholder="Correo" type="email" value={email} onChange={e => setEmail(e.target.value)}
                            InputProps={{ startAdornment: <InputAdornment position="start"><Envelope color="#94A3B8"/></InputAdornment> }} />
                        <TextField fullWidth placeholder="Contraseña" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                            InputProps={{ 
                                startAdornment: <InputAdornment position="start"><Lock color="#94A3B8"/></InputAdornment>,
                                endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeSlash/> : <Eye/>}</IconButton></InputAdornment>)
                            }} />

                        <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ borderRadius: 3, fontWeight: 'bold' }}>
                            {loading ? <CircularProgress size={24} color="inherit"/> : (isRegistering ? 'Registrarse' : 'Entrar')}
                        </Button>
                    </Stack>
                </form>

                <Box sx={{ my: 3, borderBottom: '1px solid #E2E8F0' }} />

                <Button fullWidth variant="outlined" startIcon={<GoogleLogo weight="bold" color="#DB4437"/>} onClick={handleGoogle} disabled={loading}
                    sx={{ borderRadius: 3, bgcolor: 'white', color: '#475569', borderColor: '#CBD5E1' }}>
                    Entrar con Google
                </Button>

                <Typography textAlign="center" mt={3} variant="body2" color="#64748B">
                    {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
                    <Button onClick={() => {setIsRegistering(!isRegistering); setError(''); setInfoMsg('')}} sx={{ fontWeight: 'bold' }}>
                        {isRegistering ? 'Inicia Sesión' : 'Regístrate'}
                    </Button>
                </Typography>

            </Paper>
          </Fade>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Login;
