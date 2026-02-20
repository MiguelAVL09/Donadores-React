import { useEffect, useState } from 'react';
import { DB } from '../core/supabase';

export default function MisNotificaciones() {
    const [notificaciones, setNotificaciones] = useState([]);
    const user = JSON.parse(sessionStorage.getItem('currentUser')) || {};

    useEffect(() => {
        if (!user.curp) return;

        const cargarAlertas = async () => {
            let misAlertas = [];

            // 1. Alerta Local: Recuperación
            if (user.ultimaDonacion) {
                const fechaUltima = new Date(user.ultimaDonacion);
                const hoy = new Date();
                const diffTime = Math.abs(hoy - fechaUltima);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const mesesRequeridos = user.genero === 'Mujer' ? 4 : 3;

                // Si pasaron 90 o 120 días
                if (diffDays >= mesesRequeridos * 30 && !user.citaActiva) {
                    misAlertas.push({
                        id: 'local-recovery',
                        titulo: '¡Héroe Recargado! 🔋',
                        mensaje: 'Tu periodo de recuperación ha terminado. Ya puedes volver a donar y salvar vidas.',
                        tipo: 'success',
                        fecha: new Date().toISOString()
                    });
                }
            }

            // 2. Alerta Local: Cita Activa
            if (user.citaActiva) {
                misAlertas.push({
                    id: 'local-cita',
                    titulo: 'Misión en Curso 🚑',
                    mensaje: `Tienes un compromiso pendiente en ${user.citaActiva.hospital} para ${user.citaActiva.paciente}.`,
                    tipo: 'warning',
                    fecha: user.citaActiva.fechaISO || new Date().toISOString()
                });
            }

            // 3. Alertas de BD (Doctores)
            const { data } = await DB.supabase
                .from('notificaciones_medicas')
                .select('*')
                .eq('curpUsuario', user.curp)
                .order('fecha', { ascending: false });

            if (data) {
                const mapeadas = data.map(n => ({
                    id: n.id,
                    titulo: 'Mensaje del Hospital 🏥',
                    mensaje: n.mensaje,
                    tipo: 'info',
                    fecha: n.fecha
                }));
                misAlertas = [...misAlertas, ...mapeadas];
            }

            setNotificaciones(misAlertas);
        };

        cargarAlertas();
    }, []);

    return (
        <div className="container py-4">
            <h2 className="fw-bold mb-4">Mis Notificaciones</h2>
            {notificaciones.length === 0 ? (
                <div className="alert alert-light text-center">No tienes nuevas notificaciones.</div>
            ) : (
                <div className="list-group">
                    {notificaciones.map(noti => (
                        <div key={noti.id} className={`list-group-item list-group-item-action p-4 border-start border-5 border-${noti.tipo === 'success' ? 'success' : noti.tipo === 'warning' ? 'warning' : 'primary'} mb-2 rounded shadow-sm`}>
                            <div className="d-flex w-100 justify-content-between">
                                <h5 className="mb-1 fw-bold">{noti.titulo}</h5>
                                <small className="text-muted">{new Date(noti.fecha).toLocaleDateString()}</small>
                            </div>
                            <p className="mb-1">{noti.mensaje}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}