import { Estado } from "@prisma/client";
import { IsEnum } from "class-validator";

export class changeStatusDto {

    @IsEnum(Estado)
    status: Estado
}