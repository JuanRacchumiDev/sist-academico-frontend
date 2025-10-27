export interface IToastProps {
    type: "success" | "error" | "warning";
    message: string;
    onClose?: () => void
}