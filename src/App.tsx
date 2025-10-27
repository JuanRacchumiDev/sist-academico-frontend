import { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "./components/Layout/Sidebar";
import { Header } from "./components/Layout/Header";
import { LoginPage } from "./components/Auth/Page/LoginPage";
import { NotFoundPage } from "./components/Layout/NotFoundPage";

import { Dashboard } from "./components/Dashboard/Dashboard";

import { PersonaListPage } from "./components/Persona/Page/PersonaListPage";
import { PersonaFormPage } from "./components/Persona/Page/PersonaFormPage";

import { EventoListPage } from "./components/Evento/Page/EventoListPage";
import { EventoFormPage } from "./components/Evento/Page/EventoFormPage";

import { MantenimientoPage } from "./components/Mantenimiento/MantenimientoPage";

function App() {
  const [sideBarCollapsed, setSideBarCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Verificamos si estamos en la página de login
  const isLoginPage =
    location.pathname === "/login" || location.pathname === "/";

  const handleLogin = (isSuccess: boolean) => {
    setIsLoggedIn(isSuccess);
  };

  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");

    if (storedAuth) {
      setIsLoggedIn(true);
    } else if (!isLoginPage) {
      navigate("/login");
    }
  }, [isLoginPage, navigate]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 transition-all duration-500">
      <div className="flex h-screen overflow-hidden">
        {!isLoginPage && isLoggedIn && (
          <Sidebar
            collapsed={sideBarCollapsed}
            onToggle={() => setSideBarCollapsed(!sideBarCollapsed)}
            currentPage={location.pathname}
          />
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          {!isLoginPage && isLoggedIn && (
            <Header
              sidebarCollapsed={sideBarCollapsed}
              onToggleSidebar={() => setSideBarCollapsed(!sideBarCollapsed)}
            />
          )}

          <main className="flex-1 overflow-y-auto bg-transparent">
            <div className="p-6 space-y-6">
              <Routes>
                <Route
                  path="/"
                  element={
                    <LoginPage onLoginSuccess={() => handleLogin(true)} />
                  }
                />
                <Route
                  path="/login"
                  element={
                    <LoginPage onLoginSuccess={() => handleLogin(true)} />
                  }
                />

                {isLoggedIn ? (
                  <>
                    <Route path="/dashboard" element={<Dashboard />}></Route>

                    <Route
                      path="/personas/:nombreGrupo"
                      element={<PersonaListPage />}
                    ></Route>
                    <Route
                      path="/personas/:nombreGrupo/nuevo"
                      element={<PersonaFormPage />}
                    ></Route>
                    <Route
                      path="/persona/:nombreGrupo/editar/:id"
                      element={<PersonaFormPage />}
                    ></Route>

                    <Route path="/evento" element={<EventoListPage />}></Route>
                    <Route
                      path="/evento/nuevo"
                      element={<EventoFormPage />}
                    ></Route>
                    <Route
                      path="/evento/editar/:id"
                      element={<EventoFormPage />}
                    ></Route>

                    <Route
                      path="/mantenimiento/*"
                      element={<MantenimientoPage />}
                    ></Route>
                  </>
                ) : (
                  <Route
                    path="*"
                    element={
                      <LoginPage onLoginSuccess={() => handleLogin(true)} />
                    }
                  />
                )}

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
export default App;
