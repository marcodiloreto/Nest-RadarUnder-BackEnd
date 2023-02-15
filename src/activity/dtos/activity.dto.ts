import { Activity, UserCreatedActivities, UserInterestedActivity, Week, Image, ActivitiesToDisciplines, User } from "@prisma/client"
import { Exclude, Expose, Type } from "class-transformer"
import { ArrayUnique, IsArray, IsBoolean, IsDate, IsDefined, IsEmail, IsEnum, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from "class-validator"
import { PartialType } from '@nestjs/mapped-types'
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
class Location {
    @IsString()
    @IsNotEmpty()
    address: string
    @IsNumber()
    lng: number
    @IsNumber()
    lat: number
}

export class CreateActivityDto {
    @IsString()
    @IsNotEmpty()
    name: string
    @IsString()
    @IsNotEmpty()
    description: string

    @IsNumber()
    price: number
    @IsDate()
    startDate: Date
    @IsDate()
    endDate: Date

    @IsInt()
    maxQuota: number

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Discipline)
    disciplines: Discipline[]

    @IsBoolean()
    repeatable: boolean

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Plan)
    plan?: Plan[]


    @IsObject()
    @ValidateNested()
    @Type(() => Location)
    location: Location
}




class Discipline {
    @IsNumber()
    id: number
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

export class UpdateActivityDto extends PartialType(CreateActivityDto) { }

export class addCreatorDto {
    @IsEmail()
    email: string
}

export class CreatedActivityResponse {
    activities: ActivitylistData[]
}

export class InterestedActivitiesResponse {
    inscribed: ActivitylistData[];
    liked: ActivitylistData[]
}

export class ActivitylistData {

    id: number
    name: string
    @Exclude()
    description: string
    price: number
    @Exclude() //TODO: rating y maxQuota 
    avRating: number

    @Expose({ name: 'deleted' })
    get getIsDeleted() {
        if (this.isDeleted) return true
        return undefined
    }

    @Exclude()
    isDeleted: Date

    startDate: Date

    endDate?: Date

    plan?: Plan[]
    address: string
    maxQuota: number
    latitude: number
    longitude: number
    @Exclude()
    updatedAt: Date

    @Expose({ name: 'disciplines' })
    get getDiscipline() {

        return this.disciplines.map(obj => {
            return obj.discipline
        })

    }

    @Exclude()
    disciplines: { discipline: Discipline }[]
    repeatable: boolean
    @Exclude()
    interestedUsers?: UserInterestedActivity[]

    @Expose({ name: 'createdBy' })
    get getcreated() {

        return this.createdBy.map(object => {
            return object.user
        })


    }

    @Expose({ name: 'enrolled' })
    get getEnrolled() {
        return this._count.interestedUsers
    }

    @Exclude()
    _count: { interestedUsers: number }

    @Exclude()
    createdBy?: { user: User }[]

    @Exclude()
    event?: Event[]

    images: { url: string }[]

    constructor(activity: Partial<Activity>) {
        Object.assign(this, activity)
    }
}

export class ActivityControlData {

    id: number
    name: string
    description: string
    price: number
    @Exclude()
    avRating: number
    @Exclude()
    isDeleted: Date
    startDate: Date
    endDate: Date
    maxQuota: number

    @Expose({ name: 'location' })
    get getLocation() {
        return {
            address: this.address,
            lat: this.latitude,
            lng: this.longitude
        }
    }
    @Expose({ name: 'disciplines' })
    get getDisciplines() {
        return this.disciplines.map(
            (item) => {
                return item.discipline
            }
        )
    }
    @Exclude()
    address: string
    @Exclude()
    latitude: number
    @Exclude()
    longitude: number
    @Exclude()
    updatedAt: Date

    images: Image[]

    @Exclude()
    disciplines: Disciplines[]

    repeatable: Boolean
    @Exclude()
    interestedUsers: UserInterestedActivity[]
    @Exclude()
    createdBy: UserCreatedActivities[]

    plan: Plan[]

    constructor(activity: Partial<Activity>) {
        Object.assign(this, activity)
    }
}

export class ActivityDetails {
    @Expose({ name: 'phone' })
    get getPhone() {
        return this.createdBy[0].user.phone
    }

    @Expose({ name: 'email' })
    get getEmail() {
        return this.createdBy[0].user.email
    }

    @Exclude()
    createdBy: { user: { phone: string; email: string } }[]


    description: string
    images: { url: string }[]

    constructor(details: any) {
        Object.assign(this, details)
    }
}

interface Disciplines extends ActivitiesToDisciplines {
    discipline: Discipline
}


export class ActivityDataForMapMarker {

    id: number
    name: string
    @Exclude()
    description: string
    price: number

    @Exclude() //TODO: rating
    avRating: number

    @Exclude()
    isDeleted: Date

    startDate: Date

    endDate?: Date

    plan?: Plan[]
    address: string
    maxQuota: number
    latitude: number
    longitude: number
    @Exclude()
    updatedAt: Date

    @Expose({ name: 'disciplines' })
    get getDiscipline() {
        return this.disciplines.map(obj => {
            return obj.discipline
        })
    }

    @Exclude()
    disciplines: { discipline: Discipline }[]
    repeatable: boolean
    @Exclude()
    interestedUsers?: UserInterestedActivity[]

    @Expose({ name: 'createdBy' })
    get getcreated() {
        return this.createdBy.map(object => {
            return object.user
        })

    }

    @Expose({ name: 'enrolled' })
    get getEnrolled() {
        return this._count.interestedUsers
    }

    @Exclude()
    _count: { interestedUsers: number }

    @Exclude()
    createdBy?: { user: User }[]

    @Exclude()
    event?: Event[]

    constructor(activityWithDetails: Partial<Activity & {
        disciplines: {
            discipline: {
                id: number;
                name: string;
            };
        }[];
        plan: {
            id: number;
            startTime: Date;
            endTime: Date;
            days: Week[];
        }[];
        createdBy: {
            user: {
                id: number;
                name: string;
                avRating: number;
                lastName: string;
                profilePic: {
                    url: string
                };
            };
        }[];
        _count: {
            interestedUsers: number
        }
    }>) {
        Object.assign(this, activityWithDetails)
    }
}

// Activity & {
//     disciplines: {
//         discipline: {
//             id: number;
//             name: string;
//         };
//     }[];
//     plan: {
//         id: number;
//         startTime: Date;
//         endTime: Date;
//         days: Week[];
//     }[];
//     createdBy: {
//         user: {
//             id: number;
//             name: string;
//             avRating: number;
//             lastName: string;
//             profilePic: {
//                 url:string
//             };
//         };
//     }[];
//     _count: {
//         interestedUsers: number
//     };