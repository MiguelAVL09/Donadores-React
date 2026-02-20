import { useNavigate } from 'react-router-dom';
import { DB } from '../core/supabase';

export default function Aviso() {
    const navigate = useNavigate();

    const aceptar = async () => {
        const user = JSON.parse(sessionStorage.getItem('currentUser'));
        await DB.supabase.from('users').update({ aceptoAviso: true }).eq('curp', user.curp);

        const updatedUser = { ...user, aceptoAviso: true };
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
        navigate('/cuestionario');
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
            <div className="card shadow p-5 text-center" style={{ maxWidth: '600px' }}>
                <h1 className="mb-4">📜 Aviso de Privacidad</h1>
                <div className="text-start bg-white border p-3 mb-4 rounded" style={{ height: '200px', overflowY: 'auto' }}>
                    <p>En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares...</p>
                    <p>Sus datos personales (CURP, Nombre, Tipo de Sangre) serán utilizados exclusivamente para la gestión de donaciones.</p>
                    <p>La ubicación solo se usará para mostrar cercanía en el mapa de héroes de forma aproximada.</p>
                </div>
                <button onClick={aceptar} className="btn btn-dark w-100">He leído y Acepto</button>
            </div>
        </div>
    );
}