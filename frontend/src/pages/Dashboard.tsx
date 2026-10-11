import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

// Mantiene funcionando tu entorno actual desde PC y celular
const API_URL =
  import.meta.env.VITE_API_URL ||
  `http://${window.location.hostname}:3000`;
  const usuarioActual = (() => {
  try {
    return JSON.parse(
      localStorage.getItem("zapea_user") || "{}"
    );
  } catch {
    return {};
  }
})();

export default function Dashboard({
  onNavigate,
}: DashboardProps) {
const [totalEmpresas, setTotalEmpresas] = useState(0);
const [totalServicios, setTotalServicios] = useState(0);
const [cargando, setCargando] = useState(true);

const [analitica, setAnalitica] = useState({
  total: 0,
  vistasPerfil: 0,
  vistasServicio: 0,
  whatsapp: 0,
  telefono: 0,
  email: 0,
  mapa: 0,
  facebook: 0,
  visitantesUnicos: 0,
  visitantesQueVieronServicio: 0,
  visitantesQueContactaron: 0,
  tasaConversion: 0,
  cambioTotal: 0,
});

const [cargandoAnalitica, setCargandoAnalitica] = useState(true);

const [serviciosMasVistos, setServiciosMasVistos] = useState<any[]>([]);

const [periodoAnalitica, setPeriodoAnalitica] = useState("all");

const solicitudAnalitica = useRef(0);
useEffect(() => {
    const cargarResumen = async () => {
      try {
        setCargando(true);

        const respuesta = await fetch(
          `${API_URL}/companies`,
        );

        if (!respuesta.ok) {
          throw new Error(
            "No se pudo cargar el resumen.",
          );
        }

        const data = await respuesta.json();

        const lista = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.companies)
              ? data.companies
              : Array.isArray(data?.empresas)
                ? data.empresas
                : [];

        setTotalEmpresas(lista.length);
        const respuestaServicios = await fetch(
  `${API_URL}/services/count`,
);

if (!respuestaServicios.ok) {
  throw new Error(
    "No se pudo obtener el total de servicios.",
  );
}

const totalServiciosBackend =
  await respuestaServicios.json();

setTotalServicios(
  Number(totalServiciosBackend) || 0,
);
      } catch (error) {
        console.error(
          "Error cargando resumen del dashboard:",
          error,
        );

        setTotalEmpresas(0);
      } finally {
        setCargando(false);
      }
    };

    void cargarResumen();
    }, []);

  // =====================================================
  // CARGAR ANALÍTICA
  // =====================================================

