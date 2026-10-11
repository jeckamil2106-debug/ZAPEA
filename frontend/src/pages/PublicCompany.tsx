import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;
console.log("ZAPEA API_URL:", API_URL);
type Empresa = {
  id: string | number;
  name: string;
  ruc: string;
  phone: string;
  whatsapp: string;
  facebook: string;
  email: string;
  address: string;
  description: string;
  servicios: any[];
  categoria: string;
  logoUrl: string;
  portadaUrl: string;
};

type GalleryImage = {
  id: string;
  url: string;
};

type ServicioBD = {
  id: string;
  nombre: string;
  descripcion?: string | null;
  precioDesde?: number | string | null;
  imagenUrl?: string | null;
  destacado?: boolean;
};
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
};
type PublicCompanyProps = {
  companyId: string;
};

export default function PublicCompany({
  companyId,
}: PublicCompanyProps) {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<number | null>(null);
const [zoomPercent, setZoomPercent] = useState(100);
    const [mostrarCompartir, setMostrarCompartir] =
  useState(false);
  const [posicion, setPosicion] = useState({ x: 0, y: 0 });
const [arrastrando, setArrastrando] = useState(false);
const [inicioArrastre, setInicioArrastre] = useState({ x: 0, y: 0 });
const touchInicio = React.useRef<{
  x: number;
  y: number;
} | null>(null);
const pinchDistanciaInicial = React.useRef<number | null>(
  null
);

const pinchZoomInicial = React.useRef(100);

const modoTouch = React.useRef<
  "ninguno" | "swipe" | "pinch"
>("ninguno");
const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [imagenesServicio, setImagenesServicio] = useState<any[]>([]);
  const [servicioSeleccionado, setServicioSeleccionado] =
  useState<ServicioBD | null>(null);
  const [indiceImagenAmpliada, setIndiceImagenAmpliada] =
  useState<number | null>(null);
const [, setIndiceGaleriaServicio] =
  useState<number | null>(null);
const [zoomImagen, setZoomImagen] =
  useState(1);
  const distanciaInicialPinch = React.useRef(0);
const zoomInicialPinch = React.useRef(1);
const inicioSwipeServicio = React.useRef<{
  x: number;
  y: number;
} | null>(null);
// =====================================================
// GESTOS TÁCTILES - GALERÍA DEL SERVICIO
// 1 DEDO = CAMBIAR IMAGEN
// 2 DEDOS = PINCH ZOOM
// =====================================================

const modoToqueServicio = React.useRef<
  "ninguno" | "swipe" | "pinch"
>("ninguno");
  const [posicionImagen, setPosicionImagen] =
  useState({ x: 0, y: 0 });

const [arrastrandoImagen, setArrastrandoImagen] =
  useState(false);

const [inicioArrastreImagen, setInicioArrastreImagen] =
  useState({ x: 0, y: 0 });
  const inicioArrastreImagenRef = React.useRef({
  x: 0,
  y: 0,
});

const arrastrandoImagenRef = React.useRef(false);

const [arrastrandoGaleria, setArrastrandoGaleria] =
  useState(false);
    void arrastrandoGaleria;
void setArrastrandoGaleria;

const [inicioArrastreGaleria, setInicioArrastreGaleria] =
  useState({ x: 0, y: 0 });
void inicioArrastreGaleria;
void setInicioArrastreGaleria;
  const iniciarArrastreImagen = (e: React.MouseEvent) => {
  if (zoomImagen <= 1) return;

  e.preventDefault();

  setArrastrandoImagen(true);

  setInicioArrastreImagen({
    x: e.clientX - posicionImagen.x,
    y: e.clientY - posicionImagen.y,
  });
};
const moverImagenAmpliada = (e: React.MouseEvent) => {
  if (!arrastrandoImagen) return;

  setPosicionImagen({
    x: e.clientX - inicioArrastreImagen.x,
    y: e.clientY - inicioArrastreImagen.y,
  });
};
const terminarArrastreImagen = () => {
  setArrastrandoImagen(false);
};
// ==========================================
// GALERÍA - ARRASTRE CON 1 DEDO
// ==========================================
const iniciarToqueGaleria = (e: React.TouchEvent<HTMLImageElement>) => {void iniciarToqueGaleria;
  if (e.touches.length !== 1) return;

  // Solo mover si la imagen está ampliada
  if (zoomImagen <= 1) return;

  e.preventDefault();
  e.stopPropagation();

  const toque = e.touches[0];

  setArrastrandoImagen(true);

  setInicioArrastreImagen({
    x: toque.clientX - posicionImagen.x,
    y: toque.clientY - posicionImagen.y,
  });
};

const moverToqueGaleria = (e: React.TouchEvent<HTMLImageElement>) => {void moverToqueGaleria;
  if (!arrastrandoImagen) return;
  if (e.touches.length !== 1) return;
  if (zoomImagen <= 1) return;

  e.preventDefault();
  e.stopPropagation();

  const toque = e.touches[0];

  setPosicionImagen({
    x: toque.clientX - inicioArrastreImagen.x,
    y: toque.clientY - inicioArrastreImagen.y,
  });
};

const terminarToqueGaleria = (
  e?: React.TouchEvent<HTMLImageElement>
) => {

  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  setArrastrandoImagen(false);
};
void terminarToqueGaleria;
  const [serviciosBD, setServiciosBD] = useState<ServicioBD[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarEmpresa();
  }, [companyId]);

const perfilRegistrado = React.useRef<string | null>(null);

useEffect(() => {
  if (!companyId) return;

  if (perfilRegistrado.current === companyId) {
    return;
  }

  perfilRegistrado.current = companyId;

  registrarAnalitica("PROFILE_VIEW");
}, [companyId]);

  // =====================================================
// CARGAR GALERÍA DEL SERVICIO SELECCIONADO
// =====================================================

useEffect(() => {
  const cargarGaleriaServicio = async () => {
    if (!servicioSeleccionado?.id) {
      setImagenesServicio([]);
      return;
    }

    try {
      const respuesta = await fetch(
        `${API_URL}/services/${servicioSeleccionado.id}/images`,
      );

      if (!respuesta.ok) {
        console.error(
          "No se pudo cargar la galería del servicio.",
        );

        setImagenesServicio([]);
        return;
      }

const imagenes = await respuesta.json();

setImagenesServicio(
        Array.isArray(imagenes)
          ? imagenes
          : [],
      );
    } catch (error) {
      console.error(
        "Error cargando galería del servicio:",
        error,
      );

      setImagenesServicio([]);
    }
  };

  cargarGaleriaServicio();
}, [servicioSeleccionado]);

  const obtenerImagenUrl = (url?: string) => {
    if (!url) return "";

    if (
      url.startsWith("http://") ||
      url.startsWith("https://")
    ) {
      return url;
    }

    return `${API_URL}${url}`;
  };
const obtenerVisitorId = (): string => {
  const STORAGE_KEY = 'zapea_visitor_id';

  try {
    let visitorId = localStorage.getItem(STORAGE_KEY);

    if (visitorId) {
      return visitorId;
    }

    visitorId =
      typeof crypto !== 'undefined' &&
      typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 15)}`;

    localStorage.setItem(STORAGE_KEY, visitorId);

    return visitorId;
  } catch {
    // Fallback si localStorage está bloqueado
    return `zapea-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}`;
  }
};
// =====================================================
// ANALÍTICA ZAPEA
// =====================================================
const registrarAnalitica = (
  type: string,
  serviceId?: string,
  sucursalId?: string,
) => {
  if (!companyId) return;

  const visitorId = obtenerVisitorId();

  fetch(`${API_URL}/analytics/event`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type,
      companyId,
      visitorId,
      ...(serviceId ? { serviceId } : {}),
      ...(sucursalId ? { sucursalId } : {}),
    }),
    keepalive: true,
  }).catch((error) => {
    console.error("Error registrando analítica:", error);
  });
};
  const cargarEmpresa = async () => {
    try {
      setCargando(true);
      setError("");

      const respuesta = await fetch(
        `${API_URL}/companies/${companyId}`
      );

      if (!respuesta.ok) {
        throw new Error("No se encontró la empresa.");
      }

      const data = await respuesta.json();

    setEmpresa({
  ...data,
  name: data.nombre ?? data.name,
  phone: data.telefono ?? data.phone,
  email: data.email ?? data.correo,
  address: data.direccion ?? data.address,
  description: data.descripcion ?? data.description,
  facebook: data.facebook,
});
const respuestaServicios = await fetch(
  `${API_URL}/services/company/${companyId}`,
  {
    cache: "no-store",
  }
);

if (respuestaServicios.ok) {
  const datosServicios = await respuestaServicios.json();

const servicios = Array.isArray(datosServicios)
  ? datosServicios
  : datosServicios?.services || [];

setServiciosBD(servicios);
} else {
  setServiciosBD([]);
}

// =====================================================
      // CARGAR SUCURSALES PÚBLICAS
      // =====================================================

      try {
        const respuestaSucursales = await fetch(
          `${API_URL}/companies/${companyId}/sucursales/public`,
          {
            cache: "no-store",
          },
        );

        if (respuestaSucursales.ok) {
          const datosSucursales =
            await respuestaSucursales.json();

          setSucursales(
            Array.isArray(datosSucursales)
              ? datosSucursales
              : [],
          );
        } else {
          setSucursales([]);
        }
      } catch (error) {
        console.error(
          "Error cargando sucursales públicas:",
          error,
        );

        setSucursales([]);
      }

      try {
        const respuestaGaleria = await fetch(
          `${API_URL}/companies/${companyId}/gallery`
        );

        if (respuestaGaleria.ok) {
          const galeria = await respuestaGaleria.json();

          setGalleryImages(
            Array.isArray(galeria)
              ? galeria
              : galeria?.images || []
          );
        }
      } catch {
        setGalleryImages([]);
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar la empresa."
      );
    } finally {
      setCargando(false);
    }
  };

  const volver = () => {
    window.history.back();
  };

const llamar = () => {
  if (!empresa?.phone) return;

  registrarAnalitica("PHONE_CLICK");

  window.location.href = `tel:${empresa.phone}`;
};

const abrirWhatsApp = () => {
  if (!empresa?.whatsapp) return;

  registrarAnalitica(
  "WHATSAPP_CLICK",
  servicioSeleccionado?.id
);

  const numero = empresa.whatsapp.replace(/\D/g, "");

  window.open(
    `https://wa.me/${numero}`,
    "_blank"
  );
};

