import { useEffect, useMemo, useState } from "react";
import { FaSearch, FaBuilding, FaMapMarkerAlt, FaPhone } from "react-icons/fa";

interface Empresa {
  id: string;
  name?: string;
  nombre?: string;
  logoUrl?: string;
  ruc?: string;
  phone?: string;
  telefono?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  direccion?: string;
  description?: string;
  descripcion?: string;
  categoria?: string;
  latitud?: number | null;
  longitud?: number | null;

  // Servicio que originó la coincidencia
  servicioCoincidente?: string;
}

interface SucursalPublica {
  id: string;
  nombre: string;
  direccion?: string | null;
  telefono?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  horario?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  companyId: string;
  company?: {
    id: string;
    nombre?: string;
    categoria?: string;
    direccion?: string | null;
    latitud?: number | null;
    longitud?: number | null;
    logoUrl?: string | null;
  };
}
interface SearchProps {
  onSeleccionarEmpresa: (id: string) => void;
  onVolver?: () => void;
}
const API_URL =
  import.meta.env.VITE_API_URL ||
  `http://${window.location.hostname}:3000`;

export default function Search({
  onSeleccionarEmpresa,
  onVolver,
}: SearchProps) {
  const [busqueda, setBusqueda] = useState("");
const [empresas, setEmpresas] = useState<Empresa[]>([]);
const [servicios, setServicios] = useState<any[]>([]);
const [sucursales, setSucursales] = useState<SucursalPublica[]>([]);
 const [, setCargando] = useState(true);
const [error, setError] = useState("");
  const [busquedaReal, setBusquedaReal] = useState("");
const [modoCercania, setModoCercania] = useState(false);
const [ubicacionUsuario, setUbicacionUsuario] = useState<{
  latitud: number;
  longitud: number;
} | null>(null);
const [cargandoCercania, setCargandoCercania] = useState(false);

  useEffect(() => {
  const cargarEmpresas = async () => {
    try {
      setCargando(true);
      setError("");

      const respuesta = await fetch(`${API_URL}/companies`);

      if (!respuesta.ok) {
        throw new Error(
          "No se pudieron cargar las empresas."
        );
      }

      const datos = await respuesta.json();

      setEmpresas(
        Array.isArray(datos) ? datos : []
      );
    } catch (error) {
      console.error(
        "Error al cargar empresas:",
        error
      );

      setError(
        "No se pudieron cargar las empresas."
      );
    } finally {
      setCargando(false);
    }
  };

  cargarEmpresas();
}, []);
useEffect(() => {
  const cargarSucursales = async () => {
    try {
      const respuesta = await fetch(
        `${API_URL}/sucursales/public`,
      );

      if (!respuesta.ok) {
        throw new Error(
          `Error ${respuesta.status} al cargar sucursales`,
        );
      }

      const datos = await respuesta.json();

      setSucursales(
        Array.isArray(datos) ? datos : [],
      );
    } catch (error) {
      console.error(
        "Error al cargar sucursales:",
        error,
      );

      setSucursales([]);
      setError(
  error instanceof Error
    ? error.message
    : "No se pudieron cargar las sucursales."
);
    }
  };

  cargarSucursales();
}, []);
useEffect(() => {
  const temporizador = window.setTimeout(() => {
    setBusquedaReal(busqueda.trim());
  }, 300);

  return () => {
    window.clearTimeout(temporizador);
  };
}, [busqueda]);
useEffect(() => {
  setError("");
  if (!busqueda.trim()) {
    setServicios([]);
    
    return;
  }

  let cancelado = false;

  const cargarServicios = async () => {
    try {
      const respuesta = await fetch(
       `${API_URL}/services/search?q=${encodeURIComponent(
busquedaReal.trim()
)}`
      );

      if (!respuesta.ok) {
        throw new Error(
          `Error ${respuesta.status} al buscar servicios`
        );
      }

      const datos = await respuesta.json();

      if (!cancelado) {
        setServicios(
          Array.isArray(datos) ? datos : []
        );
      }
    } catch (error) {
      console.error(
        "Error al buscar servicios:",
        error
      );

      if (!cancelado) {
        setServicios([]);
        setError(
  error instanceof Error
    ? error.message
    : "No se pudieron buscar los servicios."
);
      }
    }
  };

  cargarServicios();

  return () => {
    cancelado = true;
  };
}, [busquedaReal]);
  const normalizarTexto = (valor: unknown): string => {
    return String(valor ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  };

const empresasEncontradas = useMemo(() => {
  const texto = normalizarTexto(busquedaReal);

  if (!texto) {
    return [];
  }

  const palabras = texto
    .split(/\s+/)
    .filter(Boolean);

  return empresas.filter((empresa) => {
    // Campos principales para búsqueda
const camposBusqueda = [
  empresa.name,
  empresa.nombre,
  empresa.categoria,
  empresa.address,
  empresa.direccion,
  empresa.ruc,
  empresa.phone,
  empresa.telefono,
  empresa.whatsapp,
  empresa.email,
  empresa.description,
  empresa.descripcion,
];

    const textoEmpresa = camposBusqueda
      .map((valor) => normalizarTexto(valor))
      .filter(Boolean)
      .join(" ");

    // Todas las palabras buscadas deben coincidir
    return palabras.every((palabra) =>
      textoEmpresa.includes(palabra)
    );
  });
}, [empresas, busquedaReal]);
const serviciosEncontrados = useMemo(() => {
  if (!busquedaReal) {
    return [];
  }

  return servicios;
}, [servicios, busquedaReal]);


// =====================================================
// CALCULAR DISTANCIA ENTRE DOS COORDENADAS
// =====================================================

const calcularDistanciaKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const radioTierra = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a),
    );

  return radioTierra * c;
};



