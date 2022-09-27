import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UnauthorizedException } from '@nestjs/common';
import { UserPermission } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';

import { User } from 'src/user/decorator/user.decorator';
import { DisciplineService } from './discipline.service';
import { CreateDisciplineDto, updateDisciplineStrings } from './dtos/discipline.dto';

@Controller('discipline')
export class DisciplineController {

    constructor(private readonly disciplineService: DisciplineService) { }


    @Get('')
    findAll() {
        return this.disciplineService.findAll()
    }

    @Get('/:id')
    findById(@Param('id', ParseIntPipe) id: number) {
        return this.disciplineService.findById(id);
    }

    @Roles(UserPermission.ADMIN)
    @Post('')
    create(@Body() body: CreateDisciplineDto, @User() user) {
        if (!user) throw new UnauthorizedException('debes estar logueado para hacer eso')
        return this.disciplineService.create(body)
    }

    @Roles(UserPermission.ADMIN)
    @Put('/:id')
    update(@Param('id', ParseIntPipe) id: number, @Body() body: updateDisciplineStrings, @User() user) {
        if (!user) throw new UnauthorizedException('debes estar logueado para hacer eso')
        return this.disciplineService.updateString(body, id)
    }

    //TODO: updateParents

    @Get('/hola')
    algo() {
        return 'hola'
    }

}
