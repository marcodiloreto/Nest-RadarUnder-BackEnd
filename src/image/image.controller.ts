import { Body, Controller, Post, UploadedFiles, UseInterceptors, PreconditionFailedException, Put, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { fileNameMaker } from 'src/util/fileNameMaker';
import { diskStorage } from 'multer'
import { ImageService } from './image.service';
import { imageFileFilter } from 'src/util/imageFileFilter';
import { CreateImageDto, DeleteImageDto } from './dto/imageDto';
import { UserPermission } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { User } from 'src/user/decorator/user.decorator';
import { ActivityService } from '../activity/activity.service';

@Controller('image')
export class ImageController {
    constructor(private readonly imageService: ImageService) { }

    @Put('/discipline')
    @UseInterceptors(AnyFilesInterceptor({
        storage: diskStorage({
            destination: './uploads',
            filename: fileNameMaker,
        }),
        fileFilter: imageFileFilter,
    }))
    @Roles(UserPermission.ADMIN)
    async uploadImages(@UploadedFiles() files: Express.Multer.File[], @Body() { id }: CreateImageDto) {
        return this.imageService.persistImages(files, 'Discipline', id)
    }


    @Put('/activity')
    @UseInterceptors(AnyFilesInterceptor({
        storage: diskStorage({
            destination: './uploads',
            filename: fileNameMaker,
        }),
        fileFilter: imageFileFilter,
    }))
    @Roles(UserPermission.ADMIN, UserPermission.NORMAL)
    async uploadActivityImages(@UploadedFiles() files: Express.Multer.File[], @Body() { id }: CreateImageDto) {
        return this.imageService.persistImages(files, 'Activity', id)
    }

    @Delete('/:id')
    deleteActivity(@Param('id', ParseIntPipe) id: number) {
        return this.imageService.deleteImage(id)
    }

}
