import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useToast } from "../../context/ToastContext";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  createMatricula,
  getMatriculaById,
  updateMatricula,
} from "../../services/matriculaService"; // Se asumen métodos para el Modo Edición
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RequiredLabel } from "../Common/RequiredLabel";
import { Matricula, MatriculaResponse } from "../../interfaces/IMatricula";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  CreditCard,
  BookOpen,
  Info,
} from "lucide-react";
import { getDetalleFiltered } from "../../services/detalleParametroService";
import { getPersonas } from "../../services/personaService";
import { getProgramas } from "../../services/programaService";
import { getInstituciones } from "../../services/institucionService";
import {
  DetalleParametro,
  DetalleParametroFilters,
} from "../../interfaces/IDetalleParametro";
import { Persona } from "../../interfaces/IPersona";
import { Programa } from "../../interfaces/IPrograma";
import { Institucion } from "../../interfaces/IInstitucion";
import SearchableCombobox from "../../components/Common/SearchableCombobox";
import { ParametroClase } from "../../params/parametroClase";
import { VALOR_MATRICULA, VALOR_MODULO } from "@/params/constants";

// --- ESQUEMAS DE VALIDACIÓN (ZOD) ---
const ProgramaMatriculaSchema = z.object({
  idTipoPrograma: z
    .number({ message: "Debe seleccionar un tipo de programa" })
    .min(1, "Debe seleccionar un tipo de programa"),
  idPrograma: z
    .string({ message: "Debe seleccionar un programa" })
    .min(1, "Debe seleccionar un programa"),
});

export const formSchema = z
  .object({
    idPersona: z
      .string({ message: "Debe seleccionar un alumno" })
      .min(1, "Debe seleccionar un alumno"),
    idInstitucion: z
      .string({ message: "Seleccione una institución." })
      .min(1, "Seleccione una institución."),
    fechaMatricula: z
      .date({ message: "La fecha de matrícula es requerida" })
      .nullable()
      .refine((val) => val !== null, {
        message: "La fecha de matrícula es requerida",
      }),

    // Matrícula
    montoMatricula: z
      .number({ message: "Debe ser un número válido" })
      .min(0, "El monto no puede ser negativo"),
    idFormaPagoMatricula: z
      .string({ message: "Seleccione una forma de pago" })
      .min(1, "Seleccione una forma de pago"),
    numeroOperacionMatricula: z.string().catch(""),
    montoEfectivoMatricula: z.number().catch(0),
    montoOperacionMatricula: z.number().catch(0),

    // Módulo
    numeroModulos: z
      .number({ message: "Debe ser un número válido" })
      .min(0, "La cantidad no puede ser negativa"),
    montoModulo: z
      .number({ message: "Debe ser un número válido" })
      .min(0, "El monto no puede ser negativo"),
    idFormaPagoModulo: z
      .string({ message: "Seleccione una forma de pago" })
      .min(1, "Seleccione una forma de pago"),
    numeroOperacionModulo: z.string().catch(""),
    montoEfectivoModulo: z.number().catch(0),
    montoOperacionModulo: z.number().catch(0),

    programas: z
      .array(ProgramaMatriculaSchema)
      .min(1, "Debe agregar al menos un programa"),
  })
  .superRefine((data, ctx) => {
    // Validaciones condicionales para MATRÍCULA
    const formaPagoMat = data.idFormaPagoMatricula.toUpperCase();

    if (formaPagoMat.includes("EFECTIVO")) {
      if (data.montoEfectivoMatricula <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingrese el monto en efectivo",
          path: ["montoEfectivoMatricula"],
        });
      }
    } else if (
      formaPagoMat.includes("TRANSFERENCIA") ||
      formaPagoMat.includes("YAPE") ||
      formaPagoMat.includes("PLIN")
    ) {
      if (data.montoOperacionMatricula <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingrese el monto de la operación",
          path: ["montoOperacionMatricula"],
        });
      }
      if (!data.numeroOperacionMatricula.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El número de operación es requerido",
          path: ["numOperacionMatricula"],
        });
      }
    } else if (formaPagoMat.includes("MIXTO")) {
      if (data.montoEfectivoMatricula <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingrese el monto en efectivo",
          path: ["montoEfectivoMatricula"],
        });
      }
      if (data.montoOperacionMatricula <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingrese el monto de operación",
          path: ["montoOperacionMatricula"],
        });
      }
      if (!data.numeroOperacionMatricula.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El número de operación es requerido",
          path: ["numOperacionMatricula"],
        });
      }
    }

    // Validaciones condicionales para MÓDULO
    const formaPagoMod = data.idFormaPagoModulo.toUpperCase();
    if (formaPagoMod.includes("EFECTIVO")) {
      if (data.montoEfectivoModulo <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingrese el monto en efectivo",
          path: ["montoEfectivoModulo"],
        });
      }
    } else if (
      formaPagoMod.includes("TRANSFERENCIA") ||
      formaPagoMod.includes("YAPE") ||
      formaPagoMod.includes("PLIN")
    ) {
      if (data.montoOperacionModulo <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingrese el monto de la operación",
          path: ["montoOperacionModulo"],
        });
      }
      if (!data.numeroOperacionModulo.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El número de operación es requerido",
          path: ["numOperacionModulo"],
        });
      }
    } else if (formaPagoMod.includes("MIXTO")) {
      if (data.montoEfectivoModulo <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingrese el monto en efectivo",
          path: ["montoEfectivoModulo"],
        });
      }
      if (data.montoOperacionModulo <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingrese el monto de operación",
          path: ["montoOperacionModulo"],
        });
      }
      if (!data.numeroOperacionModulo.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El número de operación es requerido",
          path: ["numOperacionModulo"],
        });
      }
    }

    const sumaMontosMatricula =
      (data.montoEfectivoMatricula || 0) + (data.montoOperacionMatricula || 0);
    if (sumaMontosMatricula > VALOR_MATRICULA) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `La suma de los montos no puede exceder el valor de la matrícula (S/. ${VALOR_MATRICULA})`,
        path: ["montoEfectivoMatricula"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `La suma de los montos no puede exceder el valor de la matrícula (S/. ${VALOR_MATRICULA})`,
        path: ["montoOperacionMatricula"],
      });
    }
  });

