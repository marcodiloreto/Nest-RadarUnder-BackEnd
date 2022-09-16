import { SetMetadata } from "@nestjs/common"
import { UserType } from "@prisma/client"


export function Roles(...roles: UserType[]) {
    return SetMetadata('roles', roles)
}