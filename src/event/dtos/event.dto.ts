import { ActivityState } from "@prisma/client";
import { IsEnum } from "class-validator";

export class changeStatusDto {

    @IsEnum(ActivityState)
    status: ActivityState
}