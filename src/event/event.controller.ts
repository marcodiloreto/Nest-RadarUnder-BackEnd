import { Body, Controller, Param, ParseIntPipe, Put } from '@nestjs/common';
import { changeStatusDto } from './dtos/event.dto';
import { EventService } from './event.service';

@Controller('event')
export class EventController {
    constructor(private readonly eventService: EventService) { }

    @Put(':id')
    changeStatus(@Param('id', ParseIntPipe) id: number, @Body() { status }: changeStatusDto) {
        return this.eventService.changeStatus(id, status)
    }


}
