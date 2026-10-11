import { useEffect, useState } from "react";

interface Empresa {
  id: string;
  nombre: string;
  ownerId?: string | null;
}

export default function CrearCuentaEmpresa() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaId, setEmpresaId] = useState("");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
const [cuentasEmpresa, setCuentasEmpresa] = useState<any[]>([]);


  useEffect(() => {
    const cargarEmpresas = async () => {
      try {
        const token = localStorage.getItem("zapea_token");
        const API_URL = import.meta.env.VITE_API_URL;

        const respuesta = await fetch(
          `${API_URL}/companies`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar las empresas");
        }

        const data = await respuesta.json();

        const lista = Array.isArray(data)
          ? data
          : Array.isArray(data?.empresas)
            ? data.empresas
            : Array.isArray(data?.data)
              ? data.data
              : [];

        setEmpresas(lista);
      } catch (error) {
        console.error(error);
        setError("No se pudieron cargar las empresas.");
      } finally {
        setCargando(false);
      }
    };

    void cargarEmpresas();
  }, []);

  useEffect(() => {
    const cargarCuentasEmpresa = async () => {
      try {
        const token = localStorage.getItem("zapea_token");
        const API_URL = import.meta.env.VITE_API_URL;

        const respuesta = await fetch(
          `${API_URL}/auth/cuentas-empresa`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!respuesta.ok) {
          throw new Error(
            "No se pudieron cargar las cuentas de empresa"
          );
        }

        const data = await respuesta.json();

        setCuentasEmpresa(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "Error cargando cuentas empresa:",
          error
        );
      }
    };

    void cargarCuentasEmpresa();
  }, []);

  const crearCuenta = async () => {
    setMensaje("");
    setError("");

    if (!nombre || !email || !password || !empresaId) {
      setError("Completa todos los campos.");
      return;
    }

    try {
      const token = localStorage.getItem("zapea_token");
      const API_URL = import.meta.env.VITE_API_URL;

      const respuesta = await fetch(
        `${API_URL}/auth/create-empresa`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: nombre,
            email,
            password,
            companyId: empresaId,
          }),
        }
      );

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          data?.message ||
            "No se pudo crear la cuenta."
        );
      }

    setMensaje(
  "Cuenta de empresa creada correctamente."
);

const empresaSeleccionada = empresas.find(
  (empresa) => empresa.id === empresaId
);

setCuentasEmpresa((actuales) => [
  {
    id: data.user.id,
    name: data.user.name,
    email: data.user.email,
    role: "EMPRESA",
    isActive: true,
    companies: empresaSeleccionada
      ? [
          {
            id: empresaSeleccionada.id,
            nombre: empresaSeleccionada.nombre,
          },
        ]
      : [],
  },
  ...actuales,
]);

setEmpresas((actuales) =>
  actuales.map((empresa) =>
    empresa.id === empresaId
      ? {
          ...empresa,
          ownerId: data.user.id,
        }
      : empresa
  )
);

