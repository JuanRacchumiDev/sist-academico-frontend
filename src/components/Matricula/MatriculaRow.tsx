import { Matricula } from "../../interfaces/IMatricula";
import { TableCell, TableRow } from "../ui/table";
import {
  AlertTriangle,
  CircleCheck,
  CircleX,
  Edit,
  MoreHorizontal,
  ToggleLeft,
  ToggleRight,
  FileDown,
  FileBadge,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useToast } from "../../context/ToastContext";
import { useState } from "react";
import { ConfirmDialog } from "@/components/Common/ConfirmDialog";
import { downloadFile } from "../../utils/fileUtils";
import {
  getFichaById,
  getCertificadoByParams,
} from "../../services/matriculaService";

interface Props {
  matricula: Matricula;
  onStatusChange?: (matriculaId: number) => void;
}

export const MatriculaRow: React.FC<Props> = ({ matricula }) => {
  const { showToast } = useToast();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // ⬅️ Estado para el modal
  const [isProcessing, setIsProcessing] = useState(false); // ⬅️ Estado para el loading

  const navigate = useNavigate();

  const nuevoEstado = !matricula.estado;
  const action = nuevoEstado ? "activar" : "desactivar";
  const modalTitle = `${
    action.charAt(0).toUpperCase() + action.slice(1)
  } Matrícula`;
  const modalMessage = `¿Deseas <strong>${action}</strong> la matrícula: <strong>${matricula.persona.nombre_completo}</strong>?`;

  console.log({ matricula });

  const handleShowDetail = () => {
    navigate(`/matricula/editar/${matricula.id}`);
  };

  // Abre el modal
  const handleOpenStatusModal = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsDropdownOpen(false);
    setIsModalOpen(true);
  };

  // Cierra el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirmStatus = async () => {
    setIsProcessing(true);

    try {
      showToast("error", "Error de conexión al intentar actualizar.");
    } catch (error) {
      console.error("Error en la actualización de estado:", error);
      showToast("error", "Error de conexión al intentar actualizar.");
    } finally {
      setIsProcessing(false); // Desactiva el loading
      handleCloseModal(); // Cierra el modal
    }
  };

  const handleDownloadFicha = async () => {
    setIsDropdownOpen(false); // Cierra el menú

    // Puedes usar un estado de loading local si lo deseas, pero usaremos el toast para feedback
    showToast("info", "Preparando descarga de la ficha...");

    try {
      const response = await getFichaById(matricula.id!); // Asumo que matricula.id es seguro

      if (response.result && response.data) {
        // response.data es el Blob, response.filename es el nombre
        downloadFile(
          response.data as Blob,
          response.filename || `ficha_${matricula.id}.pdf`,
        );

        showToast("success", "Ficha de matrícula descargada exitosamente.");
      } else {
        showToast(
          "error",
          response.error ||
            response.message ||
            "No se pudo generar la ficha PDF.",
        );
      }
    } catch (error) {
      console.error("Error al descargar la ficha:", error);
      showToast("error", "Error de conexión al intentar descargar la ficha.");
    }
  };

  const handleDownloadCertificado = async (
    id_matricula: number,
    id_programa: number,
  ) => {
    try {
      setIsDropdownOpen(false); // Cierra el menú

      showToast("info", "Preparando descarga del certificado...");

      const response = await getCertificadoByParams(id_matricula, id_programa);

      if (response.result && response.data) {
        downloadFile(response.data, response.filename);
        showToast("success", "Certificado descargado exitosamente");
      } else {
        showToast(
          "error",
          response.error || "Error al descargar el certificado",
        );
      }
    } catch (error) {
      console.error("Error al descargar el certificado:", error);
      showToast(
        "error",
        "Error de conexión al intentar descargar el certificado.",
      );
    }
  };

  // Determinar texto y color de acción
  const actionText = matricula.estado ? "Desactivar" : "Activar";
  const ActionIcon = matricula.estado ? ToggleLeft : ToggleRight;
  const actionColor = matricula.estado ? "text-red-600" : "text-green-600";
  const hoverBgColor = matricula.estado
    ? "hover:bg-red-100"
    : "hover:bg-green-100";

  return (
    <>
      <TableRow
        key={matricula.id}
        className="hover:bg-blue-100 hover:cursor-pointer transition-colors duration-200"
      >
        <TableCell className="py-3">
          {matricula.persona.nombre_completo}
        </TableCell>
        <TableCell className="py-3">
          {matricula.persona.numero_documento}
        </TableCell>
        <TableCell className="py-3">{matricula.institucion.nombre}</TableCell>
        <TableCell className="py-3">{matricula.fecha_matricula}</TableCell>
        <TableCell className="py-3">
          {matricula.estado ? (
            <CircleCheck className="text-green-500 w-5 h-5" />
          ) : (
            <CircleX className="text-red-500 w-5 h-5" />
          )}
        </TableCell>
        <TableCell className="py-3">
          {/* w-72 border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 */}
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger
              asChild
              className="focus:outline-none focus:ring-2 z-40 focus:ring-gray-400 focus:border-transparent transition duration-300 cursor-pointer"
              // className="bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition duration-300 cursor-pointer"
            >
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú de acciones</span>
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="bg-white border shadow-lg"
            >
              <DropdownMenuLabel className="font-semibold text-gray-700">
                Acciones
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleShowDetail}
                className="cursor-pointer hover:bg-gray-100 transition-colors flex items-center space-x-2 text-blue-600"
              >
                <Edit className="h-4 w-4" />
                <span>Ver/Editar Detalle</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleDownloadFicha}
                className="cursor-pointer hover:bg-gray-100 transition-colors flex items-center space-x-2 text-indigo-600"
              >
                <FileDown className="h-4 w-4" />
                <span>Descargar Ficha PDF</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer text-amber-600">
                  <FileBadge className="h-4 w-4 mr-2" />
                  <span>Generar Certificado</span>
                </DropdownMenuSubTrigger>

                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-white border shadow-md w-64">
                    {matricula.detalles && matricula.detalles.length > 0 ? (
                      matricula.detalles.map((det) => {
                        // Log para depuración
                        console.log("Programa a certificar:", det.programa);

                        return (
                          <DropdownMenuItem
                            key={det.id} // Usamos el ID del detalle
                            onClick={() =>
                              handleDownloadCertificado(
                                matricula.id,
                                det.id_programa,
                              )
                            }
                            className="cursor-pointer hover:bg-amber-50"
                          >
                            <div className="flex flex-col">
                              <span className="text-xs font-medium">
                                {det.programa.titulo}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                Categoría: {det.programa.tipo_programa.nombre}
                              </span>
                            </div>
                          </DropdownMenuItem>
                        );
                      })
                    ) : (
                      <DropdownMenuItem disabled>
                        <span className="text-xs text-gray-400">
                          Sin programas registrados
                        </span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuItem
                onClick={handleOpenStatusModal}
                className={`cursor-pointer ${hoverBgColor} transition-colors flex items-center space-x-2 ${actionColor}`}
              >
                <ActionIcon className="h-4 w-4" />
                <span>{actionText} Matrícula</span>
              </DropdownMenuItem>

              {/* <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 transition-colors">
              Eliminar
            </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <ConfirmDialog
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmStatus}
        title={modalTitle}
        message={<span dangerouslySetInnerHTML={{ __html: modalMessage }} />}
        confirmText={actionText}
        isProcessing={isProcessing}
        icon={
          <AlertTriangle
            className={matricula.estado ? "text-red-500" : "text-green-500"}
          />
        }
      />
    </>
  );
};
