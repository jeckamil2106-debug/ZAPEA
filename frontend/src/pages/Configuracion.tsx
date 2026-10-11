import { useEffect, useState } from "react";
import { api } from "../services/api";

interface ConfiguracionProps {
  onNavigate?: (pagina: string) => void;
}

interface Empresa {
  id: string;
  nombre: string;
  ruc?: string;
  categoria?: string;
  email?: string;
  telefono?: string;
  whatsapp?: string;
}

function Configuracion({ onNavigate }: ConfiguracionProps) {
  const usuario = JSON.parse(
    localStorage.getItem("zapea_user") || "{}"
  );

  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [cargandoEmpresa, setCargandoEmpresa] = useState(false);
  const [errorEmpresa, setErrorEmpresa] = useState("");

  useEffect(() => {
    const cargarEmpresa = async () => {
      if (!usuario?.companyId) {
        return;
      }

      try {
        setCargandoEmpresa(true);
        setErrorEmpresa("");

        const datos = await api.get(
          `/companies/${usuario.companyId}`
        );

        setEmpresa(datos);
      } catch (error) {
        console.error(
          "Error al cargar la empresa:",
          error
        );

        setErrorEmpresa(
          "No se pudo cargar la información de la empresa."
        );
      } finally {
        setCargandoEmpresa(false);
      }
    };

    cargarEmpresa();
  }, [usuario?.companyId]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "32px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <button
          onClick={() =>
            onNavigate?.("dashboard")
          }
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            marginBottom: "20px",
            fontSize: "15px",
          }}
        >
          ← Volver al panel
        </button>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "30px",
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <h1
            style={{
              marginTop: 0,
              marginBottom: "8px",
            }}
          >
            Configuración
          </h1>

          <p
            style={{
              color: "#64748b",
              marginBottom: "30px",
            }}
          >
            Administra la configuración de tu
            cuenta ZAPEA.
          </p>

          {/* ==========================================
              INFORMACIÓN DE LA CUENTA
          ========================================== */}

          <div
            style={{
              border:
                "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <h2>
              Información de la cuenta
            </h2>

            <p>
              <strong>Correo:</strong>{" "}
              {usuario?.email ||
                "No registrado"}
            </p>

            <p>
              <strong>
                Tipo de cuenta:
              </strong>{" "}
              {usuario?.role ||
                "No definido"}
            </p>

            {usuario?.role ===
              "EMPRESA" && (
              <>
                <p>
                  <strong>
                    Empresa activa:
                  </strong>{" "}
                  {cargandoEmpresa
                    ? "Cargando..."
                    : empresa?.nombre ||
                      "No disponible"}
                </p>

                {empresa && (
                  <>
                    {empresa.ruc && (
                      <p>
                        <strong>
                          RUC:
                        </strong>{" "}
                        {empresa.ruc}
                      </p>
                    )}

                    {empresa.categoria && (
                      <p>
                        <strong>
                          Categoría:
                        </strong>{" "}
                        {empresa.categoria}
                      </p>
                    )}
                  </>
                )}

                {errorEmpresa && (
                  <p
                    style={{
                      color: "#dc2626",
                    }}
                  >
                    {errorEmpresa}
                  </p>
                )}
              </>
            )}
          </div>

          {/* ==========================================
              MI EMPRESA
          ========================================== */}

          {usuario?.role ===
            "EMPRESA" && (
            <div
              style={{
                border:
                  "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <h2>
                Mi empresa
              </h2>

              <p
                style={{
                  color: "#64748b",
                }}
              >
                Desde esta sección podrás
                administrar la información
                de tu empresa.
              </p>

              {empresa && (
                <div
                  style={{
                    marginTop: "15px",
                    padding: "15px",
                    background:
                      "#f8fafc",
                    borderRadius: "10px",
                  }}
                >
                  <strong>
                    {empresa.nombre}
                  </strong>

                  {empresa.email && (
                    <p>
                      Correo:{" "}
                      {empresa.email}
                    </p>
                  )}

                  {empresa.telefono && (
                    <p>
                      Teléfono:{" "}
                      {empresa.telefono}
                    </p>
                  )}

                  {empresa.whatsapp && (
                    <p>
                      WhatsApp:{" "}
                      {empresa.whatsapp}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              SEGURIDAD
          ========================================== */}

          <div
            style={{
              border:
                "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <h2>
              Seguridad
            </h2>

            <p
              style={{
                color: "#64748b",
              }}
            >
              Tu cuenta está protegida
              mediante autenticación JWT.
            </p>

            <p
              style={{
                color: "#64748b",
                marginBottom: 0,
              }}
            >
              Las funciones avanzadas de
              seguridad se incorporarán
              después de completar las
              pruebas de acceso de las
              cuentas EMPRESA.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Configuracion;