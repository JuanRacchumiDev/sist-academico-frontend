import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PagoForm } from "../PagoForm";
import { Matricula } from "../../../interfaces/IMatricula";
import { useToast } from "../../../context/ToastContext";
import { getMatriculaById } from "../../../services/matriculaService";

export const PagoFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [matricula, setMatricula] = useState<Matricula | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const isFirstLoad = useRef<boolean>(true);

  useEffect(() => {
    const fetchMatriculaData = async () => {
      if (!id) return;

      try {
        if (isFirstLoad.current) {
          setLoading(true);
        }

        const response = await getMatriculaById(+id);
        console.log({ response });

        const { result, data } = response;

        if (result && data) {
          setMatricula(data as Matricula);
        } else {
          showToast(
            "error",
            response.message ||
              "No se pudo cargar la información de la matrícula.",
          );
          navigate("/matriculas");
        }
      } catch (error) {
        console.error("Error al recuperar la matrícula:", error);
        showToast(
          "error",
          "Error de conexión al obtener datos del estudiante.",
        );
        navigate("/matriculas");
      } finally {
        setLoading(false);
        isFirstLoad.current = false;
      }
    };

    fetchMatriculaData();
  }, [id, navigate, showToast]);

  if (loading && isFirstLoad.current) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <span className="text-sm font-medium text-slate-600">
          Buscando datos de matrícula...
        </span>
      </div>
    );
  }

  if (!matricula) return null;

  return (
    <div className="container mx-auto py-8 px-4">
      <PagoForm
        matriculaSeleccionada={matricula}
        idInstitucion={matricula.id_institucion ?? 0}
        onCancel={() => navigate("/matricula")}
      />
    </div>
  );
};
