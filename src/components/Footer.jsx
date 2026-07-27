import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 4, 
        textAlign: 'center',
        bgcolor: 'transparent',
        color: '#94A3B8',
        width: '100%',
        mt: 'auto' // Esto ayuda a empujarlo hacia abajo en Flexbox
      }}
    >
      <Typography variant="body2" fontWeight="600" color="#64748B">
        SAVIA | Ecosistema Emocional
      </Typography>
      <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
        © 2024 Creciendo contigo.
      </Typography>
      
      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Link href="#" color="inherit" underline="hover" variant="caption">Privacidad</Link>
        <Link href="#" color="inherit" underline="hover" variant="caption">Términos</Link>
      </Box>
    </Box>
  );
};

export default Footer;