// =====================================================
// EMPRESAS MOSTRADAS
// =====================================================

const obtenerSucursalMasCercana = (
  empresa: Empresa,
): SucursalPublica | null => {
  if (!modoCercania || !ubicacionUsuario) {
    return null;
  }

  const sucursalesEmpresa = sucursales.filter(
    (sucursal) =>
      sucursal.companyId === empresa.id &&
      sucursal.latitud !== null &&
      sucursal.latitud !== undefined &&
      sucursal.longitud !== null &&
      sucursal.longitud !== undefined,
  );

  if (sucursalesEmpresa.length === 0) {
    return null;
  }

  let sucursalMasCercana = sucursalesEmpresa[0];
  let distanciaMinima = calcularDistanciaKm(
    ubicacionUsuario.latitud,
    ubicacionUsuario.longitud,
    Number(sucursalMasCercana.latitud),
    Number(sucursalMasCercana.longitud),
  );

  sucursalesEmpresa.forEach((sucursal) => {
    const distancia = calcularDistanciaKm(
      ubicacionUsuario.latitud,
      ubicacionUsuario.longitud,
      Number(sucursal.latitud),
      Number(sucursal.longitud),
    );

    if (distancia < distanciaMinima) {
      distanciaMinima = distancia;
      sucursalMasCercana = sucursal;
    }
  });

  return sucursalMasCercana;
};

const obtenerDistanciaEmpresa = (
  empresa: Empresa,
): number | null => {
  if (!modoCercania || !ubicacionUsuario) {
    return null;
  }

  const sucursalesEmpresa = sucursales.filter(
    (sucursal) =>
      sucursal.companyId === empresa.id &&
      sucursal.latitud !== null &&
      sucursal.latitud !== undefined &&
      sucursal.longitud !== null &&
      sucursal.longitud !== undefined,
  );

  if (sucursalesEmpresa.length > 0) {
    const distancias = sucursalesEmpresa.map(
      (sucursal) =>
        calcularDistanciaKm(
          ubicacionUsuario.latitud,
          ubicacionUsuario.longitud,
          Number(sucursal.latitud),
          Number(sucursal.longitud),
        ),
    );

    return Math.min(...distancias);
  }

  if (
    empresa.latitud !== null &&
    empresa.latitud !== undefined &&
    empresa.longitud !== null &&
    empresa.longitud !== undefined
  ) {
    return calcularDistanciaKm(
      ubicacionUsuario.latitud,
      ubicacionUsuario.longitud,
      Number(empresa.latitud),
      Number(empresa.longitud),
    );
  }

  return null;
};

