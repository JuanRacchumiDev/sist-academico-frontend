// /src/utils/menuItems.ts
import {
    Home,
    UserIcon,
    BookOpen,
    GraduationCap,
    Settings,
    Briefcase,
    Award,
    CreditCard,    // Nuevo: Ideal para Pagos / Transacciones
    Paperclip,     // Nuevo: Ideal para Archivos Adjuntos / Sílabos
    UserCog,       // Nuevo: Ideal para Usuarios / Credenciales del Sistema
    Layers,        // Nuevo: Ideal para Segmentos / Estructuras
    FileCheck      // Nuevo: Ideal para Tipo de Documento / Validaciones
} from "lucide-react";

export const ADMIN_MENU_ITEMS = [
    {
        id: "dashboard",
        icon: Home,
        label: "Dashboard",
        active: true,
        badge: "New",
        path: "/dashboard"
    },
    {
        id: "alumno",
        icon: UserIcon,
        label: "Alumno",
        active: false,
        path: "/personas/alumno"
    },
    {
        id: "programa-academico",
        icon: BookOpen,
        label: "Programa",
        active: false,
        path: "/programa-academico"
    },
    {
        id: "matricula",
        icon: GraduationCap,
        label: "Matrícula",
        active: false,
        path: "/matricula"
    },
    {
        id: "pago",
        icon: CreditCard, // Actualizado
        label: "Pago",
        active: false,
        path: "/pago"
    },
    {
        id: "adjunto",
        icon: Paperclip, // Actualizado
        label: "Adjunto",
        active: false,
        path: "/adjunto"
    },
    {
        id: "usuario",
        icon: UserCog, // Actualizado
        label: "Usuario",
        active: false,
        path: "/usuario"
    },
    {
        id: "mantenimiento",
        icon: Settings,
        label: "Mantenimiento",
        submenu: [
            {
                id: "segmento",
                label: "Segmento",
                icon: Layers, // Actualizado para no repetir con Tipo Documento
                path: "/mantenimiento/segmento"
            },
            {
                id: "tipo-documento",
                label: "Tipo Documento",
                icon: FileCheck, // Actualizado
                path: "/mantenimiento/tipo-documento"
            },
        ]
    }
];

export const ALUMNO_MENU_ITEMS = [
    {
        id: "dashboard-alumno",
        icon: Home,
        label: "Dashboard",
        active: true,
        badge: "New",
        path: "/dashboard-alumno"
    },
    {
        id: "mis-matriculas",
        icon: GraduationCap,
        label: "Mis Matrículas",
        path: "/mis-matriculas"
    },
    {
        id: "mis-certificados",
        icon: Award,
        label: "Mis Certificados",
        path: "/mis-certificados"
    }
];