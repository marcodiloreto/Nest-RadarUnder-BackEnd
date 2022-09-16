import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { UserType } from '@prisma/client'

export interface IUser {
    id: number, name: string, type: UserType, iat: number, exp: number
}

export const User = createParamDecorator((data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user;
})