import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DB } from '../core/supabase';

export default function DoctorDashboard() {
    const [pacientes, setPacientes] = useState([]);
    const navigate = useNavigate();

    const cargarPacientes = async () => {
        const users = await DB.getAllUsers();
        // Filtramos usuarios que tienen cita activa hoy
        setPacientes(users.filter(u => u.rol === 'donador' && u.citaActiva));
    };

    useEffect(() => { cargarPacientes(); }, []);

    const confirmarExtraccion = async (paciente) => {
        if (!window.confirm(`¿Confirmar extracción de sangre a ${paciente.nombre}?`)) return;

        try {
            // 1. Obtener datos de la solicitud vinculada a la cita
            const solicitudId = paciente.citaActiva.solicitudId; // (Si guardaste esto en la app)
            // Si en la app no guardaste solicitudId, tendrás que buscar por nombre de hospital o paciente.
            // Asumiremos que el objeto citaActiva trae { solicitudId: ... } como lo pusimos en el último código móvil.

            if (solicitudId) {
                // A. Traer la solicitud actual
                const { data: solicitud } = await DB.supabase.from('solicitudes').select('*').eq('id', solicitudId).single();

                if (solicitud) {
                    const nuevasUnidades = solicitud.unidades_necesarias - 1;
                    const nuevoEstatus = nuevasUnidades <= 0 ? 'completada' : 'activa';

                    // B. Actualizar tabla solicitudes
                    await DB.supabase.from('solicitudes')
                        .update({ unidades_necesarias: nuevasUnidades, estatus: nuevoEstatus })
                        .eq('id', solicitudId);

                    // C. Notificar al dueño si se completó (Lógica espejo de la App)
                    if (nuevoEstatus === 'completada') {
                        const { data: solicitante } = await DB.supabase
                            .from('users')
                            .select('push_token')
                            .eq('curp', solicitud.creado_por_curp)
                            .single();

                        if (solicitante?.push_token) {
                            // Aquí llamarías a tu función de enviarNotificacion si estuvieras en Node/React Native.
                            // En web pura, podrías insertar en una tabla de 'notificaciones_pendientes' si tienes un backend escuchando,
                            // o simplemente dejar que la lógica móvil maneje esto. 
                            console.log("Meta completada. Notificar a: " + solicitud.creado_por_curp);
                        }
                    }
                }
            }

            // 2. Liberar al donador
            const updatedPaciente = {
                ...paciente,
                puntos: (paciente.puntos || 0) + 100, // Gamificación
                cuestionario: false, // Resetear cuestionario
                ultimaDonacion: new Date().toISOString(),
                citaActiva: null // Borrar cita
            };

            await DB.updateUser(updatedPaciente); // Usando tu helper existente
            alert("✅ Donación registrada con éxito.");
            cargarPacientes();

        } catch (e) {
            alert("Error procesando: " + e.message);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('currentUser');
        navigate('/');
    };

    return (
        <div className="d-flex">
            <div className="sidebar bg-primary text-white p-4" style={{ width: '250px', minHeight: '100vh' }}>
                <h3>🏥 Doctores</h3>
                <button onClick={handleLogout} className="btn btn-outline-light w-100 mt-5">Salir</button>
            </div>
            <div className="p-5 w-100">
                <h2>Pacientes con Cita Hoy</h2>
                <table className="table mt-4 shadow-sm">
                    <thead className="table-primary">
                        <tr>
                            <th>Donador</th>
                            <th>Tipo Sangre</th>
                            <th>Paciente Destino</th>
                            <th>Hospital</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pacientes.length === 0 ? <tr><td colSpan="5">No hay citas activas.</td></tr> : pacientes.map(p => (
                            <tr key={p.curp}>
                                <td>{p.nombre}</td>
                                <td><span className="badge bg-danger">{p.sangre}</span></td>
                                <td>{p.citaActiva?.paciente || 'General'}</td>
                                <td>{p.citaActiva?.hospital}</td>
                                <td>
                                    <button className="btn btn-success btn-sm" onClick={() => confirmarExtraccion(p)}>💉 Confirmar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}