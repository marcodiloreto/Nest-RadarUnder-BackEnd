import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EventService } from './event.service';
import { EventController } from './event.controller';

@Module({
  providers: [EventService],
  imports: [PrismaModule],
  exports: [EventService],
  controllers: [EventController]
})
export class EventModule { }
