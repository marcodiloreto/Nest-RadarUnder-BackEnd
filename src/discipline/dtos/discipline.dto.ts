import { ActivitiesToDisciplines, ParentChild } from "@prisma/client"
import { Exclude, Type } from "class-transformer"
import { arrayMinSize, IsArray, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, ValidateNested } from "class-validator"

export class CreateDisciplineDto {
    @IsString()
    @IsNotEmpty()
    name: string
    @IsString()
    @IsNotEmpty()
    description: string
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => parentInsert)
    parents?: parentInsert[]
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => childInsert)
    childs?: childInsert[]
}

class parentInsert {
    @IsInt()
    @IsPositive()
    parentId: number
}

class childInsert {
    @IsInt()
    @IsPositive()
    childId: number
}

export class updateDisciplineStrings {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    name: string

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    description: string
}

export class DisciplineResponse {
    id: number
    name: string
    description: string
    images?: Image[]
    @Exclude()
    parents?: ParentChild[]
    @Exclude()
    childs?: ParentChild[]
    @Exclude()
    activities?: ActivitiesToDisciplines[]
    @Exclude()
    createdAt: Date
    @Exclude()
    updatedAt: Date

    constructor(discipline: Partial<DisciplineResponse>) {
        Object.assign(this, discipline)
        this.images = discipline.images.map((image) => { return new Image(image) })
    }
}


export class DebounceSearchResponse {
    id: number
    name: string

    @Exclude()
    description: string
    @Exclude()
    images?: Image[]
    @Exclude()
    parents?: ParentChild[]
    @Exclude()
    childs?: ParentChild[]
    @Exclude()
    activities?: ActivitiesToDisciplines[]
    @Exclude()
    createdAt: Date
    @Exclude()
    updatedAt: Date

    constructor(discipline: Partial<DebounceSearchResponse>) {
        Object.assign(this, discipline)
    }
}

export class Image {

    url: string

    @Exclude()
    id: number
    @Exclude()
    disciplineId?: number
    @Exclude()
    activityId?: number
    @Exclude()
    uploadedAt: Date

    constructor(image: Partial<Image>) {
        Object.assign(this, image)
    }
}
