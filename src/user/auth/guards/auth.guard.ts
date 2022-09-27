import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserPermission, UserType } from '@prisma/client';
import * as jwt from 'jsonwebtoken'

interface JWTPayload {
    id: number;
    name: string;
    userPermission: UserPermission;
    userType: UserType
    iat: number;
    exp: number;
}
@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext) {
        const roles = this.reflector.getAllAndOverride('roles', [
            context.getHandler(),
            context.getClass()
        ]) as UserPermission[]

        if (!roles?.length) return true;

        const userKey = context.switchToHttp().getRequest().headers?.authorization?.split('Bearer ')[1]

        try {
            const user = jwt.verify(userKey, process.env.JWT_SECRET) as JWTPayload
            if (roles.includes(user.userPermission)) return true
        } catch (error) {
            console.log(error)
            return false
        }
        return false
    }
}