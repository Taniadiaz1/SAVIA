import React from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, 
  Button, Typography, Box, Stack, Chip 
} from '@mui/material';
import { Brain } from '@phosphor-icons/react';

const FuzzyLogicModal = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="fuzzy-logic-title"
      maxWidth="sm"
    >
      <DialogTitle id="fuzzy-logic-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Brain size={28} color="#BE185D" weight="fill" />
        <Typography variant="h6" fontWeight="800" color="#BE185D">
          El Algoritmo de SAVIA
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <DialogContentText component="div">
          <Typography variant="body1" paragraph color="#1E293B">
            <strong>¿Por qué SAVIA te entiende mejor?</strong>
          </Typography>
          <Typography variant="body2" paragraph>
            La mayoría de las apps ven el mundo en blanco y negro (0 o 1). Estás "Feliz" O estás "Triste". 
            Pero las emociones humanas no son binarias.
          </Typography>
          
          <Box sx={{ bgcolor: '#FDF2F8', p: 2, borderRadius: 2, my: 2, borderLeft: '4px solid #EC4899' }}>
            <Typography variant="subtitle2" fontWeight="bold" color="#BE185D" gutterBottom>
              Tecnología: Lógica Difusa (Fuzzy Logic)
            </Typography>
            <Typography variant="body2" color="#334155">
              SAVIA utiliza conjuntos difusos para calcular <strong>grados de pertenencia</strong>. 
              No estás solo "Ansioso", el algoritmo puede detectar matices complejos:
            </Typography>
            <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1 }}>
              <Chip label="70% Ansioso" size="small" color="secondary" variant="outlined" />
              <Chip label="20% Cansado" size="small" color="default" variant="outlined" />
              <Chip label="10% Neutral" size="small" color="default" variant="outlined" />
            </Stack>
          </Box>

          <Typography variant="body2">
            <strong>El Proceso:</strong>
            <br />
            1. <strong>Fuzzificación:</strong> Convertimos tus datos en valores matemáticos continuos.
            <br />
            {/* CORRECCIÓN: Usamos el código HTML para la flecha */}
            2. <strong>Inferencia:</strong> Aplicamos reglas expertas (Si energía baja Y ansiedad alta &rarr; Sugerir descanso activo).
            <br />
            3. <strong>Defuzzificación:</strong> Traducimos el cálculo en un consejo humano.
          </Typography>
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} sx={{ color: '#64748B' }}>
          Cerrar
        </Button>
        <Button onClick={onClose} variant="contained" color="primary">
          Entendido
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FuzzyLogicModal;