const abrirCorreo = () => {
  if (!empresa?.email) return;

  registrarAnalitica("EMAIL_CLICK");

  const correo = empresa.email.trim();

  const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    correo
  )}`;

  window.open(url, "_blank", "noopener,noreferrer");
};

const abrirFacebook = () => {
  if (!empresa?.facebook) return;

  registrarAnalitica("FACEBOOK_CLICK");

  window.open(
    empresa.facebook,
    "_blank",
    "noopener,noreferrer"
  );
};
const abrirUbicacion = () => {
  if (!empresa?.address) return;

  registrarAnalitica("MAP_CLICK");

  const direccion = encodeURIComponent(
    empresa.address
  );

  window.open(
    `https://www.google.com/maps/search/?api=1&query=${direccion}`,
    "_blank",
    "noopener,noreferrer"
  );
};
const abrirUbicacionSucursal = (
  sucursal: Sucursal,
) => {
  const tieneCoordenadas =
    sucursal.latitud !== null &&
    sucursal.latitud !== undefined &&
    sucursal.longitud !== null &&
    sucursal.longitud !== undefined;

  const destino = tieneCoordenadas
    ? `${sucursal.latitud},${sucursal.longitud}`
    : sucursal.direccion;

  if (!destino) return;

  registrarAnalitica(
  "MAP_CLICK",
  undefined,
  sucursal.id,
);

  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      destino,
    )}`,
    "_blank",
    "noopener,noreferrer",
  );
};
  // =====================================================
// ICONO DINÁMICO SEGÚN CATEGORÍA DE LA EMPRESA
// =====================================================

const obtenerIconoCategoria = (
  categoria?: string | null
) => {
  const cat = (categoria || "")
    .toLowerCase()
    .trim();

  if (
    cat.includes("construcción") ||
    cat.includes("construccion")
  ) {
    return "🏗️";
  }

  if (
    cat.includes("arquitectura") ||
    cat.includes("arquitecto")
  ) {
    return "📐";
  }

  if (
    cat.includes("ingeniería") ||
    cat.includes("ingenieria")
  ) {
    return "⚙️";
  }

  if (
    cat.includes("heladería") ||
    cat.includes("heladeria") ||
    cat.includes("helado")
  ) {
    return "🍦";
  }

  if (
    cat.includes("restaurante") ||
    cat.includes("comida") ||
    cat.includes("gastronomía") ||
    cat.includes("gastronomia")
  ) {
    return "🍽️";
  }

  if (
    cat.includes("panadería") ||
    cat.includes("panaderia") ||
    cat.includes("pastelería") ||
    cat.includes("pasteleria")
  ) {
    return "🥐";
  }

  if (
    cat.includes("mecánica") ||
    cat.includes("mecanica") ||
    cat.includes("automotriz")
  ) {
    return "🔧";
  }

  if (
    cat.includes("transporte") ||
    cat.includes("logística") ||
    cat.includes("logistica")
  ) {
    return "🚚";
  }

  if (
    cat.includes("fotografía") ||
    cat.includes("fotografia")
  ) {
    return "📷";
  }

  if (
    cat.includes("tecnología") ||
    cat.includes("tecnologia")
  ) {
    return "💻";
  }

  if (
    cat.includes("salud") ||
    cat.includes("médico") ||
    cat.includes("medico")
  ) {
    return "🩺";
  }

  if (
    cat.includes("educación") ||
    cat.includes("educacion")
  ) {
    return "🎓";
  }

  if (
    cat.includes("inmobiliaria") ||
    cat.includes("inmobiliario")
  ) {
    return "🏠";
  }

 
};
const obtenerIconoServicio = (
  nombre?: string | null
) => {
  const servicio = (nombre || "")
    .toLowerCase()
    .trim();

  if (
    servicio.includes("plano") ||
    servicio.includes("planos") ||
    servicio.includes("diseño")
  ) {
    return "📐";
  }

  if (
    servicio.includes("declaratoria") ||
    servicio.includes("fabrica") ||
    servicio.includes("fábrica")
  ) {
    return "🏠";
  }

  if (
    servicio.includes("construcción") ||
    servicio.includes("construccion") ||
    servicio.includes("obra")
  ) {
    return "🏗️";
  }

  if (
    servicio.includes("arquitectura") ||
    servicio.includes("arquitectónico") ||
    servicio.includes("arquitectonico")
  ) {
    return "📐";
  }

  if (
    servicio.includes("ingeniería") ||
    servicio.includes("ingenieria")
  ) {
    return "⚙️";
  }

  if (
    servicio.includes("helado") ||
    servicio.includes("heladería") ||
    servicio.includes("heladeria")
  ) {
    return "🍦";
  }

  if (
    servicio.includes("restaurante") ||
    servicio.includes("comida") ||
    servicio.includes("almuerzo")
  ) {
    return "🍽️";
  }

  if (
    servicio.includes("mantenimiento") ||
    servicio.includes("reparación") ||
    servicio.includes("reparacion")
  ) {
    return "🔧";
  }

  if (
    servicio.includes("transporte") ||
    servicio.includes("flete") ||
    servicio.includes("carga")
  ) {
    return "🚚";
  }

  if (
    servicio.includes("fotografía") ||
    servicio.includes("fotografia")
  ) {
    return "📷";
  }

  if (
    servicio.includes("diseño") ||
    servicio.includes("diseño gráfico") ||
    servicio.includes("diseño grafico")
  ) {
    return "✏️";
  }

  if (
    servicio.includes("consultoría") ||
    servicio.includes("consultoria") ||
    servicio.includes("asesoría") ||
    servicio.includes("asesoria")
  ) {
    return "💡";
  }

  return "▣";
};
  if (error || !empresa) {
  
    return (
      <div style={styles.page}>
        <div style={styles.errorBox}>
          <h2>No se pudo cargar la empresa</h2>

          <p>
            {error || "Empresa no encontrada."}
          </p>

          <button
            type="button"
            onClick={volver}
            style={styles.backButton}
          >
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  const portada = obtenerImagenUrl(
    empresa.portadaUrl
  );

  const logo = obtenerImagenUrl(
    empresa.logoUrl
  );

  const iniciarArrastre = (e: React.MouseEvent) => {
  if (zoomPercent <= 100) return;

  setArrastrando(true);

  setInicioArrastre({
    x: e.clientX - posicion.x,
    y: e.clientY - posicion.y,
  });
};

const cambiarZoom = (cantidad: number) => {
  setZoomPercent((actual) => {
    const nuevoZoom = Math.min(
      500,
      Math.max(100, actual + cantidad)
    );

    return nuevoZoom;
  });
};

const manejarZoomRueda = (
  e: React.WheelEvent<HTMLImageElement>
) => {
  e.stopPropagation();

  if (e.deltaY < 0) {
    cambiarZoom(25);
  } else {
    cambiarZoom(-25);
  }
};

const moverImagen = (e: React.MouseEvent) => {
  if (!arrastrando) return;

  setPosicion({
    x: e.clientX - inicioArrastre.x,
    y: e.clientY - inicioArrastre.y,
  });
};

const terminarArrastre = () => {
  setArrastrando(false);
};
// =====================================================
// CONTROLES TÁCTILES - GALERÍA PRINCIPAL
// 1 DEDO + ZOOM > 100% = MOVER IMAGEN
// 1 DEDO + ZOOM 100% = CAMBIAR FOTO
// 2 DEDOS = PINCH ZOOM
// =====================================================

const iniciarToque = (
  e: React.TouchEvent<HTMLImageElement>
) => {

  // ===================================================
  // 2 DEDOS = PINCH ZOOM
  // ===================================================
  if (e.touches.length === 2) {
    e.preventDefault();
    e.stopPropagation();

    const touch1 = e.touches[0];
    const touch2 = e.touches[1];

    const distancia = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );

if (distancia > 0) {
  pinchDistanciaInicial.current = distancia;
  pinchZoomInicial.current = zoomPercent;
}

setArrastrando(false);

touchInicio.current = null;
modoTouch.current = "pinch";

return;
  }

  // ===================================================
  // 1 DEDO
  // ===================================================
  if (e.touches.length !== 1) return;

  const toque = e.touches[0];

  // ===================================================
  // MÁS DE 100% = MOVER IMAGEN
  // ===================================================
if (zoomPercent > 100) {
  e.preventDefault();
  e.stopPropagation();

  const inicio = {
    x: toque.clientX - posicion.x,
    y: toque.clientY - posicion.y,
  };

  setInicioArrastre(inicio);
  setArrastrando(true);

  touchInicio.current = null;
  modoTouch.current = "swipe";

  return;
}

  // ===================================================
  // 100% = PREPARAR SWIPE PARA CAMBIAR FOTO
  // ===================================================
  touchInicio.current = {
    x: toque.clientX,
    y: toque.clientY,
  };

  modoTouch.current = "swipe";
};


// =====================================================
// MOVER CON 1 DEDO
// =====================================================

const moverToque = (
  e: React.TouchEvent<HTMLImageElement>
) => {

  // ===================================================
  // 2 DEDOS = PINCH ZOOM
  // ===================================================
  if (
    modoTouch.current === "pinch" &&
    e.touches.length === 2
  ) {
    e.preventDefault();
    e.stopPropagation();

    const touch1 = e.touches[0];
    const touch2 = e.touches[1];

    const distanciaActual = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );

    const distanciaInicial =
      pinchDistanciaInicial.current;

    if (
      distanciaInicial === null ||
      distanciaInicial <= 0
    ) {
      return;
    }

    const factor =
      distanciaActual / distanciaInicial;

    const nuevoZoom = Math.min(
      500,
      Math.max(
        100,
        pinchZoomInicial.current * factor
      )
    );

    setZoomPercent(Math.round(nuevoZoom));

    // Si vuelve al 100%, centrar
    if (nuevoZoom <= 100) {
setPosicion({
  x: 0,
  y: 0,
});
    }

    return;
  }


  // ===================================================
  // 1 DEDO + MÁS DE 100% = MOVER IMAGEN
  // ===================================================
if (
  modoTouch.current === "swipe" &&
  e.touches.length === 1 &&
  zoomPercent > 100 &&
  arrastrando
) {
  e.preventDefault();
  e.stopPropagation();

  const toque = e.touches[0];

  setPosicion({
    x: toque.clientX - inicioArrastre.x,
    y: toque.clientY - inicioArrastre.y,
  });

  return;
}

  // ===================================================
  // 100% = NO MOVER IMAGEN
  // SOLO SE EVALÚA EL SWIPE AL SOLTAR
  // ===================================================
  if (
    modoTouch.current === "swipe" &&
    e.touches.length === 1
  ) {
    return;
  }
};


// =====================================================
// TERMINAR GESTO
// =====================================================

const terminarToque = (
  e: React.TouchEvent<HTMLImageElement>
) => {

  // ===================================================
  // FINALIZAR PINCH
  // ===================================================
  if (modoTouch.current === "pinch") {

    pinchDistanciaInicial.current = null;

    arrastrandoImagenRef.current = false;
    setArrastrandoImagen(false);

    modoTouch.current = "ninguno";

if (zoomPercent <= 100) {
  setZoomPercent(100);

  setPosicion({
    x: 0,
    y: 0,
  });
}

    return;
  }


  // ===================================================
  // FINALIZAR ARRASTRE DE IMAGEN
  // ===================================================
  if (
    zoomPercent > 100 &&
    arrastrandoImagenRef.current
  ) {

    arrastrandoImagenRef.current = false;

    setArrastrandoImagen(false);

    inicioArrastreImagenRef.current = {
      x: 0,
      y: 0,
    };

    setInicioArrastreImagen({
      x: 0,
      y: 0,
    });

    touchInicio.current = null;
    modoTouch.current = "ninguno";

    return;
  }


  // ===================================================
  // SWIPE PARA CAMBIAR FOTO
  // ===================================================
  if (
    modoTouch.current !== "swipe" ||
    !touchInicio.current
  ) {
    modoTouch.current = "ninguno";
    touchInicio.current = null;
    return;
  }

  const inicio = touchInicio.current;

  const toque =
    e.changedTouches[0];

  const desplazamientoX =
    toque.clientX - inicio.x;

  const desplazamientoY =
    toque.clientY - inicio.y;

  touchInicio.current = null;
  modoTouch.current = "ninguno";

  const distanciaMinima = 60;

  const esHorizontal =
    Math.abs(desplazamientoX) >
    Math.abs(desplazamientoY);

  // Gesto pequeño o vertical
  if (
    Math.abs(desplazamientoX) < distanciaMinima ||
    !esHorizontal
  ) {
    return;
  }

  // Con zoom nunca cambiar fotografía
  if (zoomPercent > 100) {
    return;
  }

  // ===================================================
  // CAMBIAR FOTO
  // ===================================================
  setImagenSeleccionada((actual) => {

    if (
      actual === null ||
      galleryImages.length === 0
    ) {
      return actual;
    }

    // Deslizar izquierda = siguiente
    if (desplazamientoX < 0) {
      return actual === galleryImages.length - 1
        ? 0
        : actual + 1;
    }

    // Deslizar derecha = anterior
    return actual === 0
      ? galleryImages.length - 1
      : actual - 1;
  });

  // Nueva foto centrada
  setZoomPercent(100);

setPosicion({
  x: 0,
  y: 0,
});

};


// =====================================================
// CANCELAR GESTO
// =====================================================

const cancelarToque = () => {

  touchInicio.current = null;

  pinchDistanciaInicial.current = null;

  arrastrandoImagenRef.current = false;

  setArrastrandoImagen(false);

  inicioArrastreImagenRef.current = {
    x: 0,
    y: 0,
  };

  setInicioArrastreImagen({
    x: 0,
    y: 0,
  });

  modoTouch.current = "ninguno";
};

   return (
    <div style={styles.page}>
      {/* CABECERA */}
      <header
  className="zapea-topbar"
  style={styles.topBar}
>
        <div style={styles.brand}>
          ZAPEA
        </div>

        <button
  type="button"
  className="zapea-back-button"
  onClick={volver}
  style={styles.backTop}
>
          ← Volver
        </button>
      </header>

      <main
  className="zapea-container"
  style={styles.container}
>
        {/* PERFIL */}
        <section
  className="zapea-profile-card"
  style={styles.profileCard}
>
  
{/* =====================================================
    PORTADA PREMIUM ZAPEA
    ===================================================== */}
<div
  className="zapea-cover"
  style={{
    ...styles.cover,
backgroundImage: portada
  ? `url("${portada}")`
  : undefined,
  }}
>
  {!portada && (
    <div style={styles.coverPlaceholder}>
      <div>
        <div
          style={{
            fontSize: "38px",
            fontWeight: 900,
            letterSpacing: "2px",
          }}
        >
          ZAPEA
        </div>

        <div
          style={{
            marginTop: "8px",
            color: "#94a3b8",
            fontSize: "13px",
          }}
        >
          Perfil empresarial
        </div>
      </div>
    </div>
  )}


  {/* LOGO */}
  <div
  style={styles.logoContainer}
  className="zapea-logo-container"
>
    {logo ? (
      <img
        src={logo}
        alt={`Logo de ${empresa.name}`}
        style={styles.logo}
      />
    ) : (
      <div style={styles.logoPlaceholder}>
        {empresa.name
          .charAt(0)
          .toUpperCase()}
      </div>
    )}
  </div>
</div>

          {/* INFORMACIÓN PRINCIPAL */}
          <div style={styles.mainInfo}>
            <div>
              <div style={styles.profileLabel}>
                PERFIL EMPRESARIAL
              </div>

              <h1 style={styles.companyName}>
                {empresa.name}
              </h1>

{empresa.categoria && (
  <span style={styles.category}>
    {obtenerIconoCategoria(empresa.categoria)}{" "}
    {empresa.categoria}
  </span>
)}
            </div>

            <button
              type="button"
              onClick={() => setMostrarCompartir(true)}
              style={styles.shareButton}
            >
              🔗 Compartir
            </button>
          </div>
{mostrarCompartir === true && (
  <div
  style={{
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 30000,
    padding: "20px",
  }}
  onClick={() => setMostrarCompartir(false)}
>
  <div
    onClick={(e) => e.stopPropagation()}
    style={{
      width: "min(360px, 92vw)",
      background:
        "linear-gradient(145deg, #0a1b31, #061326)",
      border: "1px solid rgba(59,130,246,0.35)",
      borderRadius: "18px",
      padding: "22px",
      boxShadow:
        "0 20px 70px rgba(0,0,0,0.65)",
      color: "#fff",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "18px",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "9px",
            color: "#60a5fa",
            fontWeight: 800,
            letterSpacing: "1.2px",
          }}
        >
          COMPARTIRR
        </div>

        <h3
          style={{
            margin: "4px 0 0",
            fontSize: "20px",
            fontWeight: 800,
          }}
        >
          Compartir perfil
        </h3>
      </div>

      <button
        type="button"
        onClick={() => setMostrarCompartir(false)}
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(255,255,255,0.08)",
          color: "#fff",
          fontSize: "20px",
          cursor: "pointer",
        }}
      >
        ×
      </button>
    </div>

    {/* WHATSAPP */}
    <button
      type="button"
      onClick={() => {
        const mensaje = encodeURIComponent(
          `Conoce ${empresa.name} en ZAPEA:\n${window.location.href}`
        );
registrarAnalitica(
  "WHATSAPP_CLICK",
  servicioSeleccionado?.id
);
        window.open(
          `https://wa.me/?text=${mensaje}`,
          "_blank"
        );
        setMostrarCompartir(false);
      }}
      style={{
        width: "100%",
        padding: "13px",
        marginBottom: "9px",
        border: "none",
        borderRadius: "10px",
        background: "#16a34a",
        color: "#fff",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      🟢 WhatsApp
    </button>

    {/* FACEBOOK */}
    <button
      type="button"
onClick={() => {
  const url = encodeURIComponent(
    window.location.href
  );

  registrarAnalitica(
    "FACEBOOK_CLICK",
    servicioSeleccionado?.id
  );

  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    "_blank"
  );

  setMostrarCompartir(false);
}}
      style={{
        width: "100%",
        padding: "13px",
        marginBottom: "9px",
        border: "none",
        borderRadius: "10px",
        background: "#1877f2",
        color: "#fff",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      🔵 Facebook
    </button>
  {/* MESSENGER */}
<button
  type="button"
onClick={async () => {
  const url = window.location.href;

  registrarAnalitica(
    "MESSENGER_SHARE",
    servicioSeleccionado?.id
  );

  try {
    await navigator.clipboard.writeText(url);
  } catch {
    // Si no se puede copiar, continuamos igualmente
  }

  window.open(
    "https://www.messenger.com/",
    "_blank",
    "noopener,noreferrer"
  );

  setMostrarCompartir(false);
}}
  style={{
    width: "100%",
    padding: "13px",
    marginBottom: "9px",
    border: "none",
    borderRadius: "10px",
    background: "#0084ff",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  }}
>
  💬 Messenger
</button>

    {/* TELEGRAM */}
    <button
      type="button"
onClick={() => {
  const url = encodeURIComponent(
    window.location.href
  );

  const texto = encodeURIComponent(
    `Conoce ${empresa.name} en ZAPEA`
  );

  registrarAnalitica(
    "TELEGRAM_SHARE",
    servicioSeleccionado?.id
  );

  window.open(
    `https://t.me/share/url?url=${url}&text=${texto}`,
    "_blank"
  );

  setMostrarCompartir(false);
}}
      style={{
        width: "100%",
        padding: "13px",
        marginBottom: "9px",
        border: "none",
        borderRadius: "10px",
        background: "#229ED9",
        color: "#fff",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      🔷 Telegram
    </button>

{/* CORREO */}
<button
  type="button"
onClick={() => {
  registrarAnalitica(
    "SHARE_EMAIL",
    servicioSeleccionado?.id
  );

  const asunto = encodeURIComponent(
    `Perfil de ${empresa.name} en ZAPEA`
  );

  const cuerpo = encodeURIComponent(
    `Conoce este perfil empresarial en ZAPEA:\n\n${window.location.href}`
  );

  window.open(
    `https://mail.google.com/mail/?view=cm&fs=1&su=${asunto}&body=${cuerpo}`,
    "_blank",
    "noopener,noreferrer"
  );

  setMostrarCompartir(false);
}}

  style={{
    width: "100%",
    padding: "13px",
    marginBottom: "9px",
    border: "none",
    borderRadius: "10px",
    background: "#7c3aed",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  }}
>
  ✉️ Correo
</button>

    {/* COPIAR ENLACE */}
    <button
      type="button"
      onClick={async () => {
        registrarAnalitica(
  "COPY_LINK",
  servicioSeleccionado?.id
);
        try {
          await navigator.clipboard.writeText(
            window.location.href
          );

          alert(
            "✅ Enlace copiado correctamente."
          );
        } catch {
          alert(
            "No se pudo copiar el enlace."
          );
        }

        setMostrarCompartir(false);
      }}
      style={{
        width: "100%",
        padding: "13px",
        border: "1px solid #31567e",
        borderRadius: "10px",
        background: "#102b48",
        color: "#fff",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      📋 Copiar enlace
    </button>
  </div>
</div>
)}

          {/* DESCRIPCIÓN */}
          <section style={styles.descriptionSection}>
            <h2
  className="zapea-description-title"
  style={styles.sectionTitle}
>
              Sobre la empresa
            </h2>

            <p
  className="zapea-description-text"
  style={styles.description}
>
              {empresa.description ||
                "Esta empresa todavía no tiene una descripción registrada."}
            </p>
          </section>
{/* SERVICIOS DESTACADOS */}
{serviciosBD.length > 0 && (
  <section style={styles.servicesSection}>

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "14px",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "9px",
            fontWeight: 800,
            color: "#3b82f6",
            letterSpacing: "1px",
            textTransform: "uppercase",
            marginBottom: "4px",
          }}
        >
          LO QUE OFRECEMOS
        </div>

<h2
  className="zapea-services-title"
  style={{
    ...styles.sectionTitle,
    margin: 0,
    textAlign: "left",
  }}
>
          Servicios destacados
        </h2>
      </div>

      <div
        style={{
       width: "30px",
height: "30px",
minWidth: "30px",
borderRadius: "10px",
background:
  "linear-gradient(135deg, #0b5cff, #2563eb)",
display: "flex",
alignItems: "center",
justifyContent: "center",
fontSize: "11px",
fontWeight: 900,
boxShadow:
  "0 4px 12px rgba(37, 99, 235, 0.35)",
        }}
      >
        {serviciosBD.length}
      </div>
    </div>

    <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "9px",
  }}
>
  {serviciosBD.map((servicio, index) => (
    <button
      key={servicio.id || `${servicio.nombre}-${index}`}
      type="button"
      onClick={() => {
  registrarAnalitica(
    "SERVICE_VIEW",
    servicio.id,
  );

  setServicioSeleccionado(servicio);
}}
      className="zapea-service-card"
style={{
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "18px",
  padding: "16px 18px",
  minHeight: "82px",
  borderRadius: "12px",

  border: "1px solid rgba(59, 130, 246, 0.32)",
  borderLeft: "4px solid #1683ff",

  background:
    "linear-gradient(135deg, #0d2948 0%, #0b2541 55%, #091f36 100%)",

  color: "#ffffff",
  cursor: "pointer",
  textAlign: "left",

  boxShadow:
    "0 6px 18px rgba(0, 0, 0, 0.20)",

  transition:
    "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
}}
    >
      {/* NÚMERO */}
      <span
        style={{
          width: "24px",
          height: "24px",
          minWidth: "24px",
          borderRadius: "50%",
          background: "#1769ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "11px",
          fontWeight: 800,
          boxShadow:
            "0 3px 10px rgba(23,105,255,0.4)",
        }}
      >
        {index + 1}
      </span>
{/* ICONO DINÁMICO */}
<span
  style={{
    width: "32px",
    height: "32px",
    minWidth: "32px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    background:
      "linear-gradient(145deg, rgba(37,99,235,0.16), rgba(15,45,80,0.55))",

    border:
      "1px solid rgba(59,130,246,0.30)",

    fontSize: "16px",

    boxShadow:
      "0 4px 10px rgba(0,0,0,0.18)",

    flexShrink: 0,
  }}
>
  {obtenerIconoServicio(servicio.nombre)}
</span>
{/* =====================================================
    GALERÍA DEL SERVICIO
===================================================== */}

{imagenesServicio.length > 0 && (
  <div
    style={{
      marginTop: "14px",
      padding: "12px",
      borderRadius: "10px",
      background: "#0b2743",
      border: "1px solid #17477c",
    }}
  >
    <div
      style={{
        color: "#ffffff",
        fontSize: "12px",
        fontWeight: 800,
        marginBottom: "10px",
      }}
    >
      Galería del servicio
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(90px, 1fr))",
        gap: "8px",
      }}
    >
      {imagenesServicio.map(
        (imagen, index) => {
          const urlImagen =
            obtenerImagenUrl(
              imagen.url ??
                imagen.imageUrl ??
                imagen.imagenUrl ??
                imagen.path,
            );

          if (!urlImagen) {
            return null;
          }

return (
  <img
    key={
      imagen.id ??
      `${index}-${urlImagen}`
    }
    src={urlImagen}
    alt={`Imagen ${index + 1} del servicio`}
    style={{
      width: "100%",
      height: "90px",
      objectFit: "cover",
      borderRadius: "7px",
      border:
        "1px solid #28537c",
      display: "block",
      cursor: "pointer",
    }}
onClick={() => {
  setIndiceGaleriaServicio(index);
  setZoomImagen(1);
  setPosicionImagen({ x: 0, y: 0 });
}}
onTouchStart={(e) => {
  if (e.touches.length !== 1) return;

  const touch = e.touches[0];

  touchInicio.current = {
    x: touch.clientX,
    y: touch.clientY,
  };
}}

onTouchEnd={(e) => {
  if (!touchInicio.current) return;

  const toque = e.changedTouches[0];

  const desplazamientoX =
    toque.clientX - touchInicio.current.x;

  const desplazamientoY =
    toque.clientY - touchInicio.current.y;

  const distanciaMinima = 60;

  const esHorizontal =
    Math.abs(desplazamientoX) >
    Math.abs(desplazamientoY);

  // No cambiar si el movimiento fue pequeño
  // o principalmente vertical
  if (
    Math.abs(desplazamientoX) < distanciaMinima ||
    !esHorizontal
  ) {
    touchInicio.current = null;
    modoTouch.current = "ninguno";
    return;
  }

  // Si la imagen está ampliada, no cambiar fotografía
  if (zoomPercent > 100) {
    touchInicio.current = null;
    modoTouch.current = "ninguno";
    return;
  }

  setIndiceImagenAmpliada((actual) => {
    if (actual === null) return 0;

    // IZQUIERDA → SIGUIENTE
    if (desplazamientoX < 0) {
      return actual >= imagenesServicio.length - 1
        ? 0
        : actual + 1;
    }

    // DERECHA → ANTERIOR
    return actual <= 0
      ? imagenesServicio.length - 1
      : actual - 1;
  });

  setZoomImagen(1);
  setPosicionImagen({ x: 0, y: 0 });

  touchInicio.current = null;
  modoTouch.current = "ninguno";
}}
  />
);
        },
      )}
    </div>
  </div>
)}

      {/* INFORMACIÓN */}
      <span
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          minWidth: 0,
        }}
      >
        <strong
          style={{
            fontSize: "13px",
            letterSpacing: "0.2px",
          }}
        >
          {servicio.nombre}
        </strong>

        {servicio.descripcion && (
          <small
            style={{
              color: "#8ba7c4",
              fontSize: "9px",
              lineHeight: 1.4,
            }}
          >
            {servicio.descripcion}
          </small>
        )}

        {servicio.precioDesde !== null &&
          servicio.precioDesde !== undefined &&
          String(servicio.precioDesde).trim() !== "" && (
            <small
              style={{
                color: "#60a5fa",
                fontSize: "9px",
                fontWeight: 700,
              }}
            >
              Desde S/ {servicio.precioDesde}
            </small>
          )}
      </span>

      {/* FLECHA */}
      <span
        style={{
          color: "#3b82f6",
          fontSize: "20px",
          fontWeight: 700,
        }}
      >
        →
      </span>
    </button>
  ))}
