import { Week } from "@prisma/client"
import { Type } from "class-transformer"
import { ArrayUnique, IsArray, IsDate, IsEmail, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from "class-validator"

export class AcivitySearchResponseDto {
    name: string
    ownersName: string[]
    rating: number
    address: string
    events: [] //añadir eventos
    maxQuota: number
    enrolled: number
    longitude: number
    latitude: number
}
export class CreateActivityDto {
    @IsString()
    @IsNotEmpty()
    name: string
    @IsString()
    @IsNotEmpty()
    description: string
    @IsNumber()
    @IsOptional()
    price?: number
    @IsDate()
    startDate: Date
    @IsDate()
    endDate?: Date
    @IsString()
    @IsNotEmpty()
    address: string
    @IsOptional()
    @IsPositive()
    @IsInt()
    maxQuota?: number
    @IsPositive()
    @IsInt()
    disciplineId: number

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Plan)
    plan: Plan[]
    @IsNumber()
    longitude: number
    @IsNumber()
    latitude: number
}

export class Plan {
    @IsDate()
    startTime: Date
    @IsDate()
    endTime: Date
    @ArrayUnique()
    @IsEnum(Week, { each: true })
    days: Week[]
}

export class UpdateActivityDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    description?: string
    @IsNumber()
    @IsOptional()
    price?: number
    @IsOptional()
    @IsDate()
    startDate?: Date
    @IsDate()
    @IsOptional()
    endDate?: Date
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    address?: string
    @IsOptional()
    @IsPositive()
    @IsInt()
    maxQuota?: number
    @IsPositive()
    @IsInt()
    @IsOptional()
    disciplineId?: number
    /*@IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Plan)
    plan?: Plan[]*/
    @IsNumber()
    @IsOptional()
    longitude?: number
    @IsNumber()
    @IsOptional()
    latitude?: number
}

export class addCreatorDto {
    @IsEmail()
    email: string
}