import { Route, Routes } from "react-router-dom";
import { TipoDocumentoList } from "./TipoDocumento/TipoDocumentoList";
import { TipoDocumentoForm } from "./TipoDocumento/TipoDocumentoForm";
import { SegmentoList } from "./Segmento/SegmentoList";
import { SegmentoForm } from "./Segmento/SegmentoForm";
import { TipoEventoList } from "./TipoEvento/TipoEventoList";
import { TipoEventoForm } from "./TipoEvento/TipoEventoForm";
import { CategoriaEventoList } from "./CategoriaEvento/CategoriaEventoList";
import { CategoriaEventoForm } from "./CategoriaEvento/CategoriaEventoForm";
import { TipoCertificadoList } from "./TipoCertificado/TipoCertificadoList";
import { TipoCertificadoForm } from "./TipoCertificado/TipoCertificadoForm";
import { SedeList } from "./Sede/SedeList";
import { SedeForm } from "./Sede/SedeForm";
import { UniversidadList } from "./Universidad/UniversidadList";
import { UniversidadForm } from "./Universidad/UniversidadForm";

export const MantenimientoPage = () => {
  return (
    <div>
      <Routes>
        <Route path="/tipo-documento" element={<TipoDocumentoList />} />
        <Route path="/tipo-documento/nuevo" element={<TipoDocumentoForm />} />
        <Route
          path="/tipo-documento/editar/:id"
          element={<TipoDocumentoForm />}
        />

        <Route path="/tipo-evento" element={<TipoEventoList />} />
        <Route path="/tipo-evento/nuevo" element={<TipoEventoForm />} />
        <Route path="/tipo-evento/editar/:id" element={<TipoEventoForm />} />

        <Route path="/categoria-evento" element={<CategoriaEventoList />} />
        <Route
          path="/categoria-evento/nuevo"
          element={<CategoriaEventoForm />}
        />
        <Route
          path="/categoria-evento/editar/:id"
          element={<CategoriaEventoForm />}
        />

        <Route path="/tipo-certificado" element={<TipoCertificadoList />} />
        <Route
          path="/tipo-certificado/nuevo"
          element={<TipoCertificadoForm />}
        />
        <Route
          path="/tipo-certificado/editar/:id"
          element={<TipoCertificadoForm />}
        />

        <Route path="/sede" element={<SedeList />} />
        <Route path="/sede/nuevo" element={<SedeForm />} />
        <Route path="/sede/editar/:id" element={<SedeForm />} />

        <Route path="/universidad" element={<UniversidadList />} />
        <Route path="/universidad/nuevo" element={<UniversidadForm />} />
        <Route path="/universidad/editar/:id" element={<UniversidadForm />} />

        <Route path="/segmento" element={<SegmentoList />} />
        <Route path="/segmento/nuevo" element={<SegmentoForm />} />
        <Route path="/segmento/editar/:id" element={<SegmentoForm />} />
      </Routes>
    </div>
  );
};
