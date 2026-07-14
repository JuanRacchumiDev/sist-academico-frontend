import React, { useEffect, useState } from "react";
import {
  UserPlus,
  Mail,
  Lock,
  ShieldCheck,
  User,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  Save,
  XCircle,
} from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RequiredLabel } from "../Common/RequiredLabel";
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
import { DetalleParametro } from "../../interfaces/IDetalleParametro";
import { Persona } from "../../interfaces/IPersona";
import { Usuario, UsuarioResponse } from "../../interfaces/IUsuario";
import { DetalleParametroFilters } from "@/interfaces/IDetalleParametro";
import { ParametroClase } from "@/params/parametroClase";
import { getDetalleFiltered } from "@/services/detalleParametroService";
import { getPersonas, getPersonaById } from "@/services/personaService";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "../../context/ToastContext";
import { Spinner } from "../../components/Common/Spinner";
import { createUsuario, updateUsuario } from "@/services/usuarioService";
import { generateUsername } from "@/utils/stringUtils";

const loadPerfiles = async () => {
  let dataPerfiles: DetalleParametro[] = [];

  const filters: DetalleParametroFilters = {
    parametro_clase: ParametroClase.PERFIL,
    en_persona: false,
    en_empresa: false,
    estado: true,
  };

  const response = await getDetalleFiltered(filters);
  const { result, data } = response;
  if (result && data) {
    dataPerfiles = data as DetalleParametro[];
  } else {
    dataPerfiles = [];
  }

  return dataPerfiles;
};

const loadPersonas = async () => {
  let dataPersonas: Persona[] = [];

  const response = await getPersonas("grupo-alumno");
  const { result, data } = response;
  if (result && data) {
    dataPersonas = data as Persona[];
  } else {
    dataPersonas = [];
  }

  return dataPersonas;
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
  name: z.string().min(10, {
    message: "El nombre de usuario es requerido (mínimo 10 caracteres)",
  }),
  email: z.string().email({
    message: "Por favor ingrese un correo válido",
  }),
  idPerfil: z
    .string({
      message: "El perfil es requerido",
    })
    .min(1, "El perfil es requerido"),
  idPersona: z
    .string({
      message: "La persona es requerida",
    })
    .min(1, "La persona es requerida"),
});

type TFormValues = z.infer<typeof formSchema>;

type TUsuario = {
  name?: string;
  email?: string;
  idPerfil?: string;
  idPersona?: string;
};

export const UsuarioForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [perfiles, setPerfiles] = useState<DetalleParametro[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [definePassword, setDefinePassword] = useState<string>("");

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
    defaultValues: {
      name: "",
      email: "",
      idPerfil: "",
      idPersona: "",
    },
  });

  const resetForm = () => {
    form.reset({
      name: "",
      email: "",
      idPerfil: "",
      idPersona: "",
    });
  };

  const selectedPersona = async (idPersona: string) => {
    form.setValue("idPersona", idPersona, { shouldValidate: true });

    if (!idPersona) return;

    try {
      const persona = await getPersona(idPersona);
      const { nombres, apellido_paterno, apellido_materno, email } = persona;

      const usernameSugerido = generateUsername({
        nombres,
        apellidoPaterno: apellido_paterno,
        apellidoMaterno: apellido_materno,
      });

      form.setValue("name", usernameSugerido, { shouldValidate: true });

      if (email) {
        form.setValue("email", email, { shouldValidate: true });
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

  const { isSubmitting } = form.formState;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listPerfiles, listPersonas] = await Promise.all([
          loadPerfiles(),
          loadPersonas(),
        ]);

        setPerfiles(listPerfiles);
        setPersonas(listPersonas);
      } catch (error) {
        console.error("Error al cargar los catálogos formulario", error);
        showToast("error", "Error al cargar los catálogos del formulario.");
      }
    };

    fetchData();
  }, [id, form]);

  const onSubmit = async (values: TFormValues) => {
    try {
      const { name, email, idPerfil, idPersona } = values;

      const payload: Usuario = {
        name,
        email,
        id_perfil: +idPerfil,
        id_persona: +idPersona,
        ...(!isEditMode && { password: definePassword }),
      };

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
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Encabezado del Formulario - Botón "Volver" alineado y estilizado correctamente */}
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

      {/* Formulario */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium animate-in fade-in duration-200">
              {error}
            </div>
          )}

          <FormField
            control={form.control}
            name="idPerfil"
            render={({ field, fieldState }) => (
              <FormItem className="flex flex-col gap-1 w-full">
                <RequiredLabel>
                  <span className="text-xs font-medium text-slate-700">
                    Perfil
                  </span>
                </RequiredLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                >
                  <FormControl>
                    <SelectTrigger
                      className={`h-9 rounded-lg shadow-none w-full text-left ${inputErrorClass(fieldState.invalid)}`}
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
                <FormItem>
                  <FormMessage className="text-[11px] text-red-500 font-medium" />
                </FormItem>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="idPersona"
            render={({ field, fieldState }) => (
              <FormItem className="flex flex-col gap-1 w-full">
                <RequiredLabel>
                  <span className="text-xs font-medium text-slate-700">
                    Persona
                  </span>
                </RequiredLabel>
                <Select
                  onValueChange={selectedPersona}
                  value={field.value ?? ""}
                >
                  <FormControl>
                    <SelectTrigger
                      className={`h-9 rounded-lg shadow-none w-full text-left ${inputErrorClass(fieldState.invalid)}`}
                    >
                      <SelectValue placeholder="Seleccionar persona..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-lg shadow-md border-slate-200 max-h-52">
                    {personas.map((persona) => (
                      <SelectItem
                        value={persona.id!.toString()}
                        key={persona.id!.toString()}
                        className="cursor-pointer text-xs focus:bg-slate-50 rounded-md py-1.5"
                      >
                        {persona.nombre_completo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormItem>
                  <FormMessage className="text-[11px] text-red-500 font-medium" />
                </FormItem>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem className="flex flex-col gap-1 w-full">
                <RequiredLabel>
                  <span className="text-xs font-medium text-slate-700">
                    Nombre de usuario
                  </span>
                </RequiredLabel>
                <FormControl>
                  <Input
                    placeholder="jperez"
                    autoComplete="off"
                    maxLength={20}
                    {...field}
                    value={field.value ?? ""}
                    className={`h-9 rounded-lg shadow-none placeholder:text-slate-400 text-xs ${inputErrorClass(fieldState.invalid)}`}
                  />
                </FormControl>
                <FormMessage className="text-[11px] text-red-500 font-medium" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem className="flex flex-col gap-1 w-full">
                <RequiredLabel>
                  <span className="text-xs font-medium text-slate-700">
                    Email
                  </span>
                </RequiredLabel>
                <FormControl>
                  <Input
                    placeholder="jperez@gmail.com"
                    autoComplete="off"
                    maxLength={60}
                    {...field}
                    value={field.value ?? ""}
                    className={`h-9 rounded-lg shadow-none placeholder:text-slate-400 text-xs ${inputErrorClass(fieldState.invalid)}`}
                  />
                </FormControl>
                <FormMessage className="text-[11px] text-red-500 font-medium" />
              </FormItem>
            )}
          />

          {/* Botones de acción inferiores limpios */}
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