</div>
</section>
)}

{/* =====================================================
    SUCURSALES
===================================================== */}

{sucursales.length > 0 && (
  <section
    style={{
      margin: "28px 28px 0",
      padding: "28px 22px",
      background:
        "linear-gradient(145deg, #0b2540 0%, #0d2d4d 50%, #0a2038 100%)",
      borderRadius: "18px",
      border:
        "1px solid rgba(96, 165, 250, 0.28)",
      boxShadow:
        "0 16px 40px rgba(0, 0, 0, 0.28)",
    }}
  >

    {/* ENCABEZADO */}

    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "15px",
        marginBottom: "18px",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "9px",
            fontWeight: 900,
            color: "#60a5fa",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            marginBottom: "5px",
          }}
        >
          PRESENCIA LOCAL
        </div>

        <h2
          style={{
            ...styles.sectionTitle,
            margin: 0,
          }}
        >
          Nuestras sucursales
        </h2>
      </div>

      <div
        style={{
          minWidth: "38px",
          height: "38px",
          padding: "0 8px",
          borderRadius: "12px",
          background:
            "linear-gradient(135deg, #0b5cff, #2563eb)",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          fontWeight: 900,
          boxShadow:
            "0 0 18px rgba(37, 99, 235, 0.35)",
        }}
      >
        {sucursales.length}
      </div>
    </div>

    {/* LISTA DE SUCURSALES */}

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "14px",
      }}
    >
      {sucursales.map((sucursal) => (
        <div
          key={sucursal.id}
          style={{
            padding: "18px",
            borderRadius: "15px",
            background:
              "linear-gradient(145deg, #0d2948, #081a30)",
            border:
              "1px solid rgba(96, 165, 250, 0.22)",
            boxShadow:
              "0 8px 22px rgba(0, 0, 0, 0.20)",
          }}
        >

          {/* NOMBRE */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                minWidth: "38px",
                borderRadius: "11px",
                background:
                  "linear-gradient(135deg, #0b5cff, #2563eb)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                boxShadow:
                  "0 0 18px rgba(37, 99, 235, 0.30)",
              }}
            >
              📍
            </div>

            <strong
              style={{
                color: "#ffffff",
                fontSize: "15px",
                lineHeight: 1.25,
              }}
            >
              {sucursal.nombre}
            </strong>
          </div>
 
{!sucursal.direccion &&
  !sucursal.horario &&
  !sucursal.telefono &&
  !sucursal.whatsapp &&
  !sucursal.email &&
  (sucursal.latitud === null ||
    sucursal.latitud === undefined ||
    sucursal.longitud === null ||
    sucursal.longitud === undefined) && (
    <div
      style={{
        padding: "12px",
        marginBottom: "10px",
        borderRadius: "10px",
        background: "rgba(245, 158, 11, 0.08)",
        border:
          "1px solid rgba(245, 158, 11, 0.25)",
        color: "#fbbf24",
        fontSize: "11px",
        lineHeight: 1.5,
        textAlign: "center",
      }}
    >
      ⚠️ Información de esta sucursal
      pendiente de actualización.
    </div>
  )}

          {/* DIRECCIÓN */}

          {sucursal.direccion && (
            <div
              style={{
                color: "#cbd5e1",
                fontSize: "12px",
                lineHeight: 1.5,
                marginBottom: "10px",
              }}
            >
              📍 {sucursal.direccion}
            </div>
          )}

          {/* HORARIO */}

          {sucursal.horario && (
            <div
              style={{
                color: "#9fb3c8",
                fontSize: "11px",
                lineHeight: 1.5,
                marginBottom: "10px",
              }}
            >
              🕐 {sucursal.horario}
            </div>
          )}

          {/* TELÉFONO */}

          {sucursal.telefono && (
            <div
              style={{
                color: "#9fb3c8",
                fontSize: "11px",
                marginBottom: "6px",
              }}
            >
              📞 {sucursal.telefono}
            </div>
          )}

          {/* CORREO */}

          {sucursal.email && (
            <div
              style={{
                color: "#9fb3c8",
                fontSize: "11px",
                wordBreak: "break-word",
                marginBottom: "14px",
              }}
            >
              ✉️ {sucursal.email}
            </div>
          )}

          {/* BOTONES */}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "14px",
            }}
          >

            {sucursal.telefono && (
              <button
                type="button"
onClick={() => {
  registrarAnalitica(
    "PHONE_CLICK",
    undefined,
    sucursal.id,
  );

  window.location.href =
    `tel:${sucursal.telefono}`;
}}
                style={{
                  flex: 1,
                  minWidth: "90px",
                  padding: "9px 10px",
                  borderRadius: "9px",
                  border:
                    "1px solid rgba(96, 165, 250, 0.30)",
                  background: "#0b2540",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontSize: "10px",
                  fontWeight: 800,
                }}
              >
                📞 Llamar
              </button>
            )}

            {sucursal.whatsapp && (
              <button
                type="button"
onClick={() => {
  registrarAnalitica(
    "WHATSAPP_CLICK",
    undefined,
    sucursal.id,
  );

  const numero =
    sucursal.whatsapp!.replace(
      /\D/g,
      "",
    );

  window.open(
    `https://wa.me/${numero}`,
    "_blank",
    "noopener,noreferrer",
  );
}}
                style={{
                  flex: 1,
                  minWidth: "90px",
                  padding: "9px 10px",
                  borderRadius: "9px",
                  border:
                    "1px solid rgba(96, 165, 250, 0.30)",
                  background: "#0b2540",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontSize: "10px",
                  fontWeight: 800,
                }}
              >
                🟢 WhatsApp
              </button>
            )}

            {sucursal.email && (
              <button
                type="button"
onClick={() => {
  registrarAnalitica(
    "EMAIL_CLICK",
    undefined,
    sucursal.id,
  );

  window.open(
                    `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                      sucursal.email!,
                    )}`,
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}
                style={{
                  flex: 1,
                  minWidth: "90px",
                  padding: "9px 10px",
                  borderRadius: "9px",
                  border:
                    "1px solid rgba(96, 165, 250, 0.30)",
                  background: "#0b2540",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontSize: "10px",
                  fontWeight: 800,
                }}
              >
                ✉️ Correo
              </button>
            )}

            {(sucursal.direccion ||
              (sucursal.latitud !== null &&
                sucursal.longitud !== null)) && (
              <button
                type="button"
                onClick={() =>
                  abrirUbicacionSucursal(sucursal)
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "2px",
                  borderRadius: "9px",
                  border:
                    "1px solid rgba(96, 165, 250, 0.45)",
                  background:
                    "linear-gradient(135deg, #0b5cff, #2563eb)",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontSize: "10px",
                  fontWeight: 900,
                  boxShadow:
                    "0 5px 15px rgba(37, 99, 235, 0.25)",
                }}
              >
                📍 Cómo llegar →
              </button>
            )}

          </div>
        </div>
      ))}
    </div>
  </section>
)}

 {/* =====================================================
    GALERÍA DE IMÁGENES
===================================================== */}

