import { Injectable, NotFoundException } from '@nestjs/common';
import { ImageService } from 'src/image/image.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { DebounceSearchResponse, FullDisciplineData, ListDisciplineData } from './dtos/discipline.dto';

interface createDiscipline {
    name: string
    description: string
    childs?: { id: number }[]
    parents?: { id: number }[]
}

interface updateDiscipline {
    name?: string
    description?: string
    parents?: { id: number }[]
    childs?: { id: number }[]
}

@Injectable()
export class DisciplineService {

    constructor(private readonly prisma: PrismaService) { }

    async findAll(/*fatherId*/) {
        //TODO: buscar disciplina a partir de un padre  DisciplineService.getAll()
        //TODO: streaming - buffer de resultados.  DisciplineService.getAll()
        const disciplines = await this.prisma.discipline.findMany({
            include: {
                parents: {
                    select: {
                        parentId: true
                    }
                },
                images: {
                    take: 1,
                    select: {
                        url: true
                    }
                }
            },
            orderBy: {
                id: 'asc'
            }
        })
        return disciplines.map((discipline) => {
            return new ListDisciplineData(discipline)
        })

    }

    async findSome(text: string) {

        const disciplines = await this.prisma.discipline.findMany({
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
        return disciplines.map((discipline) => { return new DebounceSearchResponse(discipline) })
    }

    async findById(id: number) {
        const discipline = await this.prisma.discipline.findUnique({
            where: { id },
            include: {
                images: {
                    select: {
                        id: true,
                        url: true
                    }
                },
                childs: {
                    select: {
                        childId: true,
                        child: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                parents: {
                    select: {
                        parentId: true,
                        parent: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        })
        if (!discipline) throw new NotFoundException('No such discipline with that Id')
        return new FullDisciplineData(discipline)
    }

    async create({ name, description, parents, childs }: createDiscipline) {
        const discipline = await this.prisma.discipline.create({
            data: {
                name,
                description,
            }
        })

        if (parents.length > 0) {
            const data = parents.map((parent) => {
                return {
                    parentId: parent.id,
                    childId: discipline.id
                }
            })
            await this.prisma.parentChild.createMany({
                data
            })
        }

        if (childs.length > 0) {
            const data = childs.map((child) => {
                return {
                    childId: child.id,
                    parentId: discipline.id
                }
            })
            await this.prisma.parentChild.createMany({
                data
            })
        }
        return discipline.id
    }
    //TODO: hacer los updates y delete de disciplina bien
    async update({ name, description, parents, childs }: updateDiscipline, id: number) {
        const discipline = await this.prisma.discipline.findUnique({
            where: { id }
        })

        if (!discipline) throw new NotFoundException('no existe esa disciplina')

        if (name || description) {

            await this.prisma.discipline.update({
                where: { id },
                data: {
                    name,
                    description
                }
            })
        }

        await this.prisma.parentChild.deleteMany({
            where: {
                childId: id
            }
        })

        if (parents !== undefined) {

            if (parents.length > 0) {
                const data = parents.map(parent => {
                    return { parentId: parent.id, childId: id }
                })

                await this.prisma.parentChild.createMany({
                    data
                })
            }

            await this.prisma.parentChild.deleteMany({
                where: {
                    parentId: id
                }
            })
        }

        if (childs !== undefined) {

            if (childs.length > 0) {
                const data = childs.map(child => {
                    return { parentId: id, childId: child.id }
                })

                await this.prisma.parentChild.createMany({
                    data
                })
            }
        }

    }


    async delete(id: number) {

        await this.prisma.parentChild.deleteMany({
            where: {
                OR: [
                    {
                        childId: id
                    },
                    {
                        parentId: id
                    }
                ]
            }
        })

        return this.prisma.discipline.delete({
            where: { id }
        })
    }

}
