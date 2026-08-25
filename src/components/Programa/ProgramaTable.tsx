import { JSX, useCallback, useEffect, useState } from "react";
import { getProgramasPaginate } from "../../services/programaService";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ProgramaRow } from "./ProgramaRow";
import { TableSpinner } from "../../components/Common/TableSpinner";
import { Programa, PaginationType } from "@/interfaces/IPrograma";
import { getDetalles } from "../../services/detalleParametroService";
import {
  DetalleParametro,
  DetalleParametroFilters,
} from "@/interfaces/IDetalleParametro";
import { ParametroClase } from "@/params/parametroClase";
import { ProgramaFilters, ProgramaFiltersData } from "./ProgramaFilters";
import { GraduationCap } from "lucide-react";

const loadSegmentos = async () => {
  let listSegmentos: DetalleParametro[] = [];
  // const filterSegmentos: DetalleParametroFilters = {
  //   parametro_clase: ParametroClase.SEGMENTO,
  //   en_persona: false,
  //   en_empresa: false,
  //   estado: true,
  // };

  const queryParams = `parametro_clase=${ParametroClase.SEGMENTO}&en_persona=false&en_empresa=false&estado=true`;

  const responseSegmentos = await getDetalles(queryParams);

  const { result: resultSegmentos, data: dataSegmentos } = responseSegmentos;

  if (resultSegmentos && dataSegmentos) {
    listSegmentos = dataSegmentos as DetalleParametro[];
  }

  return listSegmentos;
};

const loadTipoProgramas = async () => {
  let listTipoProgramas: DetalleParametro[] = [];

  // const filterTipoProgramas: DetalleParametroFilters = {
  //   parametro_clase: ParametroClase.TIPO_PROGRAMA,
  //   en_persona: false,
  //   en_empresa: false,
  //   estado: true,
  // };

  const queryParams = `parametro_clase=${ParametroClase.TIPO_PROGRAMA}&en_persona=false&en_empresa=false&estado=true`;

  const responseTipoProgramas = await getDetalles(queryParams);

  const { result: resultTipoProgramas, data: dataTipoProgramas } =
    responseTipoProgramas;

  if (resultTipoProgramas && dataTipoProgramas) {
    listTipoProgramas = dataTipoProgramas as DetalleParametro[];
  }

  return listTipoProgramas;
};

export const ProgramaTable = () => {
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [segmentos, setSegmentos] = useState<DetalleParametro[]>([]);
  const [tipoProgramas, setTipoProgramas] = useState<DetalleParametro[]>([]);

  const [paginationInfo, setPaginationInfo] = useState<
    Omit<PaginationType, "currentPage" | "limit">
  >({
    totalPages: 1,
    totalItems: 0,
    nextPage: null,
    previousPage: null,
  });

  const [searchFilters, setSearchFilters] = useState<ProgramaFiltersData>({
    titulo: "",
    id_segmento: "",
    id_tipoprograma: "",
  });

  useEffect(() => {
    const loadCatalogos = async () => {
      const dataSegmentos = await loadSegmentos();
      const dataTipoProgramas = await loadTipoProgramas();
      setSegmentos(dataSegmentos);
      setTipoProgramas(dataTipoProgramas);
    };
    loadCatalogos();
  }, []);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= paginationInfo.totalPages) {
      setCurrentPage(page);
    }
  };

  const fetchData = useCallback(
    async (pageToFetch: number, filtersData: ProgramaFiltersData) => {
      setIsLoading(true);
      const filters = {
        titulo: filtersData.titulo,
        id_segmento: filtersData.id_segmento,
        id_tipoprograma: filtersData.id_tipoprograma,
      };

      try {
        const response = await getProgramasPaginate(
          pageToFetch,
          limit,
          filters,
        );

        const { result, data, pagination: newPagination } = response;

        if (result && data) {
          setProgramas(data as Programa[]);
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
          setProgramas([]);
        }
      } catch (error) {
        console.error("Error al obtener programas", error);
      } finally {
        setIsLoading(false);
      }
    },
    [limit],
  );

  useEffect(() => {
    fetchData(currentPage, searchFilters);
  }, [currentPage, searchFilters, fetchData]);

  const handleSearchSubmit = (newFilters: ProgramaFiltersData) => {
    setSearchFilters(newFilters);
    setCurrentPage(1);
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
            className={`cursor-pointer transition-all rounded-md font-medium text-xs h-8 w-8 ${
              i === currentPage
                ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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

  const handleRefresh = useCallback(() => {
    fetchData(currentPage, searchFilters);
  }, [fetchData, currentPage, searchFilters]);

  return (
    <div className="w-full space-y-3">
      <div className="bg-white overflow-hidden">
        <ProgramaFilters
          onSearch={handleSearchSubmit}
          segmentos={segmentos}
          tipoProgramas={tipoProgramas}
        />

        <div className="overflow-x-auto border-t border-slate-100">
          <Table className="w-full text-left border-collapse">
            <TableHeader>
              <TableRow className="bg-slate-50/75 hover:bg-slate-50/75 border-b border-slate-200">
                <TableHead className="w-[12%] py-2.5 px-3 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                  Segmento
                </TableHead>
                <TableHead className="w-[12%] py-2.5 px-3 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                  Tipo Programa
                </TableHead>
                <TableHead className="w-[25%] py-2.5 px-3 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                  Nombre
                </TableHead>
                <TableHead className="w-[10%] py-2.5 px-3 text-slate-500 font-medium text-[11px] uppercase tracking-wider text-center">
                  Fec. Inicio
                </TableHead>
                <TableHead className="w-[10%] py-2.5 px-3 text-slate-500 font-medium text-[11px] uppercase tracking-wider text-center">
                  Fec. Final
                </TableHead>
                <TableHead className="w-[8%] py-2.5 px-3 text-slate-500 font-medium text-[11px] uppercase tracking-wider text-center">
                  Duración
                </TableHead>
                <TableHead className="w-[8%] py-2.5 px-3 text-slate-500 font-medium text-[11px] uppercase tracking-wider text-center">
                  Módulos
                </TableHead>
                <TableHead className="w-[7%] py-2.5 px-3 text-slate-500 font-medium text-[11px] uppercase tracking-wider text-center">
                  Estado
                </TableHead>
                <TableHead className="w-[8%] py-2.5 px-3 text-slate-500 font-medium text-[11px] uppercase tracking-wider text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSpinner colSpan={9} />
              ) : programas.length > 0 ? (
                programas.map((programa) => (
                  <ProgramaRow
                    key={programa.id}
                    programa={programa}
                    onRefresh={handleRefresh}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-1">
                      <div className="p-3 bg-slate-50 rounded-full border border-slate-100">
                        <GraduationCap className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-600">
                          No se encontraron registros
                        </span>
                        <p className="text-[11px]">
                          Intenta ajustar o limpiar los filtros de búsqueda
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Footer / Pagination Section */}
      <div className="flex items-center justify-between px-3 pb-3">
        <div className="text-[11px] text-slate-500 font-medium">
          Mostrando{" "}
          <span className="text-slate-800 font-semibold">
            {programas.length}
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
