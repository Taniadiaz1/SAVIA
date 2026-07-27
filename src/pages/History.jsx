/**
 * @license
 * © 2026 Tania Joseline Recendis Díaz. Todos los derechos reservados.
 * Autor: Tania Joseline Recendis Díaz
 */

import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Card, CardContent, Chip, IconButton, CircularProgress, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Slider, Tooltip, DialogContentText
} from '@mui/material';

// --- ICONOS (Phosphor Icons) ---
import { 
  CaretLeft, CalendarBlank, Trash, Notebook, PencilSimple, Check, 
  Warning, // Icono para alertas
  Smiley, SmileySad, SmileyMeh, SmileyNervous, Lightning, HeartBreak
} from '@phosphor-icons/react';

import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import hojasBg from '../assets/backgrounddash/hojas.png';

// FIREBASE
import { db, auth } from '../services/firebaseConfig';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore'; 
import { onAuthStateChanged } from 'firebase/auth';

// COMPONENTES Y DATOS
import BottomNavbar from '../components/BottomNavbar';
import EmergencyModal from '../components/EmergencyModal'; 
import { RISK_KEYWORDS } from '../data/emergencyData';   

const MOOD_MAP = {
  happy: { label: 'Feliz', color: '#4CAF50', icon: <Smiley weight="fill" /> },
  calm: { label: 'Calmado', color: '#2196F3', icon: <SmileyMeh weight="fill" /> },
  anxious: { label: 'Ansioso', color: '#FF9800', icon: <SmileyNervous weight="fill" /> },
  sad: { label: 'Triste', color: '#F44336', icon: <SmileySad weight="fill" /> },
  angry: { label: 'Enojado', color: '#D32F2F', icon: <Lightning weight="fill" /> },
  tired: { label: 'Cansado', color: '#78909C', icon: <HeartBreak weight="fill" /> },
  neutral: { label: 'Neutro', color: '#9E9E9E', icon: <SmileyMeh weight="regular" /> }
};

