import React, { useState, useEffect } from 'react';
import { Box, Typography, Fade } from '@mui/material';
import { Quotes } from '@phosphor-icons/react';
import '../styles/QuoteCarousel.css';

const QUOTES_DATA = [
  { text: "El éxito es la suma de pequeños esfuerzos repetidos día tras día.", author: "Robert Collier" },
  { text: "No cuentes los días, haz que los días cuenten.", author: "Muhammad Ali" },
  { text: "Cree que puedes y ya estás a medio camino.", author: "Theodore Roosevelt" },
  { text: "Nunca eres demasiado viejo para fijarte otra meta o soñar un nuevo sueño.", author: "C. S. Lewis" },
  { text: "Haz hoy lo que otros no quieren, haz mañana lo que otros no pueden.", author: "Jerry Rice" },
  { text: "El único modo de hacer un gran trabajo es amar lo que haces.", author: "Steve Jobs" },
  { text: "No fracases por miedo a fracasar.", author: "Roy T. Bennett" },
  { text: "La vida es 10% lo que te pasa y 90% cómo reaccionas.", author: "Charles R. Swindoll" },
  { text: "Nunca es tarde para ser quien podrías haber sido.", author: "George Eliot" },
  { text: "Lo que no te reta, no te cambia.", author: "Fred DeVito" },
  { text: "La disciplina tarde o temprano vencerá a la inteligencia.", author: "Proverbio japonés" },
  { text: "Empieza donde estás. Usa lo que tienes. Haz lo que puedas.", author: "Arthur Ashe" },
  { text: "El dolor es temporal, el orgullo es para siempre.", author: "Lance Armstrong" },
  { text: "No esperes. El tiempo nunca será el adecuado.", author: "Napoleon Hill" },
  { text: "Sé tú mismo; todos los demás ya están ocupados.", author: "Oscar Wilde" }
];

const QuoteCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Desvanecer la frase actual
      setVisible(false);
      
      // 2. Esperar un poco y cambiar la frase
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % QUOTES_DATA.length);
        setVisible(true); // 3. Mostrar la nueva
      }, 500); // 500ms coincide con la transición visual

    }, 6000); // Cambia cada 6 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="carousel-container">
        <Box className="quote-card">
            {/* Icono decorativo */}
            <div className="quote-icon-bg">“</div>
            <Box sx={{ position: 'absolute', top: 30, right: 30, opacity: 0.2 }}>
                <Quotes size={48} color="#0F172A" weight="fill" />
            </Box>

            <Fade in={visible} timeout={500}>
                <Box>
                    <Typography className="quote-text">
                        {QUOTES_DATA[currentIndex].text}
                    </Typography>
                    <Typography className="quote-author">
                        — {QUOTES_DATA[currentIndex].author}
                    </Typography>
                </Box>
            </Fade>

            {/* Puntitos indicadores */}
            <div className="carousel-dots">
                {QUOTES_DATA.map((_, idx) => (
                    // Solo mostramos 5 puntos para no saturar si hay muchas frases
                    (idx >= currentIndex - 2 && idx <= currentIndex + 2) && (
                        <div 
                            key={idx} 
                            className={`dot ${idx === currentIndex ? 'active' : ''}`}
                            onClick={() => { setVisible(false); setTimeout(() => { setCurrentIndex(idx); setVisible(true); }, 300); }}
                        />
                    )
                ))}
            </div>
        </Box>
    </div>
  );
};

export default QuoteCarousel;