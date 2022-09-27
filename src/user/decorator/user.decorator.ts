import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { UserPermission } from '@prisma/client'

export interface IUser {
    id: number, name: string, type: UserPermission, iat: number, exp: number
}

export const User = createParamDecorator((data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user;
})