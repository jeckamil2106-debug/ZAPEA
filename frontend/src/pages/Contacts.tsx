import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Sidebar from "../components/Sidebar";
import { api } from "../services/api";

interface ContactsProps {
  onNavigate?: (page: string) => void;
}

interface Contact {
  id: string;
  nombres: string;
  apellidos: string;
  telefono?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  direccion?: string | null;
  empresa?: string | null;
  cargo?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface ContactForm {
  nombres: string;
  apellidos: string;
  telefono: string;
  whatsapp: string;
  email: string;
  direccion: string;
  empresa: string;
  cargo: string;
}

const formularioInicial: ContactForm = {
  nombres: "",
  apellidos: "",
  telefono: "",
  whatsapp: "",
  email: "",
  direccion: "",
  empresa: "",
  cargo: "",
};

export default function Contacts({ onNavigate }: ContactsProps) {
  const [contactos, setContactos] = useState<Contact[]>([]);
  const [form, setForm] = useState<ContactForm>(formularioInicial);

  const [busqueda, setBusqueda] = useState("");

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState<"exito" | "error">("exito");

  const [cargando, setCargando] = useState(false);

  // =========================================================
  // CARGAR CONTACTOS
  // =========================================================

  const cargarContactos = async () => {
    try {
      setCargando(true);

 const respuesta = await api.get("/contacts");

const datos = respuesta;

console.log("CONTACTOS RECIBIDOS DE ZAPEA:", datos);

setContactos(
  Array.isArray(datos)
    ? datos
    : Array.isArray(datos?.contacts)
      ? datos.contacts
      : Array.isArray(datos?.data)
        ? datos.data
        : []
);
    } catch (error) {
      console.error("Error al cargar contactos:", error);

      mostrarMensaje(
        "❌ No se pudieron cargar los contactos",
        "error"
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarContactos();
  }, []);

  // =========================================================
  // MENSAJES
  // =========================================================

  const mostrarMensaje = (
    texto: string,
    tipo: "exito" | "error"
  ) => {
    setMensaje(texto);
    setTipoMensaje(tipo);

    setTimeout(() => {
      setMensaje("");
    }, 3000);
  };

  // =========================================================
  // CAMBIAR INPUT
  // =========================================================

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setForm((actual) => ({
      ...actual,
      [name]: value,
    }));
  };

  // =========================================================
  // NUEVO CONTACTO
  // =========================================================

  const nuevoContacto = () => {
    setForm(formularioInicial);
    setEditandoId(null);
    setMostrarFormulario(true);
    setMensaje("");
  };

  // =========================================================
  // CANCELAR
  // =========================================================

  const cancelarFormulario = () => {
    setForm(formularioInicial);
    setEditandoId(null);
    setMostrarFormulario(false);
  };

  // =========================================================
  // GUARDAR / ACTUALIZAR
  // =========================================================

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!form.nombres.trim()) {
      mostrarMensaje(
        "⚠️ Ingresa los nombres del contacto",
        "error"
      );
      return;
    }

    if (!form.apellidos.trim()) {
      mostrarMensaje(
        "⚠️ Ingresa los apellidos del contacto",
        "error"
      );
      return;
    }

