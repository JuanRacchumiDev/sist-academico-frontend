import React, { useEffect, useState } from "react";
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
  DetalleParametro,
  DetalleParametroFilters,
} from "../../interfaces/IDetalleParametro";
import { getDetalleFiltered } from "../../services/detalleParametroService";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RequiredLabel } from "../Common/RequiredLabel";
import { Persona, PersonaResponse } from "@/interfaces/IPersona";
import { ArrowLeft } from "lucide-react";
import { createPersona, getPersonaById } from "../../services/personaService";

interface PersonaFormProps {
  nombreGrupo?: string;
}

const formSchema = z.object({
  idTipoDocumento: z
    .string({
      message: "Por favor seleccione un tipo de documento.",
    })
    .min(1, "Por favor seleccione un tipo de documento."),
  numeroDocumento: z.string().min(8, {
    message: "El número de documento debe tener al menos 8 caracteres.",
  }),
  nombres: z.string().min(2, {
    message: "Los nombres son requeridos.",
  }),
  apellidoPaterno: z.string().min(2, {
    message: "El apellido paterno es requerido.",
  }),
  apellidoMaterno: z.string().min(2, {
    message: "El apellido materno es requerido.",
  }),
  fechaNacimiento: z
    .date({
      message: "La fecha de nacimiento es requerida",
    })
    .nullable()
    .refine((val) => val !== null, {
      message: "La fecha de nacimiento es requerida",
    }),
  email: z.string().email({
    message: "Por favor ingrese un correo válido",
  }),
  sexo: z.string().min(1, {
    message: "El sexo es obligatorio",
  }),
  telefono: z.string().min(2, {
    message: "El teléfono es requerido.",
  }),
});

type TPersona = {
  idTipoDocumento?: string;
  numeroDocumento?: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  fechaNacimiento?: Date | null;
  email?: string;
  sexo?: string;
  telefono?: string;
};

