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

import { ProgramaListPage } from "./components/Programa/Page/ProgramaListPage";
import { ProgramaFormPage } from "./components/Programa/Page/ProgramaFormPage";

import { ModuloListPage } from "./components/Modulo/Page/ModuloListPage";
import { ModuloFormPage } from "./components/Modulo/Page/ModuloFormPage";

import { MatriculaListPage } from "./components/Matricula/Page/MatriculaListPage";
import { MatriculaFormPage } from "./components/Matricula/Page/MatriculaFormPage";

import { PagoListPage } from "./components/Pago/Page/PagoListPage";
import { PagoFormPage } from "./components/Pago/Page/PagoFormPage";

import { AdjuntoListPage } from "./components/Adjunto/Page/AdjuntoListPage";
import { AdjuntoFormPage } from "./components/Adjunto/Page/AdjuntoFormPage";

import { UsuarioListPage } from "./components/Usuario/Page/UsuarioListPage";
import { UsuarioFormPage } from "./components/Usuario/Page/UsuarioFormPage";

import { DashboardAlumno } from "./components/Alumno/DashboardAlumno";

import { MisMatriculasListPage } from "./components/Alumno/Page/MisMatriculasListPage";

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
    <div
      className={`min-h-screen transition-all duration-500 
      ${
        isLoginPage
          ? "bg-gray-50 flex items-center justify-center pl-4 pr-4" // Centra la página de Login
          : "bg-gray-100" // Fondo neutro para el resto de la app
      }`}
    >
      <div className="flex h-screen overflow-hidden w-full max-w-full">
        {!isLoginPage && isLoggedIn && (
          <Sidebar
            collapsed={sideBarCollapsed}
            onToggle={() => setSideBarCollapsed(!sideBarCollapsed)}
            currentPage={location.pathname}
          />
        )}

        <div
          className={
            `flex-1 flex flex-col overflow-hidden 
             ${isLoginPage ? "h-auto" : "h-screen"}` // Ajuste de altura para login page
          }
        >
          {!isLoginPage && isLoggedIn && (
            <Header
              sidebarCollapsed={sideBarCollapsed}
              onToggleSidebar={() => setSideBarCollapsed(!sideBarCollapsed)}
            />
          )}

          <main className="flex-1 overflow-y-auto bg-transparent">
            <div
              className={`${
                isLoginPage
                  ? "p-0 h-full flex items-center justify-center"
                  : "p-6 space-y-6"
              }`}
            >
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
                      path="/personas/:nombreGrupo/editar/:id"
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
                      path="/programa-academico"
                      element={<ProgramaListPage />}
                    ></Route>
                    <Route
                      path="/programa-academico/nuevo"
                      element={<ProgramaFormPage />}
                    ></Route>
                    <Route
                      path="/programa-academico/editar/:id"
                      element={<ProgramaFormPage />}
                    ></Route>

                    <Route path="/modulo" element={<ModuloListPage />}></Route>
                    <Route
                      path="/modulo/nuevo"
                      element={<ModuloFormPage />}
                    ></Route>
                    <Route
                      path="/modulo/editar/:id"
                      element={<ModuloFormPage />}
                    ></Route>

                    <Route
                      path="/matricula"
                      element={<MatriculaListPage />}
                    ></Route>
                    <Route
                      path="/matricula/nuevo"
                      element={<MatriculaFormPage />}
                    ></Route>
                    <Route
                      path="/matricula/editar/:id"
                      element={<MatriculaFormPage />}
                    ></Route>
                    <Route
                      path="/matricula/:id/pago-modulo"
                      element={<PagoFormPage />}
                    ></Route>

                    <Route path="/pago" element={<PagoListPage />}></Route>

                    <Route
                      path="/adjunto"
                      element={<AdjuntoListPage />}
                    ></Route>
                    <Route
                      path="/adjunto/nuevo"
                      element={<AdjuntoFormPage />}
                    ></Route>
                    <Route
                      path="/adjunto/editar/:id"
                      element={<AdjuntoFormPage />}
                    ></Route>

                    <Route
                      path="/usuario"
                      element={<UsuarioListPage />}
                    ></Route>
                    <Route
                      path="/usuario/nuevo"
                      element={<UsuarioFormPage />}
                    ></Route>

                    <Route
                      path="/mantenimiento/*"
                      element={<MantenimientoPage />}
                    ></Route>

                    <Route
                      path="/dashboard-alumno"
                      element={<DashboardAlumno />}
                    ></Route>
                    <Route
                      path="/mis-matriculas"
                      element={<MisMatriculasListPage />}
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