    try {
      setCargando(true);

      if (editandoId) {
        // ACTUALIZAR
        await api.patch(
          `/contacts/${editandoId}`,
          form
        );

        mostrarMensaje(
          "✅ Contacto actualizado correctamente",
          "exito"
        );
      } else {
        // CREAR
        await api.post("/contacts", form);

        mostrarMensaje(
          "✅ Contacto registrado correctamente",
          "exito"
        );
      }

      setForm(formularioInicial);
      setEditandoId(null);
      setMostrarFormulario(false);

      await cargarContactos();
    } catch (error) {
      console.error("Error al guardar contacto:", error);

      mostrarMensaje(
        "❌ Error al guardar el contacto",
        "error"
      );
    } finally {
      setCargando(false);
    }
  };

  // =========================================================
  // EDITAR
  // =========================================================

  const editarContacto = (contacto: Contact) => {
    setForm({
      nombres: contacto.nombres || "",
      apellidos: contacto.apellidos || "",
      telefono: contacto.telefono || "",
      whatsapp: contacto.whatsapp || "",
      email: contacto.email || "",
      direccion: contacto.direccion || "",
      empresa: contacto.empresa || "",
      cargo: contacto.cargo || "",
    });

    setEditandoId(contacto.id);
    setMostrarFormulario(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // ELIMINAR
  // =========================================================

  const eliminarContacto = async (id: string) => {
    const confirmar = window.confirm(
      "¿Estás seguro de eliminar este contacto?"
    );

    if (!confirmar) {
      return;
    }

    try {
      setCargando(true);

      await api.delete(`/contacts/${id}`);

      mostrarMensaje(
        "✅ Contacto eliminado correctamente",
        "exito"
      );

      await cargarContactos();
    } catch (error) {
      console.error("Error al eliminar contacto:", error);

      mostrarMensaje(
        "❌ Error al eliminar el contacto",
        "error"
      );
    } finally {
      setCargando(false);
    }
  };

  // =========================================================
  // BUSCADOR
  // =========================================================

  const contactosFiltrados = contactos.filter(
    (contacto) => {
      const texto = busqueda.toLowerCase().trim();

      if (!texto) {
        return true;
      }

      return (
        contacto.nombres
          ?.toLowerCase()
          .includes(texto) ||
        contacto.apellidos
          ?.toLowerCase()
          .includes(texto) ||
        contacto.telefono
          ?.toLowerCase()
          .includes(texto) ||
        contacto.whatsapp
          ?.toLowerCase()
          .includes(texto) ||
        contacto.email
          ?.toLowerCase()
          .includes(texto) ||
        contacto.empresa
          ?.toLowerCase()
          .includes(texto) ||
        contacto.cargo
          ?.toLowerCase()
          .includes(texto) ||
        contacto.direccion
          ?.toLowerCase()
          .includes(texto)
      );
    }
  );

  // =========================================================
  // INTERFAZ
  // =========================================================

  return (
    <div style={estiloPagina}>
      <Sidebar onNavigate={onNavigate} />

      <main style={estiloContenido}>
        {/* ENCABEZADO */}

        <div style={estiloEncabezado}>
          <div>
            <h1 style={estiloTitulo}>
              Contactos
            </h1>

            <p style={estiloSubtitulo}>
              Gestiona tus contactos de ZAPEA
            </p>
          </div>

          <button
            type="button"
            onClick={nuevoContacto}
            style={botonNuevo}
          >
            + Nuevo contacto
          </button>
        </div>

        {/* MENSAJE */}

        {mensaje && (
          <div
            style={
              tipoMensaje === "exito"
                ? estiloMensajeExito
                : estiloMensajeError
            }
          >
            {mensaje}
          </div>
        )}

        {/* FORMULARIO */}

        {mostrarFormulario && (
          <section style={estiloTarjeta}>
            <h2 style={estiloTituloFormulario}>
              {editandoId
                ? "Editar contacto"
                : "Nuevo contacto"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={estiloGridFormulario}>
                <div>
                  <label style={estiloLabel}>
                    Nombres *
                  </label>

                  <input
                    name="nombres"
                    value={form.nombres}
                    onChange={handleChange}
                    placeholder="Nombres"
                    style={estiloInput}
                    required
                  />
                </div>

                <div>
                  <label style={estiloLabel}>
                    Apellidos *
                  </label>

                  <input
                    name="apellidos"
                    value={form.apellidos}
                    onChange={handleChange}
                    placeholder="Apellidos"
                    style={estiloInput}
                    required
                  />
                </div>

                <div>
                  <label style={estiloLabel}>
                    Teléfono
                  </label>

                  <input
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="987654321"
                    style={estiloInput}
                  />
                </div>

                <div>
                  <label style={estiloLabel}>
                    WhatsApp
                  </label>

                  <input
                    name="whatsapp"
                    value={form.whatsapp}
                    onChange={handleChange}
                    placeholder="987654321"
                    style={estiloInput}
                  />
                </div>

                <div>
                  <label style={estiloLabel}>
                    Correo electrónico
                  </label>

                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    style={estiloInput}
                  />
                </div>

                <div>
                  <label style={estiloLabel}>
                    Dirección
                  </label>

                  <input
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    placeholder="Huancayo"
                    style={estiloInput}
                  />
                </div>

                <div>
                  <label style={estiloLabel}>
                    Empresa
                  </label>

                  <input
                    name="empresa"
                    value={form.empresa}
                    onChange={handleChange}
                    placeholder="Empresa"
                    style={estiloInput}
                  />
                </div>

                <div>
                  <label style={estiloLabel}>
                    Cargo
                  </label>

                  <input
                    name="cargo"
                    value={form.cargo}
                    onChange={handleChange}
                    placeholder="Cargo"
                    style={estiloInput}
                  />
                </div>
              </div>

              <div style={estiloBotonesFormulario}>
                <button
                  type="submit"
                  disabled={cargando}
                  style={botonGuardar}
                >
                  {cargando
                    ? "Guardando..."
                    : editandoId
                    ? "Guardar cambios"
                    : "Guardar contacto"}
                </button>

                <button
                  type="button"
                  onClick={cancelarFormulario}
                  style={botonCancelar}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}

        {/* BUSCADOR */}

        <section style={estiloTarjeta}>
          <input
            type="text"
            value={busqueda}
            onChange={(e) =>
              setBusqueda(e.target.value)
            }
            placeholder="🔎 Buscar por nombre, empresa, teléfono, correo o cargo..."
            style={estiloBuscador}
          />
        </section>

        {/* CONTADOR */}

        <div style={estiloContador}>
          {contactosFiltrados.length} contacto
          {contactosFiltrados.length !== 1
            ? "s"
            : ""}
        </div>

        {/* TABLA */}

        <section style={estiloTablaContenedor}>
          {cargando && contactos.length === 0 ? (
            <div style={estiloCargando}>
              Cargando contactos...
            </div>
          ) : contactosFiltrados.length === 0 ? (
            <div style={estiloVacio}>
              <div style={{ fontSize: "40px" }}>
                👥
              </div>

              <h3>
                No hay contactos
              </h3>

              <p>
                Registra tu primer contacto en ZAPEA.
              </p>

              <button
                type="button"
                onClick={nuevoContacto}
                style={botonNuevo}
              >
                + Nuevo contacto
              </button>
            </div>
          ) : (
            <div style={estiloScroll}>
              <table style={estiloTabla}>
                <thead>
                  <tr>
                    <th style={estiloTh}>
                      Nombre
                    </th>

                    <th style={estiloTh}>
                      Teléfono
                    </th>

                    <th style={estiloTh}>
                      WhatsApp
                    </th>

                    <th style={estiloTh}>
                      Empresa
                    </th>

                    <th style={estiloTh}>
                      Cargo
                    </th>

                    <th style={estiloTh}>
                      Ubicación
                    </th>

                    <th style={estiloTh}>
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {contactosFiltrados.map(
                    (contacto) => (
                      <tr key={contacto.id}>
                        <td style={estiloTd}>
                          <strong>
                            {contacto.nombres}{" "}
                            {contacto.apellidos}
                          </strong>

                          {contacto.email && (
                            <small
                              style={estiloEmail}
                            >
                              {contacto.email}
                            </small>
                          )}
                        </td>

                        <td style={estiloTd}>
                          {contacto.telefono ||
                            "—"}
                        </td>

                        <td style={estiloTd}>
                          {contacto.whatsapp ||
                            "—"}
                        </td>

                        <td style={estiloTd}>
                          {contacto.empresa ||
                            "—"}
                        </td>

                        <td style={estiloTd}>
                          {contacto.cargo ||
                            "—"}
                        </td>

                        <td style={estiloTd}>
                          {contacto.direccion ||
                            "—"}
                        </td>

                        <td style={estiloTd}>
                          <div
                            style={
                              estiloAcciones
                            }
                          >
                            <button
                              type="button"
                              onClick={() =>
                                editarContacto(
                                  contacto
                                )
                              }
                              style={botonEditar}
                            >
                              ✏️ Editar
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                eliminarContacto(
                                  contacto.id
                                )
                              }
                              style={botonEliminar}
                            >
                              🗑️ Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// =========================================================
// ESTILOS
// =========================================================

const estiloPagina: React.CSSProperties = {
  display: "flex",
  minHeight: "100vh",
  backgroundColor: "#f3f4f6",
};

const estiloContenido: React.CSSProperties = {
  flex: 1,
  padding: "35px",
  boxSizing: "border-box",
  overflowX: "hidden",
};

const estiloEncabezado: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
};

const estiloTitulo: React.CSSProperties = {
  margin: 0,
  fontSize: "32px",
  color: "#111827",
};

const estiloSubtitulo: React.CSSProperties = {
  marginTop: "5px",
  color: "#6b7280",
  fontSize: "15px",
};

const estiloTarjeta: React.CSSProperties = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "10px",
  marginBottom: "18px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const estiloTituloFormulario: React.CSSProperties = {
  textAlign: "center",
  marginTop: 0,
  marginBottom: "20px",
  color: "#111827",
};

const estiloGridFormulario: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: "15px",
};

const estiloLabel: React.CSSProperties = {
  display: "block",
  marginBottom: "6px",
  fontSize: "13px",
  fontWeight: "bold",
  color: "#374151",
};

const estiloInput: React.CSSProperties = {
  width: "100%",
  padding: "11px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  boxSizing: "border-box",
  fontSize: "14px",
  outline: "none",
};

const estiloBotonesFormulario: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  marginTop: "20px",
};

const botonNuevo: React.CSSProperties = {
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "11px 18px",
  cursor: "pointer",
  fontWeight: "bold",
};

const botonGuardar: React.CSSProperties = {
  backgroundColor: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "11px 18px",
  cursor: "pointer",
  fontWeight: "bold",
};

const botonCancelar: React.CSSProperties = {
  backgroundColor: "#6b7280",
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "11px 18px",
  cursor: "pointer",
  fontWeight: "bold",
};

const botonEditar: React.CSSProperties = {
  backgroundColor: "#f59e0b",
  color: "white",
  border: "none",
  borderRadius: "5px",
  padding: "7px 10px",
  cursor: "pointer",
  fontSize: "12px",
};

const botonEliminar: React.CSSProperties = {
  backgroundColor: "#dc2626",
  color: "white",
  border: "none",
  borderRadius: "5px",
  padding: "7px 10px",
  cursor: "pointer",
  fontSize: "12px",
};

const estiloBuscador: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  border: "1px solid #d1d5db",
  borderRadius: "7px",
  boxSizing: "border-box",
  fontSize: "14px",
};

const estiloContador: React.CSSProperties = {
  textAlign: "center",
  color: "#6b7280",
  marginBottom: "12px",
  fontSize: "15px",
};

const estiloTablaContenedor: React.CSSProperties = {
  backgroundColor: "white",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  overflow: "hidden",
};

const estiloScroll: React.CSSProperties = {
  overflowX: "auto",
};

const estiloTabla: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "950px",
};

const estiloTh: React.CSSProperties = {
  backgroundColor: "#1f2937",
  color: "white",
  padding: "13px",
  textAlign: "left",
  fontSize: "13px",
  whiteSpace: "nowrap",
};

const estiloTd: React.CSSProperties = {
  padding: "13px",
  borderBottom: "1px solid #e5e7eb",
  color: "#374151",
  fontSize: "13px",
  verticalAlign: "middle",
};

const estiloEmail: React.CSSProperties = {
  display: "block",
  marginTop: "4px",
  fontSize: "10px",
  color: "#6b7280",
};

const estiloAcciones: React.CSSProperties = {
  display: "flex",
  gap: "5px",
  whiteSpace: "nowrap",
};

const estiloMensajeExito: React.CSSProperties = {
  backgroundColor: "#dcfce7",
  color: "#166534",
  border: "1px solid #86efac",
  padding: "12px 15px",
  borderRadius: "7px",
  marginBottom: "18px",
  fontWeight: "bold",
};

const estiloMensajeError: React.CSSProperties = {
  backgroundColor: "#fee2e2",
  color: "#991b1b",
  border: "1px solid #fca5a5",
  padding: "12px 15px",
  borderRadius: "7px",
  marginBottom: "18px",
  fontWeight: "bold",
};

const estiloCargando: React.CSSProperties = {
  padding: "50px",
  textAlign: "center",
  color: "#6b7280",
};

const estiloVacio: React.CSSProperties = {
  padding: "50px",
  textAlign: "center",
  color: "#6b7280",
};