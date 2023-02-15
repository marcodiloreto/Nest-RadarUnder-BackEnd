import { Body, Controller, Get, Param, ParseIntPipe, Put } from '@nestjs/common';
import { UpdateUserDto } from './dtos/user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) { }

    @Get('/details/:id')
    getDetails(@Param('id', ParseIntPipe) id: number) {
        return this.userService.getUserDetails(id)
    }

    @Put('/:id')
    updateUser(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateUserDto) {
        return this.userService.updateUserData(id, data)
    }
}