{galleryImages.length > 0 && (
  <section style={styles.gallerySection}>

    {/* ENCABEZADO */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "16px",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "9px",
            fontWeight: 800,
            color: "#3b82f6",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            marginBottom: "4px",
          }}
        >
          GALERÍA
        </div>

        <h2 style={styles.sectionTitle}>
          Imágenes de la empresa
        </h2>
      </div>

<div
style={{
  minWidth: "58px",
  padding: "8px 10px",
  borderRadius: "12px",
  background:
    "linear-gradient(135deg, #0b5cff, #2563eb)",
  color: "#ffffff",
  fontSize: "10px",
  fontWeight: 800,
  lineHeight: 1.2,
  textAlign: "center",
  boxShadow:
    "0 6px 16px rgba(37, 99, 235, 0.28)",
}}
>
        {galleryImages.length}{" "}
        {galleryImages.length === 1
          ? "imagen"
          : "imágenes"}
      </div>
    </div>

    {/* GALERÍA */}
<div
  className="zapea-public-gallery-grid"
  style={{
        display: "grid",
        gridTemplateColumns:
          galleryImages.length === 1
            ? "1fr"
            : "minmax(0, 1.8fr) minmax(0, 1fr) minmax(0, 1fr)",
        gridAutoRows:
          galleryImages.length === 1
            ? "260px"
            : "130px",
        gap: "10px",
      }}
    >

      {galleryImages.map((imagen, index) => {

        /*
         * La primera imagen ocupa una zona mayor.
         */
        const esPrincipal = index === 0;

        return (
          <div
            key={imagen.id || index}
            onClick={() =>
              setImagenSeleccionada(index)
            }
            style={{
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
borderRadius: "14px",
border:
  "1px solid rgba(96, 165, 250, 0.28)",
background: "#07182d",
gridRow:
  esPrincipal &&
  galleryImages.length > 1
    ? "span 2"
    : "auto",
minHeight: esPrincipal
  ? "260px"
  : "145px",
boxShadow:
  "0 10px 24px rgba(0, 0, 0, 0.25)",
transition:
  "transform 0.2s ease, border-color 0.2s ease",
            }}
          >

<img
  src={obtenerImagenUrl(imagen.url)}
  alt={`Imagen ${
    index + 1
  } de ${empresa.name}`}
  style={{
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center 85%",
    transform: "scale(1)",
    transformOrigin: "center center",
       display: "block",
    transition: "transform 0.35s ease",
  }}
/>

            {/* ICONO ZOOM */}
            <div
              style={{
                position: "absolute",
                top: "9px",
                right: "9px",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background:
                  "rgba(0,0,0,0.65)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "13px",
                backdropFilter:
                  "blur(4px)",
              }}
            >
              🔍
            </div>

          </div>
        );
      })}

    </div>

    {/* =================================================
        VISOR DE IMAGEN
    ================================================= */}

    {imagenSeleccionada !== null &&
      galleryImages[imagenSeleccionada] && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(2,8,23,0.96)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
            overflow: "hidden",
          }}
          onClick={() =>
            setImagenSeleccionada(null)
          }
        >

          {/* INFORMACIÓN SUPERIOR */}
          <div
            style={{
              position: "absolute",
              top: "18px",
              left: "20px",
              right: "80px",
              color: "#fff",
              zIndex: 10001,
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "#60a5fa",
                letterSpacing: "1px",
              }}
            >
              GALERÍA ZAPEA
            </div>

            <div
              style={{
                fontSize: "15px",
                fontWeight: 700,
                marginTop: "3px",
              }}
            >
              {empresa.name}
            </div>
          </div>

          {/* CERRAR */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();

              setImagenSeleccionada(null);
              setZoomPercent(100);
              setPosicion({
                x: 0,
                y: 0,
              });
            }}
            style={{
              position: "absolute",
              top: "18px",
              right: "20px",
              width: "44px",
              height: "44px",
border: "1px solid rgba(96,165,250,0.55)",
background: "linear-gradient(135deg, #0b5cff, #174ea6)",
color: "#ffffff",
borderRadius: "14px",
fontSize: "23px",
              cursor: "pointer",
              zIndex: 10001,
            }}
          >
            ×
          </button>

          {/* CONTADOR */}
          <div
            style={{
              position: "absolute",
              bottom: "90px",
              left: "50%",
              transform:
                "translateX(-50%)",
              color: "#fff",
              background:
                "rgba(0,0,0,0.6)",
              padding: "7px 14px",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: 700,
              zIndex: 10002,
            }}
          >
{imagenSeleccionada + 1} / {galleryImages.length}
          </div>

