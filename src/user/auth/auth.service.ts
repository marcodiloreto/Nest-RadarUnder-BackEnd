import { ConflictException, Injectable, PreconditionFailedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs'
import { UserPermission, User, UserType } from '@prisma/client';
import * as jwt from 'jsonwebtoken'
import { AuthUserResponseDto, UserResponseDto } from '../dtos/auth.dto';
import { UserService } from '../user.service';


interface CreateUserData {
    name: string
    lastName?: string
    email: string
    phone?: string
    password: string

}
@Injectable()
export class AuthService {

    constructor(private readonly prismaService: PrismaService, private readonly userService: UserService) { }
    //TODO: esto en realidad es createLocalUser. Faltan los otros create
    async createUser({ name, lastName, password, email, phone }: CreateUserData): Promise<AuthUserResponseDto> {

        const exists = await this.prismaService.user.findFirst({
            where: {
                OR: [{
                    email
                },
                {
                    phone
                }]
            }
        })
        if (exists) {
            throw new ConflictException(exists.email === email ? "Ese Email ya está en uso" : "Ese teléfono ya está en uso")
        }

        const passHash = await bcrypt.hash(password, 10)
        const createdUser = await this.prismaService.user.create({
            data: {
                name,
                email,
                password: passHash,
                ...(lastName && { lastName }),
                ...(phone && { phone }),
                userType: 'LOCAL',
                userPermission: UserPermission.NORMAL,
            },

        });
        const token = this.generateJWT(createdUser)
        return new AuthUserResponseDto(token, createdUser)
    }

    async login(email, password): Promise<AuthUserResponseDto> {
        const user = await this.prismaService.user.findUnique({
            where: {
                email,
            },
        })
        if (!user) throw new PreconditionFailedException('Ese usuario no existe')

        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) throw new PreconditionFailedException('Contraseña incorrecta')

        const token = this.generateJWT(user)

        return new AuthUserResponseDto(token, user)
    }

    async validateJWT(user: { id: number, name: string, userPermission: UserPermission, userType: UserType }) {
        const userData = await this.userService.findUserById(user.id)
        const token = this.generateJWT(user)

        return new AuthUserResponseDto(token, userData)
    }
    generateJWT(user: { id: number, name: string, userPermission: UserPermission, userType: UserType }) {
        return jwt.sign({
            id: user.id,
            name: user.name,
            userPermission: user.userPermission,
            userType: user.userType
        },
            process.env.JWT_SECRET, {
            expiresIn: 604800
        })
    }
}
