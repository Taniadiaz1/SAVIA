// src/components/dashboard/InsightsGraph.jsx
import React, { useMemo } from 'react';
import { Box, Typography, Stack, Avatar, Skeleton } from '@mui/material';
import { 
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Pulse, 
  TrendUp, 
  TrendDown, 
  Minus, 
  Waves 
} from '@phosphor-icons/react';

// IMPORTAMOS EL MOTOR ESTADÍSTICO
import { getWeeklyStats } from '../../data/luminaStatistics';

// AHORA RECIBIMOS 'data' COMO PROP DESDE EL DASHBOARD (FIREBASE)
const InsightsGraph = ({ data }) => {
  
  // 1. MANEJO DE ESTADO DE CARGA (Si no hay datos aún)
  if (!data || data.length === 0) {
    return (
      <Box className="glass-panel" sx={{ mt: 3, p: 3, minHeight: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
         <Stack spacing={1} alignItems="center">
            <Pulse size={32} color="#CBD5E1" />
            <Typography variant="body2" color="text.secondary">Cargando historial...</Typography>
         </Stack>
      </Box>
    );
  }

  // 2. CÁLCULO EN TIEMPO REAL CON DATOS REALES
  // Usamos useMemo para recalcular solo cuando llegue nueva data de Firebase
  const stats = useMemo(() => getWeeklyStats(data), [data]);

  // Seleccionar icono de tendencia dinámicamente
  const getTrendIcon = () => {
    if (stats.trend.iconType === 'up') return <TrendUp size={22} color={stats.trend.color} weight="bold" />;
    if (stats.trend.iconType === 'down') return <TrendDown size={22} color={stats.trend.color} weight="bold" />;
    return <Minus size={22} color={stats.trend.color} weight="bold" />;
  };

  return (
    <Box className="glass-panel" sx={{ 
      mt: 3, 
      p: 3, 
      alignItems: 'stretch !important',
      minHeight: '280px' 
    }}>
      
      {/* HEADER */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Avatar variant="rounded" sx={{ bgcolor: '#E3F2FD', color: '#42A5F5' }}>
          <Pulse size={24} weight="light" />
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#334155', lineHeight: 1.2 }}>
            Estabilidad Emocional
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500 }}>
            Análisis de historial real ({data.length} registros)
          </Typography>
        </Box>
      </Stack>

      {/* GRÁFICA CON DATOS REALES */}
      <Box sx={{ width: '100%', height: 160, mb: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#42A5F5" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#42A5F5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" // CAMBIO: Usamos la fecha real de Firebase
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 10 }} 
              interval={4} // Mostrar fecha cada 4 días para que quepan
              dy={10}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Area 
              type="monotone" 
              dataKey="energyLevel" // CAMBIO: Usamos el campo real de Firebase
              stroke="#42A5F5" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorEnergy)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>

      {/* FOOTER CON DATOS CALCULADOS */}
      <Stack direction="row" spacing={1} justifyContent="space-between" sx={{ mt: 1 }}>
        
        {/* DATO 1: TENDENCIA */}
        <Box sx={{ 
          bgcolor: 'rgba(255,255,255,0.6)', p: 1.5, borderRadius: '16px', width: '48%',
          display: 'flex', alignItems: 'center', gap: 1.5, border: '1px solid #F1F5F9'
        }}>
          {getTrendIcon()}
          <Box>
            <Typography variant="caption" display="block" color="text.secondary" fontWeight="600">
              Tendencia
            </Typography>
            <Typography variant="body2" fontWeight="bold" sx={{ color: stats.trend.color }}>
              {stats.trend.label}
            </Typography>
          </Box>
        </Box>

        {/* DATO 2: ESTABILIDAD */}
        <Box sx={{ 
          bgcolor: 'rgba(255,255,255,0.6)', p: 1.5, borderRadius: '16px', width: '48%',
          display: 'flex', alignItems: 'center', gap: 1.5, border: '1px solid #F1F5F9'
        }}>
          <Waves size={22} color={stats.stability.color} weight="bold" />
          <Box>
            <Typography variant="caption" display="block" color="text.secondary" fontWeight="600">
              Estabilidad
            </Typography>
            <Typography variant="body2" fontWeight="bold" sx={{ color: stats.stability.color }}>
              {stats.stability.label}
            </Typography>
          </Box>
        </Box>

      </Stack>
    </Box>
  );
};

export default InsightsGraph;