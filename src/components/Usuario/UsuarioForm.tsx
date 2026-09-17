import React, { useEffect, useState } from "react";
import { UserPlus, ArrowLeft, Save, XCircle } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RequiredLabel } from "../Common/RequiredLabel";
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
import { DetalleParametro } from "../../interfaces/IDetalleParametro";
import { Persona } from "../../interfaces/IPersona";
import { Usuario, UsuarioResponse } from "../../interfaces/IUsuario";
import { ParametroClase } from "@/params/parametroClase";
import { getDetalles } from "@/services/detalleParametroService";
import { getPersonas, getPersonaById } from "@/services/personaService";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "../../context/ToastContext";
import { Spinner } from "../../components/Common/Spinner";
import {
  createUsuario,
  getUsuarioById,
  updateUsuario,
} from "@/services/usuarioService";
import { generateUsername } from "@/utils/stringUtils";
import SearchableCombobox from "../Common/SearchableCombobox";

const loadPerfiles = async () => {
  let dataPerfiles: DetalleParametro[] = [];

  const queryParams = `parametro_clase=${ParametroClase.PERFIL}&en_persona=false&en_empresa=false&estado=true`;

  const response = await getDetalles(queryParams);

  const { result, data } = response;

  if (result && data) {
    dataPerfiles = data as DetalleParametro[];
  }

  return dataPerfiles;
};

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

const getPersona = async (idPersona: number | string) => {
  let persona: Persona = null;

  const response = await getPersonaById(+idPersona);
  const { result, data } = response;

  if (result && data) {
    persona = data as Persona;
  }

  return persona;
};

export const formSchema = z.object({
  codigoPerfil: z
    .string({
      message: "El perfil es requerido",
    })
    .min(1, "El perfil es requerido"),
  idGrupoPersona: z
    .string({
      message: "El grupo es requerido",
    })
    .min(1, "El grupo es requerido"),
  idPersona: z
    .string({
      message: "La persona es requerida",
    })
    .min(1, "La persona es requerida"),
  name: z.string().min(6, {
    message: "El nombre de usuario es requerido (mínimo 6 caracteres)",
  }),
  email: z.string().email({
    message: "Por favor ingrese un correo válido",
  }),
});

type TFormValues = z.infer<typeof formSchema>;

const defaultValues: TFormValues = {
  idGrupoPersona: "",
  codigoPerfil: "",
  idPersona: "",
  name: "",
  email: "",
};

