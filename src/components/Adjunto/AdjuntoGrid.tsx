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
  MoreVertical,
  Download,
  Eye,
  Trash2,
  Edit,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { getProgramas } from "@/services/programaService";

const loadProgramas = async () => {
  // Definiendo programas
  let listProgramas: Programa[] = [];

  const responseProgramas = await getProgramas();

  const { result: resultProgramas, data: dataProgramas } = responseProgramas;

  if (resultProgramas && dataProgramas) {
    listProgramas = dataProgramas as Programa[];
  }

  return listProgramas;
};

export const AdjuntoGrid = () => {
  const navigate = useNavigate();
  const [adjuntos, setAdjuntos] = useState<Adjunto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(8);
  const [programas, setProgramas] = useState<Programa[]>([]);

  const [paginationInfo, setPaginationInfo] = useState<
    Omit<PaginationType, "currentPage" | "limit">
  >({
    totalPages: 1,
    totalItems: 0,
    nextPage: null,
    previousPage: null,
  });

  const [searchFilters, setSearchFilters] = useState<AdjuntoFiltersData>({
    idPrograma: "",
    fechaInicio: "",
    fechaFinal: "",
  });

  useEffect(() => {
    const loadCatalogos = async () => {
      const dataProgramas = await loadProgramas();
      setProgramas(dataProgramas);
    };
    loadCatalogos();
  }, []);

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
        id_programa: filtersData.idPrograma,
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
    <div className="w-full space-y-6 pt-2">
      <AdjuntoFilters onSearch={handleSearchSubmit} programas={programas} />

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : adjuntos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 items-start">
          {adjuntos.map((adjunto) => (
            <AdjuntoItem key={adjunto.id} adjunto={adjunto} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl h-64 bg-slate-50/50">
          <div className="text-center space-y-2 max-w-sm px-4">
            <span className="text-base font-semibold text-slate-700 block">
              No se encontraron registros
            </span>
            <p className="text-xs text-slate-400">
              Aún no hay archivos registrados en esta categoría o los filtros
              aplicados no arrojaron resultados.
            </p>
          </div>
        </div>
      )}

      {/* Controles de Paginación */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 px-2">
        <div className="text-xs text-slate-500 font-medium order-2 sm:order-1">
          Mostrando{" "}
          <span className="text-slate-900 font-bold">{adjuntos.length}</span>{" "}
          registros de este bloque
        </div>

        <Pagination className="justify-end order-1 sm:order-2">
          <PaginationContent className="gap-1">
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
                className={`cursor-pointer border border-slate-200 text-slate-600 transition-all hover:bg-slate-100 ${
                  currentPage === 1 ? "pointer-events-none opacity-40" : ""
                }`}
              />
            </PaginationItem>

            {renderPaginationItems()}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                className={`
                  cursor-pointer border border-slate-200 text-slate-600 transition-all
                  hover:bg-slate-100 hover:text-slate-900
                  ${currentPage === totalPages ? "pointer-events-none opacity-40" : ""}
                `}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};
