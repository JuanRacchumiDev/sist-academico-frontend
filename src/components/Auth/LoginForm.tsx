import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { loginAuth } from "../../services/authService";
import { useToast } from "../../context/ToastContext";
import { TAuthResponse } from "../../types/TAuthResponse";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const validateForm = () => {
    if (!email.trim() || !password.trim()) {
      showToast("error", "Email y password son requeridos");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("error", "Por favor ingrese un email válido");
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      let redirectDashboard: string = "";
      const response = await loginAuth(email, password);
      const { result, status, message, data } = response as TAuthResponse;
      const messageStr = message as string;

      if (result && status === 200) {
        const { nombre_perfil } = data;
        if (nombre_perfil === "alumno") {
          redirectDashboard = "/dashboard-alumno";
        } else if (nombre_perfil === "administrador") {
          redirectDashboard = "/dashboard";
        }

        showToast("success", messageStr);
        onLoginSuccess();
        navigate(redirectDashboard);
        return;
      }
      showToast("error", messageStr);
    } catch (error) {
      console.error("error", error);
      showToast("error", "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Reducción de espacio entre controles de space-y-6 a space-y-4
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-xs font-medium text-slate-700 mb-1"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-xs"
          placeholder="you@example.com"
          autoComplete="off"
          required
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-xs font-medium text-slate-700 mb-1"
        >
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-xs"
            placeholder="••••••••"
            autoComplete="off"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="text-right mt-1.5">
          <a
            href="#"
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </div>

      {/* Botón con estilo compacto (py-2, text-sm) eliminando el gradiente excesivo */}
      <button
        type="submit"
        className="w-full py-2 mt-2 font-medium text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-all duration-150 disabled:opacity-60 flex items-center justify-center space-x-2"
        disabled={loading}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Cargando...</span>
          </>
        ) : (
          "Iniciar sesión"
        )}
      </button>
    </form>
  );
};
