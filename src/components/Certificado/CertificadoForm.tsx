import React, { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  Certificado,
  CertificadoResponse,
} from "../../interfaces/ICertificado";

// Componentes UI de Shadcn
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

// Iconos Lucide
import {
  Award,
  Users,
  BookOpen,
  Layers,
  Building2,
  FileCheck,
  Type,
  ArrowLeft,
  Save,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "../ui/form";
import { RequiredLabel } from "../Common/RequiredLabel";
import SearchableCombobox from "../Common/SearchableCombobox";

// Interfaces
import {
  DetalleParametro,
  DetalleParametroFilters,
} from "../../interfaces/IDetalleParametro";
import { Institucion } from "../../interfaces/IInstitucion";
import { Persona } from "../../interfaces/IPersona";
import { Programa } from "../../interfaces/IPrograma";
import { Modulo } from "../../interfaces/IModulo";
import { Plantilla } from "../../interfaces/IPlantilla";

// Servicios
import { createCertificado } from "../../services/certificadoService";
import {
  getDetalles,
  getDetalleByParams,
} from "../../services/detalleParametroService";
import { getInstituciones } from "../../services/institucionService";
import { getPersonas } from "../../services/personaService";
import { getProgramas } from "../../services/programaService";
import { getModulosByPrograma } from "../../services/moduloService";
import { ParametroClase } from "../../params/parametroClase";
import z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Spinner } from "../Common/Spinner";

const loadGrupoPersonas = async (): Promise<DetalleParametro[]> => {
  let grupos: DetalleParametro[] = [];

  const queryParams = `parametro_clase=${ParametroClase.GRUPO}&estado=true`;

  try {
    const response = await getDetalles(queryParams);

    const { result, data } = response;

    if (result && data) {
      grupos = data as DetalleParametro[];
    }

    return grupos;
  } catch (error) {
    console.error("Error al obtener grupo de personas", error);
    return [];
  }
};

const loadPersonas = async (nombreGrupo?: string): Promise<Persona[]> => {
  if (!nombreGrupo) return [];

  let personas: Persona[] = [];

  try {
    const response = await getPersonas(nombreGrupo);

    const { result, data } = response;

    if (result && data) {
      personas = data as Persona[];
    }

    return personas;
  } catch (error) {
    console.error("Error al obtener personas", error);
    return [];
  }
};

