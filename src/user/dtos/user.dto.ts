import { OmitType, PartialType } from '@nestjs/mapped-types';
import { UserPermission, UserType, Image, UserInterestedActivity, UserCreatedActivities, /*UserInEvent*/ } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer'
import { Contains, IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Matches, MinLength } from 'class-validator'


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
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'Password must have special chars and Uppercase letters' })
    password: string
}

export class UpdateUserDto extends OmitType(PartialType(CreateUserDto), [
    'email', 'password',
] as const) { }

export class PassChangeDto {
    @IsString()
    password: string
    @IsString()
    @MinLength(8)
    newPassword: string
}


export class loginDto {
    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsString()
    @MinLength(8)
    password: string
}

export class AuthUserResponseDto {
    token: string
    user: UserResponseDto

    constructor(token: string, user: Partial<UserResponseDto>) {
        this.token = token;
        this.user = new UserResponseDto(user)
    }
}

export class UserResponseDto {

    @Expose({ name: 'id' })
    get getId() {
        return this.id.toString()
    }
    @Expose({ name: "profilePicUrl" })
    get getProfilePicUrl() {

        return this.profilePic?.url ? this.profilePic.url : undefined
    }
    userPermission: UserPermission
    userType: UserType
    name: String
    lastName: String


    @Exclude()
    id: number

    @Exclude()
    email: String
    @Exclude()
    phone: String
    @Exclude()
    avRating: number
    @Exclude()
    isDeleted: Date
    @Exclude()
    password: String
    @Exclude()
    createdAt: Date
    @Exclude()
    updatedAt: Date
    @Exclude()
    profilePicId: number
    @Exclude()
    profilePic: Image
    @Exclude()
    interestedIn: UserInterestedActivity[]
    @Exclude()
    created: UserCreatedActivities[]
    // @Exclude()
    // enrolledIn: UserInEvent[]


    constructor(data: Partial<UserResponseDto>) {
        Object.assign(this, data)
    }
}