// src/data/emergencyData.js
import { CheckCircle } from '@phosphor-icons/react';

export const RISK_KEYWORDS = [
  // Ideación suicida directa (riesgo alto)
  'morir',
  'suicidio',
  'suicidarme',
  'matarme',
  'quitarme la vida',
  'acabar con mi vida',
  'acabar con todo',
  'no quiero vivir',
  'quiero morir',
  'prefiero estar muerto',
  'ya no quiero estar aqui',
  'adios mundo',
  'ya no estar aqui',

  // Ideación pasiva / desesperanza (riesgo medio)
  'quiero desaparecer',
  'estoy cansado de vivir',
  'estoy cansada de vivir',
  'ya no puedo mas',
  'no puedo mas',
  'todo esta perdido',
  'no hay salida',
  'sin esperanza',
  'nada importa',
  'no valgo nada',
  'soy una carga',
  'mi vida no tiene sentido',
  'no le veo sentido a la vida',

  // Autolesión
  'autolesion',
  'autolesión',
  'cortarme',
  'cortes',
  'hacerme daño',
  'lastimarme',
  'quemarme',
  'golpearme',

  // Métodos / medios (contexto importante)
  'pastillas',
  'sobredosis',
  'ahorcarme',
  'colgarme',
  'sangrar',
  'puente',
  'arma',
  'cuchillo',

  // Peticiones de ayuda urgentes
  'ayuda por favor',
  'necesito ayuda',
  'ya no aguanto',
  'por favor ayudenme',
  'alguien escucheme',
  'ayuda urgente'
];


export const BOOKS_RECOMMENDATION = [
  { 
    title: "El hombre en busca de sentido", 
    author: "Viktor Frankl", 
    desc: "Para encontrar propósito en el dolor." 
  },
  { 
    title: "Sentirse bien", 
    author: "David D. Burns", 
    desc: "Técnicas cognitivas para la depresión." 
  },
  { 
    title: "El poder del ahora", 
    author: "Eckhart Tolle", 
    desc: "Para calmar la mente y la ansiedad." 
  }
];