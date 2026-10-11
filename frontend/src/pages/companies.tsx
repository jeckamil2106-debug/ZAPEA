import * as React from "react";
import type { FormEvent } from "react";
import Sidebar from "../components/Sidebar";
type Sucursal = {
  id: string;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  horario: string | null;
  latitud: number | null;
  longitud: number | null;
  activo: boolean;
  companyId: string;
};
type ServicioBD = {
  id: string;
  nombre: string;
  descripcion: string | null;
  precioDesde: number | null;
  imagenUrl: string | null;
  destacado: boolean;
  companyId: string;
  images: {
  id: string;
  url: string;
}[];
};

type Empresa = {
  id: string | number;
  name: string;
  ruc: string;
  phone: string;
  whatsapp: string;
  facebook: string;
  email: string;
  address: string;
  latitud: number | null;
  longitud: number | null;
  description: string;
  categoria: string;
  logoUrl: string;
  portadaUrl: string;
};

type FormularioEmpresa = Omit<Empresa, "id">;

const API_URL = import.meta.env.VITE_API_URL;

const CATEGORIAS = [
  "Construcción",
  "Arquitectura",
  "Ingeniería",
  "Servicios técnicos",
  "Comercio",
  "Restaurante",
  "Transporte",
  "Salud",
  "Educación",
  "Servicios profesionales",
  "Otros",
];

const FORMULARIO_INICIAL: FormularioEmpresa = {
  name: "",
  ruc: "",
  phone: "",
  whatsapp: "",
  facebook: "",
  email: "",
  address: "",
  latitud: null,
  longitud: null,
  description: "",
  categoria: "",
  logoUrl: "",
  portadaUrl: "",
};

function normalizarEmpresa(item: any): Empresa {
  return {
    id: item?.id ?? item?.uuid ?? item?.companyId ?? "",
    name: String(item?.nombre ?? item?.name ?? ""),
    ruc: String(item?.ruc ?? ""),
    phone: String(item?.telefono ?? item?.phone ?? ""),
    whatsapp: String(item?.whatsapp ?? item?.WhatsApp ?? ""),
    facebook: String(item.facebook ?? ""),
    email: String(item?.email ?? item?.correo ?? ""),
    address: String(item?.direccion ?? item?.address ?? ""),
latitud:
  item?.latitud !== null &&
  item?.latitud !== undefined
    ? Number(item.latitud)
    : null,
longitud:
  item?.longitud !== null &&
  item?.longitud !== undefined
    ? Number(item.longitud)
    : null,
    description: String(item?.descripcion ?? item?.description ?? ""),
      categoria: String(item?.categoria ?? item?.category ?? ""),
    logoUrl: String(item?.logoUrl ?? item?.logo ?? ""),
    portadaUrl: String(item?.portadaUrl ?? item?.coverUrl ?? item?.portada ?? ""),
  };
}

async function leerError(respuesta: Response, mensaje: string) {
  const texto = await respuesta.text();
  try {
    const json = JSON.parse(texto);
    if (Array.isArray(json?.message)) return json.message.join(", ");
    if (json?.message) return String(json.message);
  } catch {
    // La respuesta no era JSON.
  }
  return texto || mensaje;
}

const styles: Record<string, React.CSSProperties> = {
  pagina: {
    minHeight: "100vh",
    background: "#f3f4f6",
    padding: "28px",
    boxSizing: "border-box",
  },
  contenedor: {
    width: "100%",
    maxWidth: "1450px",
    margin: "0 auto",
  },
header: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  marginBottom: "18px",
  flexWrap: "wrap",
},
  titulo: { margin: 0, fontSize: "30px", color: "#111827" },
  subtitulo: { margin: "5px 0 0", color: "#64748b", fontSize: "14px" },
  nueva: {
    border: 0,
    background: "#2563eb",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: 700,
  },
  nuevaMovil: {
  width: "100%",
  maxWidth: "220px",
  padding: "13px 20px",
  fontSize: "15px",
},
  mobileHeader: {
  width: "100%",
},
  mensaje: {
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #86efac",
    padding: "12px 15px",
    borderRadius: "7px",
    marginBottom: "15px",
  },
  error: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fca5a5",
    padding: "12px 15px",
    borderRadius: "7px",
    marginBottom: "15px",
  },
  formulario: {
    background: "#fff",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 3px 12px rgba(0,0,0,.08)",
  },
  formularioCabecera: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  formularioTitulo: { margin: 0, fontSize: "22px", color: "#111827" },
  cerrar: {
    border: 0,
    background: "#f1f5f9",
    color: "#334155",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "24px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,minmax(0,1fr))",
    gap: "16px",
  },
  campo: { display: "flex", flexDirection: "column", gap: "7px" },
 label: {
  fontSize: "11px",
  fontWeight: 700,
  color: "#60a5fa",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
},
  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    padding: "11px 12px",
    fontSize: "14px",
    outline: "none",
    background: "#fff",
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    padding: "11px 12px",
    fontSize: "14px",
    resize: "vertical",
    outline: "none",
  },
  botonesFormulario: { display: "flex", gap: "10px", marginTop: "20px" },
  guardar: {
    border: 0,
    background: "#16a34a",
    color: "#fff",
    padding: "11px 18px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 700,
  },
  cancelar: {
    border: 0,
    background: "#64748b",
    color: "#fff",
    padding: "11px 18px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 700,
  },
  detalle: {
    background: "#fff",
    borderRadius: "12px",
    padding: "28px",
    marginBottom: "20px",
    boxShadow: "0 3px 12px rgba(0,0,0,.08)",
  },
  detalleHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  perfil: {
    color: "#2563eb",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "1px",
  },
  detalleTitulo: { margin: "5px 0 0", fontSize: "25px", color: "#111827" },
  detalleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,minmax(0,1fr))",
    gap: "22px",
  },
  detalleLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "13px",
    marginBottom: "6px",
  },
  descripcionDetalle: {
    marginTop: "24px",
    paddingTop: "20px",
    borderTop: "1px solid #e5e7eb",
    color: "#475569",
  },
  contactar: { fontSize: "15px", color: "#334155", margin: "22px 0 12px" },
  accionesComerciales: {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
},

llamar: {
  border: 0,
  background: "#2563eb",
  color: "#fff",
  padding: "11px 16px",
  borderRadius: "7px",
  cursor: "pointer",
  fontWeight: 700,
},

whatsapp: {
  border: 0,
  background: "#16a34a",
  color: "#fff",
  padding: "11px 16px",
  borderRadius: "7px",
  cursor: "pointer",
  fontWeight: 700,
},

correo: {
  border: 0,
  background: "#7c3aed",
  color: "#fff",
  padding: "11px 16px",
  borderRadius: "7px",
  cursor: "pointer",
  fontWeight: 700,
},

ubicacion: {
  border: 0,
  background: "#ea580c",
  color: "#fff",
  padding: "11px 16px",
  borderRadius: "7px",
  cursor: "pointer",
  fontWeight: 700,
},

facebook: {
  border: 0,
  background: "#1877f2",
  color: "#fff",
  padding: "11px 16px",
  borderRadius: "7px",
  cursor: "pointer",
  fontWeight: 700,
},
  accionesTabla: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  ver: {
    border: 0,
    background: "#e0f2fe",
    width: "34px",
    height: "34px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  whatsappTabla: {
    border: 0,
    background: "#dcfce7",
    width: "34px",
    height: "34px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  accionesSecundarias: {
    display: "flex", gap: "10px", marginTop: "20px",
    paddingTop: "20px", borderTop: "1px solid #e5e7eb",
  },
  editar: {
    border: 0, background: "#f59e0b", color: "#fff", padding: "10px 16px",
    borderRadius: "6px", cursor: "pointer", fontWeight: 700,
  },
  eliminar: {
    border: 0, background: "#dc2626", color: "#fff", padding: "10px 16px",
    borderRadius: "6px", cursor: "pointer", fontWeight: 700,
  },
  filtros: {
    background: "#fff",
    padding: "16px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,.08)",
    marginBottom: "14px",
    display: "grid",
    gridTemplateColumns: "1fr 230px",
    gap: "10px",
  },
  buscar: {
    width: "100%", boxSizing: "border-box", border: "1px solid #cbd5e1",
    borderRadius: "7px", padding: "11px 13px", fontSize: "14px", outline: "none",
  },
  filtroCategoria: {
    width: "100%", boxSizing: "border-box", border: "1px solid #cbd5e1",
    borderRadius: "7px", padding: "11px 13px", fontSize: "14px",
    background: "#fff",
  },
  contador: {
    textAlign: "center", color: "#64748b", fontSize: "14px", marginBottom: "12px",
  },
  tablaWrap: {
    background: "#fff", borderRadius: "10px", overflowX: "auto",
    boxShadow: "0 2px 8px rgba(0,0,0,.08)",
  },
  tabla: { width: "100%", minWidth: "1200px", borderCollapse: "collapse" },
  th: {
    background: "#1f2937", color: "#fff", padding: "13px 11px",
    textAlign: "left", fontSize: "12px", whiteSpace: "nowrap",
  },
  thEmpresa: {
    background: "#1f2937", color: "#fff", padding: "13px 11px",
    textAlign: "left", fontSize: "12px", minWidth: "230px",
  },
  thAcciones: {
    background: "#1f2937", color: "#fff", padding: "13px 11px",
    textAlign: "left", fontSize: "12px", minWidth: "180px",
  },
  tr: { borderBottom: "1px solid #e5e7eb" },
  td: {
    padding: "14px 11px", color: "#334155", fontSize: "12px", whiteSpace: "nowrap",
  },
  tdEmpresa: {
    padding: "14px 11px", color: "#334155", fontSize: "12px",
    minWidth: "230px", whiteSpace: "normal",
  },
  empresaFila: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoTabla: {
    width: "42px",
    height: "42px",
    borderRadius: "8px",
    objectFit: "cover",
    border: "1px solid #e2e8f0",
    flexShrink: 0,
  },
  logoTablaPlaceholder: {
    width: "42px",
    height: "42px",
    borderRadius: "8px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    flexShrink: 0,
  },
  portada: {
    height: "190px",
    borderRadius: "10px",
    backgroundColor: "#e2e8f0",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "flex-end",
    padding: "18px",
    boxSizing: "border-box",
    marginBottom: "24px",
    border: "1px solid #e2e8f0",
  },
  logoDetalle: {
    width: "92px",
    height: "92px",
    borderRadius: "14px",
    objectFit: "cover",
    background: "#fff",
    border: "4px solid #fff",
    boxShadow: "0 3px 10px rgba(0,0,0,.18)",
  },
  logoPlaceholder: {
    width: "92px",
    height: "92px",
    borderRadius: "14px",
    background: "#fff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
    fontWeight: 800,
    border: "4px solid #fff",
    boxShadow: "0 3px 10px rgba(0,0,0,.18)",
  },
  nombre: { fontWeight: 800, color: "#1e293b", marginBottom: "5px" },
  descripcion: { color: "#64748b", fontSize: "11px", lineHeight: 1.45, maxWidth: "230px" },
  badge: {
    display: "inline-block", background: "#eff6ff", color: "#2563eb",
    padding: "5px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: 700,
  },
  tdAcciones: { padding: "10px", whiteSpace: "nowrap", minWidth: "180px" },
  accionVer: {
    border: 0, background: "#e0f2fe", width: "34px", height: "34px",
    borderRadius: "6px", cursor: "pointer", marginRight: "5px",
  },
  accionEditar: {
    border: 0, background: "#fef3c7", width: "34px", height: "34px",
    borderRadius: "6px", cursor: "pointer", marginRight: "5px",
  },
  accionWhatsApp: {
    border: 0, background: "#dcfce7", width: "34px", height: "34px",
    borderRadius: "6px", cursor: "pointer", marginRight: "5px",
  },
  accionEliminar: {
    border: 0, background: "#fee2e2", width: "34px", height: "34px",
    borderRadius: "6px", cursor: "pointer",
  },
  vacio: {
    background: "#fff", padding: "50px", textAlign: "center",
    color: "#64748b", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,.08)",
  },
};

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={styles.campo}>
      <label style={styles.label}>
        {label}
      </label>
      {children}
    </div>
  );
}

interface CompaniesProps {
  onNavigate?: (page: string) => void;
}

export default function Companies({
  onNavigate,
}: CompaniesProps) {
  const [empresas, setEmpresas] = React.useState<Empresa[]>([]);
  const [busqueda, setBusqueda] = React.useState("");
  const [filtroCategoria, setFiltroCategoria] = React.useState("");
  React.useEffect(() => {
  console.log("ZAPEA - ESTADO EMPRESAS:", empresas.length, empresas);
}, [empresas]);
  const [mostrarFormulario, setMostrarFormulario] = React.useState(false);
  const [mostrarEdicion, setMostrarEdicion] = React.useState(false);
  const [mostrarDetalle, setMostrarDetalle] = React.useState(false);
  const [empresaSeleccionada, setEmpresaSeleccionada] =
    React.useState<Empresa | null>(null);
    const [estadisticasEmpresa, setEstadisticasEmpresa] =
  React.useState<any>(null);

const [mostrarEstadisticas, setMostrarEstadisticas] =
  React.useState(false);
 const [formulario, setFormulario] =
  React.useState<FormularioEmpresa>(FORMULARIO_INICIAL);
  const [serviciosBD, setServiciosBD] =
  React.useState<ServicioBD[]>([]);
const [sucursales, setSucursales] =
  React.useState<Sucursal[]>([]);

const [cargandoSucursales, setCargandoSucursales] =
  React.useState(false);

const [sucursalEditando, setSucursalEditando] =
  React.useState<Sucursal | null>(null);
  const [mostrarFormularioSucursal, setMostrarFormularioSucursal] =
  React.useState(false);

const [formularioSucursal, setFormularioSucursal] =
  React.useState({
    nombre: "",
    direccion: "",
    telefono: "",
    whatsapp: "",
    email: "",
    horario: "",
    latitud: "",
    longitud: "",
       activo: true,
  });

const [cargandoServicios, setCargandoServicios] =
  React.useState(false);

const [mostrarFormularioServicio, setMostrarFormularioServicio] =
  React.useState(false);

const [servicioEditando, setServicioEditando] =
  React.useState<ServicioBD | null>(null);

const [formularioServicio, setFormularioServicio] =
  React.useState({
    nombre: "",
    descripcion: "",
    precioDesde: "",
    imagenUrl: "",
    destacado: true,
  });
  const [cargando, setCargando] = React.useState(true);
const usuarioActual = React.useMemo(() => {
  try {
    return JSON.parse(
      localStorage.getItem("zapea_user") || "null"
    );
  } catch {
    return null;
  }
}, []);
  const obtenerToken = () => {
  const token = localStorage.getItem("zapea_token");

  if (!token) {
    throw new Error("No se encontró el token de acceso.");
  }

  return token;
};
  const [guardando, setGuardando] = React.useState(false);
  const [mensaje, setMensaje] = React.useState("");
  const [error, setError] = React.useState("");
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
const [portadaFile, setPortadaFile] = React.useState<File | null>(null);
const [galleryFiles, setGalleryFiles] = React.useState<File[]>([]);
const [imagenServicioArchivo, setImagenServicioArchivo] =
  React.useState<File | null>(null);

const [imagenServicioPreview, setImagenServicioPreview] =
  React.useState<string | null>(null);
  const [imagenesServicioGaleria, setImagenesServicioGaleria] =
  React.useState<File[]>([]);
  const [imagenesServicioReemplazo, setImagenesServicioReemplazo] =
  React.useState<Record<string, File>>({});

React.useEffect(() => {
  if (!imagenServicioArchivo) {
    setImagenServicioPreview(null);
    return;
  }

  const lector = new FileReader();

  lector.onload = () => {
    if (typeof lector.result === "string") {
      setImagenServicioPreview(lector.result);
    }
  };

  lector.readAsDataURL(imagenServicioArchivo);

  return () => {
    lector.onload = null;
  };
}, [imagenServicioArchivo]);

const [galleryImages, setGalleryImages] =
  React.useState<any[]>([]);
  const cargarEmpresas = React.useCallback(async () => {
    try {
      setCargando(true);
      setError("");

      const token = localStorage.getItem("zapea_token");

if (!token) {
  throw new Error("No se encontró el token de acceso.");
}

const respuesta = await fetch(`${API_URL}/companies`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
      if (!respuesta.ok) {
        throw new Error(
          await leerError(respuesta, `Error ${respuesta.status} al cargar empresas.`)
        );
      }

      const data = await respuesta.json();
      console.log(
  "ZAPEA - DATA COMPLETA COMPANIES:",
  JSON.stringify(data, null, 2)
);
const lista = Array.isArray(data)
  ? data
  : Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.companies)
      ? data.companies
      : Array.isArray(data?.empresas)
        ? data.empresas
        : [];

console.log("ZAPEA - EMPRESAS RECIBIDAS:", lista);

const empresasNormalizadas = lista.map(normalizarEmpresa);

const empresasVisibles =
  usuarioActual?.role === "EMPRESA"
    ? empresasNormalizadas.filter(
        (empresa: Empresa) =>
          String(empresa.id) ===
          String(usuarioActual.companyId)
      )
    : empresasNormalizadas;

console.log(
  "ZAPEA - EMPRESAS VISIBLES:",
  empresasVisibles
);

setEmpresas(empresasVisibles);
    } catch (err) {
      console.error(err);
      setEmpresas([]);
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las empresas."
      );
    } finally {
      setCargando(false);
    }
}, [usuarioActual]);
    // =====================================================
  // SERVICIOS - CARGAR SERVICIOS DE UNA EMPRESA
  // =====================================================

  const cargarServiciosEmpresa = async (
    companyId: string | number,
  ) => {
    try {
      setCargandoServicios(true);

      const respuesta = await fetch(
        `${API_URL}/services/company/${companyId}`,
      );

      if (!respuesta.ok) {
        throw new Error(
          "No se pudieron cargar los servicios.",
        );
      }

      const data = await respuesta.json();

      setServiciosBD(
        Array.isArray(data) ? data : [],
      );
    } catch (error) {
      console.error(
        "Error cargando servicios:",
        error,
      );

      setServiciosBD([]);
      setError(
  error instanceof Error
    ? error.message
    : "No se pudieron cargar los servicios."
);
    } finally {
      setCargandoServicios(false);
    }
  };
// =====================================================
// SUCURSALES - CARGAR SUCURSALES DE UNA EMPRESA
// =====================================================

const cargarSucursalesEmpresa = async (
  companyId: string | number,
) => {

  try {
    setCargandoSucursales(true);

    const token =
      localStorage.getItem("zapea_token");

    const respuesta = await fetch(
      `${API_URL}/companies/${companyId}/sucursales`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!respuesta.ok) {
      throw new Error(
        "No se pudieron cargar las sucursales.",
      );
    }

    const data = await respuesta.json();

    setSucursales(
      Array.isArray(data) ? data : [],
    );
  } catch (error) {
    console.error(
      "Error cargando sucursales:",
      error,
    );

    setSucursales([]);
    setError(
  error instanceof Error
    ? error.message
    : "No se pudieron cargar las sucursales."
);
  } finally {
    setCargandoSucursales(false);
  }
};


