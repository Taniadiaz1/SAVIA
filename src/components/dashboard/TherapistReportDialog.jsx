import React, { useState, useRef, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogActions, Button, Box, Typography, 
  Select, MenuItem, FormControl, InputLabel, Grid, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress 
} from '@mui/material';
import { FilePdf, NotePencil, Brain, Drop, Bed, PersonSimpleRun, ForkKnife, BookOpen, FlowerLotus, Users, GameController, GraduationCap, Sparkle, SunDim } from '@phosphor-icons/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// CONFIGURACIÓN (Igual que antes)
const MOOD_TRANSLATIONS = { happy: 'Feliz', calm: 'Calmado', anxious: 'Ansioso', sad: 'Triste', angry: 'Enojado', tired: 'Cansado', neutral: 'Neutro', feliz: 'Feliz', tranquilo: 'Calmado', relajado: 'Calmado', nervioso: 'Ansioso', estresado: 'Ansioso', deprimido: 'Triste', mal: 'Triste', molesto: 'Enojado', furioso: 'Enojado', agotado: 'Cansado', sueño: 'Cansado' };
const HABIT_NAMES = { sleep: 'Dormir', exercise: 'Ejercicio', water: 'Hidratación', eat_healthy: 'Comer Sano', read: 'Lectura', meditation: 'Meditación', social: 'Social', hobbies: 'Hobbies', study: 'Estudio', cleaning: 'Limpieza', nature: 'Naturaleza', dormir: 'Dormir', ejercicio: 'Ejercicio', agua: 'Hidratación', comer: 'Comer Sano', leer: 'Lectura' };
const MOOD_COLORS = { happy: '#4CAF50', calm: '#2196F3', anxious: '#FF9800', sad: '#F44336', angry: '#D32F2F', tired: '#78909C', neutral: '#9E9E9E' };

const getMoodColor = (mood) => {
    if (!mood) return '#999';
    const normalized = mood.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const key = Object.keys(MOOD_COLORS).find(k => normalized.includes(k));
    return key ? MOOD_COLORS[key] : '#9E9E9E';
};
const getTranslatedMood = (mood) => {
    if (!mood) return '-';
    const normalized = mood.toString().toLowerCase();
    const translation = Object.keys(MOOD_TRANSLATIONS).find(k => normalized.includes(k));
    return translation ? MOOD_TRANSLATIONS[translation] : mood;
};
const getHabitLabel = (habitKey) => {
    if (HABIT_NAMES[habitKey]) return HABIT_NAMES[habitKey];
    return habitKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};
const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  const color = getMoodColor(payload.mood);
  return (<svg x={cx - 4} y={cy - 4} width={8} height={8} fill="white"><circle cx="4" cy="4" r="4" fill={color} stroke="white" strokeWidth="1" /></svg>);
};
const SaviaLogo = () => (<Typography variant="h5" fontWeight="900" sx={{ color: '#2196F3', letterSpacing: -1 }}>SAVIA<span style={{ color: '#4CAF50' }}>.AI</span></Typography>);

