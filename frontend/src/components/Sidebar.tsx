import { useEffect, useState } from "react";
import {
  FaHome,
  FaUsers,
  FaBuilding,
  FaChartBar,
  FaCog,
  FaBars,
  FaTimes,
  FaTools,
  FaPowerOff,
  FaSearch,
} from "react-icons/fa";

interface SidebarProps {
  onNavigate?: (page: string) => void;
}

export default function Sidebar({
  onNavigate,
}: SidebarProps) {
  const [menuAbierto, setMenuAbierto] =
    useState(false);

 const [misEmpresas, setMisEmpresas] = useState<
    { id: string; nombre: string }[]
  >([]);

  const [empresaActiva, setEmpresaActiva] =
    useState<string>("");

  useEffect(() => {
    const cargarMisEmpresas = async () => {
      try {
        const token =
          localStorage.getItem("zapea_token");

        const usuario = JSON.parse(
          localStorage.getItem("zapea_user") || "{}"
        );

        if (
          !token ||
          usuario.role !== "EMPRESA"
        ) {
          return;
        }

const API_URL = import.meta.env.VITE_API_URL;

const respuesta = await fetch(
  `${API_URL}/companies/mis-empresas`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

        if (!respuesta.ok) {
          return;
        }

        const data = await respuesta.json();

        const empresas = Array.isArray(data)
          ? data
          : Array.isArray(data?.empresas)
            ? data.empresas
            : Array.isArray(data?.data)
              ? data.data
              : [];

        setMisEmpresas(
          empresas.map((empresa: any) => ({
            id: empresa.id,
            nombre: empresa.nombre,
          }))
        );

        if (usuario.companyId) {
          setEmpresaActiva(
            usuario.companyId
          );
        }
      } catch (error) {
        console.error(
          "Error cargando mis empresas:",
          error
        );
      }
    };

    void cargarMisEmpresas();
  }, []);

  const navegar = (page: string) => {
    onNavigate?.(page);
    setMenuAbierto(false);
  };

  return (
    <>
      {/* =====================================================
          BOTÓN MENÚ
      ===================================================== */}
      <button
        type="button"
        className="zapea-mobile-menu-button"
        onClick={() =>
          setMenuAbierto((actual) => !actual)
        }
        aria-label={
          menuAbierto
            ? "Cerrar menú"
            : "Abrir menú"
        }
        aria-expanded={menuAbierto}
      >
        {menuAbierto ? (
          <FaTimes />
        ) : (
          <FaBars />
        )}
      </button>

      {/* =====================================================
          FONDO OSCURO
      ===================================================== */}
      {menuAbierto && (
        <div
          className="zapea-sidebar-overlay"
          onClick={() =>
            setMenuAbierto(false)
          }
        />
      )}

      {/* =====================================================
          MENÚ LATERAL
      ===================================================== */}
      <aside
        className={`zapea-sidebar ${
          menuAbierto
            ? "zapea-sidebar-open"
            : ""
        }`}
      >
        {/* LOGO */}
        <div className="zapea-sidebar-brand">
          <div className="zapea-sidebar-title">
            ZAPEA
          </div>

          <div className="zapea-sidebar-subtitle">
            Administración
          </div>
        </div>

        <div className="zapea-sidebar-divider" />
{/* =================================================
    SELECTOR DE EMPRESA — SOLO EMPRESA
================================================= */}
{localStorage.getItem("zapea_user") &&
  JSON.parse(
    localStorage.getItem("zapea_user") || "{}"
  )?.role === "EMPRESA" &&
  misEmpresas.length > 0 && (
    <div
      style={{
        padding: "0 16px 18px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          marginBottom: "7px",
          opacity: 0.7,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        Empresa activa
      </div>

      <select
        value={empresaActiva}
onChange={async (e) => {
  const nuevaEmpresaId = e.target.value;

  if (!nuevaEmpresaId || nuevaEmpresaId === empresaActiva) {
    return;
  }

  try {
    const token =
      localStorage.getItem("zapea_token");

    if (!token) {
      return;
    }

  const API_URL = import.meta.env.VITE_API_URL;

const respuesta = await fetch(
  `${API_URL}/auth/select-company/${nuevaEmpresaId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!respuesta.ok) {
      console.error(
        "No se pudo cambiar de empresa:",
        respuesta.status
      );
      return;
    }

    const data = await respuesta.json();

    if (!data?.access_token) {
      console.error(
        "El servidor no devolvió un nuevo token."
      );
      return;
    }

    // Guardar el nuevo token con la empresa activa
    localStorage.setItem(
      "zapea_token",
      data.access_token
    );

    // Actualizar usuario conservando sus demás datos
    const usuarioActual = JSON.parse(
      localStorage.getItem("zapea_user") || "{}"
    );

    localStorage.setItem(
      "zapea_user",
      JSON.stringify({
        ...usuarioActual,
        ...(data.user || {}),
        companyId: nuevaEmpresaId,
      })
    );

    setEmpresaActiva(nuevaEmpresaId);

    // Recargar el panel con el nuevo contexto de empresa
    window.location.reload();
  } catch (error) {
    console.error(
      "Error cambiando de empresa:",
      error
    );
  }
}}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(255,255,255,0.08)",
          color: "inherit",
          outline: "none",
          cursor: "pointer",
        }}
      >
{misEmpresas.map((empresa) => (
  <option
    key={empresa.id}
    value={empresa.id}
    style={{
      color: "#111827",
      backgroundColor: "#ffffff",
    }}
  >
    {empresa.nombre}
  </option>
))}
      </select>
    </div>
  )}
        {/* =================================================
            NAVEGACIÓN PRINCIPAL
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            navegar("dashboard")
          }
          className="zapea-sidebar-item"
        >
          <FaHome />
          <span>Panel principal</span>
        </button>
<button
  type="button"
  onClick={() =>
    navegar("busqueda")
  }
  className="zapea-sidebar-item"
>
  <FaSearch />
  <span>Búsqueda</span>
</button>
        <button
          type="button"
          onClick={() =>
            navegar("empresas")
          }
          className="zapea-sidebar-item"
        >
          <FaBuilding />
          <span>Empresas</span>
        </button>

{/* SERVICIOS — SOLO ADMIN */}
{localStorage.getItem("zapea_user") &&
  JSON.parse(localStorage.getItem("zapea_user") || "{}")?.role === "ADMIN" && (
    <button
      type="button"
      className="zapea-sidebar-item"
      onClick={() => navegar("servicios")}
    >
      <FaTools />
      <span>Servicios</span>
    </button>
  )}

{/* CUENTAS DE EMPRESA — SOLO ADMIN */}
{localStorage.getItem("zapea_user") &&
  JSON.parse(localStorage.getItem("zapea_user") || "{}")?.role === "ADMIN" && (
    <button
      type="button"
      className="zapea-sidebar-item"
      onClick={() => navegar("crear-cuenta-empresa")}
    >
      <FaUsers />
      <span>Cuentas de empresa</span>
    </button>
  )}


        {/* ESTADÍSTICAS */}
        <button
          type="button"
          className="zapea-sidebar-item zapea-sidebar-item-disabled"
          disabled
          title="Disponible próximamente"
        >
          <FaChartBar />
          <span>Estadísticas</span>

          <small className="zapea-sidebar-soon">
            Próximamente
          </small>
        </button>

        {/* CONFIGURACIÓN */}
        <button
          type="button"
          onClick={() =>
            navegar("configuracion")
          }
          className="zapea-sidebar-item"
        >
          <FaCog />
          <span>Configuración</span>
        </button>

        <div className="zapea-sidebar-spacer" />

        {/* =================================================
            PIE DEL MENÚ
        ================================================= */}

        <div className="zapea-sidebar-footer">
          <div className="zapea-sidebar-footer-line" />

          <button
            type="button"
            className="zapea-sidebar-item zapea-sidebar-logout"
onClick={() => {
  // Cerrar sesión
  localStorage.removeItem("zapea_token");
  localStorage.removeItem("zapea_user");

  setMenuAbierto(false);

  // Reemplazar la página actual para evitar
  // regresar al panel mediante el botón Atrás
  window.location.replace("/login");
}}
          >
            <FaPowerOff />
            <span>Cerrar sesión</span>
          </button>

          <div className="zapea-sidebar-version">
            ZAPEA · Administración
          </div>
        </div>
      </aside>
    </>
  );
}