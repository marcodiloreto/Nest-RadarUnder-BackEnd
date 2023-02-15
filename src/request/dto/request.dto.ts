import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator"
import { Status } from "../request.service"

export class CreateRequestDto {

    @IsString()
    @IsNotEmpty()
    disciplineName: string


    @IsString()
    @IsOptional()
    description?: string
}

export class UpdateStatusDto {

    @IsEnum(Status)
    status: Status
}