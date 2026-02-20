import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DB } from '../core/supabase';

export default function AdminDashboard() {
    const [usuarios, setUsuarios] = useState([]);
    const navigate = useNavigate();

    const fetchUsers = async () => {
        const users = await DB.getAllUsers();
        // Ordenar: Admin > Subadmin > Doctor > Donador
        const rolesOrder = { 'admin': 1, 'subadmin': 2, 'doctor': 3, 'donador': 4 };
        users.sort((a, b) => (rolesOrder[a.rol] || 4) - (rolesOrder[b.rol] || 4));
        setUsuarios(users);
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('currentUser');
        navigate('/');
    };

    // CAMBIAR ROL (Admin puede crear Subadmins y Doctores)
    const cambiarRol = async (usuario, nuevoRol) => {
        if (usuario.rol === 'admin') return alert("No puedes modificar al Admin principal.");
        if (window.confirm(`¿Cambiar a ${usuario.nombre} al rol de ${nuevoRol}?`)) {
            const { error } = await DB.supabase.from('users').update({ rol: nuevoRol }).eq('curp', usuario.curp);
            if (!error) {
                alert("✅ Rol actualizado.");
                fetchUsers();
            }
        }
    };

    // ELIMINAR USUARIO (Cualquiera)
    const eliminarUsuario = async (curp) => {
        if (window.confirm("⚠️ ¿ESTÁS SEGURO? Esta acción borrará al usuario permanentemente.")) {
            const { error } = await DB.supabase.from('users').delete().eq('curp', curp);
            if (!error) {
                alert("🗑️ Usuario eliminado.");
                fetchUsers();
            } else {
                alert("Error al eliminar: " + error.message);
            }
        }
    };

    return (
        <div className="d-flex">
            <div className="bg-dark text-white p-4" style={{ width: '250px', minHeight: '100vh' }}>
                <h3 className="text-warning text-center">🛡️ Super Admin</h3>
                <button onClick={handleLogout} className="btn btn-outline-light w-100 mt-5">Cerrar Sesión</button>
            </div>

            <div className="p-5 w-100 bg-light">
                <h2 className="mb-4">Gestión Total de Usuarios</h2>
                <div className="card shadow-sm p-4 bg-white">
                    <table className="table align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>Nombre</th>
                                <th>Rol</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map(u => (
                                <tr key={u.curp}>
                                    <td>{u.nombre}<br /><small className="text-muted">{u.curp}</small></td>
                                    <td><span className={`badge bg-${u.rol === 'admin' ? 'warning' : u.rol === 'subadmin' ? 'info' : u.rol === 'doctor' ? 'primary' : 'secondary'}`}>{u.rol || 'donador'}</span></td>
                                    <td>
                                        {u.rol !== 'admin' && (
                                            <div className="btn-group">
                                                <button className="btn btn-sm btn-outline-info" onClick={() => cambiarRol(u, 'subadmin')}>Hacer Subadmin</button>
                                                <button className="btn btn-sm btn-outline-primary" onClick={() => cambiarRol(u, 'doctor')}>Hacer Doctor</button>
                                                <button className="btn btn-sm btn-outline-secondary" onClick={() => cambiarRol(u, 'donador')}>Degradar</button>
                                                <button className="btn btn-sm btn-danger" onClick={() => eliminarUsuario(u.curp)}>🗑️</button>
                                            </div>
                                        )}
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