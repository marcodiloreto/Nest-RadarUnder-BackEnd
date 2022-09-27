import { Body, Controller, Get, Header, Headers, HttpCode, Post, PreconditionFailedException } from '@nestjs/common';
import { UserPermission } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { User } from '../decorator/user.decorator';
import { AuthUserResponseDto, CreateUserDto, loginDto } from '../dtos/auth.dto';
import { AuthService } from './auth.service';


@Controller('/auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Get()
    @Roles(UserPermission.NORMAL, UserPermission.ADMIN)
    async validateJWT(@User() user) {
        return await this.authService.validateJWT(user)
    }

    @Post('/register')
    createUser(@Body() body: CreateUserDto, @User() user): Promise<AuthUserResponseDto> {
        if (user) throw new PreconditionFailedException('you have to logout to register a new user')
        return this.authService.createUser(body)
    }

    @Post('/login')
    @HttpCode(200)
    async login(@Body() { email, password }: loginDto, @User() user): Promise<AuthUserResponseDto> {
        if (user) throw new PreconditionFailedException('you have to logout to login with another user')
        return this.authService.login(email, password)
    }


}
