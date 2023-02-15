import { Body, Controller, Get, Param, Post, Put, ParseIntPipe, ParseEnumPipe, Query, PreconditionFailedException } from '@nestjs/common';
import { UserPermission } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto, UpdateStatusDto } from './dto/request.dto';
import { RequestService, Status } from './request.service';




@Controller('request')
export class RequestController {

    constructor(private readonly requestService: RequestService) { }

    @Get('/id/:id')
    @Roles(UserPermission.ADMIN)
    getById(@Param('id', ParseIntPipe) id: number) {
        return this.requestService.findById(id)
    }

    @Get('/:status')
    @Roles(UserPermission.ADMIN)
    getAll(@Param('status', new ParseEnumPipe(Status)) status: Status, @Query('page') page?: string, @Query('term') term?: string) {
        var parsedPage = undefined
        if (page) {
            parsedPage = Number(page)
            if (isNaN(parsedPage)) throw new PreconditionFailedException('page must be a number')
        }
        return this.requestService.pagedRead(status, parsedPage, term)
    }


    @Roles(UserPermission.ADMIN, UserPermission.NORMAL)
    @Post()
    createRequest(@Body() data: CreateRequestDto) {
        return this.requestService.createRequest(data)
    }

    @Roles(UserPermission.ADMIN)
    @Put('/:id')
    alterStatus(@Param('id', ParseIntPipe) id: number, @Body() { status }: UpdateStatusDto) {
        return this.requestService.alterStatus(id, status)
    }

}
