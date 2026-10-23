import { JSX, useCallback, useEffect, useState } from "react";
import { getPlantillasPaginate } from "../../services/plantillaService";
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
import { PlantillaRow } from "./PlantillaRow";
import { TableSpinner } from "../../components/Common/TableSpinner";
import { Plantilla, PaginationType } from "@/interfaces/IPlantilla";
import { ParametroClase } from "@/params/parametroClase";
import { PlantillaFilters, PlantillaFiltersData } from "./PlantillaFilters";
import { Institucion } from "@/interfaces/IInstitucion";
import { DetalleParametro } from "@/interfaces/IDetalleParametro";
import { getInstituciones } from "@/services/institucionService";
import { getDetalles } from "@/services/detalleParametroService";

const loadInstituciones = async () => {
  let listInstituciones: Institucion[] = [];

  const queryParams = "";
  const responseInstituciones = await getInstituciones(queryParams);

  const { result, data } = responseInstituciones;

  if (result && data) {
    listInstituciones = data as Institucion[];
  }

  return listInstituciones;
};

const loadTipoProgramas = async () => {
  let listTipoProgramas: DetalleParametro[] = [];

  const queryParams = `parametro_clase=${ParametroClase.TIPO_PROGRAMA}&en_persona=false&en_empresa=false&estado=true`;

  const responseTipoProgramas = await getDetalles(queryParams);

  const { result: resultTipoProgramas, data: dataTipoProgramas } =
    responseTipoProgramas;

  if (resultTipoProgramas && dataTipoProgramas) {
    listTipoProgramas = dataTipoProgramas as DetalleParametro[];
  }

  return listTipoProgramas;
};

export const PlantillaTable = () => {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [tipoProgramas, setTipoProgramas] = useState<DetalleParametro[]>([]);

  const [paginationInfo, setPaginationInfo] = useState<
    Omit<PaginationType, "currentPage" | "limit">
  >({
    totalPages: 1,
    totalItems: 0,
    nextPage: null,
    previousPage: null,
  });

  const [searchFilters, setSearchFilters] = useState<PlantillaFiltersData>({
    id_institucion: "",
    codigo_tipoprograma: "",
    nombre: "",
  });

  useEffect(() => {
    const loadCatalogos = async () => {
      const dataInstituciones = await loadInstituciones();
      const dataTipoProgramas = await loadTipoProgramas();
      setInstituciones(dataInstituciones);
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
    async (pageToFetch: number, filtersData: PlantillaFiltersData) => {
      setIsLoading(true);
      const filters = {
        id_institucion: filtersData.id_institucion,
        codigo_tipoprograma: filtersData.codigo_tipoprograma,
        nombre: filtersData.nombre,
      };

      try {
        const response = await getPlantillasPaginate(
          pageToFetch,
          limit,
          filters,
        );
        const { result, data, pagination: newPagination } = response;

        if (result && data) {
          setPlantillas(data as Plantilla[]);
          if (newPagination) {
            setPaginationInfo({
              totalPages: newPagination.totalPages || 1,
              totalItems: newPagination.totalItems || 0,
              nextPage: newPagination.nextPage,
              previousPage: newPagination.previousPage,
            });
          }
        } else {
          setPlantillas([]);
        }
      } catch (error) {
        console.error("Error al obtener plantillas", error);
      } finally {
        setIsLoading(false);
      }
    },
    [limit],
  );

  useEffect(() => {
    fetchData(currentPage, searchFilters);
  }, [currentPage, searchFilters, fetchData]);

  const handleSearchSubmit = (newFilters: PlantillaFiltersData) => {
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
            className={`h-7 w-7 text-xs rounded-md font-medium cursor-pointer ${
              i === currentPage
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "hover:bg-slate-100 text-slate-600 transition-colors"
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
    // Ajuste de separaciones internas y reducción de sombras duplicadas
    <div className="w-full space-y-3">
      <div className="bg-white overflow-hidden">
        <PlantillaFilters
          onSearch={handleSearchSubmit}
          instituciones={instituciones}
          tipoProgramas={tipoProgramas}
        />

        <div className="overflow-x-auto border-t border-slate-100">
          <Table className="w-full text-left border-collapse">
            <TableHeader>
              <TableRow className="bg-slate-50/75 hover:bg-slate-50/75 border-b border-slate-200">
                <TableHead className="w-[32%] py-2.5 px-3 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                  Institución
                </TableHead>
                <TableHead className="w-[15%] py-2.5 px-3 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                  Tipo programa
                </TableHead>
                <TableHead className="w-[15%] py-2.5 px-3 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                  Nombre
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
                <TableSpinner colSpan={5} />
              ) : plantillas.length > 0 ? (
                plantillas.map((plantilla) => (
                  <PlantillaRow key={plantilla.id} plantilla={plantilla} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-1">
                      <span className="text-xs font-medium text-slate-600">
                        No se encontraron registros
                      </span>
                      <p className="text-[11px]">
                        Intenta ajustar los filtros de búsqueda
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Sección inferior de paginación más integrada y limpia */}
      <div className="flex items-center justify-between px-3 pb-3">
        <div className="text-[11px] text-slate-500 font-medium">
          Mostrando{" "}
          <span className="text-slate-800 font-semibold">
            {plantillas.length}
          </span>{" "}
          de{" "}
          <span className="text-slate-800 font-semibold">
            {paginationInfo.totalItems}
          </span>{" "}
          registros
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
