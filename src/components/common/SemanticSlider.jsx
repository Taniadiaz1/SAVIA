import React from 'react';
import { Box, Typography, Slider } from '@mui/material';
import { styled } from '@mui/material/styles';

const CustomSlider = styled(Slider)(({ theme, barcolor }) => ({
  color: barcolor,
  height: 10,
  '& .MuiSlider-track': { border: 'none', borderRadius: 5 },
  '& .MuiSlider-thumb': { height: 24, width: 24, backgroundColor: '#fff', border: '2px solid currentColor' },
  '& .MuiSlider-rail': { opacity: 0.3, backgroundColor: '#bfbfbf' },
}));

const SemanticSlider = ({ label, leftText, rightText, color, value, onChange }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" fontWeight="600" gutterBottom>{label}</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="caption" color="text.secondary">{leftText}</Typography>
        <Typography variant="caption" color="text.secondary">{rightText}</Typography>
      </Box>
      <CustomSlider value={value} onChange={onChange} barcolor={color} defaultValue={50} />
    </Box>
  );
};

export default SemanticSlider;