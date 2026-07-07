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
import z, { email } from "zod";
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
    message: "El nombre de usuario es requerido",
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
    invalid ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500";

  const handleGoBack = () => {
    const urlBack = `/usuarios`;
    navigate(urlBack);
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
    const dataForm: TUsuario = {
      name: "",
      email: "",
      idPerfil: "",
      idPersona: "",
    };

    form.reset(dataForm);
  };

  const selectedPersona = async (idPersona: string) => {
    form.setValue("idPersona", idPersona, { shouldValidate: true });

    if (!idPersona) return;

    try {
      const persona = await getPersona(idPersona);
      console.log("---- obteniendo persona desde selectedPersona ----");
      console.log({ persona });
      const {
        nombres,
        apellido_paterno,
        apellido_materno,
        email,
        numero_documento,
      } = persona;

      const usernameSugerido = generateUsername({
        nombres,
        apellidoPaterno: apellido_paterno,
        apellidoMaterno: apellido_materno,
      });

      form.setValue("name", usernameSugerido, { shouldValidate: true });

      // Definiendo el valor de email en el formulario
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
      console.log({ values });

      const { name, email, idPerfil, idPersona } = values;

      const payload: Usuario = {
        name,
        email,
        id_perfil: +idPerfil,
        id_persona: +idPersona,
        ...(!isEditMode && { password: definePassword }),
      };

      console.log("payload new usuario");
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
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Encabezado del Formulario */}
      <div className="bg-slate-50 border-b border-slate-200 p-5 flex items-center gap-3">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <UserPlus className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Registrar Nuevo Usuario
          </h3>
          <p className="text-xs text-slate-500">
            Crea una cuenta e introduce los accesos correspondientes.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <FormField
              control={form.control}
              name="idPerfil"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col">
                  <RequiredLabel>Perfil</RequiredLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={`${inputErrorClass(fieldState.invalid)} w-full w-full-important`}
                      >
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {perfiles.map((perfil) => (
                        <SelectItem
                          value={perfil.codigo!.toString()}
                          key={perfil.codigo!.toString()}
                        >
                          {perfil.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <FormField
              control={form.control}
              name="idPersona"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col">
                  <RequiredLabel>Persona</RequiredLabel>
                  <Select
                    onValueChange={selectedPersona}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={`${inputErrorClass(fieldState.invalid)} w-full w-full-important`}
                      >
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {personas.map((persona) => (
                        <SelectItem
                          value={persona.id!.toString()}
                          key={persona.id!.toString()}
                        >
                          {persona.nombre_completo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <RequiredLabel>Nombre de usuario</RequiredLabel>
                  <FormControl>
                    <Input
                      placeholder="jperez"
                      autoComplete="off"
                      maxLength={10}
                      {...field}
                      value={field.value ?? ""}
                      className={inputErrorClass(fieldState.invalid)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <RequiredLabel>Email</RequiredLabel>
                  <FormControl>
                    <Input
                      placeholder="jperez@gmail.com"
                      autoComplete="off"
                      maxLength={60}
                      {...field}
                      value={field.value ?? ""}
                      className={inputErrorClass(fieldState.invalid)}
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
    </div>
  );
};
