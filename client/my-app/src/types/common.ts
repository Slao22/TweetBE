// src/types/api.types.ts
export type ApiResponse<T = any> = {
    message: string;
    result?: T;
    errors?: any;
};
export interface FieldError {
    type: string;
    value?: string;
    msg: string;
    path?: string;
    location?: string;
}

export interface ApiErrorType extends Error {
    /** Message từ backend hoặc Axios */
    message: string;
    /** HTTP status code (nếu có) */
    status?: number;
    /** Errors chi tiết (validation, v.v.) */
    errors?: Record<string, FieldError> | string | null;
}
