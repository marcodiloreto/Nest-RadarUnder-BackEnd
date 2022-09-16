import { Injectable, NotFoundException, UseFilters } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {

    constructor(private readonly prisma: PrismaService) { }

    async findUserByEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                email
            }
        })

        if (!user) throw new NotFoundException('No se encontró un usuario registrado con ese Email')
        return user;
    }
}
