import { useToast } from "../../context/ToastContext";
import React, { useEffect, useState } from "react";
import { Institucion } from "../../interfaces/IInstitucion";
import { Programa } from "../../interfaces/IPrograma";
import { Modulo } from "../../interfaces/IModulo";
import {
  DetalleParametro,
  DetalleParametroFilters,
} from "../../interfaces/IDetalleParametro";
import { getDetalles } from "../../services/detalleParametroService";
import { getInstituciones } from "../../services/institucionService";
import { ParametroClase } from "../../params/parametroClase";
import { getProgramas } from "@/services/programaService";
import { getModulosByPrograma } from "@/services/moduloService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Filter, RotateCcw, Search } from "lucide-react";

interface CertificadoFiltersProps {
  onSearch: (filters: CertificadoFiltersData) => void;
}

export interface CertificadoFiltersData {
  id_tipocertificado?: string;
  id_institucion?: string;
  id_programa?: string;
  id_modulo?: string;
  fechaInicio?: string;
  fechaFinal?: string;
  search?: string;
}

const loadTipoCertificados = async (): Promise<DetalleParametro[]> => {
  let tipoCertificados: DetalleParametro[] = [];

  // const filters: DetalleParametroFilters = {
  //   parametro_clase: ParametroClase.TIPO_CERTIFICADO,
  //   estado: true,
  // };

  const queryParams = `parametro_clase=${ParametroClase.TIPO_CERTIFICADO}&estado=true`;

  try {
    const response = await getDetalles(queryParams);
    const { result, data } = response;

    if (result && data) {
      tipoCertificados = data as DetalleParametro[];
    }

    return tipoCertificados;
  } catch (error) {
    console.error("Error al obtener tipos de certificados", error);
    return [];
  }
};

const loadInstituciones = async (): Promise<Institucion[]> => {
  let instituciones: Institucion[] = [];

  const queryParams = `is_cliente=true`;

  try {
    const response = await getInstituciones(queryParams);
    const { result, data } = response;

    if (result && data) {
      instituciones = data as Institucion[];
    }

    return instituciones;
  } catch (error) {
    console.error("Error al obtener instituciones", error);
    return [];
  }
};

const loadProgramas = async (): Promise<Programa[]> => {
  let programas: Programa[] = [];

  try {
    const response = await getProgramas();
    const { result, data } = response;

    if (result && data) {
      programas = data as Programa[];
    }

    return programas;
  } catch (error) {
    console.error("Error al obtener programas", error);
    return [];
  }
};

const loadModulos = async (idPrograma?: number): Promise<Modulo[]> => {
  if (!idPrograma) return [];
  let modulos: Modulo[] = [];

  try {
    const response = await getModulosByPrograma(idPrograma);
    const { result, data } = response;

    if (result && data) {
      modulos = data as Modulo[];
    }

    return modulos;
  } catch (error) {
    console.error("Error al obtener módulos", error);
    return [];
  }
};

const defaultValues: CertificadoFiltersData = {
  id_tipocertificado: "all",
  id_institucion: "all",
  id_programa: "all",
  id_modulo: "all",
  fechaInicio: "",
  fechaFinal: "",
  search: "",
};