// =====================================================
// SUCURSALES - CREAR / EDITAR / CANCELAR
// =====================================================

const crearSucursal = () => {
  if (!empresaSeleccionada?.id) {
    setError("Primero selecciona una empresa.");
    return;
  }

  setSucursalEditando(null);

  setFormularioSucursal({
    nombre: "",
    direccion: "",
    telefono: "",
    whatsapp: "",
    email: "",
    horario: "",
    latitud: "",
    longitud: "",
    activo: true,
  });

  setMostrarFormularioSucursal(true);
  setError("");
  setMensaje("");
};

// =====================================================
// SUCURSALES - EDITAR
// =====================================================

const editarSucursal = (sucursal: Sucursal) => {
  setSucursalEditando(sucursal);

  setFormularioSucursal({
    nombre: sucursal.nombre ?? "",
    direccion: sucursal.direccion ?? "",
    telefono: sucursal.telefono ?? "",
    whatsapp: sucursal.whatsapp ?? "",
    email: sucursal.email ?? "",
    horario: sucursal.horario ?? "",
    latitud:
      sucursal.latitud !== null &&
      sucursal.latitud !== undefined
        ? String(sucursal.latitud)
        : "",
    longitud:
      sucursal.longitud !== null &&
      sucursal.longitud !== undefined
        ? String(sucursal.longitud)
        : "",
    activo: sucursal.activo,
  });

  setMostrarFormularioSucursal(true);
  setError("");
  setMensaje("");
};

// =====================================================
// SUCURSALES - CANCELAR
// =====================================================

const cancelarFormularioSucursal = () => {
  setMostrarFormularioSucursal(false);
  setSucursalEditando(null);

  setFormularioSucursal({
    nombre: "",
    direccion: "",
    telefono: "",
    whatsapp: "",
    email: "",
    horario: "",
    latitud: "",
    longitud: "",
    activo: true,
  });

  setError("");
  setMensaje("");
};

const obtenerUbicacionActual = () => {
  setError("");
  setMensaje("");

  if (!navigator.geolocation) {
    setError(
      "Este navegador no permite obtener la ubicación."
    );
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (posicion) => {
      const { latitude, longitude } =
        posicion.coords;

      setFormularioSucursal((actual) => ({
        ...actual,
        latitud: latitude.toFixed(6),
        longitud: longitude.toFixed(6),
      }));

      setMensaje(
        "Ubicación obtenida correctamente."
      );
    },
    (error) => {
      console.error(
        "Error obteniendo ubicación:",
        error
      );

      let mensajeUbicacion =
        "No se pudo obtener la ubicación.";

      if (error.code === 1) {
        mensajeUbicacion =
          "Debes permitir el acceso a tu ubicación.";
      }

      if (error.code === 2) {
        mensajeUbicacion =
          "No se pudo determinar tu ubicación.";
      }

      if (error.code === 3) {
        mensajeUbicacion =
          "La ubicación tardó demasiado en responder.";
      }

      setError(mensajeUbicacion);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    }
  );
};

// =====================================================
// SUCURSALES - GUARDAR
// =====================================================

const guardarSucursal = async () => {
  if (!empresaSeleccionada?.id) {
    setError("Primero selecciona una empresa.");
    return;
  }

  if (!formularioSucursal.nombre.trim()) {
    setError("El nombre de la sucursal es obligatorio.");
    return;
  }

  try {
    setGuardando(true);
    setError("");
    setMensaje("");

    const datos = {
      nombre: formularioSucursal.nombre.trim(),

      direccion:
        formularioSucursal.direccion.trim() || undefined,

      telefono:
        formularioSucursal.telefono.trim() || undefined,

      whatsapp:
        formularioSucursal.whatsapp.trim() || undefined,

      email:
        formularioSucursal.email.trim() || undefined,

      horario:
        formularioSucursal.horario.trim() || undefined,

      latitud:
        formularioSucursal.latitud.trim() !== ""
          ? Number(formularioSucursal.latitud)
          : undefined,

      longitud:
        formularioSucursal.longitud.trim() !== ""
          ? Number(formularioSucursal.longitud)
          : undefined,

      ...(sucursalEditando
        ? {
            activo: formularioSucursal.activo,
          }
        : {}),
    };

    if (
      datos.latitud !== undefined &&
      Number.isNaN(datos.latitud)
    ) {
      setError("La latitud debe ser un número válido.");
      return;
    }

    if (
      datos.longitud !== undefined &&
      Number.isNaN(datos.longitud)
    ) {
      setError("La longitud debe ser un número válido.");
      return;
    }

    const token = obtenerToken();

    if (!token) {
      setError("No se encontró el token de acceso.");
      return;
    }

    const esEdicion = Boolean(sucursalEditando);

    const url = esEdicion
      ? `${API_URL}/sucursales/${sucursalEditando!.id}`
      : `${API_URL}/companies/${empresaSeleccionada.id}/sucursales`;

    const respuesta = await fetch(url, {
      method: esEdicion ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datos),
    });

    if (!respuesta.ok) {
      throw new Error(
        await leerError(
          respuesta,
          `Error ${respuesta.status} al guardar la sucursal.`,
        ),
      );
    }

    setMensaje(
      esEdicion
        ? "Sucursal actualizada correctamente."
        : "Sucursal creada correctamente.",
    );

    setMostrarFormularioSucursal(false);
    setSucursalEditando(null);

    setFormularioSucursal({
      nombre: "",
      direccion: "",
      telefono: "",
      whatsapp: "",
      email: "",
      horario: "",
      latitud: "",
      longitud: "",
      activo: true,
    });

    await cargarSucursalesEmpresa(
      empresaSeleccionada.id,
    );
  } catch (error) {
    console.error(
      "Error guardando sucursal:",
      error,
    );

    setError(
      error instanceof Error
        ? error.message
        : "No se pudo guardar la sucursal.",
    );
  } finally {
    setGuardando(false);
  }
};
  React.useEffect(() => {
    void cargarEmpresas();
  }, [cargarEmpresas]);

const empresasFiltradas = React.useMemo(() => {
const normalizarTexto = (valor: unknown): string => {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .trim();
};

  const texto = normalizarTexto(busqueda);
  const categoriaSeleccionada = normalizarTexto(filtroCategoria);

  console.log("========== ZAPEA FILTRO ==========");
  console.log("BÚSQUEDA ORIGINAL:", busqueda);
  console.log("BÚSQUEDA NORMALIZADA:", texto);
  console.log("CATEGORÍA:", categoriaSeleccionada);
  console.log(
    "EMPRESAS EN ESTADO:",
    empresas.length
  );
  console.log(
    "NOMBRES:",
    empresas.map((empresa) => empresa.name)
  );

  const resultado = empresas.filter((empresa) => {
    const categoriaEmpresa = normalizarTexto(
      empresa.categoria
    );

    const coincideCategoria =
      !categoriaSeleccionada ||
      categoriaSeleccionada ===
        normalizarTexto("Todas las categorías") ||
      categoriaEmpresa === categoriaSeleccionada;

    if (!coincideCategoria) {
      return false;
    }

    if (!texto) {
      return true;
    }

    const camposBuscados = [
      empresa.name,
      empresa.ruc,
      empresa.phone,
      empresa.whatsapp,
      empresa.email,
      empresa.address,
      empresa.description,
      empresa.categoria,
    ];

    const coincideBusqueda = camposBuscados.some(
      (valor) =>
        normalizarTexto(valor).includes(texto)
    );

    if (
      normalizarTexto(empresa.name) ===
      "prueba editado"
    ) {
      console.log(
        "🔴 EMPRESA OBJETIVO ENCONTRADA:",
        {
          name: empresa.name,
          normalizado: normalizarTexto(
            empresa.name
          ),
          busqueda: texto,
          coincideBusqueda,
          camposBuscados,
        }
      );
    }

    return coincideBusqueda;
  });

  console.log(
    "RESULTADO FILTRADO:",
    resultado.length,
    resultado.map((empresa) => empresa.name)
  );

  console.log(
    "=================================="
  );

  return resultado;
}, [empresas, busqueda, filtroCategoria]);

const limpiarVista = () => {
  setMostrarFormulario(false);
  setMostrarEdicion(false);
  setMostrarDetalle(false);
  setMostrarFormularioSucursal(false);
setSucursalEditando(null);
setFormularioSucursal({
  nombre: "",
  direccion: "",
  telefono: "",
  whatsapp: "",
  email: "",
  horario: "",
  latitud: "",
  longitud: "",
  activo: true,
});

  setEmpresaSeleccionada(null);

  setFormulario(FORMULARIO_INICIAL);

  // Limpiar archivos seleccionados
  setLogoFile(null);
  setPortadaFile(null);
  setGalleryFiles([]);
  setGalleryImages([]);
  };

  const abrirNuevaEmpresa = () => {
    limpiarVista();
    setMensaje("");
    setError("");
    setMostrarFormulario(true);
  };

  const cambiarCampo = (campo: keyof FormularioEmpresa, valor: string) => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  };

const guardarEmpresa = async (evento: FormEvent) => {
  evento.preventDefault();

  setMensaje("");
  setError("");

  if (!formulario.name.trim()) {
    setError("El nombre de la empresa es obligatorio.");
    return;
  }

  try {
    setGuardando(true);

    // =====================================================
    // 1. DATOS DE LA EMPRESA
    // =====================================================
    const datos = {
      nombre: formulario.name.trim(),
      ruc: formulario.ruc.trim() || undefined,
      telefono: formulario.phone.trim() || undefined,
      whatsapp: formulario.whatsapp.trim() || undefined,
      facebook: formulario.facebook.trim() || undefined,
email: formulario.email.trim() || undefined,
direccion: formulario.address.trim() || undefined,
latitud: formulario.latitud ?? undefined,
longitud: formulario.longitud ?? undefined,
descripcion: formulario.description.trim() || undefined,
      categoria: formulario.categoria.trim() || undefined,

      // Dejamos estos campos como están actualmente.
      // Las imágenes se subirán después mediante FormData.
      logoUrl: formulario.logoUrl.trim() || undefined,
      portadaUrl: formulario.portadaUrl.trim() || undefined,
    };

    // =====================================================
    // 2. CREAR LA EMPRESA
    // =====================================================
   const token = localStorage.getItem("zapea_token");

if (!token) {
  throw new Error("No se encontró el token de acceso.");
}

const respuesta = await fetch(`${API_URL}/companies`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${obtenerToken()}`,
  },
  body: JSON.stringify(datos),
});

    if (!respuesta.ok) {
      throw new Error(
        await leerError(
          respuesta,
          `Error ${respuesta.status} al registrar la empresa`,
        ),
      );
    }

    const empresaCreada = await respuesta.json();

    // =====================================================
    // 3. SUBIR LOGO Y PORTADA
    // =====================================================
    if (logoFile || portadaFile) {
      const formData = new FormData();

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      if (portadaFile) {
        formData.append("portada", portadaFile);
      }

 const token = localStorage.getItem("zapea_token");

if (!token) {
  throw new Error("No se encontró el token de acceso.");
}

const respuestaImagenes = await fetch(
  `${API_URL}/companies/${empresaCreada.id}/images`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
    body: formData,
  },
);

      if (!respuestaImagenes.ok) {
        throw new Error(
          await leerError(
            respuestaImagenes,
            `La empresa fue creada, pero ocurrió un error al subir las imágenes (${respuestaImagenes.status})`,
          ),
        );
      }
    }
    // ==========================================================
// 3.1 SUBIR GALERÍA
// ==========================================================

// =====================================================
// 3. AGREGAR NUEVAS IMÁGENES A LA GALERÍA
// =====================================================

if (galleryFiles.length > 0) {
  const galleryFormData = new FormData();

  galleryFiles.forEach((file) => {
    galleryFormData.append("files", file);
  });

const token = localStorage.getItem("zapea_token");

if (!token) {
  throw new Error("No se encontró el token de acceso.");
}


const respuestaGaleria = await fetch(
  `${API_URL}/companies/${empresaCreada.id}/gallery`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
    body: galleryFormData,
  }
);

  if (!respuestaGaleria.ok) {
    throw new Error(
      await leerError(
        respuestaGaleria,
        "La empresa se actualizó, pero ocurrió un error al subir la galería."
      )
    );
  }
}

    // =====================================================
    // 4. ACTUALIZAR LA INTERFAZ
    // =====================================================
    limpiarVista();

    setMensaje("Empresa registrada correctamente.");

    await cargarEmpresas();

  } catch (err) {
    console.error(err);

    setError(
      err instanceof Error
        ? err.message
        : "No se pudo registrar la empresa.",
    );

  } finally {
    setGuardando(false);
  }
};

const abrirPerfilPublico = (empresa: Empresa) => {
  window.location.href = `/empresa/${empresa.id}`;
};

// =====================================================
// ACCIONES DE CONTACTO
// =====================================================
const registrarAnalitica = async (
  tipo: string,
  empresaId: string | number,
  sucursalId?: string,
) => {
  try {
    const token =
      localStorage.getItem("zapea_token");

    if (!token) {
      return;
    }

    await fetch(`${API_URL}/analytics/event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: tipo,
        companyId: String(empresaId),
        ...(sucursalId
          ? { sucursalId }
          : {}),
      }),
    });
  } catch (error) {
    console.error(
      "Error registrando analítica:",
      error,
    );
  }
};

const llamarEmpresa = (empresa: Empresa) => {
  if (!empresa.phone) {
    setError("La empresa no tiene un número de teléfono registrado.");
    return;
  }

  const telefono = empresa.phone.replace(/\D/g, "");

  registrarAnalitica("PHONE_CLICK", empresa.id);

  window.location.href = `tel:${telefono}`;
};

const abrirWhatsApp = (empresa: Empresa) => {
  if (!empresa.whatsapp) {
    setError("La empresa no tiene un número de WhatsApp registrado.");
    return;
  }

  let numero = empresa.whatsapp.replace(/\D/g, "");

  // Si es un número peruano de 9 dígitos, agregamos +51
  if (numero.length === 9 && numero.startsWith("9")) {
    numero = `51${numero}`;
  }
registrarAnalitica("WHATSAPP_CLICK", empresa.id);
  window.open(
    `https://wa.me/${numero}`,
    "_blank",
    "noopener,noreferrer"
  );
};

// =====================================================
// ELIMINAR EMPRESA
// =====================================================

const eliminarEmpresa = async (empresa: Empresa) => {
  if (!empresa.id) {
    setError("No se encontró el ID de la empresa.");
    return;
  }

  const confirmar = window.confirm(
    `¿Está seguro de eliminar la empresa "${empresa.name}"?`
  );

  if (!confirmar) {
    return;
  }

  try {
    setMensaje("");
    setError("");
    setGuardando(true);

const token = localStorage.getItem("zapea_token");

if (!token) {
  throw new Error("No se encontró el token de acceso.");
}

const respuesta = await fetch(
  `${API_URL}/companies/${empresa.id}`,
  {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  }
);

    if (!respuesta.ok) {
      throw new Error(
        await leerError(
          respuesta,
          "No se pudo eliminar la empresa."
        )
      );
    }

    setMensaje("Empresa eliminada correctamente.");

    // Si la empresa eliminada era la que se estaba mostrando,
    // cerramos el detalle.
    if (empresaSeleccionada?.id === empresa.id) {
      setEmpresaSeleccionada(null);
      setMostrarDetalle(false);
    }

    await cargarEmpresas();
  } catch (err) {
    console.error("Error eliminando empresa:", err);

    setError(
      err instanceof Error
        ? err.message
        : "No se pudo eliminar la empresa."
    );
  } finally {
    setGuardando(false);
  }
};
  const editarEmpresa = async (empresa: Empresa) => {

  const puedeEditar =
    usuarioActual?.role === "ADMIN" ||
    String(usuarioActual?.companyId) === String(empresa.id);

  if (!puedeEditar) {
    setError("No tienes permisos para editar esta empresa.");
    return;
  }
  setEmpresaSeleccionada(empresa);
  setMostrarEdicion(true);
  setMostrarFormulario(false);
  setMostrarDetalle(false);

  await cargarServiciosEmpresa(empresa.id);

setFormulario({
  name: empresa.name,
  ruc: empresa.ruc,
  phone: empresa.phone,
  whatsapp: empresa.whatsapp,
  facebook: empresa.facebook,
  email: empresa.email,
  address: empresa.address,
  latitud: empresa.latitud,
  longitud: empresa.longitud,
  description: empresa.description,
      categoria: empresa.categoria,
    logoUrl: empresa.logoUrl,
    portadaUrl: empresa.portadaUrl,
  });
  // Limpiar archivos seleccionados anteriormente
  setLogoFile(null);
  setPortadaFile(null);
  setGalleryFiles([]);

  // Cargar galería actual de la empresa
  try {
    const respuestaGaleria = await fetch(
      `${API_URL}/companies/${empresa.id}/gallery`
    );

    if (respuestaGaleria.ok) {
      const imagenes = await respuestaGaleria.json();
      setGalleryImages(imagenes);
    } else {
      setGalleryImages([]);
    }
} catch (error) {
  console.error("Error cargando galería para edición:", error);
  setGalleryImages([]);
  setError(
    error instanceof Error
      ? error.message
      : "No se pudo cargar la galería."
  );
}

  setMostrarEdicion(true);
  setMostrarFormulario(false);
  setMostrarDetalle(false);

  setMensaje("");
  setError("");
};