const loadTipoProgramas = async (): Promise<DetalleParametro[]> => {
  let tipoProgramas: DetalleParametro[] = [];

  const queryParams = `parametro_clase=${ParametroClase.TIPO_PROGRAMA}&estado=true`;

  try {
    const response = await getDetalles(queryParams);

    const { result, data } = response;

    if (result && data) {
      tipoProgramas = data as DetalleParametro[];
    }

    return tipoProgramas;
  } catch (error) {
    console.error("Error al obtener tipo de programas", error);
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

const loadTipoCertificados = async (): Promise<DetalleParametro[]> => {
  let tipoCertificados: DetalleParametro[] = [];
  const queryParams = `parametro_clase=${ParametroClase.TIPO_CERTIFICADO}&estado=true`;

  try {
    const response = await getDetalles(queryParams);

    const { result, data } = response;

    if (result && data) {
      tipoCertificados = data as DetalleParametro[];
    }

    return tipoCertificados;
  } catch (error) {
    console.error("Error al obtener tipo de certificados", error);
    return [];
  }
};

const formSchema = z.object({
  idGrupoPersona: z
    .string({
      message: "El grupo es requerido",
    })
    .min(1, "El grupo es requerido"),
  idTipoCertificado: z
    .string({
      message: "El tipo de certificado es requerido",
    })
    .min(1, "El tipo de certificado es requerido"),
  idPersona: z
    .string({
      message: "La persona es requerida",
    })
    .min(1, "La persona es requerida"),
  idInstitucion: z
    .string({
      message: "La persona es requerida",
    })
    .min(1, "La persona es requerida"),
  idTipoPrograma: z
    .string({
      message: "El tpo de programa es requerido",
    })
    .min(1, "El tipo de programa es requerido"),
  idPrograma: z
    .string({
      message: "La persona es requerida",
    })
    .min(1, "La persona es requerida")
    .optional(),
  idModulo: z
    .string({
      message: "El módulo es requerido",
    })
    .nullable()
    .optional(),
  idPlantilla: z
    .string({
      message: "Seleccione una plantilla",
    })
    .min(1, "Seleccione una plantilla"),
  nombreImpresion: z
    .string({ message: "El nombre de impresión es requerido" })
    .min(1, "El nombre de impresión es requerido"),
});

type TFormValues = z.infer<typeof formSchema>;

const defaultValues = {
  idGrupoPersona: "",
  idTipoCertificado: "",
  idPersona: "",
  idInstitucion: "",
  idTipoPrograma: "",
  idPrograma: "",
  idModulo: "",
  idPlantilla: "",
  nombreImpresion: "",
};

export const CertificadoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  // Estados
  const [grupoPersonas, setGrupoPersonas] = useState<DetalleParametro[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [tipoProgramas, setTipoProgramas] = useState<DetalleParametro[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [tipoCertificados, setTipoCertificados] = useState<DetalleParametro[]>(
    [],
  );
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingPersonas, setIsLoadingPersonas] = useState(false);
  const [isLoadingProgramas, setIsLoadingProgramas] = useState(false);

  const isEditMode = !!id;

  const inputErrorClass = (invalid: boolean) =>
    invalid ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500";

  const handleGoBack = () => {
    const urlBack = `/programa-academico/`;
    navigate(urlBack);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Suscripción a cambios del grupo seleccionado
  const selectedGrupoId = useWatch({
    control: form.control,
    name: "idGrupoPersona",
  });

  // Suscripción a cambios del tipo de programas
  const selectedTipoProgramaId = useWatch({
    control: form.control,
    name: "idTipoPrograma",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);

      try {
        const [
          listGrupoPersonas,
          listTipoProgramas,
          listInstituciones,
          listTipoCertificados,
        ] = await Promise.all([
          loadGrupoPersonas(),
          loadTipoProgramas(),
          loadInstituciones(),
          loadTipoCertificados(),
        ]);

        setGrupoPersonas(listGrupoPersonas);
        setTipoProgramas(listTipoProgramas);
        setInstituciones(listInstituciones);
        setTipoCertificados(listTipoCertificados);
      } catch (error) {
        console.error("Error al obtener datos", error);
        showToast("error", "Error al cargar los datos del formulario.");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [id]);

  // Efecto reactivo: Carga programas según el tipo de programa
  useEffect(() => {
    const fetchProgramasByTipo = async () => {
      if (!selectedTipoProgramaId) {
        setProgramas([]);
        return;
      }

      console.log({ selectedTipoProgramaId });

      setIsLoadingPersonas(true);

      // Buscar el objeto del tipo de programa
      const selectTipoPrograma = tipoProgramas.find(
        (tipo) => tipo.codigo.toString() === selectedTipoProgramaId,
      );

      console.log({ selectTipoPrograma });

      if (selectTipoPrograma) {
        const { programas_por_tipo } = selectTipoPrograma;

        setProgramas(programas_por_tipo as Programa[]);
      } else {
        setProgramas([]);
      }

      setIsLoadingPersonas(false);
    };

    fetchProgramasByTipo();
  }, [selectedTipoProgramaId, tipoProgramas]);

  // Efecto reactivo: Carga personas dinámicamente según el grupo seleccionado
  useEffect(() => {
    const fetchPersonasByGrupo = async () => {
      if (!selectedGrupoId) {
        setPersonas([]);
        return;
      }

      // Buscar el objeto grupo correspondiente para obtener su nombre o parámetro necesario
      const selectGrupo = grupoPersonas.find(
        (grupo) => grupo.codigo.toString() === selectedGrupoId,
      );

      const nombreGrupo = selectGrupo.nombre_url || selectedGrupoId;
      console.log({ nombreGrupo });

      setIsLoadingPersonas(true);

      try {
        const listPersonas = await loadPersonas(nombreGrupo);
        setPersonas(listPersonas);
      } catch (error) {
        console.error("Error al cargar personas por grupo", error);
        showToast("error", "No se pudieron obtener las personas del grupo.");
      } finally {
        setIsLoadingPersonas(false);
      }
    };

    fetchPersonasByGrupo();
  }, [selectedGrupoId, grupoPersonas]);

  const resetForm = () => {
    form.reset(defaultValues);
    setPersonas([]);
  };

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: TFormValues) => {
    const payload: Certificado = {};

    try {
      // Llamada al servicio de backend
      const response = await createCertificado(payload);

      const { result, message } = response;

      if (result) {
        showToast(
          "success",
          message || "Certificado registrado correctamente.",
        );
        handleGoBack();
      } else {
        showToast("error", message || "Error al guardar el certificado.");
      }
    } catch (error) {
      console.error("Error guardando certificado:", error);
      showToast("error", "Error inesperado al guardar el certificado.");
    }
  };

  return (
    <>
      <Card className="shadow-xl border-none bg-white">
        <CardHeader className="border-b border-gray-100 p-6 flex flex-row items-center justify-between bg-gray-50/50 rounded-t-xl">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {isEditMode
                ? `Editar certificado`
                : `Nuevo Registro de certificado`}
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              {isEditMode
                ? `Actualización de información de certificado`
                : `Complete la información para registrar un certificado`}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </CardHeader>
        <CardContent className="px-6 sm:px-8 relative">
          {isLoadingData && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10">
              <Spinner className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 w-full">
                <FormField
                  control={form.control}
                  name="idGrupoPersona"
                  render={({ field, fieldState }) => (
                    <FormItem className="flex flex-col w-full">
                      <RequiredLabel>Grupo Persona</RequiredLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          // Limpiar el idPersona si cambia el grupo
                          form.setValue("idPersona", "");
                        }}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={`w-full ${inputErrorClass(fieldState.invalid)}`}
                          >
                            <SelectValue placeholder="Seleccionar..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-full">
                          {grupoPersonas.map((grupo) => (
                            <SelectItem
                              value={grupo.codigo!.toString()}
                              key={grupo.codigo}
                            >
                              {grupo.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="idPersona"
                  render={({ field, fieldState }) => (
                    <FormItem className="w-full">
                      <RequiredLabel>Alumno</RequiredLabel>
                      <SearchableCombobox<Persona>
                        placeholder={
                          !selectedGrupoId
                            ? "Primero seleccione un grupo"
                            : isLoadingPersonas
                              ? "Cargando personas..."
                              : "Buscar persona..."
                        }
                        options={personas}
                        value={field.value || ""}
                        onChange={field.onChange}
                        displayKey="nombre_completo"
                        valueKey="id"
                        searchKeys={["nombre_completo"]}
                        isInvalid={fieldState.invalid}
                        disabled={!selectedGrupoId || isLoadingPersonas}
                        renderOption={(persona) => (
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {persona.nombres} {persona.apellido_paterno}{" "}
                              {persona.apellido_materno}
                            </span>
                            {persona.numero_documento && (
                              <span className="text-xs text-gray-500">
                                Doc: {persona.numero_documento}
                              </span>
                            )}
                          </div>
                        )}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="idInstitucion"
                  render={({ field, fieldState }) => (
                    <FormItem className="flex flex-col w-full">
                      <RequiredLabel>Institución</RequiredLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={`w-full ${inputErrorClass(fieldState.invalid)}`}
                          >
                            <SelectValue placeholder="Seleccionar..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-full">
                          {instituciones.map((inst) => (
                            <SelectItem
                              value={inst.id!.toString()}
                              key={inst.id}
                            >
                              {inst.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="idTipoCertificado"
                  render={({ field, fieldState }) => (
                    <FormItem className="flex flex-col w-full">
                      <RequiredLabel>Tipo Certificado</RequiredLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={`w-full ${inputErrorClass(fieldState.invalid)}`}
                          >
                            <SelectValue placeholder="Seleccionar..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-full">
                          {tipoCertificados.map((tipo) => (
                            <SelectItem
                              value={tipo.codigo!.toString()}
                              key={tipo.codigo}
                            >
                              {tipo.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="idTipoPrograma"
                  render={({ field, fieldState }) => (
                    <FormItem className="flex flex-col w-full">
                      <RequiredLabel>Tipo Programa</RequiredLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          // Limpiar el idPersona si cambia el grupo
                          form.setValue("idPrograma", "");
                        }}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={`w-full ${inputErrorClass(fieldState.invalid)}`}
                          >
                            <SelectValue placeholder="Seleccionar..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-full">
                          {tipoProgramas.map((tipo) => (
                            <SelectItem
                              value={tipo.codigo!.toString()}
                              key={tipo.codigo}
                            >
                              {tipo.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="idPrograma"
                  render={({ field, fieldState }) => (
                    <FormItem className="w-full">
                      <RequiredLabel>Programa</RequiredLabel>
                      <SearchableCombobox<Programa>
                        placeholder={
                          !selectedGrupoId
                            ? "Primero seleccione un tipo de programa"
                            : isLoadingPersonas
                              ? "Cargando programas..."
                              : "Buscar programa..."
                        }
                        options={programas}
                        value={field.value || ""}
                        onChange={field.onChange}
                        displayKey="titulo"
                        valueKey="id"
                        searchKeys={["titulo"]}
                        isInvalid={fieldState.invalid}
                        disabled={!selectedTipoProgramaId || isLoadingProgramas}
                        renderOption={(programa) => (
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {programa.titulo}
                            </span>
                          </div>
                        )}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};
