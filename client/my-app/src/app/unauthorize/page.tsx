export default function UnauthorizedPage() {
    return (
        <div className="flex h-screen flex-col items-center justify-center">
            <h1 className="text-3xl font-bold text-red-600">
                401 - Unauthorized
            </h1>
            <p className="mt-4 text-gray-600">
                Bạn không có quyền truy cập. Vui lòng đăng nhập lại.
            </p>
        </div>
    );
}
