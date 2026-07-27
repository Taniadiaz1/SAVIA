/**
 * @license
 * © 2026 Tania Joseline Recendis Díaz. Todos los derechos reservados.
 * Autor: Tania Joseline Recendis Díaz
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Typography, TextField, IconButton, Stack 
} from '@mui/material';
import { 
  PaperPlaneRight 
} from '@phosphor-icons/react';
import { sendMessageToLumi } from '../services/openai'; 
import '../styles/LumiChat.css';
import fondoHojas from '../assets/backgroundlanding/sl_120420_38590_16.jpg';

// Imports Components
import BottomNavbar from '../components/BottomNavbar';
import Header from '../components/Header'; // Header Nuevo (Global)
import Footer from '../components/Footer';

const LumiChat = () => {
  const messagesEndRef = useRef(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Hola, soy Savia. 🌱 Estoy aquí para nutrir tus pensamientos. ¿Qué está pasando por tu mente hoy?' 
    }
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    const aiResponseText = await sendMessageToLumi(newMessages);
    setMessages(prev => [...prev, { role: 'assistant', content: aiResponseText }]);
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <Box 
          className="chat-container"
          sx={{
               backgroundImage: `url(${fondoHojas})`,
               backgroundSize: 'cover',
               backgroundPosition: 'center',
               height: 'calc(100vh - 80px)', // Resta Navbar
               display: 'flex',
               flexDirection: 'column'
          }}
      >
        {/* 1. HEADER GLOBAL SAVIA (Reemplaza al anterior header de chat específico) */}
        <Header />

        {/* ÁREA DE MENSAJES (Scrollable) */}
        <Box className="messages-area" sx={{ flex: 1, overflowY: 'auto', pt: 2 }}>
            {/* Mensaje de Bienvenida estilo sistema */}
            <Typography variant="caption" align="center" display="block" color="text.secondary" sx={{ my: 2 }}>
                Hoy
            </Typography>

            {messages.map((msg, index) => (
                <Box 
                    key={index} 
                    className={`message-bubble ${msg.role === 'user' ? 'message-user' : 'message-lumi'}`}
                >
                    {msg.content}
                </Box>
            ))}
            
            {isLoading && (
                <Box className="typing-indicator">
                    Savia está pensando <div className="dot-flashing" />
                </Box>
            )}
            
            {/* 2. FOOTER (Dentro del scroll, al final de la conversación) */}
            <Box sx={{ mt: 20, mb:-20 }}>
                <Footer />
            </Box>

            <div ref={messagesEndRef} />
        </Box>

        {/* INPUT AREA */}
        <Box className="input-area">
          <TextField 
              fullWidth
              placeholder="Escribe lo que sientes..."
              variant="outlined"
              multiline
              maxRows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              sx={{ 
                  bgcolor: 'white', 
                  borderRadius: '12px',
                  '& .MuiOutlinedInput-root': { borderRadius: '12px' }
              }}
          />
          <IconButton 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              sx={{ 
                  bgcolor: '#0F172A', 
                  color: 'white', 
                  width: 50, height: 50,
                  '&:hover': { bgcolor: '#1E293B' },
                  '&.Mui-disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' }
              }}
          >
              <PaperPlaneRight weight="fill" />
          </IconButton>
        </Box>

      </Box>

      {/* 3. NAVBAR */}
      <BottomNavbar currentTab={4} />
    </>
  );
};

export default LumiChat;