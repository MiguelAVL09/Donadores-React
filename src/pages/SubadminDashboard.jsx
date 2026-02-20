import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DB } from '../core/supabase';

export default function SubadminDashboard() {
    const [doctores, setDoctores] = useState([]);
    const [nuevoDoc, setNuevoDoc] = useState({ nombre: '', curp: '', password: '' });
    const navigate = useNavigate();

    const fetchDoctores = async () => {
        const { data } = await DB.supabase.from('users').select('*').eq('rol', 'doctor');
        setDoctores(data || []);
    };

    useEffect(() => { fetchDoctores(); }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('currentUser');
        navigate('/');
    };

    const crearDoctor = async (e) => {
        e.preventDefault();
        const { error } = await DB.supabase.from('users').insert([{
            nombre: nuevoDoc.nombre,
            curp: nuevoDoc.curp,
            password: nuevoDoc.password,
            rol: 'doctor',
            sangre: 'N/A'
        }]);

        if (!error) {
            alert("✅ Doctor dado de alta exitosamente.");
            setNuevoDoc({ nombre: '', curp: '', password: '' });
            fetchDoctores();
        } else {
            alert("Error: " + error.message);
        }
    };

    const eliminarDoctor = async (curp) => {
        if (window.confirm("¿Dar de baja a este doctor permanentemente?")) {
            const { error } = await DB.supabase.from('users').delete().eq('curp', curp);
            if (!error) {
                alert("🗑️ Doctor eliminado.");
                fetchDoctores();
            }
        }
    };

    return (
        <div className="d-flex">
            <div className="bg-secondary text-white p-4" style={{ width: '250px', minHeight: '100vh' }}>
                <h3 className="text-white text-center">📋 Subadmin</h3>
                <p className="text-center small">Gestión de Personal Médico</p>
                <button onClick={handleLogout} className="btn btn-outline-light w-100 mt-5">Cerrar Sesión</button>
            </div>

            <div className="p-5 w-100 bg-light">
                <h2 className="mb-4">Gestión de Doctores</h2>

                <div className="card shadow-sm p-4 mb-4">
                    <h5>👨‍⚕️ Dar de Alta Nuevo Doctor</h5>
                    <form onSubmit={crearDoctor} className="row g-3">
                        <div className="col-md-4">
                            <input type="text" className="form-control" placeholder="Nombre Completo" value={nuevoDoc.nombre} onChange={e => setNuevoDoc({ ...nuevoDoc, nombre: e.target.value })} required />
                        </div>
                        <div className="col-md-4">
                            <input type="text" className="form-control" placeholder="CURP (Usuario)" value={nuevoDoc.curp} onChange={e => setNuevoDoc({ ...nuevoDoc, curp: e.target.value })} required />
                        </div>
                        <div className="col-md-3">
                            <input type="password" className="form-control" placeholder="Contraseña" value={nuevoDoc.password} onChange={e => setNuevoDoc({ ...nuevoDoc, password: e.target.value })} required />
                        </div>
                        <div className="col-md-1">
                            <button type="submit" className="btn btn-success w-100">Crear</button>
                        </div>
                    </form>
                </div>

                <div className="card shadow-sm p-4">
                    <table className="table table-hover">
                        <thead className="table-secondary">
                            <tr>
                                <th>Nombre</th>
                                <th>CURP</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctores.length === 0 ? <tr><td colSpan="3">No hay doctores registrados.</td></tr> : doctores.map(doc => (
                                <tr key={doc.curp}>
                                    <td>{doc.nombre}</td>
                                    <td>{doc.curp}</td>
                                    <td>
                                        <button className="btn btn-sm btn-danger" onClick={() => eliminarDoctor(doc.curp)}>Dar de Baja</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}