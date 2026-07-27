/**
 * @license
 * © 2026 Tania Joseline Recendis Díaz. Todos los derechos reservados.
 * Autor: Tania Joseline Recendis Díaz
 */

import React, { useState } from 'react';
import { 
  Box, Container, Typography, Grid, Slider, TextField, Button, IconButton, Stack, Fade, Chip, Alert, CircularProgress, Tooltip 
} from '@mui/material';
import { 
  ArrowBack, Check, AutoAwesome, BatteryChargingFull, Add, Remove 
} from '@mui/icons-material';

// --- IMPORTS DE ICONOS ---
import { 
  SignOut,
  Smiley, SmileySad, SmileyMeh, SmileyNervous, Lightning, HeartBreak,
  Bed, PersonSimpleRun, Drop, ForkKnife, BookOpen, FlowerLotus, Users, GameController, GraduationCap, Sparkle, SunDim,
  Briefcase, Warning, House, Heart, CurrencyDollar, FirstAid, Pizza, Moon, CloudRain, Car, Newspaper, Airplane, SpeakerHigh,
  CheckCircle
} from '@phosphor-icons/react';

import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import hojasBg from '../assets/backgrounddash/hojas.png';

// --- IMPORTS DE FIREBASE ---
import { db, auth } from '../services/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

import '../styles/NewEntry.css';
import BottomNavbar from '../components/BottomNavbar';

// --- CONFIGURACIÓN DE EMOCIONES ---
const MOOD_CONFIG = {
  happy: { label: 'Feliz', baseColor: '#4CAF50', icon: <Smiley weight="fill" /> },
  calm: { label: 'Calmado', baseColor: '#2196F3', icon: <SmileyMeh weight="fill" /> },
  anxious: { label: 'Ansioso', baseColor: '#FF9800', icon: <SmileyNervous weight="fill" /> },
  sad: { label: 'Triste', baseColor: '#F44336', icon: <SmileySad weight="fill" /> },
  angry: { label: 'Enojado', baseColor: '#D32F2F', icon: <Lightning weight="fill" /> },
  tired: { label: 'Cansado', baseColor: '#78909C', icon: <HeartBreak weight="fill" /> },
};

// --- LISTAS DE HÁBITOS ---
const HABITS_LIST = [
  { id: 'eat_healthy', label: 'Comer Sano', icon: <ForkKnife weight="fill" />, color: '#66BB6A' },
  { id: 'read', label: 'Lectura', icon: <BookOpen weight="fill" />, color: '#FFA726' },
  { id: 'meditation', label: 'Meditación', icon: <FlowerLotus weight="fill" />, color: '#AB47BC' },
  { id: 'social', label: 'Social', icon: <Users weight="fill" />, color: '#EC407A' },
  { id: 'hobbies', label: 'Hobbies', icon: <GameController weight="fill" />, color: '#5C6BC0' },
  { id: 'study', label: 'Estudio', icon: <GraduationCap weight="fill" />, color: '#0288D1' },
  { id: 'cleaning', label: 'Limpieza', icon: <Sparkle weight="fill" />, color: '#009688' },
  { id: 'nature', label: 'Naturaleza', icon: <SunDim weight="fill" />, color: '#FBC02D' },
];

const INFLUENCE_FACTORS = [
  { id: 'work', label: 'Trabajo', icon: <Briefcase weight="fill" />, color: '#546E7A' },
  { id: 'stress', label: 'Estrés', icon: <Warning weight="fill" />, color: '#FF7043' },
  { id: 'family', label: 'Familia', icon: <House weight="fill" />, color: '#8D6E63' },
  { id: 'partner', label: 'Pareja', icon: <Heart weight="fill" />, color: '#E91E63' },
  { id: 'money', label: 'Dinero', icon: <CurrencyDollar weight="fill" />, color: '#43A047' },
  { id: 'health', label: 'Salud', icon: <FirstAid weight="fill" />, color: '#D32F2F' },
  { id: 'food', label: 'Comida', icon: <Pizza weight="fill" />, color: '#F57C00' },
  { id: 'cycle', label: 'Ciclo', icon: <Moon weight="fill" />, color: '#9C27B0' },
  { id: 'weather', label: 'Clima', icon: <CloudRain weight="fill" />, color: '#5C6BC0' },
  { id: 'traffic', label: 'Tráfico', icon: <Car weight="fill" />, color: '#78909C' },
  { id: 'news', label: 'Noticias', icon: <Newspaper weight="fill" />, color: '#607D8B' },
  { id: 'travel', label: 'Viaje', icon: <Airplane weight="fill" />, color: '#039BE5' },
  { id: 'noise', label: 'Ruido', icon: <SpeakerHigh weight="fill" />, color: '#424242' },
];