{/* BOTÓN ANTERIOR */}
<button
  type="button"
  aria-label="Imagen anterior"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();

    setImagenSeleccionada((actual) => {
      if (
        actual === null ||
        galleryImages.length === 0
      ) {
        return actual;
      }

      return actual === 0
        ? galleryImages.length - 1
        : actual - 1;
    });

    setZoomPercent(100);

    setPosicion({
      x: 0,
      y: 0,
    });
  }}
  style={{
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "52px",
    height: "52px",
    minWidth: "52px",
    minHeight: "52px",
    padding: 0,
    margin: 0,
    border: "1px solid rgba(255,255,255,0.35)",
    background: "rgba(8,24,42,0.88)",
    color: "#ffffff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "34px",
    lineHeight: 1,
    fontWeight: 700,
    cursor: "pointer",
    zIndex: 10002,
    pointerEvents: "auto",
    touchAction: "manipulation",
    WebkitTapHighlightColor: "transparent",
  }}
>
  ‹
</button>
{/* BOTÓN SIGUIENTE */}
<button
  type="button"
  aria-label="Siguiente imagen"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();

    setImagenSeleccionada((actual) => {
      if (
        actual === null ||
        galleryImages.length === 0
      ) {
        return actual;
      }

      return actual === galleryImages.length - 1
        ? 0
        : actual + 1;
    });

    setZoomPercent(100);

    setPosicion({
      x: 0,
      y: 0,
    });
  }}
  style={{
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "52px",
    height: "52px",
    minWidth: "52px",
    minHeight: "52px",
    padding: 0,
    margin: 0,
    border: "1px solid rgba(255,255,255,0.35)",
    background: "rgba(8,24,42,0.88)",
    color: "#ffffff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "34px",
    lineHeight: 1,
    fontWeight: 700,
    cursor: "pointer",
    zIndex: 10002,
    pointerEvents: "auto",
    touchAction: "manipulation",
    WebkitTapHighlightColor: "transparent",
  }}
>
  ›
</button>

          {/* IMAGEN GRANDE */}
          <img
            src={obtenerImagenUrl(
              galleryImages[
                imagenSeleccionada
              ].url
            )}
            alt={`Imagen ${
              imagenSeleccionada + 1
            } de ${empresa.name}`}
            draggable={false}
            onClick={(e) =>
              e.stopPropagation()
            }
            
            onMouseDown={iniciarArrastre}
            onMouseMove={moverImagen}
            onMouseUp={terminarArrastre}
            onMouseLeave={terminarArrastre}
            onWheel={manejarZoomRueda}
onTouchStart={iniciarToque}
onTouchMove={moverToque}
onTouchEnd={terminarToque}
onTouchCancel={cancelarToque}
            style={{
              width:
                "min(88vw, 1100px)",
              height: "auto",
              maxWidth: "88vw",
              maxHeight: "82vh",
              objectFit: "contain",
              borderRadius: "10px",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.65)",
              transform:
  `translate3d(${posicion.x}px, ${posicion.y}px, 0) scale(${zoomPercent / 100})`,
              transformOrigin:
                "center center",
              transition: "none",
              touchAction: "none",
              display: "block",
              cursor:
                zoomPercent > 100
                  ? arrastrando
                    ? "grabbing"
                    : "grab"
                  : "zoom-in",
            }}
          />

 {/* ZOOM - GALERÍA ZAPEA */}
<div
  onClick={(e) => e.stopPropagation()}
  style={{
    position: "absolute",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(8, 29, 53, 0.95)",
    border: "1px solid #31567e",
    borderRadius: "10px",
    padding: "6px",
    zIndex: 10001,
  }}
>
  {/* MENOS */}
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      cambiarZoom(-25);
    }}
    style={{
      width: "38px",
      height: "38px",
      border: "none",
      borderRadius: "8px",
      background: "#102b48",
      color: "#fff",
      cursor: "pointer",
      fontSize: "20px",
    }}
  >
    −
  </button>

  {/* PORCENTAJE */}
  <div
    style={{
      minWidth: "60px",
      height: "38px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#60a5fa",
      fontSize: "12px",
      fontWeight: 800,
    }}
  >
    {zoomPercent}%
  </div>

  {/* MÁS */}
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      cambiarZoom(25);
    }}
    style={{
      width: "38px",
      height: "38px",
      border: "none",
      borderRadius: "8px",
      background: "#102b48",
      color: "#fff",
      cursor: "pointer",
      fontSize: "20px",
    }}
  >
    +
  </button>

  {/* RESTABLECER */}
  <button
    type="button"
onClick={(e) => {
  e.preventDefault();
  e.stopPropagation();

  // RESTABLECER ZOOM
  setZoomPercent(100);

  // CENTRAR IMAGEN
  setPosicion({
    x: 0,
    y: 0,
  });

  // CANCELAR ARRASTRE
  arrastrandoImagenRef.current = false;
  setArrastrandoImagen(false);

  // LIMPIAR PUNTO INICIAL
  inicioArrastreImagenRef.current = {
    x: 0,
    y: 0,
  };

  setInicioArrastreImagen({
    x: 0,
    y: 0,
  });

  // LIMPIAR GESTOS
  touchInicio.current = null;
  pinchDistanciaInicial.current = null;
  pinchZoomInicial.current = 100;
  modoTouch.current = "ninguno";
}}
  >
    Restablecer
  </button>
</div>

        </div>
      )}

  </section>
)}

{/* MODAL DEL SERVICIO */}
{servicioSeleccionado && (
  <div
    onClick={() => setServicioSeleccionado(null)}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 8, 20, 0.88)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      zIndex: 10000,
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
style={{
  width: "min(500px, calc(100vw - 40px))",
  maxWidth: "500px",
  maxHeight: "calc(100vh - 32px)",
  boxSizing: "border-box",
  overflowY: "auto",

  background:
    "linear-gradient(180deg, #081d35 0%, #06172a 100%)",

  border: "1px solid #1769ff",
  borderRadius: "16px",
  padding: "16px",

  boxShadow:
    "0 20px 70px rgba(0,0,0,0.7)",

  color: "#fff",
}}
    >

      {/* CABECERA */}
      <div
style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",

  position: "sticky",
  top: 0,
  zIndex: 20,

  background:
    "linear-gradient(180deg, #081d35 0%, #081d35 92%, rgba(8,29,53,0.96) 100%)",

  padding: "2px 0 8px",
  marginBottom: "2px",

  borderBottom:
    "1px solid rgba(96,165,250,0.18)",
}}
      >
        <div>
          <div
style={{
  color: "#60a5fa",
  fontSize: "9px",
  fontWeight: 900,
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  marginBottom: "3px",
}}
          >
            SERVICIO
          </div>

          <h2
style={{
  margin: 0,
  fontSize: "24px",
  lineHeight: 1.05,
  fontWeight: 900,
  color: "#60a5fa",
  letterSpacing: "-0.3px",
  textShadow:
    "0 3px 14px rgba(37,99,235,0.28)",
}}
          >
            {servicioSeleccionado.nombre}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setServicioSeleccionado(null)}
    style={{
  width: "44px",
  height: "44px",
  borderRadius: "14px",
  border: "1px solid rgba(96,165,250,0.55)",
  background:
    "linear-gradient(135deg, #0b5cff, #174ea6)",
  color: "#ffffff",
  fontSize: "23px",
  fontWeight: 800,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow:
    "0 8px 24px rgba(0,0,0,0.35)",
}}
        >
          ×
        </button>
      </div>

      {/* SEPARADOR */}
      <div
        style={{
          height: "1px",
          background: "#1b4268",
          margin: "20px 0",
        }}
      />
{/* IMAGEN DEL SERVICIO */}
{servicioSeleccionado.imagenUrl && (
  <div
    style={{
      marginBottom: "20px",
      borderRadius: "12px",
      overflow: "hidden",
      border: "1px solid #17477c",
      background: "#071a31",
      boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
    }}
  >
    <img
  src={obtenerImagenUrl(
    servicioSeleccionado.imagenUrl
  )}
  alt={servicioSeleccionado.nombre}
  style={{
    width: "100%",
    maxHeight: "180px",
    objectFit: "cover",
    display: "block",
    cursor: "pointer",
  }}
onClick={() => {
  const urlImagen = obtenerImagenUrl(
    servicioSeleccionado.imagenUrl ?? undefined
  );

 if (urlImagen) {
  const indice = imagenesServicio.findIndex(
    (imagen) =>
      obtenerImagenUrl(
        imagen.url ??
          imagen.imageUrl ??
          imagen.imagenUrl ??
          imagen.path
      ) === urlImagen
  );

  if (indice !== -1) {
    setIndiceImagenAmpliada(indice);
    setZoomImagen(1);
    setPosicionImagen({ x: 0, y: 0 });
  }
}
}}
/>
  </div>
)}
{/* =====================================================
    GALERÍA DEL SERVICIO
===================================================== */}

