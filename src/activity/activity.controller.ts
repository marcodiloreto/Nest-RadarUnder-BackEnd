import { Body, Controller, Delete, ForbiddenException, Get, Param, ParseIntPipe, Post, Put, Query, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/user/decorator/user.decorator';
import { ActivityService, Filters } from './activity.service';
import { addCreatorDto, CreateActivityDto, CreateActivityResponse, UpdateActivityDto } from './dtos/activity.dto';
import { addDaysToday, parseRepeatable, weekDaysParser } from 'src/util/filtersParseFunction';
import { UserService } from 'src/user/user.service';
import { Roles } from 'src/decorators/roles.decorator';
import { UserPermission } from '@prisma/client';
import { threadId } from 'worker_threads';
@Controller('activity')
export class ActivityController {

    constructor(private readonly activityService: ActivityService, private readonly userService: UserService) { }

    @Get()
    getAllActivities(
        @Query('minPrice') minPrice?: number,
        @Query('maxPrice') maxPrice?: number,
        @Query('afterSetDays') afterSetDays?: number,
        @Query('beforeSetDays') beforeSetDays?: number,
        @Query('weekDays') weekDays?: string,
        @Query('minRating') minRating?: number,
        @Query('repeatable') repeatable?: string,
        @Query('maxQuota') maxMaxQuota?: number,
        @Query('minQuota') minMaxQuota?: number,
        // @Query('minEnrolled') minEnrolled?: number, NOT SUPPORTED BY PRISMA
        // @Query('maxEnrolled') maxEnrolled?:number, NOT SUPPERTED BY PRISMA
        @Query('discipline') disciplineId?: number // buscarlo por nombre????
    ) {
        //parse weekArray
        const isSetWeekDay = typeof weekDays !== 'undefined' ? true : false;
        if (isSetWeekDay) var weekArray = weekDaysParser(weekDays);

        //parse repeatable
        const isSetRepeatable = typeof repeatable !== 'undefined' ? true : false;
        if (isSetRepeatable) var booleanRepeatable = parseRepeatable(repeatable);

        //set Activity.price for filtering
        const price = minPrice || maxPrice ? {
            ...(maxPrice && { lte: maxPrice }),
            ...(minPrice && { gte: minPrice }),
        } : undefined

        //set Activity.Event.date for filtering
        const event = afterSetDays || beforeSetDays ?
            {
                some: {
                    startDate: {
                        ...(afterSetDays && { lte: addDaysToday(afterSetDays) }),
                        ...(beforeSetDays && { gte: addDaysToday(beforeSetDays) }),
                    }
                }
            } : undefined

        //set Activity.maxQuota for filtering
        const maxQuota = maxMaxQuota || minMaxQuota ? {
            ...(maxMaxQuota && { lte: maxMaxQuota }),
            ...(minMaxQuota && { gte: minMaxQuota }),
        } : undefined



        const filters: Filters = {
            ...(price && { price }),
            ...(event && { event }),
            ...(weekArray && { plan: { some: { days: { hasSome: weekArray } } } }),
            ...(minRating && { avRating: { gte: minRating } }),
            ...(isSetRepeatable && { repeatable: booleanRepeatable }),
            ...(maxQuota && { maxQuota }),
            ...(disciplineId && { disciplineId })
        }

        console.log(filters)

        //TODO configurar DTO!!! ActivityCrontroller.getAllActivities
        return this.activityService.getAllActivities(filters)
    }
    /*@Get('/test')
    createEvent() {
        return this.activityService.createEvents();
    }*/

    @Get('/created')
    @Roles(UserPermission.NORMAL, UserPermission.ADMIN)
    getCreatedActivities(@User() user): Promise<CreateActivityResponse> {

        return this.activityService.getCreatedActivities(user)
    }


    @Get('/:id')
    getActivityById(@Param('id', ParseIntPipe) id: number) {
        //TODO configurar DTO!!! ActivityCrontroller.getActivityById
        return this.activityService.getActivityById(id)
    }

    @Post('/')
    @Roles(UserPermission.NORMAL, UserPermission.ADMIN)
    createActivity(@Body() body: CreateActivityDto, @User() user) {
        // if (!user) throw new ForbiddenException('Tenés que iniciar sesión para crear actividades')
        return this.activityService.createActivity(body, user)
    }

    @Put('/:id')
    @Roles(UserPermission.NORMAL)
    async updateActivity(@Body() body: UpdateActivityDto, @User() user, @Param('id', ParseIntPipe) id: number) {
        // if (!user) throw new ForbiddenException('No podés hacer eso si no estás logueado')
        await this.activityService.validateUserOwnership(user.id, id)
        return this.activityService.updateActivity(body, id)
    }

    @Put('/:id/creator')
    @Roles(UserPermission.NORMAL)
    async addCreator(@Body() body: addCreatorDto, @User() user, @Param('id', ParseIntPipe) id: number) {
        // if (!user) throw new ForbiddenException('No podés hacer eso si no estás logueado')
        await this.activityService.validateUserOwnership(user.id, id)
        const foundUser = await this.userService.findUserByEmail(body.email)
        return this.activityService.addCreator(foundUser.id, id)
    }

    @Delete('/:id')
    @Roles(UserPermission.NORMAL)
    async deleteActivity(@Param('id', ParseIntPipe) id: number, @User() user) {
        // if (!user) throw new ForbiddenException('No podés hacer eso si no estás logueado')
        await this.activityService.validateUserOwnership(user.id, id)
        return this.activityService.deleteActivity(id);
    }

    @Delete('/:id/undo')
    @Roles(UserPermission.NORMAL)
    async undoDeleteActivity(@Param('id', ParseIntPipe) id: number, @User() user) {
        // if (!user) throw new ForbiddenException('No podés hacer eso si no estás logueado')
        await this.activityService.validateUserOwnership(user.id, id)
        return this.activityService.undoDeleteActivity(id)
    }

    //TODO: FOLLOW ACTIVITY, + INSCRIBE
    //TODO: Atrasar vencimiento de actividad

}