const TherapistReportDialog = ({ open, onClose, historyData, user }) => {
  const [timeRange, setTimeRange] = useState(30); 
  const reportRef = useRef(null); 
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => { setIsMobile(window.innerWidth < 768); }, []);

  const filteredData = historyData.filter(entry => {
    const entryDate = entry.dateObj;
    const diffTime = Math.abs(new Date() - entryDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= timeRange;
  }).reverse(); 

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    try {
        const element = reportRef.current;
        const scale = isMobile ? 1.5 : 2; 
        const canvas = await html2canvas(element, { scale: scale, useCORS: true, logging: false, backgroundColor: '#ffffff', windowWidth: 1200 }); 
        const imgData = canvas.toDataURL('image/jpeg', 0.85); 
        const pdfWidth = 210; 
        const pageHeight = 297; 
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        const pdf = new jsPDF('p', 'mm', [pdfWidth, imgHeight > pageHeight ? imgHeight : pageHeight]);
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);
        pdf.save(`Reporte_Savia_${user?.displayName || 'Paciente'}.pdf`);
    } catch (error) {
        console.error("PDF Error:", error);
        alert("Error de memoria. Intenta con menos días.");
    } finally { setIsGenerating(false); onClose(); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper">
      <Box sx={{ p: 2, borderBottom: '1px solid #eee', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, justifyContent: 'space-between', alignItems: 'center', bgcolor: '#F8FAFC' }}>
        <Box textAlign={isMobile ? 'center' : 'left'}><Typography variant="h6" fontWeight="bold">Reporte Clínico</Typography><Typography variant="caption" color="text.secondary">Vista Previa ({filteredData.length} entradas)</Typography></Box>
        <FormControl size="small" sx={{ minWidth: 150, width: isMobile ? '100%' : 'auto' }}><InputLabel>Periodo</InputLabel><Select value={timeRange} label="Periodo" onChange={(e) => setTimeRange(e.target.value)}><MenuItem value={7}>Última Semana</MenuItem><MenuItem value={30}>Último Mes</MenuItem><MenuItem value={90}>3 Meses</MenuItem></Select></FormControl>
      </Box>

      <DialogContent sx={{ bgcolor: '#525659', display: 'flex', justifyContent: 'center', p: {xs: 1, md: 4}, overflowY: 'auto' }}>
        <Paper id="report-content" ref={reportRef} elevation={5} sx={{ width: '210mm', minHeight: '297mm', height: 'fit-content', bgcolor: 'white', p: isMobile ? 3 : 6, position: 'relative', overflow: 'visible'}}>
            <Typography sx={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)', fontSize: isMobile ? '50px' : '90px', fontWeight: '900', color: 'rgba(0,0,0,0.03)', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 0 }}>CONFIDENCIAL</Typography>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4} sx={{borderBottom:'2px solid #2196F3', pb:2}}><Box><SaviaLogo /><Typography variant="caption" color="text.secondary" display="block" mt={1}>Asistencia Virtual & IA</Typography></Box><Box textAlign="right"><Typography variant="body1" fontWeight="bold" color="#334155">HISTORIAL</Typography><Typography variant="body2">{new Date().toLocaleDateString()}</Typography></Box></Box>
            <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 2, mb: 4, border: '1px solid #E2E8F0' }}><Grid container spacing={1}><Grid item xs={6}><Typography variant="caption" color="text.secondary" fontWeight="bold">PACIENTE</Typography><Typography variant="body2">{user?.displayName}</Typography></Grid><Grid item xs={6}><Typography variant="caption" color="text.secondary" fontWeight="bold">RANGO</Typography><Typography variant="body2">{timeRange} días</Typography></Grid></Grid></Box>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, color: '#1E293B' }}><Brain size={20} color="#2196F3" weight="fill"/> Tendencia</Typography>
            
            {/* 🔥 CORRECCIÓN AQUÍ: width='100%' y minHeight fijo para evitar warning de recharts */}
            <Box sx={{ height: 250, width: '100%', minWidth: 300, mb: 2, border: '1px solid #EEE', borderRadius: 2, p: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="dateObj" tickFormatter={(d) => `${d.getDate()}/${d.getMonth()+1}`} fontSize={10} />
                        <YAxis domain={[0, 10]} fontSize={10} />
                        <Area type="monotone" dataKey="energyLevel" stroke="#2196F3" fill="#E3F2FD" strokeWidth={2} dot={<CustomDot />} />
                    </AreaChart>
                </ResponsiveContainer>
            </Box>

            <Box display="flex" justifyContent="center" gap={1.5} mb={4} flexWrap="wrap">{Object.keys(MOOD_COLORS).slice(0,5).map(key => (<Typography key={key} variant="caption" sx={{display:'flex', alignItems:'center', gap:0.5}}><span style={{width:8, height:8, borderRadius:'50%', background: MOOD_COLORS[key]}}></span> {MOOD_TRANSLATIONS[key]}</Typography>))}</Box>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, color: '#1E293B' }}><NotePencil size={20} color="#FF9800" weight="fill"/> Bitácora</Typography>
            <TableContainer component={Box} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, mb: 4 }}><Table size="small"><TableHead sx={{ bgcolor: '#F1F5F9' }}><TableRow><TableCell width="12%" sx={{fontWeight:'bold', fontSize:'0.7rem'}}>Fecha</TableCell><TableCell width="8%" align="center" sx={{fontWeight:'bold', fontSize:'0.7rem'}}>E.</TableCell><TableCell width="12%" sx={{fontWeight:'bold', fontSize:'0.7rem'}}>Ánimo</TableCell><TableCell width="20%" sx={{fontWeight:'bold', fontSize:'0.7rem'}}>Hábitos</TableCell><TableCell width="24%" sx={{fontWeight:'bold', fontSize:'0.7rem'}}>Notas</TableCell><TableCell width="24%" sx={{fontWeight:'bold', fontSize:'0.7rem'}}>IA</TableCell></TableRow></TableHead><TableBody>{filteredData.map((row) => (<TableRow key={row.id} sx={{ '&:nth-of-type(odd)': { bgcolor: '#FAFAFA' } }}><TableCell sx={{fontSize:'0.65rem', color:'#334155'}}><b>{row.dateObj.toLocaleDateString()}</b><br/>{row.dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</TableCell><TableCell align="center"><span style={{display: 'inline-block', padding: '1px 5px', borderRadius: '4px', backgroundColor: row.energyLevel <= 4 ? '#FFEBEE' : '#E8F5E9', color: row.energyLevel <= 4 ? '#C62828' : '#2E7D32', fontWeight: 'bold', fontSize: '0.7rem', border: '1px solid #ddd'}}>{row.energyLevel}</span></TableCell><TableCell sx={{ textTransform: 'capitalize', fontSize:'0.65rem', fontWeight:600, color: getMoodColor(row.mood) }}>{getTranslatedMood(row.mood)}</TableCell><TableCell><div style={{ display: 'flex', flexDirection: 'column' }}>{row.habits && row.habits.length > 0 ? row.habits.map((h, i) => (<span key={i} style={{ color: '#455A64', fontSize:'0.6rem' }}>• {getHabitLabel(h)}</span>)) : <span style={{color:'#ccc', fontSize:'0.6rem'}}>-</span>}</div></TableCell><TableCell sx={{ fontSize: '0.65rem', color: '#475569', fontStyle: 'italic', lineHeight: 1.2 }}>{row.note || row.notes || <span style={{opacity:0.3}}>-</span>}</TableCell><TableCell sx={{ fontSize: '0.6rem', color: '#1565C0', bgcolor:'#F8FBFF', p: 0.5, borderLeft:'2px solid #BBDEFB' }}>{row.ai_analysis ? (<span>{row.ai_analysis.bot_suggestion?.slice(0, 80)}...{row.ai_analysis.risk_detected && <b style={{color:'#D32F2F'}}> ⚠ Riesgo</b>}</span>) : <span style={{opacity:0.3}}>-</span>}</TableCell></TableRow>))}</TableBody></Table></TableContainer>
            <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid #E2E8F0', textAlign:'center' }}><Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.6rem' }}>Documento informativo. No sustituye diagnóstico médico. © Savia</Typography></Box>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#F8FAFC', borderTop: '1px solid #eee' }}>
        <Button onClick={onClose} color="inherit">Cerrar</Button>
        <Button onClick={handleDownloadPDF} variant="contained" color="primary" disabled={isGenerating} startIcon={isGenerating ? <CircularProgress size={20} color="inherit"/> : <FilePdf size={20} />}>{isGenerating ? 'Generando...' : 'Descargar'}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TherapistReportDialog;