{imagenesServicio.length > 0 && (
  <div
    style={{
      marginBottom: "20px",
      padding: "12px",
      borderRadius: "10px",
      background: "#071a31",
      border: "1px solid #17477c",
    }}
  >
    <div
      style={{
        color: "#ffffff",
        fontSize: "12px",
        fontWeight: 800,
        marginBottom: "10px",
        textAlign: "center",
      }}
    >
      Galería del servicio
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(3, 1fr)",
        gap: "8px",
      }}
    >
      {imagenesServicio.map(
        (imagen, index) => {
          const urlImagen =
            obtenerImagenUrl(
              imagen.url ??
                imagen.imageUrl ??
                imagen.imagenUrl ??
                imagen.path,
            );

          if (!urlImagen) {
            return null;
          }

          return (
            <img
              key={
                imagen.id ??
                `${index}-${urlImagen}`
              }
              src={urlImagen}
              alt={`Imagen ${
                index + 1
              } del servicio`}
              style={{
                width: "100%",
                height: "85px",
                objectFit: "cover",
                borderRadius: "7px",
                border:
                  "1px solid #28537c",
                display: "block",
                cursor: "pointer",
              }}
onClick={() => {
  setIndiceImagenAmpliada(index);
  setZoomImagen(1);
  setPosicionImagen({ x: 0, y: 0 });
}}
            />
          );
        },
      )}
    </div>
  </div>
)}
      {/* INFORMACIÓN */}
      <div
        style={{
          background: "#0b2743",
          border: "1px solid #17477c",
          borderRadius: "10px",
          padding: "16px",
        }}
      >
        <div
          style={{
            color: "#9bb5cf",
            fontSize: "11px",
            lineHeight: 1.7,
          }}
        >
          <strong
            style={{
              display: "block",
              color: "#fff",
              fontSize: "13px",
              marginBottom: "8px",
            }}
          >
            Sobre este servicio
          </strong>
          {servicioSeleccionado.descripcion ||
  `${empresa.name} ofrece el servicio de ${servicioSeleccionado.nombre}.`}
        </div>
      </div>
{servicioSeleccionado.precioDesde !== null &&
  servicioSeleccionado.precioDesde !== undefined &&
  String(servicioSeleccionado.precioDesde).trim() !== "" && (
    <div
      style={{
        marginTop: "14px",
        padding: "10px 12px",
        borderRadius: "8px",
        background: "#071a31",
        border: "1px solid #17477c",
        color: "#60a5fa",
        fontSize: "13px",
        fontWeight: 800,
      }}
    >
      Desde S/ {servicioSeleccionado.precioDesde}
    </div>
  )}
      {/* EMPRESA */}
      <div
        style={{
          marginTop: "16px",
          color: "#8ba7c4",
          fontSize: "10px",
          textAlign: "center",
        }}
      >
        Servicio ofrecido por{" "}
        <strong style={{ color: "#fff" }}>
          {empresa.name}
        </strong>
      </div>

      {/* ACCIONES */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "20px",
        }}
      >
        {empresa.whatsapp && (
          <button
            type="button"
            onClick={abrirWhatsApp}
            style={{
              flex: 1,
              border: "none",
              borderRadius: "8px",
              padding: "12px",
              background: "#16a34a",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            💬 WhatsApp
          </button>
        )}

        <button
          type="button"
          onClick={() => setServicioSeleccionado(null)}
          style={{
            flex: 1,
            border: "1px solid #31567e",
            borderRadius: "8px",
            padding: "12px",
            background: "#102b48",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
)}
{/* =====================================================
    VISOR DE IMAGEN AMPLIADA DEL SERVICIO
===================================================== */}

{indiceImagenAmpliada !== null &&
  imagenesServicio[indiceImagenAmpliada] && (
    <div
      onClick={() => {
        setIndiceImagenAmpliada(null);
        setZoomImagen(1);
        setPosicionImagen({ x: 0, y: 0 });
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.95)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 20000,
        padding: "20px",
        overflow: "hidden",
        touchAction: "none",
      }}
    >

      {/* BOTÓN CERRAR */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIndiceImagenAmpliada(null);
          setZoomImagen(1);
          setPosicionImagen({ x: 0, y: 0 });
        }}
        style={{
          position: "absolute",
          top: "18px",
          right: "18px",
          width: "44px",
          height: "44px",
          borderRadius: "14px",
          border: "1px solid rgba(96,165,250,0.55)",
          background:
            "linear-gradient(135deg, #0b5cff, #174ea6)",
          color: "#ffffff",
          fontSize: "23px",
          fontWeight: 800,
          cursor: "pointer",
          zIndex: 20001,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow:
            "0 8px 24px rgba(0,0,0,0.35)",
        }}
      >
        ×
      </button>

      {/* BOTÓN ANTERIOR */}
      <button
        type="button"
        aria-label="Imagen anterior"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          if (imagenesServicio.length === 0) {
            return;
          }

          setIndiceImagenAmpliada((actual) => {
            if (actual === null) {
              return 0;
            }

            return actual === 0
              ? imagenesServicio.length - 1
              : actual - 1;
          });

          setZoomImagen(1);
          setPosicionImagen({ x: 0, y: 0 });
        }}
        style={{
          position: "absolute",
          left: "25px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          border: "1px solid #31567e",
          background: "rgba(8, 29, 53, 0.95)",
          color: "#ffffff",
          fontSize: "28px",
          lineHeight: 1,
          fontWeight: 700,
          cursor: "pointer",
          zIndex: 20001,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      >
        ‹
      </button>

      {/* BOTÓN SIGUIENTE */}
      <button
        type="button"
        aria-label="Siguiente imagen"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          if (imagenesServicio.length === 0) {
            return;
          }

          setIndiceImagenAmpliada((actual) => {
            if (actual === null) {
              return 0;
            }

            return actual >= imagenesServicio.length - 1
              ? 0
              : actual + 1;
          });

          setZoomImagen(1);
          setPosicionImagen({ x: 0, y: 0 });
        }}
        style={{
          position: "absolute",
          right: "25px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          border: "1px solid #31567e",
          background: "rgba(8, 29, 53, 0.95)",
          color: "#ffffff",
          fontSize: "28px",
          lineHeight: 1,
          fontWeight: 700,
          cursor: "pointer",
          zIndex: 20001,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      >
        ›
      </button>

      {/* IMAGEN */}
      <img
        src={obtenerImagenUrl(
          imagenesServicio[indiceImagenAmpliada].url ??
            imagenesServicio[indiceImagenAmpliada].imageUrl ??
            imagenesServicio[indiceImagenAmpliada].imagenUrl ??
            imagenesServicio[indiceImagenAmpliada].path
        )}
        alt="Imagen ampliada del servicio"
        draggable={false}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={iniciarArrastreImagen}
        onMouseMove={moverImagenAmpliada}
        onMouseUp={terminarArrastreImagen}
        onMouseLeave={terminarArrastreImagen}
onTouchStart={(e) => {
  // ==========================================
  // 2 DEDOS = PINCH ZOOM
  // ==========================================
  if (e.touches.length === 2) {
    e.preventDefault();
    e.stopPropagation();

    const touch1 = e.touches[0];
    const touch2 = e.touches[1];

    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;

    const distancia = Math.hypot(dx, dy);

    if (distancia > 0) {
      distanciaInicialPinch.current = distancia;
      zoomInicialPinch.current = zoomImagen;
    }

    inicioSwipeServicio.current = null;

    arrastrandoImagenRef.current = false;
    setArrastrandoImagen(false);

    modoToqueServicio.current = "pinch";

    return;
  }

  // ==========================================
  // 1 DEDO
  // ==========================================
  if (e.touches.length === 1) {
    const toque = e.touches[0];

    // ==========================================
    // IMAGEN AMPLIADA = MOVER IMAGEN
    // ==========================================
    if (zoomImagen > 1) {
      e.preventDefault();
      e.stopPropagation();

      const inicio = {
        x: toque.clientX - posicionImagen.x,
        y: toque.clientY - posicionImagen.y,
      };

      // GUARDAR INMEDIATAMENTE EN REF
      inicioArrastreImagenRef.current = inicio;

      arrastrandoImagenRef.current = true;

      setInicioArrastreImagen(inicio);
      setArrastrandoImagen(true);

      inicioSwipeServicio.current = null;
      modoToqueServicio.current = "swipe";

      return;
    }

    // ==========================================
    // ZOOM NORMAL = PREPARAR CAMBIO DE FOTO
    // ==========================================
    inicioSwipeServicio.current = {
      x: toque.clientX,
      y: toque.clientY,
    };

    modoToqueServicio.current = "swipe";
  }
}}

onTouchMove={(e) => {
  // ==========================================
  // 2 DEDOS = PINCH ZOOM
  // ==========================================
  if (
    modoToqueServicio.current === "pinch" &&
    e.touches.length === 2
  ) {
    e.preventDefault();
    e.stopPropagation();

    const touch1 = e.touches[0];
    const touch2 = e.touches[1];

    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;

    const distanciaActual = Math.hypot(dx, dy);

    const distanciaInicial =
      distanciaInicialPinch.current;

    if (!distanciaInicial || distanciaInicial <= 0) {
      return;
    }

    const factor =
      distanciaActual / distanciaInicial;

    const nuevoZoom =
      zoomInicialPinch.current * factor;

    const zoomLimitado = Math.max(
      1,
      Math.min(nuevoZoom, 5)
    );

    setZoomImagen(zoomLimitado);

    // Si volvemos al zoom normal,
    // centramos inmediatamente.
    if (zoomLimitado <= 1) {
      setPosicionImagen({
        x: 0,
        y: 0,
      });
    }

    return;
  }

  // ==========================================
  // 1 DEDO + ZOOM = MOVER IMAGEN
  // ==========================================
  if (
    modoToqueServicio.current === "swipe" &&
    e.touches.length === 1 &&
    zoomImagen > 1 &&
    arrastrandoImagenRef.current
  ) {
    e.preventDefault();
    e.stopPropagation();

    const toque = e.touches[0];

    // IMPORTANTE:
    // usamos REF, no STATE
    const inicio =
      inicioArrastreImagenRef.current;

    setPosicionImagen({
      x: toque.clientX - inicio.x,
      y: toque.clientY - inicio.y,
    });

    return;
  }
}}

onTouchEnd={(e) => {
  // ==========================================
  // FINALIZAR PINCH
  // ==========================================
  if (
    modoToqueServicio.current === "pinch"
  ) {
    distanciaInicialPinch.current = 0;

    inicioSwipeServicio.current = null;

    arrastrandoImagenRef.current = false;
    setArrastrandoImagen(false);

    modoToqueServicio.current = "ninguno";

    // Si terminó en zoom normal,
    // asegurar posición centrada.
    if (zoomImagen <= 1) {
      setPosicionImagen({
        x: 0,
        y: 0,
      });
    }

    return;
  }

  // ==========================================
  // FINALIZAR MOVIMIENTO DE IMAGEN AMPLIADA
  // ==========================================
  if (
    zoomImagen > 1 &&
    arrastrandoImagenRef.current
  ) {
    arrastrandoImagenRef.current = false;

    setArrastrandoImagen(false);

    inicioSwipeServicio.current = null;
    modoToqueServicio.current = "ninguno";

    return;
  }

  // ==========================================
  // ZOOM NORMAL = SWIPE
  // ==========================================
  if (zoomImagen <= 1) {
    setPosicionImagen({
      x: 0,
      y: 0,
    });
  }

  // ==========================================
  // VALIDAR SWIPE
  // ==========================================
  if (
    modoToqueServicio.current !== "swipe" ||
    !inicioSwipeServicio.current
  ) {
    modoToqueServicio.current = "ninguno";
    inicioSwipeServicio.current = null;

    return;
  }

  const inicio =
    inicioSwipeServicio.current;

  const final =
    e.changedTouches[0];

  const desplazamientoX =
    final.clientX - inicio.x;

  const desplazamientoY =
    final.clientY - inicio.y;

  inicioSwipeServicio.current = null;
  modoToqueServicio.current = "ninguno";

  const distanciaMinima = 50;

  const esHorizontal =
    Math.abs(desplazamientoX) >
    Math.abs(desplazamientoY);

  if (
    Math.abs(desplazamientoX) <
      distanciaMinima ||
    !esHorizontal
  ) {
    return;
  }

  // ==========================================
  // NUNCA CAMBIAR FOTO CON ZOOM
  // ==========================================
  if (zoomImagen > 1) {
    return;
  }

  // ==========================================
  // IZQUIERDA = SIGUIENTE
  // DERECHA = ANTERIOR
  // ==========================================
  setIndiceImagenAmpliada((actual) => {
    if (
      actual === null ||
      imagenesServicio.length === 0
    ) {
      return actual;
    }

    if (desplazamientoX < 0) {
      return actual >=
        imagenesServicio.length - 1
        ? 0
        : actual + 1;
    }

    return actual === 0
      ? imagenesServicio.length - 1
      : actual - 1;
  });

  // Nueva imagen centrada
  setZoomImagen(1);

  setPosicionImagen({
    x: 0,
    y: 0,
  });
}}

onTouchCancel={() => {
  distanciaInicialPinch.current = 0;

  inicioSwipeServicio.current = null;

  arrastrandoImagenRef.current = false;

  setArrastrandoImagen(false);

  modoToqueServicio.current = "ninguno";

  // Cancelación = siempre volver al centro
  setZoomImagen(1);

  setPosicionImagen({
    x: 0,
    y: 0,
  });
}}

style={{
  width: "auto",
  height: "auto",
  maxWidth: "90vw",
  maxHeight: "75vh",
  objectFit: "contain",
  display: "block",
  borderRadius: "10px",

  transform:
    `translate3d(${posicionImagen.x}px, ${posicionImagen.y}px, 0) ` +
    `scale(${zoomImagen})`,

  transformOrigin: "center center",
  transition: "none",
  touchAction: "none",

  userSelect: "none",
  WebkitUserSelect: "none",
  WebkitTouchCallout: "none",
MozUserSelect: "none",  
  WebkitTapHighlightColor: "transparent",

  cursor:
    zoomImagen > 1
      ? arrastrandoImagen
        ? "grabbing"
        : "grab"
      : "zoom-in",

  willChange: "transform",

  boxShadow:
    "0 20px 60px rgba(0,0,0,0.65)",
}}
      />

      {/* CONTADOR */}
      <div
        style={{
          position: "absolute",
          bottom: "90px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "#fff",
          background: "rgba(0,0,0,0.6)",
          padding: "7px 14px",
          borderRadius: "20px",
          fontSize: "11px",
          fontWeight: 700,
          zIndex: 20002,
        }}
      >
        {indiceImagenAmpliada + 1} /{" "}
        {imagenesServicio.length}
      </div>

      {/* CONTROLES DE ZOOM */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          bottom: "25px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "#071a31",
          border: "1px solid #31567e",
          borderRadius: "8px",
          padding: "6px",
          zIndex: 20001,
        }}
      >

        {/* MENOS */}
        <button
          type="button"
          onClick={() => {
            setZoomImagen((actual) =>
              Math.max(actual - 0.2, 1)
            );
          }}
          style={{
            width: "34px",
            height: "34px",
            border: "none",
            borderRadius: "8px",
            background: "#102b48",
            color: "#fff",
            fontSize: "20px",
            cursor: "pointer",
          }}
        >
          −
        </button>

        {/* PORCENTAJE */}
        <div
          style={{
            minWidth: "60px",
            textAlign: "center",
            color: "#60a5fa",
            fontSize: "12px",
            fontWeight: 800,
          }}
        >
          {Math.round(zoomImagen * 100)}%
        </div>

        {/* MÁS */}
        <button
          type="button"
          onClick={() => {
            setZoomImagen((actual) =>
              Math.min(actual + 0.2, 5)
            );
          }}
          style={{
            width: "34px",
            height: "34px",
            border: "none",
            borderRadius: "8px",
            background: "#102b48",
            color: "#fff",
            fontSize: "20px",
            cursor: "pointer",
          }}
        >
          +
        </button>

        {/* RESTABLECER */}
        <button
          type="button"
onClick={(e) => {
  e.preventDefault();
  e.stopPropagation();

  // RESTABLECER ZOOM
  setZoomImagen(1);

  // RESTABLECER POSICIÓN
  setPosicionImagen({
    x: 0,
    y: 0,
  });

  // CANCELAR ARRASTRE
  arrastrandoImagenRef.current = false;
  setArrastrandoImagen(false);

  // LIMPIAR GESTOS
  inicioArrastreImagenRef.current = {
    x: 0,
    y: 0,
  };

  setInicioArrastreImagen({
    x: 0,
    y: 0,
  });

  inicioSwipeServicio.current = null;
  distanciaInicialPinch.current = 0;
  zoomInicialPinch.current = 1;

  modoToqueServicio.current = "ninguno";
}}
          style={{
            height: "34px",
            padding: "0 10px",
            border: "1px solid #31567e",
            borderRadius: "8px",
            background: "#071a31",
            color: "#fff",
            fontSize: "11px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Restablecer
        </button>

      </div>
    </div>
  )}
{/* =====================================================
    INFORMACIÓN EMPRESARIAL
    ===================================================== */}
<div style={{ ...styles.dataSectionHeader, margin: "18px 28px 0" }}>
  <span>INFORMACIÓN</span>
  <h2 style={styles.sectionTitle}>
    Datos de la empresa
  </h2>
</div>
<section style={styles.dataGrid}>

  {/* RUC */}
  <div
    className="zapea-data-card"
    style={{
      ...styles.dataItem,
      gridColumn: "1 / -1",
    }}
  >
    <span
      className="zapea-data-icon"
      style={styles.dataIcon}
    >
      ▣
    </span>

    <div>
      <span style={styles.dataLabel}>
        RUC
      </span>

      <strong style={styles.dataValue}>
        {empresa.ruc || "No registrado"}
      </strong>
    </div>
  </div>



  {/* DIRECCIÓN */}
  <div
    className="zapea-data-card"
    style={{
      ...styles.dataItem,
      gridColumn: "1 / -1",
    }}
  >
    <span
      className="zapea-data-icon"
      style={styles.dataIcon}
    >
      ⌖
    </span>

    <div>
      <span style={styles.dataLabel}>
        Dirección
      </span>

      <strong style={styles.dataValue}>
        {empresa.address || "No registrada"}
      </strong>
    </div>
  </div>

</section>
 {/* CONTACTO */}
<section style={styles.contactSection}>

  <div style={styles.contactHeader}>
    <div style={styles.contactEyebrow}>
      CONTACTAR EMPRESA
    </div>

    <h2 style={styles.contactTitle}>
      ¿Quieres contactar con esta empresa?
    </h2>

    <p style={styles.contactSubtitle}>
      Elige el medio que prefieras y comunícate directamente.
    </p>
  </div>

  <div style={styles.contactButtons}>

    {empresa.whatsapp && (
      <button
        type="button"
        onClick={abrirWhatsApp}
        style={styles.whatsappButton}
      >
        <span style={styles.contactIcon}>🟢</span>
        <span style={styles.contactText}>
          <strong>WhatsApp</strong>
          <small style={styles.contactSubtext}>
  Escríbenos ahora
</small>
        </span>
        <span style={styles.contactArrow}>→</span>
      </button>
    )}

    {empresa.phone && (
      <button
        type="button"
        onClick={llamar}
        style={styles.callButton}
      >
        <span style={styles.contactIcon}>📞</span>
        <span style={styles.contactText}>
          <strong>Llamar</strong>
         <small style={styles.contactSubtext}>
  Hablar por teléfono
</small>
        </span>
        <span style={styles.contactArrow}>→</span>
      </button>
    )}

    {empresa.email && (
      <button
        type="button"
        onClick={abrirCorreo}
        style={styles.emailButton}
      >
        <span style={styles.contactIcon}>✉️</span>
        <span style={styles.contactText}>
          <strong>Correo</strong>
          <small style={styles.contactSubtext}>
  Enviar un mensaje
</small>
        </span>
        <span style={styles.contactArrow}>→</span>
      </button>
    )}

    {empresa.address && (
      <button
        type="button"
        onClick={abrirUbicacion}
        style={styles.locationButton}
      >
        <span style={styles.contactIcon}>📍</span>
        <span style={styles.contactText}>
          <strong>Ubicación</strong>
          <small style={styles.contactSubtext}>
  Ver en el mapa
</small>
        </span>
        <span style={styles.contactArrow}>→</span>
      </button>
    )}

    {empresa.facebook && (
      <button
        type="button"
        onClick={abrirFacebook}
        style={styles.facebookButton}
      >
        <span style={styles.contactIcon}>🔵</span>
        <span style={styles.contactText}>
          <strong>Facebook</strong>
          <small style={styles.contactSubtext}>
  Visitar página
</small>
        </span>
        <span style={styles.contactArrow}>→</span>
      </button>
    )}

  </div>

</section>
        </section>

        <footer style={styles.footer}>
          Perfil empresarial creado con ZAPEA
        </footer>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  /* =====================================================
     ZAPEA - DISEÑO DARK / TECNOLÓGICO
     ===================================================== */

  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, #0b1f3a 0%, #020817 45%, #01040b 100%)",
    fontFamily:
      "Arial, Helvetica, sans-serif",
    color: "#f8fafc",
    boxSizing: "border-box",
  },

  /* =====================================================
     CABECERA
     ===================================================== */

  topBar: {
    minHeight: "64px",
    background:
      "linear-gradient(180deg, #020817 0%, #061326 100%)",
    borderBottom:
      "1px solid rgba(37, 99, 235, 0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 14px",
    boxSizing: "border-box",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow:
      "0 10px 35px rgba(0, 0, 0, 0.35)",
  },

  brand: {
    fontSize: "22px",
    fontWeight: 900,
    color: "#ffffff",
    letterSpacing: "1px",
    textShadow:
      "0 0 18px rgba(37, 99, 235, 0.75)",
  },

  backTop: {
    border:
      "1px solid rgba(37, 99, 235, 0.8)",
    background:
      "linear-gradient(135deg, #0b5cff, #1747c9)",
    color: "#ffffff",
    padding: "9px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 700,
fontSize: "13px",
    boxShadow:
      "0 0 18px rgba(37, 99, 235, 0.35)",
  },

  /* =====================================================
     CONTENEDOR
     ===================================================== */

