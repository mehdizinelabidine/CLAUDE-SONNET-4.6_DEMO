import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "./public.decorator";

const MOCK_USERS = [
  {
    id: "mock-admin-001",
    name: "Admin User",
    email: "admin@company.com",
    role: "admin",
  },
  {
    id: "mock-emp-001",
    name: "Alice Johnson",
    email: "alice@company.com",
    role: "employee",
  },
  {
    id: "mock-emp-002",
    name: "Bob Smith",
    email: "bob@company.com",
    role: "employee",
  },
];

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly isMockMode: boolean;

  constructor(private reflector: Reflector) {
    this.isMockMode = !process.env.CLERK_SECRET_KEY;
    if (this.isMockMode) {
      console.log("⚠️  Running in MOCK AUTH mode - no Clerk keys detected");
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();

    if (this.isMockMode) {
      return this.handleMockAuth(request);
    }

    return this.handleClerkAuth(request);
  }

  private handleMockAuth(request: any): boolean {
    const mockUserId = request.headers["x-mock-user-id"] || "mock-admin-001";
    const user = MOCK_USERS.find((u) => u.id === mockUserId) ?? MOCK_USERS[0];
    request.user = user;
    return true;
  }

  private async handleClerkAuth(request: any): Promise<boolean> {
    const authHeader = request.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing Bearer token");
    }

    const token = authHeader.split(" ")[1];

    try {
      // Dynamic import to avoid hard dependency when in mock mode
      const { verifyToken } = await import("@clerk/backend");
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });

      request.user = {
        id: payload.sub,
        clerkUserId: payload.sub,
        role: (payload as any).publicMetadata?.role ?? "employee",
      };
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
