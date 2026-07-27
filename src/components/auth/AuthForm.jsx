import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Stack, TextField, InputAdornment, IconButton, Alert, CircularProgress, Paper, Fade 
} from '@mui/material';
import { 
  GoogleLogo, Envelope, Lock, Eye, EyeSlash, User, EnvelopeOpen 
} from '@phosphor-icons/react';

// IMPORTAMOS NAVIGATE
import { useNavigate } from 'react-router-dom';

// FIREBASE
import { auth, googleProvider, db } from '../../services/firebaseConfig';
import { 
    signInWithPopup, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    updateProfile, 
    sendEmailVerification
} from 'firebase/auth';

// 🔥 IMPORTANTE: Agregamos getDoc para consultar antes de guardar
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthForm = () => {
  const navigate = useNavigate();

  // Estados del Formulario
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Estado de carga y errores
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estado de espera de verificación
  const [awaitingVerification, setAwaitingVerification] = useState(false);

  // ---------------------------------------------------------
  // EL MAGO: EFECTO QUE REVISA SI YA VERIFICÓ
  // ---------------------------------------------------------
  useEffect(() => {
    let interval;
    if (awaitingVerification) {
        interval = setInterval(async () => {
            const user = auth.currentUser;
            if (user) {
                await user.reload();
                if (user.emailVerified) {
                    clearInterval(interval);
                    navigate('/dashboard');
                }
            }
        }, 3000);
    }
    return () => clearInterval(interval);
  }, [awaitingVerification, navigate]);

  
  // --- LOGIN CON GOOGLE (CORREGIDO PARA NO BORRAR ADMIN) ---
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // 🔥 LÓGICA DE PROTECCIÓN DE ROLES 🔥
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // SI YA EXISTE (Admin o User viejo): Solo actualizamos fecha
        // NO tocamos el rol
        await setDoc(userDocRef, {
            lastLogin: new Date()
        }, { merge: true });
      } else {
        // SI ES NUEVO: Lo creamos con rol de usuario por defecto
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
      setError("No pudimos iniciar con Google.");
      setLoading(false);
    }
  };

  // --- LOGIN / REGISTRO POR CORREO ---
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
        // --- REGISTRO NUEVO ---
        if (name.length < 2) throw { code: 'custom/short-name' };
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });

        // Guardamos en BD (Como es registro nuevo, aquí si forzamos "user")
        await setDoc(doc(db, "users", user.uid), {
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
            await sendEmailVerification(user, actionCodeSettings);
            console.log("✅ Correo de verificación enviado exitosamente a:", user.email);
        } catch (emailErr) {
            console.error("❌ Error al enviar correo de verificación:", emailErr);
            
            // Mostramos el error específico al usuario
            if (emailErr.code === 'auth/too-many-requests') {
                setError("Demasiados intentos. Espera unos minutos e intenta de nuevo.");
            } else if (emailErr.code === 'auth/invalid-email') {
                setError("El correo electrónico no es válido.");
            } else {
                console.warn("No se pudo enviar el correo, pero continuamos...");
            }
        }
        
        // 🔥 SIEMPRE MOSTRAMOS PANTALLA DE VERIFICACIÓN DESPUÉS DE REGISTRO
        setLoading(false);
        setAwaitingVerification(true);

      } else {
        // --- LOGIN NORMAL ---
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 🔥 VERIFICAMOS SI EL CORREO ESTÁ VERIFICADO
        if (!user.emailVerified) {
            // Si NO está verificado, mostramos pantalla de espera
            setLoading(false);
            setAwaitingVerification(true);
            return; // 🔥 NO DEJAMOS PASAR
        }

        // Actualizamos fecha de login sin tocar rol
        await setDoc(doc(db, "users", user.uid), {
            lastLogin: new Date(),
            emailVerified: true // Actualizamos en BD también
        }, { merge: true });
        
        // Solo si está verificado, dejamos pasar
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Error:", err.code);
      let msg = "Error al conectar.";
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') msg = "Correo o contraseña incorrectos.";
      else if (err.code === 'auth/email-already-in-use') msg = "Este correo ya existe.";
      else if (err.code === 'auth/weak-password') msg = "Contraseña muy corta (min 6).";
      else if (err.code === 'auth/invalid-email') msg = "Correo electrónico inválido.";
      else if (err.code === 'custom/short-name') msg = "Nombre muy corto.";
      
      setError(msg);
      setLoading(false);
    }
  };

  // 🔥 FUNCIÓN PARA REENVIAR CORREO DE VERIFICACIÓN 🔥
  const handleResendEmail = async () => {
    const user = auth.currentUser;
    if (!user) {
        alert('No hay usuario autenticado.');
        return;
    }

    try {
        const actionCodeSettings = {
            url: window.location.origin + '/dashboard',
            handleCodeInApp: true
        };
        
        await sendEmailVerification(user, actionCodeSettings);
        alert('✅ Correo reenviado exitosamente. Revisa tu bandeja de entrada y spam.');
    } catch (err) {
        console.error("Error al reenviar:", err);
        if (err.code === 'auth/too-many-requests') {
            alert('⏳ Demasiados intentos. Espera unos minutos antes de reenviar.');
        } else {
            alert('❌ Error al reenviar. Intenta más tarde.');
        }
    }
  };

  // VISTA: PANTALLA DE ESPERA
  if (awaitingVerification) {
      return (
        <Paper elevation={10} sx={{ 
            p: 4, borderRadius: 5, textAlign: 'center',
            bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)'
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Box sx={{ p: 2, bgcolor: '#E8F5E9', borderRadius: '50%', animation: 'pulse 2s infinite' }}>
                    <EnvelopeOpen size={48} color="#2E7D32" weight="duotone" />
                </Box>
            </Box>
            <Typography variant="h5" fontWeight="800" color="#1E293B" gutterBottom>
                ¡Casi listo, {name || auth.currentUser?.displayName || 'Viajero'}!
            </Typography>
            <Typography variant="body1" color="#475569" sx={{ mb: 3 }}>
                Hemos enviado un enlace a <strong>{email || auth.currentUser?.email}</strong>.<br/>
                Por favor, ve a tu correo y dale clic a verificar.
                <br/><br/>
                <Typography variant="caption" color="#64748B" sx={{ fontStyle: 'italic' }}>
                    💡 Tip: Revisa tu carpeta de spam o correo no deseado si no lo ves.
                </Typography>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3, bgcolor: '#F1F5F9', p: 1.5, borderRadius: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="caption" color="#64748B" fontWeight="600">Esperando confirmación...</Typography>
            </Box>
            <Stack spacing={2}>
                <Button variant="outlined" size="small" onClick={handleResendEmail}>
                    ¿No llegó? Reenviar correo
                </Button>
                <Button 
                    variant="text" 
                    size="small" 
                    onClick={() => {
                        auth.signOut();
                        setAwaitingVerification(false);
                        setEmail('');
                        setPassword('');
                        setName('');
                    }}
                    sx={{ color: '#64748B' }}
                >
                    Cerrar sesión y volver
                </Button>
            </Stack>
        </Paper>
      );
  }

  // VISTA: FORMULARIO
  return (
    <Paper elevation={10} sx={{ 
        p: 4, borderRadius: 5, 
        bgcolor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', 
        border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)'
    }}>
        <Box textAlign="center" mb={3}>
            <Typography variant="h5" fontWeight="800" color="#334155">{isRegistering ? 'Únete a Savia 🌱' : '¡Hola de nuevo! 👋'}</Typography>
            <Typography variant="body2" color="#64748B">{isRegistering ? 'Crea tu cuenta para crecer' : 'Ingresa para ver tu progreso'}</Typography>
        </Box>

        {error && <Fade in={true}><Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{error}</Alert></Fade>}

        <form onSubmit={handleEmailAuth}>
            <Stack spacing={2}>
                {isRegistering && (
                    <TextField fullWidth placeholder="Tu Nombre" variant="outlined" value={name} onChange={(e) => setName(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><User color="#94A3B8"/></InputAdornment>, sx: { borderRadius: 3, bgcolor: '#fff' } }} />
                )}
                <TextField fullWidth placeholder="Correo Electrónico" variant="outlined" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Envelope color="#94A3B8"/></InputAdornment>, sx: { borderRadius: 3, bgcolor: '#fff' } }} />
                
                <TextField fullWidth placeholder="Contraseña" variant="outlined" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    InputProps={{ 
                        startAdornment: <InputAdornment position="start"><Lock color="#94A3B8"/></InputAdornment>,
                        endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeSlash /> : <Eye />}</IconButton></InputAdornment>),
                        sx: { borderRadius: 3, bgcolor: '#fff' } 
                    }} />

                <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}
                    sx={{ borderRadius: 3, py: 1.5, fontWeight: 'bold', textTransform: 'none', fontSize: '1rem', background: 'linear-gradient(90deg, #2E7D32 0%, #43A047 100%)', boxShadow: '0 4px 14px rgba(46, 125, 50, 0.3)' }}>
                    {loading ? <CircularProgress size={24} color="inherit"/> : (isRegistering ? 'Registrarse' : 'Ingresar')}
                </Button>
            </Stack>
        </form>

        <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
            <Box sx={{ flex: 1, height: '1px', bgcolor: '#CBD5E1' }} />
            <Typography variant="caption" sx={{ px: 2, color: '#64748B', fontWeight: 600 }}>O accede con</Typography>
            <Box sx={{ flex: 1, height: '1px', bgcolor: '#CBD5E1' }} />
        </Box>

        <Button fullWidth variant="outlined" onClick={handleGoogleLogin} disabled={loading} startIcon={<GoogleLogo weight="bold" color="#DB4437" />}
            sx={{ borderRadius: 3, py: 1.2, textTransform: 'none', fontWeight: 'bold', borderColor: '#CBD5E1', color: '#475569', bgcolor: 'white', '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' } }}>
            Google
        </Button>

        <Box textAlign="center" mt={3}>
            <Typography variant="body2" color="#64748B">
                {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
                <Button onClick={() => { setIsRegistering(!isRegistering); setError(''); }} sx={{ ml: 0.5, fontWeight: 'bold', textTransform: 'none', color: '#0288D1' }}>
                    {isRegistering ? 'Inicia Sesión' : 'Regístrate gratis'}
                </Button>
            </Typography>
        </Box>
    </Paper>
  );
};

export default AuthForm;
