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
import { ArrowLeft, Save, XCircle } from "lucide-react";
import {
  createPersona,
  getPersonaById,
  updatePersona,
} from "../../services/personaService";
import { getPersonaByApi } from "../../services/personaApiService";
import { ParametroClase } from "@/params/parametroClase";

interface PersonaFormProps {
  nombreGrupo?: string;
}

const formSchema = z.object({
  idTipoDocumento: z
    .string({
      message: "El tipo de documento es requerido.",
    })
    .min(1, "El tipo de documento es requerido."),
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
    message: "El sexo es requerido",
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

  const [camposHabilitados, setCamposHabilitados] = useState(false);

  const [idPersona, setIdPersona] = useState(0);

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
        // origen: "WEB",
        nombre_grupo: `grupo-${nombreGrupo}`,
        // estado_civil: "SOLTERO",
        telefono,
        estado: true,
      };

      console.log("payload new persona");
      console.log({ payload });

      let resultOperation: boolean = false;
      let messageOperation: string = "";
      let codeOperation: string = "";

      if (!isEditMode) {
        console.log("---- no actualizar ----");

        if (idPersona) {
          console.log("update desde form");
          const response = await updatePersona(idPersona, payload);
          console.log("---- response update ----");
          console.log({ response });

          const { result, message, code } = response as PersonaResponse;

          resultOperation = result as boolean;

          messageOperation = message as string;

          codeOperation = code as string;
        } else {
          console.log("create desde form");

          payload.origen = "WEB";

          // Nueva persona
          const response = await createPersona(payload);

          console.log("--- response create ----");
          console.log({ response });

          const { result, message, code } = response as PersonaResponse;

          resultOperation = result as boolean;

          messageOperation = message as string;

          codeOperation = code as string;
        }
      } else {
        console.log("update desde ");
        const response = await updatePersona(idPersona, payload);
        console.log("---- response update ----");
        console.log({ response });

        const { result, message, code } = response as PersonaResponse;

        resultOperation = result as boolean;

        messageOperation = message as string;

        codeOperation = code as string;
      }

      if (resultOperation) {
        if (codeOperation === "PREVIOUSLY_REGISTERED") {
          showToast("warning", messageOperation);
          return;
        } else {
          const messageCreate = nombreGrupo
            ? `${nombreGrupo.toUpperCase()} REGISTRADO (A) EXITOSAMENTE`
            : messageOperation.toUpperCase();

          showToast("success", messageCreate);
          navigate(`/personas/${nombreGrupo}`);
        }
      } else {
        showToast("error", messageOperation || "Error al registrar la persona");
        return;
      }
    } catch (error) {
      console.error("Error al registrar la persona", error);
      showToast("error", "Error al registrar la persona");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let listTipoDocumentos: DetalleParametro[] = [];

        const filters: DetalleParametroFilters = {
          parametro_clase: ParametroClase.TIPO_DOCUMENTO,
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

            if (persona.id) {
              setIdPersona(persona.id);
            }

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
      <Card className="shadow-xl border-none bg-white">
        <CardHeader className="border-b border-gray-100 p-6 flex flex-row items-center justify-between bg-gray-50/50 rounded-t-xl">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {isEditMode
                ? `Editar ${nombreGrupo}`
                : `Nuevo Registro de ${nombreGrupo}`}
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              {isEditMode
                ? `Actualización de información de ${nombreGrupo}`
                : `Complete la información para registrar un ${nombreGrupo}`}
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

        <CardContent className="px-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">
                    01
                  </span>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Información Personal
                  </h3>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                <FormField
                  control={form.control}
                  name="idTipoDocumento"
                  render={({ field, fieldState }) => (
                    <FormItem className="flex flex-col">
                      <RequiredLabel>Tipo de Documento</RequiredLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={`
                              w-full w-full-important
                              ${
                                fieldState.invalid
                                  ? "border-red-500 focus:ring-red-200"
                                  : "focus:ring-blue-200 transition-shadow"
                              }
                            `}
                          >
                            <SelectValue placeholder="Seleccionar..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tipoDocumentos.map((tipo) => (
                            <SelectItem
                              value={tipo.codigo!.toString()}
                              key={tipo.codigo!.toString()}
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
                      <RequiredLabel>N° de documento</RequiredLabel>
                      <FormControl>
                        <Input
                          placeholder="12345678"
                          autoComplete="off"
                          maxLength={8}
                          {...field}
                          onKeyDown={async (e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              try {
                                showToast("success", "Buscando datos");

                                const idTipoDocumento =
                                  form.getValues("idTipoDocumento");
                                console.log({ idTipoDocumento });

                                const tipoDocumento =
                                  idTipoDocumento === "1" ? "DNI" : "CE";
                                console.log({ tipoDocumento });

                                const descGrupo = `grupo-${nombreGrupo}`;
                                console.log({ descGrupo });

                                const responsePersona = await getPersonaByApi(
                                  tipoDocumento,
                                  field.value,
                                  descGrupo,
                                );

                                console.log(
                                  "---- responsePersona PersonaForm ----",
                                );
                                console.log({ responsePersona });

                                const { result, data, message } =
                                  responsePersona;

                                if (result && data) {
                                  const persona = data as Persona;
                                  console.log("---- data persona ----");
                                  console.log({ persona });

                                  const {
                                    id,
                                    nombres,
                                    apellido_paterno,
                                    apellido_materno,
                                    fecha_nacimiento,
                                  } = persona;

                                  setIdPersona(id as number);

                                  form.setValue("nombres", nombres as string);
                                  form.setValue(
                                    "apellidoPaterno",
                                    apellido_paterno as string,
                                  );
                                  form.setValue(
                                    "apellidoMaterno",
                                    apellido_materno as string,
                                  );

                                  if (fecha_nacimiento) {
                                    const fechaNacimientoParsed =
                                      parseISO(fecha_nacimiento);
                                    form.setValue(
                                      "fechaNacimiento",
                                      fechaNacimientoParsed,
                                    );
                                  }

                                  setCamposHabilitados(false);
                                  showToast("success", message as string);
                                } else {
                                  setCamposHabilitados(true);
                                  showToast("warning", "No se encontraron ");
                                }
                              } catch (error) {
                                setCamposHabilitados(true);
                                showToast("error", "Error al crear persona");
                              }
                            }
                          }}
                          className={
                            fieldState.invalid
                              ? "border-red-500"
                              : "focus:ring-blue-200"
                          }
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
                          disabled={!camposHabilitados}
                          className={fieldState.invalid ? "border-red-500" : ""}
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
                          disabled={!camposHabilitados}
                          className={fieldState.invalid ? "border-red-500" : ""}
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
                          disabled={!camposHabilitados}
                          className={fieldState.invalid ? "border-red-500" : ""}
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
                            field.value ? format(field.value, "yyyy-MM-dd") : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseISO(e.target.value) : null,
                            )
                          }
                          className={fieldState.invalid ? "border-red-500" : ""}
                          disabled={!camposHabilitados}
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
                      <RequiredLabel>Correo electrónico</RequiredLabel>
                      <FormControl>
                        <Input
                          placeholder="maria.lopez@empresa.com"
                          autoComplete="off"
                          maxLength={60}
                          {...field}
                          className={fieldState.invalid ? "border-red-500" : ""}
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
                    <FormItem className="flex flex-col">
                      <RequiredLabel>Sexo</RequiredLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={`
                              w-full w-full-important
                              ${
                                fieldState.invalid
                                  ? "border-red-500 focus:ring-red-200"
                                  : "focus:ring-blue-200 transition-shadow"
                              }
                            `}
                          >
                            <SelectValue placeholder="Seleccionar..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-400 placeholder-gray-400">
                          <SelectItem value="F" key="F">
                            Femenino
                          </SelectItem>
                          <SelectItem value="M" key="M">
                            Masculino
                          </SelectItem>
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
                          className={fieldState.invalid ? "border-red-500" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 transition-all active:scale-95"
                >
                  {isSubmitting ? (
                    <Spinner className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isEditMode ? "Actualizar Datos" : "Confirmar Registro"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => resetForm()}
                  className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};