const NewEntry = () => {
  const navigate = useNavigate();

  // --- ESTADOS ---
  const [selectedMoods, setSelectedMoods] = useState([]); 
  const [selectedHabits, setSelectedHabits] = useState([]);
  const [selectedFactors, setSelectedFactors] = useState([]);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [note, setNote] = useState('');
  
  // NUEVOS ESTADOS DE MÉTRICAS
  const [waterLiters, setWaterLiters] = useState(0);
  const [sleepHours, setSleepHours] = useState(0);
  const [exerciseMinutes, setExerciseMinutes] = useState(0);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  const MAX_SELECTION = 3;

  // --- HANDLERS ---
  const toggleMood = (key) => {
    if (selectedMoods.includes(key)) {
      setSelectedMoods(prev => prev.filter(k => k !== key));
    } else {
      if (selectedMoods.length < MAX_SELECTION) setSelectedMoods(prev => [...prev, key]);
    }
  };

  const toggleHabit = (id) => {
    if (selectedHabits.includes(id)) {
      setSelectedHabits(prev => prev.filter(h => h !== id));
    } else {
      setSelectedHabits(prev => [...prev, id]);
    }
  };

  const toggleFactor = (id) => {
    if (selectedFactors.includes(id)) {
      setSelectedFactors(prev => prev.filter(f => f !== id));
    } else {
      setSelectedFactors(prev => [...prev, id]);
    }
  };

  // --- LÓGICA VISUAL ---
  const lastKey = selectedMoods.length > 0 ? selectedMoods[selectedMoods.length - 1] : null;
  const activeColor = lastKey ? MOOD_CONFIG[lastKey].baseColor : '#475569'; 
  const moodKeys = Object.keys(MOOD_CONFIG);

  const getSmartPlaceholder = () => {
    if (!lastKey) return "Escribe aquí tus pensamientos...";
    if (['angry', 'stress'].includes(lastKey)) return "¿Qué disparó esta emoción?";
    if (['sad', 'tired'].includes(lastKey)) return "¿Qué necesitas soltar hoy?";
    if (['happy', 'calm'].includes(lastKey)) return "¿Qué quieres agradecer?";
    return "¿Qué estás pensando?";
  };

  // --- GUARDADO EN FIREBASE ---
  const submitData = async () => {
    if (!auth.currentUser) {
      setError("Debes iniciar sesión para guardar.");
      return;
    }
    
    // Determinamos la emoción principal (la última seleccionada, que es la que se ve en la UI)
    const primaryMood = selectedMoods.length > 0 ? selectedMoods[selectedMoods.length - 1] : 'neutral';

    console.log("=== GUARDANDO DATOS REEALES ===");
    console.log("Emoción:", primaryMood);
    console.log("Energía:", energyLevel);

    setIsSaving(true);
    setError('');
    
    try {
      const entriesRef = collection(db, "users", auth.currentUser.uid, "entries");
      
      await addDoc(entriesRef, {
        // CORRECCIÓN CLAVE AQUÍ 👇
        mood: primaryMood, 
        additionalMoods: selectedMoods,
        
        energyLevel: energyLevel,
        
        waterLiters: waterLiters,
        sleepHours: sleepHours,
        exerciseMinutes: exerciseMinutes,
        
        habits: selectedHabits,
        factors: selectedFactors,
        note: note,
        
        date: serverTimestamp(),
        createdAt: serverTimestamp(),
        analyzed: false 
      });

      navigate('/dashboard');
    } catch (err) {
      console.error("Error guardando:", err);
      setError("No se pudo guardar. Revisa tu conexión.");
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  const NumericControl = ({ label, value, setValue, step, unit, icon, color }) => (
    <Box className="metric-card" sx={{ borderColor: value > 0 ? color : 'transparent' }}>
        <Box sx={{ color: color, mb: 1 }}>{icon}</Box>
        <Typography variant="caption" fontWeight="bold" color="text.secondary">{label}</Typography>
        <Stack direction="row" alignItems="center" spacing={1} mt={1}>
            <IconButton size="small" onClick={() => setValue(Math.max(0, value - step))} sx={{ bgcolor: '#F1F5F9' }}>
                <Remove fontSize="small" />
            </IconButton>
            <Typography variant="h6" fontWeight="800" sx={{ minWidth: '40px', textAlign: 'center' }}>
                {value}
            </Typography>
            <IconButton size="small" onClick={() => setValue(value + step)} sx={{ bgcolor: '#F1F5F9' }}>
                <Add fontSize="small" />
            </IconButton>
        </Stack>
        <Typography variant="caption" color="text.disabled">{unit}</Typography>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box 
        className="new-entry-background"
        sx={{ backgroundImage: `url(${hojasBg}), linear-gradient(180deg, #E0F2FE 0%, #F0F9FF 100%)` }}
      >
        <Box className="entry-header">
             <Container maxWidth="xl">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2, bgcolor: 'white' }}>
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h6" fontWeight="800" color="#334155">
                            Nueva Entrada
                        </Typography>
                    </Box>
                    <Tooltip title="Cerrar Sesión">
                      <IconButton onClick={handleLogout} sx={{ color: '#EF5350', bgcolor: '#FFEBEE', border: '1px solid #FFCDD2' }}>
                        <SignOut size={24} weight="bold" />
                      </IconButton>
                    </Tooltip>
                </Box>
             </Container>
        </Box>

        <Container maxWidth="xl" sx={{ pt: 4 }}>
          <Fade in={true} timeout={600}>
            <Grid container spacing={3}>

              {error && (
                <Grid item xs={12}>
                  <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <Box className="glass-card auto-height">
                    <Typography className="section-title">
                        1. ¿CÓMO TE SIENTES? ({selectedMoods.length}/{MAX_SELECTION})
                    </Typography>
                    <Grid container spacing={2}>
                        {moodKeys.map((key) => {
                            const mood = MOOD_CONFIG[key];
                            const isSelected = selectedMoods.includes(key);
                            return (
                            <Grid item xs={6} sm={4} md={2} key={key}>
                                <Box 
                                    onClick={() => toggleMood(key)}
                                    className="mood-item"
                                    sx={{
                                        border: isSelected ? `2px solid ${mood.baseColor}` : '2px solid transparent',
                                        bgcolor: isSelected ? `${mood.baseColor}10` : '#F8FAFC',
                                        '&:hover': { bgcolor: isSelected ? `${mood.baseColor}20` : '#F1F5F9' }
                                    }}
                                >
                                    <Box sx={{ color: mood.baseColor, display: 'flex' }}>
                                        {React.cloneElement(mood.icon, { size: 28, weight: isSelected ? 'fill' : 'regular' })}
                                    </Box>
                                    <Typography variant="body2" fontWeight={isSelected ? '800' : '600'} sx={{ color: isSelected ? '#1E293B' : '#64748B' }}>
                                        {mood.label}
                                    </Typography>
                                    {isSelected && <CheckCircle size={18} weight="fill" color={mood.baseColor} style={{ marginLeft: 'auto' }} />}
                                </Box>
                            </Grid>
                            );
                        })}
                    </Grid>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box className="glass-card auto-height">
                    <Typography className="section-title">2. MÉTRICAS VITALES</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <NumericControl 
                                label="Hidratación" value={waterLiters} setValue={setWaterLiters} step={0.5} unit="Litros" 
                                color="#29B6F6" icon={<Drop size={32} weight="duotone"/>} 
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <NumericControl 
                                label="Sueño" value={sleepHours} setValue={setSleepHours} step={0.5} unit="Horas" 
                                color="#7E57C2" icon={<Bed size={32} weight="duotone"/>} 
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <NumericControl 
                                label="Movimiento" value={exerciseMinutes} setValue={setExerciseMinutes} step={10} unit="Minutos" 
                                color="#EF5350" icon={<PersonSimpleRun size={32} weight="duotone"/>} 
                            />
                        </Grid>
                    </Grid>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Grid container spacing={3} alignItems="flex-start">
                    <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box className="glass-card" sx={{ justifyContent: 'center', minHeight: '140px' }}>
                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                <BatteryChargingFull sx={{ color: activeColor }} />
                                <Typography className="section-title" sx={{ mb: 0 }}>3. NIVEL DE ENERGÍA</Typography>
                            </Stack>
                            <Box sx={{ px: 2, width: '100%', mt: 2 }}>
                                <Stack direction="row" spacing={3} alignItems="center">
                                    <Typography variant="caption" fontWeight="bold" color="#94A3B8">Baja</Typography>
                                    <Slider
                                        value={energyLevel}
                                        onChange={(e, v) => setEnergyLevel(v)}
                                        min={0} max={10} step={1}
                                        className="energy-slider"
                                        sx={{
                                            color: activeColor, height: 10,
                                            '& .MuiSlider-thumb': { border: `3px solid ${activeColor}` },
                                            '& .MuiSlider-rail': { bgcolor: activeColor }
                                        }}
                                    />
                                    <Typography variant="caption" fontWeight="bold" color="#94A3B8">Alta</Typography>
                                </Stack>
                                <Typography textAlign="center" fontWeight="900" sx={{ color: activeColor, mt: 1, fontSize: '1.2rem' }}>
                                    {energyLevel}/10
                                </Typography>
                            </Box>
                        </Box>

                        <Box className="glass-card auto-height">
                            <Typography className="section-title">4. CONTEXTO</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>¿Qué más hiciste hoy?</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                                {HABITS_LIST.map((habit) => {
                                    const isSelected = selectedHabits.includes(habit.id);
                                    return (
                                        <Chip
                                            key={habit.id} label={habit.label} onClick={() => toggleHabit(habit.id)}
                                            icon={React.cloneElement(habit.icon, { weight: isSelected ? 'fill' : 'regular' })}
                                            className="influence-chip"
                                            sx={{
                                                bgcolor: isSelected ? '#1E293B !important' : '#F8FAFC',
                                                color: isSelected ? 'white !important' : '#475569',
                                                '& .MuiChip-icon': { color: isSelected ? 'white !important' : `${habit.color} !important` }
                                            }}
                                        />
                                    );
                                })}
                            </Box>
                            
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>¿Qué influyó en tu día?</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {INFLUENCE_FACTORS.map((factor) => {
                                    const isSelected = selectedFactors.includes(factor.id);
                                    return (
                                        <Chip
                                            key={factor.id} label={factor.label} onClick={() => toggleFactor(factor.id)}
                                            icon={React.cloneElement(factor.icon, { weight: isSelected ? 'fill' : 'regular' })}
                                            className="influence-chip"
                                            sx={{
                                                bgcolor: isSelected ? '#1E293B !important' : '#F8FAFC',
                                                color: isSelected ? 'white !important' : '#475569',
                                                '& .MuiChip-icon': { color: isSelected ? 'white !important' : `${factor.color} !important` }
                                            }}
                                        />
                                    );
                                })}
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={7}>
                        <Box className="glass-card auto-height">
                            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                <AutoAwesome sx={{ color: activeColor, fontSize: 20 }} />
                                <Typography className="section-title" sx={{ mb: 0 }}>5. NOTAS (Espacio Seguro)</Typography>
                            </Stack>
                            <TextField
                                fullWidth multiline minRows={12}
                                placeholder={getSmartPlaceholder()}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                variant="standard"
                                InputProps={{ disableUnderline: true }}
                                className="clean-textfield"
                                sx={{ flex: 'none' }} 
                            />
                        </Box>
                    </Grid>
                </Grid>
              </Grid>

            </Grid>
          </Fade>
        </Container>

        <Box className="floating-footer-container">
            <Button
              onClick={submitData}
              className="save-button"
              disabled={isSaving || selectedMoods.length === 0}
              startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <Check />}
            >
              {isSaving ? 'Guardando...' : 'Guardar y Analizar'}
            </Button>
        </Box>

        <BottomNavbar currentTab={1} />
      </Box>
    </ThemeProvider>
  );
};

export default NewEntry;