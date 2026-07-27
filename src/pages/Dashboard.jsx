/**
 * @license
 * © 2026 Tania Joseline Recendis Díaz. Todos los derechos reservados.
 * Autor: Tania Joseline Recendis Díaz
 */

import React, { useState, useEffect, Suspense } from 'react';
import { 
  Box, Grid, Container, Typography, CircularProgress, Stack, Card, CardContent, Button, Chip, Paper, Fade, useMediaQuery 
} from '@mui/material';
import { 
  Quotes, Bed, PersonSimpleRun, Drop, ForkKnife, BookOpen, FlowerLotus, 
  Users, GameController, GraduationCap, Sparkle, SunDim, CheckCircle, Warning,
  BatteryCharging, ChartLineUp, Smiley, PlusCircle, Brain, 
  TrendUp, EnvelopeSimpleOpen, FilePdf, Lightning
} from '@phosphor-icons/react'; 

// --- IMPORTS DE RECHARTS ---
import { 
  AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';

import { useNavigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from '@mui/material/styles';

// --- IMPORTS DE BACKEND ---
import { db, auth } from '../services/firebaseConfig';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, sendEmailVerification, signOut } from 'firebase/auth'; 

// --- IMPORTS LOCALES ---
import Header from '../components/Header'; 
import SOSButton from '../components/common/SOSButton'; 
import customTheme from '../theme'; 
import BottomNavbar from '../components/BottomNavbar'; 
import '../styles/Dashboard.css'; 
import hojasBg from '../assets/backgrounddash/hojas.png'; 

import SaviaPlant from '../components/SaviaPlant';
import EnergyGauge from '../components/dashboard/EnergyGauge'; 
import StatusCard from '../components/dashboard/StatusCard';

// IMPORTAMOS LA LÓGICA Y EL CEREBRO IA
import { getExpertResponse, calculateFuzzyMood } from '../data/luminaInference'; 
import { getWeeklyStats } from '../data/luminaStatistics'; 
import saviaNeuro from '../services/SaviaNeuro'; // <--- IMPORTANTE: Tu archivo V3

const TherapistReportDialog = React.lazy(() => import('../components/dashboard/TherapistReportDialog'));

// --- COLORES ---
const MOOD_COLORS = {
  happy: '#81C784', calm: '#64B5F6', anxious: '#FFB74D',
  sad: '#E57373', angry: '#E53935', tired: '#90A4AE', neutral: '#E0E0E0',
  feliz: '#81C784', contento: '#81C784', alegre: '#81C784',
  calmado: '#64B5F6', tranquilo: '#64B5F6', relajado: '#64B5F6',
  ansioso: '#FFB74D', nervioso: '#FFB74D', estresado: '#FFB74D',
  triste: '#E57373', deprimido: '#E57373', mal: '#E57373',
  enojado: '#E53935', molesto: '#E53935', furioso: '#E53935',
  cansado: '#90A4AE', agotado: '#90A4AE', sueño: '#90A4AE',
  normal: '#9E9E9E' 
};

const HABIT_ICONS = {
  sleep: <Bed size={20} weight="fill" />, exercise: <PersonSimpleRun size={20} weight="fill" />,
  water: <Drop size={20} weight="fill" />, eat_healthy: <ForkKnife size={20} weight="fill" />,
  read: <BookOpen size={20} weight="fill" />, meditation: <FlowerLotus size={20} weight="fill" />,
  social: <Users size={20} weight="fill" />, hobbies: <GameController size={20} weight="fill" />,
  study: <GraduationCap size={20} weight="fill" />, cleaning: <Sparkle size={20} weight="fill" />,
  nature: <SunDim size={20} weight="fill" />,
};

const normalizeText = (text) => {
    if (!text) return 'neutral';
    return text.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

// --- TOOLTIP ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const normalizedMood = normalizeText(data.mood);
    const color = MOOD_COLORS[normalizedMood] || MOOD_COLORS[data.mood] || '#999';
    
    return (
      <Box className="custom-tooltip">
        <Typography variant="subtitle2" fontWeight="bold" color="#334155" mb={1}>{label}</Typography>
        <Stack spacing={0.5} mb={1}>
            <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
                <Box display="flex" alignItems="center" gap={1}>
                    <BatteryCharging size={14} color="#64B5F6" weight="fill" />
                    <Typography variant="caption" color="#64748B">Energía Real:</Typography>
                </Box>
                <Typography variant="caption" fontWeight="bold" color="#1976D2">{data.energy}</Typography>
            </Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
                <Box display="flex" alignItems="center" gap={1}>
                    <Brain size={14} color="#AB47BC" weight="fill" />
                    <Typography variant="caption" color="#64748B">Neuro IA:</Typography>
                </Box>
                <Typography variant="caption" fontWeight="bold" color="#AB47BC">{data.neuro || '-'}</Typography>
            </Box>
        </Stack>
      </Box>
    );
  }
  return null;
};