useEffect(() => {
  let cancelado = false;
  let intervalo: ReturnType<typeof setInterval> | undefined;

  const esperarToken = async (): Promise<string | null> => {
    for (let intento = 0; intento < 25; intento++) {
      const token = localStorage.getItem("zapea_token");

      if (token) {
        return token;
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return null;
  };

const cargarAnalitica = async () => {
  const idSolicitud = ++solicitudAnalitica.current;

  try {
    setCargandoAnalitica(true);

    const token = await esperarToken();

      if (!token) {
        console.warn(
          "No se encontró zapea_token después de esperar."
        );
        return;
      }

      const respuesta = await fetch(
        `${API_URL}/analytics?period=${periodoAnalitica}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "URL ANALÍTICA:",
        `${API_URL}/analytics?period=${periodoAnalitica}`
      );

      console.log(
        "STATUS ANALYTICS:",
        respuesta.status
      );

      if (!respuesta.ok) {
        throw new Error(
          `No se pudo cargar la analítica. Status: ${respuesta.status}`
        );
      }

const data = await respuesta.json();

console.log("DATOS ANALÍTICA:", data);

if (
  cancelado ||
  idSolicitud !== solicitudAnalitica.current
) {
  return;
}

setAnalitica({
        total: data?.resumen?.total ?? 0,
        vistasPerfil:
          data?.resumen?.vistasPerfil ?? 0,
        vistasServicio:
          data?.resumen?.vistasServicio ?? 0,
        whatsapp:
          data?.resumen?.whatsapp ?? 0,
        telefono:
          data?.resumen?.telefono ?? 0,
        email:
          data?.resumen?.email ?? 0,
        mapa:
          data?.resumen?.mapa ?? 0,
        facebook:
          data?.resumen?.facebook ?? 0,
        visitantesUnicos:
          data?.resumen?.visitantesUnicos ?? 0,
        visitantesQueVieronServicio:
          data?.resumen?.visitantesQueVieronServicio ?? 0,
        visitantesQueContactaron:
          data?.resumen?.visitantesQueContactaron ?? 0,
        tasaConversion:
          data?.resumen?.tasaConversion ?? 0,
        cambioTotal:
          data?.resumen?.cambioTotal ?? null,
      });

      setServiciosMasVistos(
        Array.isArray(data?.serviciosMasVistos)
          ? data.serviciosMasVistos
          : []
      );
    } catch (error) {
      if (!cancelado) {
        console.error(
          "Error cargando analítica:",
          error
        );
      }
    } finally {
      if (!cancelado) {
        setCargandoAnalitica(false);
      }
    }
  };

  void cargarAnalitica();

  intervalo = setInterval(() => {
    void cargarAnalitica();
  }, 30000);

  return () => {
    cancelado = true;

    if (intervalo) {
      clearInterval(intervalo);
    }
  };
}, [periodoAnalitica]);

  const obtenerRangoAnalitica = () => {
  const hoy = new Date();

  if (periodoAnalitica === "all") {
    return "Mostrando todo el historial";
  }

  const dias =
    periodoAnalitica === "7d"
      ? 7
      : periodoAnalitica === "30d"
        ? 30
        : 90;

  const desde = new Date(hoy);
  desde.setDate(hoy.getDate() - (dias - 1));

  const formatearFecha = (fecha: Date) =>
    fecha.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return `Datos del ${formatearFecha(desde)} al ${formatearFecha(hoy)}`;
};

const rangoAnalitica = obtenerRangoAnalitica();

  const irAEmpresas = () => {
    onNavigate?.("companies");
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8fafc 0%, #eef4ff 100%)",
        color: "#0f172a",
      }}
    >
      <Sidebar onNavigate={onNavigate} />

      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: "18px",
        }}
      >
        {/* =====================================================
            CABECERA
        ===================================================== */}
       {usuarioActual.role === "ADMIN" && (
        <section
          style={{
            background:
              "linear-gradient(135deg, #0f172a 0%, #162d56 55%, #2563eb 100%)",
            borderRadius: "22px",
            padding: "30px",
            color: "#ffffff",
            boxShadow:
              "0 18px 45px rgba(15, 23, 42, 0.16)",
            marginBottom: "24px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decoración */}
          <div
            style={{
              position: "absolute",
              width: "220px",
              height: "220px",
              borderRadius: "50%",
              background:
                "rgba(255,255,255,0.06)",
              right: "-80px",
              top: "-90px",
            }}
          />

          <div
            style={{
              position: "absolute",
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              background:
                "rgba(96,165,250,0.10)",
              right: "120px",
              bottom: "-80px",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              maxWidth: "760px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "1.8px",
                color: "#93c5fd",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              ZAPEA · ADMINISTRACIÓN
            </div>

            <h1
              style={{
                margin: 0,
                fontSize:
                  "clamp(28px, 4vw, 42px)",
                lineHeight: 1.08,
                fontWeight: 900,
                letterSpacing: "-0.8px",
              }}
            >
              Bienvenido a ZAPEA
            </h1>

            <p
              style={{
                margin:
                  "12px 0 0",
                color: "#dbeafe",
                fontSize:
                  "clamp(14px, 2vw, 17px)",
                lineHeight: 1.6,
              }}
            >
              Administra empresas y contenidos
              desde un solo lugar.
            </p>
          </div>
        </section>
)}

        {/* =====================================================
            ESTADÍSTICAS
        ===================================================== */}
       {usuarioActual.role === "ADMIN" && (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          {/* EMPRESAS */}
          <div
            style={{
              background: "#ffffff",
              border:
                "1px solid #dbeafe",
              borderRadius: "18px",
              padding: "22px",
              boxShadow:
                "0 8px 25px rgba(15, 23, 42, 0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                gap: "12px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#64748b",
                    marginBottom: "8px",
                  }}
                >
                  Empresas registradas
                </div>

                <div
                  style={{
                    fontSize: "30px",
                    fontWeight: 900,
                    color: "#0f172a",
                    lineHeight: 1,
                  }}
                >
                  {cargando
                    ? "—"
                    : totalEmpresas}
                </div>

                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "12px",
                    color: "#16a34a",
                    fontWeight: 700,
                  }}
                >
                  ● Sistema conectado
                </div>
              </div>

              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "14px",
                  background:
                    "linear-gradient(135deg, #2563eb, #60a5fa)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "30px",
                  boxShadow:
                    "0 8px 18px rgba(37,99,235,0.25)",
                }}
              >
                🏢
              </div>
            </div>
          </div>

          {/* SERVICIOS */}
          <div
            style={{
              background: "#ffffff",
              border:
                "1px solid #e2e8f0",
              borderRadius: "18px",
              padding: "16px",
              boxShadow:
                "0 8px 25px rgba(15, 23, 42, 0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#64748b",
                    marginBottom: "8px",
                  }}
                >
                  Servicios
                </div>

<div
  style={{
    fontSize: "30px",
    fontWeight: 900,
    color: "#0f172a",
    lineHeight: 1,
  }}
>
  {cargando
    ? "—"
    : totalServicios}
</div>

<div
  style={{
    marginTop: "8px",
    fontSize: "12px",
    color: "#7c3aed",
    fontWeight: 700,
  }}
>
  Servicios registrados
</div>
              </div>

              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "14px",
                  background:
                    "linear-gradient(135deg, #7c3aed, #a78bfa)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}
              >
                🧰
              </div>
            </div>
          </div>

          {/* CONTACTOS */}
          <div
            style={{
              background: "#ffffff",
              border:
                "1px solid #e2e8f0",
              borderRadius: "18px",
              padding: "16px",
              boxShadow:
                "0 8px 25px rgba(15, 23, 42, 0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#64748b",
                    marginBottom: "8px",
                  }}
                >
                  Contactos
                </div>

<div
  style={{
    fontSize: "30px",
    fontWeight: 900,
    color: "#0f172a",
    lineHeight: 1,
  }}
>
  {cargandoAnalitica
    ? "—"
    : analitica.whatsapp +
      analitica.telefono +
      analitica.email}
</div>

<div
  style={{
    marginTop: "8px",
    fontSize: "12px",
    color: "#059669",
    fontWeight: 700,
  }}
>
  Interacciones de contacto
</div>
              </div>

              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "14px",
                  background:
                    "linear-gradient(135deg, #059669, #34d399)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}
              >
                👥
              </div>
            </div>
          </div>
        </section>
)}
        
{/* =====================================================
    ANALÍTICA ZAPEA
===================================================== */}
{usuarioActual.role === "ADMIN" && (
  <section
  id="analitica-zapea"
  style={{
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "24px",
    boxShadow:
      "0 8px 25px rgba(15, 23, 42, 0.06)",
    marginBottom: "24px",
  }}
>
  <div style={{ marginBottom: "20px" }}>
    <div
      style={{
        fontSize: "11px",
        fontWeight: 800,
        letterSpacing: "1.4px",
        color: "#2563eb",
        textTransform: "uppercase",
        marginBottom: "5px",
      }}
    >
      ANALÍTICA ZAPEA
    </div>

  <h2
      style={{
        margin: 0,
        fontSize: "24px",
        fontWeight: 900,
        color: "#0f172a",
      }}
    >
      Actividad de las empresas
    </h2>

    <p
      style={{
        margin: "7px 0 0",
        color: "#64748b",
        fontSize: "14px",
      }}
    >
      Interacciones registradas en ZAPEA.
    </p>


     <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "12px",
      }}
    >
      {[
        {
          nombre: "Vistas de perfil",
          valor: analitica.vistasPerfil,
          icono: "👁️",
        },
        {
          nombre: "Vistas de servicio",
          valor: analitica.vistasServicio,
          icono: "🧰",
        },
        {
          nombre: "WhatsApp",
          valor: analitica.whatsapp,
          icono: "💬",
        },
        {
          nombre: "Teléfono",
          valor: analitica.telefono,
          icono: "📞",
        },
        {
          nombre: "Correo",
          valor: analitica.email,
          icono: "✉️",
        },
        {
          nombre: "Mapa",
          valor: analitica.mapa,
          icono: "📍",
        },
        {
          nombre: "Facebook",
          valor: analitica.facebook,
          icono: "👍",
        },
      ].map((item) => (
        <div
          key={item.nombre}
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "16px",
            background: "#f8fafc",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "22px",
              marginBottom: "8px",
            }}
          >
            {item.icono}
          </div>

          <div
            style={{
              fontSize: "26px",
              fontWeight: 900,
              color: "#0f172a",
            }}
          >
            {cargandoAnalitica ? "—" : item.valor}
          </div>

          <div
            style={{
              marginTop: "5px",
              fontSize: "12px",
              fontWeight: 700,
              color: "#64748b",
            }}
          >
            {item.nombre}
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
)}

{/* SERVICIOS MÁS VISTOS */}
{usuarioActual.role === "ADMIN" && (
  <div
    style={{
      marginTop: "24px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 8px 25px rgba(15, 23, 42, 0.05)",
  }}
>
  <div
    style={{
      textAlign: "center",
      marginBottom: "20px",
    }}
  >
    <div
      style={{
        color: "#2563eb",
        fontSize: "12px",
        fontWeight: 800,
        letterSpacing: "2px",
        marginBottom: "6px",
      }}
    >
      SERVICIOS MÁS VISTOS
    </div>
    

    <h2
      style={{
        margin: 0,
        fontSize: "24px",
        fontWeight: 900,
        color: "#0f172a",
      }}
    >
      Popularidad de servicios
    </h2>

    <p
      style={{
        margin: "7px 0 0",
        color: "#64748b",
        fontSize: "14px",
      }}
    >
      Conoce qué servicios generan mayor interés.
    </p>
  </div>

  {serviciosMasVistos.length === 0 ? (
    <div
      style={{
        textAlign: "center",
        padding: "25px",
        color: "#64748b",
        background: "#f8fafc",
        borderRadius: "14px",
      }}
    >
      Aún no hay vistas registradas para los servicios.
    </div>
  ) : (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "12px",
      }}
    >
      {serviciosMasVistos.map((servicio, index) => (
        <div
          key={servicio.serviceId}
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "16px",
            background: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "12px",
                background:
                  "linear-gradient(135deg, #2563eb, #7c3aed)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
              }}
            >
              {index + 1}
            </div>

            <div>
              <div
                style={{
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                {servicio.nombre}
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginTop: "3px",
                }}
              >
                Servicio más consultado
              </div>
            </div>
          </div>

          <div
            style={{
              textAlign: "center",
              minWidth: "60px",
            }}
          >
            <div
              style={{
                fontSize: "22px",
                fontWeight: 900,
                color: "#2563eb",
              }}
            >
              {servicio.vistas}
            </div>

            <div
              style={{
                fontSize: "11px",
                color: "#64748b",
              }}
            >
              vistas
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
  </div>
  )}

  {/* =====================================================
      RENDIMIENTO DE LA EMPRESA
  ===================================================== */}
<div
  style={{
    marginTop: "24px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 8px 25px rgba(15, 23, 42, 0.05)",
  }}
>
  <div
    style={{
      textAlign: "center",
      marginBottom: "20px",
    }}
  >
    <div
      style={{
        color: "#2563eb",
        fontSize: "12px",
        fontWeight: 800,
        letterSpacing: "2px",
        marginBottom: "6px",
      }}
    >
      RENDIMIENTO DE LA EMPRESA
    </div>
<div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    marginBottom: "15px",
  }}
>
  <select
    value={periodoAnalitica}
    onChange={(e) => setPeriodoAnalitica(e.target.value)}
    style={{
      padding: "8px 14px",
      borderRadius: "8px",
      border: "1px solid #dbe3f0",
      background: "#fff",
      color: "#0f172a",
      fontWeight: 600,
      cursor: "pointer",
    }}
  >
<option value="7d">Últimos 7 días</option>
<option value="30d">Últimos 30 días</option>
<option value="90d">Últimos 90 días</option>
<option value="all">Todo el historial</option>
</select>
<p
  style={{
    margin: "0",
    color: "#64748b",
    fontSize: "12px",
    textAlign: "center",
  }}
>
  {rangoAnalitica}
</p>
</div>
    <h2
      style={{
        margin: 0,
        fontSize: "24px",
        fontWeight: 900,
        color: "#0f172a",
      }}
    >
      Rendimiento en ZAPEA
    </h2>

    <p
      style={{
        margin: "7px 0 0",
        color: "#64748b",
        fontSize: "14px",
      }}
    >
      Resumen del comportamiento de los visitantes.
    </p>
  </div>

{(() => {
const indicadores = [
  {
    nombre: "Interacciones totales",
    valor: analitica.total,
    icono: "📊",
  },
  {
    nombre: "Visitantes únicos",
    valor: analitica.visitantesUnicos,
    icono: "👥",
  },

  {
  nombre: "Visitantes que vieron servicios",
  valor: analitica.visitantesQueVieronServicio,
  icono: "🔎",
},
  {
    nombre: "Vistas de servicios",
    valor: analitica.vistasServicio,
    icono: "🛠️",
  },
  {
    nombre: "Visitantes que contactaron",
    valor: analitica.visitantesQueContactaron,
    icono: "📞",
  },
  {
    nombre: "Tasa de conversión",
    valor: `${analitica.tasaConversion}%`,
    icono: "🎯",
  },
];

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "12px",
        }}
      >
        {indicadores.map((item) => (
          <div
            key={item.nombre}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "18px",
              background: "#f8fafc",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "25px",
                marginBottom: "8px",
              }}
            >
              {item.icono}
            </div>

            <div
              style={{
                fontSize: "25px",
                fontWeight: 900,
                color: "#0f172a",
              }}
            >
              {String(item.valor)}
            </div>
            <div
              style={{
                marginTop: "5px",
                fontSize: "12px",
                fontWeight: 700,
                color: "#64748b",
              }}
            >
              {item.nombre}
            </div>
{item.nombre === "Interacciones totales" &&
periodoAnalitica !== "all" &&
periodoAnalitica !== "" &&
analitica.cambioTotal !== null && (
  <div
    style={{
      marginTop: "6px",
      fontSize: "11px",
      fontWeight: 700,
      color:
        analitica.cambioTotal >= 0
          ? "#16a34a"
          : "#dc2626",
    }}
  >
    {analitica.cambioTotal >= 0 ? "↑" : "↓"}{" "}
    {Math.abs(analitica.cambioTotal)}% vs período anterior
  </div>
)}
          </div>
        ))}
      </div>
    );
  })()}
</div>

{/* ACTIVIDAD DE INTERACCIONES */}

  <div
    style={{
      marginTop: "24px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 8px 25px rgba(15, 23, 42, 0.05)",
  }}
>
  <div
    style={{
      textAlign: "center",
      marginBottom: "24px",
    }}
  >
    <div
      style={{
        color: "#2563eb",
        fontSize: "12px",
        fontWeight: 800,
        letterSpacing: "2px",
        marginBottom: "6px",
      }}
    >
      ACTIVIDAD ZAPEA
    </div>

    <h2
      style={{
        margin: 0,
        fontSize: "24px",
        fontWeight: 900,
        color: "#0f172a",
      }}
    >
      Interacciones de los visitantes
    </h2>

    <p
      style={{
        margin: "7px 0 0",
        color: "#64748b",
        fontSize: "14px",
      }}
    >
      Observa qué acciones generan mayor interés.
    </p>
  </div>

{(() => {
  const interacciones = [
    {
      nombre: "Vistas de perfil",
      valor: analitica.vistasPerfil,
      icono: "👁️",
    },
    {
      nombre: "Vistas de servicio",
      valor: analitica.vistasServicio,
      icono: "🛠️",
    },
    {
      nombre: "WhatsApp",
      valor: analitica.whatsapp,
      icono: "💬",
    },
    {
      nombre: "Teléfono",
      valor: analitica.telefono,
      icono: "📞",
    },
    {
      nombre: "Correo",
      valor: analitica.email,
      icono: "✉️",
    },
    {
      nombre: "Mapa",
      valor: analitica.mapa,
      icono: "📍",
    },
    {
      nombre: "Facebook",
      valor: analitica.facebook,
      icono: "👍",
    },
  ];

  const maximo = Math.max(
    ...interacciones.map((item) => item.valor),
    1
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "12px",
        width: "100%",
      }}
    >
      {interacciones.map((item) => {
        const porcentaje =
          item.valor > 0
            ? Math.max((item.valor / maximo) * 100, 8)
            : 0;

        return (
          <div
            key={item.nombre}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "14px 10px",
              background: "#f8fafc",
              textAlign: "center",
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontSize: "24px",
                marginBottom: "5px",
              }}
            >
              {item.icono}
            </div>

            <div
              style={{
                fontSize: "24px",
                fontWeight: 900,
                color: "#0f172a",
                lineHeight: 1,
              }}
            >
              {cargandoAnalitica ? "—" : item.valor}
            </div>

            <div
              style={{
                marginTop: "7px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#64748b",
                minHeight: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {item.nombre}
            </div>

            <div
              style={{
                width: "100%",
                height: "7px",
                marginTop: "8px",
                background: "#e2e8f0",
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${porcentaje}%`,
                  height: "100%",
                  background:
                    "linear-gradient(90deg, #2563eb, #7c3aed)",
                  borderRadius: "999px",
                  transition: "width 0.4s ease",
                }}
              />
            </div>
    </div>
  );
    })}
  </div>
  );
})()}
</div>
{/* =====================================================
    ACCESOS RÁPIDOS
===================================================== */}
{usuarioActual.role === "ADMIN" && (
  <section
    style={{
            background: "#ffffff",
            border:
              "1px solid #e2e8f0",
            borderRadius: "20px",
            padding: "24px",
            boxShadow:
              "0 8px 25px rgba(15, 23, 42, 0.06)",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "1.4px",
                color: "#2563eb",
                textTransform: "uppercase",
                marginBottom: "5px",
              }}
            >
              ACCESOS RÁPIDOS
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: "24px",
                fontWeight: 900,
                color: "#0f172a",
              }}
            >
              Gestiona ZAPEA
            </h2>

            <p
              style={{
                margin:
                  "7px 0 0",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Accede rápidamente a los
              módulos principales.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "14px",
            }}
          >
            {/* EMPRESAS */}
            <button
              type="button"
              onClick={irAEmpresas}
              style={{
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                borderRadius: "16px",
                padding: "18px",
                background:
                  "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "#ffffff",
                boxShadow:
                  "0 10px 25px rgba(37,99,235,0.20)",
              }}
            >
              <div
                style={{
                  fontSize: "25px",
                  marginBottom: "10px",
                }}
              >
                🏢
              </div>

              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                }}
              >
                Empresas
              </div>

              <div
                style={{
                  marginTop: "5px",
                  fontSize: "12px",
                  color: "#dbeafe",
                  lineHeight: 1.4,
                }}
              >
                Registrar, editar y gestionar
                empresas.
              </div>
            </button>

            {/* NUEVA EMPRESA */}
            <button
              type="button"
              onClick={irAEmpresas}
              style={{
                border:
                  "1px solid #dbeafe",
                textAlign: "left",
                cursor: "pointer",
                borderRadius: "16px",
                padding: "18px",
                background: "#f8fbff",
                color: "#0f172a",
              }}
            >
              <div
                style={{
                  fontSize: "25px",
                  marginBottom: "10px",
                }}
              >
                ➕
              </div>

              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                }}
              >
                Nueva empresa
              </div>

              <div
                style={{
                  marginTop: "5px",
                  fontSize: "12px",
                  color: "#64748b",
                  lineHeight: 1.4,
                }}
              >
                Crear un nuevo perfil
                empresarial.
              </div>
            </button>

