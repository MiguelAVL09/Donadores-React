import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DB } from '../core/supabase';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // 1. Cargar usuario de LocalStorage
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
            navigate('/');
            return;
        }
        setUser(JSON.parse(storedUser));

        // 2. Cargar estadísticas (Con protección contra fallos)
        const fetchStats = async () => {
            try {
                // Seleccionamos solo la columna sangre para no traer datos pesados
                const { data: users, error } = await DB.supabase
                    .from('users')
                    .select('sangre');

                if (error) throw error;

                // Inicializamos contadores
                const conteo = { "O+": 0, "O-": 0, "A+": 0, "A-": 0, "B+": 0, "B-": 0, "AB+": 0, "AB-": 0 };

                // Protección: Usamos (users || []) para evitar crash si es null
                (users || []).forEach(u => {
                    if (u.sangre && conteo[u.sangre] !== undefined) {
                        conteo[u.sangre]++;
                    }
                });

                setChartData({
                    labels: Object.keys(conteo),
                    datasets: [{
                        data: Object.values(conteo),
                        backgroundColor: ['#b91d47', '#e03e52', '#d13438', '#ea005e', '#ef6950', '#d13438', '#ffb900', '#00cc6a'],
                        borderWidth: 0,
                    }]
                });
            } catch (error) {
                console.error("Error cargando gráfica:", error.message);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchStats();
    }, [navigate]);

    if (!user) return null;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="fw-bold text-danger">Panel de Control</h1>
                <span className="h5 text-muted">Hola, {user.nombre ? user.nombre.split(' ')[0] : 'Héroe'} 👋</span>
            </div>

            {/* ALERTA DE CITA ACTIVA */}
            {user.citaActiva && (
                <div className="alert alert-primary border-0 shadow-sm d-flex align-items-center mb-4 p-4 rounded-4 text-white" style={{ background: 'linear-gradient(45deg, #0d6efd, #0dcaf0)' }}>
                    <span className="fs-1 me-4">🚑</span>
                    <div>
                        <h4 className="fw-bold mb-1">¡Tienes una misión activa!</h4>
                        <p className="mb-0 fs-5">Paciente: <b>{user.citaActiva.paciente || 'Confidencial'}</b></p>
                        <p className="mb-0 fs-5">Lugar: <b>{user.citaActiva.hospital}</b></p>
                    </div>
                </div>
            )}

            <div className="row mb-4">
                {/* Tarjeta Donar */}
                <div className="col-md-4 mb-3">
                    <div className="card h-100 shadow-sm border-0">
                        <div className="card-body text-center p-4">
                            <span className="fs-1">🩸</span>
                            <h3 className="fw-bold mt-2">Donar Sangre</h3>
                            <p className="text-muted">Busca pacientes que necesitan tu tipo de sangre hoy mismo.</p>
                            <Link to="/solicitudes" className="btn btn-danger w-100 fw-bold mt-3">Ver Solicitudes</Link>
                        </div>
                    </div>
                </div>

                {/* Tarjeta Mapa */}
                <div className="col-md-4 mb-3">
                    <div className="card h-100 shadow-sm border-0">
                        <div className="card-body text-center p-4">
                            <span className="fs-1">🗺️</span>
                            <h3 className="fw-bold mt-2">Mapa de Héroes</h3>
                            <p className="text-muted">Localiza la red de ayuda y hospitales cercanos.</p>
                            <Link to="/mapa" className="btn btn-outline-danger w-100 fw-bold mt-3">Abrir Mapa</Link>
                        </div>
                    </div>
                </div>

                {/* Gráfica */}
                <div className="col-md-4 mb-3">
                    <div className="card h-100 shadow-sm border-0 p-3">
                        <h6 className="fw-bold text-center text-secondary">Comunidad de Donadores</h6>
                        <div style={{ height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {loadingStats ? (
                                <div className="spinner-border text-danger" role="status"></div>
                            ) : chartData ? (
                                <Doughnut
                                    data={chartData}
                                    options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                                />
                            ) : (
                                <p className="text-muted">No hay datos disponibles</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}