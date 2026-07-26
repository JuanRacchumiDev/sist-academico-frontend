import {
    Home,
    UserIcon,
    BookOpen,
    GraduationCap,
    Settings,
    Award,
    CreditCard,
    Paperclip,
    UserCog,
    Layers,
    FileCheck
} from "lucide-react";

export const ADMIN_MENU_ITEMS = [
    {
        id: "dashboard",
        icon: Home,
        label: "Dashboard",
        active: true,
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
        icon: CreditCard,
        label: "Pago",
        active: false,
        path: "/pago"
    },
    {
        id: "adjunto",
        icon: Paperclip,
        label: "Adjunto",
        active: false,
        path: "/adjunto"
    },
    {
        id: "certificado",
        icon: Award, // Cambiado de Paperclip a Award para ser único
        label: "Certificado",
        active: false,
        path: "/certificado"
    },
    {
        id: "usuario",
        icon: UserCog,
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
                icon: Layers,
                path: "/mantenimiento/segmento"
            },
            {
                id: "tipo-documento",
                label: "Tipo Documento",
                icon: FileCheck,
                path: "/mantenimiento/tipo-documento"
            }
        ]
    }
];

export const ALUMNO_MENU_ITEMS = [
    {
        id: "dashboard-alumno",
        icon: Home,
        label: "Dashboard",
        active: true,
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