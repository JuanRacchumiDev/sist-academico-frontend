import { Programa } from "../../interfaces/IPrograma";
import { TableCell, TableRow } from "../ui/table";
import {
  AlertTriangle,
  CircleCheck,
  CircleX,
  Edit,
  MoreHorizontal,
  ToggleLeft,
  ToggleRight,
  Download,
  Layers,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useToast } from "../../context/ToastContext";
import { useState } from "react";
import { ConfirmDialog } from "@/components/Common/ConfirmDialog";
import { ModuloSheetForm } from "../Modulo/ModuloSheetForm";
import { downloadProgramaPlan } from "@/services/programaService";
import { formatDate } from "../../utils/dateUtils";

interface Props {
  programa: Programa;
  onStatusChange?: (programaId: number) => void;
}

export const ProgramaRow: React.FC<Props> = ({ programa }) => {
  console.log({ programa });

  const { showToast } = useToast();

  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // ⬅️ Estado para el modal
  const [isProcessing, setIsProcessing] = useState(false); // ⬅️ Estado para el loading
  const [isModuloSheetOpen, setIsModuloSheetOpen] = useState(false);

  const nuevoEstado = !programa.estado;
  const action = nuevoEstado ? "activar" : "desactivar";
  const modalTitle = `${
    action.charAt(0).toUpperCase() + action.slice(1)
  } Programa`;
  const modalMessage = `¿Deseas <strong>${action}</strong> el programa: <strong>${programa}</strong>?`;

  const handleShowDetail = () => {
    navigate(`/programa-academico/editar/${programa.id}`);
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

  const handleDownloadPlan = async (event: React.MouseEvent) => {
    event.preventDefault();
    setIsDropdownOpen(false);
    if (!programa.id) {
      showToast("error", "Programa no disponible para descargar");
      return;
    }

    showToast("info", "Iniciando descarga del plan de estudios");

    try {
      await downloadProgramaPlan(programa.id);
    } catch (error) {
      console.error("Error al iniciar la descarga:", error);
      showToast("error", "Error al descargar el archivo.");
    }
  };

  // Determinar texto y color de acción
  const actionText = programa.estado ? "Desactivar" : "Activar";
  const ActionIcon = programa.estado ? ToggleLeft : ToggleRight;
  const actionColor = programa.estado ? "text-red-600" : "text-green-600";
  const hoverBgColor = programa.estado
    ? "hover:bg-red-100"
    : "hover:bg-green-100";

  return (
    <>
      <TableRow
        key={programa.id}
        className="hover:bg-blue-50/50 hover:cursor-pointer transition-colors duration-200 border-b border-slate-100"
      >
        <TableCell className="py-3 px-4 text-xs font-medium text-slate-700 whitespace-normal wrap-break-words">
          {programa.segmento?.nombre ?? "--"}
        </TableCell>

        <TableCell className="py-3 px-4 text-xs text-slate-600 whitespace-normal wrap-break-words">
          {programa.tipo_programa?.nombre ?? "--"}
        </TableCell>
        <TableCell
          className="py-3 px-4 text-xs font-semibold text-slate-900 whitespace-normal wrap-break-words"
          title={programa.titulo}
        >
          {programa.titulo ?? "--"}
        </TableCell>

        <TableCell className="py-3 px-2 text-xs text-slate-600 text-center tabular-nums">
          {formatDate(programa.fecha_inicio)}
        </TableCell>

        <TableCell className="py-3 px-2 text-xs text-slate-600 text-center tabular-nums">
          {formatDate(programa.fecha_final)}
        </TableCell>
        <TableCell className="py-3 px-2 text-xs text-slate-600 text-center">
          {programa.duracion ?? "--"}
        </TableCell>

        <TableCell className="py-3 px-2 text-xs text-slate-600 text-center font-bold">
          {programa.numero_modulos ?? 0}
        </TableCell>
        <TableCell className="py-3 px-2">
          <div className="flex justify-center">
            {programa.estado ? (
              <CircleCheck className="text-green-500 w-4 h-4" />
            ) : (
              <CircleX className="text-red-400 w-4 h-4" />
            )}
          </div>
        </TableCell>
        <TableCell className="py-3 px-4 text-right">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger
              asChild
              className="focus:outline-none focus:ring-2 z-40 focus:ring-gray-400 focus:border-transparent transition duration-300 cursor-pointer"
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

              {programa.plan && (
                <DropdownMenuItem
                  onClick={handleDownloadPlan}
                  className="cursor-pointer hover:bg-gray-100 transition-colors flex items-center space-x-2 text-gray-700"
                >
                  <Download className="h-4 w-4 text-gray-500" />
                  <span>Descargar Plan</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleOpenStatusModal}
                className={`cursor-pointer ${hoverBgColor} transition-colors flex items-center space-x-2 ${actionColor}`}
              >
                <ActionIcon className="h-4 w-4" />
                <span>{actionText} Programa</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsModuloSheetOpen(true);
                }}
                className="cursor-pointer hover:bg-gray-100 transition-colors flex items-center space-x-2 text-indigo-600"
              >
                <Layers className="h-4 w-4" />
                <span>Configurar módulos</span>
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
            className={programa.estado ? "text-red-500" : "text-green-500"}
          />
        }
      />

      <ModuloSheetForm
        programa={programa}
        isOpen={isModuloSheetOpen}
        onClose={() => setIsModuloSheetOpen(false)}
      />
    </>
  );
};