export const CertificadoFilters: React.FC<CertificadoFiltersProps> = ({
  onSearch,
}) => {
  const { showToast } = useToast();

  const [tipoCertificados, setTipoCertificados] = useState<DetalleParametro[]>(
    [],
  );
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [isLoadingModulos, setIsLoadingModulos] = useState<boolean>(false);

  const [filters, setFilters] = useState<CertificadoFiltersData>(defaultValues);

  const handleSelectChange = (
    key: keyof CertificadoFiltersData,
    value: string,
  ) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };

      // Si se cambia el programa, reiniciamos el módulo a 'all' inmediatamente
      if (key === "id_programa") {
        newFilters.id_modulo = "all";
      }

      return newFilters;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanFilters: CertificadoFiltersData = {
      ...filters,
      id_tipocertificado:
        filters.id_tipocertificado === "all" ? "" : filters.id_tipocertificado,
      id_institucion:
        filters.id_institucion === "all" ? "" : filters.id_institucion,
      id_programa: filters.id_programa === "all" ? "" : filters.id_programa,
      id_modulo: filters.id_modulo === "all" ? "" : filters.id_modulo,
    };
    onSearch(cleanFilters);
  };

  const handleReset = () => {
    setFilters(defaultValues);
    setModulos([]);

    const cleanResetValues: CertificadoFiltersData = {
      id_tipocertificado: "",
      id_institucion: "",
      id_programa: "",
      id_modulo: "",
      fechaInicio: "",
      fechaFinal: "",
      search: "",
    };
    onSearch(cleanResetValues);
  };

  // Carga de catálogos iniciales
  useEffect(() => {
    const fetchdata = async () => {
      try {
        const [listTipoCertificados, listInstituciones, listProgramas] =
          await Promise.all([
            loadTipoCertificados(),
            loadInstituciones(),
            loadProgramas(),
          ]);

        setTipoCertificados(listTipoCertificados);
        setInstituciones(listInstituciones);
        setProgramas(listProgramas);
      } catch (error) {
        console.error("Error al obtener datos", error);
        showToast("error", "Error al cargar los datos del formulario.");
      }
    };

    fetchdata();
  }, [showToast]);

  // Carga reactiva de Módulos dependiente del id_programa seleccionado
  useEffect(() => {
    if (!filters.id_programa || filters.id_programa === "all") {
      setModulos([]);
      setFilters((prev) => ({ ...prev, id_modulo: "all" }));
      return;
    }

    const fetchModulos = async () => {
      setIsLoadingModulos(true);
      try {
        const dataModulos = await loadModulos(Number(filters.id_programa));
        setModulos(dataModulos);
      } catch (error) {
        console.error("Error cargando módulos", error);
        setModulos([]);
      } finally {
        setIsLoadingModulos(false);
      }
    };

    fetchModulos();
  }, [filters.id_programa]);

  const isModuloDisabled =
    filters.id_programa === "all" || !filters.id_programa || isLoadingModulos;

  return (
    <form
      onSubmit={handleSearch}
      className="p-4 bg-slate-50/50 border-b border-slate-200 w-full space-y-3"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-end">
        {/* Búsqueda general por texto */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-wider flex items-center gap-1">
            Búsqueda
          </label>
          <div className="relative">
            <input
              type="text"
              name="search"
              value={filters.search || ""}
              onChange={handleInputChange}
              placeholder="Nombre, DNI o código..."
              className="w-full h-9 px-3 py-1 bg-white border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Tipo Certificado */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-wider flex items-center gap-1">
            Tipo certificado
          </label>
          <Select
            value={filters.id_tipocertificado}
            onValueChange={(value) =>
              handleSelectChange("id_tipocertificado", value)
            }
          >
            <SelectTrigger className="bg-white border-slate-200 w-full h-9 text-xs">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {tipoCertificados.map((tipoCertificado) => (
                <SelectItem
                  key={tipoCertificado.codigo}
                  value={tipoCertificado.codigo.toString()}
                >
                  {tipoCertificado.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Institución */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-wider flex items-center gap-1">
            Institución
          </label>
          <Select
            value={filters.id_institucion}
            onValueChange={(value) =>
              handleSelectChange("id_institucion", value)
            }
          >
            <SelectTrigger className="bg-white border-slate-200 w-full h-9 text-xs">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {instituciones.map((institucion) => (
                <SelectItem
                  key={institucion.id}
                  value={institucion.id.toString()}
                >
                  {institucion.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Programa */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-wider flex items-center gap-1">
            Programa
          </label>
          <Select
            value={filters.id_programa}
            onValueChange={(value) => handleSelectChange("id_programa", value)}
          >
            <SelectTrigger className="bg-white border-slate-200 w-full h-9 text-xs">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {programas.map((programa) => (
                <SelectItem key={programa.id} value={programa.id.toString()}>
                  {programa.titulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Módulo (Dependiente) */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-wider flex items-center gap-1">
            Módulo
          </label>
          <Select
            value={filters.id_modulo}
            onValueChange={(value) => handleSelectChange("id_modulo", value)}
            disabled={isModuloDisabled}
          >
            <SelectTrigger className="bg-white border-slate-200 w-full h-9 text-xs disabled:bg-slate-100 disabled:opacity-60">
              <SelectValue
                placeholder={
                  isLoadingModulos
                    ? "Cargando..."
                    : filters.id_programa === "all"
                      ? "Elija programa"
                      : "Todos"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {modulos.length === 0
                  ? "Sin módulos disponibles"
                  : "Todos los módulos"}
              </SelectItem>
              {modulos.map((modulo) => (
                <SelectItem key={modulo.id} value={modulo.id.toString()}>
                  {modulo.titulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2 flex gap-2">
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm"
          >
            <Filter className="w-4 h-4" />
            Filtrar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="border-slate-200 text-slate-600 hover:bg-slate-100 shadow-sm px-3"
            title="Resetear filtros"
          >
            <RotateCcw className="w-4 h.4" />
          </Button>
        </div>
      </div>
    </form>
  );
};
