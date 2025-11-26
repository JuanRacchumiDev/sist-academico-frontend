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
  createMatricula,
  getMatriculaById,
} from "../../services/matriculaService";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RequiredLabel } from "../Common/RequiredLabel";
import { Matricula, MatriculaResponse } from "@/interfaces/IMatricula";
import { ArrowLeft } from "lucide-react";
import { getDetalleFiltered } from "../../services/detalleParametroService";
import { getPersonas } from "../../services/personaService";
import { getProgramas } from "../../services/programaService";
import {
  DetalleParametro,
  DetalleParametroFilters,
} from "@/interfaces/IDetalleParametro";
import { Persona } from "@/interfaces/IPersona";
import { Programa } from "@/interfaces/IPrograma";
import SearchableCombobox from "../../components/Common/SearchableCombobox";

export const formSchema = z.object({
  idAlumno: z
    .string({
      message: "Debe seleccionar un alumno",
    })
    .min(1, "Debe seleccionar un alumno"),
  idMetodoPago: z.string({
    message: "Seleccione un método de pago",
  }),
  idSede: z
    .string({
      message: "Seleccione una sede.",
    })
    .min(1, "Seleccione una sede."),
  idPrograma: z
    .string({
      message: "Seleccione un programa.",
    })
    .min(1, "Seleccione un programa."),
  fechaMatricula: z
    .date({
      message: "La fecha de matrícula es requerida",
    })
    .nullable()
    .refine((val) => val !== null, {
      message: "La fecha de matrícula es requerida",
    }),
  monto: z
    .number({
      message: "El monto es obligatorio",
    })
    .int("Debe ser un número entero")
    .min(1, {
      message: "Ingrese un valor mayor que cero (min. 1)",
    }),
});

type TMatricula = {
  idAlumno?: string;
  idMetodoPago?: string;
  idSede?: string;
  idPrograma?: string;
  fechaMatricula?: Date | null;
  monto?: number;
};

const today = new Date();
const minDateString = format(today, "yyyy-MM-dd");

