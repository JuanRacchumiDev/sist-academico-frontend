import { ChevronDown, Menu, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { logoutAuth } from "../../services/authService";
import { getAuthData } from "../../utils/authMemo";
import { useMemo } from "react";

export const Header = ({ sidebarCollapsed, onToggleSidebar }) => {
  const { showToast } = useToast();

  const userProfile = useMemo(() => getAuthData()?.usuario, []);

  const handleLogout = async () => {
    if (userProfile?.id) {
      console.log(userProfile?.id);
      const response = await logoutAuth(userProfile.id);
      const { result, message } = response;
      const classResult = result ? "success" : "error";
      showToast(classResult, message as string);
      window.location.href = "/";
    } else {
      showToast("error", "Error al cerrar sesión de usuario");
    }
  };

  return (
    <div className="border-b px-6 py-5 border-slate-400/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            className="p-2 rounded-lg text-slate-600 transition-colors cursor-pointer"
            onClick={onToggleSidebar}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-200 cursor-pointer">
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-slate-500">
                    {userProfile?.nombre_completo
                      ? userProfile.nombre_completo
                      : "Usuario"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {userProfile?.nombre_perfil
                      ? userProfile.nombre_perfil
                      : "PERFIL"}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-linear-to-r from-blue-300 to-purple-400 border-purple-300"
              align="end"
            >
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator className="border-slate-500/50 border-b" />
              <DropdownMenuItem
                asChild
                className="cursor-pointer hover:bg-purple-600 hover:text-white"
              >
                <Link to="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-500 cursor-pointer hover:bg-purple-600 hover:text-white"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
