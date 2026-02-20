import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DB } from '../core/supabase';

export default function Login() {
    // Estado para "Recordar usuario"
    const [usuarioRecordado, setUsuarioRecordado] = useState(null);

    // Estados del formulario
    const [curp, setCurp] = useState('');
    const [pass, setPass] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // 1. Al cargar, buscamos en LOCALSTORAGE (Persistencia Real)
    useEffect(() => {
        const savedData = localStorage.getItem('currentUser');
        if (savedData) {
            try {
                const user = JSON.parse(savedData);
                setUsuarioRecordado(user);
                setCurp(user.curp); // Pre-cargamos el CURP
            } catch (e) {
                localStorage.removeItem('currentUser'); // Si falla, limpiamos
            }
        }
    }, []);

    const redirigirPorRol = (user) => {
        if (user.rol === 'admin') navigate('/admin-dashboard');
        else if (user.rol === 'doctor') navigate('/doctor-dashboard');
        else {
            if (!user.aceptoAviso) navigate('/aviso');
            else if (!user.cuestionario) navigate('/cuestionario');
            else navigate('/dashboard');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Verificamos credenciales en BD
            const user = await DB.findUser(curp, pass);

            if (user) {
                // CAMBIO CLAVE: Usamos localStorage
                localStorage.setItem('currentUser', JSON.stringify(user));
                redirigirPorRol(user);
            } else {
                setError('Contraseña incorrecta.');
                setLoading(false);
            }
        } catch (err) {
            setError('Error de conexión.');
            setLoading(false);
        }
    };

    const olvidarCuenta = () => {
        localStorage.removeItem('currentUser');
        setUsuarioRecordado(null);
        setCurp('');
        setPass('');
    };

    return (
        <div id="page-login" className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#fff3f3' }}>
            <div className="card-custom text-center p-5 shadow-sm bg-white rounded" style={{ width: '400px' }}>

                {usuarioRecordado ? (
                    // --- VISTA "FACEBOOK" (Usuario Recordado) ---
                    <div className="fade-in">
                        <div className="mb-4 position-relative d-inline-block">
                            <img
                                src={usuarioRecordado.avatar_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                alt="Avatar"
                                className="rounded-circle shadow border border-3 border-danger"
                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                onError={(e) => e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                            />
                            {/* Botoncito para quitar cuenta */}
                            <button
                                onClick={olvidarCuenta}
                                className="btn btn-sm btn-dark position-absolute top-0 end-0 rounded-circle"
                                title="Olvidar cuenta"
                                style={{ width: '25px', height: '25px', padding: 0 }}
                            >✕</button>
                        </div>

                        <h4 className="fw-bold text-dark mb-1">¡Hola, {usuarioRecordado.nombre?.split(' ')[0]}!</h4>
                        <p className="text-muted small mb-4">Ingresa tu contraseña para continuar</p>

                        <form onSubmit={handleLogin}>
                            <input
                                type="password"
                                className="form-control mb-3 text-center"
                                placeholder="Contraseña"
                                value={pass}
                                onChange={(e) => setPass(e.target.value)}
                                required
                                autoFocus
                            />
                            <button type="submit" className="btn btn-danger w-100 fw-bold" disabled={loading}>
                                {loading ? 'Entrando...' : 'Continuar'}
                            </button>
                            {error && <p className="text-danger fw-bold mt-2 small">{error}</p>}
                        </form>

                        <div className="mt-4">
                            <button onClick={olvidarCuenta} className="btn btn-link text-secondary text-decoration-none small">
                                Iniciar sesión con otra cuenta
                            </button>
                        </div>
                    </div>
                ) : (
                    // --- VISTA CLÁSICA (Login Nuevo) ---
                    <div className="fade-in">
                        <div className="mb-4"><span className="fs-1">🩸</span></div>
                        <h2 className="mb-4 text-danger fw-bold">Iniciar Sesión</h2>
                        <form onSubmit={handleLogin}>
                            <input
                                type="text"
                                className="form-control mb-3"
                                placeholder="CURP"
                                value={curp}
                                onChange={(e) => setCurp(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                className="form-control mb-3"
                                placeholder="Contraseña"
                                value={pass}
                                onChange={(e) => setPass(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn btn-danger w-100 fw-bold" disabled={loading}>
                                {loading ? 'Verificando...' : 'Entrar'}
                            </button>
                            {error && <p className="text-danger fw-bold mt-2 small">{error}</p>}
                        </form>
                        <div className="mt-4">
                            <Link to="/registro" className="fw-bold text-danger text-decoration-none">Crear cuenta nueva</Link>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}