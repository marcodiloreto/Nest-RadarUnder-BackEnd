import { Injectable, NotFoundException, UseFilters } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

interface UpdateData {
    name?: string,
    lastName?: string,
    phone?: string
}

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
            },
            include: {
                profilePic: true
            }
        })

        if (!user) throw new NotFoundException('No se encontró un usuario registrado con ese Id')
        return user;
    }

    async getUserDetails(id: number) {
        return this.prisma.user.findUnique({
            where: { id, },
            select: {
                name: true,
                lastName: true,
                phone: true,
            }

        })
    }

    async updateUserData(id: number, data: UpdateData) {

        try {
            await this.prisma.user.update({
                where: { id },
                data,
            })

            return true
        } catch (e) {
            return false
        }
    }
}
