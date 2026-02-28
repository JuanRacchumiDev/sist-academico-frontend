import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import {
  createPrograma,
  getProgramaById,
} from "../../services/programaService";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RequiredLabel } from "../Common/RequiredLabel";
import { Programa, ProgramaResponse } from "@/interfaces/IPrograma";
import { ArrowLeft } from "lucide-react";
import { getDetalleFiltered } from "../../services/detalleParametroService";
import {
  DetalleParametro,
  DetalleParametroFilters,
} from "@/interfaces/IDetalleParametro";
import { ParametroClase } from "@/params/parametroClase";

const MAX_FILE_SIZE = 2097152;

const formSchema = z.object({
  idSegmento: z
    .string({
      message: "Por favor seleccione un segmento",
    })
    .min(1, "Por favor seleccione un segmento"),
  idTipoPrograma: z
    .string({
      message: "Por favor seleccione un tipo de programa",
    })
    .min(1, "Por favor seleccione un tipo de programa"),
  // codigoOld: z.string().max(10).nullable().optional(),
  nombre: z.string().min(10, {
    message: "El nombre es obligatorio",
  }),
  sigla: z.string().min(2, {
    message: "La sigla es obligatoria",
  }),
  fechaInicio: z
    .date({
      message: "La fecha de inicio es requerida",
    })
    .nullable(),
  fechaFinal: z
    .date({
      message: "La fecha final es requerida",
    })
    .nullable(),
  duracion: z.string().min(5, {
    message: "La duración es obligatoria",
  }),
  horasAcademicas: z
    .number({
      message: "Las horas académicas es obligatorio",
    })
    .nullable(),
  modulos: z
    .number({
      message: "La cantidad de módulos es obligatoria",
    })
    .int("Debe ser un número entero")
    .min(1, {
      message: "Ingrese un valor mayor que cero (min. 1)",
    }),
  creditos: z
    .number({
      message: "La cantidad de créditos es obligatoria",
    })
    .int("Debe ser un número entero")
    .min(1, {
      message: "Ingrese un valor mayor que cero (min. 1)",
    }),

  // Esquema para el archivo
  plan_file: z
    .instanceof(File)
    .nullable()
    .optional()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      `El archivo debe ser menor a 2MB`,
    )
    .refine(
      (file) => !file || file.type === "application/pdf",
      `El archivo debe ser un PDF`,
    ),
  modalidad: z
    .string({
      message: "Por favor seleccione una modalidad",
    })
    .min(1, "Por favor seleccione una modalidad"),
  precio: z
    .number({
      message: "El precio debe ser obligatorio",
    })
    .int("Debe ser un número entero")
    .nullable()
    .optional(),
  // precio: z
  //   .number({
  //     message: "El precio es obligatorio",
  //   })
  //   .int("Debe ser un número entero")
  //   .min(1, {
  //     message: "Ingrese un valor mayor que cero (min. 1)",
  //   }),
});

type TPrograma = {
  idSegmento?: string;
  idTipoPrograma?: string;
  // codigoOld?: string;
  nombre?: string;
  sigla?: string;
  fechaInicio?: Date | null;
  fechaFinal?: Date | null;
  duracion?: string;
  horasAcademicas?: number;
  modulos?: number;
  creditos?: number;
  modalidad?: string;
  precio?: number;
};