const History = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS ---
  const [editOpen, setEditOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null); 
  const [editNote, setEditNote] = useState('');
  const [editEnergy, setEditEnergy] = useState(5);

  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  // --- NUEVO ESTADO PARA ELIMINAR ---
  const [deleteId, setDeleteId] = useState(null); // Guarda el ID de lo que vamos a borrar

  // 1. CARGAR DATOS
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(collection(db, "users", user.uid, "entries"), orderBy("date", "desc"));
        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const loadedEntries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setEntries(loadedEntries);
          setLoading(false);
        });
        return () => unsubscribeSnapshot();
      } else {
        navigate('/');
      }
    });
    return () => unsubscribeAuth();
  }, [navigate]);

  // 2. DETECTAR RIESGO (Helper)
  const checkRisk = (note) => {
    if (!note) return false;
    return RISK_KEYWORDS.some(word => note.toLowerCase().includes(word));
  };

  // 3. ABRIR MODAL DE BORRAR (En lugar de window.confirm)
  const handleOpenDelete = (id) => {
    setDeleteId(id); // Guardamos el ID y esto abre el modal automáticamente
  };

  // 4. CONFIRMAR BORRADO
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, "users", auth.currentUser.uid, "entries", deleteId));
      setDeleteId(null); // Cerramos el modal
    } catch (error) {
      console.error("Error borrando:", error);
    }
  };

  // 5. ABRIR EDITOR
  const handleOpenEdit = (entry) => {
    setCurrentEntry(entry);
    setEditNote(entry.note || '');
    setEditEnergy(entry.energyLevel || 5);
    setEditOpen(true);
  };

  // 6. ACTUALIZAR CON SEGURIDAD
  const handlePreUpdate = () => {
    if (checkRisk(editNote)) {
      setEmergencyModalOpen(true); 
    } else {
      performUpdate();
    }
  };

  const performUpdate = async () => {
    if (!currentEntry) return;
    try {
      const entryRef = doc(db, "users", auth.currentUser.uid, "entries", currentEntry.id);
      await updateDoc(entryRef, { note: editNote, energyLevel: editEnergy });
      setEditOpen(false); 
      setEmergencyModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  // 7. GEOLOCALIZACIÓN
  const handleFindHelp = () => {
    if (!navigator.geolocation) return window.open('http://googleusercontent.com/maps.google.com/search?q=psicologos+ayuda', '_blank');
    navigator.geolocation.getCurrentPosition((pos) => {
      window.open(`https://www.google.com/maps/search/psicologos+clinicas+salud+mental/@$${pos.coords.latitude},${pos.coords.longitude},14z`, '_blank');
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Fecha desconocida";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(); 
    return new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(date);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', pb: 12, bgcolor: '#F8FAFC', backgroundImage: `url(${hojasBg})`, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
        
        {/* HEADER */}
        <Box sx={{ bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', py: 2, px: 3, position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <Stack direction="row" alignItems="center" gap={2}>
                <IconButton onClick={() => navigate('/dashboard')} sx={{ color: '#334155' }}><CaretLeft size={24} weight="bold" /></IconButton>
                <Typography variant="h6" fontWeight="800" color="#1E293B">Mi Historial</Typography>
            </Stack>
        </Box>

        <Container maxWidth="md" sx={{ pt: 4 }}>
          {loading ? <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box> : entries.length === 0 ? (
             <Box textAlign="center" sx={{ opacity: 0.7, mt: 8 }}><Notebook size={64} color="#CBD5E1" weight="duotone" /><Typography variant="h6" color="text.secondary" mt={2}>Tu diario está vacío.</Typography></Box>
          ) : (
            <Stack spacing={2}>
                {entries.map((entry) => {
                    const moodConfig = MOOD_MAP[entry.mood] || MOOD_MAP['neutral'];
                    const isRisk = checkRisk(entry.note);

                    return (
                        <Card key={entry.id} sx={{ borderRadius: 4, borderLeft: `6px solid ${isRisk ? '#EF5350' : moodConfig.color}`, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                    <Stack direction="row" gap={2} alignItems="center">
                                        <Box sx={{ bgcolor: `${moodConfig.color}15`, color: moodConfig.color, p: 1, borderRadius: 3, display: 'flex' }}>
                                            {React.cloneElement(moodConfig.icon, { size: 32 })}
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="800" color="#334155">{moodConfig.label}</Typography>
                                            <Typography variant="caption" sx={{ textTransform: 'capitalize', fontWeight: 500, color: '#94A3B8' }}>{formatDate(entry.date)}</Typography>
                                        </Box>
                                    </Stack>

                                    {/* BOTONES DE ACCIÓN */}
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        {isRisk && (
                                            <Tooltip title="Se detectó contenido sensible. Clic para ver ayuda.">
                                                <IconButton size="small" onClick={() => setEmergencyModalOpen(true)} sx={{ color: '#D32F2F', bgcolor: '#FFEBEE', mr: 1, border: '1px solid #FFCDD2', animation: 'pulse 2s infinite' }}>
                                                    <Warning size={20} weight="fill" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <IconButton size="small" onClick={() => handleOpenEdit(entry)} sx={{ color: '#64748B' }}><PencilSimple size={20} weight="bold" /></IconButton>
                                        
                                        {/* AQUI CAMBIAMOS: Ahora abre el modal personalizado */}
                                        <IconButton size="small" onClick={() => handleOpenDelete(entry.id)} sx={{ color: '#CBD5E1', '&:hover': { color: '#EF5350' } }}>
                                            <Trash size={20} weight="bold" />
                                        </IconButton>
                                    </Stack>
                                </Stack>
                                
                                {entry.note && (
                                    <Box sx={{ bgcolor: isRisk ? '#FEF2F2' : '#F8FAFC', p: 2, borderRadius: 3, mb: 2, border: isRisk ? '1px solid #FECACA' : '1px solid #F1F5F9' }}>
                                        <Typography variant="body2" color="#475569" sx={{ fontStyle: 'italic' }}>"{entry.note}"</Typography>
                                    </Box>
                                )}

                                <Stack direction="row" gap={1} flexWrap="wrap">
                                    <Chip size="small" label={`Energía: ${entry.energyLevel}/10`} sx={{ bgcolor: '#F1F5F9', fontWeight: 600, color: '#475569' }} />
                                    {isRisk && <Chip size="small" label="Atención Requerida" sx={{ bgcolor: '#D32F2F', color: 'white', fontWeight: 'bold' }} icon={<Warning color="white" weight="fill"/>} />}
                                </Stack>
                            </CardContent>
                        </Card>
                    );
                })}
            </Stack>
          )}
        </Container>

        <BottomNavbar />

        {/* --- MODAL DE EDICIÓN --- */}
        <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: 'bold', color: '#334155' }}>Editar Entrada</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <TextField label="Nota" multiline minRows={3} fullWidth value={editNote} onChange={(e) => setEditNote(e.target.value)} variant="outlined" />
                    <Box><Typography gutterBottom variant="caption" fontWeight="bold">Nivel de Energía ({editEnergy}/10)</Typography><Slider value={editEnergy} onChange={(e, v) => setEditEnergy(v)} min={0} max={10} step={1} marks /></Box>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={() => setEditOpen(false)} color="inherit">Cancelar</Button>
                <Button onClick={handlePreUpdate} variant="contained" startIcon={<Check />} sx={{ borderRadius: 4 }}>Guardar Cambios</Button>
            </DialogActions>
        </Dialog>

        {/* --- MODAL DE CONFIRMACIÓN DE BORRADO (NUEVO) --- */}
        <Dialog
            open={!!deleteId}
            onClose={() => setDeleteId(null)}
            PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#D32F2F', fontWeight: 'bold' }}>
                <Trash size={28} /> ¿Eliminar esta memoria?
            </DialogTitle>
            <DialogContent>
                <DialogContentText color="text.secondary">
                    Esta acción es permanente y no se podrá deshacer. ¿Estás seguro de que quieres borrarla de tu historial?
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={() => setDeleteId(null)} color="inherit" sx={{ borderRadius: 2 }}>
                    Cancelar
                </Button>
                <Button onClick={confirmDelete} variant="contained" color="error" autoFocus sx={{ borderRadius: 2, boxShadow: 'none' }}>
                    Sí, Eliminar
                </Button>
            </DialogActions>
        </Dialog>

        {/* --- MODAL DE EMERGENCIA --- */}
        <EmergencyModal 
            open={emergencyModalOpen}
            onClose={() => setEmergencyModalOpen(false)}
            onConfirm={() => { if (editOpen) performUpdate(); else setEmergencyModalOpen(false); }}
            onFindHelp={handleFindHelp} 
        />

      </Box>
    </ThemeProvider>
  );
};

export default History;