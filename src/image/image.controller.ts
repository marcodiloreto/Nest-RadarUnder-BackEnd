import { Body, Controller, UploadedFiles, UseInterceptors, Put, Delete, Param, ParseIntPipe, UploadedFile, PreconditionFailedException, ForbiddenException } from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { fileNameMaker } from 'src/util/fileNameMaker';
import { diskStorage } from 'multer'
import { ImageService } from './image.service';
import { imageFileFilter } from 'src/util/imageFileFilter';
import { CreateImageDto } from './dto/imageDto';
import { UserPermission } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { ActivityService } from '../activity/activity.service';
import { User } from 'src/user/decorator/user.decorator';

@Controller('image')
export class ImageController {
    constructor(private readonly imageService: ImageService, private readonly activityService: ActivityService) { }

    @Put('/user')
    @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
    uploadProfilePic(@UploadedFile() file: Express.Multer.File, @User() user) {
        return this.imageService.uploadProfilePic(file, user)
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
    async uploadActivityImages(@UploadedFiles() files: Express.Multer.File[], @Body() { id }: CreateImageDto, @User() user) {
        const isOwner = this.activityService.validateUserOwnership(user.id, id)
        if (!isOwner) throw new ForbiddenException('You are not the owner')
        return this.imageService.persistImages(files, 'Activity', id)
    }

    //Cuando es Discipline solo puede el admin
    @Put('/discipline')
    @UseInterceptors(AnyFilesInterceptor({
        storage: diskStorage({
            destination: './uploads',
            filename: fileNameMaker,
        }),
        fileFilter: imageFileFilter,
    }))
    @Roles(UserPermission.ADMIN)
    async uploadDisciplineImages(@UploadedFiles() files: Express.Multer.File[], @Body() { id }: CreateImageDto) {

        return this.imageService.persistImages(files, 'Discipline', id)
    }

    @Delete('/:id')
    deleteActivity(@Param('id', ParseIntPipe) id: number) {
        return this.imageService.deleteImage(id)
    }

}
