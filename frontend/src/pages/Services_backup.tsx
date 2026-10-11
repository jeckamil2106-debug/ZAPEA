import { useEffect, useState } from "react";
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

setServices(data);
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
const abrirGaleria = async (service: Service) => {
  try {
    setServicioGaleria(service);
    setImagenesGaleria([]);

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
        onClick={() => setMostrarFormulario(true)}
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
        borderTop: "1px solid #e2e8f0",
      }}
    >
      {/* SERVICIO */}
      <td style={{ padding: "15px" }}>
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
      <td style={{ padding: "15px" }}>
        {service.company?.nombre ||
          "Sin empresa"}
      </td>

      {/* PRECIO */}
      <td style={{ padding: "15px" }}>
        {service.precioDesde != null
          ? `S/ ${service.precioDesde}`
          : "Consultar"}
      </td>

      {/* ESTADO */}
      <td style={{ padding: "15px" }}>
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
            <span>Destacado</span>
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
      <td style={{ padding: "15px" }}>
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

              setNombre(service.nombre);
              setDescripcion(
                service.descripcion || ""
              );

              setPrecioDesde(
                service.precioDesde != null
                  ? String(service.precioDesde)
                  : ""
              );

              setDestacado(
                service.destacado || false
              );

              setCompanyId(
                service.company?.id || ""
              );
            }}
            style={{
              padding: "7px 12px",
              borderRadius: "7px",
              border: "1px solid #cbd5e1",
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
              border: "1px solid #cbd5e1",
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
              eliminarServicio(service.id)
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
        )}
      </div>
       {/* MODAL GALERÍA */}
      {servicioGaleria && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "850px",
              background: "white",
              borderRadius: "16px",
              padding: "25px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
            }}
          >
            {/* ENCABEZADO */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "24px",
                    fontWeight: 800,
                    color: "#1e293b",
                  }}
                >
                  Galería del servicio
                </h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#64748b",
                  }}
                >
                  {servicioGaleria.nombre}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setServicioGaleria(null)}
                style={{
                  width: "38px",
                  height: "38px",
                  border: "none",
                  borderRadius: "50%",
                  background: "#fee2e2",
                  color: "#b91c1c",
                  fontSize: "24px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            {/* CONTENIDO */}
            <div
              style={{
                minHeight: "250px",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "30px",
              }}
            >
              <div
                style={{
                  fontSize: "55px",
                  marginBottom: "15px",
                }}
              >
                🖼️
              </div>

              <h3
                style={{
                  margin: "0 0 8px",
                  color: "#334155",
                }}
              >
                Imágenes del servicio
              </h3>

{imagenesGaleria.length === 0 ? (
  <>
  <label
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "10px 18px",
      borderRadius: "8px",
      background: "#2563eb",
      color: "white",
      fontWeight: 700,
      cursor: subiendoImagenes
        ? "not-allowed"
        : "pointer",
      opacity: subiendoImagenes ? 0.7 : 1,
    }}
  >
    {subiendoImagenes
      ? "Subiendo..."
      : "🖼️ Agregar imágenes"}

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
  <div
    style={{
      padding: "50px 20px",
      textAlign: "center",
      color: "#64748b",
    }}
  >
    Este servicio todavía no tiene imágenes.
  </div>
    </>
) : (
  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fill, minmax(180px, 1fr))",
      gap: "15px",
      padding: "20px",
    }}
  >
    {imagenesGaleria.map((imagen) => (
      <div
        key={imagen.id}
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          overflow: "hidden",
          background: "white",
        }}
      >
        <img
          src={`${API_URL}${imagen.url}`}
          alt={servicioGaleria?.nombre}
          style={{
            width: "100%",
            height: "180px",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>
    ))}
  </div>
)}
            </div>

            {/* CERRAR */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
            >
              <button
                type="button"
                onClick={() => setServicioGaleria(null)}
                style={{
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "10px 18px",
                  background: "white",
                  color: "#475569",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}