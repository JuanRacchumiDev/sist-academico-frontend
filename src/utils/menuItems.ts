import {
    Briefcase,
    LayoutDashboard,
    Settings,
    User2Icon,
    UserCheck
} from "lucide-react"

export const MENU_ITEMS = [
    {
        id: "dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
        active: true,
        badge: "New",
        path: "/dashboard"
    },
    {
        id: "alumno",
        icon: User2Icon,
        label: "Alumno",
        active: false,
        path: "/personas/alumno"
    },
    {
        id: "programa-academico",
        icon: User2Icon,
        label: "Programa",
        active: false,
        path: "/programa-academico"
    },
    {
        id: "modulo",
        icon: User2Icon,
        label: "Módulo",
        active: false,
        path: "/modulo"
    },
    {
        id: "matricula",
        icon: User2Icon,
        label: "Matrícula",
        active: false,
        path: "/matricula"
    },
    {
        id: "promotor",
        icon: User2Icon,
        label: "Promotor",
        active: false,
        path: "/personas/promotor"
    },
    {
        id: "cobrador",
        icon: User2Icon,
        label: "Cobrador",
        active: false,
        path: "/personas/cobrador"
    },
    // {
    //     id: "evento",
    //     icon: UserCheck,
    //     label: "Evento",
    //     active: false,
    //     path: "/evento"
    // },
    // {
    //     id: "certificado",
    //     icon: UserCheck,
    //     label: "Certificado",
    //     active: false,
    //     path: "/certificado"
    // },
    {
        id: "usuario",
        icon: UserCheck,
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
                icon: Briefcase,
                path: "/mantenimiento/segmento"
            },
            // {
            //     id: "tipo-evento",
            //     label: "Tipo evento",
            //     icon: Briefcase,
            //     path: "/mantenimiento/tipo-evento"
            // },
            // {
            //     id: "tipo-certificado",
            //     label: "Tipo certificado",
            //     icon: Briefcase,
            //     path: "/mantenimiento/tipo-certificado"
            // },
            // {
            //     id: "categoria-evento",
            //     label: "Categoría evento",
            //     icon: Briefcase,
            //     path: "/mantenimiento/categoria-evento"
            // },
            {
                id: "tipo-documento",
                label: "Tipo Documento",
                icon: Briefcase,
                path: "/mantenimiento/tipo-documento"
            },
            {
                id: "sede",
                label: "Sede",
                icon: Briefcase,
                path: "/mantenimiento/sede"
            },
            {
                id: "universidad",
                label: "Universidad",
                icon: Briefcase,
                path: "/mantenimiento/universidad"
            },
            {
                id: "metodo-pago",
                label: "Método de pago",
                icon: Briefcase,
                path: "/mantenimiento/metodo-pago"
            },
            // {
            //     id: "moneda",
            //     label: "Moneda",
            //     icon: Briefcase,
            //     path: "/mantenimiento/moneda"
            // }
            {
                id: "banco-cuenta",
                label: "Cuentas",
                icon: Briefcase,
                path: "/mantenimiento/banco-cuenta"
            }
        ]
    }
]