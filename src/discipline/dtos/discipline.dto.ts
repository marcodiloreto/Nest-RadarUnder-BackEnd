import { PartialType } from "@nestjs/mapped-types"
import { ActivitiesToDisciplines, Discipline, ParentChild } from "@prisma/client"
import { Exclude, Expose, Type } from "class-transformer"
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
    @Type(() => FamilyInsert)
    parents?: FamilyInsert[]
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FamilyInsert)
    childs?: FamilyInsert[]
}

class FamilyInsert {
    @IsInt()
    @IsPositive()
    id: number
}

export class updateDisciplineDto extends PartialType(CreateDisciplineDto) { }

export class FullDisciplineData {
    id: number
    name: string
    description: string
    images?: { url: string }[]

    @Expose({ name: 'parents' })
    get getParents() {
        return this.parents.map(parent => {
            return {
                id: parent.parentId,
                name: parent.parent.name
            }
        })
    }

    @Expose({ name: 'childs' })
    get getChilds() {
        return this.childs.map(child => {
            return {
                id: child.childId,
                name: child.child.name
            }
        })
    }
    @Exclude()
    createdAt: Date
    @Exclude()
    updatedAt: Date

    @Exclude()
    parents: { parentId: number, parent: { name: string } }[]
    @Exclude()
    childs: { childId: number, child: { name: string } }[]

    constructor(discipline: Partial<FullDisciplineData>) {
        Object.assign(this, discipline)
    }
}

export class ListDisciplineData {
    id: number
    name: string
    @Exclude()
    description: string

    @Expose()
    get iconUrl() {
        if (this.images.length > 0) {
            return this.images[0].url
        } else {
            return undefined
        }
    }

    @Exclude()
    images?: { url: string }[]
    @Exclude()
    createdAt: Date
    @Exclude()
    updatedAt: Date

    constructor(discipline: Partial<(Discipline & {
        images: {
            url: string;
        }[];
        parents: {
            parentId: number;
        }[];
    })>) {
        Object.assign(this, discipline)
    }
}


export class DebounceSearchResponse {
    id: number
    name: string

    @Exclude()
    description: string
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

