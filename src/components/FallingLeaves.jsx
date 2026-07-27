import React from 'react';
import { Leaf } from '@phosphor-icons/react';
import '../styles/FallingLeaves.css';

const FallingLeaves = () => {
  // Creamos un array de 15 hojas
  const leaves = Array.from({ length: 15 });

  return (
    <div className="leaves-container">
      {leaves.map((_, index) => {
        // Generamos valores aleatorios para que cada hoja sea única
        const style = {
          left: `${Math.random() * 100}%`, // Posición horizontal aleatoria
          animationDelay: `${Math.random() * 5}s`, // Retraso aleatorio
          animationDuration: `${10 + Math.random() * 10}s`, // Velocidad aleatoria (entre 10s y 20s)
          opacity: 0.3 + Math.random() * 0.5, // Transparencia variable
          fontSize: `${20 + Math.random() * 20}px`, // Tamaño variable
          color: Math.random() > 0.5 ? '#66BB6A' : '#81C784', // Variación de verdes
        };

        return (
          <div key={index} className="falling-leaf" style={style}>
            <Leaf weight="fill" />
          </div>
        );
      })}
    </div>
  );
};

export default FallingLeaves;<div className=""></div>