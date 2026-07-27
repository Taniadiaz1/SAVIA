

// ==========================================
// PARTE 1: SISTEMA EXPERTO (NUEVO: ARQUETIPOS DE HÁBITOS)
// Objetivo: Clasificar el "Tipo de Día" según las actividades realizadas
// ==========================================

// 1. CLASIFICACIÓN DE ACTIVIDADES
const HABIT_CATEGORIES = {
  physical: ['exercise', 'sport', 'walk', 'eat_healthy', 'water', 'sleep_early'],
  mental:   ['read', 'study', 'work', 'chess', 'learn', 'focus'],
  soul:     ['meditation', 'journaling', 'nature', 'grateful', 'social', 'family', 'friends']
};

// 2. BASE DE CONOCIMIENTO (Los Personajes)
const ARCHETYPES = {
  WARRIOR: {
    label: "Modo Guerrero",
    description: "Hoy tu enfoque fue fortalecer el cuerpo y la salud física.",
    color: "#D32F2F", // Rojo
    icon: "⚔️"
  },
  SAGE: {
    label: "Modo Sabio",
    description: "Un día dedicado al cultivo de la mente y el aprendizaje.",
    color: "#1976D2", // Azul
    icon: "🦉"
  },
  MONK: {
    label: "Modo Zen",
    description: "Priorizaste la conexión, la calma y el espíritu.",
    color: "#388E3C", // Verde
    icon: "🧘"
  },
  ALCHEMIST: {
    label: "El Alquimista",
    description: "Un día perfectamente equilibrado. Tienes un poco de todo.",
    color: "#7B1FA2", // Morado
    icon: "⚗️"
  },
  NOVICE: {
    label: "El Iniciado",
    description: "Un día tranquilo. Pequeños pasos comienzan el viaje.",
    color: "#607D8B", // Gris Azulado
    icon: "🌱"
  }
};

// --- FUNCIÓN 1: EXPORTAR ARQUETIPO (SISTEMA EXPERTO) ---
export const getExpertResponse = (habitsArray = []) => {
  if (!habitsArray || habitsArray.length === 0) return ARCHETYPES.NOVICE;

  let counts = { physical: 0, mental: 0, soul: 0 };

  // Contar puntos por categoría
  habitsArray.forEach(habit => {
    if (HABIT_CATEGORIES.physical.includes(habit)) counts.physical++;
    else if (HABIT_CATEGORIES.mental.includes(habit)) counts.mental++;
    else if (HABIT_CATEGORIES.soul.includes(habit)) counts.soul++;
    else counts.physical++; // Default si no coincide
  });

  // Reglas de decisión (Expert Rules)
  const total = counts.physical + counts.mental + counts.soul;
  
  // Regla 1: Equilibrio (Si tienes al menos 1 de cada uno y más de 3 hábitos)
  if (total >= 3 && counts.physical > 0 && counts.mental > 0 && counts.soul > 0) {
    return ARCHETYPES.ALCHEMIST;
  }

  // Regla 2: Dominancia
  const maxCategory = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);

  if (maxCategory === 'physical') return ARCHETYPES.WARRIOR;
  if (maxCategory === 'mental')   return ARCHETYPES.SAGE;
  if (maxCategory === 'soul')     return ARCHETYPES.MONK;

  return ARCHETYPES.NOVICE; // Fallback
};

// ============================================================
// PARTE 2: LÓGICA DIFUSA (FUZZY LOGIC) - ACADÉMICO 
// Objetivo: Calcular el "Nivel de Ánimo Global" (0-100%)
// ============================================================

// 1. HELPER: Convertir texto de ánimo a valor numérico (Valencia)
const getMoodValence = (moodText) => {
    const normalized = moodText ? moodText.toLowerCase() : 'neutral';
    const map = {
        'feliz': 9, 'contento': 9, 'happy': 9, 'excited': 9, 'radiante': 10, 'alegre': 9,
        'calmado': 7, 'tranquilo': 7, 'relajado': 8, 'calm': 7,
        'neutral': 5, 'normal': 5, 'bien': 6,
        'cansado': 4, 'aburrido': 4, 'sueño': 4, 'tired': 4,
        'ansioso': 3, 'nervioso': 3, 'estresado': 3, 'anxious': 3,
        'triste': 2, 'deprimido': 1, 'mal': 2, 'sad': 2,
        'enojado': 2, 'molesto': 2, 'angry': 2
    };
    return map[normalized] || 5; // Default 5
};

// 2. FUNCIONES DE PERTENENCIA
const triangle = (x, a, b, c) => Math.max(0, Math.min((x - a) / (b - a), (c - x) / (c - b)));
const trapezoidLeft = (x, a, b) => (x <= a ? 1 : x >= b ? 0 : (b - x) / (b - a));
const trapezoidRight = (x, a, b) => (x <= a ? 0 : x >= b ? 1 : (x - a) / (b - a));

// --- FUNCIÓN 2: EXPORTAR CÁLCULO DIFUSO ---
export const calculateFuzzyMood = (energyInput, moodText) => {
    
    const energy = Number(energyInput) || 5;
    const valence = getMoodValence(moodText); // (0 a 10)

    // PASO A: FUSIFICACIÓN
    // Energía Física
    const eLow = trapezoidLeft(energy, 2, 5);
    const eHigh = trapezoidRight(energy, 4, 8);

    // Valencia Emocional (Sentimiento puro)
    const vNeg = trapezoidLeft(valence, 3, 5);  // Sentirse mal
    const vNeu = triangle(valence, 4, 6, 8);    // Sentirse normal
    const vPos = trapezoidRight(valence, 6, 9); // Sentirse bien

    // PASO B: REGLAS DIFUSAS
    
    // R1: "Crítico" (Cuerpo sin energía Y Mente negativa)
    const rCritical = Math.min(eLow, vNeg);

    // R2: "Bajo" (Cuerpo bien pero Mente negativa O Cuerpo mal y Mente neutra)
    const rLow = Math.max(Math.min(eHigh, vNeg), Math.min(eLow, vNeu));

    // R3: "Estable" (Mente neutra/positiva con energía media)
    const rStable = Math.min(eHigh, vNeu);

    // R4: "Óptimo" (Cuerpo con energía Y Mente positiva)
    const rOptimal = Math.min(eHigh, vPos);

    // PASO C: DESFUSIFICACIÓN
    const numerator = (rCritical * 10) + (rLow * 30) + (rStable * 60) + (rOptimal * 95);
    const denominator = rCritical + rLow + rStable + rOptimal;

    if (denominator === 0) return { score: 50, label: "Neutro", color: "#9e9e9e" };

    const score = (numerator / denominator).toFixed(0); 

    let label = "Neutro";
    let color = "#9e9e9e"; 

    if (score < 25) { label = "Bajo Ánimo"; color = "#ef5350"; } // Rojo
    else if (score < 50) { label = "Decaído"; color = "#ffa726"; } // Naranja
    else if (score < 75) { label = "Sereno"; color = "#42a5f5"; } // Azul
    else { label = "Radiante"; color = "#66bb6a"; } // Verde

    return { score, label, color };
};