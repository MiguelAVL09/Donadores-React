import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../core/supabase';

export default function Layout() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [noLeidas, setNoLeidas] = useState(0);
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('currentUser');
        return savedUser ? JSON.parse(savedUser) : {};
    });

    useEffect(() => {
        if (!user.curp) {
            navigate('/');
            return;
        }

        const contarNotificaciones = async () => {
            const { count } = await supabase
                .from('notificaciones_medicas')
                .select('*', { count: 'exact', head: true })
                .eq('curpUsuario', user.curp)
                .eq('leida', false);
            setNoLeidas(count || 0);
        };


        const refrescarPerfil = async () => {
            const { data } = await supabase
                .from('users')
                .select('avatar_url, nombre, puntos, nivel')
                .eq('curp', user.curp)
                .single();
            if (data) {
                const updated = { ...user, ...data };
                if (JSON.stringify(updated) !== JSON.stringify(user)) {
                    setUser(updated);
                    localStorage.setItem('currentUser', JSON.stringify(updated));
                }
            }
        };

        contarNotificaciones();
        refrescarPerfil();

        const suscripcion = supabase.channel('notis-layout')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'notificaciones_medicas', filter: `curpUsuario=eq.${user.curp}` },
                contarNotificaciones
            )
            .subscribe();

        return () => {
            supabase.removeChannel(suscripcion);
        };
    }, [user.curp]);

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/');
    };

    const navLinkClass = ({ isActive }) =>
        `nav-link px-3 text-white ${isActive ? 'fw-bold border-bottom border-2 border-white pb-1' : 'opacity-75'}`;

    if (!user.curp) return null;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            {/* Navbar Principal */}
            <nav className="navbar navbar-expand-lg navbar-dark shadow-sm" style={{ backgroundColor: '#b30000' }}>
                <div className="container">
                    <Link to="/dashboard" className="navbar-brand fw-bold d-flex align-items-center" style={{ textDecoration: 'none' }}>
                        <span className="fs-3 me-2">🩸</span> Red de Donadores
                    </Link>

                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto align-items-center">
                            <li className="nav-item mx-1"><NavLink className={navLinkClass} to="/dashboard">Inicio</NavLink></li>
                            <li className="nav-item mx-1"><NavLink className={navLinkClass} to="/ListaSolicitudes">Solicitudes</NavLink></li>
                            <li className="nav-item mx-1"><NavLink className={navLinkClass} to="/Solicitudes">Pedir Sangre</NavLink></li>
                            <li className="nav-item mx-1"><NavLink className={navLinkClass} to="/mapa">Mapa de Héroes</NavLink></li>
                            <li className="nav-item ms-lg-4 position-relative">
                                <button
                                    onClick={() => setMenuOpen(!menuOpen)}
                                    className="btn btn-light rounded-circle shadow-sm d-flex justify-content-center align-items-center position-relative p-0 overflow-hidden"
                                    style={{ width: '45px', height: '45px', border: '2px solid white' }}
                                >
                                    {user.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt="Avatar"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <span style={{ fontSize: '20px' }}>🧍</span>
                                    )}

                                    {noLeidas > 0 && (
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow" style={{ fontSize: '0.6em', border: '2px solid white', zIndex: 1 }}>
                                            {noLeidas}
                                        </span>
                                    )}
                                </button>

                                {/* Menú Desplegable */}
                                {menuOpen && (
                                    <>
                                        <div
                                            className="position-fixed top-0 start-0 w-100 h-100"
                                            style={{ zIndex: 998 }}
                                            onClick={() => setMenuOpen(false)}
                                        ></div>

                                        <div className="dropdown-menu show position-absolute end-0 mt-2 shadow border-0" style={{ minWidth: '220px', zIndex: 999 }}>
                                            <div className="px-3 py-2 border-bottom bg-light">
                                                <small className="text-muted d-block">Hola,</small>
                                                <span className="fw-bold text-dark">{user.nombre?.split(' ')[0]}</span>
                                            </div>
                                            <Link to="/perfil" className="dropdown-item py-2" onClick={() => setMenuOpen(false)}>👤 Mi Perfil</Link>
                                            <Link to="/MisNotificaciones" className="dropdown-item py-2 d-flex justify-content-between align-items-center" onClick={() => setMenuOpen(false)}>
                                                <span>🔔 Notificaciones</span>
                                                {noLeidas > 0 && <span className="badge bg-danger rounded-pill">{noLeidas}</span>}
                                            </Link>
                                            <Link to="/historial" className="dropdown-item py-2" onClick={() => setMenuOpen(false)}>🕒 Historial Donaciones</Link>
                                            <div className="dropdown-divider"></div>
                                            <button onClick={handleLogout} className="dropdown-item py-2 text-danger fw-bold">🚪 Cerrar Sesión</button>
                                        </div>
                                    </>
                                )}
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <main className="container mt-5 pb-5">
                <Outlet />
            </main>
        </div>
    );
}