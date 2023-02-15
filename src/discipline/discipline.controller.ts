import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, UnauthorizedException, NotFoundException, Delete } from '@nestjs/common';
import { UserPermission } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { User } from 'src/user/decorator/user.decorator';
import { DisciplineService } from './discipline.service';
import { CreateDisciplineDto, updateDisciplineDto, } from './dtos/discipline.dto';

@Controller('discipline')
export class DisciplineController {

    constructor(private readonly disciplineService: DisciplineService) { }


    @Get()
    async findAll() { //TODO: esto con stream??
        return this.disciplineService.findAll()
    }
    @Get('/debounceSearch?') //TODO: No se podrá hacer esto en instancia local?? 
    //sin tener que sacar data de la bd. Una lista de nombres con un RegEx?
    async debounceFindSome(@Query('text') text = '') {
        return this.disciplineService.findSome(text)
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
    update(@Param('id', ParseIntPipe) id: number, @Body() body: updateDisciplineDto, @User() user) {
        if (!user) throw new UnauthorizedException('debes estar logueado para hacer eso')
        return this.disciplineService.update(body, id)
    }

    @Roles(UserPermission.ADMIN)
    @Delete("/:id")
    erase(@Param('id', ParseIntPipe) id: number, @User() user) {
        if (!user) throw new UnauthorizedException('debes estar logueado para hacer eso')
        return this.disciplineService.delete(id)
    }

}
