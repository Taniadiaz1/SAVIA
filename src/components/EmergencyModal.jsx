// src/components/EmergencyModal.jsx
import React from 'react';
import { 
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  List, ListItem, ListItemIcon, ListItemText 
} from '@mui/material';
import { Lifebuoy, CheckCircle } from '@phosphor-icons/react';
import { LocationOn, MenuBook } from '@mui/icons-material';

// Recibimos los datos como props
import { BOOKS_RECOMMENDATION } from '../data/emergencyData';

const EmergencyModal = ({ open, onClose, onConfirm, onFindHelp }) => {
  return (
    <Dialog 
        open={open} 
        onClose={onClose}
        PaperProps={{ sx: { borderRadius: 4, p: 1, maxWidth: 500 } }}
    >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#D32F2F', fontWeight: 'bold' }}>
            <Lifebuoy size={32} weight="fill" /> Savia detectó que podrías necesitar apoyo
        </DialogTitle>
        
        <DialogContent>
            <Typography variant="body1" paragraph sx={{ color: '#475569' }}>
                Hemos notado palabras en tu nota que indican un momento difícil. Recuerda que buscar ayuda es un acto de valentía.
            </Typography>
            
            {/* SECCIÓN DE AYUDA INMEDIATA */}
            <Box sx={{ bgcolor: '#FEF2F2', p: 2, borderRadius: 2, mb: 2, border: '1px solid #FECACA' }}>
                <Typography variant="subtitle2" fontWeight="bold" color="#B91C1C" gutterBottom>
                    Opciones de Ayuda Inmediata:
                </Typography>
                <Button 
                    variant="contained" color="error" fullWidth startIcon={<LocationOn />}
                    onClick={onFindHelp} 
                    sx={{ mb: 1, borderRadius: 20, textTransform: 'none', fontWeight: 'bold' }}
                >
                    Buscar Psicólogos Cerca de Mí
                </Button>
                <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                    (Abre Google Maps según tu ubicación actual)
                </Typography>
            </Box>

            {/* SECCIÓN DE LIBROS */}
            <Typography variant="subtitle2" fontWeight="bold" color="#334155" sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MenuBook fontSize="small" /> Lecturas Recomendadas:
            </Typography>
            <List dense>
                {BOOKS_RECOMMENDATION.map((book, i) => (
                    <ListItem key={i} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                            <CheckCircle size={16} color="#475569"/>
                        </ListItemIcon>
                        <ListItemText 
                            primary={<Typography variant="body2" fontWeight="600">{book.title}</Typography>} 
                            secondary={book.desc} 
                        />
                    </ListItem>
                ))}
            </List>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
            <Button onClick={onClose} color="inherit" sx={{ color: '#64748B' }}>
                Cancelar
            </Button>
            <Button onClick={onConfirm} color="primary" variant="outlined" sx={{ borderRadius: 20 }}>
                Estoy bien, Guardar Nota
            </Button>
        </DialogActions>
    </Dialog>
  );
};

export default EmergencyModal;