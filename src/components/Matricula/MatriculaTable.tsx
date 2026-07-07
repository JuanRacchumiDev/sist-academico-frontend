import { JSX, useCallback, useEffect, useState } from "react";
import { getMatriculasPaginate } from "../../services/matriculaService";
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
import { MatriculaRow } from "./MatriculaRow";
import { TableSpinner } from "../../components/Common/TableSpinner";
import { Matricula, PaginationType } from "@/interfaces/IMatricula";
import { MatriculaFilters, MatriculaFiltersData } from "./MatriculaFilters";

export const MatriculaTable = () => {
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [paginationInfo, setPaginationInfo] = useState<
    Omit<PaginationType, "currentPage" | "limit">
  >({
    totalPages: 1,
    totalItems: 0,
    nextPage: null,
    previousPage: null,
  });

  const [searchFilters, setSearchFilters] = useState<MatriculaFiltersData>({
    fechaInicio: "",
    fechaFinal: "",
    nombreCompleto: "",
  });

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= paginationInfo.totalPages) {
      setCurrentPage(page);
    }
  };

  const fetchData = useCallback(
    async (pageToFetch: number, filtersData: MatriculaFiltersData) => {
      setIsLoading(true);

      const filters = {
        fechaInicio: filtersData.fechaInicio,
        fechaFinal: filtersData.fechaFinal,
        nombreCompleto: filtersData.nombreCompleto,
      };

      try {
        const response = await getMatriculasPaginate(
          currentPage,
          limit,
          filters,
        );

        const { result, data, pagination: newPagination } = response;

        if (result && data) {
          setMatriculas(data as Matricula[]);

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
          setMatriculas([]);
        }
      } catch (error) {
        console.error("Error al obtener matrículas", error);
      } finally {
        setIsLoading(false);
      }
    },
    [limit],
  );

  useEffect(() => {
    fetchData(currentPage, searchFilters);
  }, [currentPage, searchFilters, fetchData]);

  const handleSearchSubmit = (newFilters: MatriculaFiltersData) => {
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
      <MatriculaFilters onSearch={handleSearchSubmit}></MatriculaFilters>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="w-[12%] py-4 px-4 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                Alumno
              </TableHead>
              <TableHead className="w-[12%] py-4 px-4 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                N° Documento
              </TableHead>
              <TableHead className="w-[12%] py-4 px-4 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                Sede
              </TableHead>
              <TableHead className="w-[12%] py-4 px-4 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                Fecha
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
              <TableSpinner colSpan={6} />
            ) : matriculas.length > 0 ? (
              matriculas.map((matricula) => (
                <MatriculaRow key={matricula.id} matricula={matricula} />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
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
          Mostrando <span className="text-slate-900">{matriculas.length}</span>{" "}
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
