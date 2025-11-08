import { toast, ToastOptions } from "react-toastify";

export enum NOTIFICATION_TYPE {
    SUCCESS = "success",
    ERROR = "error",
    INFO = "info",
}

export const DEFAULT_ERROR_MESSAGE =
    "Oops! Something went wrong. Please try again later.";

const defaultToastOptions: ToastOptions = {
    position: "bottom-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    progress: undefined,
    theme: "colored",
    style: { width: "100%", minWidth: "300px" },
};

export const notify = (
    type: NOTIFICATION_TYPE,
    message: string,
    options: Partial<ToastOptions> = {}
) => {
    if (type === NOTIFICATION_TYPE.ERROR) {
        toast.error(message, { ...defaultToastOptions, ...options });
    } else if (type === NOTIFICATION_TYPE.SUCCESS) {
        toast.success(message, { ...defaultToastOptions, ...options });
    } else if (type === NOTIFICATION_TYPE.INFO) {
        toast.info(message, { ...defaultToastOptions, ...options });
    }
};
