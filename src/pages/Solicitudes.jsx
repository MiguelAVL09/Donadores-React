import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DB } from '../core/supabase';

// Datos fijos (Misma lista que en la App)
const HOSPITALES_POR_CIUDAD = {
    "Ciudad Madero": ["Hospital General Regional No. 6 (IMSS)", "Hospital Civil de Madero", "Clínica de Pemex Madero"],
    "Tampico": ["Hospital General Dr. Carlos Canseco", "Hospital Beneficencia Española", "Hospital Cemain", "ISSSTE Tampico"],
    "Altamira": ["Hospital General Dr. Rodolfo Torre Cantú", "Clínica del DIF Altamira"],
    "Ciudad Victoria": ["Hospital General Dr. Norberto Treviño Zapata", "Hospital Infantil", "Hospital Civil"],
    "Reynosa": ["Hospital General de Reynosa", "Hospital Materno Infantil", "IMSS No. 15"]
};

export default function Solicitudes() {
    const [paciente, setPaciente] = useState('');
    const [ciudad, setCiudad] = useState("Ciudad Madero");
    const [hospital, setHospital] = useState(HOSPITALES_POR_CIUDAD["Ciudad Madero"][0]);
    const [tipoSangre, setTipoSangre] = useState('O+');
    const [unidades, setUnidades] = useState('1');
    const [historia, setHistoria] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleCiudadChange = (e) => {
        const nuevaCiudad = e.target.value;
        setCiudad(nuevaCiudad);
        setHospital(HOSPITALES_POR_CIUDAD[nuevaCiudad][0]); // Resetear hospital al primero de la lista
    };

    const handleSolicitar = async (e) => {
        e.preventDefault();
        setLoading(true);

        const user = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!user) return navigate('/');

        const nuevaSolicitud = {
            paciente: paciente,
            hospital: hospital,
            ciudad: ciudad,
            tiposangre: tipoSangre,
            unidades_necesarias: parseInt(unidades),
            historia: historia,
            creado_por_curp: user.curp,
            estatus: 'activa',
            fecha_solicitud: new Date().toISOString()
        };

        const { error } = await DB.supabase.from('solicitudes').insert([nuevaSolicitud]);

        if (error) {
            alert("Error al crear la solicitud: " + error.message);
        } else {
            alert("✅ Solicitud enviada exitosamente. Los donadores serán notificados.");
            navigate('/dashboard');
        }
        setLoading(false);
    };

    return (
        <div className="container py-5">
            <h2 className="mb-4 text-brand fw-bold text-danger">📢 Pedir Ayuda</h2>
            <div className="card shadow-sm p-4 border-0">
                <p className="text-muted mb-4">Ingresa los datos del paciente para notificar a la red de donadores.</p>

                <form onSubmit={handleSolicitar}>
                    <div className="row g-3">
                        {/* Nombre del Paciente */}
                        <div className="col-md-12">
                            <label className="form-label fw-bold">Nombre del Paciente</label>
                            <input type="text" className="form-control" placeholder="Ej. Juan Pérez" value={paciente} onChange={e => setPaciente(e.target.value)} required />
                        </div>

                        {/* Ciudad */}
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Ciudad</label>
                            <select className="form-select" value={ciudad} onChange={handleCiudadChange}>
                                {Object.keys(HOSPITALES_POR_CIUDAD).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* Hospital (Dinámico) */}
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Hospital</label>
                            <select className="form-select" value={hospital} onChange={e => setHospital(e.target.value)}>
                                {HOSPITALES_POR_CIUDAD[ciudad].map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>

                        {/* Tipo de Sangre */}
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Tipo de Sangre</label>
                            <select className="form-select" value={tipoSangre} onChange={e => setTipoSangre(e.target.value)}>
                                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        {/* Unidades */}
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Unidades Requeridas</label>
                            <input type="number" className="form-control" min="1" max="10" value={unidades} onChange={e => setUnidades(e.target.value)} required />
                        </div>

                        {/* Historia */}
                        <div className="col-12">
                            <label className="form-label fw-bold">Breve Historia (Opcional)</label>
                            <textarea className="form-control" rows="2" placeholder="Ej. Cirugía programada..." value={historia} onChange={e => setHistoria(e.target.value)}></textarea>
                        </div>

                        <div className="col-12 mt-4">
                            <button type="submit" className="btn btn-danger w-100 fw-bold py-2" disabled={loading}>
                                {loading ? 'Enviando...' : '📢 PUBLICAR ALERTA'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}