export const MatriculaForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [alumnos, setAlumnos] = useState<Persona[]>([]);
  const [sedes, setSedes] = useState<DetalleParametro[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [metodosPago, setMetodosPago] = useState<DetalleParametro[]>([]);

  const isEditMode = !!id;

  const handleGoBack = () => {
    const urlBack = `/matricula/`;
    navigate(urlBack);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idAlumno: "",
      idMetodoPago: "",
      idSede: "",
      idPrograma: "",
      fechaMatricula: today,
      monto: 0,
    },
  });

  const resetForm = () => {
    const dataForm: TMatricula = {
      idAlumno: "",
      idMetodoPago: "",
      idSede: "",
      idPrograma: "",
      fechaMatricula: new Date(),
      monto: 0,
    };

    form.reset(dataForm);
  };

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log({ values });

      const {
        idAlumno,
        idSede,
        idPrograma,
        idMetodoPago,
        fechaMatricula,
        monto,
      } = values;

      const fechaMatriculaToString: string | null = fechaMatricula
        ? fechaMatricula.toISOString()
        : null;

      console.log({ fechaMatriculaToString });

      const partsFechaMatricula: string[] = fechaMatriculaToString!.split("T");

      console.log({ partsFechaMatricula });

      const fechaMatriculaStr: string = partsFechaMatricula[0];

      console.log({ fechaMatriculaStr });

      let payload: Matricula = {
        id_alumno: +idAlumno,
        id_sede: +idSede,
        id_programa: +idPrograma,
        id_metodopago: +idMetodoPago,
        fecha_matricula: fechaMatriculaStr,
        monto: +monto,
        id_estadomatricula: 52, // matriculado

        estado: true,
      };

      console.log("payload new matrícula");
      console.log({ payload });

      const response = await createMatricula(payload);

      console.log("response create", response);

      const { result, message, data } = response as MatriculaResponse;

      console.log({ result });

      console.log({ message });

      console.log({ data });

      if (result && data) {
        showToast("success", message as string);

        navigate(`/matricula`);
      } else {
        showToast("error", message || "Error al registrar la matrícula");
        return;
      }
    } catch (error) {
      console.error("Error al registrar matrícula", error);
      // showToast("error", error);
      showToast("error", "Error al registrar la matrícula");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let listAlumnos: Persona[] = [];

        let listSedes: DetalleParametro[] = [];

        let listProgramas: Programa[] = [];

        let listMetodosPago: DetalleParametro[] = [];

        // Obteniendo las sedes
        const filtersSedes: DetalleParametroFilters = {
          parametro_clase: 1005,
          en_persona: true,
          en_empresa: false,
          estado: true,
        };

        const filterMetodosPago: DetalleParametroFilters = {
          parametro_clase: 1014,
          en_persona: false,
          en_empresa: false,
          estado: true,
        };

        const [responseSedes, responseMetodosPago] = await Promise.all([
          getDetalleFiltered(filtersSedes),
          getDetalleFiltered(filterMetodosPago),
        ]);

        console.log({ responseSedes });

        console.log({ responseMetodosPago });

        const { result: resultSedes, data: dataSedes } = responseSedes;

        if (resultSedes && dataSedes) {
          listSedes = dataSedes as DetalleParametro[];
        }

        setSedes(listSedes);

        const { result: resultMetodosPago, data: dataMetodosPago } =
          responseMetodosPago;

        if (resultMetodosPago && dataMetodosPago) {
          listMetodosPago = dataMetodosPago as DetalleParametro[];
        }

        setMetodosPago(listMetodosPago);

        // Obteniendo las alumnos
        const descGrupo = `grupo-alumno`;
        const responseAlumnos = await getPersonas(descGrupo);
        console.log({ responseAlumnos });
        const { result: resutlAlumnos, data: dataAlumnos } = responseAlumnos;
        if (resutlAlumnos && dataAlumnos) {
          listAlumnos = dataAlumnos as Persona[];
        }

        setAlumnos(listAlumnos);

        // Obteniendo los programas
        const responseProgramas = await getProgramas();
        console.log({ responseProgramas });

        const { result: resultProgramas, data: dataProgramas } =
          responseProgramas;

        if (resultProgramas && dataProgramas) {
          listProgramas = dataProgramas as Programa[];
        }

        setProgramas(listProgramas);

        if (id) {
          const responseMatricula = await getMatriculaById(+id);
          console.log({ responseMatricula });

          const { result, data, message } = responseMatricula;

          if (result && data) {
            let dataForm: TMatricula = {};
            const matricula = data as Matricula;

            const { id_alumno, id_sede, id_programa, fecha_matricula } =
              matricula;

            if (id_alumno) {
              dataForm.idAlumno = id_alumno.toString();
            }

            if (id_sede) {
              dataForm.idSede = id_sede.toString();
            }

            if (id_programa) {
              dataForm.idPrograma = id_programa.toString();
            }

            dataForm.fechaMatricula = fecha_matricula
              ? parseISO(fecha_matricula)
              : null;
            form.reset(dataForm);
          } else {
            showToast("error", message || "Matrícula no encontrada");
            navigate("/matricula/nuevo");
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
                ? `Actualización de matrícula`
                : `Registro de matrícula`}
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {isEditMode
                ? `Formulario de actualización de matrícula`
                : `Complete el formulario para registrar una matrícula`}
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
                  Información de matrícula
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    name="idPrograma"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Programa</RequiredLabel>
                        <SearchableCombobox<Programa>
                          placeholder="Buscar un programa"
                          options={programas}
                          value={field.value}
                          onChange={field.onChange}
                          displayKey="nombre"
                          valueKey="id"
                          searchKeys={["nombre"]}
                          isInvalid={fieldState.invalid}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="idSede"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Sede</RequiredLabel>
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
                              <SelectValue placeholder="Seleccionar sede" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-400 placeholder-gray-400">
                            {sedes.map((sede) => (
                              <SelectItem
                                value={sede.codigo!.toString()}
                                key={sede.codigo!.toString()}
                                className="cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                {sede.nombre}
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
                    name="fechaMatricula"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Fecha Matrícula</RequiredLabel>
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
                                e.target.value ? parseISO(e.target.value) : null
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
                                value === "" ? null : parseInt(value, 10)
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