container: {
  width: "calc(100% - 20px)",
  maxWidth: "1120px",
  margin: "15px auto 35px",
  boxSizing: "border-box",
},

  profileCard: {
    background:
      "linear-gradient(180deg, #071426 0%, #020817 100%)",
    border:
      "1px solid rgba(59, 130, 246, 0.25)",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow:
      "0 25px 80px rgba(0, 0, 0, 0.55)",
  },

  /* =====================================================
     PORTADA
     ===================================================== */

cover: {
  height: "360px",
  backgroundColor: "#061326",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  position: "relative",
borderBottom: "none",
  overflow: "visible",
},

  coverPlaceholder: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#94a3b8",
    fontSize: "20px",
    fontWeight: 700,
    background:
      "linear-gradient(135deg, #061326, #0b1f3a)",
  },

logoContainer: {
  position: "absolute",
  left: "16px",
bottom: "-50px",
width: "110px",
height: "110px",
  borderRadius: "20px",
  background: "#ffffff",
  padding: "7px",
  boxSizing: "border-box",
  boxShadow:
    "0 18px 50px rgba(0, 0, 0, 0.65)",
  border:
    "3px solid #2563eb",
  zIndex: 10,
},

  logo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    borderRadius: "13px",
    display: "block",
  },

  logoPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg, #0b5cff, #1747c9)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "52px",
    fontWeight: 900,
  },

  /* =====================================================
     INFORMACIÓN PRINCIPAL
     ===================================================== */

mainInfo: {
  padding: "62px 24px 28px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "18px",
},

  profileLabel: {
    fontSize: "12px",
    color: "#60a5fa",
    fontWeight: 800,
    letterSpacing: "1px",
    marginBottom: "9px",
    textTransform: "uppercase",
  },

companyName: {
  margin: 0,
  fontSize: "clamp(28px, 5vw, 38px)",
  lineHeight: 1.08,
  color: "#ffffff",
  fontWeight: 900,
  letterSpacing: "-0.8px",
  textShadow:
    "0 4px 24px rgba(0, 0, 0, 0.45)",
},

  category: {
    display: "inline-block",
    marginTop: "12px",
    background:
      "linear-gradient(135deg, #0b5cff, #1747c9)",
    color: "#ffffff",
    padding: "8px 15px",
    borderRadius: "22px",
    fontSize: "12px",
    fontWeight: 800,
    border:
      "1px solid rgba(96, 165, 250, 0.5)",
    boxShadow:
      "0 5px 18px rgba(37, 99, 235, 0.3)",
  },

