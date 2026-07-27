/**
 * @license
 * © 2026 Tania Joseline Recendis Díaz. Todos los derechos reservados.
 * Autor: Tania Joseline Recendis Díaz
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

// --- IMPORTACIÓN DE PÁGINAS ---
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import NewEntry from './pages/NewEntry';
import History from './pages/History';
import LumiChat from './pages/LumiChat'; // <--- 1. IMPORTA LUMI AQUÍ
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          {/* Ruta Pública */}
          <Route path="/" element={<LandingPage />} />

          {/* Rutas Privadas */}
          <Route path="/login" element={<Login />} /> {/* <--- AGREGA ESTO */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/new-entry" element={<NewEntry />} />
          <Route path="/history" element={<History />} />
          <Route path="/admin" element={<AdminDashboard />} />

          {/* 2. AGREGA LA RUTA AQUÍ */}
          <Route path="/lumi" element={<LumiChat />} />
          
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;