import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DB } from '../core/supabase';

export default function ListaSolicitudes() {
    const [solicitudes, setSolicitudes] = useState([]);
    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem('currentUser')) || {};

    useEffect(() => {
        const cargar = async () => {
            // USAMOS LA TABLA CORRECTA 'solicitudes'
            const { data } = await DB.supabase
                .from('solicitudes')
                .select('*')
                .eq('estatus', 'activa')
                .gt('unidades_necesarias', 0)
                .neq('creado_por_curp', user.curp) // No mostrar mis propias solicitudes
                .order('created_at', { ascending: false });

            setSolicitudes(data || []);
        };
        cargar();
    }, []);

    const aceptarDonacion = async (req) => {
        if (user.citaActiva) return alert("Ya tienes una cita activa.");

        if (window.confirm(`¿Quieres donar para ${req.paciente} en ${req.hospital}?`)) {
            // En web no tenemos "ChatBot" complejo, hacemos asignación directa o redirigimos a una pantalla de confirmación.
            // Aquí simularemos la asignación directa por simplicidad web:

            // 1. Crear objeto cita
            const nuevaCita = {
                hospital: req.hospital,
                fecha: new Date().toISOString(),
                paciente: req.paciente,
                solicitudId: req.id
            };

            // 2. Actualizar usuario
            const updatedUser = { ...user, citaActiva: nuevaCita };
            await DB.updateUser(updatedUser);
            sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));

            // 3. Descontar unidad en BD
            const nuevasUnidades = req.unidades_necesarias - 1;
            const nuevoEstatus = nuevasUnidades <= 0 ? 'completada' : 'activa';

            await DB.supabase.from('solicitudes')
                .update({ unidades_necesarias: nuevasUnidades, estatus: nuevoEstatus })
                .eq('id', req.id);

            alert("¡Gracias! Cita registrada. Ve a tu panel principal.");
            navigate('/dashboard');
        }
    };

    return (
        <div className="container py-5">
            <h2 className="text-danger fw-bold mb-4">Urgencias Activas</h2>
            <div className="row">
                {solicitudes.length === 0 ? <p>No hay solicitudes compatibles.</p> : solicitudes.map(req => (
                    <div key={req.id} className="col-md-6 mb-3">
                        <div className="card shadow-sm border-danger">
                            <div className="card-body">
                                <div className="d-flex justify-content-between">
                                    <h5 className="card-title text-danger fw-bold">🩸 {req.tiposangre}</h5>
                                    <span className="badge bg-warning text-dark">Faltan: {req.unidades_necesarias}</span>
                                </div>
                                <p className="card-text">
                                    <b>Paciente:</b> {req.paciente}<br />
                                    <b>Hospital:</b> {req.hospital}<br />
                                    <b>Ciudad:</b> {req.ciudad}
                                </p>
                                <button className="btn btn-danger w-100" onClick={() => aceptarDonacion(req)}>Donar Aquí</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}