const actualizarEmpresa = async (evento: FormEvent) => {
  evento.preventDefault();

  setMensaje("");
  setError("");

  if (!empresaSeleccionada?.id) {
    setError("No se encontró el ID de la empresa.");
    return;
  }

  const empresaId = empresaSeleccionada.id;

  if (!formulario.name.trim()) {
    setError("El nombre de la empresa es obligatorio.");
    return;
  }

  try {
    setGuardando(true);

    // =====================================================
    // 1. ACTUALIZAR DATOS DE LA EMPRESA
    // =====================================================

    const datos = {
      nombre: formulario.name.trim(),
      ruc: formulario.ruc.trim() || undefined,
      telefono: formulario.phone.trim() || undefined,
      whatsapp: formulario.whatsapp.trim() || undefined,
email: formulario.email.trim() || undefined,
direccion: formulario.address.trim() || undefined,
latitud: formulario.latitud ?? undefined,
longitud: formulario.longitud ?? undefined,
descripcion: formulario.description.trim() || undefined,
            categoria: formulario.categoria.trim() || undefined,
      facebook: formulario.facebook.trim() || undefined,
    };

const token = localStorage.getItem("zapea_token");

if (!token) {
  throw new Error("No se encontró el token de acceso.");
}

const respuesta = await fetch(
  `${API_URL}/companies/${empresaId}`,
  {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${obtenerToken()}`,
    },
    body: JSON.stringify(datos),
  }
);
    if (!respuesta.ok) {
      throw new Error(
        await leerError(
          respuesta,
          `Error ${respuesta.status} al actualizar la empresa.`
        )
      );
    }

    // =====================================================
    // 2. SUBIR NUEVO LOGO / PORTADA
    // =====================================================

if (logoFile || portadaFile) {
  const formData = new FormData();

  if (logoFile) {
    formData.append("logo", logoFile);
  }

  if (portadaFile) {
    formData.append("portada", portadaFile);
  }

  const respuestaImagenes = await fetch(
    `${API_URL}/companies/${empresaId}/images`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${obtenerToken()}`,
      },
      body: formData,
    }
  );

  if (!respuestaImagenes.ok) {
    throw new Error(
      await leerError(
        respuestaImagenes,
        "La empresa se actualizó, pero no se pudo actualizar el logo o la portada."
      )
    );
  }
}

    // =====================================================
    // 3. AGREGAR NUEVAS IMÁGENES A LA GALERÍA
    // =====================================================

  if (galleryFiles.length > 0) {
  const galleryFormData = new FormData();

  galleryFiles.forEach((file) => {
    galleryFormData.append("files", file);
  });

const respuestaGaleria = await fetch(
  `${API_URL}/companies/${empresaId}/gallery`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
    body: galleryFormData,
  }
);

  if (!respuestaGaleria.ok) {
    throw new Error(
      await leerError(
        respuestaGaleria,
        "La empresa se actualizó, pero ocurrió un error al agregar las imágenes de la galería."
      )
    );
  }
}

    // =====================================================
    // 4. LIMPIAR VISTA
    // =====================================================

    limpiarVista();

    setLogoFile(null);
    setPortadaFile(null);
    setGalleryFiles([]);

    setMensaje("Empresa actualizada correctamente.");

    // =====================================================
    // 5. RECARGAR EMPRESAS
    // =====================================================

    await cargarEmpresas();

  } catch (err) {
    console.error("Error al actualizar empresa:", err);

    setError(
      err instanceof Error
        ? err.message
        : "No se pudo actualizar la empresa."
    );
  } finally {
    setGuardando(false);
  }
};
const abrirEstadisticas = async (empresa: Empresa) => {
  try {
    const respuesta = await fetch(
      `${API_URL}/analytics/company/${empresa.id}`,
      {
        headers: {
          Authorization: `Bearer ${obtenerToken()}`,
        },
      }
    );

    if (!respuesta.ok) {
      throw new Error(
        `No se pudieron cargar las estadísticas. Error ${respuesta.status}`
      );
    }

    const data = await respuesta.json();

    console.log("ZAPEA - ESTADÍSTICAS RECIBIDAS:", data);

    setEstadisticasEmpresa(data);
    setMostrarEstadisticas(true);
  } catch (error) {
    console.error(
      "Error cargando estadísticas:",
      error,
    );

    setError(
      error instanceof Error
        ? error.message
        : "No se pudieron cargar las estadísticas."
    );
  }
};
  const abrirFacebook = (empresa: Empresa) => {
  if (!empresa.facebook) {
    setError("Esta empresa no tiene Facebook registrado.");
    return;
  }

  let url = empresa.facebook.trim();

  if (!url) {
    setError("Esta empresa no tiene Facebook registrado.");
    return;
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  window.open(url, "_blank", "noopener,noreferrer");
};

const abrirCorreo = (empresa: Empresa) => {
  if (!empresa.email) {
    setError("Esta empresa no tiene correo registrado.");
    return;
  }

  registrarAnalitica("email", empresa.id);

  const correo = empresa.email.trim();

  const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(correo)}`;

  window.open(url, "_blank", "noopener,noreferrer");
};

const abrirUbicacion = (empresa: Empresa) => {
  const tieneCoordenadas =
    empresa.latitud !== null &&
    empresa.latitud !== undefined &&
    empresa.longitud !== null &&
    empresa.longitud !== undefined;

  const destino = tieneCoordenadas
    ? `${empresa.latitud},${empresa.longitud}`
    : empresa.address;

  if (!destino) {
    setError(
      "Esta empresa no tiene ubicación GPS ni dirección registrada."
    );
    return;
  }

  const url =
    `https://www.google.com/maps/dir/?api=1&destination=` +
    `${encodeURIComponent(destino)}`;

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
};

const abrirUbicacionSucursal = (sucursal: Sucursal) => {
  if (
    sucursal.latitud === null ||
    sucursal.latitud === undefined ||
    sucursal.longitud === null ||
    sucursal.longitud === undefined
  ) {
    setError(
      "Esta sucursal no tiene una ubicación GPS registrada."
    );
    return;
  }

  const url =
    `https://www.google.com/maps/search/?api=1&query=` +
    `${sucursal.latitud},${sucursal.longitud}`;

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
};

  // =========================================================
  // FUNCIONES PARA ADMINISTRAR SERVICIOS
  // =========================================================

  const limpiarFormularioServicio = () => {
    setFormularioServicio({
      nombre: "",
      descripcion: "",
      precioDesde: "",
      imagenUrl: "",
      destacado: true,
    });

    setServicioEditando(null);
    setMostrarFormularioServicio(false);
  };

  // =========================================================
  // NUEVO SERVICIO
  // =========================================================

  const nuevoServicioBD = () => {
    if (!empresaSeleccionada) {
      setError("Primero selecciona una empresa.");
      return;
    }

    setServicioEditando(null);

    setFormularioServicio({
      nombre: "",
      descripcion: "",
      precioDesde: "",
      imagenUrl: "",
      destacado: true,
    });

    setMostrarFormularioServicio(true);
  };

  // =========================================================
  // EDITAR SERVICIO
  // =========================================================

const editarServicioBD = async (
  servicio: ServicioBD,
) => {
  const idServicioSeleccionado = servicio.id;

  // --------------------------------------------------
  // MOSTRAR INMEDIATAMENTE EL SERVICIO QUE SE CLICKEÓ
  // --------------------------------------------------

  setServicioEditando({
    ...servicio,
    images: [],
  });

  setFormularioServicio({
    nombre: servicio.nombre ?? "",
    descripcion: servicio.descripcion ?? "",
    precioDesde:
      servicio.precioDesde !== null &&
      servicio.precioDesde !== undefined
        ? String(servicio.precioDesde)
        : "",
    imagenUrl: servicio.imagenUrl ?? "",
    destacado: servicio.destacado ?? true,
  });

  setImagenesServicioGaleria([]);
  setImagenesServicioReemplazo({});
  setMostrarFormularioServicio(true);

  // --------------------------------------------------
  // CARGAR IMÁGENES DEL SERVICIO SELECCIONADO
  // --------------------------------------------------

  try {
    const respuestaImagenes = await fetch(
      `${API_URL}/services/${idServicioSeleccionado}/images`,
    );

    if (!respuestaImagenes.ok) {
      throw new Error(
        "No se pudieron cargar las imágenes del servicio.",
      );
    }

    const imagenes = await respuestaImagenes.json();

    console.log(
      "IMÁGENES GUARDADAS DEL SERVICIO:",
      idServicioSeleccionado,
      imagenes,
    );

    // ------------------------------------------------
    // EVITAR QUE UNA PETICIÓN ANTERIOR SOBRESCRIBA
    // EL SERVICIO ACTUAL
    // ------------------------------------------------

    setServicioEditando((actual) => {
      if (!actual || actual.id !== idServicioSeleccionado) {
        return actual;
      }

      return {
        ...actual,
        images: Array.isArray(imagenes)
          ? imagenes
          : [],
      };
    });

  } catch (error) {
    console.error(
      "Error cargando servicio para editar:",
      error,
    );

    setError(
      error instanceof Error
        ? error.message
        : "No se pudo cargar el servicio.",
    );
  }
};

// =========================================================
// GUARDAR SERVICIO
// =========================================================

const guardarServicioBD = async () => {
  if (!empresaSeleccionada) {
    setError("Primero selecciona una empresa.");
    return;
  }

  if (!formularioServicio.nombre.trim()) {
    setError("El nombre del servicio es obligatorio.");
    return;
  }

  try {
    setGuardando(true);
    setError("");
    setMensaje("");

    // =========================================================
    // PRECIO
    // =========================================================

    const precioTexto = String(
      formularioServicio.precioDesde ?? "",
    ).trim();

    const precio =
      precioTexto !== ""
        ? Number(precioTexto)
        : undefined;

    if (
      precioTexto !== "" &&
      Number.isNaN(precio)
    ) {
      setError(
        "El precio debe ser un número válido.",
      );
      return;
    }

    // =========================================================
    // DATOS DEL SERVICIO
    // =========================================================

    const datos = {
      nombre:
        formularioServicio.nombre.trim(),

      descripcion:
        formularioServicio.descripcion?.trim() ||
        undefined,

      precioDesde: precio,

      imagenUrl:
        formularioServicio.imagenUrl?.trim() ||
        undefined,

      destacado:
        formularioServicio.destacado,
    };

    // =========================================================
    // CREAR / ACTUALIZAR SERVICIO
    // =========================================================

    let respuesta: Response;

if (servicioEditando) {
  // ACTUALIZAR
  respuesta = await fetch(
    `${API_URL}/services/${servicioEditando.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${obtenerToken()}`,
      },
      body: JSON.stringify(datos),
    },
  );
} else {
      // CREAR
respuesta = await fetch(
  `${API_URL}/services/company/${empresaSeleccionada.id}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${obtenerToken()}`,
    },
    body: JSON.stringify(datos),
  },
);
    }

    // =========================================================
    // VERIFICAR RESPUESTA
    // =========================================================

    if (!respuesta.ok) {
      const texto =
        await respuesta.text();

      throw new Error(
        texto ||
          "No se pudo guardar el servicio.",
      );
    }

    // =========================================================
    // OBTENER ID DEL SERVICIO
    // =========================================================

    const resultado =
      await respuesta.json();

    const servicioId =
      servicioEditando?.id ||
      resultado?.id;

    if (!servicioId) {
      throw new Error(
        "No se pudo obtener el ID del servicio.",
      );
    }

    // =========================================================
    // SUBIR / REEMPLAZAR IMAGEN PRINCIPAL
    // =========================================================

    if (imagenServicioArchivo) {
      const formDataImagen =
        new FormData();

      formDataImagen.append(
        "imagen",
        imagenServicioArchivo,
      );

const respuestaImagen =
  await fetch(
    `${API_URL}/services/${servicioId}/image`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${obtenerToken()}`,
      },
      body: formDataImagen,
    },
  );

      if (!respuestaImagen.ok) {
        const textoError =
          await respuestaImagen.text();

        throw new Error(
          `No se pudo subir la imagen principal: ${
            textoError || "Error desconocido"
          }`,
        );
      }

      console.log(
        "Imagen principal subida correctamente.",
      );
    }

    // =========================================================
    // SUBIR GALERÍA DE IMÁGENES
    // =========================================================

    if (
      imagenesServicioGaleria &&
      imagenesServicioGaleria.length > 0
    ) {
      console.log(
        "Subiendo imágenes de galería:",
        imagenesServicioGaleria.length,
      );

      const formDataGaleria =
        new FormData();

      imagenesServicioGaleria
        .slice(0, 6)
        .forEach((archivo) => {
          formDataGaleria.append(
            "imagenes",
            archivo,
          );
        });

const respuestaGaleria =
  await fetch(
    `${API_URL}/services/${servicioId}/images`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${obtenerToken()}`,
      },
      body: formDataGaleria,
    },
  );

      if (!respuestaGaleria.ok) {
        const textoError =
          await respuestaGaleria.text();

        throw new Error(
          `No se pudieron subir las imágenes de la galería: ${
            textoError || "Error desconocido"
          }`,
        );
      }

      const resultadoGaleria =
        await respuestaGaleria.json();

      console.log(
        "GALERÍA GUARDADA CORRECTAMENTE:",
        resultadoGaleria,
      );
    }

    // =========================================================
    // MENSAJE
    // =========================================================

    setMensaje(
      servicioEditando
        ? "Servicio actualizado correctamente."
        : "Servicio creado correctamente.",
    );
  // =========================================================
    // REEMPLAZAR IMÁGENES EXISTENTES DE LA GALERÍA
    // =========================================================

    const reemplazos = Object.entries(
      imagenesServicioReemplazo
    );

    if (reemplazos.length > 0) {
      console.log(
        "Reemplazando imágenes de galería:",
        reemplazos.length
      );

      for (const [imageId, archivo] of reemplazos) {
        const formDataReemplazo = new FormData();

        formDataReemplazo.append(
          "imagen",
          archivo
        );

const respuestaReemplazo = await fetch(
  `${API_URL}/services/${servicioId}/images/${imageId}`,
  {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
    body: formDataReemplazo,
  }
);

        if (!respuestaReemplazo.ok) {
          const textoError =
            await respuestaReemplazo.text();

          throw new Error(
            `No se pudo reemplazar la imagen ${imageId}: ${
              textoError || "Error desconocido"
            }`
          );
        }

        const resultadoReemplazo =
          await respuestaReemplazo.json();

        console.log(
          "IMAGEN REEMPLAZADA CORRECTAMENTE:",
          resultadoReemplazo
        );
      }
    }
    // =========================================================
    // CERRAR FORMULARIO
    // =========================================================

    setMostrarFormularioServicio(false);
    setServicioEditando(null);

    setFormularioServicio({
      nombre: "",
      descripcion: "",
      precioDesde: "",
      imagenUrl: "",
      destacado: true,
    });

    setImagenServicioArchivo(null);
    setImagenesServicioGaleria([]);
    setImagenesServicioReemplazo({});

    // =========================================================
    // VOLVER A CARGAR SERVICIOS
    // =========================================================

    await cargarServiciosEmpresa(
      empresaSeleccionada.id,
    );

  } catch (error) {
    console.error(
      "Error guardando servicio:",
      error,
    );

    setError(
      error instanceof Error
        ? error.message
        : "No se pudo guardar el servicio.",
    );
  } finally {
    setGuardando(false);
  }
};

  // =========================================================
  // ELIMINAR SERVICIO
  // =========================================================

  const eliminarServicioBD = async (
    id: string,
  ) => {
    if (!empresaSeleccionada) {
      setError("Primero selecciona una empresa.");
      return;
    }

    const confirmar = window.confirm(
      "¿Estás seguro de eliminar este servicio?",
    );

    if (!confirmar) {
      return;
    }

    try {
      setGuardando(true);
      setError("");
      setMensaje("");

const token = localStorage.getItem("zapea_token");

if (!token) {
  throw new Error("No se encontró el token de acceso.");
}

const respuesta = await fetch(
  `${API_URL}/services/${id}`,
  {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  },
);

      if (!respuesta.ok) {
        const texto =
          await respuesta.text();

        throw new Error(
          texto ||
            "No se pudo eliminar el servicio.",
        );
      }

      setMensaje(
        "Servicio eliminado correctamente.",
      );

      await cargarServiciosEmpresa(
        empresaSeleccionada.id,
      );
    } catch (error) {
      console.error(
        "Error eliminando servicio:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el servicio.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const formularioEmpresa = (
    <form
      onSubmit={mostrarEdicion ? actualizarEmpresa : guardarEmpresa}
      style={styles.formulario}
    >
      <div style={styles.formularioCabecera}>
        <h2 style={styles.formularioTitulo}>
          {mostrarEdicion ? "Editar empresa" : "Nueva empresa"}
        </h2>
<button
  type="button"
  onClick={limpiarVista}
  disabled={guardando}
  style={styles.cerrar}
>
  ×
</button>
      </div>

      <div
  className="zapea-form-grid"
  style={styles.grid}
>
        <Campo label="Nombre *">
          <input
            style={styles.input}
            value={formulario.name}
            onChange={(e) => cambiarCampo("name", e.target.value)}
            placeholder="Nombre de la empresa"
            required
          />
        </Campo>

        <Campo label="Categoría">
          <select
            style={styles.input}
            value={formulario.categoria}
            onChange={(e) => cambiarCampo("categoria", e.target.value)}
          >
            <option value="">Seleccionar categoría</option>
            {CATEGORIAS.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </Campo>

        <Campo label="Logo de la empresa">

  {/* LOGO ACTUAL */}
  {mostrarEdicion && empresaSeleccionada?.logoUrl && !logoFile && (
    <div
      style={{
        marginBottom: "10px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: 700,
          color: "#64748b",
          marginBottom: "6px",
        }}
      >
        Logo actual
      </div>

      <img
        src={
          empresaSeleccionada.logoUrl.startsWith("http")
            ? empresaSeleccionada.logoUrl
            : `${API_URL}${empresaSeleccionada.logoUrl}`
        }
        alt="Logo actual"
        style={{
          width: "100px",
          height: "100px",
          objectFit: "cover",
          borderRadius: "12px",
          border: "2px solid #2563eb",
          display: "block",
          margin: "0 auto",
        }}
      />
    </div>
  )}

  {/* SELECCIONAR NUEVO LOGO */}
<input
  id="zapea-logo-file"
  type="file"
  accept="image/*"
  style={{ display: "none" }}
  onChange={(e) => {
    const file = e.target.files?.[0] ?? null;
    setLogoFile(file);
    e.currentTarget.value = "";
  }}
/>

<div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginTop: "10px",
  }}
>
  <button
    type="button"
    disabled={guardando}
    onClick={() => {
      document
        .getElementById("zapea-logo-file")
        ?.click();
    }}
    style={{
      border: "none",
      background: "#2563eb",
      color: "#fff",
      padding: "8px 14px",
      borderRadius: "7px",
      fontWeight: 700,
      fontSize: "12px",
      cursor: "pointer",
      touchAction: "manipulation",
    }}
  >
    🔄 Reemplazar
  </button>
</div>

  {/* VISTA PREVIA DEL NUEVO LOGO */}
  {logoFile && (
    <div
      style={{
        marginTop: "10px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: 700,
          color: "#2563eb",
          marginBottom: "6px",
        }}
      >
        Nuevo logo
      </div>

      <img
        src={URL.createObjectURL(logoFile)}
        alt="Vista previa del nuevo logo"
        style={{
          width: "100px",
          height: "100px",
          objectFit: "cover",
          borderRadius: "12px",
          border: "2px solid #16a34a",
          display: "block",
          margin: "0 auto",
        }}
      />
    </div>
  )}

</Campo>

<Campo label="Portada de la empresa">

  {/* ============================================
      PORTADA ACTUAL
      ============================================ */}
  {mostrarEdicion &&
    empresaSeleccionada?.portadaUrl &&
    !portadaFile && (
      <div
        style={{
          marginBottom: "10px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#64748b",
            marginBottom: "6px",
          }}
        >
          Portada actual
        </div>

        <img
          src={
            empresaSeleccionada.portadaUrl.startsWith("http")
              ? empresaSeleccionada.portadaUrl
              : `${API_URL}${empresaSeleccionada.portadaUrl}`
          }
          alt="Portada actual"
          style={{
            width: "100%",
            maxWidth: "420px",
            height: "160px",
            objectFit: "cover",
            borderRadius: "12px",
            border: "2px solid #2563eb",
            display: "block",
            margin: "0 auto",
          }}
        />
      </div>
    )}

  {/* ============================================
      SELECTOR OCULTO
      ============================================ */}
  <input
    id="zapea-portada-file"
    type="file"
    accept="image/*"
    style={{ display: "none" }}
    onChange={(e) => {
      const file = e.target.files?.[0] ?? null;
      setPortadaFile(file);
      e.currentTarget.value = "";
    }}
  />

  {/* ============================================
      BOTÓN REEMPLAZAR
      ============================================ */}
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      marginTop: "8px",
    }}
  >
    <button
      type="button"
      disabled={guardando}
      onClick={() => {
        document
          .getElementById("zapea-portada-file")
          ?.click();
      }}
      style={{
        width: "140px",
        height: "32px",
        minHeight: "32px",
        padding: "0",
        border: "none",
        borderRadius: "7px",
        background: "#2563eb",
        color: "#fff",
        fontSize: "10px",
        fontWeight: 700,
        cursor: "pointer",
        touchAction: "manipulation",
        boxSizing: "border-box",
      }}
    >
      🔄 Reemplazar
    </button>
  </div>

  {/* ============================================
      VISTA PREVIA DE NUEVA PORTADA
      ============================================ */}
  {portadaFile && (
    <div
      style={{
        marginTop: "12px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: 700,
          color: "#16a34a",
          marginBottom: "6px",
        }}
      >
        Nueva portada
      </div>

      <img
        src={URL.createObjectURL(portadaFile)}
        alt="Vista previa de la nueva portada"
        style={{
          width: "100%",
          maxWidth: "420px",
          height: "160px",
          objectFit: "cover",
          borderRadius: "12px",
          border: "2px solid #16a34a",
          display: "block",
          margin: "0 auto",
        }}
      />
    </div>
  )}

