import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { BatteryChargingFull, Bolt } from '@mui/icons-material'; // Iconos de energía

const EnergyGauge = ({ value = 5 }) => { 
  // Configuración del Anillo
  const data = [
    { name: 'Energy', value: value },
    { name: 'Empty', value: 10 - value },
  ];
  
  // COLORES DINÁMICOS
  // Rojo (<4), Azul (4-7), Verde (>7)
  let activeColor = '#42A5F5'; 
  let statusText = "Energía Estable";
  
  if(value <= 3) {
      activeColor = '#EF5350'; 
      statusText = "Batería Baja";
  } else if(value >= 8) {
      activeColor = '#66BB6A'; 
      statusText = "Energía Alta";
  }

  const COLORS = [activeColor, '#F1F5F9']; // Color activo vs Gris fondo

  return (
      <Box className="glass-panel" sx={{ 
          p: 3, 
          mt: 3, // Margen arriba para separarlo de Hábitos
          alignItems: 'center !important',
          position: 'relative',
          minHeight: '260px' // Altura fija para que se vea bien
      }}>
          {/* TÍTULO */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ alignSelf: 'flex-start', mb: 1 }}>
             <Bolt sx={{ color: activeColor }} />
             <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px' }}>
                NIVEL DE ENERGÍA
             </Typography>
          </Stack>

          {/* GRÁFICA CIRCULAR */}
          <Box sx={{ width: '100%', height: 180, position: 'relative' }}>
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                   <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={65} // Grosor del anillo
                      outerRadius={85}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={10} // Bordes redonditos en la barra
                   >
                      {data.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                   </Pie>
                </PieChart>
             </ResponsiveContainer>
             
             {/* TEXTO CENTRAL */}
             <Box sx={{
                 position: 'absolute', top: '50%', left: '50%', 
                 transform: 'translate(-50%, -50%)', textAlign: 'center'
             }}>
                 <BatteryChargingFull sx={{ color: activeColor, fontSize: 30, mb: -0.5 }} />
                 <Typography variant="h3" fontWeight="900" sx={{ color: activeColor, lineHeight: 1 }}>
                     {value}
                 </Typography>
                 <Typography variant="caption" color="text.secondary" fontWeight="bold">
                     / 10
                 </Typography>
             </Box>
          </Box>
          
          {/* SUBTÍTULO */}
          <Typography variant="body2" fontWeight="bold" sx={{ color: activeColor, mt: 0 }}>
              {statusText}
          </Typography>
      </Box>
  );
};

export default EnergyGauge;