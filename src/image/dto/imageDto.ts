import { IsNumber, IsString } from "class-validator";

export class CreateImageDto {

    @IsNumber()
    id: number
}

export class DeleteImageDto {
    @IsNumber()
    imageId: number
}