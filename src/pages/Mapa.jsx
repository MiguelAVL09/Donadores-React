import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Importante repetirlo aquí por seguridad
import L from 'leaflet';

// --- CONFIGURACIÓN DE ÍCONOS ---

// Fix para íconos rotos por defecto en Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Ícono Personalizado Hospital
const hospitalIcon = new L.DivIcon({
    className: 'custom-icon',
    html: `<div style="background-color: #ffffff; width: 30px; height: 30px; border-radius: 50%; border: 2px solid #b71c1c; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">🏥</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
});

// Ícono Mi Ubicación
const myLocationIcon = new L.DivIcon({
    className: 'my-location-icon',
    html: `<div style="background-color: #0d6efd; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.4);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

// --- DATOS DE HOSPITALES ---
const HOSPITALES_MEXICO = [
    { id: 101, nombre: "Hospital General Regional No. 6 IMSS", lat: 22.2394, lng: -97.8601, ciudad: "Cd. Madero", estado: "TAM" },
    { id: 102, nombre: "Hospital Civil de Madero", lat: 22.2475, lng: -97.8373, ciudad: "Cd. Madero", estado: "TAM" },
    { id: 103, nombre: "Hospital General Dr. Carlos Canseco", lat: 22.2286, lng: -97.8553, ciudad: "Tampico", estado: "TAM" },
    { id: 104, nombre: "Hospital Beneficencia Española", lat: 22.2350, lng: -97.8650, ciudad: "Tampico", estado: "TAM" },
    { id: 106, nombre: "Hospital Universitario", lat: 25.6887, lng: -100.3496, ciudad: "Monterrey", estado: "NL" },
    { id: 201, nombre: "Centro Médico Nacional Siglo XXI", lat: 19.4067, lng: -99.1567, ciudad: "CDMX", estado: "CDMX" },
    { id: 301, nombre: "Hospital Civil de Guadalajara", lat: 20.6864, lng: -103.3516, ciudad: "Guadalajara", estado: "JAL" },
    { id: 502, nombre: "Hospital General de Cancún", lat: 21.1683, lng: -86.8433, ciudad: "Cancún", estado: "QROO" }
];

// --- COMPONENTES AUXILIARES ---

function LocationButton() {
    const map = useMap();
    const [loading, setLoading] = useState(false);

    const handleLocate = () => {
        setLoading(true);
        if (!navigator.geolocation) {
            alert("Tu navegador no soporta geolocalización");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                map.flyTo([latitude, longitude], 14, { duration: 1.5 });
                setLoading(false);
            },
            (err) => {
                console.error("Error GPS:", err);
                alert("No pudimos obtener tu ubicación. Verifica permisos.");
                setLoading(false);
            },
            { enableHighAccuracy: true }
        );
    };

    return (
        <div className="leaflet-bottom leaflet-right" style={{ marginBottom: '20px', marginRight: '10px', pointerEvents: 'auto', zIndex: 1000 }}>
            <button
                onClick={handleLocate}
                className="btn btn-light shadow border-0 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '50px', height: '50px' }}
                title="Ir a mi ubicación"
            >
                {loading ? <div className="spinner-border text-primary spinner-border-sm"></div> : <span style={{ fontSize: '24px' }}>🎯</span>}
            </button>
        </div>
    );
}

function UserMarker() {
    const [pos, setPos] = useState(null);
    const map = useMap();

    useEffect(() => {
        map.locate().on("locationfound", function (e) {
            setPos(e.latlng);
        });
    }, [map]);

    return pos ? (
        <Marker position={pos} icon={myLocationIcon}>
            <Popup>¡Estás aquí!</Popup>
        </Marker>
    ) : null;
}

// --- COMPONENTE PRINCIPAL ---

export default function Mapa() {
    // Centro de México
    const centroMexico = [23.6345, -102.5528];

    return (
        <div className="d-flex flex-column h-100">
            <h2 className="text-danger fw-bold">Red Nacional de Hospitales</h2>
            <p className="text-muted mb-3">
                Explora los centros de donación. Usa el botón <span className="fs-5">🎯</span> para encontrarte.
            </p>

            {/* IMPORTANTE: El contenedor debe tener altura explícita */}
            <div className="card shadow-sm border-0 p-1 flex-grow-1" style={{ height: '600px', width: '100%', borderRadius: '15px', position: 'relative', overflow: 'hidden' }}>

                <MapContainer center={centroMexico} zoom={5} style={{ height: '100%', width: '100%' }}>

                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <LocationButton />
                    <UserMarker />

                    {HOSPITALES_MEXICO.map(hospital => (
                        <Marker
                            key={hospital.id}
                            position={[hospital.lat, hospital.lng]}
                            icon={hospitalIcon}
                        >
                            <Popup>
                                <div className="text-center">
                                    <h6 className="fw-bold mb-1 text-danger">{hospital.nombre}</h6>
                                    <span className="badge bg-secondary mb-2">{hospital.ciudad}, {hospital.estado}</span>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                </MapContainer>
            </div>
        </div>
    );
}