setNombre("");
setEmail("");
setPassword("");
setEmpresaId("");
    } catch (error: any) {
      console.error(error);
      setError(
        error?.message ||
          "Ocurrió un error al crear la cuenta."
      );
    }
  };

 if (cargando) {
    return (
      <div className="zapea-cuenta-page">
        
        <div className="zapea-cuenta-header">
          <h1>Crear cuenta de empresa</h1>
          <p>Cargando empresas...</p>
        </div>
      </div>
    );
  }

  return (
    <div
  className="zapea-cuenta-page"
  style={{
    display: "flex",
    flexDirection: "column",
  }}
>
<button
  type="button"
  onClick={() => window.location.href = "/admin"}
style={{
  alignSelf: "flex-end",
  background: "#ffffff",
  color: "#2563eb",
  border: "1px solid #dbe3ef",
  borderRadius: "8px",
  padding: "8px 13px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 2px 6px rgba(15, 23, 42, 0.08)",
  marginBottom: "22px",
}}
>
  ← Volver 
</button>
      <div className="zapea-cuenta-header">
        <h1>Crear cuenta de empresa</h1>

        <p>
          Asigna una cuenta de acceso a una empresa
          registrada en ZAPEA.
        </p>
      </div>

      <div className="zapea-cuenta-card">

        <div className="zapea-cuenta-field">
          <label>Nombre del usuario</label>

          <input
            type="text"
            value={nombre}
            onChange={(e) =>
              setNombre(e.target.value)
            }
            placeholder="Nombre del propietario"
          />
        </div>

        <div className="zapea-cuenta-field">
          <label>Correo electrónico</label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="correo@empresa.com"
          />
        </div>

        <div className="zapea-cuenta-field">
          <label>Contraseña</label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div className="zapea-cuenta-field">
          <label>Empresa</label>

          <select
            value={empresaId}
            onChange={(e) =>
              setEmpresaId(e.target.value)
            }
          >
            <option value="">
              Seleccionar empresa
            </option>

            {empresas.map((empresa) => (
              <option
                key={empresa.id}
                value={empresa.id}
                disabled={Boolean(empresa.ownerId)}
              >
                {empresa.nombre}
                {empresa.ownerId
                  ? " — Ya tiene cuenta"
                  : ""}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="zapea-cuenta-mensaje zapea-cuenta-mensaje-error">
            {error}
          </div>
        )}

        {mensaje && (
          <div className="zapea-cuenta-mensaje zapea-cuenta-mensaje-exito">
            {mensaje}
          </div>
        )}

     <button
          type="button"
          className="zapea-cuenta-button"
          onClick={crearCuenta}
        >
          Crear cuenta EMPRESA
        </button>

      </div>

      <div className="zapea-cuentas-lista">
        <h2>Cuentas de empresa registradas</h2>

        {cuentasEmpresa.length === 0 ? (
          <p>No hay cuentas de empresa registradas.</p>
        ) : (
          cuentasEmpresa.map((cuenta) => (
            <div
              key={cuenta.id}
              className="zapea-cuenta-item"
            >
              <div>
                <strong>{cuenta.name}</strong>
                <span>{cuenta.email}</span>
              </div>

<div>
  <div>
    {cuenta.companies?.length > 0
      ? cuenta.companies[0].nombre
      : "Sin empresa asignada"}
  </div>

  <div
    style={{
      display: "inline-block",
      marginTop: "8px",
      padding: "5px 10px",
      borderRadius: "20px",
      background: cuenta.isActive
        ? "#dcfce7"
        : "#fee2e2",
      color: cuenta.isActive
        ? "#166534"
        : "#991b1b",
      fontSize: "12px",
      fontWeight: 900,
      letterSpacing: "0.4px",
    }}
  >
    {cuenta.isActive ? "ACTIVA" : "DESACTIVADA"}
  </div>

  <button
    type="button"
    onClick={async () => {
      try {
        const token = localStorage.getItem("zapea_token");
        const API_URL = import.meta.env.VITE_API_URL;

        const respuesta = await fetch(
          `${API_URL}/auth/cuentas-empresa/${cuenta.id}/estado`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              isActive: !cuenta.isActive,
            }),
          }
        );

        const data = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(
            data?.message ||
              "No se pudo cambiar el estado de la cuenta."
          );
        }

        setCuentasEmpresa((actuales) =>
          actuales.map((item) =>
            item.id === cuenta.id
              ? {
                  ...item,
                  isActive: data.isActive,
                }
              : item
          )
        );
      } catch (error: any) {
        console.error(error);
        setError(
          error?.message ||
            "No se pudo cambiar el estado de la cuenta."
        );
      }
    }}
    style={{
      marginTop: "10px",
      padding: "7px 12px",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: 800,
    }}
  >
    {cuenta.isActive
      ? "Desactivar cuenta"
      : "Activar cuenta"}
 </button>

    </div>
      </div>
          ))
        )}
      </div>

    </div>
  );
}