shareButton: {
  border: "1px solid rgba(96, 165, 250, 0.45)",
  background: "rgba(7, 20, 38, 0.72)",
  color: "#dbeafe",
  padding: "10px 15px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: "12px",
  boxShadow:
    "0 6px 18px rgba(0, 0, 0, 0.18)",
  backdropFilter: "blur(10px)",
},

  /* =====================================================
     DATOS DE CONTACTO
     ===================================================== */

  dataSectionHeader: {
  marginBottom: "8px",
},

dataSectionEyebrow: {
  fontSize: "9px",
  fontWeight: 800,
  color: "#3b82f6",
  letterSpacing: "1.5px",
  textTransform: "uppercase",
},
dataGrid: {
  margin: "0 28px",
  padding: "8px 8px 12px",
  borderTop:
    "1px solid rgba(59, 130, 246, 0.18)",
  borderBottom:
    "1px solid rgba(59, 130, 246, 0.18)",
  display: "grid",
gridTemplateColumns:
  "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "10px",
  background:
    "rgba(3, 13, 27, 0.35)",
},

dataItem: {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "64px",
  padding: "10px 12px",
  borderRadius: "13px",
  background:
    "linear-gradient(145deg, #0c2340, #07172b)",
  border:
    "1px solid rgba(59, 130, 246, 0.22)",
  boxShadow:
    "0 8px 22px rgba(0, 0, 0, 0.20)",
  boxSizing: "border-box",
  textAlign: "center",
},
dataIcon: {
  width: "32px",
  height: "32px",
  minWidth: "32px",
  borderRadius: "9px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "linear-gradient(135deg, #0b5cff, #2563eb)",
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: 900,
  boxShadow:
    "0 0 18px rgba(37, 99, 235, 0.35)",
},

dataValue: {
  display: "block",
  marginTop: "3px",
  color: "#f8fafc",
  fontSize: "13px",
  fontWeight: 700,
  wordBreak: "break-word",
},

  dataLabel: {
    fontSize: "10px",
    color: "#60a5fa",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },

  /* =====================================================
     DESCRIPCIÓN
     ===================================================== */

descriptionSection: {
  margin: "22px 28px 0",
  padding: "18px",
    borderRadius: "15px",
    background:
      "linear-gradient(145deg, #0a1b31, #061326)",
    border:
      "1px solid rgba(59, 130, 246, 0.22)",
    boxShadow:
      "0 12px 35px rgba(0, 0, 0, 0.25)",
  },

  sectionTitle: {
    margin: "0 0 16px",
    fontSize: "21px",
    color: "#ffffff",
    fontWeight: 800,
    position: "relative",
  },

description: {
  margin: 0,
  color: "#cbd5e1",
  lineHeight: 1.7,
  whiteSpace: "pre-wrap",
  fontSize: "13px",
},
  /* =====================================================
     SERVICIOS
     ===================================================== */

servicesSection: {
  margin: "28px 28px 0",
  padding: "28px 22px",

  background:
  "linear-gradient(145deg, #0b2540 0%, #0d2d4d 50%, #0a2038 100%)",

  borderRadius: "18px",

  border:
    "1px solid rgba(96, 165, 250, 0.28)",

  boxShadow:
    "0 16px 40px rgba(0, 0, 0, 0.28)",
},

servicesGrid: {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "12px",
  marginTop: "18px",
},

serviceCard: {
  display: "flex",
  alignItems: "center",
  gap: "14px",

  minHeight: "74px",
  padding: "14px 15px",

  background:
    "linear-gradient(135deg, #0d2948 0%, #081a30 100%)",

  borderRadius: "14px",

  border:
    "1px solid rgba(96, 165, 250, 0.22)",

  boxSizing: "border-box",

  boxShadow:
    "0 8px 22px rgba(0, 0, 0, 0.18)",

  transition:
    "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
},
servicesHeader: {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "15px",
},

servicesEyebrow: {
  display: "block",
  marginBottom: "5px",
  color: "#60a5fa",
  fontSize: "9px",
  fontWeight: 900,
  letterSpacing: "1.3px",
},

servicesCount: {
  width: "38px",
  height: "38px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "linear-gradient(135deg, #0b5cff, #2563eb)",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: 900,
  boxShadow:
    "0 0 18px rgba(37, 99, 235, 0.4)",
},

serviceContent: {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  flex: 1,
  minWidth: 0,
},

serviceName: {
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: 850,
  lineHeight: 1.25,
},

serviceDescription: {
  color: "#9fb3c8",
  fontSize: "11px",
  lineHeight: 1.45,
},

serviceArrow: {
  color: "#60a5fa",
  fontSize: "23px",
  fontWeight: 900,
  marginLeft: "6px",
},
  serviceIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg, #0b5cff, #2563eb)",
    color: "#ffffff",
    fontWeight: 900,
    flexShrink: 0,
    boxShadow:
      "0 0 15px rgba(37, 99, 235, 0.5)",
  },

  /* =====================================================
     GALERÍA
     ===================================================== */

gallerySection: {
  margin: "28px 28px 0",
  padding: "28px 22px",

  background:
    "linear-gradient(145deg, #0b2039 0%, #07172b 100%)",

  borderRadius: "18px",

  border:
    "1px solid rgba(96, 165, 250, 0.25)",

  boxShadow:
    "0 16px 40px rgba(0, 0, 0, 0.28)",
},

  gallery: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "14px",
  },

  galleryItem: {
    height: "155px",
    borderRadius: "12px",
    overflow: "hidden",
    cursor: "pointer",
    border:
      "1px solid rgba(96, 165, 250, 0.3)",
    background: "#020817",
    boxShadow:
      "0 8px 25px rgba(0, 0, 0, 0.35)",
  },

  galleryImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition:
      "transform 0.3s ease",
  },
  /* =====================================================
     CONTACTO
     ===================================================== */

contactSection: {
margin: "32px 28px 12px",
padding: "34px 24px 28px",

  background:
    "linear-gradient(145deg, #0b3fa6 0%, #082d78 55%, #061d4d 100%)",

  borderRadius: "20px",

  border:
    "1px solid rgba(96, 165, 250, 0.5)",

  boxShadow:
    "0 20px 55px rgba(0, 0, 0, 0.38)",
},

contactHeader: {
  textAlign: "center",
  marginBottom: "24px",
},

contactEyebrow: {
  fontSize: "10px",
  fontWeight: 900,
  letterSpacing: "1.5px",
  color: "#93c5fd",
  marginBottom: "8px",
  textTransform: "uppercase",
},

contactTitle: {
  margin: 0,
  color: "#ffffff",
  fontSize: "25px",
  lineHeight: 1.15,
  fontWeight: 900,
},

contactSubtitle: {
  margin: "10px auto 0",
  maxWidth: "420px",
  color: "#dbeafe",
  fontSize: "13px",
  lineHeight: 1.5,
},

contactButtons: {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "12px",
  width: "100%",
  boxSizing: "border-box",
},
contactIcon: {
  width: "38px",
  height: "38px",
  minWidth: "38px",
  borderRadius: "11px",

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  background: "rgba(255,255,255,0.14)",
  fontSize: "18px",
},

contactText: {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "center",
  gap: "2px",
  minWidth: 0,
  flex: 1,
  lineHeight: 1.15,
},

contactSubtext: {
  display: "block",
  fontSize: "9px",
  fontWeight: 500,
  opacity: 0.85,
  lineHeight: 1.2,
},

contactArrow: {
  marginLeft: "auto",
  fontSize: "22px",
  fontWeight: 800,
  opacity: 0.9,
},

whatsappButton: {
  border: "1px solid rgba(255,255,255,0.12)",
  background:
    "linear-gradient(135deg, #22c55e, #0f9f49)",
  color: "#ffffff",

padding: "10px 12px",
minHeight: "64px",
borderRadius: "13px",

  cursor: "pointer",

  display: "flex",
  alignItems: "center",
  gap: "12px",

  textAlign: "left",
  boxSizing: "border-box",

  fontWeight: 800,

  boxShadow:
    "0 10px 22px rgba(0,0,0,0.22)",
},
callButton: {
  border: "1px solid rgba(255,255,255,0.12)",
  background:
    "linear-gradient(135deg, #1473ff, #0754d8)",
  color: "#ffffff",

padding: "10px 12px",
minHeight: "64px",
borderRadius: "13px",

  cursor: "pointer",

  display: "flex",
  alignItems: "center",
  gap: "12px",

  textAlign: "left",
  boxSizing: "border-box",

  fontWeight: 800,

  boxShadow:
    "0 10px 22px rgba(0,0,0,0.22)",
},

emailButton: {
  border: "1px solid rgba(255,255,255,0.12)",
  background:
    "linear-gradient(135deg, #8b5cf6, #6d28d9)",
  color: "#ffffff",

  padding: "10px 12px",
  minHeight: "64px",
  borderRadius: "13px",

  cursor: "pointer",

  display: "flex",
  alignItems: "center",
  gap: "12px",

  textAlign: "left",
  boxSizing: "border-box",

  fontWeight: 800,

  boxShadow:
    "0 10px 22px rgba(0,0,0,0.22)",
},

locationButton: {
  border: "1px solid rgba(255,255,255,0.12)",
  background:
    "linear-gradient(135deg, #f97316, #ea580c)",
  color: "#ffffff",

  padding: "10px 12px",
  minHeight: "64px",
  borderRadius: "13px",

  cursor: "pointer",

  display: "flex",
  alignItems: "center",
  gap: "12px",

  textAlign: "left",
  boxSizing: "border-box",

  fontWeight: 800,

  boxShadow:
    "0 10px 22px rgba(0,0,0,0.22)",
},

facebookButton: {
  border: "1px solid rgba(255,255,255,0.12)",
  background:
    "linear-gradient(135deg, #2563eb, #1d4ed8)",
  color: "#ffffff",

  padding: "10px 12px",
  minHeight: "64px",
  borderRadius: "13px",

  cursor: "pointer",

  display: "flex",
  alignItems: "center",
  gap: "12px",

  textAlign: "left",
  boxSizing: "border-box",

  fontWeight: 800,

  boxShadow:
    "0 8px 18px rgba(0,0,0,0.18)",
},

  /* =====================================================
     CARGANDO
     ===================================================== */

  loading: {
    width: "min(100% - 30px, 800px)",
    margin: "100px auto",
    background:
      "linear-gradient(145deg, #0a1b31, #061326)",
    padding: "45px",
    borderRadius: "16px",
    textAlign: "center",
    boxSizing: "border-box",
    color: "#cbd5e1",
    border:
      "1px solid rgba(59, 130, 246, 0.25)",
    boxShadow:
      "0 20px 50px rgba(0, 0, 0, 0.45)",
  },

  /* =====================================================
     ERROR
     ===================================================== */

  errorBox: {
    width: "min(100% - 30px, 600px)",
    margin: "100px auto",
    background:
      "linear-gradient(145deg, #0a1b31, #061326)",
    padding: "35px",
    borderRadius: "16px",
    textAlign: "center",
    boxSizing: "border-box",
    color: "#f8fafc",
    border:
      "1px solid rgba(59, 130, 246, 0.25)",
    boxShadow:
      "0 20px 50px rgba(0, 0, 0, 0.45)",
  },

  backButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #0b5cff, #1747c9)",
    color: "#ffffff",
    padding: "12px 22px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 800,
  },

  /* =====================================================
     PIE DE PÁGINA
     ===================================================== */

footer: {
  textAlign: "center",
  color: "#64748b",
  fontSize: "11px",
  padding: "2px 10px 2px",
  borderTop: "1px solid rgba(59, 130, 246, 0.10)",
},
};