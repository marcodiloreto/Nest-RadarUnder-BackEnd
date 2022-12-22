import { Injectable, NotFoundException } from '@nestjs/common';
import { ImageService } from 'src/image/image.service';
import { PrismaService } from 'src/prisma/prisma.service';

interface createDiscipline {
    name: string
    description: string
    childs?: { parentId?: number, childId: number }[]
    parents?: { childId?: number, parentId: number }[]
}

interface updateDiscipline {
    name?: string
    description?: string
}

interface InsertRelation {
    parentId: number
    childId: number
}
@Injectable()
export class DisciplineService {

    constructor(private readonly prisma: PrismaService, private readonly imageService: ImageService) { }

    async findAll(/*fatherId*/) {
        //TODO: buscar disciplina a partir de un padre  DisciplineService.getAll()
        //TODO: streaming - buffer de resultados.  DisciplineService.getAll()
        return this.prisma.discipline.findMany({
            include: {
                images: true
            }
        })
    }

    async findSome(text: string) {

        return this.prisma.discipline.findMany({
            where: {
                name: {
                    contains: text,
                    mode: 'insensitive'
                }
            },
            take: 5,
            orderBy: {
                name: 'asc'
            }
        })

    }

    async findById(id: number) {
        return this.prisma.discipline.findUnique({
            where: { id }
        })
    }

    async create({ name, description, parents, childs }: createDiscipline) {
        const discipline = await this.prisma.discipline.create({
            data: {
                name,
                description,
            }
        })

        if (parents) {
            const insertParents = parents.map((item) => {
                item.childId = discipline.id
                return item as Required<InsertRelation>
            })
            await this.prisma.parentChild.createMany({
                data: insertParents
            })
        }

        if (childs) {
            const insertChilds = childs.map((item) => {
                item.parentId = discipline.id
                return item as Required<InsertRelation>
            })
            await this.prisma.parentChild.createMany({
                data: insertChilds
            })
        }
    }
    //TODO: hacer los updates y delete de disciplina bien
    async updateString({ name, description }: updateDiscipline, id: number) {
        const discipline = await this.prisma.discipline.findUnique({
            where: { id }
        })

        if (!discipline) throw new NotFoundException('no existe esa disciplina')

        return await this.prisma.discipline.update({
            where: { id },
            data: {
                name,
                description
            }
        })
    }


    async delete(id: number) {
        return this.prisma.discipline.delete({
            where: { id }
        })
    }

    async deleteImages(ids: { id: number }[]) {
        return this.prisma.image.deleteMany({
            //where: ids 
        })
    }

}
