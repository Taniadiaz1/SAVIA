import React, { useState } from 'react';
import { 
  Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  Typography, Box
} from '@mui/material';
import { 
  Sos as SosIcon, LocalPhone, SupportAgent, Message
} from '@mui/icons-material';

import '../../styles/SOSButton.css'; // Importando desde styles

const SOSButton = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleWhatsApp = () => {
    const message = "Hola, necesito ayuda. No me siento bien.";
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <>
      <Button 
        variant="contained" 
        color="error" 
        startIcon={<SosIcon />}
        onClick={handleOpen}
        className="sos-main-button"
      >
        SOS
      </Button>

      <Dialog 
        open={open} onClose={handleClose} fullWidth maxWidth="xs"
        PaperProps={{ className: 'sos-dialog-paper' }}
      >
        <DialogTitle className="sos-dialog-title">
          <Box className="sos-icon-header"><SosIcon color="error" sx={{ fontSize: 60 }} /></Box>
          <Typography variant="h5" fontWeight="bold">¿Necesitas ayuda?</Typography>
        </DialogTitle>
        
        <DialogContent>
          <List className="sos-options-list">
            {/* Opción 1: 911 Directo */}
            <ListItem disablePadding>
              <ListItemButton 
                component="a" href="tel:911"
                className="sos-list-button sos-btn-911"
              >
                <ListItemIcon><LocalPhone color="error" fontSize="large" /></ListItemIcon>
                <ListItemText primary="Llamar al 911" secondary="Policía / Ambulancia" primaryTypographyProps={{ className: 'sos-text-primary text-red' }} />
              </ListItemButton>
            </ListItem>

            {/* Opción 2: Línea de la Vida */}
            <ListItem disablePadding>
              <ListItemButton 
                component="a" href="tel:8009112000"
                className="sos-list-button sos-btn-life"
              >
                <ListItemIcon><SupportAgent color="primary" fontSize="large" /></ListItemIcon>
                <ListItemText primary="Línea de la Vida" secondary="Atención Psicológica" primaryTypographyProps={{ className: 'sos-text-primary text-blue' }} />
              </ListItemButton>
            </ListItem>

            {/* Opción 3: WhatsApp */}
            <ListItem disablePadding>
              <ListItemButton onClick={handleWhatsApp} className="sos-list-button sos-btn-whatsapp">
                <ListItemIcon><Message color="success" fontSize="large" /></ListItemIcon>
                <ListItemText primary="Mensaje WhatsApp" secondary="Contactar familiar" primaryTypographyProps={{ className: 'sos-text-primary text-green' }} />
              </ListItemButton>
            </ListItem>
          </List>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button onClick={handleClose} color="inherit">Cancelar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SOSButton;