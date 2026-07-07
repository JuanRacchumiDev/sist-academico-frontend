import { getAuthData } from "@/utils/authMemo";
import { ADMIN_MENU_ITEMS, ALUMNO_MENU_ITEMS } from "@/utils/menuItems";
import { ChevronDown, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

export const Sidebar = ({ collapsed, onToggle, currentPage }) => {
  const [expandedItems, setExpandedItems] = useState(new Set(["analytics"]));
  const location = useLocation();

  const toggleExpanded = (itemid: string) => {
    const newExpanded = new Set(expandedItems);

    if (newExpanded.has(itemid)) {
      newExpanded.delete(itemid);
    } else {
      newExpanded.add(itemid);
    }

    setExpandedItems(newExpanded);
  };

  const userProfile = useMemo(() => getAuthData()?.usuario, []);

  console.log({ userProfile });

  const filteredMenuItems = useMemo(() => {
    if (!userProfile) {
      return [];
    }

    const { nombre_perfil } = userProfile;

    console.log({ nombre_perfil });

    switch (nombre_perfil?.toLowerCase()) {
      case "administrador":
        return ADMIN_MENU_ITEMS;
      case "alumno":
        return ALUMNO_MENU_ITEMS;
      default:
        return [];
    }
  }, [userProfile]);

  const panelSubtitle = useMemo(() => {
    if (!userProfile) return "Panel";
    return userProfile.nombre_perfil?.toLowerCase() === "administrador"
      ? "Admin Panel"
      : "Portal Alumno";
  }, [userProfile]);

  return (
    <div
      className={`${
        collapsed ? "w-20" : "w-64"
      } transition-all duration-300 bg-white shadow-xl shadow-gray-200/50 flex flex-col relative z-20 h-screen overflow-y-auto`}
    >
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/30 shrink-0">
            <Zap className="w-6 h-6 text-white" />
          </div>

          {!collapsed && (
            <div>
              <h1 className="text-lg font-extrabold text-gray-900 leading-tight">
                SIST. ACADÉMICO
              </h1>
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">
                {panelSubtitle}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const isItemActive =
            item.path && location.pathname.startsWith(item.path);

          return (
            <div key={item.id}>
              {item.path ? (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 
                      ${
                        // Estilo Activo: Degradado y sombra
                        isActive
                          ? "bg-linear-to-r from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/30"
                          : // Estilo Inactivo: Texto gris, hover suave
                            "text-gray-600 hover:bg-blue-50 hover:text-gray-800"
                      }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <item.icon
                      className={`w-5 h-5 shrink-0 ${
                        !collapsed &&
                        (item.path && location.pathname.startsWith(item.path)
                          ? "text-white"
                          : "text-blue-500")
                      }`}
                    />
                    {!collapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </div>
                  {/* Indicador de colapso para vistas móviles */}
                  {collapsed && (
                    <span className="p-1.5 rounded-full bg-blue-500 text-white text-xs">
                      !
                    </span>
                  )}
                </NavLink>
              ) : (
                <button
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 
                    ${
                      // Estilo Activo para Categoría (cuando un sub-item está activo)
                      isItemActive || expandedItems.has(item.id)
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-gray-600 hover:bg-blue-50 hover:text-gray-800"
                    }`}
                  onClick={() => toggleExpanded(item.id)}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon
                      className={`w-5 h-5 shrink-0 ${
                        isItemActive || expandedItems.has(item.id)
                          ? "text-blue-700"
                          : "text-blue-500"
                      }`}
                    />
                    {!collapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </div>
                  {!collapsed && item.submenu && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedItems.has(item.id) ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>
              )}

              {/* Submenu */}
              {!collapsed && item.submenu && expandedItems.has(item.id) && (
                <div className="ml-5 mt-1 space-y-1 border-l-2 border-gray-200 pl-4 py-1">
                  {" "}
                  {/* Separador visual */}
                  {item.submenu?.map((subitem) => (
                    <NavLink
                      key={subitem.id}
                      to={subitem.path}
                      className={({ isActive }) =>
                        `w-full block text-left p-2 text-sm rounded-lg transition-all 
                        ${
                          // Estilo Activo: Degradado para Submenu
                          isActive
                            ? "bg-linear-to-r from-blue-600 to-indigo-700 text-white font-semibold"
                            : "text-gray-600 hover:bg-blue-100 hover:text-gray-900"
                        }`
                      }
                    >
                      {subitem.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User profile */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          {/* Fondo más limpio y sutil para el perfil de usuario */}
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
              {userProfile?.nombre_completo
                ? userProfile.nombre_completo.charAt(0)
                : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userProfile?.nombre_completo || "Usuario"}
                </p>
                <p className="text-xs text-blue-600 font-medium truncate">
                  {userProfile?.nombre_perfil || "Perfil"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
