import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { MulterModule } from '@nestjs/platform-express';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ActivityModule } from 'src/activity/activity.module';

@Module({
  controllers: [ImageController,],
  providers: [ImageService],
  imports: [PrismaModule, MulterModule.register({
    dest: './uploads',
  })],
  exports: [ImageService],
})
export class ImageModule { }