const empresasMostradas = useMemo(() => {
  if (!busquedaReal) {
    return [];
  }

  const mapa = new Map<string, Empresa>();

  // 1. Empresas encontradas directamente
  empresasEncontradas.forEach((empresa) => {
    if (empresa?.id) {
      mapa.set(empresa.id, empresa);
    }
  });

  // 2. Empresas encontradas mediante servicios
  serviciosEncontrados.forEach((servicio: any) => {
    const empresa = servicio?.company;

    if (empresa?.id) {
      const empresaExistente = mapa.get(
        empresa.id,
      );

      const servicioCoincidente =
        servicio?.name ||
        servicio?.nombre ||
        servicio?.title ||
        servicio?.titulo ||
        "";

      if (empresaExistente) {
        mapa.set(empresa.id, {
          ...empresaExistente,
          servicioCoincidente,
        });
      } else {
        mapa.set(empresa.id, {
          ...empresa,
          servicioCoincidente,
        });
      }
    }
  });

  const resultados = Array.from(
    mapa.values(),
  );

  // Si el usuario quiere resultados normales,
  // mantenemos el orden original.
  if (
    !modoCercania ||
    !ubicacionUsuario
  ) {
    return resultados;
  }

  // Si quiere empresas cercanas,
  // calculamos y ordenamos por distancia.
return resultados
  .map((empresa) => {
    const distancia =
      obtenerDistanciaEmpresa(empresa);

    return {
      empresa,
      distancia:
        distancia === null
          ? Infinity
          : distancia,
    };
  })
    .sort(
      (a, b) =>
        a.distancia - b.distancia,
    )
    .map((item) => item.empresa);
}, [
  busquedaReal,
  empresasEncontradas,
  serviciosEncontrados,
  modoCercania,
  ubicacionUsuario,
  sucursales,
]);

// =====================================================
// BUSCAR EMPRESAS MÁS CERCANAS
// =====================================================

const buscarEmpresasCercanas = () => {
  setError("");

  if (!busquedaReal) {
    setError(
      "Primero escribe qué empresa o servicio estás buscando.",
    );
    return;
  }

  if (!navigator.geolocation) {
    setError(
      "Este navegador no permite obtener tu ubicación.",
    );
    return;
  }

  setCargandoCercania(true);

  navigator.geolocation.getCurrentPosition(
    (posicion) => {
      setUbicacionUsuario({
        latitud:
          posicion.coords.latitude,
        longitud:
          posicion.coords.longitude,
      });

      setModoCercania(true);
      setCargandoCercania(false);
    },
    (error) => {
      console.error(
        "Error obteniendo ubicación del usuario:",
        error,
      );

      setCargandoCercania(false);

      if (error.code === 1) {
        setModoCercania(false);
setUbicacionUsuario(null);
        setError(
          "Debes permitir el acceso a tu ubicación para buscar empresas cercanas.",
        );
        return;
      }

      if (error.code === 2) {
        setModoCercania(false);
setUbicacionUsuario(null);
        setError(
          "No se pudo determinar tu ubicación.",
        );
        return;
      }

      if (error.code === 3) {
        setModoCercania(false);
setUbicacionUsuario(null);
        setError(
          "La ubicación tardó demasiado en responder.",
        );
        return;
      }
setModoCercania(false);
setUbicacionUsuario(null);
      setError(
        "No se pudo obtener tu ubicación.",
      );
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    },
  );
};
const mostrarTodasLasEmpresas = () => {
  setModoCercania(false);
  setUbicacionUsuario(null);
  setCargandoCercania(false);
  setError("");
};

