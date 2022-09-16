import { } from 'class-transformer'
import { Contains, IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator'


export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string
    @IsString()
    @IsOptional()
    lastName?: string
    @IsOptional()
    @IsPhoneNumber('AR', { message: 'phone must be a valid phone number' })
    phone?: string
    @IsEmail()
    @IsNotEmpty()
    email: string
    @IsString()
    @MinLength(8)
    password: string
    @IsString()
    @IsOptional()
    profilePic?: string

}

export class loginDto {
    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsString()
    @MinLength(8)
    password: string
}