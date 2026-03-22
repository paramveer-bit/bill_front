import { toast } from "sonner";

export const showErrorToast = (message: string) => {
    toast.error(message, {
        position: "top-center",
        className: "group !bg-white !border-2 !border-red-500 !rounded-lg !shadow-[8px_8px_0px_0px_rgba(239,68,68,0.2)] !p-4 !flex !items-center !gap-3",
        classNames: {
            title: "!text-red-600 !font-semibold !text-sm",
            icon: "!text-red-500",
        },
    });
};