import { Zap } from "lucide-react";
import { LoginForm } from "../LoginForm";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-3xl shadow-2xl border border-gray-100/70 transform hover:shadow-3xl transition-shadow duration-300">
        <div className="flex flex-col items-center space-y-4">
          {/* Icono con degradado más definido */}
          <div className="w-16 h-16 bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            PERUINNOVA
          </h2>
          <p className="text-gray-500 text-base font-light">
            Bienvenido de vuelta.
          </p>
        </div>
        <LoginForm onLoginSuccess={onLoginSuccess} />
      </div>
    </div>
  );

  // return (
  //   <div className="flex items-center justify-center">
  //     <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-slate-200/50">
  //       <div className="flex flex-col items-center space-y-3">
  //         <div className="w-16 h-16 bg-linea-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
  //           <Zap className="w-8 h-8 text-white" />
  //         </div>
  //         <h2 className="text-3xl font-bold text-slate-800">PERUINNOVA</h2>
  //         <p className="text-slate-500">Inicia sesión en tu cuenta</p>
  //       </div>
  //       <LoginForm onLoginSuccess={onLoginSuccess} />
  //     </div>
  //   </div>
  // );
};
