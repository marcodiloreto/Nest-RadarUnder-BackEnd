import { Activity, UserCreatedActivities, UserInterestedActivity, Week } from "@prisma/client"
import { Exclude, Expose, Type } from "class-transformer"
import { ArrayUnique, IsArray, IsDate, IsEmail, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from "class-validator"

export class AcivitySearchResponseDto {
    name: string
    ownersName: string[]
    rating: number
    address: string
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
    endDate: Date
    @IsString()
    @IsNotEmpty()
    address: string
    @IsOptional()
    @IsPositive()
    @IsInt()
    maxQuota?: number
    @IsPositive()
    @IsInt()
    disciplineId: number //TODO: tiene que soportar arrays de disciplinas

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

export class CreateActivityResponse {
    activities: CreatedActivitylistData[]
}

export class CreatedActivitylistData {

    id: number

    name: string

    description: string
    price: number
    avRating: number
    @Exclude()
    isDeleted: number

    startDate: Date

    endDate?: Date

    // @Expose({ name: 'endDate' }) hace falta esto?
    // get isEndDate() {
    //     if (this.endDate) {
    //         return this.endDate
    //     }
    //     return undefined
    // }

    plan?: Plan[]
    address: string
    maxQuota: number
    latitude: number
    longitude: number
    @Exclude()
    updatedAt: Date

    disciplineIds: { id: number }[]
    @Exclude()
    repeatable: boolean
    @Exclude()
    interestedUsers?: UserInterestedActivity[]
    @Exclude()
    createdBy?: UserCreatedActivities[]
    @Exclude()
    event?: Event[]

    constructor(activity: Partial<Activity>) {
        Object.assign(this, activity)
    }
}