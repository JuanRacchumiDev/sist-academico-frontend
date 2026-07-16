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
  getCronogramaPagosByParams,
} from "../../services/matriculaService";
import { formatDate } from "../../utils/dateUtils";

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
    setIsDropdownOpen(false); // Cierra el menú

    showToast("info", "Preparando descarga del certificado...");

    try {
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

  const handleDownloadCronogramaPagos = async () => {
    setIsDropdownOpen(false); // Cierra el menú

    showToast("info", "Preparando descarga de cronograma de pagos...");

    try {
      const response = await getCronogramaPagosByParams(matricula.id!);

      if (response.result && response.data) {
        downloadFile(response.data as Blob, response.filename);
        showToast("success", "Cronograma de pagos descargado exitosamente");
      } else {
        showToast(
          "error",
          response.error || "Error al descargar el cronograma de pagos",
        );
      }
    } catch (error) {
      console.error("Error al descargar el cronograma de pagos:", error);
      showToast(
        "error",
        "Error de conexión al intentar descargar el cronograma de pagos.",
      );
    }
  };

  const handleFormPago = async () => {
    if (matricula.id) {
      const urlApi = `/matricula/${matricula.id}/pago-modulo`;
      console.log(urlApi);
      navigate(urlApi);
    } else {
      showToast("error", "La matrícula seleccionada no posee un ID válido");
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
        className="hover:bg-slate-50/80 hover:cursor-pointer transition-colors duration-150 border-b border-slate-100"
      >
        <TableCell className="py-2 px-3 text-xs font-medium text-slate-500">
          {matricula.persona.nombre_completo}
        </TableCell>
        <TableCell className="py-2 px-3 text-xs font-medium text-slate-700">
          {matricula.persona.numero_documento}
        </TableCell>
        <TableCell className="py-2 px-3 text-xs font-medium text-slate-700">
          {matricula.institucion.nombre}
        </TableCell>
        <TableCell className="py-2 px-3 text-xs font-medium text-slate-700">
          {formatDate(matricula.fecha_matricula)}
        </TableCell>
        <TableCell className="py-2 px-3 text-center">
          <div className="flex items-center justify-center">
            {matricula.estado ? (
              <CircleCheck className="text-emerald-500 w-4 h-4 stroke-[2.5]" />
            ) : (
              <CircleX className="text-rose-500 w-4 h-4 stroke-[2.5]" />
            )}
          </div>
        </TableCell>

        <TableCell className="py-2 px-3 text-right">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-7 w-7 p-0 focus-visible:ring-1 focus-visible:ring-slate-400 focus-visible:ring-offset-0"
              >
                <span className="sr-only">Abrir menú de acciones</span>
                <MoreHorizontal className="h-3.5 w-3.5 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="bg-white border border-slate-200 shadow-md min-w-[140px] text-xs p-1 rounded-md"
            >
              <DropdownMenuLabel className="font-medium text-slate-400 px-2 py-1 text-[10px] uppercase tracking-wider">
                Acciones
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100" />

              <DropdownMenuItem
                onClick={handleShowDetail}
                className="cursor-pointer hover:bg-slate-50 rounded-sm py-1 px-2 flex items-center gap-2 text-slate-700"
              >
                <Edit className="h-3.5 w-3.5 text-slate-400" />
                <span>Ver/Editar detalle</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100" />

              <DropdownMenuItem
                onClick={handleDownloadCronogramaPagos}
                className="cursor-pointer rounded-sm py-1 px-2 flex items-center gap-2 font-medium"
              >
                <FileDown className="h-3.5 w-3.5" />
                <span>Descargar Cronograma Pagos</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-100" />

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer text-amber-600">
                  <FileBadge className="h-3.5 w-3.5" />
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
                className={`cursor-pointer rounded-sm py-1 px-2 flex items-center gap-2 font-medium ${actionColor} ${hoverBgColor}`}
              >
                <ActionIcon className="h-3.5 w-3.5" />
                <span>{actionText} Matrícula</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-100" />

              <DropdownMenuItem
                onClick={handleFormPago}
                className="cursor-pointer rounded-sm py-1 px-2 flex items-center gap-2 font-medium"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Registrar pago módulo</span>
              </DropdownMenuItem>
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
