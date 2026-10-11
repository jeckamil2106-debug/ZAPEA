import { useEffect, useRef, useState } from "react";
const API_URL =
  import.meta.env.VITE_API_URL ||
  `http://${window.location.hostname}:3000`;
interface Service {
  id: string;
  nombre: string;
  descripcion?: string;
  precioDesde?: number;
  imagenUrl?: string;
  destacado?: boolean;
  company?: {
    id: string;
    nombre: string;
  };
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const usuario = JSON.parse(
  localStorage.getItem("zapea_user") || "{}"
);

const esAdmin = usuario?.role === "ADMIN";
const companyIdUsuario = String(usuario?.companyId || "");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [servicioGaleria, setServicioGaleria] =
  useState<Service | null>(null);
  const [subiendoImagenes, setSubiendoImagenes] = useState(false);
  const [imagenesGaleria, setImagenesGaleria] = useState<
  {
    id: string;
    url: string;
  }[]
>([]);
const [imagenActual, setImagenActual] = useState(0);
const [touchInicio, setTouchInicio] = useState<number | null>(null);
const [zoom, setZoom] = useState(1);
const [positionX, setPositionX] = useState(0);
const [positionY, setPositionY] = useState(0);

useEffect(() => {
  setZoom(1);
  setPositionX(0);
  setPositionY(0);
}, [imagenActual]);

const arrastreInicio = useRef({ x: 0, y: 0 });
const posicionInicio = useRef({ x: 0, y: 0 });

const distanciaInicial = useRef<number | null>(null);
const zoomInicial = useRef(1);
const galeriaHistorial = useRef(false);
  const [servicioEditando, setServicioEditando] =
  useState<Service | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

const [nombre, setNombre] = useState("");
const [descripcion, setDescripcion] = useState("");
const [precioDesde, setPrecioDesde] = useState("");
const [companyId, setCompanyId] = useState("");
const [destacado, setDestacado] = useState(true);

const [empresas, setEmpresas] = useState<
  { id: string; nombre: string }[]
>([]);

const buscar = async () => {
  try {
    setLoading(true);

const response = await fetch(
  `${API_URL}/services/search?q=${encodeURIComponent(search)}`
);

if (!response.ok) {
  throw new Error("No se pudieron cargar los servicios.");
}

const data = await response.json();

const serviciosFiltrados = esAdmin
  ? data
  : data.filter(
      (service: Service) =>
        String(service.company?.id) === companyIdUsuario
    );

setServices(serviciosFiltrados);
  } catch (error) {
    console.error("Error buscando servicios:", error);
  } finally {
    setLoading(false);
  }
};
const cargarEmpresas = async () => {
  try {
    const response = await fetch(
      `${API_URL}/companies`
    );

    if (!response.ok) {
      throw new Error(
        "No se pudieron cargar las empresas."
      );
    }

    const data = await response.json();

    setEmpresas(
      Array.isArray(data) ? data : []
    );
  } catch (error) {
    console.error(
      "Error cargando empresas:",
      error
    );
  }
};
useEffect(() => {
  buscar();
  cargarEmpresas();
}, []);
useEffect(() => {
  if (servicioGaleria) {
    const overflowAnterior = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflowAnterior;
    };
  }
}, [servicioGaleria]);
const crearServicio = async () => {
  if (!nombre.trim()) {
    alert("Ingresa el nombre del servicio.");
    return;
  }

  if (!companyId) {
    alert("Selecciona una empresa.");
    return;
  }

  try {
    setLoading(true);
const token = localStorage.getItem("zapea_token");
    const datos = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      precioDesde:
        precioDesde !== ""
          ? Number(precioDesde)
          : undefined,
      destacado,
    };

    // ==========================================
    // EDITAR SERVICIO
    // ==========================================

    if (servicioEditando) {
      const response = await fetch(
        `${API_URL}/services/${servicioEditando.id}`,
        {
          method: "PATCH",
          headers: {
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
},
          body: JSON.stringify(datos),
        }
      );

      if (!response.ok) {
        const errorData =
          await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            "No se pudo actualizar el servicio."
        );
      }

      setServicioEditando(null);

      setNombre("");
      setDescripcion("");
      setPrecioDesde("");
      setCompanyId("");
      setDestacado(true);

      setMostrarFormulario(false);

      await buscar();

      alert("Servicio actualizado correctamente.");

      return;
    }

    // ==========================================
    // CREAR SERVICIO
    // ==========================================

    const response = await fetch(
      `${API_URL}/services/company/${companyId}`,
      {
        method: "POST",
headers: {
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
},
        body: JSON.stringify(datos),
      }
    );

    if (!response.ok) {
      const errorData =
        await response.json().catch(() => null);

      throw new Error(
        errorData?.message ||
          "No se pudo crear el servicio."
      );
    }

    setNombre("");
    setDescripcion("");
    setPrecioDesde("");
    setCompanyId("");
    setDestacado(true);

    setServicioEditando(null);
    setMostrarFormulario(false);

    await buscar();

    alert("Servicio creado correctamente.");
  } catch (error) {
    console.error(
      "Error guardando servicio:",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : "No se pudo guardar el servicio."
    );
  } finally {
    setLoading(false);
  }
};
const subirImagenesGaleria = async (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  if (!servicioGaleria) return;

  const files = event.target.files;

  if (!files || files.length === 0) {
    return;
  }

  try {
    setSubiendoImagenes(true);

    const formData = new FormData();

    Array.from(files).forEach((file) => {
      formData.append("imagenes", file);
    });

const response = await fetch(
  `${API_URL}/services/${servicioGaleria.id}/images`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("zapea_token") || ""}`,
    },
    body: formData,
  }
);

    if (!response.ok) {
      const errorData =
        await response.json().catch(() => null);

      throw new Error(
        errorData?.message ||
          "No se pudieron subir las imágenes."
      );
    }

    const responseImagenes = await fetch(
      `${API_URL}/services/${servicioGaleria.id}/images`
    );

    if (!responseImagenes.ok) {
      throw new Error(
        "Las imágenes se subieron, pero no se pudieron actualizar."
      );
    }

    const imagenesActualizadas =
      await responseImagenes.json();

    setImagenesGaleria(
      Array.isArray(imagenesActualizadas)
        ? imagenesActualizadas
        : []
    );

    alert("Imágenes agregadas correctamente.");
  } catch (error) {
    console.error(
      "Error subiendo imágenes:",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : "No se pudieron subir las imágenes."
    );
  } finally {
    setSubiendoImagenes(false);
    event.target.value = "";
  }
};
useEffect(() => {
const manejarAtras = () => {
  if (galeriaHistorial.current) {
    galeriaHistorial.current = false;

    setServicioGaleria(null);
    setImagenesGaleria([]);
    setImagenActual(0);
    setZoom(1);
  }
};

  window.addEventListener("popstate", manejarAtras);

  return () => {
    window.removeEventListener("popstate", manejarAtras);
  };
}, []);
const abrirGaleria = async (service: Service) => {
  window.history.pushState(
    { zapeaGaleria: true },
    "",
    window.location.href
  );

  galeriaHistorial.current = true;

  try {
    setServicioGaleria(service);
    setImagenesGaleria([]);
    setImagenActual(0);
    setZoom(1);

    const response = await fetch(
      `${API_URL}/services/${service.id}/images`
    );

    if (!response.ok) {
      throw new Error(
        "No se pudieron cargar las imágenes."
      );
    }

    const data = await response.json();

    setImagenesGaleria(
      Array.isArray(data) ? data : []
    );
  } catch (error) {
    console.error(
      "Error cargando imágenes:",
      error
    );

    alert(
      "No se pudieron cargar las imágenes."
    );
  }
};

  const eliminarServicio = async (id: string) => {
    const confirmar = window.confirm(
      "¿Estás seguro de eliminar este servicio?"
    );

    if (!confirmar) return;

    try {
const response = await fetch(
  `${API_URL}/services/${id}`,
  {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("zapea_token") || ""}`,
    },
  }
);