export const PersonaForm: React.FC<PersonaFormProps> = ({ nombreGrupo }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [tipoDocumentos, setTipoDocumentos] = useState<DetalleParametro[]>([]);

  const isEditMode = !!id;

  const handleGoBack = () => {
    const urlBack = `/personas/${nombreGrupo}`;

    navigate(urlBack);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idTipoDocumento: "1",
      numeroDocumento: "",
      nombres: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      fechaNacimiento: null,
      email: "",
      sexo: "",
      telefono: "",
    },
  });

  const resetForm = () => {
    const dataForm: TPersona = {
      idTipoDocumento: "1",
      numeroDocumento: "",
      nombres: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      fechaNacimiento: null,
      email: "",
      sexo: "",
      telefono: "",
    };

    form.reset(dataForm);
  };

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log({ values });

      const {
        idTipoDocumento,
        numeroDocumento,
        nombres,
        apellidoMaterno,
        apellidoPaterno,
        fechaNacimiento,
        email,
        sexo,
        telefono,
      } = values;

      const nombreCompleto: string = `${nombres} ${apellidoPaterno} ${apellidoMaterno}`;

      const fechaNacimientoToString: string | null = fechaNacimiento
        ? fechaNacimiento.toISOString()
        : null;

      const partsFechaNacimiento: string[] =
        fechaNacimientoToString!.split("T");

      const fechaNacimientoStr: string = partsFechaNacimiento[0];

      const payload: Persona = {
        id_tipodocumento: +idTipoDocumento,
        numero_documento: numeroDocumento,
        nombres,
        apellido_paterno: apellidoPaterno,
        apellido_materno: apellidoMaterno,
        nombre_completo: nombreCompleto,
        fecha_nacimiento: fechaNacimientoStr,
        email,
        sexo,
        origen: "WEB",
        nombre_grupo: `grupo-${nombreGrupo}`,
        estado_civil: "SOLTERO",
        telefono,
        estado: true,
      };

      console.log("payload new persona");
      console.log({ payload });

      const response = await createPersona(payload);

      console.log("response create", response);

      const { result, message, code } = response as PersonaResponse;

      const messageStr = message as string;

      console.log({ messageStr });

      console.log({ code });

      if (result) {
        if (code === "PREVIOUSLY_REGISTERED") {
          showToast("warning", messageStr);
          return;
        } else {
          const messageCreate = nombreGrupo
            ? `${nombreGrupo.toUpperCase()} REGISTRADO (A) EXITOSAMENTE`
            : (message as string).toUpperCase();

          showToast("success", messageCreate);
          navigate(`/personas/${nombreGrupo}`);
        }
      } else {
        showToast(
          "error",
          message || "Error al registrar al trabajador social"
        );
        return;
      }
    } catch (error) {
      console.error("Error al registrar trabajador social", error);
      showToast("error", "Error al registrar el trabajador social");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let listTipoDocumentos: DetalleParametro[] = [];

        const filters: DetalleParametroFilters = {
          parametro_clase: 1000,
          en_persona: true,
          en_empresa: false,
          estado: true,
        };

        const [responseTipoDocumentos] = await Promise.all([
          getDetalleFiltered(filters),
        ]);

        console.log({ responseTipoDocumentos });

        const { result, data } = responseTipoDocumentos;

        if (result && data) {
          listTipoDocumentos = data as DetalleParametro[];
        }

        setTipoDocumentos(listTipoDocumentos);

        if (isEditMode) {
          const responsePersona = await getPersonaById(+id);
          console.log({ responsePersona });

          const { result, data } = responsePersona;

          if (result && data) {
            const persona = data as Persona;
            console.log({ persona });

            form.reset({
              idTipoDocumento: String(persona.id_tipodocumento),
              numeroDocumento: persona.numero_documento,
              nombres: persona.nombres,
              apellidoPaterno: persona.apellido_paterno,
              apellidoMaterno: persona.apellido_materno,
              email: persona.email,
              sexo: persona.sexo,
              fechaNacimiento: new Date(persona.fecha_nacimiento as string),
              telefono: persona.telefono || "",
            });
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
                ? `Actualización de ${nombreGrupo}`
                : `Registro de ${nombreGrupo}`}
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {isEditMode
                ? `Formulario de actualización de ${nombreGrupo}`
                : `Complete el formulario para registrar un ${nombreGrupo}`}
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
                  Información personal
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="idTipoDocumento"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Tipo de Documento</RequiredLabel>
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
                              <SelectValue placeholder="Seleccionar tipo de documento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-400 placeholder-gray-400">
                            {tipoDocumentos.map((tipo) => (
                              <SelectItem
                                value={tipo.codigo!.toString()}
                                key={tipo.codigo!.toString()}
                                className="cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                {tipo.descripcion}
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
                    name="numeroDocumento"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Número de Documento</RequiredLabel>
                        <FormControl>
                          <Input
                            placeholder="12345678"
                            autoComplete="off"
                            maxLength={8}
                            {...field}
                            className={`
                              ${
                                fieldState.invalid
                                  ? "border-red-500 focus:ring-red-500"
                                  : "focus:ring-blue-500"
                              }
                                transition-all duration-300 placeholder-gray-400
                            `}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nombres"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Nombres</RequiredLabel>
                        <FormControl>
                          <Input
                            placeholder="María Angélica"
                            autoComplete="off"
                            maxLength={40}
                            {...field}
                            // disabled={!camposHabilitadosPersona}
                            className={`
                              ${
                                fieldState.invalid
                                  ? "border-red-500 focus:ring-red-500"
                                  : "focus:ring-blue-500"
                              }
                                transition-all duration-300 placeholder-gray-400
                            `}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="apellidoPaterno"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Apellido Paterno</RequiredLabel>
                        <FormControl>
                          <Input
                            placeholder="Pérez"
                            autoComplete="off"
                            maxLength={40}
                            {...field}
                            // disabled={!camposHabilitadosPersona}
                            className={`
                              ${
                                fieldState.invalid
                                  ? "border-red-500 focus:ring-red-500"
                                  : "focus:ring-blue-500"
                              }
                                transition-all duration-300 placeholder-gray-400
                            `}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="apellidoMaterno"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Apellido Materno</RequiredLabel>
                        <FormControl>
                          <Input
                            placeholder="Vallejos"
                            autoComplete="off"
                            maxLength={40}
                            {...field}
                            // disabled={!camposHabilitadosPersona}
                            className={`
                              ${
                                fieldState.invalid
                                  ? "border-red-500 focus:ring-red-500"
                                  : "focus:ring-blue-500"
                              }
                                transition-all duration-300 placeholder-gray-400
                            `}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fechaNacimiento"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Fecha de Nacimiento</RequiredLabel>
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
                    name="email"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Email</RequiredLabel>
                        <FormControl>
                          <Input
                            placeholder="maria.lopez@empresa.com"
                            autoComplete="off"
                            maxLength={60}
                            {...field}
                            className={`
                              ${
                                fieldState.invalid
                                  ? "border-red-500 focus:ring-red-500"
                                  : "focus:ring-blue-500"
                              }
                                transition-all duration-300 placeholder-gray-400
                            `}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sexo"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Sexo</RequiredLabel>
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
                              <SelectValue placeholder="Seleccionar un sexo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-400 placeholder-gray-400">
                            <SelectItem
                              value={"F"}
                              key={"F"}
                              className="cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                              Femenino
                            </SelectItem>
                            <SelectItem
                              value={"M"}
                              key={"M"}
                              className="cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                              Masculino
                            </SelectItem>
                            {/* {tipoDocumentos.map((tipo) => (
                              <SelectItem
                                value={tipo.id}
                                key={tipo.id}
                                className="cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                {tipo.abreviatura} - {tipo.nombre}
                              </SelectItem>
                            ))} */}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telefono"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Teléfono</RequiredLabel>
                        <FormControl>
                          <Input
                            placeholder="997755662"
                            autoComplete="off"
                            maxLength={9}
                            {...field}
                            className={`
                              ${
                                fieldState.invalid
                                  ? "border-red-500 focus:ring-red-500"
                                  : "focus:ring-blue-500"
                              }
                                transition-all duration-300 placeholder-gray-400
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
