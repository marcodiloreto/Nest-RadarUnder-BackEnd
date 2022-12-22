import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DisciplineController } from './discipline.controller';
import { DisciplineService } from './discipline.service';
import { ImageModule } from '../image/image.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  controllers: [DisciplineController],
  providers: [DisciplineService],
  imports: [PrismaModule, ImageModule]
})
export class DisciplineModule { }
