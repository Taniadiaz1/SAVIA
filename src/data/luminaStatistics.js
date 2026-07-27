// src/data/luminaStatistics.js

/**
 * MOTOR DE ESTADÍSTICA (Minería de Datos - Módulo 4.1.10)
 * Recibe el historial real y calcula tendencias matemáticas.
 */

export const getWeeklyStats = (data) => {
  // Validación de seguridad: si no hay datos suficientes
  if (!data || data.length < 2) {
    return {
      trend: { label: "Calculando...", iconType: "flat", color: "#94a3b8" },
      stability: { label: "---", color: "#94a3b8" }
    };
  }

  // Extraemos solo los valores numéricos de energía
  const values = data.map(d => Number(d.energyLevel) || 5);

  // 1. CÁLCULO DE TENDENCIA (Regresión simplificada)
  // Comparamos el promedio de la primera mitad vs la segunda mitad
  const halfIndex = Math.floor(values.length / 2);
  const firstHalf = values.slice(0, halfIndex);
  const secondHalf = values.slice(halfIndex);

  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length || 0;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length || 0;

  let trendLabel = "Estable";
  let iconType = "flat";
  let trendColor = "#64748B"; // Gris pizarra (neutral)

  if (avgSecond > avgFirst + 0.5) {
    trendLabel = "Mejorando";
    iconType = "up";
    trendColor = "#10B981"; // Verde esmeralda
  } else if (avgSecond < avgFirst - 0.5) {
    trendLabel = "Decayendo";
    iconType = "down";
    trendColor = "#EF4444"; // Rojo
  }

  // 2. CÁLCULO DE ESTABILIDAD (Desviación Estándar)
  // Mide qué tanto varía el ánimo (si es una montaña rusa o una línea recta)
  const totalAvg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - totalAvg, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  let stabLabel = "Variable";
  let stabColor = "#F59E0B"; // Ambar

  if (stdDev < 1.2) {
    stabLabel = "Muy Estable";
    stabColor = "#10B981"; // Verde
  } else if (stdDev > 2.5) {
    stabLabel = "Caótico";
    stabColor = "#EF4444"; // Rojo
  }

  return {
    trend: { label: trendLabel, iconType, color: trendColor },
    stability: { label: stabLabel, color: stabColor }
  };
};