import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { v2 as cloudinary } from 'cloudinary'
import * as fs from 'node:fs'
import { Image, User } from '@prisma/client';


@Injectable()
export class ImageService {
    constructor(private readonly prisma: PrismaService) { }

    async persistImages(files: Express.Multer.File[], entity: "Discipline" | "Activity", id: number) {



        const imgData: Promise<Image>[] = await files.map(async (file) => {
            const result = await cloudinary.uploader
                .upload(file.path)

            this.deleteImageFile(file)

            return this.prisma.image.create({
                data: {
                    url: result.url,
                    public_id: result.public_id,
                    ...(entity === 'Activity' && {
                        activityId: id,
                    }),
                    ...(entity === 'Discipline' && {
                        disciplineId: id,
                    })
                }
            })
        })
        const result = await Promise.all(imgData)
        return result
    }

    deleteImageFile(file: Express.Multer.File) {

        fs.rm(file.path, (err) => {
            if (err) {
                console.log(err)
                throw new Error(err.message)
            }
            return
        })

    }

    async deleteImage(id: number) {
        const image = await this.prisma.image.findUnique({
            where: {
                id
            }
        })
        if (!image) throw new NotFoundException('Esa imagen ya no está en la base de datos')
        const deleted = await cloudinary.uploader.destroy(image.public_id)

        console.log(deleted)

        await this.prisma.image.delete({
            where: {
                id
            }
        })

        return deleted

    }

    async uploadProfilePic(file: Express.Multer.File, { id: userId }: User) {
        const exists = await this.prisma.user.findFirst({
            where: {
                AND: [
                    { id: userId },
                    { profilePicId: { not: null } }
                ]
            }
        })
        if (exists) await this.deleteImage(exists.profilePicId)

        const result = await cloudinary.uploader
            .upload(file.path)
        const image = await this.prisma.image.create({
            data: {
                url: result.url,
                public_id: result.public_id,
            }
        })

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                profilePicId: image.id
            }
        })

        return image.url
    }

}