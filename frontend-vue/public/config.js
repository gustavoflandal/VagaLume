// Configuração para desenvolvimento local
// Em produção (Docker), este arquivo será sobrescrito pelo docker-entrypoint.sh
window.ENV = window.ENV || {
  VITE_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
};
