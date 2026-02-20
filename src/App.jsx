import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importación de Páginas
import Login from './pages/Login';
import Registro from './pages/Registro';
import Aviso from './pages/Aviso';
import Cuestionario from './pages/Cuestionario';
import HistorialDonaciones from './pages/HistorialDonaciones';

// Importación de Componentes del Donador (con Sidebar)
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Perfil from './pages/Perfil';
import Solicitudes from './pages/Solicitudes';
import Notificaciones from './pages/MisNotificaciones';
import ListaSolicitudes from './pages/ListaSolicitudes';
import Mapa from './pages/Mapa';
import Chat from './pages/Chat';

// Dashboards Especiales
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* Rutas Públicas y de Flujo Inicial */}
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/aviso" element={<Aviso />} />
        <Route path="/cuestionario" element={<Cuestionario />} />

        {/* Rutas Privadas del Donador (comparten el Layout/Sidebar) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/solicitudes" element={<Solicitudes />} />
          <Route path="/MisNotificaciones" element={<Notificaciones />} />
          <Route path="/ListaSolicitudes" element={<ListaSolicitudes />} />
          <Route path="/mapa" element={<Mapa />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/historial" element={<HistorialDonaciones />} />
        </Route>

        {/* Dashboards de otros Roles (Tienen su propio Layout interno) */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;