// --- FUNCIONES DE CARGA DE DATOS (MOCKED/API REST) ---
const loadAlumnos = async () => {
  const response = await getPersonas("grupo-alumno");
  return response.result && response.data ? (response.data as Persona[]) : [];
};

const loadInstituciones = async () => {
  const response = await getInstituciones();
  return response.result && response.data
    ? (response.data as Institucion[])
    : [];
};

const loadTipoProgramas = async () => {
  const filters: DetalleParametroFilters = {
    parametro_clase: ParametroClase.TIPO_PROGRAMA,
    en_persona: false,
    en_empresa: false,
    estado: true,
  };
  const response = await getDetalleFiltered(filters);
  return response.result && response.data
    ? (response.data as DetalleParametro[])
    : [];
};

const loadFormasPago = async () => {
  const filters: DetalleParametroFilters = {
    parametro_clase: ParametroClase.FORMA_PAGO,
    en_persona: false,
    en_empresa: false,
    estado: true,
  };
  const response = await getDetalleFiltered(filters);
  return response.result && response.data
    ? (response.data as DetalleParametro[])
    : [];
};

const loadProgramas = async () => {
  const response = await getProgramas();
  return response.result && response.data ? (response.data as Programa[]) : [];
};

type TFormValues = z.infer<typeof formSchema>;

const today = new Date();
const minDateString = format(today, "yyyy-MM-dd");

