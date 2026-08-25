import { JSX, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdjuntosPaginate } from "../../services/adjuntoService";
import { AdjuntoFilters, AdjuntoFiltersData } from "./AdjuntoFilters";
import { AdjuntoItem } from "./AdjuntoItem";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { Adjunto, PaginationType } from "@/interfaces/IAdjunto";
import { Programa } from "@/interfaces/IPrograma";
import {
  FileText,
  FileSpreadsheet,
  FileUp,
  Image,
  FileCode,
} from "lucide-react";

export const AdjuntoGrid = () => {
  const navigate = useNavigate();
  const [adjuntos, setAdjuntos] = useState<Adjunto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(8);

  const [paginationInfo, setPaginationInfo] = useState<
    Omit<PaginationType, "currentPage" | "limit">
  >({
    totalPages: 1,
    totalItems: 0,
    nextPage: null,
    previousPage: null,
  });

  const [searchFilters, setSearchFilters] = useState<AdjuntoFiltersData>({
    idTipoPrograma: "",
    fechaInicio: "",
    fechaFinal: "",
    search: "",
  });

  const handleShowDetail = (id: number) => {
    navigate(`/adjunto/editar/${id}`);
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= paginationInfo.totalPages) {
      setCurrentPage(page);
    }
  };

  const fetchData = useCallback(
    async (pageToFetch: number, filtersData: AdjuntoFiltersData) => {
      setIsLoading(true);

      const filters = {
        id_tipoprograma: filtersData.idTipoPrograma,
        search: filtersData.search,
        fecha_inicio: filtersData.fechaInicio,
        fecha_final: filtersData.fechaFinal,
      };

      try {
        const response = await getAdjuntosPaginate(pageToFetch, limit, filters);

        console.log("---- response paginate adjuntos ----");
        console.log({ response });

        const { result, data, pagination: newPagination } = response;

        if (result && data) {
          setAdjuntos(data as Adjunto[]);

          if (newPagination) {
            setPaginationInfo({
              totalPages: newPagination.totalPages || 1,
              totalItems: newPagination.totalItems || 0,
              nextPage: newPagination.nextPage,
              previousPage: newPagination.previousPage,
            });

            setTotalPages(newPagination.totalPages || 1);
          }
        } else {
          setAdjuntos([]);
        }
      } catch (error) {
        console.error("Error al obtener adjuntos", error);
      } finally {
        setIsLoading(false);
      }
    },
    [limit],
  );

  useEffect(() => {
    fetchData(currentPage, searchFilters);
  }, [currentPage, searchFilters, fetchData]);

  const handleSearchSubmit = (newFilters: AdjuntoFiltersData) => {
    setSearchFilters(newFilters);
    setCurrentPage(1); // Resetear a la primera página al filtrar
  };

  const getFileConfig = (mimetype: string, originalname: string) => {
    const ext = originalname.split(".").pop()?.toLowerCase() || "";

    if (mimetype.includes("pdf") || ext === "pdf") {
      return {
        icon: <FileText className="w-8 h-8 text-red-500" />,
        bg: "bg-red-50 border-red-100",
      };
    }
    if (
      mimetype.includes("excel") ||
      mimetype.includes("spreadsheet") ||
      ["xlsx", "xls", "csv"].includes(ext)
    ) {
      return {
        icon: <FileSpreadsheet className="w-8 h-8 text-emerald-600" />,
        bg: "bg-emerald-50 border-emerald-100",
      };
    }
    if (
      mimetype.includes("word") ||
      mimetype.includes("officedocument.wordprocessingml") ||
      ["docx", "doc"].includes(ext)
    ) {
      return {
        icon: <FileCode className="w-8 h-8 text-blue-500" />,
        bg: "bg-blue-50 border-blue-100",
      };
    }
    if (
      mimetype.includes("image") ||
      ["png", "jpg", "jpeg", "svg", "webp"].includes(ext)
    ) {
      return {
        icon: <Image className="w-8 h-8 text-purple-500" />,
        bg: "bg-purple-50 border-purple-100",
      };
    }
    return {
      icon: <FileUp className="w-8 h-8 text-slate-500" />,
      bg: "bg-slate-50 border-slate-100",
    };
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const renderPaginationItems = (): JSX.Element[] => {
    const items: JSX.Element[] = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(paginationInfo.totalPages, currentPage + 2);

    if (startPage > 1) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={i === currentPage}
            className={`${
              i === currentPage
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "hover:bg-gray-100 transition-colors cursor-pointer"
            }`}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    if (endPage < paginationInfo.totalPages) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }
    return items;
  };

  return (
    // Reducción del espacio vertical (space-y-6 a space-y-3) para alinearse con PersonaTable
    <div className="w-full space-y-3">
      <div className="bg-white overflow-hidden">
        <AdjuntoFilters onSearch={handleSearchSubmit} />

        {/* Contenedor de contenido principal con borde superior sutil idéntico al de la tabla */}
        <div className="pt-3 border-t border-slate-100">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-2">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600"></div>
              <span className="text-[11px] text-slate-400 font-medium">
                Cargando archivos...
              </span>
            </div>
          ) : adjuntos.length > 0 ? (
            // Grid optimizado con espaciado consistente y alineación limpia
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-start px-3">
              {adjuntos.map((adjunto) => (
                <AdjuntoItem key={adjunto.id} adjunto={adjunto} />
              ))}
            </div>
          ) : (
            // Estado vacío rediseñado con textos compactos y profesionales basados en PersonaTable
            <div className="flex flex-col items-center justify-center rounded-xl h-48 bg-slate-50/50 border border-dashed border-slate-200">
              <div className="text-center space-y-1 max-w-sm px-4">
                <span className="text-xs font-medium text-slate-600 block">
                  No se encontraron registros
                </span>
                <p className="text-[11px] text-slate-400">
                  Aún no hay archivos registrados en esta categoría o los
                  filtros aplicados no arrojaron resultados.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sección inferior de paginación integrada y limpia, calco exacto de PersonaTable */}
      <div className="flex items-center justify-between px-3 pb-3">
        <div className="text-[11px] text-slate-500 font-medium">
          Mostrando{" "}
          <span className="text-slate-800 font-semibold">
            {adjuntos.length}
          </span>{" "}
          registros de este grupo
        </div>

        <Pagination className="justify-end w-auto m-0">
          <PaginationContent className="gap-0.5">
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
                className={`h-7 px-2 text-xs rounded-md border border-slate-200 text-slate-600 cursor-pointer transition-colors hover:bg-slate-50 hover:text-slate-900 ${
                  currentPage === 1 ? "pointer-events-none opacity-30" : ""
                }`}
              />
            </PaginationItem>

            {renderPaginationItems()}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                className={`h-7 px-2 text-xs rounded-md border border-slate-200 text-slate-600 cursor-pointer transition-colors hover:bg-slate-50 hover:text-slate-900 ${
                  currentPage === paginationInfo.totalPages
                    ? "pointer-events-none opacity-30"
                    : ""
                }`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};
