import { Module } from '@nestjs/common';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [RequestController],
  providers: [RequestService],
  imports: [PrismaModule]
})
export class RequestModule { }