const abrirComoLlegar = (empresa: Empresa) => {
  const sucursalMasCercana =
    obtenerSucursalMasCercana(empresa);

  let destino = "";

  if (
    modoCercania &&
    sucursalMasCercana?.latitud !== null &&
    sucursalMasCercana?.latitud !== undefined &&
    sucursalMasCercana?.longitud !== null &&
    sucursalMasCercana?.longitud !== undefined
  ) {
    destino = `${sucursalMasCercana.latitud},${sucursalMasCercana.longitud}`;
  } else if (
    empresa.latitud !== null &&
    empresa.latitud !== undefined &&
    empresa.longitud !== null &&
    empresa.longitud !== undefined
  ) {
    destino = `${empresa.latitud},${empresa.longitud}`;
  } else {
    destino =
      empresa.direccion ||
      empresa.address ||
      "";
  }

  if (!destino) {
    setError(
      "Esta empresa no tiene una ubicación disponible.",
    );
    return;
  }

  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      destino,
    )}`,
    "_blank",
    "noopener,noreferrer",
  );
};

return (
  <div
    style={{
      minHeight: "100vh",
      background: "#f4f7fb",
      padding: "30px 20px 100px",
      boxSizing: "border-box",
      
    }}
  >
    {/* =========================
        CABECERA
    ========================= */}
<div
  style={{
    maxWidth: "700px",
    margin: "0 auto",
    textAlign: "center",
    position: "relative",
  }}
>
      <div
        style={{
          color: "#2563eb",
          fontWeight: 800,
          letterSpacing: "2px",
          fontSize: "14px",
          marginBottom: "15px",
        }}
      >
        BÚSQUEDA ZAPEA
{onVolver && (
  <button
    type="button"
    onClick={onVolver}
    style={{
      position: "absolute",
right: "0",
top: "0",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      background: "#ffffff",
      color: "#2563eb",
      border: "1px solid #dbe3ef",
      borderRadius: "8px",
      padding: "8px 13px",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
      boxShadow: "0 2px 6px rgba(15, 23, 42, 0.06)",
      marginBottom: "22px",
    }}
  >
    ← Volver
  </button>
)}
      </div>

      <h1
        style={{
          margin: 0,
          color: "#0f172a",
          fontSize: "42px",
          lineHeight: 1.05,
        }}
      >
        Busca empresas en ZAPEA
      </h1>

      <p
        style={{
          color: "#64748b",
          fontSize: "18px",
          lineHeight: 1.6,
          margin: "20px 0 30px",
        }}
      >
        Encuentra empresas por nombre, categoría,
        ubicación o palabra clave.
      </p>

      {/* =========================
          BUSCADOR
      ========================= */}
      <div
        style={{
          position: "relative",
          width: "100%",
        }}
      >
        <FaSearch />
<input
  type="text"
  value={busqueda}
  onChange={(e) => setBusqueda(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      setBusquedaReal(e.currentTarget.value.trim());

      e.currentTarget.blur();
    }
  }}
  placeholder="Buscar empresas o servicios..."
  autoComplete="off"
  enterKeyHint="search"
  style={{
            width: "100%",
            height: "58px",
            padding: "0 20px 0 55px",
            fontSize: "18px",
            border: "1px solid #cbd5e1",
            borderRadius: "16px",
            boxSizing: "border-box",
            background: "#ffffff",
            color: "#0f172a",
            outline: "none",
          }}
        />
      </div>

{/* =========================
    FILTROS DE BÚSQUEDA
========================= */}

<div
  style={{
    display: "flex",
    gap: "10px",
    marginTop: "14px",
    flexWrap: "wrap",
  }}
>
  <button
    type="button"
    onClick={buscarEmpresasCercanas}
    disabled={cargandoCercania}
    style={{
      flex: 1,
      minWidth: "180px",
      border: "none",
      background: "#2563eb",
      color: "#ffffff",
      padding: "12px 16px",
      borderRadius: "10px",
      fontWeight: 700,
      cursor: cargandoCercania
        ? "not-allowed"
        : "pointer",
      opacity: cargandoCercania ? 0.7 : 1,
    }}
  >
    {cargandoCercania
      ? "📍 Buscando cercanas..."
      : "📍 Cerca de mí"}
  </button>

  <button
    type="button"
    onClick={mostrarTodasLasEmpresas}
    style={{
      flex: 1,
      minWidth: "180px",
      border: "1px solid #2563eb",
      background: "#ffffff",
      color: "#2563eb",
      padding: "12px 16px",
      borderRadius: "10px",
      fontWeight: 700,
      cursor: "pointer",
    }}
  >
    🏢 Todas las empresas
  </button>
</div>

{error && (
  <div
    style={{
      marginTop: "15px",
      padding: "12px 16px",
      borderRadius: "10px",
      background: "#fef2f2",
      color: "#b91c1c",
      border: "1px solid #fecaca",
      fontSize: "14px",
      textAlign: "center",
    }}
  >
    {error}
  </div>
)}

      {/* =========================
          RESULTADOS
      ========================= */}
      <div
        style={{
          marginTop: "35px",
          background: "#ffffff",
          borderRadius: "24px",
          padding: "30px 20px",
          border: "1px solid #e2e8f0",
          textAlign: "left",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              color: "#2563eb",
              fontWeight: 800,
              letterSpacing: "2px",
              fontSize: "14px",
            }}
          >
            RESULTADOS
          </div>

<h2
  style={{
    margin: "10px 0 0",
    color: "#0f172a",
    fontSize: "28px",
  }}
>
  {empresasMostradas.length === 1
    ? "1 resultado"
    : `${empresasMostradas.length} resultados`}
</h2>
        </div>

        {!busquedaReal.trim() ? (
          <div
            style={{
              textAlign: "center",
              padding: "50px 20px",
              color: "#64748b",
            }}
          >
<div
  style={{
    fontSize: "55px",
    marginBottom: "20px",
    color: "#2563eb",
  }}
>
  <FaSearch />
</div>

            <h3
              style={{
                color: "#0f172a",
                fontSize: "22px",
              }}
            >
              ¿Qué estás buscando?
            </h3>

            <p>
              Escribe el nombre de una empresa,
              categoría, ubicación o palabra clave.
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                color: "#2563eb",
                fontWeight: 800,
                letterSpacing: "2px",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              EMPRESAS ENCONTRADAS
            </div>

  {empresasMostradas.map((empresa, indice) => (
  <div
    key={empresa.id}
    onClick={() => onSeleccionarEmpresa(empresa.id)}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        onSeleccionarEmpresa(empresa.id);
      }
    }}
    style={{
      border: "1px solid #d7e3f2",
      borderLeft: "4px solid #2563eb",
      borderRadius: "18px",
      padding: "20px 20px 20px 22px",
      marginBottom: "15px",
      background: "#f8fbff",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxSizing: "border-box",
      boxShadow:
        "0 3px 10px rgba(37, 99, 235, 0.06)",
    }}
  >
    {modoCercania &&
      indice === 0 &&
      obtenerDistanciaEmpresa(empresa) !== null && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "10px",
            padding: "6px 10px",
            borderRadius: "8px",
            background: "#fef3c7",
            color: "#92400e",
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "0.5px",
          }}
        >
          🏆 MÁS CERCANA A TI
        </div>
      )}

    {/* CABECERA DE LA EMPRESA */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "15px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          minWidth: 0,
        }}
      >
<FaBuilding
  color="#64748b"
  size={17}
/>

        <h3
          style={{
            margin: 0,
            color: "#0f172a",
            fontSize: "20px",
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          {empresa.name ||
            empresa.nombre ||
            "Empresa sin nombre"}
        </h3>
      </div>

      {/* INDICADOR DE APERTURA */}
      <div
        style={{
          width: "34px",
          height: "34px",
          minWidth: "34px",
          borderRadius: "10px",
          background: "#eff6ff",
          color: "#2563eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          fontWeight: 700,
        }}
      >
        →
      </div>
    </div>

{/* CATEGORÍA */}
<p
  style={{
    margin: "14px 0 8px",
    color: "#2563eb",
    fontWeight: 700,
    fontSize: "15px",
  }}
>
  {empresa.categoria || "Sin categoría"}
</p>

{(() => {
  const distancia =
    obtenerDistanciaEmpresa(empresa);

  const sucursalMasCercana =
    obtenerSucursalMasCercana(empresa);

  if (distancia === null) {
    return null;
  }

  const textoDistancia =
    distancia < 1
      ? `${Math.round(distancia * 1000)} m de ti`
      : `${distancia.toFixed(1)} km de ti`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "5px",
        margin: "4px 0 10px",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 10px",
          borderRadius: "8px",
          background: "#eff6ff",
          color: "#2563eb",
          fontSize: "13px",
          fontWeight: 700,
        }}
      >
        📍 {textoDistancia}
      </div>

      {sucursalMasCercana && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 9px",
            borderRadius: "7px",
            background: "#f8fafc",
            color: "#475569",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          🏢 Sucursal: {sucursalMasCercana.nombre}
        </div>
      )}
    </div>
  );
})()}

{modoCercania &&
  obtenerDistanciaEmpresa(empresa) === null && (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        margin: "4px 0 10px",
        padding: "6px 10px",
        borderRadius: "8px",
        background: "#fff7ed",
        color: "#c2410c",
        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      ⚠️ Ubicación no disponible
    </div>
  )}

{/* SERVICIO COINCIDENTE */}
{empresa.servicioCoincidente && (
  <p
    style={{
      margin: "8px 0",
      color: "#0f172a",
      fontSize: "14px",
      fontWeight: 600,
    }}
  >
    Servicio: {empresa.servicioCoincidente}
  </p>
)}

{/* UBICACIÓN */}
<p
  style={{
    margin: "8px 0",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  }}
>
  <FaMapMarkerAlt />
  {(() => {
    const sucursalMasCercana =
      obtenerSucursalMasCercana(empresa);

    if (
      modoCercania &&
      sucursalMasCercana?.direccion
    ) {
      return sucursalMasCercana.direccion;
    }

    return (
      empresa.direccion ||
      empresa.address ||
      "Sin dirección"
    );
  })()}
</p>

{/* TELÉFONO */}
{(() => {
  const sucursalMasCercana =
    obtenerSucursalMasCercana(empresa);

  const telefonoMostrar =
    modoCercania && sucursalMasCercana?.telefono
      ? sucursalMasCercana.telefono
      : empresa.telefono || empresa.phone;

  if (!telefonoMostrar) {
    return null;
  }

  return (
    <p
      style={{
        margin: "8px 0 0",
        color: "#64748b",
        display: "flex",
        alignItems: "center",
        gap: "5px",
      }}
    >
      <FaPhone />
      {telefonoMostrar}
    </p>
  );
})()}

{modoCercania &&
  obtenerDistanciaEmpresa(empresa) !== null && (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        abrirComoLlegar(empresa);
      }}
      style={{
        width: "100%",
        marginTop: "10px",
        padding: "10px 14px",
        borderRadius: "10px",
        border: "none",
        background: "#2563eb",
        color: "#ffffff",
        fontSize: "13px",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      📍 Cómo llegar
    </button>
  )}

    {/* INDICACIÓN DISCRETA */}
    <div
      style={{
        marginTop: "14px",
        paddingTop: "10px",
        borderTop: "1px solid #eef2f7",
        color: "#2563eb",
        fontSize: "13px",
        fontWeight: 600,
      }}
    >
      Ver perfil de empresa →
    </div>
  </div>
))}

            {empresasMostradas.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#64748b",
                }}
              >
<div
  style={{
    fontSize: "50px",
    color: "#2563eb",
    marginBottom: "15px",
  }}
>
  <FaSearch />
</div>

                <h3
                  style={{
                    color: "#0f172a",
                  }}
                >
                  No encontramos resultados
                </h3>

                <p>
                  Prueba con otra palabra o término
                  de búsqueda.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  </div>
);
}