{/* ANALÍTICA */}
<button
  type="button"
  onClick={() => {
    document
      .getElementById("analitica-zapea")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }}
  style={{
    border: "1px solid #dbeafe",
    borderRadius: "16px",
    padding: "18px",
    background: "#f8fbff",
    color: "#0f172a",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
  }}
>
  <div
    style={{
      fontSize: "25px",
      marginBottom: "10px",
    }}
  >
    📊
  </div>

  <div
    style={{
      fontSize: "16px",
      fontWeight: 800,
    }}
  >
    Analítica
  </div>

  <div
    style={{
      marginTop: "5px",
      fontSize: "12px",
      color: "#64748b",
      lineHeight: 1.4,
    }}
  >
    Consulta el rendimiento y las
    interacciones de ZAPEA.
  </div>
</button>
            {/* CONFIGURACIÓN */}
            <div
              style={{
                border:
                  "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "18px",
                background: "#ffffff",
                opacity: 0.8,
              }}
            >
              <div
                style={{
                  fontSize: "25px",
                  marginBottom: "10px",
                }}
              >
                ⚙️
              </div>

              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                }}
              >
                Configuración
              </div>

              <div
                style={{
                  marginTop: "5px",
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                Disponible próximamente.
              </div>
            </div>
          </div>
</section>
)}

{/* =====================================================
    ESTADO DEL SISTEMA
===================================================== */}
        {usuarioActual.role === "ADMIN" && (
  <section
          style={{
            background: "#ffffff",
            border:
              "1px solid #e2e8f0",
            borderRadius: "20px",
            padding: "22px",
            boxShadow:
              "0 8px 25px rgba(15, 23, 42, 0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "#22c55e",
                boxShadow:
                  "0 0 0 5px rgba(34,197,94,0.12)",
              }}
            />

            <div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                Sistema operativo
              </div>

              <div
                style={{
                  marginTop: "3px",
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                ZAPEA está conectado al backend
                y listo para administrar empresas.
              </div>
            </div>
          </div>
        </section>
        )}
      </main>
    </div>
  );
}