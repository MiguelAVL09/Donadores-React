import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Registro from './pages/Registro';
import Aviso from './pages/Aviso';
import Cuestionario from './pages/Cuestionario';
import HistorialDonaciones from './pages/HistorialDonaciones';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Perfil from './pages/Perfil';
import Solicitudes from './pages/Solicitudes';
import Notificaciones from './pages/MisNotificaciones';
import ListaSolicitudes from './pages/ListaSolicitudes';
import Mapa from './pages/Mapa';
import Chat from './pages/Chat';

import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/aviso" element={<Aviso />} />
        <Route path="/cuestionario" element={<Cuestionario />} />

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

        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;