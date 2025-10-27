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
    if (userProfile?.id_usuario) {
      console.log(userProfile?.id_usuario);
      const response = await logoutAuth(userProfile.id_usuario);
      const { result, message } = response;
      const classResult = result ? "success" : "error";
      showToast(classResult, message as string);
      window.location.href = "/";
    } else {
      showToast("error", "Error al cerrar sesión de usuario");
    }
  };

  return (
    // <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4">
    <div className="border-b px-6 py-5 border-slate-400/50">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            className="p-2 rounded-lg text-slate-600 transition-colors cursor-pointer"
            onClick={onToggleSidebar}
          >
            <Menu className="w-5 h-5" />
          </button>
          {/* <div className="hidden md:block">
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">
              Dashboard
            </h1>
            <p>Welcome back, Alex! here's what's happening today</p>
          </div> */}
        </div>

        {/* Center */}
        {/* <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button className="absolute right top-1/2 transform -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <Filter />
            </button>
          </div>
        </div> */}

        <div className="flex items-center space-x-3">
          {/* <button className="hidden lg:flex items-center space-x-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">New</span>
          </button>
          <button className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Sun className="w-5 h-5" />
          </button>
          <button className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>
          <button className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Settings className="w-5 h-5"></Settings>
          </button> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-200 cursor-pointer">
                {/* <img
                  src=""
                  alt="User"
                  className="w-8 h-8 rounded-full ring-2 ring-blue-500"
                /> */}
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
          {/* <div className="flex items-center space-x-3 pl-3 border-l border-slate-200 dark:border-slate-700">
            <img
              src=""
              alt="User"
              className="w-8 h-8 rounded-full ring-2 ring-blue-500"
            />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Alex Johnson
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Administrator
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div> */}
        </div>
      </div>
    </div>
  );
};
