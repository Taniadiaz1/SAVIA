/**
 * @license
 * © 2026 Tania Joseline Recendis Díaz. Todos los derechos reservados.
 * Autor: Tania Joseline Recendis Díaz
 */

import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Paper, Chip, IconButton, CircularProgress, Grid, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Switch, FormControlLabel, Stack, Divider, Avatar, Fade, LinearProgress, TextField, InputAdornment, Snackbar, Alert
} from '@mui/material';
import { 
  ShieldCheck, Warning, UsersThree, Siren, Pulse, X, TrendUp, BatteryCharging, CaretRight, MagnifyingGlass, Funnel, Trash, DownloadSimple, PaperPlaneTilt
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, CartesianGrid, YAxis } from 'recharts';
import Lottie from "lottie-react";

// Firebase
import { db, auth } from '../services/firebaseConfig';
import { collection, getDocs, query, limit, orderBy, doc, getDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Assets
import Header from '../components/Header';
import theme from '../theme';
import { ThemeProvider } from '@mui/material/styles';
import hojasBg from '../assets/backgrounddash/hojas.png'; 
import animationData from '../assets/animations/grafica.json';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Datos
  const [usersList, setUsersList] = useState([]);
  const [stats, setStats] = useState({ total: 0, risky: 0, active: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [populationData, setPopulationData] = useState([]); 
  
  // Filtros y Modales
  const [showRiskyOnly, setShowRiskyOnly] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingPatient, setLoadingPatient] = useState(false);

  // Estados para Feedback
  const [sendingEmail, setSendingEmail] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const checkAdminAndFetchData = async (currentUser) => {
      if (!currentUser) { navigate('/'); return; }
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        const userRole = userDoc.exists() ? (userDoc.data().role || '') : '';
        
        if (userRole.trim() === 'admin') {
          fetchUsersData(); 
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error("Error admin:", error);
        setLoading(false);
      }
    };
    const unsubscribe = onAuthStateChanged(auth, (user) => checkAdminAndFetchData(user));
    return () => unsubscribe();
  }, [navigate]);

  const fetchUsersData = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      // Inicializamos array de 10 posiciones (niveles 1-10) en 0
      const energyDistribution = Array(10).fill(0); 

      const promises = usersSnapshot.docs.map(async (userDoc) => {
        const userData = userDoc.data();
        const uid = userDoc.id;
        const displayName = userData.displayName || userData.name || (userData.email ? userData.email.split('@')[0] : "Sin Nombre");

        const entriesRef = collection(db, "users", uid, "entries");
        const q = query(entriesRef, orderBy("date", "desc"), limit(1));
        
        let lastStatus = "Inactivo";
        let isRisky = false;
        let lastDate = null;
        let energy = 0;
        
        const entrySnapshot = await getDocs(q);

        if (!entrySnapshot.empty) {
          const entry = entrySnapshot.docs[0].data();
          lastDate = entry.date?.toDate ? entry.date.toDate() : new Date();
          energy = entry.energyLevel || 0;
          
          // Llenar distribución para la gráfica grande
          if (energy > 0) {
             const index = Math.min(Math.floor(energy) - 1, 9); // Asegurar índice 0-9
             if(index >= 0) energyDistribution[index] += 1;
          }

          if (entry.ai_analysis?.risk_detected || (energy <= 3 && ['triste', 'deprimido', 'ansioso'].includes(entry.mood))) {
            isRisky = true;
          }
          lastStatus = entry.mood || "Neutral";
        }

        return {
          id: uid, name: displayName, email: userData.email || "No disponible",
          lastStatus, isRisky, lastDate, lastEnergy: energy,
          avatarUrl: userData.photoURL || null
        };
      });

      const resolvedUsers = await Promise.all(promises);
      const sortedUsers = resolvedUsers.sort((a, b) => (b.isRisky - a.isRisky) || (b.lastDate - a.lastDate));
      
      setUsersList(sortedUsers);
      
      // Preparar Datos Macro con formato bonito
      const macroData = energyDistribution.map((count, i) => ({ level: i + 1, count }));
      setPopulationData(macroData);

      setStats({ 
        total: usersSnapshot.size, 
        risky: resolvedUsers.filter(u => u.isRisky).length, 
        active: resolvedUsers.filter(u => u.lastStatus !== "Inactivo").length 
      });
      setLoading(false);

    } catch (error) {
      console.error("Error cargando usuarios:", error);
      setLoading(false);
    }
  };

  // --- FUNCIONES DE ACCIÓN ---

  const handleExportCSV = () => {
    const headers = "ID,Nombre,Email,Estado,Riesgo,Energia,UltimaConexion\n";
    const rows = usersList.map(u => 
        `${u.id},"${u.name}",${u.email},${u.lastStatus},${u.isRisky ? 'SI' : 'NO'},${u.lastEnergy},${u.lastDate ? u.lastDate.toISOString() : 'N/A'}`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Savia_Reporte_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showSnackbar("Reporte descargado correctamente", "success");
  };

  const handleDeleteUser = async () => {
      if(!selectedPatient) return;
      if(!window.confirm(`¿Estás seguro de eliminar a ${selectedPatient.name}? Esta acción no se puede deshacer.`)) return;

      try {
          await deleteDoc(doc(db, "users", selectedPatient.id));
          setUsersList(prev => prev.filter(u => u.id !== selectedPatient.id));
          setStats(prev => ({...prev, total: prev.total - 1}));
          handleCloseModal();
          showSnackbar("Usuario eliminado del sistema", "success");
      } catch (e) {
          console.error("Error eliminando:", e);
          showSnackbar("Error al eliminar usuario", "error");
      }
  };

  const handleSendAlert = async () => {
      if (!selectedPatient || !selectedPatient.email) {
          showSnackbar("El usuario no tiene un email válido", "error");
          return;
      }

      setSendingEmail(true);

      try {
          await addDoc(collection(db, "mail"), {
              to: [selectedPatient.email], 
              message: {
                  subject: `⚠️ Soporte Savia: Hola ${selectedPatient.name.split(' ')[0]}, estamos contigo`,
                  html: `
                      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                          <h2 style="color: #4F46E5;">Hola, ${selectedPatient.name}</h2>
                          <p>Desde el centro de monitoreo de <strong>Savia</strong>, hemos notado que tus niveles de energía han estado bajos últimamente.</p>
                          <p>Queremos recordarte que no estás solo/a. Aquí tienes algunos recursos rápidos:</p>
                          <ul>
                              <li>📞 <strong>Línea de Vida:</strong> 800-911-2000</li>
                              <li>🧘 <strong>Ejercicio Recomendado:</strong> Intenta la meditación guiada en tu app.</li>
                          </ul>
                          <p>Si necesitas hablar, responde a este correo.</p>
                          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                          <p style="font-size: 12px; color: #777;">Atentamente,<br>El equipo de Dr. Savia 🌿</p>
                      </div>
                  `
              }
          });

          showSnackbar(`Correo de ayuda enviado a ${selectedPatient.email}`, "success");
          
      } catch (e) {
          console.error("Error enviando alerta:", e);
          showSnackbar("Error de conexión al enviar correo", "error");
      } finally {
          setSendingEmail(false);
      }
  };

  const showSnackbar = (message, severity) => {
      setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (event, reason) => {
      if (reason === 'clickaway') return;
      setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenPatient = async (user) => {
      setLoadingPatient(true);
      setModalOpen(true);
      try {
          const q = query(collection(db, "users", user.id, "entries"), orderBy("date", "desc"), limit(7));
          const snap = await getDocs(q);
          const history = snap.docs.map(doc => {
              const d = doc.data();
              return {
                  date: d.date?.toDate().toLocaleDateString(undefined, {weekday: 'short', day:'numeric'}),
                  energy: d.energyLevel || 0,
              };
          }).reverse();
          setSelectedPatient({ ...user, history });
      } catch (e) { console.error(e); }
      setLoadingPatient(false);
  };

  const handleCloseModal = () => { setModalOpen(false); setSelectedPatient(null); };
  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : "NA";

  const filteredList = usersList.filter(user => {
      const matchesRisk = showRiskyOnly ? user.isRisky : true;
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesRisk && matchesSearch;
  });

  if (loading) return <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
          minHeight: '100vh', 
          bgcolor: '#F8FAFC', 
          backgroundImage: `url(${hojasBg})`,
          backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom right',
          backgroundSize: '25%', backgroundAttachment: 'fixed',
          pb: 12
      }}>
        <Header />
        
        <Container maxWidth="xl" sx={{ pt: 5 }}>
          
          <Fade in={true} timeout={800}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={5} flexWrap="wrap" gap={3} 
                sx={{ bgcolor: 'rgba(255,255,255,0.8)', p: 3, borderRadius: 2, border: '1px solid #E2E8F0', backdropFilter: 'blur(8px)' }}>
              <Box display="flex" alignItems="center" gap={3}>
                  <Box sx={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F1F5F9', borderRadius: 2 }}>
                      <Lottie animationData={animationData} loop={true} style={{ width: '100%', height: '100%' }} />
                  </Box>
                  <Box>
                      <Typography variant="h4" fontWeight="800" color="#0F172A" sx={{ letterSpacing: -0.5 }}>
                        Savia Admin
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981', boxShadow: '0 0 0 2px #D1FAE5' }} />
                          <Typography variant="body2" color="text.secondary" fontWeight="500">
                            {stats.active} Usuarios activos • Sistema v1.2
                          </Typography>
                      </Stack>
                  </Box>
              </Box>

              <Box display="flex" gap={2} alignItems="center">
                  <Button 
                    startIcon={<DownloadSimple weight="bold" />} 
                    variant="outlined" 
                    onClick={handleExportCSV}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold', borderColor: '#E2E8F0', color: '#64748B' }}
                  >
                    Exportar
                  </Button>

                  <TextField 
                    placeholder="Buscar..." 
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ bgcolor: '#FFF', borderRadius: 2, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#E2E8F0' }, borderRadius: 2 }, width: 220 }}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><MagnifyingGlass size={18} color="#94A3B8"/></InputAdornment>
                    }}
                  />
                  <FormControlLabel 
                      control={<Switch checked={showRiskyOnly} onChange={(e) => setShowRiskyOnly(e.target.checked)} color="error" size="small" />} 
                      label={<Typography variant="caption" fontWeight="bold" color={showRiskyOnly ? "#DC2626" : "text.secondary"} sx={{ textTransform: 'uppercase' }}>Solo Riesgo</Typography>}
                      sx={{ mr: 0, border: '1px solid', borderColor: showRiskyOnly ? '#FECDD3' : '#E2E8F0', px: 2, py: 0.8, borderRadius: 2, bgcolor: showRiskyOnly ? '#FEF2F2' : '#FFF', transition: '0.2s', ml: 1 }} 
                  />
              </Box>
            </Box>
          </Fade>

          {/* --- KPI STATS --- */}
          <Grid container spacing={3} mb={5}>
             <Grid item xs={12} md={3}>
                <Card sx={{ borderRadius: 2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #E2E8F0', height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Pacientes</Typography>
                                <Typography variant="h4" fontWeight="800" color="#1E293B">{stats.total}</Typography>
                            </Box>
                            <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: '#EFF6FF', color: '#3B82F6' }}><UsersThree size={28} weight="fill" /></Box>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" mt={2} display="block">
                            Base de datos actualizada en tiempo real
                        </Typography>
                    </CardContent>
                </Card>
             </Grid>
             
             <Grid item xs={12} md={3}>
                <Card sx={{ borderRadius: 2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #FECDD3', bgcolor: '#FEF2F2', height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Typography variant="caption" fontWeight="bold" color="#B91C1C" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Riesgo Alto</Typography>
                                <Typography variant="h4" fontWeight="800" color="#991B1B">{stats.risky}</Typography>
                            </Box>
                            <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: '#FEE2E2', color: '#EF4444' }}><Siren size={28} weight="fill" /></Box>
                        </Stack>
                        <Typography variant="caption" color="#B91C1C" mt={2} display="block" fontWeight="500">
                            Requieren atención prioritaria
                        </Typography>
                    </CardContent>
                </Card>
             </Grid>

             <Grid item xs={12} md={6}>
                {/* 🔥 GRÁFICA MEJORADA 🔥 */}
                <Card sx={{ borderRadius: 2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #E2E8F0', height: '100%' }}>
                    <CardContent sx={{ p: 3, pb: 1, height: '100%' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="800" color="#1E293B">SALUD POBLACIONAL</Typography>
                                <Typography variant="caption" color="text.secondary">Distribución de niveles de energía (1 al 10)</Typography>
                            </Box>
                        </Box>

                        <Box sx={{ width: '100%', height: 160 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={populationData} margin={{top: 10, right: 0, left: -20, bottom: 0}}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="level" tickLine={false} axisLine={false} style={{fontSize: 10, fill: '#64748B'}} />
                                    <YAxis tickLine={false} axisLine={false} style={{fontSize: 10, fill: '#64748B'}} allowDecimals={false} />
                                    <RechartsTooltip 
                                        cursor={{fill: '#F1F5F9', opacity: 0.4}}
                                        contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}
                                        labelStyle={{ fontWeight: 'bold', color: '#334155' }}
                                        formatter={(value) => [`${value} Pacientes`, "Cantidad"]}
                                        labelFormatter={(label) => `Nivel de Energía ${label}`}
                                    />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={30}>
                                        {populationData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={
                                                    entry.level <= 3 ? '#EF4444' : // Rojo
                                                    entry.level <= 6 ? '#F59E0B' : // Ambar
                                                    '#10B981'                      // Verde
                                                } 
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                        
                        <Box display="flex" justifyContent="space-between" mt={0} px={1}>
                            <Typography variant="caption" fontWeight="bold" color="#EF4444">😟 Baja Energía (1-3)</Typography>
                            <Typography variant="caption" fontWeight="bold" color="#10B981">⚡ Alta Energía (7-10)</Typography>
                        </Box>
                    </CardContent>
                </Card>
             </Grid>
          </Grid>

          <Typography variant="subtitle2" fontWeight="bold" color="#64748B" mb={2} pl={0.5} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
              Expedientes Recientes ({filteredList.length})
          </Typography>

          <Grid container spacing={3}>
            {filteredList.map((user, index) => (
                <Grid item xs={12} md={6} lg={4} key={user.id}>
                    <Fade in={true} timeout={500 + (index * 100)}>
                        <Card sx={{ 
                            borderRadius: 2, 
                            border: '1px solid',
                            borderColor: user.isRisky ? '#FCA5A5' : '#E2E8F0',
                            bgcolor: 'white',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.2s ease-in-out',
                            cursor: 'pointer',
                            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', borderColor: '#CBD5E1' },
                            position: 'relative'
                        }}
                        onClick={() => handleOpenPatient(user)}
                        >
                            {user.isRisky && (
                                <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#EF4444', boxShadow: '0 0 0 2px #FECACA' }} />
                                </Box>
                            )}

                            <CardContent sx={{ p: 3 }}>
                                <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                                    <Avatar 
                                        src={user.avatarUrl} 
                                        sx={{ 
                                            width: 48, height: 48, 
                                            bgcolor: user.isRisky ? '#FEF2F2' : '#EFF6FF',
                                            color: user.isRisky ? '#EF4444' : '#3B82F6',
                                            border: '1px solid', borderColor: user.isRisky ? '#FECACA' : '#DBEAFE',
                                            fontWeight: 'bold', fontSize: '0.9rem'
                                        }}
                                    >
                                        {getInitials(user.name)}
                                    </Avatar>
                                    <Box sx={{ overflow: 'hidden' }}>
                                        <Typography variant="subtitle1" fontWeight="700" color="#1E293B" noWrap>
                                            {user.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                                            {user.email}
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Divider sx={{ my: 2, borderColor: '#F1F5F9' }} />

                                <Box>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ fontSize: '0.7rem' }}>ENERGÍA PROMEDIO</Typography>
                                        <Typography variant="caption" fontWeight="800" color={user.lastEnergy < 4 ? "#DC2626" : "#059669"}>{user.lastEnergy}/10</Typography>
                                    </Box>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={user.lastEnergy * 10} 
                                        sx={{ 
                                            height: 6, borderRadius: 1, bgcolor: '#F1F5F9',
                                            '& .MuiLinearProgress-bar': {
                                                bgcolor: user.lastEnergy < 4 ? '#EF4444' : (user.lastEnergy > 7 ? '#10B981' : '#3B82F6'),
                                                borderRadius: 1
                                            }
                                        }} 
                                    />
                                </Box>

                                <Box mt={2.5} display="flex" justifyContent="space-between" alignItems="center">
                                    <Chip 
                                        label={user.lastStatus} 
                                        size="small" 
                                        sx={{ 
                                            height: 22, fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5,
                                            bgcolor: user.lastStatus === 'Inactivo' ? '#F1F5F9' : '#F0F9FF', 
                                            color: user.lastStatus === 'Inactivo' ? '#94A3B8' : '#0369A1', borderRadius: 1
                                        }} 
                                    />
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#94A3B8', fontSize: '0.75rem', fontWeight: '600' }}>
                                        Ver Detalle <CaretRight weight="bold" />
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Fade>
                </Grid>
            ))}
            
            {filteredList.length === 0 && (
                <Box width="100%" display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8} opacity={0.5}>
                    <Funnel size={48} weight="duotone" color="#94A3B8" />
                    <Typography mt={2} fontWeight="600" color="text.secondary">No se encontraron pacientes</Typography>
                </Box>
            )}
          </Grid>

          {/* 🔥 MODAL DETALLE CON ACCIONES 🔥 */}
          <Dialog 
            open={modalOpen} 
            onClose={handleCloseModal} 
            maxWidth="sm" 
            fullWidth 
            PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
            TransitionComponent={Fade}
            transitionDuration={300}
          >
               {selectedPatient && (
                   <>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                        <Box display="flex" gap={2} alignItems="center">
                            <Avatar src={selectedPatient.avatarUrl} sx={{ width: 48, height: 48, bgcolor: selectedPatient.isRisky ? '#FEF2F2' : '#EFF6FF', color: selectedPatient.isRisky ? '#EF4444' : '#3B82F6', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                {getInitials(selectedPatient.name)}
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight="bold" color="#1E293B">{selectedPatient.name}</Typography>
                                <Typography variant="caption" color="text.secondary">ID: {selectedPatient.id.slice(0, 8)}</Typography>
                            </Box>
                        </Box>
                        <IconButton onClick={handleCloseModal} size="small" sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}><X size={18} /></IconButton>
                    </DialogTitle>
                    <Divider sx={{ my: 1, borderColor: '#F1F5F9' }} />
                    <DialogContent>
                        {loadingPatient ? (
                            <Box display="flex" justifyContent="center" py={5}><CircularProgress size={30} /></Box>
                        ) : (
                            <Box>
                                <Stack direction="row" spacing={2} mb={3}>
                                    <Paper elevation={0} sx={{ flex: 1, p: 2, bgcolor: '#F8FAFC', borderRadius: 2, textAlign: 'center', border: '1px solid #E2E8F0' }}>
                                        <BatteryCharging size={24} color="#334155" weight="duotone" style={{marginBottom: 4}}/>
                                        <Typography variant="h4" fontWeight="800" color="#1E293B">{selectedPatient.lastEnergy}</Typography>
                                        <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Energía</Typography>
                                    </Paper>
                                    <Paper elevation={0} sx={{ flex: 1, p: 2, bgcolor: selectedPatient.isRisky ? '#FEF2F2' : '#F0FDF4', borderRadius: 2, textAlign: 'center', border: '1px solid', borderColor: selectedPatient.isRisky ? '#FECACA' : '#BBF7D0' }}>
                                        {selectedPatient.isRisky ? <Warning size={24} color="#DC2626" weight="fill" style={{marginBottom: 4}}/> : <ShieldCheck size={24} color="#16A34A" weight="fill" style={{marginBottom: 4}}/>}
                                        <Typography variant="h6" fontWeight="bold" color={selectedPatient.isRisky ? "#DC2626" : "#16A34A"} sx={{ mt: 0.5 }}>
                                            {selectedPatient.isRisky ? "RIESGO" : "ESTABLE"}
                                        </Typography>
                                        <Typography variant="caption" color={selectedPatient.isRisky ? "#991B1B" : "#166534"} fontWeight="600" sx={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>IA Status</Typography>
                                    </Paper>
                                </Stack>

                                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #E2E8F0', mb: 3 }}>
                                    <Typography variant="subtitle2" fontWeight="bold" mb={2} display="flex" alignItems="center" gap={1} color="#475569">
                                        <TrendUp weight="bold" size={18}/> Evolución (7 días)
                                    </Typography>
                                    <Box sx={{ height: 180, width: '100%', minHeight: 180, position: 'relative' }}>
                                        {selectedPatient.history && selectedPatient.history.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={selectedPatient.history} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                                                    <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} stroke="#94A3B8" />
                                                    <RechartsTooltip 
                                                        cursor={{fill: '#F8FAFC'}}
                                                        contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} 
                                                    />
                                                    <Bar dataKey="energy" radius={[3, 3, 3, 3]} barSize={24}>
                                                        {selectedPatient.history.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.energy < 4 ? '#EF4444' : '#3B82F6'} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <Box display="flex" alignItems="center" justifyContent="center" height="100%" opacity={0.5}>
                                                <Typography variant="caption">Sin historial suficiente</Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>

                                {/* --- ACCIONES ADMINISTRATIVAS --- */}
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ display: 'block', mb: 1 }}>ACCIONES RÁPIDAS</Typography>
                                <Stack direction="row" spacing={1}>
                                    <Button 
                                        variant="outlined" 
                                        color="primary" 
                                        fullWidth 
                                        disabled={sendingEmail}
                                        startIcon={sendingEmail ? <CircularProgress size={20}/> : <PaperPlaneTilt />}
                                        onClick={handleSendAlert}
                                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                                    >
                                        {sendingEmail ? "Enviando..." : "Enviar Alerta"}
                                    </Button>
                                    <Button 
                                        variant="outlined" 
                                        color="error" 
                                        fullWidth 
                                        startIcon={<Trash />}
                                        onClick={handleDeleteUser}
                                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold', borderColor: '#FECACA', color: '#EF4444', '&:hover': { borderColor: '#EF4444', bgcolor: '#FEF2F2' } }}
                                    >
                                        Eliminar
                                    </Button>
                                </Stack>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 2, pt: 0 }}>
                        <Button onClick={handleCloseModal} fullWidth variant="contained" size="large" sx={{ borderRadius: 2, fontWeight: 'bold', textTransform: 'none', bgcolor: '#1E293B', boxShadow: 'none' }}>
                            Cerrar Expediente
                        </Button>
                    </DialogActions>
                   </>
               )}
          </Dialog>

          {/* --- NOTIFICACIONES TOAST (SNACKBAR) --- */}
          <Snackbar 
            open={snackbar.open} 
            autoHideDuration={6000} 
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 3, fontWeight: 'bold' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>

        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard;