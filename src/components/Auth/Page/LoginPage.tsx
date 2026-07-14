import { Zap } from "lucide-react";
import { LoginForm } from "../LoginForm";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
  return (
    <div className="flex items-center justify-center w-full">
      {/* Reducción de padding a p-6, bordes a rounded-xl y sombra refinada */}
      <div className="w-full max-w-md p-6 space-y-6 bg-white rounded-xl shadow-md border border-slate-200/80 transition-all duration-200">
        <div className="flex flex-col items-center space-y-2">
          {/* Contenedor del ícono más compacto y elegante */}
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100">
            <Zap className="w-6 h-6 text-white" />
          </div>
          {/* Tipografía corporativa ajustada de text-4xl a text-2xl */}
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            INNOVAPERU
          </h2>
          <p className="text-slate-500 text-sm">Bienvenido de vuelta.</p>
        </div>
        <LoginForm onLoginSuccess={onLoginSuccess} />
      </div>
    </div>
  );
};
