import { Body, Controller, Post, PreconditionFailedException } from '@nestjs/common';
import { User } from '../decorator/user.decorator';
import { CreateUserDto, loginDto } from '../dtos/auth.dto';
import { AuthService } from './auth.service';


@Controller('/auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post('/register')
    createUser(@Body() body: CreateUserDto, @User() user) {
        if (user) throw new PreconditionFailedException('you have to logout to register a new user')
        return this.authService.createUser(body)
    }

    @Post('/login')
    login(@Body() { email, password }: loginDto, @User() user) {
        if (user) throw new PreconditionFailedException('you have to logout to login with another user')
        return this.authService.login(email, password)
    }


}
