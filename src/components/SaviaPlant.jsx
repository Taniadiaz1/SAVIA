import React, { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress, Paper, Fade, Tooltip } from '@mui/material';
import { Sparkle } from '@phosphor-icons/react';

// 1. IMPORTAMOS LOTTIE
import Lottie from "lottie-react";

// 2. IMPORTAMOS TUS ANIMACIONES JSON
// Asegúrate de que los nombres de archivo coincidan
import seedAnim from '../assets/animations/seed.json';
import sproutAnim from '../assets/animations/sprout.json';
import flowerAnim from '../assets/animations/flower.json';
import treeAnim from '../assets/animations/tree.json';

// FIREBASE
import { db, auth } from '../services/firebaseConfig';
import { collection, query, getDocs } from 'firebase/firestore';

// --- CONSTANTES DEL MODELO MATEMÁTICO ---
const THETA_THRESHOLD = 5; 

const SaviaPlant = () => {
  const [level, setLevel] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  // Mapeo visual: Qué animación mostrar según el nivel
  const getPlantAnimation = (lvl) => {
    let animData = seedAnim; // Por defecto semilla

    if (lvl === 1) {
        animData = seedAnim;
    } 
    else if (lvl <= 3) {
        animData = sproutAnim; // Brote (Nivel 2-3)
    } 
    else if (lvl <= 10) {
        animData = flowerAnim; // Flor (Nivel 4-10)
    } 
    else {
        animData = treeAnim; // Árbol (Nivel 11+)
    }

    // Renderizamos el componente Lottie
    return (
        <Lottie 
            animationData={animData} 
            loop={true} 
            style={{ height: 160, width: 160 }} // Ajusta el tamaño aquí si se ve muy grande/chico
        />
    );
  };

  const getMotivationalMessage = (lvl) => {
    if (lvl === 1) return "Tu semilla está durmiendo. ¡Completa hábitos para despertarla!";
    if (lvl <= 3) return "¡Está brotando! Sigue nutriéndola.";
    if (lvl <= 6) return "Tus raíces se están fortaleciendo.";
    if (lvl <= 10) return "¡Mira qué belleza! Estás floreciendo.";
    return "¡Un árbol robusto! Tu constancia es inquebrantable.";
  };

  useEffect(() => {
    const calculateGrowth = async () => {
      if (!auth.currentUser) return;

      try {
        // 1. OBTENCIÓN DE DATOS
        const q = query(collection(db, "users", auth.currentUser.uid, "entries"));
        const snapshot = await getDocs(q);

        let accumulatedPoints = 0;

        // 2. ALGORITMO DE SUMATORIA LINEAL
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.habits && Array.isArray(data.habits)) {
            accumulatedPoints += data.habits.length;
          }
        });

        setTotalPoints(accumulatedPoints);

        // 3. FUNCIÓN DE NIVEL
        const calculatedLevel = Math.floor(accumulatedPoints / THETA_THRESHOLD) + 1;
        setLevel(calculatedLevel);

        // 4. CÁLCULO DE PROGRESO
        const currentLevelBase = (calculatedLevel - 1) * THETA_THRESHOLD;
        const pointsInCurrentLevel = accumulatedPoints - currentLevelBase;
        const percentage = (pointsInCurrentLevel / THETA_THRESHOLD) * 100;
        
        setProgress(percentage);

      } catch (error) {
        console.error("Error calculando crecimiento:", error);
      } finally {
        setLoading(false);
      }
    };

    calculateGrowth();
  }, []);

  return (
    <Fade in={!loading} timeout={1000}>
      <Paper 
        elevation={6}
        sx={{
            p: 3,
            borderRadius: 5,
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(241,248,233,0.9))',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.6)',
            position: 'relative',
            overflow: 'hidden'
        }}
      >
        {/* Decoración de fondo */}
        <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
            <Sparkle size={150} weight="fill" color="#FFD700"/>
        </Box>

        {/* Título */}
        <Typography variant="subtitle2" fontWeight="bold" color="#558B2F" sx={{ letterSpacing: 1.5, mb: 1 }}>
            MI JARDÍN INTERIOR
        </Typography>

        {/* --- AQUÍ ESTÁ EL CAMBIO PRINCIPAL: ANIMACIÓN LOTTIE --- */}
        <Box sx={{ 
            height: 160, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mb: 1
        }}>
            {getPlantAnimation(level)}
        </Box>

        {/* Nivel y Puntos */}
        <Typography variant="h4" fontWeight="900" color="#33691E">
            Nivel {level}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
            {totalPoints} hábitos cultivados en total
        </Typography>

        {/* Barra de Progreso */}
        <Box sx={{ mt: 2, mb: 1, position: 'relative' }}>
            <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ 
                    height: 10, borderRadius: 5, bgcolor: '#E0E0E0',
                    '& .MuiLinearProgress-bar': {
                        bgcolor: '#66BB6A',
                        borderRadius: 5
                    }
                }} 
            />
            <Typography variant="caption" sx={{ position: 'absolute', right: 0, top: 12, color: '#66BB6A', fontWeight: 'bold' }}>
                {Math.round(progress)}% para Nivel {level + 1}
            </Typography>
        </Box>

        {/* Mensaje Motivacional */}
        <Tooltip title="Sigue registrando hábitos para crecer" placement="bottom">
            <Typography 
                variant="body2" 
                sx={{ 
                    mt: 3, p: 1.5, 
                    bgcolor: 'rgba(255,255,255,0.6)', 
                    borderRadius: 3, 
                    color: '#558B2F', 
                    fontStyle: 'italic',
                    fontWeight: 500
                }}
            >
                "{getMotivationalMessage(level)}"
            </Typography>
        </Tooltip>
      </Paper>
    </Fade>
  );
};

export default SaviaPlant;