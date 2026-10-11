import { useState } from "react";
import { api } from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
const response = await api.post("/auth/login", {
  email,
  password,
});

// Obtener los datos reales de la respuesta
const data = response?.data ?? response;

console.log("RESPUESTA LOGIN:", data);

// Verificar que el backend devolvió el JWT
if (!data?.access_token) {
  throw new Error("El servidor no devolvió el token de acceso.");
}

// Guardar el JWT de la sesión
localStorage.setItem(
  "zapea_token",
  data.access_token,
);

// Guardar los datos básicos del usuario
localStorage.setItem(
  "zapea_user",
  JSON.stringify(data.user),
);

console.log("Login correcto:", data);

alert("Bienvenido " + data.user.name);

// Ir al panel administrativo
window.location.href = "/admin";
    } catch (error: any) {
      console.log(error);
      console.log(error.response);
      console.log(error.response?.data);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Error al iniciar sesión"
      );
    }
  };

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "80px auto",
        display: "flex",
        flexDirection: "column",
        gap: 15,
      }}
    >
      <h1 style={{ textAlign: "center" }}>ZAPEA</h1>

      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={login}>
        Iniciar sesión
      </button>
    </div>
  );
}