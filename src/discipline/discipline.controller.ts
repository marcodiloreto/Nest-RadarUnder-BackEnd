import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, UnauthorizedException, } from '@nestjs/common';
import { UserPermission } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { User } from 'src/user/decorator/user.decorator';
import { DisciplineService } from './discipline.service';
import { CreateDisciplineDto, DebounceSearchResponse, updateDisciplineStrings, DisciplineResponse, Image } from './dtos/discipline.dto';

@Controller('discipline')
export class DisciplineController {

    constructor(private readonly disciplineService: DisciplineService) { }


    @Get('')
    async findAll() { //TODO: este tiene que ir retornando con un stream, es mucha data para mandar de una
        const mappedDisciplines = (await this.disciplineService.findAll()).map((discipline) => {
            return new DisciplineResponse(discipline)
        })
        return mappedDisciplines
    }
    @Get('/debounceSearch?') //TODO: No se podrá hacer esto en instancia local?? 
    //sin tener que sacar data de la bd. Una lista de nombres con un RegEx?
    async debounceFindSome(@Query('text') text = '') {
        const disciplines = await this.disciplineService.findSome(text)
        const response = disciplines.map((discipline) => { return new DebounceSearchResponse(discipline) })
        return response
    }

    @Get('/search?')
    findSome(@Query('text') text = '') {
        return this.disciplineService.findSome(text)
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
