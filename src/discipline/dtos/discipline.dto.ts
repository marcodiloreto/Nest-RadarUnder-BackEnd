import { Type } from "class-transformer"
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, ValidateNested } from "class-validator"

export class CreateDisciplineDto {
    @IsString()
    @IsNotEmpty()
    name: string
    @IsString()
    @IsNotEmpty()
    description: string
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Image)
    images: Image[]
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => parentInsert)
    childs?: parentInsert[]
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => childInsert)
    parents?: childInsert[]
}

class Image {
    @IsString()
    @IsNotEmpty()
    url: string
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