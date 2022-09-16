import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DisciplineController } from './discipline.controller';
import { DisciplineService } from './discipline.service';

@Module({
  controllers: [DisciplineController],
  providers: [DisciplineService],
  imports: [PrismaModule]
})
export class DisciplineModule { }
