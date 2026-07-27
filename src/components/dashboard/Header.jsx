import React from 'react';
import { Box, Typography } from '@mui/material';
import SOSButton from '../common/SOSButton';

const Header = ({ userName }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Box>
        <Typography variant="h4" fontWeight="800" color="text.primary">
          Hola, {userName} 👋
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          ¿Cómo te sientes hoy?
        </Typography>
      </Box>
      <SOSButton />
    </Box>
  );
};

export default Header;