export const UsuarioForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  // Estados
  const [grupoPersonas, setGrupoPersonas] = useState<DetalleParametro[]>([]);
  const [perfiles, setPerfiles] = useState<DetalleParametro[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [definePassword, setDefinePassword] = useState<string>("");

  // Estados de carga
  const [isLoadingPersonas, setIsLoadingPersonas] = useState(false);

  const isEditMode = !!id;

  const inputErrorClass = (invalid: boolean) =>
    invalid
      ? "border-red-400 focus-visible:ring-red-400 bg-red-50/10 focus:border-red-400 text-sm"
      : "border-slate-200 focus-visible:ring-blue-600 focus:border-blue-600 text-slate-800 text-sm transition-colors";

  const handleGoBack = () => {
    navigate(`/usuario`);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const resetForm = () => {
    form.reset(defaultValues);
  };

  // Suscripción a cambios del grupo seleccionado
  const selectedGrupoId = useWatch({
    control: form.control,
    name: "idGrupoPersona",
  });

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
      // console.log({ nombreGrupo });

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

  const selectedPersona = async (idPersona: string) => {
    form.setValue("idPersona", idPersona, { shouldValidate: true });

    if (!idPersona) {
      form.setValue("name", "");
      form.setValue("email", "");
      return;
    }

    try {
      const persona = await getPersona(idPersona);

      if (!persona) return;

      const { nombres, apellido_paterno, apellido_materno, email } = persona;

      const usernameSugerido = generateUsername({
        nombres,
        apellidoPaterno: apellido_paterno,
        apellidoMaterno: apellido_materno,
      });

      // console.log({ usernameSugerido });

      form.setValue("name", usernameSugerido, { shouldValidate: true });

      if (email) {
        form.setValue("email", email, { shouldValidate: true });
      } else {
        form.setValue("email", "", { shouldValidate: true });
      }

      setDefinePassword(email || "");
      showToast("success", `Datos de ${persona.nombre_completo} cargados`);
    } catch (error) {
      console.error(error);
      showToast(
        "error",
        "No se pudo obtener el detalle de la persona seleccionada.",
      );
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listGrupoPersonas, listPerfiles] = await Promise.all([
          loadGrupoPersonas(),
          loadPerfiles(),
        ]);

        setGrupoPersonas(listGrupoPersonas);
        setPerfiles(listPerfiles);

        if (isEditMode && id) {
          const responseUsuario = await getUsuarioById(+id);

          const { result, data } = responseUsuario;

          if (result && data) {
            const usuario = data as Usuario;

            console.log({ usuario });

            const {
              persona: { grupos },
            } = usuario;

            const grupo = grupos as DetalleParametro[];

            const idGrupo = grupo[0].codigo;

            form.reset({
              idGrupoPersona: idGrupo.toString() ?? "",
              codigoPerfil: usuario.codigo_perfil?.toString() ?? "",
              idPersona: usuario.id_persona?.toString() ?? "",
              name: usuario.name ?? "",
              email: usuario.email ?? "",
            });
          }
        }
      } catch (error) {
        console.error("Error al cargar los catálogos formulario", error);
        showToast("error", "Error al cargar los catálogos del formulario.");
      }
    };

    fetchData();
  }, [id]);

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: TFormValues) => {
    try {
      const { name, email, codigoPerfil, idPersona } = values;

      const payload: Usuario = {
        name,
        email,
        codigo_perfil: +codigoPerfil,
        id_persona: +idPersona,
        ...(!isEditMode && { password: definePassword }),
        estado: true,
      };

      console.log({ payload });

      const response = isEditMode
        ? await updateUsuario(+id, payload)
        : await createUsuario(payload);

      const { result, message } = response as UsuarioResponse;

      if (result) {
        showToast(
          "success",
          message ||
            `Usuario ${isEditMode ? "actualizado" : "registrado"} con éxito`,
        );
        navigate("/usuario");
      } else {
        showToast("error", message || "Error al procesar el usuario");
      }
    } catch (error) {
      console.error("Error en submit de usuario", error);
      showToast(
        "error",
        "Ocurrió un error inesperado al procesar el formulario.",
      );
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Encabezado */}
      <div className="bg-slate-50/50 border-b border-slate-100 p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
            <UserPlus className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-base font-semibold text-slate-800 tracking-tight">
              {isEditMode ? "Editar Usuario" : "Registrar Nuevo Usuario"}
            </h3>
            <p className="text-[11px] text-slate-500 font-normal">
              Crea una cuenta e introduce los accesos correspondientes.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          type="button"
          disabled={isSubmitting}
          onClick={handleGoBack}
          className="border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg px-3 h-8 text-xs font-medium transition-colors shadow-none flex items-center"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
          Volver
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* SECCIÓN 1: Selección de Persona */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1.5">
              Información Personal
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Grupo Persona */}
              <FormField
                control={form.control}
                name="idGrupoPersona"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1 w-full">
                    <RequiredLabel>Grupo Persona</RequiredLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        form.setValue("idPersona", "");
                        form.setValue("name", "");
                        form.setValue("email", "");
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={`h-9 rounded-lg shadow-none text-xs w-full text-left ${inputErrorClass(
                            !!form.formState.errors.idGrupoPersona,
                          )}`}
                        >
                          <SelectValue placeholder="Seleccione un grupo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="w-full rounded-lg shadow-md border-slate-200 max-h-52">
                        {grupoPersonas.map((grupo) => (
                          <SelectItem
                            value={grupo.codigo!.toString()}
                            key={grupo.codigo}
                            className="cursor-pointer text-xs focus:bg-slate-50 rounded-md py-1.5"
                          >
                            {grupo.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[11px] text-red-500 font-medium" />
                  </FormItem>
                )}
              />

              {/* Persona / Alumno */}
              <FormField
                control={form.control}
                name="idPersona"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col gap-1 w-full">
                    <RequiredLabel>Alumno / Persona</RequiredLabel>
                    <SearchableCombobox<Persona>
                      placeholder={
                        isLoadingPersonas
                          ? "Cargando personas..."
                          : "Seleccione una persona..."
                      }
                      options={personas}
                      value={field.value}
                      onChange={(selectedId) => selectedPersona(selectedId)}
                      displayKey="nombre_completo"
                      valueKey="id"
                      searchKeys={["nombre_completo"]}
                      isInvalid={fieldState.invalid}
                      disabled={!selectedGrupoId || isLoadingPersonas}
                      renderOption={(alumno) => (
                        <span className="font-semibold text-gray-900 text-xs">
                          {alumno.nombre_completo}
                        </span>
                      )}
                    />
                    <FormMessage className="text-[11px] text-red-500 font-medium" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* SECCIÓN 2: Datos de Cuenta y Perfil */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1.5">
              Datos de Cuenta y Perfil
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Perfil */}
              <FormField
                control={form.control}
                name="codigoPerfil"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col gap-1 w-full">
                    <RequiredLabel>Perfil de Usuario</RequiredLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={`h-9 rounded-lg shadow-none w-full text-left text-xs ${inputErrorClass(
                            fieldState.invalid,
                          )}`}
                        >
                          <SelectValue placeholder="Seleccionar perfil..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-lg shadow-md border-slate-200 max-h-52">
                        {perfiles.map((perfil) => (
                          <SelectItem
                            value={perfil.codigo!.toString()}
                            key={perfil.codigo!.toString()}
                            className="cursor-pointer text-xs focus:bg-slate-50 rounded-md py-1.5"
                          >
                            {perfil.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[11px] text-red-500 font-medium" />
                  </FormItem>
                )}
              />

              {/* Nombre de Usuario */}
              <FormField
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col gap-1 w-full">
                    <RequiredLabel>Nombre de Usuario</RequiredLabel>
                    <FormControl>
                      <Input
                        placeholder="jperez"
                        autoComplete="off"
                        maxLength={30}
                        {...field}
                        value={field.value ?? ""}
                        className={`h-9 rounded-lg shadow-none placeholder:text-slate-400 text-xs ${inputErrorClass(
                          fieldState.invalid,
                        )}`}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px] text-red-500 font-medium" />
                  </FormItem>
                )}
              />

              {/* Email (Ahora ocupa 1 sola columna estándar, igual a Nombre de Usuario y Perfil) */}
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col gap-1 w-full">
                    <RequiredLabel>Email</RequiredLabel>
                    <FormControl>
                      <Input
                        placeholder="jperez@gmail.com"
                        autoComplete="off"
                        maxLength={60}
                        {...field}
                        value={field.value ?? ""}
                        className={`h-9 rounded-lg shadow-none placeholder:text-slate-400 text-xs ${inputErrorClass(
                          fieldState.invalid,
                        )}`}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px] text-red-500 font-medium" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Botones de acción inferiores */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={() => resetForm()}
              className="w-full sm:w-auto h-9 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium px-4 text-xs transition-colors shadow-none"
            >
              <XCircle className="h-3.5 w-3.5 mr-1.5" />
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 text-xs font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none shadow-none"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-1.5 h-3.5 w-3.5 animate-spin text-white" />
                  Procesando...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  {isEditMode ? "Actualizar Datos" : "Confirmar Registro"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
