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

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("error", "Por favor ingrese un email válido");
      return false;
    }

    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await loginAuth(email, password);

      console.log("response login", response);

      const { result, status, message } = response as TAuthResponse;

      const messageStr = message as string;

      if (result && status === 200) {
        showToast("success", messageStr);
        onLoginSuccess();
        navigate("/dashboard");
        return;
      }
      showToast("error", messageStr);
    } catch (error) {
      console.log("error", error);
      showToast("error", "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      {" "}
      {/* Más espacio vertical */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          // CLASES MEJORADAS: Borde más oscuro, sin fondo gris, ring de focus en azul.
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
          placeholder="you@example.com"
          autoComplete="off"
          required
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            // CLASES MEJORADAS: Similar al input de email. Padding a la derecha ajustado.
            className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
            placeholder="••••••••"
            autoComplete="off"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        <div className="text-right mt-1">
          <a
            href="#"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            ¿Olvidaste te contraseña?
          </a>
        </div>
      </div>
      <button
        type="submit"
        // CLASES MEJORADAS: Degradado a un color más vibrante, sombra de enfoque en hover.
        className="w-full py-3 mt-6 font-bold text-lg text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-60 disabled:shadow-none flex items-center justify-center space-x-2"
        disabled={loading}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Cargando...</span>
          </>
        ) : (
          "Iniciar sesión"
        )}
      </button>
    </form>
  );

  // return (
  //   <form onSubmit={handleLogin} className="space-y-4">
  //     <div>
  //       <label htmlFor="email" className="text-sm font-medium text-slate-700">
  //         Email
  //       </label>
  //       <input
  //         type="email"
  //         id="email"
  //         value={email}
  //         onChange={(e) => setEmail(e.target.value)}
  //         className="mt-1 w-full p-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
  //         placeholder="you@example.com"
  //         autoComplete="off"
  //         required
  //       />
  //     </div>
  //     <div>
  //       <label
  //         htmlFor="password"
  //         className="text-sm font-medium text-slate-700"
  //       >
  //         Password
  //       </label>
  //       <div className="relative mt-1">
  //         <input
  //           type={showPassword ? "text" : "password"}
  //           id="password"
  //           value={password}
  //           onChange={(e) => setPassword(e.target.value)}
  //           className="w-full p-3 pr-10 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
  //           placeholder="••••••••"
  //           autoComplete="off"
  //           required
  //         />
  //         <button
  //           type="button"
  //           onClick={() => setShowPassword(!showPassword)}
  //           className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500"
  //           aria-label={showPassword ? "Hide password" : "Show password"}
  //         >
  //           {showPassword ? (
  //             <EyeOff className="w-5 h-5" />
  //           ) : (
  //             <Eye className="w-5 h-5" />
  //           )}
  //         </button>
  //       </div>
  //     </div>
  //     <div className="flex items-center justify-between">
  //       <div className="text-sm">
  //         <a
  //           href="#"
  //           className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
  //         >
  //           ¿Olvidaste te contraseña?
  //         </a>
  //       </div>
  //     </div>
  //     <button
  //       type="submit"
  //       className="w-full p-3 font-semibold text-white bg-linear-to-r from-blue-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
  //       disabled={loading}
  //     >
  //       {loading ? (
  //         <svg
  //           className="animate-spin h-5 w-5 text-white"
  //           xmlns="http://www.w3.org/2000/svg"
  //           fill="none"
  //           viewBox="0 0 24 24"
  //         >
  //           <circle
  //             className="opacity-25"
  //             cx="12"
  //             cy="12"
  //             r="10"
  //             stroke="currentColor"
  //             strokeWidth="4"
  //           ></circle>
  //           <path
  //             className="opacity-75"
  //             fill="currentColor"
  //             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
  //           ></path>
  //         </svg>
  //       ) : (
  //         "Iniciar sesión"
  //       )}
  //     </button>
  //   </form>
  // );
};
