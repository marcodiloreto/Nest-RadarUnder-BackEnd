import { SetMetadata } from "@nestjs/common"
import { UserPermission } from "@prisma/client"


export function Roles(...roles: UserPermission[]) {
    return SetMetadata('roles', roles)
}