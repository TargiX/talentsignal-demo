import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_ROUTE } from "../common/public.decorator";

@Injectable()
export class DemoAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ROUTE, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace("Bearer ", "");

    if (!token || token !== "demo-token") {
      throw new UnauthorizedException("Use Authorization: Bearer demo-token for the demo API.");
    }

    request.user = {
      id: "demo-user",
      email: "reviewer@talentsignal.app",
      name: "Reviewer"
    };
    return true;
  }
}