// --- COMPONENTE PRINCIPAL ---
export const MatriculaForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const [alumnos, setAlumnos] = useState<Persona[]>([]);
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [tipoProgramas, setTipoProgramas] = useState<DetalleParametro[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [formasPago, setFormasPago] = useState<DetalleParametro[]>([]);

  const isEditMode = !!id;

  const inputErrorClass = (invalid: boolean) =>
    invalid
      ? "border-red-500 focus:ring-red-500 focus-visible:ring-red-500"
      : "focus:ring-blue-500";

  const handleGoBack = () => {
    navigate("/matricula");
  };

  const form = useForm<TFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idPersona: "",
      idInstitucion: "",
      fechaMatricula: today,

      montoMatricula: 0,
      idFormaPagoMatricula: "",
      numeroOperacionMatricula: "",
      montoEfectivoMatricula: 0,
      montoOperacionMatricula: 0,

      numeroModulos: 0,
      montoModulo: 0,
      idFormaPagoModulo: "",
      numeroOperacionModulo: "",
      montoEfectivoModulo: 0,
      montoOperacionModulo: 0,

      programas: [{ idTipoPrograma: 0, idPrograma: "" }],
    },
  });

  const { isSubmitting } = form.formState;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "programas",
  });

  // Observadores dinámicos para renderizado condicional de pasarelas de pago
  const watchPagoMatricula = form.watch("idFormaPagoMatricula").toUpperCase();
  const watchPagoModulo = form.watch("idFormaPagoModulo").toUpperCase();

  const handleAddPrograma = () => {
    append({ idTipoPrograma: undefined as any, idPrograma: "" });
  };

  const getProgramasFiltrados = (selectedTipoId: number | null): Programa[] => {
    if (!selectedTipoId) return [];
    return programas.filter(
      (p) =>
        p.id_tipoprograma !== null && +p.id_tipoprograma! === selectedTipoId,
    );
  };

  // Carga de catálogos y datos de edición en un solo flujo maestro
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          listAlumnos,
          listInstituciones,
          listTipoProgramas,
          listProgramas,
          listFormasPago,
        ] = await Promise.all([
          loadAlumnos(),
          loadInstituciones(),
          loadTipoProgramas(),
          loadProgramas(),
          loadFormasPago(),
        ]);

        setAlumnos(listAlumnos);
        setInstituciones(listInstituciones);
        setTipoProgramas(listTipoProgramas);
        setProgramas(listProgramas);
        setFormasPago(listFormasPago);

        // Si estamos en modo edición, recuperamos la matrícula por ID
        if (isEditMode && id) {
          const res = await getMatriculaById(+id);
          if (res.result && res.data) {
            const mat = res.data as Matricula;

            form.reset({
              idPersona: mat.id_persona.toString() ?? "",
              idInstitucion: mat.id_institucion.toString() ?? "",
              fechaMatricula: mat.fecha_matricula
                ? parseISO(mat.fecha_matricula)
                : null,

              montoMatricula: mat.monto_matricula || 0,
              idFormaPagoMatricula: mat.id_formapago_matricula.toString() ?? "",
              numeroOperacionMatricula: mat.numero_operacion_matricula || "",
              montoEfectivoMatricula: mat.monto_efectivo_matricula || 0,
              montoOperacionMatricula: mat.monto_operacion_matricula || 0,

              numeroModulos: mat.numero_modulos || 0,
              montoModulo: mat.monto_modulo || 0,
              idFormaPagoModulo: mat.id_formapago_modulo.toString() ?? "",
              numeroOperacionModulo: mat.numero_operacion_modulo || "",
              montoEfectivoModulo: mat.monto_efectivo_modulo || 0,
              montoOperacionModulo: mat.monto_operacion_modulo || 0,

              // Asumiendo que tu backend retorna los programas con sus respectivos tipos en la relación
              programas: mat.programas
                ? mat.programas.map((p: any) => ({
                    idTipoPrograma: Number(p.id_tipoprograma),
                    idPrograma: p.id_programa.toString(),
                  }))
                : [{ idTipoPrograma: 0, idPrograma: "" }],
            });
          }
        }
      } catch (error) {
        console.error("Error al cargar los catálogos formulario", error);
        showToast("error", "Error al cargar los catálogos del formulario.");
      }
    };

    fetchData();
  }, [id, isEditMode, form]);

  // Sincronizar automáticamente el "Monto Total" en base al desglose ingresado
  const efectivoMat = form.watch("montoEfectivoMatricula");
  const operacionMat = form.watch("montoOperacionMatricula");

  useEffect(() => {
    if (watchPagoMatricula.includes("MIXTO")) {
      form.setValue("montoMatricula", (efectivoMat || 0) + (operacionMat || 0));
    } else if (watchPagoMatricula.includes("EFECTIVO")) {
      form.setValue("montoMatricula", efectivoMat || 0);
    } else {
      form.setValue("montoMatricula", operacionMat || 0);
    }
  }, [efectivoMat, operacionMat, watchPagoMatricula]);

  const efectivoMod = form.watch("montoEfectivoModulo");
  const operacionMod = form.watch("montoOperacionModulo");

  useEffect(() => {
    if (watchPagoModulo.includes("MIXTO")) {
      form.setValue("montoModulo", (efectivoMod || 0) + (operacionMod || 0));
    } else if (watchPagoModulo.includes("EFECTIVO")) {
      form.setValue("montoModulo", efectivoMod || 0);
    } else {
      form.setValue("montoModulo", operacionMod || 0);
    }
  }, [efectivoMod, operacionMod, watchPagoModulo]);

  const onSubmit = async (values: TFormValues) => {
    try {
      const totalIngresado =
        (values.montoOperacionMatricula || 0) +
        (values.montoOperacionMatricula || 0);
      if (totalIngresado > VALOR_MATRICULA) {
        showToast(
          "warning",
          `El monto total ingresado (S/. ${totalIngresado.toFixed(2)}) excede el costo de la matrícula (S/. ${VALOR_MATRICULA}). Por favor, verifique.`,
        );
        return;
      }

      const programasIds: number[] = values.programas
        .filter((p) => p.idPrograma !== "")
        .map((p) => +p.idPrograma);

      if (programasIds.length === 0) {
        showToast("error", "Debe agregar al menos un programa válido");
        return;
      }

      const targetFormaPagoMat = formasPago.find(
        (f) =>
          f.nombre.toUpperCase() === values.idFormaPagoMatricula.toUpperCase(),
      );
      const targetFormaPagoMod = formasPago.find(
        (f) =>
          f.nombre.toUpperCase() === values.idFormaPagoModulo.toUpperCase(),
      );

      const fechaMatriculaStr = values.fechaMatricula
        ? format(values.fechaMatricula, "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd");

      let payload: Matricula = {
        id_persona: +values.idPersona,
        id_institucion: +values.idInstitucion,
        fecha_matricula: fechaMatriculaStr,
        id_estadomatricula: 34, // Estado matriculado por defecto
        programas: programasIds,

        // Asignación estructurada Matrícula
        monto_matricula: values.montoMatricula,
        id_formapago_matricula: targetFormaPagoMat
          ? targetFormaPagoMat.codigo
          : 0,
        numero_operacion_matricula:
          values.numeroOperacionMatricula || undefined,
        monto_efectivo_matricula: values.montoEfectivoMatricula || undefined,
        monto_operacion_matricula: values.montoOperacionMatricula || undefined,

        // Asignación estructurada Módulo
        numero_modulos: values.numeroModulos,
        monto_modulo: values.montoModulo,
        id_formapago_modulo: targetFormaPagoMod ? targetFormaPagoMod.codigo : 0,
        numero_operacion_modulo: values.numeroOperacionModulo || undefined,
        monto_efectivo_modulo: values.montoEfectivoModulo || undefined,
        monto_operacion_modulo: values.montoOperacionModulo || undefined,

        estado: true,
      };

      console.log({ payload });

      const response = isEditMode
        ? await updateMatricula(+id!, payload)
        : await createMatricula(payload);

      const { result, message } = response as MatriculaResponse;

      if (result) {
        showToast(
          "success",
          message ||
            `Matrícula ${isEditMode ? "actualizada" : "registrada"} con éxito`,
        );
        navigate("/matricula");
      } else {
        showToast("error", message || "Error al procesar la matrícula");
      }
    } catch (error) {
      console.error("Error en submit de matrícula", error);
      showToast(
        "error",
        "Ocurrió un error inesperado al procesar el formulario.",
      );
    }
  };

  return (
    <Card className="shadow-xl border-none bg-white w-full">
      <CardHeader className="border-b border-gray-100 p-6 flex flex-row items-center justify-between bg-gray-50/50 rounded-t-xl">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-extrabold text-slate-800 tracking-tight">
            {isEditMode ? "Editar Matrícula" : "Nuevo Registro de Matrícula"}
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            {isEditMode
              ? "Actualización de la información general de la matrícula"
              : "Complete la información para registrar una matrícula"}
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

      <CardContent className="px-8 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* SECCIÓN 01: INFORMACIÓN DE REGISTRO */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">
                  01
                </span>
                <h3 className="text-lg font-semibold text-slate-800">
                  Información de registro
                </h3>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 w-full">
                {/* Alumno */}
                <FormField
                  control={form.control}
                  name="idPersona"
                  render={({ field, fieldState }) => (
                    <FormItem className="w-full">
                      <RequiredLabel>Alumno</RequiredLabel>
                      <SearchableCombobox<Persona>
                        placeholder="Buscar un alumno"
                        options={alumnos}
                        value={field.value}
                        onChange={field.onChange}
                        displayKey="nombre_completo"
                        valueKey="id"
                        searchKeys={["nombre_completo"]}
                        isInvalid={fieldState.invalid}
                        renderOption={(alumno) => (
                          <span className="font-semibold text-gray-900">
                            {alumno.nombre_completo}
                          </span>
                        )}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Institución */}
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

                {/* Fecha Matrícula */}
                <FormField
                  control={form.control}
                  name="fechaMatricula"
                  render={({ field, fieldState }) => (
                    <FormItem className="w-full">
                      <RequiredLabel>Fecha Matrícula</RequiredLabel>
                      <Input
                        type="date"
                        min={minDateString}
                        value={
                          field.value ? format(field.value, "yyyy-MM-dd") : ""
                        }
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseISO(e.target.value) : null,
                          )
                        }
                        className={inputErrorClass(fieldState.invalid)}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* SECCIÓN 02: SELECCIÓN DE PROGRAMAS */}
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">
                    02
                  </span>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Programas de Matrícula
                  </h3>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>
                <Button
                  type="button"
                  onClick={handleAddPrograma}
                  className="bg-blue-600 hover:bg-blue-700 h-9"
                  disabled={isSubmitting}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Agregar Programa
                </Button>
              </div>

              <div className="space-y-4 w-full">
                {fields.map((fieldItem, index) => {
                  const selectedTipoId = form.watch(
                    `programas.${index}.idTipoPrograma`,
                  );
                  const programasFiltrados =
                    getProgramasFiltrados(selectedTipoId);

                  return (
                    <div
                      key={fieldItem.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 border border-gray-100 bg-gray-50/50 rounded-xl w-full"
                    >
                      {/* Tipo Programa */}
                      <div className="md:col-span-4 w-full">
                        <FormField
                          control={form.control}
                          name={`programas.${index}.idTipoPrograma`}
                          render={({ field: tipoField, fieldState }) => (
                            <FormItem className="w-full">
                              <FormLabel className="text-slate-600">
                                Tipo de Programa
                              </FormLabel>
                              <Select
                                onValueChange={(val) => {
                                  tipoField.onChange(parseInt(val, 10));
                                  form.setValue(
                                    `programas.${index}.idPrograma`,
                                    "",
                                  ); // Resetea programa al cambiar tipo
                                }}
                                value={
                                  tipoField.value && tipoField.value !== 0
                                    ? tipoField.value.toString()
                                    : ""
                                }
                              >
                                <FormControl>
                                  <SelectTrigger
                                    className={`w-full ${inputErrorClass(fieldState.invalid)}`}
                                  >
                                    <SelectValue placeholder="Seleccionar tipo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {tipoProgramas.map((tipo) => (
                                    <SelectItem
                                      value={tipo.codigo.toString()}
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
                      </div>

                      {/* Programa Combo */}
                      <div className="md:col-span-7 w-full">
                        <FormField
                          control={form.control}
                          name={`programas.${index}.idPrograma`}
                          render={({ field: programaField, fieldState }) => (
                            <FormItem className="w-full">
                              <FormLabel className="text-slate-600">
                                Programa específico
                              </FormLabel>
                              <SearchableCombobox<Programa>
                                placeholder={
                                  selectedTipoId
                                    ? "Buscar un programa..."
                                    : "Seleccione tipo"
                                }
                                options={programasFiltrados}
                                value={programaField.value}
                                onChange={programaField.onChange}
                                displayKey="titulo"
                                valueKey="id"
                                searchKeys={["titulo"]}
                                isInvalid={fieldState.invalid}
                                disabled={
                                  !selectedTipoId ||
                                  programasFiltrados.length === 0
                                }
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Botón Eliminar */}
                      <div className="md:col-span-1 flex justify-end">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => remove(index)}
                            className="text-red-500 hover:bg-red-50"
                            disabled={isSubmitting}
                            aria-label={`Eliminar fila ${index + 1}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECCIÓN 03: DETALLE DE LOS PAGOS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
              {/* BLOQUE A: PAGO DE MATRÍCULA */}
              <div className="p-6 border border-slate-100 bg-slate-50/40 rounded-2xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between text-blue-700 font-bold border-b border-blue-100 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    <h4>Pago de Matrícula</h4>
                  </div>
                  {/* Label del costo referencial traído de BD */}
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center gap-1 font-medium">
                    <Info className="h-3 w-3" /> Costo Base: S/.{" "}
                    {VALOR_MATRICULA}
                  </span>
                </div>

                <FormField
                  control={form.control}
                  name="idFormaPagoMatricula"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <RequiredLabel>Forma de Pago</RequiredLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar método..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Renderiza dinámicamente incluyendo Yape/Plin/Efectivo/Transferencia/Mixto desde BD */}
                          {formasPago.map((f) => (
                            <SelectItem key={f.codigo} value={f.nombre}>
                              {f.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* RENDERIZADO CONDICIONAL DE CAMPOS EN BASE A LA SELECCIÓN */}
                {(watchPagoMatricula.includes("EFECTIVO") ||
                  watchPagoMatricula.includes("MIXTO")) && (
                  <FormField
                    control={form.control}
                    name="montoEfectivoMatricula"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Monto en Efectivo (S/.)</RequiredLabel>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                          className={inputErrorClass(fieldState.invalid)}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {(watchPagoMatricula.includes("TRANSFERENCIA") ||
                  watchPagoMatricula.includes("YAPE") ||
                  watchPagoMatricula.includes("PLIN") ||
                  watchPagoMatricula.includes("MIXTO")) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-slate-100/50 rounded-xl border border-slate-200/50">
                    <FormField
                      control={form.control}
                      name="montoOperacionMatricula"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <RequiredLabel>Monto Digital/Banco</RequiredLabel>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                            className={inputErrorClass(fieldState.invalid)}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="numeroOperacionMatricula"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <RequiredLabel>N° Operación</RequiredLabel>
                          <Input
                            placeholder="Código de transacción"
                            {...field}
                            className={inputErrorClass(fieldState.invalid)}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Mostrar siempre el total de la matrícula calculado */}
                <div className="pt-2 flex justify-between items-center text-sm font-semibold text-slate-700">
                  <span>Total Cobrado Matrícula:</span>
                  <span className="text-base text-slate-900 font-bold">
                    S/. {form.watch("montoMatricula").toFixed(2)}
                  </span>
                </div>
              </div>

              {/* BLOQUE B: PAGO DE MÓDULO */}
              <div className="p-6 border border-slate-100 bg-slate-50/40 rounded-2xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between text-emerald-700 font-bold border-b border-emerald-100 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    <h4>Pago de Módulos</h4>
                  </div>
                  {/* Label del costo referencial traído de BD */}
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md flex items-center gap-1 font-medium">
                    <Info className="h-3 w-3" /> Costo Base Módulo: S/.{" "}
                    {VALOR_MODULO}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="numeroModulos"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>N° Módulos</FormLabel>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value, 10) || 0)
                          }
                          className={inputErrorClass(fieldState.invalid)}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col justify-end pb-2">
                    <span className="text-xs text-slate-500 font-medium">
                      Monto Esperado Calculado:
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      S/.{" "}
                      {(form.watch("numeroModulos") * VALOR_MODULO).toFixed(2)}
                    </span>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="idFormaPagoModulo"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <RequiredLabel>Forma de Pago</RequiredLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar método..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {formasPago.map((f) => (
                            <SelectItem key={f.codigo} value={f.nombre}>
                              {f.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* RENDERIZADO CONDICIONAL DE CAMPOS EN BASE A LA SELECCIÓN */}
                {(watchPagoModulo.includes("EFECTIVO") ||
                  watchPagoModulo.includes("MIXTO")) && (
                  <FormField
                    control={form.control}
                    name="montoEfectivoModulo"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Monto en Efectivo (S/.)</RequiredLabel>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                          className={inputErrorClass(fieldState.invalid)}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {(watchPagoModulo.includes("TRANSFERENCIA") ||
                  watchPagoModulo.includes("YAPE") ||
                  watchPagoModulo.includes("PLIN") ||
                  watchPagoModulo.includes("MIXTO")) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-slate-100/50 rounded-xl border border-slate-200/50">
                    <FormField
                      control={form.control}
                      name="montoOperacionModulo"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <RequiredLabel>Monto Digital/Banco</RequiredLabel>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                            className={inputErrorClass(fieldState.invalid)}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="numeroOperacionModulo"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <RequiredLabel>N° Operación</RequiredLabel>
                          <Input
                            placeholder="Código de transacción"
                            {...field}
                            className={inputErrorClass(fieldState.invalid)}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="pt-2 flex justify-between items-center text-sm font-semibold text-slate-700">
                  <span>Total Cobrado Módulos:</span>
                  <span className="text-base text-slate-900 font-bold">
                    S/. {form.watch("montoModulo").toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* BOTÓN PRINCIPAL DE ACCIÓN */}
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 h-11 text-base font-semibold text-white shadow-md rounded-xl transition-all flex items-center gap-2"
              >
                <Save className="h-5 w-5" />
                {isSubmitting
                  ? "Guardando..."
                  : isEditMode
                    ? "Actualizar Matrícula"
                    : "Registrar Matrícula"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
