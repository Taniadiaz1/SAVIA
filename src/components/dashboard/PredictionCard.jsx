import React, { useState, useEffect } from 'react';
import { Card, Box, Typography, CircularProgress, Chip, Stack, Button } from '@mui/material';
import { Sparkle, MoonStars, SunDim, TrendUp, Warning } from '@phosphor-icons/react';
import SaviaNeuro from '../../services/SaviaNeuro'; // Importamos tu cerebro

const PredictionCard = ({ historyData }) => {
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [improvement, setImprovement] = useState(0); // Cuánto mejoraría si te cuidas

  useEffect(() => {
    const runAI = async () => {
      // 1. Necesitamos datos para aprender. Si es usuario nuevo, no hacemos nada.
      if (!historyData || historyData.length < 3) {
        setLoading(false);
        return;
      }

      try {
        // 2. ENTRENAR (On-Device Training) 🏋️‍♂️
        // Esto toma unos milisegundos porque son pocos datos
        await SaviaNeuro.train(historyData);

        // 3. PREPARAR EL CONTEXTO DE HOY (Real vs Ideal)
        // Escenario A: Realidad (Supongamos un día promedio/cansado)
        const currentContext = {
            energyLevel: 5,
            mood: 'neutral',
            habits: [] // Sin hábitos buenos aún
        };

        // Escenario B: Simulación Ideal (¿Qué pasa si hoy te cuidas?)
        const idealContext = {
            energyLevel: 5,
            mood: 'calm',
            habits: ['sleep', 'meditation'] // Forzamos hábitos positivos
        };

        // 4. HACER LAS DOS PREDICCIONES 🔮
        const scoreReal = await SaviaNeuro.predict(historyData, currentContext);
        const scoreIdeal = await SaviaNeuro.predict(historyData, idealContext);

        // 5. CALCULAR RESULTADOS
        setPrediction(scoreReal);
        
        // Calculamos cuánto subiría tu energía (ej: de 6.0 a 7.5)
        const boost = (parseFloat(scoreIdeal) - parseFloat(scoreReal)).toFixed(1);
        setImprovement(boost > 0 ? boost : 0); // Solo si mejora
        
        setLoading(false);

      } catch (error) {
        console.error("Error en Savia AI:", error);
        setLoading(false);
      }
    };

    runAI();
  }, [historyData]);

  // --- RENDERIZADO ---

  // Estado de Carga
  if (loading) return (
    <Card sx={{ p: 3, borderRadius: 4, bgcolor: '#F8FAFC', minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack alignItems="center" spacing={2}>
            <CircularProgress size={24} sx={{ color: '#6366F1' }} />
            <Typography variant="caption" color="text.secondary">Calibrando Neuronas...</Typography>
        </Stack>
    </Card>
  );

  // Estado: Faltan Datos
  if (!historyData || historyData.length < 3) return (
    <Card sx={{ p: 3, borderRadius: 4, border: '1px dashed #CBD5E1', bgcolor: 'transparent', textAlign: 'center' }}>
        <Sparkle size={32} color="#94A3B8" weight="duotone" />
        <Typography variant="body2" color="text.secondary" mt={1}>
            La IA necesita al menos 3 días de historia para despertar. ¡Sigue registrando!
        </Typography>
    </Card>
  );

  // Estado: ¡PREDICCIÓN LISTA! 🚀
  const scoreNum = parseFloat(prediction);
  const isLow = scoreNum < 6;

  return (
    <Card sx={{ 
        p: 3, borderRadius: 4, position: 'relative', overflow: 'hidden',
        background: isLow 
            ? 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)' // Rojizo suave si viene baja
            : 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)', // Azul suave si viene bien
        border: '1px solid',
        borderColor: isLow ? '#FECDD3' : '#C7D2FE'
    }}>
        {/* Decoración de fondo */}
        <Box sx={{ position: 'absolute', top: -10, right: -10, opacity: 0.1 }}>
            <Sparkle size={100} weight="fill" />
        </Box>

        <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
            <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                {isLow ? <MoonStars size={24} color="#E11D48" weight="duotone"/> : <SunDim size={24} color="#4F46E5" weight="duotone"/>}
            </Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: isLow ? '#9F1239' : '#3730A3', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Savia Neural AI
            </Typography>
        </Stack>

        <Typography variant="body2" sx={{ color: '#475569', mb: 1, fontWeight: 500 }}>
            {isLow 
                ? "Tu tendencia indica que la energía podría bajar mañana." 
                : "¡Vienes con buena inercia! Tu energía se mantendrá estable."}
        </Typography>

        <Stack direction="row" alignItems="flex-end" spacing={1} mt={1}>
            <Typography variant="h2" fontWeight="900" sx={{ color: isLow ? '#E11D48' : '#4F46E5', lineHeight: 1 }}>
                {prediction}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: '#64748B' }}>/ 10 est.</Typography>
        </Stack>

        {/* LA SECCIÓN "CONDICIONAL" (El consejo empoderador) */}
        {parseFloat(improvement) > 0.3 && (
            <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(255,255,255,0.6)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.8)' }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <TrendUp size={20} color="#059669" weight="bold" />
                    <Typography variant="caption" fontWeight="bold" color="#059669">
                        Potencial de mejora: +{improvement} pts
                    </Typography>
                </Stack>
                <Typography variant="caption" display="block" color="#334155" mt={0.5}>
                    Si hoy <b>duermes temprano</b> y <b>meditas</b>, tu pronóstico subiría. 🌱
                </Typography>
            </Box>
        )}
    </Card>
  );
};

export default PredictionCard;