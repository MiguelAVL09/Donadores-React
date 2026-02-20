import { useEffect, useState } from 'react';

export default function HistorialDonaciones() {
    const [user, setUser] = useState({});

    useEffect(() => {
        setUser(JSON.parse(sessionStorage.getItem('currentUser')) || {});
    }, []);

    return (
        <div>
            <h2 className="fw-bold text-danger mb-4">Mi Historial</h2>

            {/* SECCIÓN 1: CITA ACTIVA */}
            <h4 className="mb-3">Compromisos Pendientes</h4>
            {user.citaActiva ? (
                <div className="card shadow-sm border-start border-5 border-info mb-5">
                    <div className="card-body p-4">
                        <div className="d-flex align-items-center">
                            <div className="bg-info-subtle text-info p-3 rounded-circle me-3">📅</div>
                            <div>
                                <h5 className="fw-bold text-primary mb-1">Cita Programada</h5>
                                <p className="mb-0"><b>Paciente:</b> {user.citaActiva.paciente}</p>
                                <p className="mb-0"><b>Hospital:</b> {user.citaActiva.hospital}</p>
                                <small className="text-muted">Fecha registro: {new Date(user.citaActiva.fecha).toLocaleDateString()}</small>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="alert alert-light text-center border mb-5">No tienes donaciones pendientes.</div>
            )}

            {/* SECCIÓN 2: HISTORIAL */}
            <h4 className="mb-3">Logros Desbloqueados</h4>
            <div className="list-group">
                {user.ultimaDonacion ? (
                    <div className="list-group-item list-group-item-action p-4 border-start border-5 border-success">
                        <div className="d-flex justify-content-between">
                            <h5 className="mb-1 fw-bold text-success">Donación Exitosa</h5>
                            <small>{new Date(user.ultimaDonacion).toLocaleDateString()}</small>
                        </div>
                        <p className="mb-1">Gracias por salvar vidas.</p>
                        <span className="badge bg-success rounded-pill">Completa</span>
                    </div>
                ) : (
                    <div className="text-center py-5 text-muted bg-light rounded">
                        <h5>Aún no tienes medallas 🏅</h5>
                        <p>Realiza tu primera donación para verla aquí.</p>
                    </div>
                )}
            </div>
        </div>
    );
}