export const ProgramaForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [segmentos, setSegmentos] = useState<DetalleParametro[]>([]);
  const [tipoProgramas, setTipoProgramas] = useState<DetalleParametro[]>([]);

  const isEditMode = !!id;

  const handleGoBack = () => {
    const urlBack = `/programa-academico/`;
    navigate(urlBack);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idSegmento: "",
      idTipoPrograma: "",
      // codigoOld: "",
      nombre: "",
      sigla: "",
      fechaInicio: null,
      fechaFinal: null,
      duracion: "",
      horasAcademicas: 0,
      modulos: 0,
      creditos: 0,
      modalidad: "VIRTUAL",
      precio: 0,
    },
  });

  const resetForm = () => {
    const dataForm: TPrograma = {
      idSegmento: "",
      idTipoPrograma: "",
      // codigoOld: "",
      nombre: "",
      sigla: "",
      fechaInicio: null,
      fechaFinal: null,
      duracion: "",
      horasAcademicas: 0,
      modulos: 0,
      creditos: 0,
      modalidad: "VIRTUAL",
      precio: 0,
    };

    form.reset(dataForm);
  };

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData = new FormData();

      console.log("---- values onSubmit ProgramaForm ----");
      console.log({ values });

      const {
        idSegmento,
        idTipoPrograma,
        // codigoOld,
        nombre,
        sigla,
        fechaInicio,
        fechaFinal,
        duracion,
        horasAcademicas,
        modulos,
        creditos,
        plan_file,
        modalidad,
        precio,
      } = values;

      let fechaInicioStr: string = "";
      if (fechaInicio) {
        const fechaInicioToString: string = fechaInicio.toISOString();
        const partsFechaInicio: string[] = fechaInicioToString.split("T");
        fechaInicioStr = partsFechaInicio[0];
      }

      let fechaFinalStr: string = "";
      if (fechaFinal) {
        const fechaFinalToString: string = fechaFinal.toISOString();
        const partsFechaFinal: string[] = fechaFinalToString.split("T");
        fechaFinalStr = partsFechaFinal[0];
      }

      // const fechaInicioToString: string | null = fechaInicio
      //   ? fechaInicio.toISOString()
      //   : null;
      // const partsFechaInicio: string[] = fechaInicioToString!.split("T");
      // const fechaInicioStr: string = partsFechaInicio[0];

      // const fechaFinalToString: string | null = fechaFinal
      //   ? fechaFinal.toISOString()
      //   : null;
      // const partsFechaFinal: string[] = fechaFinalToString!.split("T");
      // const fechaFinalStr: string = partsFechaFinal[0];

      // console.log({ fechaInicioToString });
      // console.log({ fechaFinalToString });

      formData.append("id_segmento", idSegmento);
      formData.append("id_tipoprograma", idTipoPrograma);
      // formData.append("codigo_old", codigoOld || "");
      formData.append("nombre", nombre);
      formData.append("sigla", sigla);
      formData.append("fecha_inicio", fechaInicioStr);
      formData.append("fecha_final", fechaFinalStr);
      formData.append("duracion", duracion);
      formData.append("horas_academicas", horasAcademicas.toString());
      formData.append("numero_modulos", modulos.toString());
      formData.append("creditos", creditos.toString());
      formData.append("is_vigente", "1");
      formData.append("estado", "1");
      formData.append("modalidad", modalidad || "");
      formData.append("precio_modulo", precio.toString());

      // Agregar el archivo si existe
      if (plan_file) {
        formData.append("plan", plan_file);
      }

      console.log("--- formData ----");
      console.log({ formData });

      const response = await createPrograma(formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("response create", response);
      const { result, message, data } = response as ProgramaResponse;
      console.log({ result });
      console.log({ message });
      console.log({ data });
      if (result && data) {
        showToast("success", message as string);
        navigate(`/programa-academico`);
      } else {
        showToast("error", message || "Error al registrar el programa");
        return;
      }
    } catch (error) {
      console.error("Error al registrar programa", error);
      // showToast("error", error);
      showToast("error", "Error al registrar el programa");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let listSegmentos: DetalleParametro[] = [];
        let listTipoProgramas: DetalleParametro[] = [];

        // Obteniendo datos para crear el listado de segmentos
        const filtersSegmentos: DetalleParametroFilters = {
          parametro_clase: ParametroClase.SEGMENTO,
          en_persona: false,
          en_empresa: false,
          estado: true,
        };

        const [responseSegmentos] = await Promise.all([
          getDetalleFiltered(filtersSegmentos),
        ]);

        console.log({ responseSegmentos });

        const { result: resultSegmentos, data: dataSegmentos } =
          responseSegmentos;

        if (resultSegmentos && dataSegmentos) {
          listSegmentos = dataSegmentos as DetalleParametro[];
        }

        setSegmentos(listSegmentos);

        // Obteniendo datos para crear el listado de tipo de programas
        const filtersTipoProgramas: DetalleParametroFilters = {
          parametro_clase: ParametroClase.TIPO_PROGRAMA,
          en_persona: false,
          en_empresa: false,
          estado: true,
        };

        const [responseTipoProgramas] = await Promise.all([
          getDetalleFiltered(filtersTipoProgramas),
        ]);

        console.log({ responseTipoProgramas });

        const { result: resultTipoProgramas, data: dataTipoProgramas } =
          responseTipoProgramas;

        if (resultTipoProgramas && dataTipoProgramas) {
          listTipoProgramas = dataTipoProgramas as DetalleParametro[];
        }

        setTipoProgramas(listTipoProgramas);

        if (id) {
          const responsePrograma = await getProgramaById(+id);
          console.log({ responsePrograma });

          const { result, data, message } = responsePrograma;

          if (result && data) {
            const programa = data as Programa;

            console.log({ programa });

            form.reset({
              // codigoOld: programa.codigo_old ?? "",
              idSegmento: programa.id_segmento ?? "",
              idTipoPrograma: programa.id_tipoprograma ?? "",
              nombre: programa.nombre ?? "",
              sigla: programa.sigla ?? "",
              fechaInicio: programa.fecha_inicio
                ? new Date(programa.fecha_inicio as string)
                : null,
              fechaFinal: programa.fecha_final
                ? new Date(programa.fecha_final as string)
                : null,
              horasAcademicas: programa.horas_academicas ?? 0,
              duracion: programa.duracion ?? "",
              modulos: programa.numero_modulos ?? 0,
              creditos: programa.creditos ?? 0,
              modalidad: programa.modalidad ?? "VIRTUAL",
              precio: programa.precio ?? 0,
            });
          } else {
            showToast("error", message || "Programa no encontrado");
            navigate("/programa-academico/nuevo");
          }
        }
      } catch (error) {
        console.error("Error al obtener datos", error);
        showToast("error", "Error al cargar los datos del formulario.");
      }
    };

    fetchData();
  }, [id, form]);

  return (
    <>
      <Card className="shadow-lg border-gray-200">
        <CardHeader className="border-b border-gray-200 p-4 sm:p-6 flex flex-row items-center justify-between">
          <div className="shrink min-w-0">
            <CardTitle className="text-xl font-bold text-gray-800 truncate">
              {isEditMode
                ? `Actualización de programa`
                : `Registro de programa`}
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {isEditMode
                ? `Formulario de actualización de programa`
                : `Complete el formulario para registrar un programa`}
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
                  Información de programa
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="idSegmento"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Segmento</RequiredLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? ""}
                        >
                          <FormControl>
                            <SelectTrigger
                              className={`
                                ${
                                  fieldState.invalid
                                    ? "border-red-500 focus:ring-red-500"
                                    : "focus:ring-blue-500"
                                }
                                  focus:ring-2 focus:ring-offset-2 transition-all duration-300 cursor-pointer
                              `}
                            >
                              <SelectValue placeholder="Seleccionar segmento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-400 placeholder-gray-400">
                            {segmentos.map((segmento) => (
                              <SelectItem
                                value={segmento.codigo!.toString()}
                                key={segmento.codigo!.toString()}
                                className="cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                {segmento.nombre}
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
                      <FormItem>
                        <RequiredLabel>Tipo Programa</RequiredLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? ""}
                        >
                          <FormControl>
                            <SelectTrigger
                              className={`
                                ${
                                  fieldState.invalid
                                    ? "border-red-500 focus:ring-red-500"
                                    : "focus:ring-blue-500"
                                }
                                  focus:ring-2 focus:ring-offset-2 transition-all duration-300 cursor-pointer
                              `}
                            >
                              <SelectValue placeholder="Seleccionar tipo de programa" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-400 placeholder-gray-400">
                            {tipoProgramas.map((tipoPrograma) => (
                              <SelectItem
                                value={tipoPrograma.codigo!.toString()}
                                key={tipoPrograma.codigo!.toString()}
                                className="cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                {tipoPrograma.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* <FormField
                    control={form.control}
                    name="codigoOld"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Código Anterior</RequiredLabel>
                        <FormControl>
                          <Input
                            placeholder="COD039"
                            autoComplete="off"
                            maxLength={10}
                            {...field}
                            value={field.value ?? ""}
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
                  /> */}

                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Nombre</RequiredLabel>
                        <FormControl>
                          <Input
                            placeholder="ADMINISTRACIÓN EJECUTIVA"
                            autoComplete="off"
                            maxLength={100}
                            {...field}
                            value={field.value ?? ""}
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
                    name="sigla"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Sigla</RequiredLabel>
                        <FormControl>
                          <Input
                            placeholder="AE"
                            autoComplete="off"
                            maxLength={10}
                            {...field}
                            value={field.value ?? ""}
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
                    name="fechaInicio"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Fecha Inicio</RequiredLabel>
                        <FormControl>
                          <Input
                            type="date"
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fechaFinal"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Fecha Final</RequiredLabel>
                        <FormControl>
                          <Input
                            type="date"
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duracion"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Duración</RequiredLabel>
                        <FormControl>
                          <Input
                            placeholder="12 MESES"
                            autoComplete="off"
                            maxLength={20}
                            {...field}
                            value={field.value ?? ""}
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
                    name="modulos"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Módulos</RequiredLabel>
                        <FormControl>
                          <Input
                            placeholder="12"
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
                    name="creditos"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Créditos</RequiredLabel>
                        <FormControl>
                          <Input
                            placeholder="24"
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
                    name="modalidad"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Modalidad</RequiredLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? ""}
                        >
                          <FormControl>
                            <SelectTrigger
                              className={`
                                ${
                                  fieldState.invalid
                                    ? "border-red-500 focus:ring-red-500"
                                    : "focus:ring-blue-500"
                                }
                                  focus:ring-2 focus:ring-offset-2 transition-all duration-300 cursor-pointer
                              `}
                            >
                              <SelectValue placeholder="Seleccionar modalidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-400 placeholder-gray-400">
                            <SelectItem
                              value={"VIRTUAL"}
                              key={"VIRTUAL"}
                              className="cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                              VIRTUAL
                            </SelectItem>
                            <SelectItem
                              value={"PRESENCIAL"}
                              key={"PRESENCIAL"}
                              className="cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                              PRESENCIAL
                            </SelectItem>
                            <SelectItem
                              value={"MIXTA"}
                              key={"MIXTRA"}
                              className="cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                              MIXTA
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="precio"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Precio</RequiredLabel>
                        <FormControl>
                          <Input
                            placeholder="120"
                            autoComplete="off"
                            type="number"
                            // min={1}
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
                    name="plan_file"
                    render={({ field, fieldState }) => (
                      <FormItem className="md:col-span-2">
                        <RequiredLabel>Plan de estudios</RequiredLabel>
                        <FormControl>
                          <Input
                            id="plan_file"
                            type="file"
                            accept=".pdf"
                            onChange={(e) => {
                              // Accede al primer archivo seleccionado
                              const file = e.target.files?.[0];
                              // Llama a field.onChange con el objeto File (o null)
                              field.onChange(file ?? null);
                            }}
                            className={`
                                flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition-all duration-300
                                file:mr-4 file:py-1 file:px-3
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100
                                hover:border-blue-400
                                ${
                                  fieldState.invalid
                                    ? "border-red-500 focus:ring-red-500"
                                    : "focus:ring-blue-500"
                                }
                            `}
                          />
                        </FormControl>
                        <FormDescription>
                          Sube el documento del plan de estudios (PDF, Máx. 2MB)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
