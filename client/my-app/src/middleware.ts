import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ⚡️ Middleware chỉ chạy trên những route cần bảo vệ
export const config = {
    matcher: ["/home/:path*", "/profile/:path*", "/settings/:path*"],
};

export function middleware(request: NextRequest) {
    // Lấy token từ cookie (nếu bạn lưu bằng cookie)
    const token = request.cookies.get("access_token")?.value;

    // ❗ Nếu bạn không dùng cookie mà dùng localStorage (client side)
    // thì middleware sẽ KHÔNG đọc được => chỉ nên redirect ở phía client.

    // 👉 Nếu token không tồn tại => redirect sang trang login
    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // ✅ Nếu có token => cho phép truy cập
    return NextResponse.next();
}
