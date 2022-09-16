import { ConflictException, Injectable, PreconditionFailedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs'
import { UserType, User } from '@prisma/client';
import * as jwt from 'jsonwebtoken'


interface CreateUserData {
    name: string
    lastName?: string
    email: string
    phone?: string
    password: string
    profilePic?: string
}

@Injectable()
export class AuthService {

    constructor(private readonly prisma: PrismaService) { }

    async createUser({ name, lastName, password, email, phone, profilePic }: CreateUserData) {

        const exists = await this.prisma.user.findFirst({
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

        const image = (profilePic &&
            await this.prisma.image.create({
                data: {
                    url: profilePic
                }
            })
        )

        const passHash = await bcrypt.hash(password, 10)
        const createdUser = await this.prisma.user.create({
            data: {
                name,
                email,
                password: passHash,
                lastName,
                phone,
                userType: UserType.NORMAL,
                ...(image && { profilePicId: image.id })
            }
        });
        return this.generateJWT(createdUser)
    }

    async login(email, password) {
        const user = await this.prisma.user.findUnique({
            where: {
                email,
            }
        })
        if (!user) throw new PreconditionFailedException('Ese usuario no existe')

        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) throw new PreconditionFailedException('Contraseña incorrecta')

        return this.generateJWT(user);
    }


    generateJWT(user: User) {
        return jwt.sign({
            id: user.id,
            name: user.name,
            type: user.userType,
        },
            process.env.JWT_SECRET, {
            expiresIn: 36000
        })
    }
}
