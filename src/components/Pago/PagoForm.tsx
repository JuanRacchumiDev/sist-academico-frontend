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
import { Spinner } from "../../components/Common/Spinner";
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
import { createPago, getPagoById } from "../../services/pagoService";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RequiredLabel } from "../Common/RequiredLabel";
import { Pago, PagoResponse } from "@/interfaces/IPago";
import { Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import SearchableCombobox from "../../components/Common/SearchableCombobox";
import { Persona, PersonaResponse } from "@/interfaces/IPersona";
import { Matricula, MatriculaResponse } from "@/interfaces/IMatricula";
import { getPersonaById, getPersonas } from "@/services/personaService";
import { getMatriculaById } from "@/services/matriculaService";
import { Programa, ProgramaResponse } from "@/interfaces/IPrograma";
import {
  DetalleMatricula,
  DetalleMatriculaResponse,
} from "@/interfaces/IDetalleMatricula";
import {
  DetalleParametro,
  DetalleParametroFilters,
} from "@/interfaces/IDetalleParametro";
import { getDetalleFiltered } from "@/services/detalleParametroService";
import { Modulo } from "@/interfaces/IModulo";
import { getProgramaById } from "@/services/programaService";
import { ParametroClase } from "@/params/parametroClase";

const formSchema = z.object({
  idAlumno: z
    .string({
      message: "Seleccione un alumno",
    })
    .min(1, "Seleccione un alumno"),
  idMatricula: z
    .string({
      message: "Seleccione una matrícula",
    })
    .min(1, "Seleccione una matrícula"),
  idPrograma: z
    .string({
      message: "Seleccione un programa",
    })
    .min(1, "Seleccione un programa"),
  idFormaPago: z
    .string({
      message: "Seleccione una forma de pago",
    })
    .min(1, "Seleccione una forma de pago"),
  idMetodoPago: z
    .string({
      message: "Seleccione un método de pago",
    })
    .min(1, "Seleccione un método de pago"),
  //   idEstadoPago: z
  //     .string({
  //       message: "Seleccione un estado de pago",
  //     })
  //     .min(1, "Seleccione un estado de pago"),
  fechaPago: z
    .date({
      message: "La fecha de pago es requerida",
    })
    .refine((val) => val !== null, {
      message: "La fecha de pago es requerida",
    }),
  numeroOperacion: z.string().nullable().optional(),
  numeroModulo: z
    .string({
      message: "Seleccione un módulo",
    })
    .min(1, "Seleccione un módulo"),
  //   numeroModulo: z
  //     .number({
  //       message: "El número de módulo es requerido",
  //     })
  //     .int("Debe ser un número entero")
  //     .min(1, {
  //       message: "Ingrese un valor mayor que cero (min. 1)",
  //     }),
  monto: z
    .number({
      message: "El monto es obligatorio",
    })
    .int("Debe ser un número entero")
    .min(1, {
      message: "Ingrese un valor mayor que cero (min. 1)",
    }),
});

const today = new Date();
const minDateString = format(today, "yyyy-MM-dd");

type TPago = {
  idAlumno?: string;
  idMatricula?: string;
  idPrograma?: string;
  idFormaPago?: string;
  idMetodoPago?: string;
  //   idEstadoPago?: string;
  fechaPago?: Date;
  numeroOperacion?: string;
  numeroModulo?: string;
  monto?: number;
};

const dataMatriculas = async (idAlumno: string | null = null) => {
  let listMatriculas: Matricula[] = [];
  let response: PersonaResponse;

  if (idAlumno) {
    response = await getPersonaById(+idAlumno);
  }

  console.log("---- response alumno ----");
  console.log({ response });

  const { result, data } = response;
  if (result && data) {
    const dataPersona = data as Persona;
    const { matriculas } = dataPersona;
    listMatriculas = matriculas as Matricula[];
  }

  console.log({ listMatriculas });

  return listMatriculas;
};

const dataDetalleMatricula = async (idMatricula: string | null = null) => {
  let listItemsDetalle: DetalleMatricula[] = [];
  let response: MatriculaResponse;

  if (idMatricula) {
    response = await getMatriculaById(+idMatricula);
  }

  console.log("---- response detalle matrícula ----");
  console.log({ response });

  const { result, data } = response;
  if (result && data) {
    console.log("---- data detalles ----");
    console.log({ data });
    const { detalles } = data as Matricula;
    listItemsDetalle = detalles as DetalleMatricula[];
    // console.log({ dataDetalleMatricula });
  }

  return listItemsDetalle;
};

const dataModulos = async (idPrograma: string | null = null) => {
  let listModulos: Modulo[] = [];
  let response: ProgramaResponse;

  if (idPrograma) {
    response = await getProgramaById(+idPrograma);
  }

  console.log("---- response programa ----");
  console.log({ response });

  const { result, data } = response;
  if (result && data) {
    const dataPrograma = data as Programa;
    const { detalle_modulos } = dataPrograma;
    listModulos = detalle_modulos as Modulo[];
  }

  console.log({ listModulos });

  return listModulos;
};

export const PagoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [alumnos, setAlumnos] = useState<Persona[]>([]);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [detalleMatricula, setDetalleMatricula] = useState<DetalleMatricula[]>(
    [],
  );
  const [metodosPago, setMetodosPago] = useState<DetalleParametro[]>([]);
  const [formasPago, setFormasPago] = useState<DetalleParametro[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);

  const isEditMode = !!id;

  const handleGoBack = () => {
    const urlBack = `/pago/`;
    navigate(urlBack);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idAlumno: "",
      idMatricula: "",
      idPrograma: "",
      idFormaPago: "",
      idMetodoPago: "",
      //   idEstadoPago: "",
      fechaPago: today,
      numeroOperacion: "",
      numeroModulo: "",
      monto: 0,
    },
  });

  const resetForm = () => {
    const dataForm: TPago = {
      idAlumno: "",
      idMatricula: "",
      idPrograma: "",
      idFormaPago: "",
      idMetodoPago: "",
      //   idEstadoPago: "",
      fechaPago: new Date(),
      numeroOperacion: "",
      numeroModulo: "",
      monto: 0,
    };

    form.reset(dataForm);
  };

  // Id del alumno seleccionado
  const selectedAlumnoId = form.watch("idAlumno");

  // Id de la matrícula seleccionada
  const selectedMatriculaId = form.watch("idMatricula");

  // Id del programa seleccionado
  const selectedProgramaId = form.watch("idPrograma");

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log({ values });

      const {
        idAlumno,
        idMatricula,
        idPrograma,
        idFormaPago,
        idMetodoPago,
        // idEstadoPago,
        fechaPago,
        numeroOperacion,
        numeroModulo,
        monto,
      } = values;

      const descConcepto = `PAGO DE MÓDULO #${numeroModulo}`;
      console.log({ descConcepto });

      const fechaPagoToString: string | null = fechaPago
        ? fechaPago.toISOString()
        : null;

      console.log({ fechaPagoToString });

      const partsFechaPago: string[] = fechaPagoToString.split("T");

      console.log({ partsFechaPago });

      const fechaPagoStr: string = partsFechaPago[0];

      console.log({ fechaPagoStr });

      let payload: Pago = {
        id_matricula: +idMatricula,
        id_programa: +idPrograma,
        id_alumno: +idAlumno,
        id_formapago: +idFormaPago,
        id_metodopago: +idMetodoPago,
        id_estadopago: 35, // pago total
        concepto: descConcepto,
        fecha_pago: fechaPagoStr,
        nro_operacion: numeroOperacion,
        numero_modulo: +numeroModulo,
        monto_total: monto,
        monto_pagado: monto,
        monto_efectivo: monto,
        monto_tarjeta: 0,
        estado: true,
      };

      console.log("payload new pago");
      console.log({ payload });

      const response = await createPago(payload);

      console.log("---- response create pago ----");
      console.log({ response });

      const { result, message, data } = response as PagoResponse;

      console.log({ result });

      console.log({ message });

      console.log({ data });

      if (result && data) {
        showToast("success", message as string);
        navigate("/pago");
      } else {
        showToast("error", message || "Error al registrar el pago");
        return;
      }
    } catch (error) {
      console.error("Error al registrar módulo", error);
      // showToast("error", error);
      showToast("error", "Error al registrar el módulo");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let listAlumnos: Persona[] = [];

        let listMetodosPago: DetalleParametro[] = [];

        let listFormasPago: DetalleParametro[] = [];

        // Obteniendo alumnos
        const descGrupo = `grupo-alumno`;
        const responseAlumnos = await getPersonas(descGrupo);
        console.log({ responseAlumnos });
        const { result: resultAlumnos, data: dataAlumnos } = responseAlumnos;
        if (resultAlumnos && dataAlumnos) {
          listAlumnos = dataAlumnos as Persona[];
        }

        setAlumnos(listAlumnos);

        // Obteniendo las formas de pago
        const filterFormasPago: DetalleParametroFilters = {
          parametro_clase: ParametroClase.METODO_PAGO,
          en_persona: false,
          en_empresa: false,
          estado: true,
        };

        // Obteniendo los métodos de pago
        const filterMetodosPago: DetalleParametroFilters = {
          parametro_clase: ParametroClase.METODO_PAGO,
          en_persona: false,
          en_empresa: false,
          estado: true,
        };

        const [responseFormasPago, responseMetodosPago] = await Promise.all([
          getDetalleFiltered(filterFormasPago),
          getDetalleFiltered(filterMetodosPago),
        ]);

        // Formas de pago
        const { result: resultFormasPago, data: dataFormasPago } =
          responseFormasPago;

        if (resultFormasPago && dataFormasPago) {
          listFormasPago = dataFormasPago as DetalleParametro[];
        }

        setFormasPago(listFormasPago);

        // Métodos de pago
        const { result: resultMetodosPago, data: dataMetodosPago } =
          responseMetodosPago;

        if (resultMetodosPago && dataMetodosPago) {
          listMetodosPago = dataMetodosPago as DetalleParametro[];
        }

        setMetodosPago(listMetodosPago);
      } catch (error) {
        console.error("Error al obtener datos", error);
        showToast("error", "Error al cargar los datos del formulario.");
      }
    };

    fetchData();
  }, [id, form]);

  useEffect(() => {
    if (selectedAlumnoId) {
      const fetchMatriculas = async () => {
        try {
          const matriculasRes = await dataMatriculas(selectedAlumnoId);
          setMatriculas(matriculasRes);
        } catch (error) {
          console.error("Error al obtener matrículas", error);
          showToast("error", "Error al cargar las matrículas.");
        }
      };

      fetchMatriculas();
    }
  }, [selectedAlumnoId]);

  useEffect(() => {
    if (selectedMatriculaId) {
      const fetchDetalleMatricula = async () => {
        try {
          const detalleMatriculaRes =
            await dataDetalleMatricula(selectedMatriculaId);
          setDetalleMatricula(detalleMatriculaRes);
        } catch (error) {
          console.error("Error al obtener matrículas", error);
          showToast("error", "Error al cargar las matrículas.");
        }
      };

      fetchDetalleMatricula();
    }
  }, [selectedMatriculaId]);

  useEffect(() => {
    if (selectedProgramaId) {
      const fetchModulos = async () => {
        try {
          const programaRes = await dataModulos(selectedProgramaId);
          setModulos(programaRes);
        } catch (error) {
          console.error("Error al obtener matrículas", error);
          showToast("error", "Error al cargar las matrículas.");
        }
      };

      fetchModulos();
    }
  }, [selectedProgramaId]);

  return (
    <>
      <Card className="shadow-lg border-gray-200">
        <CardHeader className="border-b border-gray-200 p-4 sm:p-6 flex flex-row items-center justify-between">
          <div className="shrink min-w-0">
            <CardTitle className="text-xl font-bold text-gray-800 truncate">
              {isEditMode ? `Actualización de pago` : `Registro de pago`}
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {isEditMode
                ? `Formulario de actualización de pago`
                : `Complete el formulario para registrar un pago`}
            </CardDescription>
          </div>
          <button
            onClick={handleGoBack}
            className="
                      flex items-center text-sm font-semibold 
                      text-blue-600 
                      hover:text-blue-800 
                      hover:bg-blue-50 
                      transition-colors 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 
                      rounded-md p-2 ml-4 
                      cursor-pointer
                    "
            aria-label="Volver al listado"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </button>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <fieldset className="border border-gray-300 p-4 rounded-md">
                <legend className="text-base font-semibold text-gray-800 px-2">
                  Información de pago
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="idAlumno"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <RequiredLabel>Alumno</RequiredLabel>
                          <SearchableCombobox<Persona>
                            placeholder="Buscar un alumno"
                            options={alumnos}
                            value={field.value}
                            onChange={field.onChange}
                            displayKey="nombre_completo"
                            valueKey="id"
                            searchKeys={["nombre_completo"]}
                            // disabled={isFormDisabled || isModeLetter}
                            // disabled={isDisabled}
                            isInvalid={fieldState.invalid}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="idMatricula"
                      render={({ field, fieldState }) => {
                        return (
                          <FormItem className="flex flex-col">
                            <RequiredLabel>Matrícula</RequiredLabel>
                            <SearchableCombobox<Matricula>
                              placeholder="Buscar una matrícula"
                              options={matriculas}
                              value={field.value}
                              onChange={field.onChange}
                              displayKey="fecha_matricula"
                              valueKey="id"
                              searchKeys={["id"]}
                              //   disabled={isDisabled}
                              // disabled={isDependentFieldsDisabled}
                              isInvalid={fieldState.invalid}
                            />
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name="idPrograma"
                      render={({ field, fieldState }) => {
                        return (
                          <FormItem className="flex flex-col">
                            <RequiredLabel>Programa</RequiredLabel>
                            <SearchableCombobox<DetalleMatricula>
                              placeholder="Buscar un programa"
                              options={detalleMatricula}
                              value={field.value}
                              onChange={field.onChange}
                              displayKey="nombre_programa"
                              valueKey="id_programa"
                              searchKeys={["nombre_programa"]}
                              //   disabled={isDisabled}
                              // disabled={isDependentFieldsDisabled}
                              isInvalid={fieldState.invalid}
                            />
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name="numeroModulo"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <RequiredLabel>Módulos</RequiredLabel>
                          <SearchableCombobox<Modulo>
                            placeholder="Buscar un módulo"
                            options={modulos}
                            value={String(field.value)}
                            onChange={field.onChange}
                            displayKey="titulo"
                            valueKey="id"
                            searchKeys={["titulo"]}
                            // disabled={isFormDisabled || isModeLetter}
                            // disabled={isDisabled}
                            isInvalid={fieldState.invalid}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="idFormaPago"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <RequiredLabel>Forma Pago</RequiredLabel>
                          <SearchableCombobox<DetalleParametro>
                            placeholder="Buscar una forma de pago"
                            options={formasPago}
                            value={field.value}
                            onChange={field.onChange}
                            displayKey="nombre"
                            valueKey="codigo"
                            searchKeys={["nombre"]}
                            // disabled={isFormDisabled || isModeLetter}
                            // disabled={isDisabled}
                            isInvalid={fieldState.invalid}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="idMetodoPago"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <RequiredLabel>Método Pago</RequiredLabel>
                          <SearchableCombobox<DetalleParametro>
                            placeholder="Buscar un método de pago"
                            options={metodosPago}
                            value={field.value}
                            onChange={field.onChange}
                            displayKey="nombre"
                            valueKey="codigo"
                            searchKeys={["nombre"]}
                            // disabled={isFormDisabled || isModeLetter}
                            // disabled={isDisabled}
                            isInvalid={fieldState.invalid}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="numeroOperacion"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <RequiredLabel>Número de operación</RequiredLabel>
                          <FormControl>
                            <Input
                              placeholder="0123-4567-8910"
                              autoComplete="off"
                              type="text"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(
                                  value === "" ? null : parseInt(value, 10),
                                );
                              }}
                              className={`
                                              ${
                                                fieldState.invalid
                                                  ? "border-red-500 focus:ring-red-500"
                                                  : "focus:ring-blue-500"
                                              }
                                                transition-all duration-300
                                                placeholder-gray-400
                                            `}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="monto"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <RequiredLabel>Monto</RequiredLabel>
                          <FormControl>
                            <Input
                              placeholder="150.00"
                              autoComplete="off"
                              type="number"
                              min={1}
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(
                                  value === "" ? null : parseInt(value, 10),
                                );
                              }}
                              className={`
                                              ${
                                                fieldState.invalid
                                                  ? "border-red-500 focus:ring-red-500"
                                                  : "focus:ring-blue-500"
                                              }
                                                transition-all duration-300
                                                placeholder-gray-400
                                            `}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fechaPago"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <RequiredLabel>Fecha Pago</RequiredLabel>
                          <FormControl>
                            <Input
                              type="date"
                              min={minDateString}
                              value={
                                field.value
                                  ? format(field.value, "yyyy-MM-dd")
                                  : ""
                              }
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? parseISO(e.target.value)
                                    : null,
                                )
                              }
                              className={`
                                                  ${
                                                    fieldState.invalid
                                                      ? "border-red-500 focus:ring-red-500"
                                                      : "focus:ring-blue-500"
                                                  }
                                                    transition-all duration-300
                                                `}
                              // disabled={!camposHabilitadosPersona}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </fieldset>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 hover: cursor-pointer text-white transition-colors duration-300"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? "Actualizando..." : "Registrando..."}
                    </>
                  ) : isEditMode ? (
                    "Actualizar"
                  ) : (
                    "Registrar"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => resetForm()}
                  // onClick={() => navigate("/trabajador-social")}
                  className="hover:bg-gray-200 hover: cursor-pointer transition-colors duration-300"
                >
                  Cancelar
                  {/* {isSubmitting ? "Cancelando..." : "Cancelar"} */}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};
