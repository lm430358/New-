import { NextResponse, type NextRequest } from "next/server";

/**
 * Protects the trading dashboard and its APIs with a password (HTTP Basic auth).
 * Exempt: the Twilio webhook (signature-checked), approval links and their API
 * (per-proposal secret token), and the scanner when called with the cron secret.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname === "/api/trading/sms" ||
    pathname.startsWith("/trading/approve/") ||
    pathname.startsWith("/api/trading/proposals/")
  ) {
    return NextResponse.next();
  }

  const auth = request.headers.get("authorization") ?? "";
  const cronSecret = process.env.TRADING_CRON_SECRET;
  if (pathname === "/api/trading/scan" && cronSecret && auth === `Bearer ${cronSecret}`) {
    return NextResponse.next();
  }

  const password = process.env.TRADING_ADMIN_PASSWORD;
  if (!password) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Set TRADING_ADMIN_PASSWORD to use the trading dashboard.", { status: 503 });
    }
    return NextResponse.next(); // local development
  }

  if (auth.startsWith("Basic ")) {
    try {
      const decoded = atob(auth.slice(6));
      if (decoded.slice(decoded.indexOf(":") + 1) === password) return NextResponse.next();
    } catch {
      /* fall through */
    }
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Trading"' },
  });
}

export const config = {
  matcher: ["/trading/:path*", "/api/trading/:path*"],
};
