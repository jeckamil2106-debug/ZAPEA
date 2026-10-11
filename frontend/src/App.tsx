import { useEffect, useRef, useState } from "react";

import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import Companies from "./pages/companies";
import PublicCompany from "./pages/PublicCompany";
import Search from "./pages/Search";
import Login from "./pages/login";
import Services from "./pages/Services";
import CrearCuentaEmpresa from "./pages/CrearCuentaEmpresa";
import Configuracion from "./pages/Configuracion";

function App() {
  const [page, setPage] = useState("dashboard");
  const pageRef = useRef(page);

useEffect(() => {
  pageRef.current = page;
}, [page]);
  const pathname = window.location.pathname;

  // ============================================
  // NAVEGACIÓN INTERNA + BOTÓN ATRÁS DEL CELULAR
  // ============================================

const navegar = (nuevaPagina: string) => {

  // EMPRESAS:
  // Siempre debe quedar después del Dashboard en el historial.
  if (nuevaPagina === "empresas") {
    window.history.pushState(
      { zapeaPage: "empresas" },
      "",
      window.location.href
    );

    setPage("empresas");
    return;
  }

  window.history.pushState(
    { zapeaPage: nuevaPagina },
    "",
    window.location.href
  );

  setPage(nuevaPagina);
};

// ============================================
// CONTROL DEL BOTÓN ATRÁS
// ============================================

useEffect(() => {

  const estadoActual = window.history.state;

  if (!estadoActual?.zapeaPage) {

    const esPerfilEmpresa =
      window.location.pathname.startsWith("/empresa/");

    window.history.replaceState(
      {
        ...(estadoActual || {}),
        zapeaPage: esPerfilEmpresa
          ? "empresa"
          : "dashboard",
      },
      "",
      window.location.href
    );
  }

  const manejarAtras = (event: PopStateEvent) => {

    // Si estamos dentro de EMPRESAS,
    // el botón atrás del celular siempre vuelve al Dashboard.
    if (pageRef.current === "empresas") {

      window.history.replaceState(
        {
          ...(event.state || {}),
          zapeaPage: "dashboard",
        },
        "",
        window.location.href
      );

      setPage("dashboard");

      return;
    }

    setPage(
      event.state?.zapeaPage || "dashboard"
    );
  };

  window.addEventListener(
    "popstate",
    manejarAtras
  );

  return () => {

    window.removeEventListener(
      "popstate",
      manejarAtras
    );

  };

}, []);
  // ============================================
  // LOGIN
  // ============================================

  if (pathname === "/login") {
    return <Login />;
  }

  // ============================================
  // PERFIL PÚBLICO DE EMPRESA
  // ============================================

  const publicCompanyMatch = pathname.match(
    /^\/empresa\/([^/]+)$/
  );

  if (publicCompanyMatch) {
    const companyId = publicCompanyMatch[1];

    return (
      <PublicCompany
        companyId={companyId}
      />
    );
  }

  // ============================================
  // BÚSQUEDA ZAPEA
  // ============================================

  // La búsqueda es pública.
  // La entrada principal de ZAPEA también es pública.

if (pathname === "/" || pathname === "/busqueda") {

  return (

    <Search

      onSeleccionarEmpresa={(id) => {

        window.history.pushState(

          { zapeaPage: "empresa", returnPage: "busqueda" },

          "",

          `/empresa/${id}`

        );

        setPage("empresa");

      }}

    />

  );

}

  // ============================================
  // PROTECCIÓN DEL PANEL DE ADMINISTRACIÓN
  // ============================================

  const token = localStorage.getItem("zapea_token");

  if (!token) {
    window.location.href = "/login";
    return null;
  }

  // ============================================
  // DASHBOARD
  // ============================================

  if (page === "dashboard") {
    return (
      <Dashboard
        onNavigate={navegar}
      />
    );
  }

  // ============================================
  // BÚSQUEDA ZAPEA DESDE EL PANEL
  // ============================================

if (page === "busqueda") {

  return (

    <Search

      onSeleccionarEmpresa={(id) => {

        window.history.pushState(

          { zapeaPage: "empresa", returnPage: "busqueda" },

          "",

          `/empresa/${id}`

        );

        setPage("empresa");

      }}

      onVolver={() => window.history.back()}

    />

  );

}

  // ============================================
  // CONTACTOS
  // ============================================

  if (page === "contactos") {
    return (
      <Contacts
        onNavigate={navegar}
      />
    );
  }

  // ============================================
  // EMPRESAS
  // ============================================

  if (page === "empresas") {
    return (
      <Companies
        onNavigate={navegar}
      />
    );
  }

  // ============================================
  // SERVICIOS
  // ============================================

  if (page === "servicios") {
    return <Services />;
  }

// ============================================
// CONFIGURACIÓN
// ============================================

if (page === "configuracion") {
  return (
    <Configuracion
      onNavigate={navegar}
    />
  );
}

// ============================================
// CREAR CUENTA EMPRESA
// ============================================
if (page === "crear-cuenta-empresa") {
  const usuario = JSON.parse(
    localStorage.getItem("zapea_user") || "{}"
  );

  if (usuario?.role !== "ADMIN") {
    setPage("dashboard");
    return (
      <Dashboard
        onNavigate={navegar}
      />
    );
  }

  return <CrearCuentaEmpresa />;
}
  // ============================================
  // POR DEFECTO
  // ============================================

  return (
    <Dashboard
      onNavigate={navegar}
    />
  );
}

export default App;