if (!response.ok) {
  throw new Error("No se pudo eliminar el servicio.");
}

      setServices((actuales) =>
        actuales.filter((service) => service.id !== id)
      );
    } catch (error) {
      console.error("Error eliminando servicio:", error);
      alert("No se pudo eliminar el servicio.");
    }
  };

  return (
    <div
      style={{
        padding: "30px",
        minHeight: "100vh",
        background: "#f4f7fb",
      }}
    >
      {/* ENCABEZADO */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              fontWeight: 800,
            }}
          >
            Servicios
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b",
            }}
          >
            Administra los servicios publicados en ZAPEA.
          </p>
        </div>

        <button
        onClick={() => {
  setCompanyId(esAdmin ? "" : companyIdUsuario);
  setMostrarFormulario(true);
}}
          style={{
            border: "none",
            borderRadius: "10px",
            padding: "12px 20px",
            background: "#2563eb",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + Nuevo servicio
        </button>
      </div>
{/* FORMULARIO NUEVO SERVICIO */}
{mostrarFormulario && (
  <div
    style={{
      background: "white",
      padding: "25px",
      borderRadius: "14px",
      marginBottom: "25px",
      border: "1px solid #e2e8f0",
    }}
  >
    <h2
      style={{
        marginTop: 0,
        marginBottom: "20px",
        fontSize: "22px",
      }}
    >
      Nuevo servicio
    </h2>

    {/* EMPRESA */}
    <div style={{ marginBottom: "15px" }}>
      <label
        style={{
          display: "block",
          marginBottom: "6px",
          fontWeight: 600,
        }}
      >
        Empresa
      </label>

      <select
        value={companyId}
        onChange={(e) =>
          setCompanyId(e.target.value)
        }
        disabled={!esAdmin}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #cbd5e1",
          fontSize: "15px",
        }}
      >
        <option value="">
          Seleccionar empresa
        </option>

        {empresas.map((empresa) => (
          <option
            key={empresa.id}
            value={empresa.id}
          >
            {empresa.nombre}
          </option>
        ))}
      </select>
    </div>

    {/* NOMBRE */}
    <div style={{ marginBottom: "15px" }}>
      <label
        style={{
          display: "block",
          marginBottom: "6px",
          fontWeight: 600,
        }}
      >
        Nombre del servicio
      </label>

      <input
        type="text"
        value={nombre}
        onChange={(e) =>
          setNombre(e.target.value)
        }
        placeholder="Ej. Planos de ubicación"
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #cbd5e1",
          fontSize: "15px",
        }}
      />
    </div>

    {/* DESCRIPCIÓN */}
    <div style={{ marginBottom: "15px" }}>
      <label
        style={{
          display: "block",
          marginBottom: "6px",
          fontWeight: 600,
        }}
      >
        Descripción
      </label>

      <textarea
        value={descripcion}
        onChange={(e) =>
          setDescripcion(e.target.value)
        }
        placeholder="Describe el servicio..."
        rows={4}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #cbd5e1",
          fontSize: "15px",
          resize: "vertical",
        }}
      />
    </div>

    {/* PRECIO */}
    <div style={{ marginBottom: "15px" }}>
      <label
        style={{
          display: "block",
          marginBottom: "6px",
          fontWeight: 600,
        }}
      >
        Precio desde
      </label>

      <input
        type="number"
        min="0"
        value={precioDesde}
        onChange={(e) =>
          setPrecioDesde(e.target.value)
        }
        placeholder="Ej. 150"
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #cbd5e1",
          fontSize: "15px",
        }}
      />
    </div>

    {/* DESTACADO */}
    <div
      style={{
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <input
        type="checkbox"
        checked={destacado}
        onChange={(e) =>
          setDestacado(e.target.checked)
        }
        id="servicio-destacado"
      />

      <label
        htmlFor="servicio-destacado"
        style={{
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        ⭐ Marcar como destacado
      </label>
    </div>

    {/* BOTONES */}
    <div
      style={{
        display: "flex",
        gap: "10px",
      }}
    >
      <button
        onClick={crearServicio}
        style={{
          border: "none",
          borderRadius: "9px",
          padding: "12px 20px",
          background: "#2563eb",
          color: "white",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Guardar servicio
      </button>

      <button
        onClick={() => {
          setMostrarFormulario(false);
          setNombre("");
          setDescripcion("");
          setPrecioDesde("");
          setCompanyId("");
          setDestacado(true);
        }}
        style={{
          border: "1px solid #cbd5e1",
          borderRadius: "9px",
          padding: "12px 20px",
          background: "white",
          color: "#475569",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Cancelar
      </button>
    </div>
  </div>
)}
      {/* BUSCADOR */}
      <div
        style={{
          background: "white",
          padding: "18px",
          borderRadius: "14px",
          marginBottom: "25px",
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          <input
            type="text"
            placeholder="Buscar servicio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") buscar();
            }}
            style={{
              flex: 1,
              padding: "12px 15px",
              borderRadius: "9px",
              border: "1px solid #cbd5e1",
              fontSize: "15px",
            }}
          />

          <button
            onClick={buscar}
            style={{
              border: "none",
              borderRadius: "9px",
              padding: "0 22px",
              background: "#1d4ed8",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Buscar
          </button>
        </div>
      </div>

      {/* CONTENIDO */}
      <div
        style={{
          background: "white",
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <strong>
            Servicios registrados: {services.length}
          </strong>
        </div>

        {loading ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            Cargando servicios...
          </div>
        ) : services.length === 0 ? (
          <div
            style={{
              padding: "50px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
  No se encontraron servicios.
  </div>
) : (
  <>
    {/* =========================================================
        VISTA ESCRITORIO
        ========================================================= */}
    <div className="servicios-tabla-desktop">
      <div
        style={{
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#f8fafc",
                textAlign: "left",
              }}
            >
              <th style={{ padding: "15px" }}>
                Servicio
              </th>

              <th style={{ padding: "15px" }}>
                Empresa
              </th>

              <th style={{ padding: "15px" }}>
                Precio
              </th>

              <th style={{ padding: "15px" }}>
                Estado
              </th>

              <th style={{ padding: "15px" }}>
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {services.map((service) => (
              <tr
                key={service.id}
                style={{
                  borderTop:
                    "1px solid #e2e8f0",
                }}
              >
                {/* SERVICIO */}
                <td
                  style={{
                    padding: "15px",
                  }}
                >
                  <strong>
                    {service.nombre}
                  </strong>

                  {service.descripcion && (
                    <div
                      style={{
                        marginTop: "5px",
                        fontSize: "13px",
                        color: "#64748b",
                      }}
                    >
                      {service.descripcion}
                    </div>
                  )}
                </td>

                {/* EMPRESA */}
                <td
                  style={{
                    padding: "15px",
                  }}
                >
                  {service.company?.nombre ||
                    "Sin empresa"}
                </td>

                {/* PRECIO */}
                <td
                  style={{
                    padding: "15px",
                  }}
                >
                  {service.precioDesde != null
                    ? `S/ ${service.precioDesde}`
                    : "Consultar"}
                </td>

                {/* ESTADO */}
                <td
                  style={{
                    padding: "15px",
                  }}
                >
                  {service.destacado ? (
                    <span
                      style={{
                        display: "inline-flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "3px",
                        background: "#fef3c7",
                        color: "#b45309",
                        padding: "5px 9px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      ⭐
                      <span>
                        Destacado
                      </span>
                    </span>
                  ) : (
                    <span
                      style={{
                        color: "#64748b",
                        fontSize: "13px",
                      }}
                    >
                      Normal
                    </span>
                  )}
                </td>

                {/* ACCIONES */}
                <td
                  style={{
                    padding: "15px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* EDITAR */}
                    <button
                      type="button"
                      onClick={() => {
                        setServicioEditando(service);
                        setMostrarFormulario(true);

                        setNombre(
                          service.nombre
                        );

                        setDescripcion(
                          service.descripcion ||
                            ""
                        );

                        setPrecioDesde(
                          service.precioDesde !=
                            null
                            ? String(
                                service.precioDesde
                              )
                            : ""
                        );

                        setDestacado(
                          service.destacado ||
                            false
                        );

                        setCompanyId(
                          service.company?.id ||
                            ""
                        );
                      }}
                      style={{
                        padding: "7px 12px",
                        borderRadius: "7px",
                        border:
                          "1px solid #cbd5e1",
                        background: "white",
                        color: "#2563eb",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Editar
                    </button>

                    {/* IMÁGENES */}
                    <button
                      type="button"
                      onClick={() =>
                        abrirGaleria(service)
                      }
                      style={{
                        padding: "7px 12px",
                        borderRadius: "7px",
                        border:
                          "1px solid #cbd5e1",
                        background: "white",
                        color: "#2563eb",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      🖼️ Imágenes
                    </button>

                    {/* ELIMINAR */}
                    <button
                      type="button"
                      onClick={() =>
                        eliminarServicio(
                          service.id
                        )
                      }
                      style={{
                        padding: "7px 12px",
                        borderRadius: "7px",
                        border: "none",
                        background: "#fee2e2",
                        color: "#b91c1c",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* =========================================================
        VISTA CELULAR
        ========================================================= */}
    <div className="servicios-tarjetas-mobile">
      {services.map((service) => (
        <div
          key={`mobile-${service.id}`}
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "18px",
            margin: "15px",
            background:
  "linear-gradient(145deg, #ffffff 0%, #f8fafc 55%, #eff6ff 100%)",
            boxShadow:
              "0 2px 8px rgba(15, 23, 42, 0.06)",
          }}
        >
          {/* NOMBRE */}
          <div
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#334155",
              marginBottom: "8px",
            }}
          >
            {service.nombre}
          </div>

          {/* DESCRIPCIÓN */}
          {service.descripcion && (
            <div
              style={{
                fontSize: "14px",
                lineHeight: 1.6,
                color: "#64748b",
                marginBottom: "16px",
              }}
            >
              {service.descripcion}
            </div>
          )}

          {/* EMPRESA */}
          <div
            style={{
              padding: "10px 0",
              borderTop:
                "1px solid #f1f5f9",
            }}
          >
            <span
              style={{
                fontWeight: 700,
                color: "#475569",
              }}
            >
              Empresa
            </span>

            <div
              style={{
                marginTop: "4px",
                color: "#334155",
              }}
            >
              {service.company?.nombre ||
                "Sin empresa"}
            </div>
          </div>

          {/* PRECIO */}
          <div
            style={{
              padding: "10px 0",
              borderTop:
                "1px solid #f1f5f9",
            }}
          >
            <span
              style={{
                fontWeight: 700,
                color: "#475569",
              }}
            >
              Precio
            </span>

            <div
              style={{
                marginTop: "4px",
                fontSize: "20px",
                fontWeight: 700,
                color: "#2563eb",
              }}
            >
              {service.precioDesde != null
                ? `S/ ${service.precioDesde}`
                : "Consultar"}
            </div>
          </div>

          {/* ESTADO */}
          <div
            style={{
              padding: "10px 0",
              borderTop:
                "1px solid #f1f5f9",
            }}
          >
            <span
              style={{
                fontWeight: 700,
                color: "#475569",
              }}
            >
              Estado
            </span>

            <div
              style={{
                marginTop: "6px",
              }}
            >
              {service.destacado ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#fef3c7",
                    color: "#b45309",
                    padding: "8px 12px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  ⭐ Destacado
                </span>
              ) : (
                <span
                  style={{
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  Normal
                </span>
              )}
            </div>
          </div>

          {/* ACCIONES */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginTop: "18px",
            }}
          >
            {/* EDITAR */}
            <button
              type="button"
              onClick={() => {
                setServicioEditando(service);
                setMostrarFormulario(true);

                setNombre(
                  service.nombre
                );

                setDescripcion(
                  service.descripcion ||
                    ""
                );

                setPrecioDesde(
                  service.precioDesde != null
                    ? String(
                        service.precioDesde
                      )
                    : ""
                );

                setDestacado(
                  service.destacado ||
                    false
                );

                setCompanyId(
                  service.company?.id ||
                    ""
                );
              }}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "9px",
                border:
                  "1px solid #cbd5e1",
                background: "white",
                color: "#2563eb",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "15px",
              }}
            >
              Editar
            </button>

            {/* IMÁGENES */}
            <button
              type="button"
              onClick={() =>
                abrirGaleria(service)
              }
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "9px",
                border:
                  "1px solid #cbd5e1",
                background: "white",
                color: "#2563eb",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "15px",
              }}
            >
              🖼️ Imágenes
            </button>

            {/* ELIMINAR */}
            <button
              type="button"
              onClick={() =>
                eliminarServicio(
                  service.id
                )
              }
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "9px",
                border: "none",
                background: "#fee2e2",
                color: "#b91c1c",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "15px",
              }}
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>

    {/* =========================================================
        RESPONSIVE
        ========================================================= */}
    <style>
      {`
        .servicios-tarjetas-mobile {
          display: none;
        }

        .servicios-tabla-desktop {
          display: block;
        }

        @media (max-width: 768px) {
          .servicios-tabla-desktop {
            display: none;
          }

          .servicios-tarjetas-mobile {
            display: block;
          }
            .controles-zoom-galeria {
  display: none !important;
}
        }
      `}
</style>
  </>
)}


      {/* =========================================================
          MODAL GALERÍA ZAPEA
          ========================================================= */}
{servicioGaleria && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "10px",
  overflowY: "hidden",
  overscrollBehavior: "none",
      background:
        "linear-gradient(135deg, rgba(2, 8, 23, 0.94), rgba(15, 23, 42, 0.90))",
      backdropFilter: "blur(10px)",
    }}
  >
    {/* PANEL PRINCIPAL */}
<div
  style={{
    width: "100%",
    maxWidth: "700px",
    maxHeight: "94vh",
    overflow: "hidden",
    position: "relative",
    borderRadius: "30px",
    padding: "20px",
    boxSizing: "border-box",
    background:
      "linear-gradient(145deg, #0f172a 0%, #111827 55%, #172554 100%)",
    boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
    border: "1px solid rgba(255,255,255,0.08)",
  }}
>
      {/* BRILLO DECORATIVO */}
      <div
        style={{
          position: "absolute",
          width: "260px",
          height: "260px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(37,99,235,0.20), transparent 70%)",
          top: "-120px",
          right: "-100px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "220px",
          height: "220px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.14), transparent 70%)",
          bottom: "-100px",
          left: "-100px",
          pointerEvents: "none",
        }}
      />

      {/* ENCABEZADO */}
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "22px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 800,
              letterSpacing: "1.5px",
              color: "#60a5fa",
              marginBottom: "7px",
            }}
          >
            GALERÍA ZAPEA
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: 800,
              color: "white",
              letterSpacing: "-0.5px",
            }}
          >
            {servicioGaleria.nombre}
          </h2>
        </div>

        {/* CERRAR */}
        <button
          type="button"
onClick={() => {
  setServicioGaleria(null);
  setImagenesGaleria([]);
  setImagenActual(0);
  setZoom(1);
}}
          style={{
            width: "50px",
            height: "50px",
            flexShrink: 0,
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "16px",
            background:
              "linear-gradient(145deg, #2563eb, #1d4ed8)",
            color: "white",
            fontSize: "30px",
            lineHeight: 1,
            fontWeight: 400,
            cursor: "pointer",
            boxShadow:
              "0 10px 25px rgba(37,99,235,0.30)",
          }}
        >
          ×
        </button>
      </div>

      {/* TARJETA DE GALERÍA */}
      <div
        style={{
          position: "relative",
          borderRadius: "24px",
          padding: "20px",
          background:
            "linear-gradient(145deg, #f8fbff 0%, #eef4ff 100%)",
          boxShadow:
            "0 15px 40px rgba(0,0,0,0.25)",
          border: "1px solid rgba(255,255,255,0.8)",
        }}
      >
        {/* CABECERA DE IMÁGENES */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "20px",
          }}
        >
          {/* ICONO */}
          <div
            style={{
              width: "52px",
              height: "52px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "18px",
              background:
                "linear-gradient(145deg, #dbeafe, #e0e7ff)",
              boxShadow:
                "0 8px 20px rgba(37,99,235,0.15)",
            }}
          >
            <svg
              width="31"
              height="31"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2563eb"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="4"
              />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
              <path d="M18 7v6" />
              <path d="M15 10h6" />
            </svg>
          </div>

          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: 800,
                color: "#172554",
                letterSpacing: "-0.3px",
              }}
            >
              Imágenes del servicio
            </h3>

            <p
              style={{
                margin: "4px 0 0",
                fontSize: "13px",
                lineHeight: 1.45,
                color: "#64748b",
              }}
            >
              Explora las imágenes de este servicio.
            </p>
          </div>
        </div>

        {/* SIN IMÁGENES */}
        {imagenesGaleria.length === 0 ? (
          <div
            style={{
              padding: "45px 20px",
              textAlign: "center",
              borderRadius: "20px",
              background:
                "linear-gradient(145deg, #ffffff, #f8fbff)",
              border: "1px solid #dbeafe",
              color: "#64748b",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                margin: "0 auto 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "20px",
                background:
                  "linear-gradient(145deg, #dbeafe, #e0e7ff)",
              }}
            >
              <svg
                width="38"
                height="38"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2563eb"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="4"
                />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>

            <div
              style={{
                fontWeight: 700,
                color: "#334155",
                marginBottom: "16px",
              }}
            >
              Este servicio todavía no tiene imágenes.
            </div>

            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "13px 22px",
                borderRadius: "14px",
                background:
                  "linear-gradient(135deg, #2563eb, #6366f1)",
                color: "white",
                fontWeight: 800,
                cursor: subiendoImagenes
                  ? "not-allowed"
                  : "pointer",
                opacity: subiendoImagenes ? 0.7 : 1,
                boxShadow:
                  "0 8px 20px rgba(37,99,235,0.22)",
              }}
            >
              <span style={{ fontSize: "21px" }}>＋</span>

              {subiendoImagenes
                ? "Subiendo..."
                : "Agregar imágenes"}

              <input
                type="file"
                accept="image/*"
                multiple
                disabled={subiendoImagenes}
                onChange={subirImagenesGaleria}
                style={{
                  display: "none",
                }}
              />
            </label>
          </div>
        ) : (
          <>
            {/* VISOR PRINCIPAL */}
{/* VISOR PRINCIPAL */}
<div
onTouchStart={(e) => {
  if (e.touches.length === 2) {
    const dx =
      e.touches[0].clientX -
      e.touches[1].clientX;

    const dy =
      e.touches[0].clientY -
      e.touches[1].clientY;

    distanciaInicial.current =
      Math.sqrt(dx * dx + dy * dy);

    zoomInicial.current = zoom;
    return;
  }

  if (e.touches.length === 1) {
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;

    setTouchInicio(x);

if (zoom > 1) {
  arrastreInicio.current = {
    x,
    y,
  };

  posicionInicio.current = {
    x: positionX,
    y: positionY,
  };
}
  }
}}

onTouchMove={(e) => {
  /* =========================
     ZOOM CON DOS DEDOS
     ========================= */
  if (e.touches.length === 2) {
    const dx =
      e.touches[0].clientX -
      e.touches[1].clientX;

    const dy =
      e.touches[0].clientY -
      e.touches[1].clientY;

    const distanciaActual =
      Math.sqrt(dx * dx + dy * dy);

    if (distanciaInicial.current) {
      const nuevoZoom =
        zoomInicial.current *
        (distanciaActual /
          distanciaInicial.current);

      setZoom(
        Math.min(
          3,
          Math.max(1, nuevoZoom)
        )
      );
    }

    return;
  }

  if (e.touches.length === 1 && zoom > 1) {
  const dx =
    e.touches[0].clientX -
    arrastreInicio.current.x;

  const dy =
    e.touches[0].clientY -
    arrastreInicio.current.y;

  // Evitar movimiento accidental al tocar
  const sensibilidad = 10;

  if (
    Math.abs(dx) < sensibilidad &&
    Math.abs(dy) < sensibilidad
  ) {
    return;
  }

  // Mover desde la posición real de la imagen
  setPositionX(
    posicionInicio.current.x + dx
  );

  setPositionY(
    posicionInicio.current.y + dy
  );

  return;
}

  /* =========================
     CON ZOOM 1 NO MOVEMOS
     LA IMAGEN DURANTE EL SWIPE
     ========================= */
}}

onTouchEnd={(e) => {
  distanciaInicial.current = null;

  const touchFinal =
    e.changedTouches[0]?.clientX;

  if (touchFinal === undefined) {
    setTouchInicio(null);
    return;
  }

  /* =========================
     SI ESTABA HACIENDO ZOOM
     O MOVIENDO LA IMAGEN
     ========================= */
  if (zoom > 1) {
    setTouchInicio(null);
    return;
  }

  const inicio = touchInicio;

  if (inicio === null) {
    return;
  }

  const diferencia =
    inicio - touchFinal;

  /* =========================
     MOVIMIENTO PEQUEÑO = TOQUE
     ========================= */
  if (Math.abs(diferencia) < 50) {
    setTouchInicio(null);
    return;
  }

  /* =========================
     IZQUIERDA → SIGUIENTE
     ========================= */
  if (diferencia > 0) {
    setImagenActual((actual) =>
      Math.min(
        actual + 1,
        imagenesGaleria.length - 1
      )
    );
  }

  /* =========================
     DERECHA → ANTERIOR
     ========================= */
  else {
    setImagenActual((actual) =>
      Math.max(actual - 1, 0)
    );
  }

  /* =========================
     REINICIAR IMAGEN
     ========================= */
  setZoom(1);
  setPositionX(0);
  setPositionY(0);
  setTouchInicio(null);
}}

  style={{
    width: "100%",
    maxWidth: "660px",
    aspectRatio: "1.1 / 1",
    position: "relative",
    overflow: "hidden",
    margin: "0 auto",
    borderRadius: "22px",
    background: "#ffffff",
    border: "1px solid rgba(255,255,255,0.8)",
    boxShadow:
      "0 18px 45px rgba(15,23,42,0.18)",
    touchAction: "none",
  }}
>
              <img
                src={`${API_URL}${imagenesGaleria[imagenActual].url}`}
                alt={servicioGaleria?.nombre}
                style={{
                  width: "100%",
height: "100%",
objectFit: "contain",
display: "block",
background: "#ffffff",
padding: "0",
boxSizing: "border-box",
                  transform: `translate(${positionX}px, ${positionY}px) scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: "none",
                }}
              />

              {/* ANTERIOR */}
              {imagenActual > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setImagenActual((actual) =>
                      actual > 0
                        ? actual - 1
                        : actual
                    );
                    setZoom(1);
                   setPositionX(0);
setPositionY(0);
                  }}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    width: "48px",
                    height: "48px",
                    border: "1px solid rgba(255,255,255,0.45)",
                    borderRadius: "50%",
                    background:
                      "rgba(15,23,42,0.82)",
                    color: "white",
                    fontSize: "30px",
                    lineHeight: 1,
                    fontWeight: 400,
                    cursor: "pointer",
                    boxShadow:
                      "0 8px 20px rgba(0,0,0,0.20)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  ‹
                </button>
              )}

              {/* SIGUIENTE */}
              {imagenActual <
                imagenesGaleria.length - 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setImagenActual((actual) =>
                      actual <
                      imagenesGaleria.length - 1
                        ? actual + 1
                        : actual
                    );
                    setZoom(1);
                  }}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    width: "48px",
                    height: "48px",
                    border: "1px solid rgba(255,255,255,0.45)",
                    borderRadius: "50%",
                    background:
                      "rgba(15,23,42,0.82)",
                    color: "white",
                    fontSize: "30px",
                    lineHeight: 1,
                    fontWeight: 400,
                    cursor: "pointer",
                    boxShadow:
                      "0 8px 20px rgba(0,0,0,0.20)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  ›
                </button>
              )}
            </div>

            {/* CONTADOR */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "15px",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "7px 15px",
                  borderRadius: "20px",
                  background: "#172554",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: 800,
                  boxShadow:
                    "0 5px 14px rgba(15,23,42,0.15)",
                }}
              >
                {imagenActual + 1} /{" "}
                {imagenesGaleria.length}
              </div>
            </div>

            {/* INDICADORES */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "7px",
                marginTop: "13px",
                flexWrap: "wrap",
              }}
            >
              {imagenesGaleria.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Imagen ${
                    index + 1
                  }`}
                  onClick={() => {
                    setImagenActual(index);
                    setZoom(1);
                  }}
                  style={{
                    width:
                      index === imagenActual
                        ? "24px"
                        : "8px",
                    height: "8px",
                    padding: 0,
                    border: "none",
                    borderRadius: "20px",
                    background:
                      index === imagenActual
                        ? "#2563eb"
                        : "#cbd5e1",
                    cursor: "pointer",
                    transition:
                      "all 0.2s ease",
                  }}
                />
              ))}
            </div>

{/* CONTROLES DE ZOOM */}
<div
  className="controles-zoom-galeria"
  style={{
    display: "flex",
    justifyContent: "center",
    marginTop: "16px",
  }}
>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px",
                  borderRadius: "15px",
                  background:
                    "linear-gradient(135deg, #0f172a, #172554)",
                  boxShadow:
                    "0 8px 20px rgba(15,23,42,0.18)",
                }}
              >
                {/* MENOS */}
                <button
                  type="button"
                  onClick={() =>
                    setZoom((actual) =>
                      Math.max(
                        1,
                        Number(
                          (actual - 0.1).toFixed(1)
                        )
                      )
                    )
                  }
                  style={{
                    width: "44px",
                    height: "42px",
                    border: "none",
                    borderRadius: "11px",
                    background:
                      "rgba(37,99,235,0.25)",
                    color: "white",
                    fontSize: "25px",
                    cursor:
                      zoom <= 1
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      zoom <= 1 ? 0.45 : 1,
                  }}
                >
                  −
                </button>

                {/* PORCENTAJE */}
                <div
                  style={{
                    minWidth: "62px",
                    textAlign: "center",
                    color: "#93c5fd",
                    fontSize: "15px",
                    fontWeight: 800,
                  }}
                >
                  {`${Math.round(zoom * 100)}%`}
                </div>

                {/* MÁS */}
                <button
                  type="button"
                  onClick={() =>
                    setZoom((actual) =>
                      Math.min(
                        3,
                        Number(
                          (actual + 0.1).toFixed(1)
                        )
                      )
                    )
                  }
                  style={{
                    width: "44px",
                    height: "42px",
                    border: "none",
                    borderRadius: "11px",
                    background:
                      "rgba(37,99,235,0.25)",
                    color: "white",
                    fontSize: "25px",
                    cursor:
                      zoom >= 3
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      zoom >= 3 ? 0.45 : 1,
                  }}
                >
                  +
                </button>

                {/* RESTABLECER */}
                <button
                  type="button"
                  onClick={() => {
setZoom(1);
setPositionX(0);
setPositionY(0);
}}
                  style={{
                    height: "42px",
                    padding: "0 14px",
                    border: "none",
                    borderRadius: "11px",
                    background: "white",
                    color: "#172554",
                    fontSize: "13px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Restablecer
                </button>
              </div>
            </div>

            {/* AGREGAR MÁS IMÁGENES */}
            <label
              style={{
                width: "100%",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                marginTop: "18px",
                padding: "14px 18px",
                borderRadius: "15px",
                border:
                  "1px solid rgba(96,165,250,0.35)",
                background:
                  "linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%)",
                color: "#2563eb",
                fontWeight: 800,
                cursor: subiendoImagenes
                  ? "not-allowed"
                  : "pointer",
                boxShadow:
                  "0 7px 18px rgba(37,99,235,0.10)",
                opacity:
                  subiendoImagenes ? 0.7 : 1,
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="4"
                  />
                  <circle
                    cx="8.5"
                    cy="8.5"
                    r="1.5"
                  />
                  <path d="M21 15l-5-5L5 21" />
                  <path d="M18 7v6" />
                  <path d="M15 10h6" />
                </svg>

                {subiendoImagenes
                  ? "Subiendo..."
                  : "Agregar más imágenes"}
              </span>

              <span
                style={{
                  fontSize: "24px",
                  fontWeight: 400,
                }}
              >
                ›
              </span>

              <input
                type="file"
                accept="image/*"
                multiple
                disabled={subiendoImagenes}
                onChange={subirImagenesGaleria}
                style={{
                  display: "none",
                }}
              />
            </label>
  </>
  )}
      </div>

    </div>

    </div>

  )}
</div>
  </div>
);
}