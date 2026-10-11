const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
) {
  // Obtener el JWT guardado

const token = localStorage.getItem("zapea_token");

const response = await fetch(`${API_URL}${endpoint}`, {
  ...options,
  headers: {
    "Content-Type": "application/json",

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),

    ...(options.headers || {}),
  },
});

  // Si el servidor rechaza la sesión
  if (response.status === 401) {
    const text = await response.text();

    let mensaje = "Sesión expirada. Inicia sesión nuevamente.";

    try {
      const data = JSON.parse(text);

      if (Array.isArray(data?.message)) {
        mensaje = data.message.join(", ");
      } else if (data?.message) {
        mensaje = data.message;
      }
    } catch {
      // La respuesta no era JSON
    }

    localStorage.removeItem("zapea_token");
    localStorage.removeItem("zapea_user");

    // Evitar redirección si ya estamos en login
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }

    throw new Error(mensaje);
  }

  if (!response.ok) {
    const text = await response.text();

    let mensaje = text;

    try {
      const data = JSON.parse(text);

      if (Array.isArray(data?.message)) {
        mensaje = data.message.join(", ");
      } else if (data?.message) {
        mensaje = data.message;
      }
    } catch {
      // La respuesta no era JSON
    }

    throw new Error(
      mensaje || `Error ${response.status} en ${endpoint}`,
    );
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/*
|--------------------------------------------------------------------------
| API PRINCIPAL
|--------------------------------------------------------------------------
*/

export const api = {
  get: async (endpoint: string) => {
    return apiFetch(endpoint, {
      method: "GET",
    });
  },

  post: async (endpoint: string, data?: unknown) => {
    return apiFetch(endpoint, {
      method: "POST",
      body:
        data !== undefined
          ? JSON.stringify(data)
          : undefined,
    });
  },

  patch: async (endpoint: string, data?: unknown) => {
    return apiFetch(endpoint, {
      method: "PATCH",
      body:
        data !== undefined
          ? JSON.stringify(data)
          : undefined,
    });
  },

  put: async (endpoint: string, data?: unknown) => {
    return apiFetch(endpoint, {
      method: "PUT",
      body:
        data !== undefined
          ? JSON.stringify(data)
          : undefined,
    });
  },

  delete: async (endpoint: string) => {
    return apiFetch(endpoint, {
      method: "DELETE",
    });
  },
};

export { API_URL };

export default API_URL;