</Campo>

<Campo label="Galería de imágenes">

  {/* ============================================
      IMÁGENES YA GUARDADAS
      ============================================ */}

  {galleryImages.length > 0 && (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "15px",
        marginBottom: "15px",
      }}
    >
      {galleryImages.map((imagen, index) => (
        <div
          key={imagen.id ?? index}
          style={{
            width: "140px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#2563eb",
            }}
          >
            Imagen {index + 1}
          </div>

          <img
            src={`${API_URL}${imagen.url}`}
            alt={`Imagen ${index + 1}`}
            style={{
              width: "140px",
              height: "100px",
              objectFit: "cover",
              borderRadius: "8px",
              border: "1px solid #ddd",
            }}
          />

          {/* REEMPLAZAR */}
          <button
            type="button"
            disabled={guardando || !imagen.id}
            onClick={() => {
              if (imagen.id) {
                reemplazarImagenGaleria(imagen.id);
              }
            }}
style={{
  width: "100%",
  height: "28px",
  minHeight: "28px",
  padding: "0",
  border: "none",
  borderRadius: "7px",
  backgroundColor:
    guardando || !imagen.id
      ? "#aaa"
      : "#2563eb",
  color: "#fff",
  cursor:
    guardando || !imagen.id
      ? "not-allowed"
      : "pointer",
  fontSize: "10px",
  fontWeight: 700,
  touchAction: "manipulation",
  boxSizing: "border-box",
}}
          >
            🔄 Reemplazar
          </button>

          {/* ELIMINAR */}
          <button
            type="button"
            disabled={guardando || !imagen.id}
            onClick={() => {
              if (imagen.id) {
                eliminarImagenGaleria(imagen.id);
              }
            }}
style={{
  width: "100%",
  height: "28px",
  minHeight: "28px",
  padding: "0",
  border: "none",
  borderRadius: "7px",
  backgroundColor:
    guardando || !imagen.id
      ? "#aaa"
      : "#dc2626",
  color: "#fff",
  cursor:
    guardando || !imagen.id
      ? "not-allowed"
      : "pointer",
  fontSize: "10px",
  fontWeight: 700,
  touchAction: "manipulation",
  boxSizing: "border-box",
}}
          >
            🗑️ Eliminar
          </button>
        </div>
      ))}
    </div>
  )}

  {/* ============================================
      SELECTOR DE IMÁGENES
      ============================================ */}

  <input
    id="galeria-imagenes"
    type="file"
    multiple
    accept="image/*"
    style={{
      width: "100%",
      padding: "11px",
      boxSizing: "border-box",
      borderRadius: "7px",
      border: "1px solid #28537c",
      background: "#06182a",
      color: "#ffffff",
      cursor: "pointer",
    }}
    onChange={(e) => {
      const archivos = Array.from(
        e.currentTarget.files ?? []
      );

      if (archivos.length === 0) {
        return;
      }

      setGalleryFiles((actuales) => {
        const nuevos = archivos.filter(
          (nuevo) =>
            !actuales.some(
              (actual) =>
                actual.name === nuevo.name &&
                actual.size === nuevo.size &&
                actual.lastModified ===
                  nuevo.lastModified
            )
        );

        return [...actuales, ...nuevos];
      });

      e.currentTarget.value = "";
    }}
  />

  {/* ============================================
      BOTÓN PARA AGREGAR MÁS
      ============================================ */}

  <button
    type="button"
    disabled={guardando}
    onClick={() => {
      document
        .getElementById("galeria-imagenes")
        ?.click();
    }}
    style={{
      width: "100%",
      marginTop: "10px",
      padding: "10px",
      borderRadius: "7px",
      border: "1px solid #28537c",
      background: "#2563eb",
      color: "#ffffff",
      fontWeight: 700,
      cursor: "pointer",
    }}
  >
    📷 Agregar otra imagen
  </button>

  {/* ============================================
      VISTA PREVIA DE NUEVAS IMÁGENES
      ============================================ */}

  {galleryFiles.length > 0 && (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        marginTop: "15px",
      }}
    >
      {galleryFiles.map((file, index) => (
        <div
          key={`${file.name}-${file.lastModified}-${index}`}
          style={{
            width: "120px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <div
            style={{
              color: "#60a5fa",
              fontSize: "11px",
              fontWeight: 700,
            }}
          >
            Nueva {index + 1}
          </div>

          <img
            src={URL.createObjectURL(file)}
            alt={`Vista previa ${index + 1}`}
            style={{
              width: "120px",
              height: "90px",
              objectFit: "cover",
              borderRadius: "8px",
              border: "1px solid #28537c",
              display: "block",
            }}
          />

          <button
            type="button"
            onClick={() => {
              setGalleryFiles((actuales) =>
                actuales.filter(
                  (_, i) => i !== index
                )
              );
            }}
            style={{
              width: "100%",
              padding: "7px 8px",
              borderRadius: "6px",
              border: "1px solid #dc2626",
              background: "#7f1d1d",
              color: "#ffffff",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            🗑️ Quitar
          </button>
        </div>
      ))}
    </div>
  )}

</Campo>

        <Campo label="RUC">
          <input
            style={styles.input}
            value={formulario.ruc}
            onChange={(e) => cambiarCampo("ruc", e.target.value)}
            placeholder="20609999999"
            maxLength={11}
          />
        </Campo>

        <Campo label="Teléfono">
          <input
            style={styles.input}
            value={formulario.phone}
            onChange={(e) => cambiarCampo("phone", e.target.value)}
            placeholder="987654321"
          />
        </Campo>

        <Campo label="WhatsApp">
          <input
            style={styles.input}
            value={formulario.whatsapp}
            onChange={(e) => cambiarCampo("whatsapp", e.target.value)}
            placeholder="987654321"
          />
        </Campo>

        <Campo label="Facebook">
<input
    type="url"
    style={styles.input}
    value={formulario.facebook}
    onChange={(e) => cambiarCampo("facebook", e.target.value)}
    placeholder="https://facebook.com/tuempresa"
  />
</Campo>

        <Campo label="Correo electrónico">
          <input
            type="email"
            style={styles.input}
            value={formulario.email}
            onChange={(e) => cambiarCampo("email", e.target.value)}
            placeholder="correo@empresa.com"
          />
        </Campo>

        <div style={{ ...styles.campo, gridColumn: "1 / -1" }}>
          <label style={styles.label}>Dirección</label>
          <input
            style={styles.input}
            value={formulario.address}
            onChange={(e) => cambiarCampo("address", e.target.value)}
            placeholder="Huancayo - Junín"
          />
        </div>

<div
  style={{
    ...styles.campo,
    gridColumn: "1 / -1",
  }}
>
  <button
    type="button"
    onClick={() => {
      setError("");
      setMensaje("");

      if (!navigator.geolocation) {
        setError(
          "Este navegador no permite obtener la ubicación."
        );
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (posicion) => {
          const { latitude, longitude } =
            posicion.coords;

          setFormulario((actual) => ({
            ...actual,
            latitud: latitude,
            longitud: longitude,
          }));

          setMensaje(
            "Ubicación GPS de la empresa obtenida correctamente."
          );
        },
        (error) => {
          console.error(
            "Error obteniendo ubicación:",
            error
          );

          let mensajeUbicacion =
            "No se pudo obtener la ubicación.";

          if (error.code === 1) {
            mensajeUbicacion =
              "Debes permitir el acceso a tu ubicación.";
          }

          if (error.code === 2) {
            mensajeUbicacion =
              "No se pudo determinar tu ubicación.";
          }

          if (error.code === 3) {
            mensajeUbicacion =
              "La ubicación tardó demasiado en responder.";
          }

          setError(mensajeUbicacion);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    }}
    style={{
      width: "fit-content",
      border: "none",
      background: "#2563eb",
      color: "#fff",
      padding: "10px 16px",
      borderRadius: "8px",
      fontWeight: 700,
      cursor: "pointer",
    }}
  >
    📍 Usar mi ubicación actual
  </button>
  <span
    style={{
      fontSize: "12px",
      color: "#64748b",
      marginTop: "6px",
    }}
  >
    Obtendrá automáticamente el punto GPS exacto de la empresa.
  </span>
 </div>
<Campo label="Latitud">
  <input
    type="number"
    step="any"
    style={styles.input}
    placeholder="-12.0651"
    value={
      formulario.latitud !== null &&
      formulario.latitud !== undefined
        ? formulario.latitud
        : ""
    }
    onChange={(e) =>
      setFormulario((actual) => ({
        ...actual,
        latitud:
          e.target.value === ""
            ? null
            : Number(e.target.value),
      }))
    }
  />
</Campo>

<Campo label="Longitud">
  <input
    type="number"
    step="any"
    style={styles.input}
    placeholder="-75.2049"
    value={
      formulario.longitud !== null &&
      formulario.longitud !== undefined
        ? formulario.longitud
        : ""
    }
    onChange={(e) =>
      setFormulario((actual) => ({
        ...actual,
        longitud:
          e.target.value === ""
            ? null
            : Number(e.target.value),
      }))
    }
  />
</Campo>
        <div style={{ ...styles.campo, gridColumn: "1 / -1" }}>
          <label style={styles.label}>Descripción</label>
          <textarea
            style={styles.textarea}
            value={formulario.description}
            onChange={(e) => cambiarCampo("description", e.target.value)}
            placeholder="Describe brevemente la empresa..."
            rows={4}
          />
        </div>
</div>

{/* =====================================================
    SUCURSALES DE LA EMPRESA
===================================================== */}

<div
  style={{
    marginTop: "20px",
    padding: "18px",
    background: "#071a2f",
    border: "1px solid #164b80",
    borderRadius: "12px",
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "15px",
      gap: "10px",
    }}
  >
    <div>
      <div
        style={{
          fontSize: "11px",
          color: "#4da3ff",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        ZAPEA
      </div>

      <h3
        style={{
          margin: "4px 0 0",
          color: "#ffffff",
          fontSize: "18px",
        }}
      >
        Sucursales de la empresa
      </h3>
    </div>

    <button
      type="button"
      onClick={crearSucursal}
      disabled={guardando}
      style={{
        border: "none",
        background: "#2563eb",
        color: "#ffffff",
        padding: "9px 14px",
        borderRadius: "8px",
        cursor: guardando
          ? "not-allowed"
          : "pointer",
        fontWeight: 700,
        opacity: guardando ? 0.7 : 1,
      }}
    >
      + Nueva sucursal
    </button>
  </div>

  {cargandoSucursales ? (
    <div
      style={{
        padding: "20px",
        textAlign: "center",
        color: "#9db4cf",
      }}
    >
      Cargando sucursales...
    </div>
  ) : sucursales.length === 0 ? (
    <div
      style={{
        padding: "20px",
        textAlign: "center",
        border: "1px dashed #28537c",
        borderRadius: "8px",
        color: "#9db4cf",
      }}
    >
      Esta empresa todavía no tiene sucursales registradas.
    </div>
  ) : (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
{sucursales.map((sucursal) => (
  <React.Fragment key={sucursal.id}>
      <div
      style={{
        padding: "14px",
        background: "#0a2340",
        border: "1px solid #205586",
        borderRadius: "9px",
      }}
    >
      <div
        style={{
          color: "#ffffff",
          fontWeight: 700,
          fontSize: "14px",
        }}
      >
        🏢 {sucursal.nombre}
      </div>

      {sucursal.direccion ? (
        <div
          style={{
            color: "#91a9c2",
            fontSize: "12px",
            marginTop: "6px",
          }}
        >
          📍 {sucursal.direccion}
        </div>
      ) : (
        <div
          style={{
            color: "#f59e0b",
            fontSize: "12px",
            marginTop: "6px",
          }}
        >
          ⚠️ Dirección no registrada
        </div>
      )}

      {sucursal.telefono ? (
        <div
          style={{
            color: "#91a9c2",
            fontSize: "12px",
            marginTop: "4px",
          }}
        >
          📞 {sucursal.telefono}
        </div>
      ) : (
        <div
          style={{
            color: "#f59e0b",
            fontSize: "12px",
            marginTop: "4px",
          }}
        >
          ⚠️ Teléfono no registrado
        </div>
      )}

      {sucursal.latitud !== null &&
      sucursal.latitud !== undefined &&
      sucursal.longitud !== null &&
      sucursal.longitud !== undefined ? (
        <div
          style={{
            color: "#4ade80",
            fontSize: "12px",
            marginTop: "4px",
            fontWeight: 600,
          }}
        >
          📍 GPS registrado
        </div>
      ) : (
        <div
          style={{
            color: "#f59e0b",
            fontSize: "12px",
            marginTop: "4px",
          }}
        >
          ⚠️ GPS no registrado
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "8px",
          marginTop: "12px",
        }}
      >

{sucursal.latitud !== null &&
sucursal.latitud !== undefined &&
sucursal.longitud !== null &&
sucursal.longitud !== undefined && (
  <button
    type="button"
    onClick={() =>
      abrirUbicacionSucursal(sucursal)
    }
    style={{
      border: "1px solid #2563eb",
      background: "#102f55",
      color: "#ffffff",
      padding: "6px 10px",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: 700,
    }}
  >
    📍 Ver mapa
  </button>
)}

        <button
          type="button"
          onClick={() => editarSucursal(sucursal)}
          style={{
            border: "1px solid #2563eb",
            background: "#102f55",
            color: "#ffffff",
            padding: "6px 10px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          ✏️ Editar
        </button>
      </div>
    </div>
{mostrarFormularioSucursal &&
  sucursalEditando?.id === sucursal.id && (
    <div
      style={{
        marginTop: "10px",
        padding: "18px",
        background: "#081d33",
        border: "1px solid #2563eb",
        borderRadius: "10px",
      }}
    >
      <h3 style={{ color: "#ffffff", marginTop: 0 }}>
        Editar sucursal
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,minmax(0,1fr))",
          gap: "12px",
        }}
      >
        <Campo label="Nombre">
          <input
            value={formularioSucursal.nombre}
            onChange={(e) =>
              setFormularioSucursal((actual) => ({
                ...actual,
                nombre: e.target.value,
              }))
            }
            style={styles.input}
          />
        </Campo>

        <Campo label="Dirección">
          <input
            value={formularioSucursal.direccion}
            onChange={(e) =>
              setFormularioSucursal((actual) => ({
                ...actual,
                direccion: e.target.value,
              }))
            }
            style={styles.input}
          />
        </Campo>

        <Campo label="Teléfono">
          <input
            value={formularioSucursal.telefono}
            onChange={(e) =>
              setFormularioSucursal((actual) => ({
                ...actual,
                telefono: e.target.value,
              }))
            }
            style={styles.input}
          />
        </Campo>

        <Campo label="WhatsApp">
          <input
            value={formularioSucursal.whatsapp}
            onChange={(e) =>
              setFormularioSucursal((actual) => ({
                ...actual,
                whatsapp: e.target.value,
              }))
            }
            style={styles.input}
          />
        </Campo>

        <Campo label="Correo">
          <input
            value={formularioSucursal.email}
            onChange={(e) =>
              setFormularioSucursal((actual) => ({
                ...actual,
                email: e.target.value,
              }))
            }
            style={styles.input}
          />
        </Campo>

        <Campo label="Horario">
          <input
            value={formularioSucursal.horario}
            onChange={(e) =>
              setFormularioSucursal((actual) => ({
                ...actual,
                horario: e.target.value,
              }))
            }
            style={styles.input}
          />
        </Campo>

        <div
  style={{
    gridColumn: "1 / -1",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  }}
>
  <button
    type="button"
    onClick={obtenerUbicacionActual}
    style={{
      width: "fit-content",
      border: "none",
      background: "#2563eb",
      color: "#fff",
      padding: "10px 16px",
      borderRadius: "8px",
      fontWeight: 700,
      cursor: "pointer",
    }}
  >
    📍 Actualizar ubicación GPS
  </button>

  <span
    style={{
      fontSize: "12px",
      color: "#64748b",
    }}
  >
    Reemplazará la latitud y longitud actuales.
  </span>
</div>

        <Campo label="Latitud">
          <input
            value={formularioSucursal.latitud}
            onChange={(e) =>
              setFormularioSucursal((actual) => ({
                ...actual,
                latitud: e.target.value,
              }))
            }
            style={styles.input}
          />
        </Campo>

        <Campo label="Longitud">
          <input
            value={formularioSucursal.longitud}
            onChange={(e) =>
              setFormularioSucursal((actual) => ({
                ...actual,
                longitud: e.target.value,
              }))
            }
            style={styles.input}
          />
        </Campo>
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginTop: "15px",
          color: "#ffffff",
        }}
      >
        <input
          type="checkbox"
          checked={formularioSucursal.activo}
          onChange={(e) =>
            setFormularioSucursal((actual) => ({
              ...actual,
              activo: e.target.checked,
            }))
          }
        />
        Sucursal activa
      </label>

      <div style={styles.botonesFormulario}>
        <button
          type="button"
          onClick={guardarSucursal}
          disabled={guardando}
          style={styles.guardar}
        >
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>

        <button
          type="button"
          onClick={cancelarFormularioSucursal}
          disabled={guardando}
          style={styles.cancelar}
        >
          Cancelar
        </button>
      </div>
    </div>
  )}

  </React.Fragment>
))}
   </div>
  )}

{mostrarFormularioSucursal && !sucursalEditando && (
  <div
    style={{
      marginTop: "14px",
      padding: "20px",
      borderRadius: "14px",
      border: "1px solid #e5e7eb",
      background: "#f9fafb",
    }}
  >
    <h3
      style={{
        marginTop: 0,
        marginBottom: "16px",
      }}
    >
      Nueva sucursal
    </h3>

    <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "12px",
  }}
>
  <input
    type="text"
    placeholder="Nombre de la sucursal"
    value={formularioSucursal.nombre}
    onChange={(e) =>
      setFormularioSucursal({
        ...formularioSucursal,
        nombre: e.target.value,
      })
    }
  />

  <input
    type="text"
    placeholder="Dirección"
    value={formularioSucursal.direccion}
    onChange={(e) =>
      setFormularioSucursal({
        ...formularioSucursal,
        direccion: e.target.value,
      })
    }
  />

  <input
    type="text"
    placeholder="Teléfono"
    value={formularioSucursal.telefono}
    onChange={(e) =>
      setFormularioSucursal({
        ...formularioSucursal,
        telefono: e.target.value,
      })
    }
  />

  <input
    type="text"
    placeholder="WhatsApp"
    value={formularioSucursal.whatsapp}
    onChange={(e) =>
      setFormularioSucursal({
        ...formularioSucursal,
        whatsapp: e.target.value,
      })
    }
  />

  <input
    type="email"
    placeholder="Correo electrónico"
    value={formularioSucursal.email}
    onChange={(e) =>
      setFormularioSucursal({
        ...formularioSucursal,
        email: e.target.value,
      })
    }
  />

  <input
    type="text"
    placeholder="Horario"
    value={formularioSucursal.horario}
    onChange={(e) =>
      setFormularioSucursal({
        ...formularioSucursal,
        horario: e.target.value,
      })
    }
  />


<div
  style={{
    gridColumn: "1 / -1",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  }}
>
  <button
    type="button"
    onClick={obtenerUbicacionActual}
    style={{
      width: "fit-content",
      border: "none",
      background: "#2563eb",
      color: "#fff",
      padding: "10px 16px",
      borderRadius: "8px",
      fontWeight: 700,
      cursor: "pointer",
    }}
  >
    📍 Usar mi ubicación actual
  </button>

  <span
    style={{
      fontSize: "12px",
      color: "#64748b",
    }}
  >
    Obtendrá automáticamente el punto GPS exacto
    del establecimiento.
  </span>
</div>

  <input
    type="number"
    step="any"
    placeholder="Latitud"
    value={formularioSucursal.latitud}
    onChange={(e) =>
      setFormularioSucursal({
        ...formularioSucursal,
        latitud: e.target.value,
      })
    }
  />

  <input
    type="number"
    step="any"
    placeholder="Longitud"
    value={formularioSucursal.longitud}
    onChange={(e) =>
      setFormularioSucursal({
        ...formularioSucursal,
        longitud: e.target.value,
      })
    }
  />
</div>

<div
  style={{
    display: "flex",
    gap: "10px",
    marginTop: "16px",
  }}
>
  <button
    type="button"
    onClick={guardarSucursal}
    disabled={guardando}
    style={{
      padding: "10px 18px",
      borderRadius: "10px",
      border: "none",
      background: "#16a34a",
      color: "#fff",
      fontWeight: 700,
      cursor: "pointer",
    }}
  >
    💾 Guardar sucursal
  </button>

  <button
    type="button"
    onClick={cancelarFormularioSucursal}
    disabled={guardando}
    style={{
      padding: "10px 18px",
      borderRadius: "10px",
      border: "1px solid #d1d5db",
      background: "#fff",
      color: "#374151",
      fontWeight: 700,
      cursor: "pointer",
    }}
  >
    Cancelar
  </button>
</div>
    </div>
)}
</div>
{/* =====================================================
    SERVICIOS ZAPEA - SERVICIOS COMPLETOS
===================================================== */}

<div
  style={{
    marginTop: "20px",
    padding: "18px",
    background: "#071a2f",
    border: "1px solid #164b80",
    borderRadius: "12px",
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "15px",
    }}
  >
    <div>
      <div
        style={{
          fontSize: "11px",
          color: "#4da3ff",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        ZAPEA
      </div>

      <h3
        style={{
          margin: "4px 0 0",
          color: "#ffffff",
          fontSize: "18px",
        }}
      >
        Servicios de la empresa
      </h3>
    </div>

    <button
      type="button"
      onClick={nuevoServicioBD}
      style={{
        border: "none",
        background: "#2563eb",
        color: "#ffffff",
        padding: "9px 14px",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: 700,
      }}
    >
      + Nuevo servicio
    </button>
  </div>

  {cargandoServicios ? (
    <div
      style={{
        padding: "20px",
        textAlign: "center",
        color: "#9db4cf",
      }}
    >
      Cargando servicios...
    </div>
  ) : serviciosBD.length === 0 ? (
    <div
      style={{
        padding: "20px",
        textAlign: "center",
        border: "1px dashed #28537c",
        borderRadius: "8px",
        color: "#9db4cf",
      }}
    >
      Esta empresa todavía no tiene servicios registrados.
    </div>
  ) : (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {serviciosBD.map((servicio) => (
        <div
          key={servicio.id}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "15px",
            padding: "13px",
            background: "#0a2340",
            border: "1px solid #205586",
            borderRadius: "9px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "8px",
                background: servicio.destacado
                  ? "#2563eb"
                  : "#183957",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {servicio.destacado ? "★" : "✓"}
            </div>

            <div
              style={{
                minWidth: 0,
              }}
            >
              <div
                style={{
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                {servicio.nombre}
              </div>

              {servicio.descripcion && (
                <div
                  style={{
                    color: "#91a9c2",
                    fontSize: "12px",
                    marginTop: "3px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {servicio.descripcion}
                </div>
              )}

              {servicio.precioDesde !== null && (
                <div
                  style={{
                    color: "#4da3ff",
                    fontSize: "12px",
                    fontWeight: 700,
                    marginTop: "4px",
                  }}
                >
                  Desde S/{" "}
                  {Number(
                    servicio.precioDesde,
                  ).toFixed(2)}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "7px",
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={() =>
                editarServicioBD(servicio)
              }
              style={{
                border: "1px solid #2563eb",
                background: "#102f55",
                color: "#ffffff",
                padding: "7px 10px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
              title="Editar servicio"
            >
              ✏️
            </button>

            <button
              type="button"
              disabled={guardando}
              onClick={() =>
                eliminarServicioBD(servicio.id)
              }
              style={{
                border: "1px solid #ef4444",
                background: "#401b25",
                color: "#ffffff",
                padding: "7px 10px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
              title="Eliminar servicio"
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

{/* =====================================================
    FORMULARIO NUEVO / EDITAR SERVICIO
===================================================== */}

{mostrarFormularioServicio && (
  <div
    style={{
      marginTop: "15px",
      padding: "18px",
      background: "#081d33",
      border: "1px solid #2563eb",
      borderRadius: "12px",
    }}
  >
    <h3
      style={{
        marginTop: 0,
        color: "#ffffff",
      }}
    >
      {servicioEditando
        ? "Editar servicio"
        : "Nuevo servicio"}
    </h3>

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <input
        type="text"
        placeholder="Nombre del servicio"
        value={formularioServicio.nombre}
        onChange={(e) =>
          setFormularioServicio(
            (actual) => ({
              ...actual,
              nombre: e.target.value,
            }),
          )
        }
        style={{
          padding: "11px",
          borderRadius: "7px",
          border: "1px solid #28537c",
          background: "#06182a",
          color: "#ffffff",
        }}
      />

      <textarea
        placeholder="Descripción del servicio"
        value={formularioServicio.descripcion}
        onChange={(e) =>
          setFormularioServicio(
            (actual) => ({
              ...actual,
              descripcion: e.target.value,
            }),
          )
        }
        rows={3}
        style={{
          padding: "11px",
          borderRadius: "7px",
          border: "1px solid #28537c",
          background: "#06182a",
          color: "#ffffff",
          resize: "vertical",
        }}
      />

      <input
        type="number"
        placeholder="Precio desde"
        value={formularioServicio.precioDesde}
        onChange={(e) =>
          setFormularioServicio(
            (actual) => ({
              ...actual,
              precioDesde: e.target.value,
            }),
          )
        }
        style={{
          padding: "11px",
          borderRadius: "7px",
          border: "1px solid #28537c",
          background: "#06182a",
          color: "#ffffff",
        }}
      />

<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "10px",
  }}
>
  <label
    style={{
      color: "#ffffff",
      fontSize: "13px",
      fontWeight: 700,
    }}
  >
    Imagen principal del servicio
  </label>

  {/* IMAGEN PRINCIPAL ACTUAL */}
  {formularioServicio.imagenUrl && !imagenServicioPreview && (
    <div
      style={{
        padding: "10px",
        borderRadius: "10px",
        border: "1px solid #28537c",
        background: "#06182a",
      }}
    >
      <div
        style={{
          color: "#60a5fa",
          fontSize: "11px",
          fontWeight: 700,
          marginBottom: "8px",
        }}
      >
        Imagen actual
      </div>

      <img
        src={
          formularioServicio.imagenUrl.startsWith("http")
            ? formularioServicio.imagenUrl
            : `${API_URL}${formularioServicio.imagenUrl}`
        }
        alt="Imagen principal del servicio"
        style={{
          width: "100%",
          maxHeight: "220px",
          objectFit: "contain",
          borderRadius: "8px",
          display: "block",
          background: "#020b16",
        }}
      />

      <div
        style={{
          color: "#22c55e",
          fontSize: "10px",
          marginTop: "7px",
          textAlign: "center",
        }}
      >
        ✓ Imagen principal guardada
      </div>
    </div>
  )}

  {/* SELECCIONAR REEMPLAZO */}
  <label
    style={{
      width: "100%",
      boxSizing: "border-box",
      padding: "10px",
      borderRadius: "7px",
      border: "1px solid #2563eb",
      background: "#102f55",
      color: "#ffffff",
      fontWeight: 700,
      fontSize: "11px",
      textAlign: "center",
      cursor: "pointer",
    }}
  >
    🔄 Reemplazar imagen principal

    <input
      type="file"
      accept="image/*"
      style={{
        display: "none",
      }}
      onChange={(e) => {
        const archivo = e.target.files?.[0] || null;

        if (!archivo) {
          return;
        }

        setImagenServicioArchivo(archivo);
        e.currentTarget.value = "";
      }}
    />
  </label>

  {/* VISTA PREVIA DE LA NUEVA IMAGEN */}
  {imagenServicioPreview && (
    <div
      style={{
        padding: "10px",
        borderRadius: "10px",
        border: "1px solid #28537c",
        background: "#06182a",
      }}
    >
      <div
        style={{
          color: "#facc15",
          fontSize: "11px",
          fontWeight: 700,
          marginBottom: "8px",
        }}
      >
        Nueva imagen seleccionada
      </div>

      <img
        src={imagenServicioPreview}
        alt="Vista previa de nueva imagen"
        style={{
          width: "100%",
          maxHeight: "220px",
          objectFit: "contain",
          borderRadius: "8px",
          display: "block",
          background: "#020b16",
        }}
      />

      <button
        type="button"
        onClick={() => {
          setImagenServicioArchivo(null);
          setImagenServicioPreview(null);
        }}
        style={{
          marginTop: "10px",
          width: "100%",
          padding: "8px",
          borderRadius: "7px",
          border: "1px solid #dc2626",
          background: "#7f1d1d",
          color: "#ffffff",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        🗑️ Cancelar reemplazo
      </button>
    </div>
  )}

  {!formularioServicio.imagenUrl && !imagenServicioPreview && (
    <div
      style={{
        color: "#94a3b8",
        fontSize: "11px",
        textAlign: "center",
      }}
    >
      Este servicio todavía no tiene imagen principal.
    </div>
  )}
</div>
{/* ==========================================================
    GALERÍA DE IMÁGENES DEL SERVICIO
========================================================== */}

<div
  style={{
    marginTop: "15px",
    padding: "15px",
    border: "1px solid #28537c",
    borderRadius: "8px",
    background: "#06182a",
  }}
>
  <div
    style={{
      color: "#ffffff",
      fontSize: "13px",
      fontWeight: 700,
      marginBottom: "10px",
    }}
  >
    Galería de imágenes del servicio
  </div>

  {/* ========================================================
      IMÁGENES YA GUARDADAS
  ======================================================== */}
  <label
    style={{
      display: "block",
      width: "100%",
      boxSizing: "border-box",
      padding: "10px",
      border: "1px solid #2563eb",
      borderRadius: "7px",
      background: "#102f55",
      color: "#ffffff",
      textAlign: "center",
      cursor: "pointer",
      fontSize: "11px",
      fontWeight: 700,
      marginBottom: "12px",
    }}
  >
    🖼️ Seleccionar imágenes para la galería

    <input
      type="file"
      accept="image/*"
      multiple
      style={{
        display: "none",
      }}
      onChange={(e) => {
        const archivos = Array.from(
          e.currentTarget.files ?? []
        );

        if (archivos.length === 0) {
          return;
        }

        setImagenesServicioGaleria((actuales) =>
          [...actuales, ...archivos].slice(0, 6)
        );

        e.currentTarget.value = "";
      }}
    />
  </label>
  {servicioEditando?.images &&
    servicioEditando.images.length > 0 && (
      <div style={{ marginBottom: "15px" }}>
        <div
          style={{
            color: "#60a5fa",
            fontSize: "12px",
            fontWeight: 700,
            marginBottom: "8px",
          }}
        >
          Imágenes guardadas (
          {Math.min(servicioEditando.images.length, 6)}/6)
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "10px",
          }}
        >
          {servicioEditando.images
            .slice(0, 6)
            .map((imagen) => {
              const archivoNuevo =
                imagenesServicioReemplazo[imagen.id];

              const urlImagen = imagen.url.startsWith("http")
                ? imagen.url
                : `${API_URL}${imagen.url}`;

              return (
                <div
                  key={imagen.id}
                  style={{
                    border: "1px solid #28537c",
                    borderRadius: "8px",
                    padding: "8px",
                    background: "#0b2340",
                  }}
                >
                  {/* PREVISUALIZACIÓN */}
                  <div
                    style={{
                      width: "100%",
                      height: "120px",
                      borderRadius: "6px",
                      overflow: "hidden",
                      background: "#020b16",
                      marginBottom: "8px",
                    }}
                  >
                    <img
                      src={
                        archivoNuevo
                          ? URL.createObjectURL(archivoNuevo)
                          : urlImagen
                      }
                      alt="Imagen del servicio"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>

                  {/* ESTADO */}
                  <div
                    style={{
                      color: archivoNuevo
                        ? "#facc15"
                        : "#22c55e",
                      fontSize: "10px",
                      fontWeight: 700,
                      marginBottom: "6px",
                    }}
                  >
                    {archivoNuevo
                      ? "Nueva imagen seleccionada"
                      : "Imagen guardada"}
                  </div>

                  {/* ARCHIVO ACTUAL */}
                  <div
                    style={{
                      color: "#ffffff",
                      fontSize: "10px",
                      wordBreak: "break-word",
                      minHeight: "30px",
                      marginBottom: "7px",
                    }}
                    title={imagen.url}
                  >
                    Archivo actual:
                    <br />
                    {imagen.url.split("/").pop()}
                  </div>

                  {/* BOTÓN PARA REEMPLAZAR */}
                  <label
                    style={{
                      display: "block",
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "7px",
                      border: "1px solid #2563eb",
                      borderRadius: "6px",
                      background: "#102f55",
                      color: "#ffffff",
                      fontSize: "10px",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    {archivoNuevo
                      ? "Cambiar archivo"
                      : "Seleccionar reemplazo"}

                    <input
                      type="file"
                      accept="image/*"
                      style={{
                        display: "none",
                      }}
                      onChange={(e) => {
                        const archivo =
                          e.target.files?.[0];

                        if (!archivo) {
                          return;
                        }

                        setImagenesServicioReemplazo(
                          (actuales) => ({
                            ...actuales,
                            [imagen.id]: archivo,
                          })
                        );

                        e.currentTarget.value = "";
                      }}
                    />
                  </label>

                  {/* NOMBRE DEL NUEVO ARCHIVO */}
                  {archivoNuevo && (
                    <div
                      style={{
                        marginTop: "7px",
                        color: "#60a5fa",
                        fontSize: "10px",
                        wordBreak: "break-word",
                      }}
                      title={archivoNuevo.name}
                    >
                      Nuevo archivo:
                      <br />
                      {archivoNuevo.name}
                    </div>
                  )}

<button
  type="button"
  onClick={async () => {
    const confirmar = window.confirm(
      "¿Deseas eliminar esta imagen de la galería?"
    );

    if (!confirmar) {
      return;
    }

    try {
      const respuesta = await fetch(
        `${API_URL}/services/${servicioEditando!.id}/images/${imagen.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${obtenerToken()}`,
          },
        }
      );

      if (!respuesta.ok) {
        throw new Error(
          await leerError(
            respuesta,
            "No se pudo eliminar la imagen."
          )
        );
      }

      setServicioEditando((actual) =>
        actual
          ? {
              ...actual,
              images: actual.images.filter(
                (item) => item.id !== imagen.id
              ),
            }
          : actual
      );

      setMensaje("Imagen eliminada correctamente.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la imagen."
      );
    }
  }}
  style={{
    width: "100%",
    marginTop: "7px",
    border: "1px solid #ef4444",
    background: "#7f1d1d",
    color: "#ffffff",
    padding: "7px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: 700,
  }}
>
  🗑️ Eliminar imagen
</button>

                  {/* CANCELAR REEMPLAZO */}
                  {archivoNuevo && (
                    <button
                      type="button"
                      onClick={() => {
                        setImagenesServicioReemplazo(
                          (actuales) => {
                            const copia = {
                              ...actuales,
                            };

                            delete copia[imagen.id];

                            return copia;
                          }
                        );
                      }}
                      style={{
                        width: "100%",
                        marginTop: "7px",
                        border: "1px solid #ef4444",
                        background: "#401b25",
                        color: "#ffffff",
                        padding: "6px",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "10px",
                      }}
                    >
                      Cancelar reemplazo
                    </button>
                  )}
                </div>
              );
            })}
       </div>
      </div>
)}
  </div>
  </div>
</div>
)}
{mostrarFormularioServicio && (
  <div
    style={{
      display: "flex",
      gap: "10px",
      marginTop: "15px",
      flexWrap: "wrap",
    }}
  >
    <button
      type="button"
      onClick={guardarServicioBD}
      disabled={guardando}
      style={{
        flex: 1,
        minWidth: "140px",
        border: 0,
        background: "#16a34a",
        color: "#ffffff",
        padding: "11px 16px",
        borderRadius: "7px",
        cursor: guardando ? "not-allowed" : "pointer",
        fontWeight: 700,
        opacity: guardando ? 0.7 : 1,
      }}
    >
      {guardando ? "Guardando..." : "Guardar servicio"}
    </button>

    <button
      type="button"
      onClick={limpiarFormularioServicio}
      disabled={guardando}
      style={{
        flex: 1,
        minWidth: "140px",
        border: 0,
        background: "#64748b",
        color: "#ffffff",
        padding: "11px 16px",
        borderRadius: "7px",
        cursor: guardando ? "not-allowed" : "pointer",
        fontWeight: 700,
        opacity: guardando ? 0.7 : 1,
      }}
    >
      Cancelar
    </button>
  </div>
)}

{!mostrarFormularioSucursal &&
  !mostrarFormularioServicio && (
  <div
    className="zapea-form-buttons"
    style={styles.botonesFormulario}
  >
    <button
      type="submit"
      disabled={guardando}
      style={styles.guardar}
    >
      {guardando
        ? "Guardando..."
        : mostrarEdicion
          ? "Guardar cambios"
          : "Crear empresa"}
    </button>

    <button
      type="button"
      onClick={limpiarVista}
      disabled={guardando}
      style={styles.cancelar}
    >
      Cancelar
    </button>
  </div>
)}
    </form>
  );

  // =====================================================
// ELIMINAR UNA IMAGEN INDIVIDUAL DE LA GALERÍA
// =====================================================

const eliminarImagenGaleria = async (imageId: string) => {
  if (!empresaSeleccionada?.id) {
    setError("No se encontró la empresa seleccionada.");
    return;
  }

  const confirmar = window.confirm(
    "¿Está seguro de eliminar esta imagen de la galería?"
  );

  if (!confirmar) {
    return;
  }

  try {
    setGuardando(true);
    setMensaje("");
    setError("");

const token = localStorage.getItem("zapea_token");

if (!token) {
  throw new Error("No se encontró el token de acceso.");
}

const respuesta = await fetch(
  `${API_URL}/companies/gallery/${imageId}`,
  {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  }
);

    if (!respuesta.ok) {
      throw new Error(
        await leerError(
          respuesta,
          "No se pudo eliminar la imagen."
        )
      );
    }

    // Quitar inmediatamente la imagen de la pantalla
    setGalleryImages((imagenesActuales) =>
      imagenesActuales.filter(
        (imagen) => imagen.id !== imageId
      )
    );

    setMensaje("Imagen eliminada correctamente.");
  } catch (err) {
    console.error("Error eliminando imagen:", err);

    setError(
      err instanceof Error
        ? err.message
        : "No se pudo eliminar la imagen."
    );
  } finally {
    setGuardando(false);
  }
};

  // ============================================================
  // REEMPLAZAR UNA SOLA IMAGEN DE LA GALERÍA
  // ============================================================

  const reemplazarImagenGaleria = (imageId: string) => {
    const input = document.createElement("input");

    input.type = "file";
    input.accept =
      "image/jpeg,image/jpg,image/png,image/webp";

    input.onchange = async () => {
      const file = input.files?.[0];

      if (!file) {
        return;
      }

      try {
        setGuardando(true);

        const formData = new FormData();
        formData.append("files", file);
        const token = localStorage.getItem("zapea_token");

if (!token) {
  throw new Error("No se encontró el token de acceso.");
}

        const respuesta = await fetch(
          `${API_URL}/companies/gallery/${imageId}/replace`,
{
  method: "PUT",
  headers: {
    Authorization: `Bearer ${obtenerToken()}`,
  },
  body: formData,
}
        );

        if (!respuesta.ok) {
          throw new Error(
            await leerError(
              respuesta,
              "No se pudo reemplazar la imagen"
            )
          );
        }

        const data = await respuesta.json();

setGalleryImages((imagenesActuales) =>
  imagenesActuales.map((imagen) =>
    imagen.id === imageId
      ? {
          ...imagen,
          url:
            data.imagen?.url ??
            data.url ??
            imagen.url,
        }
      : imagen
  )
);

        setMensaje(
          "Imagen reemplazada correctamente"
        );
        setError("");
      } catch (err) {
        console.error(
          "Error reemplazando imagen:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "No se pudo reemplazar la imagen"
        );
      } finally {
        setGuardando(false);
      }
    };

    input.click();
  };

return (
  <div
    style={{
      display: "flex",
      minHeight: "100vh",
      width: "100%",
    }}
  >
    <Sidebar onNavigate={onNavigate} />
{mostrarEstadisticas && estadisticasEmpresa && (
  <div
  onClick={() => {
  setMostrarEstadisticas(false);
  setEstadisticasEmpresa(null);
}}
  style={{
      position: "fixed",
      inset: 0,
      background: "rgba(5, 15, 35, 0.65)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: "20px",
    }}
  >
    <div
    onClick={(e) => e.stopPropagation()}
      style={{
        width: "100%",
        maxWidth: "700px",
        maxHeight: "90vh",
        overflowY: "auto",
        background: "#ffffff",
        borderRadius: "20px",
        padding: "28px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <div
            style={{
              color: "#2563eb",
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "2px",
            }}
          >
            ANALÍTICA ZAPEA
          </div>

          <h2
            style={{
              margin: "6px 0 0",
              color: "#0f172a",
            }}
          >
            Estadísticas de la empresa
          </h2>
        </div>

        <button
          type="button"
          onClick={() => {
            setMostrarEstadisticas(false);
            setEstadisticasEmpresa(null);
          }}
          style={{
            border: 0,
            background: "#fee2e2",
            color: "#dc2626",
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "20px",
            fontWeight: 700,
          }}
        >
          ×
        </button>
      </div>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "10px",
  }}
>
        {[
          {
            nombre: "Vistas de perfil",
            valor: estadisticasEmpresa.resumen?.vistasPerfil ?? 0,
            icono: "👁️",
          },
          {
            nombre: "Vistas de servicio",
            valor: estadisticasEmpresa.resumen?.vistasServicio ?? 0,
            icono: "🛠️",
          },
          {
            nombre: "WhatsApp",
            valor: estadisticasEmpresa.resumen?.whatsapp ?? 0,
            icono: "💬",
          },
          {
            nombre: "Teléfono",
            valor: estadisticasEmpresa.resumen?.telefono ?? 0,
            icono: "📞",
          },
          {
            nombre: "Correo",
            valor: estadisticasEmpresa.resumen?.email ?? 0,
            icono: "✉️",
          },
          {
            nombre: "Mapa",
            valor: estadisticasEmpresa.resumen?.mapa ?? 0,
            icono: "📍",
          },
          {
            nombre: "Facebook",
            valor: estadisticasEmpresa.resumen?.facebook ?? 0,
            icono: "👍",
          },
          {
            nombre: "Interacciones totales",
            valor: estadisticasEmpresa.resumen?.total ?? 0,
            icono: "📊",
          },
        ].map((item) => (
          <div
            key={item.nombre}
style={{
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "12px 8px",
  background: "#f8fafc",
  textAlign: "center",
  minHeight: "105px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  boxSizing: "border-box",
}}
          >
            <div style={{ fontSize: "24px" }}>
              {item.icono}
            </div>

            <div
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#0f172a",
                marginTop: "6px",
              }}
            >
              {item.valor}
            </div>

            <div
              style={{
                color: "#64748b",
                fontSize: "13px",
                marginTop: "4px",
              }}
            >
              {item.nombre}
            </div>
          </div>
        ))}
      </div>
{/* RENDIMIENTO DE LA EMPRESA */}
<div
  style={{
    marginTop: "24px",
    padding: "22px",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    background: "#ffffff",
  }}
>
  <div style={{ textAlign: "center", marginBottom: "18px" }}>
    <div
      style={{
        color: "#2563eb",
        fontSize: "13px",
        fontWeight: 800,
        letterSpacing: "2px",
        textTransform: "uppercase",
      }}
    >
      Rendimiento de la empresa
    </div>

    <h2
      style={{
        margin: "8px 0 6px",
        color: "#0f172a",
        fontSize: "28px",
      }}
    >
      Rendimiento en ZAPEA
    </h2>

    <p
      style={{
        margin: 0,
        color: "#64748b",
        fontSize: "14px",
      }}
    >
      Resumen del comportamiento de los visitantes.
    </p>
  </div>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "10px",
  }}
>
    {[
      {
        icono: "📊",
        valor:
          estadisticasEmpresa?.resumen?.total ??
          estadisticasEmpresa?.total ??
          0,
        nombre: "Interacciones totales",
      },
      {
        icono: "👁️",
        valor:
          estadisticasEmpresa?.resumen?.vistasPerfil ??
          estadisticasEmpresa?.vistasPerfil ??
          0,
        nombre: "Vistas de perfil",
      },
      {
  icono: "👥",
  valor:
    estadisticasEmpresa?.resumen?.visitantesUnicos ?? 0,
  nombre: "Visitantes únicos",
},
      {
        icono: "🛠️",
        valor:
          estadisticasEmpresa?.resumen?.vistasServicio ??
          estadisticasEmpresa?.vistasServicio ??
          0,
        nombre: "Vistas de servicios",
      },
{
  icono: "📞",
  valor:
    (estadisticasEmpresa?.resumen?.telefono ?? 0) +
    (estadisticasEmpresa?.resumen?.whatsapp ?? 0) +
    (estadisticasEmpresa?.resumen?.email ?? 0) +
    (estadisticasEmpresa?.resumen?.mapa ?? 0) +
    (estadisticasEmpresa?.resumen?.facebook ?? 0),
  nombre: "Acciones de contacto",
},
{
  icono: "🎯",
  valor: `${
    estadisticasEmpresa?.resumen?.tasaConversion ?? 0
  }%`,
  nombre: "Tasa de conversión",
},
    ].map((item) => (
<div
  style={{
    padding: "12px 8px",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    background: "#f8fafc",
    textAlign: "center",
    minHeight: "105px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    boxSizing: "border-box",
  }}
>
        <div style={{ fontSize: "22px", marginBottom: "3px" }}>
          {item.icono}
        </div>

        <div
          style={{
            fontSize: "24px",
            fontWeight: 800,
            color: "#0f172a",
          }}
        >
          {item.valor}
        </div>

        <div
          style={{
            marginTop: "6px",
            color: "#64748b",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          {item.nombre}
        </div>
      </div>
    ))}
  </div>
</div>
      <div style={{ marginTop: "24px" }}>
        <h3
          style={{
            color: "#0f172a",
            marginBottom: "14px",
          }}
        >
          🔥 Servicios más vistos
        </h3>

{Array.isArray(estadisticasEmpresa?.serviciosMasVistos) &&
estadisticasEmpresa.serviciosMasVistos.length > 0 ? (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    }}
  >
{estadisticasEmpresa.serviciosMasVistos.map(
  (servicio: any, index: number) => {
    const totalVistas =
      estadisticasEmpresa?.resumen?.vistasServicio ?? 0;

    const porcentaje =
      totalVistas > 0
        ? Math.round((servicio.vistas / totalVistas) * 100)
        : 0;

    const etiquetaRanking =
      index === 0
        ? "🔥 Más consultado"
        : index === 1
        ? "🥈 Segundo más consultado"
        : index === 2
        ? "🥉 Tercer más consultado"
        : `${index + 1}.° más consultado`;

    return (
      <div
        key={servicio.serviceId}
style={{
  display: "flex",
  alignItems: "center",
  gap: "16px",
  padding: "16px 18px",
  border: "1px solid #dbe4f0",
  borderRadius: "14px",
  background: index === 0 ? "#ffffff" : "#f8fafc",
  marginBottom: "10px",
  boxShadow:
    index === 0
      ? "0 4px 12px rgba(37, 99, 235, 0.08)"
      : "0 2px 8px rgba(15, 23, 42, 0.04)",
  transition: "all 0.2s ease",
}}
      >
        {/* Ranking */}
        <div
          style={{
            width: "32px",
            height: "32px",
            minWidth: "32px",
            borderRadius: "9px",
            display: "flex",
alignItems: "center",
justifyContent: "center",
background:
  index === 0
    ? "linear-gradient(135deg, #2563eb, #7c3aed)"
    : index === 1
    ? "linear-gradient(135deg, #cbd5e1, #94a3b8)"
    : index === 2
    ? "linear-gradient(135deg, #f59e0b, #d97706)"
    : "#f1f5f9",
            color:
              index === 0
                ? "#ffffff"
                : index === 1
                ? "#334155"
                : "#64748b",
            fontSize: "15px",
            fontWeight: 800,
            border:
              index === 0
                ? "none"
                : "1px solid #cbd5e1",
          }}
        >
          {index === 0
            ? "🥇"
            : index === 1
            ? "🥈"
            : index === 2
            ? "🥉"
            : index + 1}
        </div>

        {/* Información del servicio */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
<div
  style={{
    fontWeight: 800,
    color: "#0f172a",
    fontSize: "14px",
    lineHeight: 1.2,
    maxWidth: "260px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }}
>
  {servicio.nombre}
</div>

<span
  style={{
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "9px",
    fontWeight: 700,
    color:
      index === 0
        ? "#ea580c"
        : index === 1
        ? "#475569"
        : "#64748b",
    background:
      index === 0
        ? "#fff7ed"
        : index === 1
        ? "#f1f5f9"
        : "#f8fafc",
    border:
      index === 0
        ? "1px solid #fed7aa"
        : "1px solid #cbd5e1",
    borderRadius: "999px",
    padding: "4px 8px",
    whiteSpace: "nowrap",
    lineHeight: 1,
  }}
>
  {etiquetaRanking}
</span>
          </div>

          {/* Barra de progreso */}
          <div
            style={{
              width: "100%",
              height: "6px",
              background: "#e2e8f0",
              borderRadius: "999px",
              overflow: "hidden",
              marginTop: "10px",
            }}
          >
            <div
              style={{
                width: `${Math.min(porcentaje, 100)}%`,
                height: "100%",
                background:
                  index === 0
                    ? "linear-gradient(90deg, #2563eb, #4f46e5)"
                    : "#4169e8",
                borderRadius: "999px",
                transition: "width 0.4s ease",
              }}
            />
          </div>

          <div
            style={{
              marginTop: "6px",
              fontSize: "9px",
              color: "#64748b",
            }}
          >
            {porcentaje}% del total
          </div>
        </div>

        {/* Número de vistas */}
        <div
          style={{
            minWidth: "55px",
            textAlign: "right",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: 900,
              color: index === 0 ? "#1d4ed8" : "#2563eb",
              lineHeight: 1,
            }}
          >
            {servicio.vistas}
          </div>

          <div
            style={{
              marginTop: "5px",
              fontSize: "9px",
              color: "#64748b",
            }}
          >
            vistas
          </div>
        </div>
      </div>
    );
  }
)}
  </div>
) : (
  <div
    style={{
      padding: "24px",
      textAlign: "center",
      border: "1px solid #e2e8f0",
      borderRadius: "14px",
      background: "#f8fafc",
      color: "#64748b",
      fontSize: "13px",
    }}
  >
    Aún no hay vistas de servicios.
  </div>
)}
{/* ESTADÍSTICAS POR SUCURSAL */}
<div style={{ marginTop: "24px" }}>
  <h3
    style={{
      color: "#0f172a",
      marginBottom: "14px",
    }}
  >
    🏢 Estadísticas por sucursal
  </h3>

  {Array.isArray(
    estadisticasEmpresa?.estadisticasSucursales
  ) &&
  estadisticasEmpresa.estadisticasSucursales.length > 0 ? (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {estadisticasEmpresa.estadisticasSucursales.map(
        (sucursal: any) => (
          <div
            key={sucursal.sucursalId}
            style={{
              border: "1px solid #dbe4f0",
              borderRadius: "14px",
              padding: "16px",
              background: "#f8fafc",
            }}
          >
            {/* NOMBRE DE LA SUCURSAL */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                🏢 {sucursal.nombre}
              </div>

              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#2563eb",
                  background: "#eff6ff",
                  padding: "6px 10px",
                  borderRadius: "8px",
                  whiteSpace: "nowrap",
                }}
              >
                {sucursal.total ?? 0} interacciones
              </div>
            </div>

            {/* ESTADÍSTICAS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "8px",
              }}
            >
              {[
                {
                  icono: "👁️",
                  nombre: "Perfil",
                  valor: sucursal.vistasPerfil ?? 0,
                },
                {
                  icono: "🛠️",
                  nombre: "Servicios",
                  valor: sucursal.vistasServicio ?? 0,
                },
                {
                  icono: "💬",
                  nombre: "WhatsApp",
                  valor: sucursal.whatsapp ?? 0,
                },
                {
                  icono: "📞",
                  nombre: "Teléfono",
                  valor: sucursal.telefono ?? 0,
                },
                {
                  icono: "✉️",
                  nombre: "Correo",
                  valor: sucursal.email ?? 0,
                },
                {
                  icono: "📍",
                  nombre: "Mapa",
                  valor: sucursal.mapa ?? 0,
                },
                {
                  icono: "👍",
                  nombre: "Facebook",
                  valor: sucursal.facebook ?? 0,
                },
              ].map((item) => (
                <div
                  key={item.nombre}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    padding: "10px",
                    borderRadius: "10px",
                    background: "#ffffff",
                    border:
                      "1px solid #e2e8f0",
                  }}
                >
                  <span
                    style={{
                      color: "#64748b",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {item.icono} {item.nombre}
                  </span>

                  <span
                    style={{
                      color: "#0f172a",
                      fontSize: "16px",
                      fontWeight: 800,
                    }}
                  >
                    {item.valor}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  ) : (
    <div
      style={{
        padding: "24px",
        textAlign: "center",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        background: "#f8fafc",
        color: "#64748b",
        fontSize: "13px",
      }}
    >
      Aún no hay interacciones registradas por sucursal.
    </div>
  )}
</div>
      </div>
    </div>
  </div>
)}
    <div
      style={{
        flex: 1,
        minWidth: 0,
        width: "100%",
      }}
    >
      <div
  className="zapea-admin-page"
  style={styles.pagina}
>

        <div style={styles.contenedor}>
<header
  className="zapea-empresas-header"
  style={{
    marginBottom: "18px",
  }}
>
<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "12px",
    paddingLeft: "0",
justifyContent: "center",
textAlign: "center",
    position: "relative",
    top: "0",
  }}
>
  <div>
    <h1
      style={{
        margin: 0,
        fontSize: "26px",
        lineHeight: 1.1,
        fontWeight: 900,
        color: "#111827",
      }}
    >
      {usuarioActual?.role === "EMPRESA" ? "Mi empresa" : "Empresas"}
    </h1>

    <div
      style={{
        marginTop: "4px",
        color: "#2563eb",
        fontSize: "11px",
        fontWeight: 900,
        letterSpacing: "1.8px",
        textTransform: "uppercase",
      }}
    >
      ZAPEA
    </div>
  </div>
</div>

  <p
    style={{
      margin: "8px 0 16px",
      color: "#64748b",
      fontSize: "14px",
      lineHeight: 1.45,
    }}
  >
    {usuarioActual?.role === "EMPRESA"
  ? "Gestiona tu empresa desde un solo lugar."
  : "Gestiona tus empresas desde un solo lugar."}
  </p>

{usuarioActual?.role === "ADMIN" && (
  <button
    type="button"
    onClick={abrirNuevaEmpresa}
    className="zapea-nueva-empresa"
    style={{
      display: "block",
      width: "100%",
      maxWidth: "320px",
      margin: "0 auto",
      border: 0,
      background:
        "linear-gradient(135deg, #2563eb, #1769ff)",
      color: "#fff",
      padding: "13px 18px",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: 800,
      fontSize: "14px",
      textAlign: "center",
      boxShadow:
        "0 8px 22px rgba(37,99,235,.20)",
    }}
  >
    ＋ Nueva empresa
  </button>
)}
</header>

        {mensaje && <div style={styles.mensaje}>{mensaje}</div>}
        {error && <div style={styles.error}>{error}</div>}

        {mostrarFormulario && formularioEmpresa}
        {mostrarEdicion && formularioEmpresa}

        {mostrarDetalle && empresaSeleccionada && (
  <section style={styles.detalle}>
    <div style={styles.detalleHeader}>
      <div>
        <div style={styles.perfil}>PERFIL EMPRESARIAL</div>

        <h2 style={styles.detalleTitulo}>
          {empresaSeleccionada.name}
        </h2>
      </div>

      <button
        onClick={limpiarVista}
        style={styles.cerrar}
      >
        ✕
      </button>
    </div>

    {(empresaSeleccionada.portadaUrl || empresaSeleccionada.logoUrl) && (
      <div
        style={{
          ...styles.portada,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundImage: empresaSeleccionada.portadaUrl
            ? `url(${
                empresaSeleccionada.portadaUrl.startsWith("http")
                  ? empresaSeleccionada.portadaUrl
                  : `${API_URL}${empresaSeleccionada.portadaUrl}`
              })`
            : undefined,
        }}
      >
        {empresaSeleccionada.logoUrl ? (
          <img
            src={
              empresaSeleccionada.logoUrl.startsWith("http")
                ? empresaSeleccionada.logoUrl
                : `${API_URL}${empresaSeleccionada.logoUrl}`
            }
            alt={`Logo de ${empresaSeleccionada.name}`}
            style={styles.logoDetalle}
          />
        ) : (
          <div style={styles.logoPlaceholder}>Z</div>
        )}
      </div>
    )}

{/* GALERÍA NUEVA */}
{galleryImages.length > 0 && (
  <div
    style={{
      marginTop: "20px",
      marginBottom: "20px",
    }}
  >
    <div
      style={{
        fontSize: "13px",
        fontWeight: 700,
        color: "#333",
        marginBottom: "10px",
        textAlign: "center",
      }}
    >
      Galería de imágenes
    </div>

    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        justifyContent: "center",
      }}
    >
{galleryImages.map((imagen, index) => (
  <React.Fragment key={imagen.id ?? index}>
    <img
      src={`${API_URL}${imagen.url}`}
      alt={`Imagen ${index + 1}`}
      style={{
        width: "140px",
        height: "100px",
        objectFit: "cover",
        borderRadius: "8px",
        border: "1px solid #ddd",
        cursor: "pointer",
      }}
      onClick={() => {
        window.open(
          `${API_URL}${imagen.url}`,
          "_blank"
        );
      }}
    />

  </React.Fragment>
))}
    </div>
  </div>
)}

            <div style={styles.detalleGrid}>
              <Detalle label="Nombre" valor={empresaSeleccionada.name} />
              <Detalle label="Categoría" valor={empresaSeleccionada.categoria || "No registrada"} />
              <Detalle label="RUC" valor={empresaSeleccionada.ruc || "No registrado"} />
              <Detalle label="Teléfono" valor={empresaSeleccionada.phone || "No registrado"} />
              <Detalle label="WhatsApp" valor={empresaSeleccionada.whatsapp || "No registrado"} />
              <Detalle label="Correo" valor={empresaSeleccionada.email || "No registrado"} />
              <Detalle label="Dirección" valor={empresaSeleccionada.address || "No registrada"} />
            </div>

            <div style={styles.descripcionDetalle}>
              <span style={styles.detalleLabel}>Descripción</span>
              <p style={{ margin: 0 }}>
                {empresaSeleccionada.description || "Sin descripción registrada."}
              </p>
            </div>

<h3 style={styles.contactar}>Contactar empresa</h3>

<div style={styles.accionesComerciales}>
  <button
    type="button"
    style={styles.llamar}
    onClick={() => llamarEmpresa(empresaSeleccionada)}
  >
    📞 Llamar
  </button>

  <button
    type="button"
    style={styles.whatsapp}
    onClick={() => abrirWhatsApp(empresaSeleccionada)}
  >
    🟢 WhatsApp
  </button>

  <button
    type="button"
    style={styles.correo}
    onClick={() => abrirCorreo(empresaSeleccionada)}
  >
    ✉️ Correo
  </button>

  <button
    type="button"
    style={styles.ubicacion}
    onClick={() => abrirUbicacion(empresaSeleccionada)}
  >
    📍 Ubicación
  </button>

  {empresaSeleccionada.facebook && (
    <button
      type="button"
      style={styles.facebook}
      onClick={() => abrirFacebook(empresaSeleccionada)}
    >
      🔵 Facebook
    </button>
  )}
</div>
          </section>
        )}

{usuarioActual?.role === "ADMIN" && (
  <section
    className="zapea-filtros"
    style={styles.filtros}
  >
    <input
      style={styles.buscar}
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
      placeholder="🔎 Buscar empresas..."
    />

    <select
      style={styles.filtroCategoria}
      value={filtroCategoria}
      onChange={(e) => setFiltroCategoria(e.target.value)}
    >
      <option value="">Todas las categorías</option>
      {CATEGORIAS.map((categoria) => (
        <option key={categoria} value={categoria}>
          {categoria}
        </option>
      ))}
    </select>
  </section>
)}

{usuarioActual?.role === "ADMIN" && (
  <div style={styles.contador}>
    {cargando
      ? ""
      : `${empresasFiltradas.length} ${
          empresasFiltradas.length === 1
            ? "empresa encontrada"
            : "empresas encontradas"
        }`}
  </div>
)}

{/* =====================================================
    VISTA RESPONSIVE DE EMPRESAS
    ===================================================== */}

<style>
  {`
    .zapea-tabla-empresas {
      display: block;
    }

    .zapea-cards-empresas {
      display: none;
    }

.zapea-ocultar-tabla-empresa {
  display: none !important;
}

/* =========================================================
   EMPRESAS — TARJETAS PARA ADMIN EN PC / TABLET
   ========================================================= */

@media (min-width: 769px) {

  /* Ocultar tabla tradicional */
  .zapea-tabla-empresas {
    display: none !important;
  }

  /* Mostrar empresas como tarjetas */
.zapea-admin-cards-empresas {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;

  align-items: stretch;
}

.zapea-admin-cards-empresas .zapea-empresa-card {
  height: 100% !important;
  min-height: 250px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
}

.zapea-admin-cards-empresas
.zapea-empresa-acciones {
  margin-top: auto !important;

  display: flex !important;
  justify-content: center !important;
  align-items: center !important;

  width: 100% !important;
  gap: 14px !important;
}

  /* Tarjeta */
  .zapea-admin-cards-empresas .zapea-empresa-card {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;

    background: linear-gradient(
      180deg,
      #ffffff 0%,
      #fbfdff 100%
    );

    border: 1px solid #e6edf5;
    border-radius: 18px;

    padding: 20px;

    box-shadow:
      0 8px 24px rgba(15, 23, 42, 0.06),
      0 2px 6px rgba(15, 23, 42, 0.04);

    overflow: hidden;
  }

  /* Línea superior */
  .zapea-admin-cards-empresas
  .zapea-empresa-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;

    background: linear-gradient(
      90deg,
      #2563eb,
      #60a5fa
    );
  }

  /* Panel donde actualmente está portada + logo */
  .zapea-admin-cards-empresas
  .zapea-panel-portada {
    position: absolute !important;

    top: 20px !important;
    left: 20px !important;

    width: 52px !important;
    height: 52px !important;

    margin: 0 !important;

    overflow: visible !important;

    z-index: 5;
  }

  /* En ADMIN no necesitamos mostrar la portada grande */
  .zapea-admin-cards-empresas
  .zapea-panel-portada > img:not(.zapea-logo-portada) {
    display: none !important;
  }

  /* Logo */
  .zapea-admin-cards-empresas
  .zapea-logo-portada {
    position: static !important;

    width: 52px !important;
    height: 52px !important;

    min-width: 52px !important;
    min-height: 52px !important;

    max-width: 52px !important;
    max-height: 52px !important;

    transform: none !important;

    border: 3px solid #ffffff !important;
    border-radius: 12px !important;

    object-fit: cover !important;

    box-shadow:
      0 4px 12px rgba(15, 23, 42, 0.12);
  }

  /* Logo cuando no existe */
  .zapea-admin-cards-empresas
  .zapea-logo-portada-placeholder {
    position: static !important;

    width: 52px !important;
    height: 52px !important;

    transform: none !important;

    border-radius: 12px !important;
  }

  /* Cabecera */
  .zapea-admin-cards-empresas
  .zapea-empresa-card-header {
    display: flex;
    align-items: center;
    justify-content: flex-start;

    width: 100%;
    min-height: 58px;

    padding-left: 68px;
    box-sizing: border-box;

    text-align: left;
  }

  /* Nombre */
  .zapea-admin-cards-empresas
  .zapea-empresa-nombre {
    font-size: 17px;
    font-weight: 850;
    color: #0f172a;
    line-height: 1.25;
  }

  /* Categoría */
  .zapea-admin-cards-empresas
  .zapea-empresa-categoria {
    display: inline-block;

    margin-top: 6px;

    background: #eff6ff;
    color: #2563eb;

    padding: 5px 9px;

    border-radius: 999px;

    font-size: 10px;
    font-weight: 800;
  }

  /* Descripción */
  .zapea-admin-cards-empresas
  .zapea-empresa-descripcion {
    margin-top: 12px;

    color: #64748b;
    font-size: 13px;
    line-height: 1.45;

    text-align: left;
  }

  /* Datos */
  .zapea-admin-cards-empresas
  .zapea-empresa-datos {
    display: flex !important;
    flex-direction: column !important;

    align-items: flex-start !important;
    justify-content: flex-start !important;

    width: 100% !important;

    gap: 8px !important;

    margin-top: 14px !important;
    padding-top: 13px !important;

    border-top: 1px solid #edf1f6;
  }

  .zapea-admin-cards-empresas
  .zapea-empresa-dato {
    display: flex;

    align-items: baseline;

    gap: 5px;

    width: 100%;

    font-size: 12px;
    line-height: 1.4;

    color: #64748b;

    word-break: break-word;
  }

  .zapea-admin-cards-empresas
  .zapea-empresa-dato strong {
    color: #1e293b;
    font-weight: 800;
    flex-shrink: 0;
  }

  /* Acciones */
  .zapea-admin-cards-empresas
  .zapea-empresa-acciones {
    display: flex;

    justify-content: flex-start;
    align-items: center;

    flex-wrap: wrap;

    gap: 9px;

    width: 100%;

    margin-top: 16px;
    padding-top: 13px;

    border-top: 1px solid #edf1f6;
  }
}


@media (min-width: 769px) {

  .zapea-mostrar-card-empresa {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
  }

  .zapea-mostrar-card-empresa .zapea-empresa-card {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    grid-template-rows: auto auto auto;
    column-gap: 32px;

    padding: 28px 32px;
    min-height: 250px;
    box-sizing: border-box;
  }

.zapea-mostrar-card-empresa
.zapea-empresa-card-header {
  grid-column: 1 / -1;

  justify-content: flex-start;
  align-items: center;
  gap: 24px;

  min-height: 100px;
}

.zapea-mostrar-card-empresa
.zapea-empresa-logo {
  width: 100px !important;
  height: 100px !important;
  min-width: 100px !important;
  min-height: 100px !important;
  max-width: 100px !important;
  max-height: 100px !important;

  border-radius: 18px;
  object-fit: cover;
  flex-shrink: 0;
}

  .zapea-mostrar-card-empresa
  .zapea-empresa-nombre {
    font-size: 22px;
    font-weight: 900;
  }

  .zapea-mostrar-card-empresa
  .zapea-empresa-descripcion {
    grid-column: 1 / -1;

    margin-top: 8px;
    padding-bottom: 18px;

    text-align: left;
    font-size: 14px;
  }

  .zapea-mostrar-card-empresa
  .zapea-empresa-datos {
    grid-column: 1;

    margin-top: 0;
    padding-top: 18px;

    justify-content: flex-start;
    align-content: center;

    border-top: 1px solid #edf1f6;

    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .zapea-mostrar-card-empresa
  .zapea-empresa-acciones {
    grid-column: 2;

    margin-top: 0;
    padding-top: 18px;

    border-top: 1px solid #edf1f6;

    justify-content: flex-end;
    align-self: center;
  }

}

@media (min-width: 769px) {
  .zapea-mostrar-card-empresa {
    display: flex !important;
    flex-direction: column;
    gap: 14px;
    width: 100%;
    max-width: none;
    margin: 0 auto;
  }
}

.zapea-mostrar-card-empresa .zapea-empresa-card {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  box-sizing: border-box;

  background: linear-gradient(
    180deg,
    #ffffff 0%,
    #fbfdff 100%
  );

  border-radius: 18px;
  padding: 24px;

  border: 1px solid #e6edf5;

  box-shadow:
    0 10px 30px rgba(15, 23, 42, 0.07),
    0 2px 8px rgba(15, 23, 42, 0.04);

  overflow: hidden;
}

.zapea-mostrar-card-empresa .zapea-empresa-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;

  height: 4px;

  background: linear-gradient(
    90deg,
    #2563eb,
    #60a5fa
  );
}

.zapea-mostrar-card-empresa .zapea-empresa-card-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 18px;

  width: 100%;
  min-height: 70px;
}

.zapea-mostrar-card-empresa .zapea-empresa-logo {
  width: 72px !important;
  height: 72px !important;
  min-width: 72px !important;
  min-height: 72px !important;
  max-width: 72px !important;
  max-height: 72px !important;

  object-fit: cover;
  border-radius: 16px;
  flex-shrink: 0;
}

.zapea-mostrar-card-empresa .zapea-empresa-nombre {
  font-size: 21px;
  font-weight: 850;
  color: #0f172a;
  line-height: 1.25;
}

.zapea-mostrar-card-empresa .zapea-empresa-categoria {
  display: inline-block;
  margin-top: 7px;

  background: #eff6ff;
  color: #2563eb;

  padding: 6px 11px;
  border-radius: 999px;

  font-size: 11px;
  font-weight: 800;
}

.zapea-mostrar-card-empresa .zapea-empresa-descripcion {
  margin-top: 18px;
  text-align: center;

  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
}

.zapea-mostrar-card-empresa .zapea-empresa-datos {
  margin-top: 18px;
  padding-top: 16px;

  border-top: 1px solid #edf1f6;

  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px 28px;
}

.zapea-mostrar-card-empresa .zapea-empresa-dato {
  font-size: 13px;
  color: #64748b;
}

.zapea-mostrar-card-empresa .zapea-empresa-acciones {
  margin-top: 18px;
  padding-top: 16px;

  border-top: 1px solid #edf1f6;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;

  width: 100%;
}

    @media (max-width: 768px) {
      .zapea-tabla-empresas {
        display: none;
      }
.zapea-filtros {
  grid-template-columns: 1fr !important;
  gap: 10px !important;
}

.zapea-filtros input,
.zapea-filtros select {
  width: 100% !important;
  min-width: 0 !important;
}

      .zapea-cards-empresas {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

.zapea-empresa-card {
  position: relative;

  background:
    linear-gradient(
      180deg,
      #ffffff 0%,
      #fbfdff 100%
    );

  border-radius: 18px;
  padding: 16px;

  border: 1px solid #e6edf5;

  box-shadow:
    0 10px 30px rgba(15, 23, 42, 0.07),
    0 2px 8px rgba(15, 23, 42, 0.04);

  overflow: hidden;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}
.zapea-empresa-card::before {
  content: "";
  position: absolute;

  top: 0;
  left: 0;
  right: 0;

  height: 3px;

  background:
    linear-gradient(
      90deg,
      #2563eb,
      #60a5fa
    );
    }
    .zapea-mostrar-card-empresa .zapea-empresa-card-header {
  position: relative;
  padding-top: 82px;
}

.zapea-mostrar-card-empresa .zapea-empresa-logo {
  position: absolute !important;
  top: -50px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  width: 90px !important;
  height: 90px !important;
  min-width: 90px !important;
  min-height: 90px !important;
  max-width: 90px !important;
  max-height: 90px !important;
  z-index: 20 !important;
}


/* =========================================================
   PORTADA — PANEL DE PROPIETARIO
   ========================================================= */

.zapea-panel-portada {
  display: block;
}

@media (min-width: 769px) {

  .zapea-mostrar-card-empresa .zapea-panel-portada {
    display: block;

grid-column: 1 / 3 !important;
width: 100% !important;
height: 180px !important;
margin: 0 0 16px !important;

    overflow: hidden;

    border-radius: 0 0 18px 18px;

    position: relative;
  }

  .zapea-mostrar-card-empresa .zapea-panel-portada > img:not(.zapea-logo-portada) {
    width: 100%;
    height: 100%;

    display: block;

    object-fit: contain;
    object-position: center 100%;
  }

}
  .zapea-mostrar-card-empresa .zapea-logo-portada {
    left: 50% !important;
    bottom: -45px !important;
    transform: translateX(-50%) !important;
  }
@media (max-width: 768px) {

  .zapea-mostrar-card-empresa .zapea-panel-portada {
    width: 100% !important;
    height: 155px !important;
    margin: 0 0 45px !important;
    position: relative;
    overflow: visible;
    border-radius: 18px;
  }

  .zapea-mostrar-card-empresa .zapea-panel-portada > img:not(.zapea-logo-portada) {
    width: 100% !important;
    height: 155px !important;
    display: block;
    object-fit: cover !important;
    object-position: center center !important;
  }

.zapea-mostrar-card-empresa .zapea-logo-portada {
  left: 50% !important;
  bottom: -45px !important;
  transform: translateX(-50%) !important;
  width: 78px !important;
  height: 78px !important;
}

}

.zapea-empresa-card-header {
  position: relative;
  width: 100%;
  min-height: 58px;

  display: flex;
  align-items: center;
  justify-content: center;
}

.zapea-empresa-logo {
width: 100px;
height: 100px;
  border-radius: 14px;
  object-fit: cover;

  border: 1px solid #e2e8f0;

  box-shadow:
    0 4px 12px rgba(15, 23, 42, 0.08);

  flex-shrink: 0;
}

.zapea-empresa-card-header > div:last-child {
  min-width: 0;
  flex: 1;
  text-align: left;
}
      .zapea-empresa-logo-placeholder {
        width: 58px;
        height: 58px;
        border-radius: 12px;
        background: #eff6ff;
        color: #2563eb;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: 800;
        flex-shrink: 0;
      }

.zapea-empresa-nombre {
  font-size: 16px;
  font-weight: 850;
  color: #0f172a;
  line-height: 1.25;
  letter-spacing: -0.15px;
}

.zapea-empresa-categoria {
  display: inline-block;
  margin-top: 6px;

  background: #eff6ff;
  color: #2563eb;

  padding: 5px 9px;
  border-radius: 999px;

  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.2px;
}

      .zapea-empresa-descripcion {
        margin-top: 12px;
        color: #64748b;
        font-size: 13px;
        line-height: 1.45;
      }

.zapea-empresa-datos {
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  justify-content: flex-start !important;
  width: 100% !important;
  gap: 8px !important;
  margin-top: 14px !important;
  padding-top: 13px !important;
}

.zapea-empresa-dato {
  display: flex;
  align-items: baseline;
  gap: 5px;

  font-size: 12px;
  color: #64748b;
  line-height: 1.4;

  word-break: break-word;
}

.zapea-empresa-dato strong {
  color: #1e293b;
  font-weight: 800;
  flex-shrink: 0;
}

.zapea-empresa-acciones {
  margin-top: 16px;
  padding-top: 13px;

  border-top: 1px solid #edf1f6;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;

  width: 100%;
  flex-wrap: wrap;
}

/* =========================================================
   ACCIONES DEL PANEL DE PROPIETARIO — PC
   ========================================================= */

@media (min-width: 769px) {

  .zapea-panel-propietario-acciones {
    grid-column: 2;
    margin-top: 0 !important;
    padding-top: 18px !important;
    border-top: 1px solid #e8eef5;

    display: flex !important;
    justify-content: flex-end !important;
    align-items: center;

    gap: 10px !important;
    min-height: 64px;
  }

  .zapea-panel-propietario-acciones
  .zapea-empresa-accion {
width: 34px !important;
height: 34px !important;
min-width: 34px !important;
min-height: 34px !important;

    padding: 0 !important;
    margin: 0 !important;

    border: none !important;
    outline: none !important;

    border-radius: 6px !important;

    display: flex !important;
    align-items: center !important;
    justify-content: center !important;

   font-size: 16px !important;
    line-height: 1 !important;

    cursor: pointer;

    box-shadow:
      0 3px 8px rgba(15, 23, 42, 0.08);

    transition:
      transform 0.18s ease,
      box-shadow 0.18s ease,
      filter 0.18s ease;
  }

  .zapea-panel-propietario-acciones
  .zapea-empresa-accion:hover {
    transform: translateY(-2px);
    filter: brightness(1.03);

    box-shadow:
      0 7px 16px rgba(15, 23, 42, 0.13);
  }

  .zapea-panel-propietario-acciones
  .zapea-empresa-accion:active {
    transform: scale(0.94);
  }

  .zapea-panel-propietario-acciones
  .zapea-empresa-accion:focus {
    outline: none !important;
  }
}

.zapea-empresa-accion {
  position: relative;

  width: 42px;
  height: 42px;
  min-width: 42px;

  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 12px;

  cursor: pointer;

  font-size: 17px;

  display: flex;
  align-items: center;
  justify-content: center;

  box-shadow:
    0 3px 8px rgba(15, 23, 42, 0.06);

  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}
.zapea-empresa-accion:hover {
  transform: translateY(-2px);

  box-shadow:
    0 7px 14px rgba(15, 23, 42, 0.12);
}

.zapea-empresa-accion:active {
  transform: scale(0.95);
}

.zapea-empresa-accion::after {
  content: attr(data-tooltip);
  position: absolute;
  left: 50%;
  bottom: calc(100% + 8px);
  transform: translate(-50%, 4px);
  background: #1f2937;
  color: #ffffff;
  padding: 5px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
  z-index: 50;
}

.zapea-empresa-accion:hover::after,
.zapea-empresa-accion:focus-visible::after,
.zapea-empresa-accion:active::after {
  opacity: 1;
  visibility: visible;
  transform: translate(-50%, 0);
}

/* =========================================================
   AJUSTE EXCLUSIVO PARA CELULAR
   ========================================================= */
@media (max-width: 768px) {

  .zapea-mostrar-card-empresa .zapea-empresa-card {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
    padding: 16px !important;
    box-sizing: border-box !important;
    overflow: visible !important;
  }

  .zapea-mostrar-card-empresa .zapea-panel-portada {
    width: 100% !important;
    height: 155px !important;
    margin: 0 0 45px !important;
    position: relative !important;
    overflow: visible !important;
    border-radius: 18px !important;
  }

  .zapea-mostrar-card-empresa
  .zapea-panel-portada > img:not(.zapea-logo-portada) {
    width: 100% !important;
    height: 155px !important;
    object-fit: cover !important;
    object-position: center !important;
    display: block !important;
  }

  .zapea-mostrar-card-empresa .zapea-logo-portada {
    left: 50% !important;
    bottom: -45px !important;
    transform: translateX(-50%) !important;
    width: 78px !important;
    height: 78px !important;
  }

  .zapea-mostrar-card-empresa .zapea-empresa-card-header {
    display: block !important;
    width: 100% !important;
    min-height: auto !important;
    padding-top: 0 !important;
    text-align: left !important;
  }

  .zapea-mostrar-card-empresa
  .zapea-empresa-card-header > div:last-child {
    width: 100% !important;
    margin-top: 0 !important;
    text-align: left !important;
  }

  .zapea-mostrar-card-empresa .zapea-empresa-descripcion {
    width: 100% !important;
    margin-top: 12px !important;
    text-align: left !important;
  }

  .zapea-mostrar-card-empresa .zapea-empresa-datos {
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    justify-content: flex-start !important;
    width: 100% !important;
    margin-top: 14px !important;
    padding-top: 13px !important;
    gap: 8px !important;
    border-top: 1px solid #edf1f6 !important;
  }

  .zapea-mostrar-card-empresa .zapea-empresa-dato {
    width: 100% !important;
    font-size: 12px !important;
  }

  .zapea-mostrar-card-empresa .zapea-empresa-acciones {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    width: 100% !important;
    margin-top: 16px !important;
    padding-top: 13px !important;
    gap: 7px !important;
    border-top: 1px solid #edf1f6 !important;
    flex-wrap: wrap !important;
  }

  .zapea-mostrar-card-empresa
  .zapea-empresa-accion {
    width: 34px !important;
    height: 34px !important;
    min-width: 34px !important;
    min-height: 34px !important;
    padding: 0 !important;
    margin: 0 !important;
    border-radius: 6px !important;
    font-size: 16px !important;
  }

}

    }
  `}
</style>

{cargando ? (
  <div style={styles.vacio}>
    Cargando empresas...
  </div>
) : empresasFiltradas.length === 0 ? (
  <div style={styles.vacio}>
    {empresas.length === 0
      ? "No hay empresas registradas."
      : "No se encontraron empresas con los filtros actuales."}
  </div>
) : (
  <>
    {/* =====================================================
        PC / TABLET — TABLA
        ===================================================== */}

    <div
      className={`zapea-tabla-empresas ${
  usuarioActual?.role === "EMPRESA"
    ? "zapea-ocultar-tabla-empresa"
    : ""
}`}
      style={styles.tablaWrap}
    >
      <table style={styles.tabla}>
        <thead>
          <tr>
            <th style={styles.thEmpresa}>Empresa</th>
            <th style={styles.th}>Categoría</th>
            <th style={styles.th}>RUC</th>
            <th style={styles.th}>Teléfono</th>
            <th style={styles.th}>WhatsApp</th>
            <th style={styles.th}>Correo</th>
            <th style={styles.th}>Dirección</th>
            <th style={styles.thAcciones}>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {empresasFiltradas.map((empresa) => (
            <tr
              key={String(empresa.id)}
              style={styles.tr}
            >
              <td style={styles.tdEmpresa}>
                <div style={styles.empresaFila}>
                  {empresa.logoUrl ? (
                    <img
                      src={
                        empresa.logoUrl?.startsWith("http")
                          ? empresa.logoUrl
                          : `${API_URL}${empresa.logoUrl}`
                      }
                      alt=""
                      style={styles.logoTabla}
                    />
                  ) : (
                    <div style={styles.logoTablaPlaceholder}>
                      Z
                    </div>
                  )}

                  <div>
                    <div style={styles.nombre}>
                      {empresa.name}
                    </div>

                    <div style={styles.descripcion}>
                      {empresa.description ||
                        "Sin descripción"}
                    </div>
                  </div>
                </div>
              </td>

              <td style={styles.td}>
                <span style={styles.badge}>
                  {empresa.categoria ||
                    "Sin categoría"}
                </span>
              </td>

              <td style={styles.td}>
                {empresa.ruc || "—"}
              </td>

              <td style={styles.td}>
                {empresa.phone || "—"}
              </td>

              <td style={styles.td}>
                {empresa.whatsapp || "—"}
              </td>

              <td style={styles.td}>
                {empresa.email || "—"}
              </td>

              <td style={styles.td}>
                {empresa.address || "—"}
              </td>

              <td style={styles.tdAcciones}>
                <div style={styles.accionesTabla}>

                  <button
                    type="button"
                    title="Ver empresa"
                    aria-label="Ver empresa"
                    style={styles.ver}
                    onClick={() =>
                      abrirPerfilPublico(empresa)
                    }
                  >
                    👁️
                  </button>

 {(
  usuarioActual?.role === "ADMIN" ||
  String(usuarioActual?.companyId) === String(empresa.id)
) && (
  <button
    type="button"
    title="Editar empresa"
    aria-label="Editar empresa"
    style={styles.editar}
    onClick={() =>
      editarEmpresa(empresa)
    }
  >
    ✏️
  </button>
)}
{(
  usuarioActual?.role === "ADMIN" ||
  String(usuarioActual?.companyId) === String(empresa.id)
) && (
  <button
    type="button"
    title="Estadísticas"
    aria-label="Ver estadísticas"
    style={{
      border: 0,
      background: "#ede9fe",
      width: "34px",
      height: "34px",
      borderRadius: "6px",
      cursor: "pointer",
      marginRight: "6px",
    }}
    onClick={() => abrirEstadisticas(empresa)}
  >
    📊
  </button>
)}
                  <button
                    type="button"
                    title="WhatsApp"
                    aria-label="WhatsApp"
                    style={styles.whatsappTabla}
                    onClick={() =>
                      abrirWhatsApp(empresa)
                    }
                  >
                    🟢
                  </button>

                  {empresa.facebook && (
                    <button
                      type="button"
                      title="Facebook"
                      aria-label="Facebook"
                      style={styles.facebook}
                      onClick={() =>
                        abrirFacebook(empresa)
                      }
                    >
                      🔵
                    </button>
                  )}

{(
  usuarioActual?.role === "ADMIN" ||
  String(usuarioActual?.companyId) === String(empresa.id)
) && (
  <button
    type="button"
    disabled={guardando}
    title="Eliminar empresa"
    aria-label="Eliminar empresa"
    style={styles.eliminar}
    onClick={() =>
      void eliminarEmpresa(empresa)
    }
  >
    🗑️
  </button>
)}

                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* =====================================================
        CELULAR — TARJETAS
        ===================================================== */}

<div
  className={`zapea-cards-empresas ${
    usuarioActual?.role === "EMPRESA"
      ? "zapea-mostrar-card-empresa"
      : "zapea-admin-cards-empresas"
  }`}
>

      {empresasFiltradas.map((empresa) => (
        <div
          key={`mobile-${String(empresa.id)}`}
          className="zapea-empresa-card"
        >

{/* PORTADA Y LOGO DE LA EMPRESA */}
<div
  className="zapea-panel-portada"
  style={{
    width: "100%",
    position: "relative",
    margin: "0 0 55px",
  }}
>
  {empresa.portadaUrl && (
    <img
      src={
        empresa.portadaUrl.startsWith("http")
          ? empresa.portadaUrl
          : `${API_URL}${empresa.portadaUrl}`
      }
      alt={`Portada de ${empresa.name}`}
      style={{
        width: "100%",
        height: "190px",
        objectFit: "cover",
        objectPosition: "center",
        display: "block",
        borderRadius: "18px",
      }}
    />
  )}

  {/* LOGO ENCIMA DE LA PORTADA */}
  {empresa.logoUrl ? (
    <img
      className="zapea-logo-portada"
      src={
        empresa.logoUrl.startsWith("http")
          ? empresa.logoUrl
          : `${API_URL}${empresa.logoUrl}`
      }
      alt={empresa.name}
      style={{
width: "78px",
height: "78px",
        objectFit: "cover",
        borderRadius: "18px",
        display: "block",
        border: "5px solid #ffffff",
        boxShadow: "0 5px 18px rgba(15, 23, 42, 0.20)",
        position: "absolute",
        left: "28px",
bottom: "-45px",
transform: "none",
        zIndex: 10,
        background: "#ffffff",
      }}
    />
  ) : (
    <div
      className="zapea-logo-portada-placeholder"
      style={{
        position: "absolute",
left: "50%",
bottom: "-40px",
transform: "translateX(-50%)",
        width: "90px",
        height: "90px",
        borderRadius: "18px",
        background: "#eff6ff",
        color: "#2563eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "30px",
        fontWeight: 800,
        border: "5px solid #ffffff",
        boxShadow: "0 5px 18px rgba(15, 23, 42, 0.20)",
        zIndex: 10,
      }}
    >
      Z
    </div>
  )}
</div>
<div className="zapea-empresa-card-header">
  <div>
    <div className="zapea-empresa-nombre">
      {empresa.name}
    </div>

    <span className="zapea-empresa-categoria">
      {empresa.categoria || "Sin categoría"}
    </span>
  </div>
</div>

{empresa.description && (
  <div className="zapea-empresa-descripcion">
    {empresa.description}
  </div>
)}

{(empresa.ruc ||
  empresa.phone ||
  empresa.whatsapp ||
  empresa.email ||
  empresa.address) && (
  <div className="zapea-empresa-datos">

{empresa.ruc && (
  <div className="zapea-empresa-dato">
    <strong>🧾 RUC:</strong>{" "}
    {empresa.ruc}
  </div>
)}

      {empresa.whatsapp && (
      <div className="zapea-empresa-dato">
        <strong>🟢 WhatsApp:</strong>{" "}
        {empresa.whatsapp}
      </div>
    )}

 {empresa.phone && (
      <div className="zapea-empresa-dato">
        <strong>📞 Teléfono:</strong>{" "}
        {empresa.phone}
      </div>
    )}

    {empresa.email && (
      <div className="zapea-empresa-dato">
        <strong>✉️ Correo:</strong>{" "}
        {empresa.email}
      </div>
    )}

    {empresa.address && (
      <div className="zapea-empresa-dato">
        <strong>📍 Dirección:</strong>{" "}
        {empresa.address}
      </div>
    )}

{empresa.latitud !== null &&
empresa.latitud !== undefined &&
empresa.longitud !== null &&
empresa.longitud !== undefined ? (
  <div className="zapea-empresa-dato">
    <strong>📍 GPS:</strong>{" "}
    Ubicación registrada
  </div>
) : (
  <div className="zapea-empresa-dato">
    <strong>⚠️ GPS:</strong>{" "}
    Ubicación no registrada
  </div>
)}

  </div>
)}

<div className="zapea-empresa-acciones">

  {/* UBICACIÓN */}
  <button
    type="button"
    title="Ver ubicación"
    aria-label="Ver ubicación"
    data-tooltip="Ver ubicación"
    className="zapea-empresa-accion"
    style={{
      background: "#ffedd5",
      width: "34px",
      height: "34px",
      minWidth: "34px",
      minHeight: "34px",
      padding: 0,
      margin: 0,
      border: "none",
      borderRadius: "6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "16px",
      lineHeight: 1,
      cursor: "pointer",
      boxShadow: "0 2px 6px rgba(15, 23, 42, 0.08)",
    }}
    onClick={() => abrirUbicacion(empresa)}
  >
    📍
  </button>

  {/* VER EMPRESA */}
  <button
    type="button"
    title="Ver empresa"
    aria-label="Ver empresa"
    data-tooltip="Ver empresa"
    className="zapea-empresa-accion"
    style={{
      background: "#e0f2fe",
      width: "34px",
      height: "34px",
      minWidth: "34px",
      minHeight: "34px",
      padding: 0,
      margin: 0,
      border: "none",
      borderRadius: "6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "16px",
      lineHeight: 1,
      cursor: "pointer",
      boxShadow: "0 2px 6px rgba(15, 23, 42, 0.08)",
    }}
    onClick={() => abrirPerfilPublico(empresa)}
  >
    👁️
  </button>

{(
  usuarioActual?.role === "ADMIN" ||
  String(usuarioActual?.companyId) === String(empresa.id)
) && (
  <button
    type="button"
    title="Editar empresa"
    aria-label="Editar empresa"
    data-tooltip="Editar"
    className="zapea-empresa-accion"
style={{
  background: "#fef3c7",
  width: "34px",
  height: "34px",
  minWidth: "34px",
  minHeight: "34px",
  padding: 0,
  margin: 0,
  border: "none",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "16px",
  lineHeight: 1,
  cursor: "pointer",
  boxShadow: "0 2px 6px rgba(15, 23, 42, 0.08)",
}}
    onClick={() =>
      editarEmpresa(empresa)
    }
  >
    ✏️
  </button>
)}
{(
  usuarioActual?.role === "ADMIN" ||
  String(usuarioActual?.companyId) === String(empresa.id)
) && (
  <button
    type="button"
    title="Estadísticas"
    aria-label="Ver estadísticas"
    data-tooltip="Estadísticas"
    className="zapea-empresa-accion"
style={{
  background: "#ede9fe",
  width: "34px",
  height: "34px",
  minWidth: "34px",
  minHeight: "34px",
  padding: 0,
  margin: 0,
  border: "none",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "16px",
  lineHeight: 1,
  cursor: "pointer",
  boxShadow: "0 2px 6px rgba(15, 23, 42, 0.08)",
}}
    onClick={() =>
      abrirEstadisticas(empresa)
    }
  >
    📊
  </button>
)}

           {(
  usuarioActual?.role === "ADMIN" ||
  String(usuarioActual?.companyId) === String(empresa.id)
) && (
  <button
    type="button"
    title="Eliminar empresa"
    aria-label="Eliminar empresa"
    className="zapea-empresa-accion"
style={{
  background: "#fee2e2",
  width: "34px",
  height: "34px",
  minWidth: "34px",
  minHeight: "34px",
  padding: 0,
  margin: 0,
  border: "none",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "16px",
  lineHeight: 1,
  cursor: "pointer",
  boxShadow: "0 2px 6px rgba(15, 23, 42, 0.08)",
}}
    onClick={() =>
      void eliminarEmpresa(empresa)
    }
  >
    🗑️
  </button>
)}

          </div>

        </div>
      ))}

    </div>
  </>
)}
 </div>
    </div>
  </div>
  </div>
);
}


function Detalle({
  label,
  valor,
}: {
  label: string;
  valor: string;
}) {
  return (
    <div>
      <span style={styles.detalleLabel}>{label}</span>
      <strong>{valor}</strong>
    </div>
  );
}
export {};