const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  const normalizedMood = normalizeText(payload.mood);
  const color = MOOD_COLORS[normalizedMood] || MOOD_COLORS[payload.mood] || '#CBD5E1';
  return (
    <svg x={cx - 5} y={cy - 5} width={10} height={10} fill="white" viewBox="0 0 10 10">
       <circle cx="5" cy="5" r="4" fill={color} stroke="white" strokeWidth="2" />
    </svg>
  );
};

// ==========================================
// COMPONENTE DASHBOARD
// ==========================================
const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [user, setUser] = useState(null);
  const [historyData, setHistoryData] = useState([]); 
  const [latestEntry, setLatestEntry] = useState(null);
  const [expertAnalysis, setExpertAnalysis] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  
  // Stats & Gráficas
  const [avgEnergy, setAvgEnergy] = useState(0);
  const [moodData, setMoodData] = useState([]); 
  const [chartData, setChartData] = useState([]); 
  const [mathStats, setMathStats] = useState(null);
  
  // Estado para la predicción futura de la IA
  const [neuroPrediction, setNeuroPrediction] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await currentUser.reload();
        if (!currentUser.emailVerified) { setUser({...currentUser, emailVerified: false}); setLoading(false); return; }
        setUser(currentUser);
        
        const q = query(collection(db, "users", currentUser.uid, "entries"), orderBy("date", "desc"), limit(60));
        
        const unsubscribeSnapshot = onSnapshot(q, async (snapshot) => {
          const entries = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id, ...data,
              dateObj: data.date?.toDate ? data.date.toDate() : new Date(),
              energyLevel: Number(data.energyLevel) || 0,
              mood: data.mood || 'neutral',
              habits: data.habits || [], 
              note: data.note || data.journal || '', 
              ai_analysis: data.ai_analysis || null
            };
          });

          const chronologicalEntries = [...entries].reverse();
          setHistoryData(chronologicalEntries);
          
          // 1. Procesar estadísticas básicas
          processStatistics(chronologicalEntries);

          // 2. Lógica del último día
          if (entries.length > 0) {
            const newest = entries[0]; 
            setLatestEntry(newest);
            setExpertAnalysis(getExpertResponse(newest.habits || []));
            
            // Si hay análisis de texto guardado
            if (newest.ai_analysis) {
                 setAiAnalysis({
                   label: newest.ai_analysis.risk_detected ? 'Atención' : 'Insight',
                   message: newest.ai_analysis.bot_suggestion,
                   color: newest.ai_analysis.risk_detected ? '#E57373' : '#64B5F6',
                   icon: newest.ai_analysis.risk_detected ? <Warning weight="fill"/> : <Brain weight="fill"/>,
                   alert: newest.ai_analysis.risk_detected ? 'Patrón de riesgo detectado.' : null
                 });
            } else { setAiAnalysis(null); }

            // 3. 🔥 ENTRENAMIENTO Y PREDICCIÓN NEURO 🔥
            // Entrenamos con todo el historial disponible
            if (entries.length >= 3) {
                console.log("🧠 Entrenando SaviaNeuro...");
                await saviaNeuro.train(chronologicalEntries);
                
                // Predecimos el "siguiente paso" basado en la historia hasta hoy
                // (Simulamos que mañana tienes los mismos hábitos que hoy para ver la proyección)
                const prediction = await saviaNeuro.predict(chronologicalEntries, newest);
                setNeuroPrediction(prediction);
                
                // Actualizamos la gráfica con la línea "Neuro"
                // (Esto es asíncrono, así que lo hacemos aquí después de entrenar)
                updateChartWithNeuro(chronologicalEntries);
            }
          }
          setLoading(false);
        });
        return () => unsubscribeSnapshot();
      } else { navigate('/'); }
    });
    return () => unsubscribeAuth();
  }, [navigate]);

  // Función para calcular la línea de la gráfica (Neuro + Tendencia)
  const updateChartWithNeuro = async (data) => {
      // Tomamos últimos 14 días
      const recentData = data.slice(-14);
      
      const enrichedData = await Promise.all(recentData.map(async (entry, index, arr) => {
          const d = entry.dateObj;
          const dateStr = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
          
          // Tendencia (Media móvil simple)
          let trend = entry.energyLevel;
          if(index > 1) {
              trend = ((arr[index].energyLevel + arr[index-1].energyLevel + arr[index-2].energyLevel) / 3).toFixed(1);
          }

          // NEURO REAL: Usamos el modelo para ver qué "esperaba" la IA para este día
          // Pasamos la historia hasta ANTES de este día
          const historyUntilNow = data.filter(d => d.dateObj < entry.dateObj);
          let neuroVal = null;
          
          if (historyUntilNow.length >= 3) {
             // Predicción "retroactiva" para dibujar la línea
             neuroVal = await saviaNeuro.predict(historyUntilNow, entry);
          } else {
             // Si no hay historia suficiente, usamos la tendencia como fallback
             neuroVal = trend;
          }

          return { 
              date: dateStr, 
              energy: entry.energyLevel, 
              mood: entry.mood,
              trend: Number(trend),
              neuro: Number(neuroVal)
          };
      }));
      
      setChartData(enrichedData);
  };

  const processStatistics = (data) => {
    if (data.length === 0) return;
    const total = data.reduce((acc, curr) => acc + curr.energyLevel, 0);
    setAvgEnergy((total / data.length).toFixed(1));
    setMathStats(getWeeklyStats(data));

    const moodCounts = {};
    data.forEach(e => { moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1; });
    
    setMoodData(Object.keys(moodCounts).map(k => {
        const normalizedKey = normalizeText(k);
        return { 
            name: k, value: moodCounts[k], 
            color: MOOD_COLORS[normalizedKey] || MOOD_COLORS[k] || '#999' 
        };
    }));
  };

  if (loading) return <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>;
  if (user && !user.emailVerified) return <Box sx={{p:5, textAlign:'center'}}>Verifica tu email...</Box>;
  if (!latestEntry) return <Box sx={{p:5, textAlign:'center'}}>Crea tu primera entrada...</Box>;

  return (
    <ThemeProvider theme={customTheme}>
      <Box className="dashboard-background" sx={{ 
            backgroundImage: `url(${hojasBg}), linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%)`, 
            backgroundSize: isMobile ? '80% auto, cover' : '40% auto, cover', 
            backgroundAttachment: 'fixed', minHeight: '100vh', pb: 12 
      }}>
        <Header />

        <Container maxWidth="xl" sx={{ pt: { xs: 2, md: 4 }, px: { xs: 2, md: 4 } }}>
          
          <Box mb={4} display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} gap={2}>
            <Box>
                <Typography variant={isMobile ? "h5" : "h4"} fontWeight="800" color="#334155" sx={{ letterSpacing: '-1px' }}>
                    Hola, {user?.displayName?.split(' ')[0]} 🌿
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Tu balance emocional al día de hoy.
                </Typography>
            </Box>
            <Button 
                fullWidth={isMobile}
                variant="outlined" startIcon={<FilePdf weight="fill" />} 
                onClick={() => setReportOpen(true)}
                sx={{ borderRadius: '12px', border: '1px solid #FFCC80', color: '#F57C00', bgcolor: '#FFF3E0', py: 1.5, fontWeight:'bold', '&:hover': { bgcolor: '#FFE0B2' } }}
            >
                Reporte PDF
            </Button>
          </Box>

          <Grid container spacing={3}>
            
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box display="flex" gap={2}>
                    <Paper className="action-card" onClick={() => navigate('/new-entry')} sx={{ flex:1, p: 2.5, bgcolor: '#E0F2F1', color: '#00695C', display:'flex', alignItems:'center', gap:2 }}>
                        <Box sx={{ p:1, bgcolor:'white', borderRadius:'50%' }}><PlusCircle size={28} weight="fill" color="#00897B"/></Box>
                        <Box><Typography variant="subtitle1" fontWeight="800">Nueva</Typography><Typography variant="caption">Entrada</Typography></Box>
                    </Paper>
                    <Paper className="action-card" onClick={() => navigate('/history')} sx={{ flex:1, p: 2.5, bgcolor: '#F3E5F5', color: '#6A1B9A', display:'flex', alignItems:'center', gap:2 }}>
                        <Box sx={{ p:1, bgcolor:'white', borderRadius:'50%' }}><ChartLineUp size={28} weight="fill" color="#8E24AA"/></Box>
                        <Box><Typography variant="subtitle1" fontWeight="800">Historial</Typography><Typography variant="caption">Ver todo</Typography></Box>
                    </Paper>
                </Box>
                <SaviaPlant />
            </Grid>

            <Grid item xs={12} md={4}>
                <Stack spacing={3}>
                    {/* KPIS */}
                    <Box className={isMobile ? "kpi-container-mobile" : ""} sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                        <Card className={`kpi-card ${isMobile ? "kpi-item-mobile" : ""}`} sx={{ flex:1, background: '#E3F2FD' }}>
                            <CardContent sx={{ display:'flex', alignItems:'center', gap:2, p:'20px !important' }}>
                                <Box sx={{ p:1.5, bgcolor:'white', borderRadius:'50%' }}><BatteryCharging size={24} color="#1976D2" weight="fill"/></Box>
                                <Box>
                                    <Typography className="kpi-value" color="#1565C0">{avgEnergy}</Typography>
                                    <Typography className="kpi-label" color="#1E88E5">Energía Prom.</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                        <Card className={`kpi-card ${isMobile ? "kpi-item-mobile" : ""}`} sx={{ flex:1, background: '#E8F5E9' }}>
                            <CardContent sx={{ display:'flex', alignItems:'center', gap:2, p:'20px !important' }}>
                                <Box sx={{ p:1.5, bgcolor:'white', borderRadius:'50%' }}><Smiley size={24} color="#388E3C" weight="fill"/></Box>
                                <Box>
                                    <Typography variant="h5" fontWeight="800" color="#2E7D32" sx={{textTransform:'capitalize'}}>
                                        {moodData.length > 0 ? [...moodData].sort((a,b) => b.value - a.value)[0].name : '-'}
                                    </Typography>
                                    <Typography className="kpi-label" color="#388E3C">Emoción Princ.</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>

                    {/* 🔥 TARJETA NEURO-IA (La que predice) 🔥 */}
                    <Box className="glass-panel" sx={{ borderLeft: `5px solid #AB47BC`, alignItems: 'flex-start' }}>
                        <Stack direction="row" alignItems="center" spacing={2} width="100%">
                            <Box sx={{ fontSize: '32px', color: '#AB47BC' }}><Brain weight="duotone" /></Box>
                            <Box flex={1}>
                                <Typography variant="h6" fontWeight="800" color="#AB47BC">Savia Neuro V3</Typography>
                                <Chip label={neuroPrediction ? "Predicción Activa" : "Entrenando..."} size="small" sx={{ bgcolor: `#AB47BC20`, color: '#AB47BC', fontWeight:'bold', height:20, fontSize:'0.65rem' }} />
                            </Box>
                            {neuroPrediction && (
                                <Box textAlign="right">
                                    <Typography variant="h4" fontWeight="900" color="#7B1FA2">{neuroPrediction}</Typography>
                                    <Typography variant="caption" color="text.secondary">Proyección</Typography>
                                </Box>
                            )}
                        </Stack>
                        <Box className="quote-box" sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                {neuroPrediction 
                                    ? `Basado en tus últimos ${historyData.length} registros, tu estabilidad energética proyectada es de ${neuroPrediction}.`
                                    : "Analizando tus patrones neuronales..."}
                            </Typography>
                        </Box>
                    </Box>

                    <Box className="glass-panel" sx={{ borderLeft: `5px solid ${expertAnalysis.color}` }}>
                        <Box mb={2} display="flex" alignItems="center" gap={2} width="100%">
                            <Box className="animate-float" sx={{ fontSize: '40px' }}>{expertAnalysis.icon}</Box>
                            <Box>
                                <Typography variant="h5" className="status-text" color={expertAnalysis.color}>{expertAnalysis.label}</Typography>
                                <Typography variant="caption" color="text.secondary">Arquetipo del Día</Typography>
                            </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" align="center">"{expertAnalysis.description}"</Typography>
                    </Box>
                </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
                <Stack spacing={3}>
                    <Box className="glass-panel" sx={{ p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">ANÁLISIS NEURO & MINERÍA</Typography>
                            <Chip icon={<Lightning size={12} weight="fill"/>} label="Live" size="small" color="secondary" sx={{height:20, fontSize:'0.6rem'}}/>
                        </Box>
                        
                        <Box sx={{ height: 220, width: '100%' }}>
                            <ResponsiveContainer>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorE" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#64B5F6" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#64B5F6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9"/>
                                    
                                    {/* EJE X CON FECHAS */}
                                    <XAxis 
                                        dataKey="date" 
                                        stroke="#94A3B8" 
                                        fontSize={10} 
                                        tickLine={false} 
                                        axisLine={false} 
                                        tickMargin={10}
                                        interval="preserveStartEnd"
                                    />
                                    
                                    <RechartsTooltip content={<CustomTooltip />} cursor={{stroke:'#90A4AE', strokeDasharray:'3 3'}}/>
                                    
                                    {/* 1. Datos Reales */}
                                    <Area type="monotone" dataKey="energy" stroke="#64B5F6" strokeWidth={2} fill="url(#colorE)" activeDot={{ r: 6 }} />
                                    
                                    {/* 2. Tendencia (Minería) */}
                                    <Line type="monotone" dataKey="trend" stroke="#FB8C00" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                    
                                    {/* 3. Neuro (IA) */}
                                    <Line type="basis" dataKey="neuro" stroke="#AB47BC" strokeWidth={3} dot={false} />
                                    
                                    <Legend iconType="circle" wrapperStyle={{fontSize:'10px', paddingTop:'10px'}}/>
                                </AreaChart>
                            </ResponsiveContainer>
                        </Box>
                    </Box>

                    <Box className="glass-panel" sx={{ p: 2, display:'flex', flexDirection:'column', alignItems:'center' }}>
                        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" mb={1}>EMOCIONES</Typography>
                        <Box sx={{ width: '100%', height: 180, minHeight: 180 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={moodData} innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                                        {moodData.map((e, i) => <Cell key={`cell-${i}`} fill={e.color} stroke="none"/>)}
                                    </Pie>
                                    <RechartsTooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                        <Stack direction="row" gap={0.5} flexWrap="wrap" justifyContent="center">
                            {moodData.slice(0,4).map(m => <Chip key={m.name} label={m.name} size="small" sx={{ bgcolor: m.color, color: 'white', fontSize: '0.7rem', fontWeight:'bold' }} />)}
                        </Stack>
                    </Box>

                    <Box className="glass-panel" sx={{ alignItems:'flex-start' }}>
                        <Typography className="habits-title">HÁBITOS DE HOY</Typography>
                        <Grid container spacing={1}>
                            {latestEntry.habits?.length > 0 ? latestEntry.habits.map(h => (
                                <Grid item xs={6} key={h}>
                                    <Box className="habit-item">
                                        <Box sx={{ color:'#64748B' }}>{HABIT_ICONS[h]}</Box>
                                        <Typography variant="caption" fontWeight="bold" textTransform="capitalize" color="#334155">{h.replace('_',' ')}</Typography>
                                    </Box>
                                </Grid>
                            )) : <Typography variant="caption" sx={{ width:'100%', textAlign:'center', py:2, color:'#94A3B8' }}>Sin registros.</Typography>}
                        </Grid>
                    </Box>
                </Stack>
            </Grid>

          </Grid>
        </Container>

        <Box sx={{ position: 'fixed', bottom: 100, right: 20, zIndex: 1000 }}>
            <SOSButton />
        </Box>

        <Suspense fallback={null}>
            {reportOpen && <TherapistReportDialog open={reportOpen} onClose={() => setReportOpen(false)} historyData={historyData} user={user} />}
        </Suspense>

        <BottomNavbar currentTab={0} />
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;