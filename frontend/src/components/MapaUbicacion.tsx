import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

type MapaUbicacionProps = {
  latitud: number | null;
  longitud: number | null;
  onSeleccionar: (
    latitud: number,
    longitud: number,
  ) => void;
};

const iconoMarcador = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MoverMapa({
  posicion,
}: {
  posicion: [number, number];
}) {
  const mapa = useMap();

  useEffect(() => {
    mapa.setView(posicion, 18);
  }, [mapa, posicion]);

  return null;
}

function SelectorMapa({
  onSeleccionar,
}: {
  onSeleccionar: (
    latitud: number,
    longitud: number,
  ) => void;
}) {
  useMapEvents({
    click(evento) {
      onSeleccionar(
        evento.latlng.lat,
        evento.latlng.lng,
      );
    },
  });

  return null;
}

export default function MapaUbicacion({
  latitud,
  longitud,
  onSeleccionar,
}: MapaUbicacionProps) {
  const tieneUbicacion =
    latitud !== null &&
    longitud !== null &&
    Number.isFinite(latitud) &&
    Number.isFinite(longitud);

  const posicionInicial: [number, number] =
    tieneUbicacion
      ? [latitud!, longitud!]
      : [-12.0651, -75.2049];

  const [posicion, setPosicion] =
    useState<[number, number]>(
      posicionInicial,
    );

  const [busqueda, setBusqueda] =
    useState("");

  const [buscando, setBuscando] =
    useState(false);

  const [mensajeMapa, setMensajeMapa] =
    useState("");

  const seleccionarPunto = (
    nuevaLatitud: number,
    nuevaLongitud: number,
  ) => {
    setPosicion([
      nuevaLatitud,
      nuevaLongitud,
    ]);

    setMensajeMapa("");
  };

  const buscarLugar = async () => {
    const texto = busqueda.trim();

    if (!texto) {
      setMensajeMapa(
        "Escribe una dirección o lugar para buscar.",
      );
      return;
    }

    try {
      setBuscando(true);
      setMensajeMapa("");

      const respuesta = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=pe&q=${encodeURIComponent(
          texto,
        )}`,
      );

      if (!respuesta.ok) {
        throw new Error(
          "No se pudo realizar la búsqueda.",
        );
      }

      const resultados = await respuesta.json();

      if (!resultados.length) {
        setMensajeMapa(
          "No se encontró ese lugar. Prueba con una dirección más específica.",
        );
        return;
      }

      const resultado = resultados[0];

      const nuevaLatitud = Number(
        resultado.lat,
      );

      const nuevaLongitud = Number(
        resultado.lon,
      );

      seleccionarPunto(
        nuevaLatitud,
        nuevaLongitud,
      );

      setBusqueda(
        resultado.display_name ?? texto,
      );
    } catch (error) {
      console.error(
        "Error buscando ubicación:",
        error,
      );

      setMensajeMapa(
        "No se pudo buscar la ubicación.",
      );
    } finally {
      setBuscando(false);
    }
  };

  const confirmarUbicacion = () => {
    onSeleccionar(
      Number(posicion[0].toFixed(6)),
      Number(posicion[1].toFixed(6)),
    );
  };

  return (
    <div
      style={{
        width: "100%",
        marginTop: "14px",
        padding: "12px",
        boxSizing: "border-box",
        background: "#f8fafc",
        border: "1px solid #cbd5e1",
        borderRadius: "12px",
      }}
    >
      {/* BUSCADOR */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          width: "100%",
          marginBottom: "10px",
        }}
      >
        <input
          type="text"
          value={busqueda}
          onChange={(e) =>
            setBusqueda(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              buscarLugar();
            }
          }}
          placeholder="🔎 Buscar dirección o lugar..."
          style={{
            flex: 1,
            minWidth: 0,
            padding: "11px 12px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            fontSize: "14px",
            boxSizing: "border-box",
          }}
        />

        <button
          type="button"
          onClick={buscarLugar}
          disabled={buscando}
          style={{
            border: "none",
            background: "#2563eb",
            color: "#ffffff",
            padding: "10px 14px",
            borderRadius: "8px",
            fontWeight: 700,
            cursor: buscando
              ? "not-allowed"
              : "pointer",
            whiteSpace: "nowrap",
            opacity: buscando ? 0.7 : 1,
          }}
        >
          {buscando
            ? "Buscando..."
            : "Buscar"}
        </button>
      </div>

      {mensajeMapa && (
        <div
          style={{
            marginBottom: "10px",
            padding: "9px 10px",
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            borderRadius: "8px",
            color: "#9a3412",
            fontSize: "12px",
            lineHeight: 1.4,
          }}
        >
          ⚠️ {mensajeMapa}
        </div>
      )}

      {/* MAPA */}
      <div
        style={{
          width: "100%",
          height: "420px",
          borderRadius: "10px",
          overflow: "hidden",
          border: "1px solid #cbd5e1",
        }}
      >
        <MapContainer
          center={posicion}
          zoom={18}
          scrollWheelZoom={true}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MoverMapa
            posicion={posicion}
          />

          <SelectorMapa
            onSeleccionar={
              seleccionarPunto
            }
          />

          <Marker
            position={posicion}
            icon={iconoMarcador}
            draggable={true}
            eventHandlers={{
              dragend: (evento) => {
                const marcador =
                  evento.target;

                const coordenadas =
                  marcador.getLatLng();

                seleccionarPunto(
                  coordenadas.lat,
                  coordenadas.lng,
                );
              },
            }}
          />
        </MapContainer>
      </div>

      {/* COORDENADAS */}
      <div
        style={{
          marginTop: "10px",
          padding: "10px",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          fontSize: "12px",
          color: "#334155",
          lineHeight: 1.6,
        }}
      >
        <strong>
          📍 Ubicación seleccionada
        </strong>
        <br />
        Latitud:{" "}
        {posicion[0].toFixed(6)}
        <br />
        Longitud:{" "}
        {posicion[1].toFixed(6)}
      </div>

      {/* CONFIRMAR */}
      <button
        type="button"
        onClick={confirmarUbicacion}
        style={{
          width: "100%",
          marginTop: "10px",
          border: "none",
          background: "#16a34a",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: "8px",
          fontWeight: 700,
          fontSize: "14px",
          cursor: "pointer",
        }}
      >
        ✅ Confirmar ubicación
      </button>

      <div
        style={{
          marginTop: "8px",
          textAlign: "center",
          fontSize: "11px",
          color: "#64748b",
          lineHeight: 1.5,
        }}
      >
        Puedes buscar el lugar, tocar el mapa o
        arrastrar el marcador 📍 hasta la ubicación
        exacta del establecimiento.
      </div>
    </div>
  );
}