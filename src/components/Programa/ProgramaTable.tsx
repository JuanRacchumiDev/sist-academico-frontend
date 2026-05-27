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
import { getDetalleFiltered } from "../../services/detalleParametroService";
import {
  DetalleParametro,
  DetalleParametroFilters,
} from "@/interfaces/IDetalleParametro";
import { ParametroClase } from "@/params/parametroClase";
import { ProgramaFilters, ProgramaFiltersData } from "./ProgramaFilters";

const loadSegmentos = async () => {
  // Definiendo segmentos
  let listSegmentos: DetalleParametro[] = [];

  const filterSegmentos: DetalleParametroFilters = {
    parametro_clase: ParametroClase.SEGMENTO,
    en_persona: false,
    en_empresa: false,
    estado: true,
  };

  const responseSegmentos = await getDetalleFiltered(filterSegmentos);

  const { result: resultSegmentos, data: dataSegmentos } = responseSegmentos;

  if (resultSegmentos && dataSegmentos) {
    listSegmentos = dataSegmentos as DetalleParametro[];
  }

  return listSegmentos;
};

const loadTipoProgramas = async () => {
  // Definiendo segmentos
  let listTipoProgramas: DetalleParametro[] = [];

  const filterTipoProgramas: DetalleParametroFilters = {
    parametro_clase: ParametroClase.TIPO_PROGRAMA,
    en_persona: false,
    en_empresa: false,
    estado: true,
  };

  const responseTipoProgramas = await getDetalleFiltered(filterTipoProgramas);

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
    setCurrentPage(1); // Resetear a la primera página al filtrar
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
            className={`
              ${
                i === currentPage
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200 transition-colors"
              }
            `}
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
    <div className="w-full space-y-4 pt-2">
      <ProgramaFilters
        onSearch={handleSearchSubmit}
        segmentos={segmentos}
        tipoProgramas={tipoProgramas}
      />

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="w-[12%] py-4 px-4 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                Segmento
              </TableHead>
              <TableHead className="w-[12%] py-4 px-4 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                Tipo Programa
              </TableHead>
              <TableHead className="w-[25%] py-4 px-4 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                Nombre
              </TableHead>
              <TableHead className="w-[10%] py-4 px-2 text-slate-600 font-semibold text-xs uppercase tracking-wider text-center">
                Fec. Inicio
              </TableHead>
              <TableHead className="w-[10%] py-4 px-2 text-slate-600 font-semibold text-xs uppercase tracking-wider text-center">
                Fec. Final
              </TableHead>
              <TableHead className="w-[8%] py-4 px-2 text-slate-600 font-semibold text-xs uppercase tracking-wider text-center">
                Duración
              </TableHead>
              <TableHead className="w-[8%] py-4 px-2 text-slate-600 font-semibold text-xs uppercase tracking-wider text-center">
                Módulos
              </TableHead>
              <TableHead className="w-[7%] py-4 px-2 text-slate-600 font-semibold text-xs uppercase tracking-wider text-center">
                Estado
              </TableHead>
              <TableHead className="w-[8%] py-4 px-4 text-slate-600 font-semibold text-xs uppercase tracking-wider text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSpinner colSpan={9} />
            ) : programas.length > 0 ? (
              programas.map((programa) => (
                <ProgramaRow key={programa.id} programa={programa} />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                    <span className="text-sm font-medium">
                      No se encontraron registros
                    </span>
                    <p className="text-xs">
                      Intenta ajustar los filtros de búsqueda
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-2">
        <div className="text-xs text-slate-500 font-medium">
          Mostrando <span className="text-slate-900">{programas.length}</span>{" "}
          registros de este grupo
        </div>

        <Pagination className="justify-end">
          <PaginationContent className="gap-1">
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
                className={`
                  cursor-pointer border border-slate-200 text-slate-600 transition-all
                  hover:bg-slate-100 hover:text-slate-900
                  ${currentPage === 1 ? "pointer-events-none opacity-40" : ""}
                `}
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
