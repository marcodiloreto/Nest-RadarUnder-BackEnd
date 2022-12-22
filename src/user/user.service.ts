import { Injectable, NotFoundException, UseFilters } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {

    constructor(private readonly prisma: PrismaService) { }
    //TODO: quien usa esto?
    //TODO: subir foto perfil / cambiar foto perfil
    async findUserByEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                email
            }
        })

        if (!user) throw new NotFoundException('No se encontró un usuario registrado con ese Email')
        return user;
    }

    async findUserById(id: number) {
        const user = await this.prisma.user.findUnique({
            where: {
                id
            }
        })

        if (!user) throw new NotFoundException('No se encontró un usuario registrado con ese Id')
        return user;
    }
}
