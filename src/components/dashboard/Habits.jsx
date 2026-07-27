import React from 'react';
import { Card, Box, Typography, Avatar } from '@mui/material';
import BedIcon from '@mui/icons-material/Bed';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';

const habitData = [
  { label: 'Sueño', value: '7h 20m registrados', icon: <BedIcon />, color: '#E8EAF6', iconColor: '#7986CB' }, // [cite: 18, 19]
  { label: 'Actividad', value: 'Caminata ligera', icon: <DirectionsRunIcon />, color: '#E0F2F1', iconColor: '#4DB6AC' } // [cite: 20, 21]
];

const Habits = () => {
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 2, textTransform: 'uppercase', fontSize: '0.85rem', color: '#BDBDBD' }}>
        Tus Hábitos
      </Typography>
      
      {habitData.map((h, index) => (
        <Card key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 2, boxShadow: '0px 4px 20px rgba(0,0,0,0.03)' }}>
          <Avatar variant="rounded" sx={{ bgcolor: h.color, color: h.iconColor, mr: 2, width: 48, height: 48 }}>
            {h.icon}
          </Avatar>
          <Box>
            <Typography variant="body1" fontWeight="bold">{h.label}</Typography>
            <Typography variant="body2" color="text.secondary">{h.value}</Typography>
          </Box>
        </Card>
      ))}
    </Box>
  );
};

export default Habits;