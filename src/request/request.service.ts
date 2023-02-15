import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

interface CreateData {
    disciplineName: string
    description?: string
}


export enum Status {
    PENDING = 'PENDING',
    REJECTED = 'REJECTED',
    ACCEPTED = 'ACCEPTED'
}

@Injectable()
export class RequestService {

    constructor(private readonly prismaService: PrismaService) {
        this.pageSize = 5
    }
    private pageSize


    async pagedRead(status: Status, page = 1, term?: string) {
        return this.prismaService.request.findMany({
            where: {
                AND: [
                    {
                        disciplineName: {
                            contains: term
                        }
                    }, {
                        status,
                    }
                ]
            },
            orderBy: {
                updatedAt: 'asc',
            },
            take: this.pageSize,
            skip: (page - 1) * this.pageSize
        })
    }

    async findById(id: number) {
        return this.prismaService.request.findUnique({
            where: {
                id
            }
        })
    }
    async createRequest(data: CreateData) {
        return this.prismaService.request.create({
            data
        })
    }

    async alterStatus(id: number, newStatus: Status) {
        return this.prismaService.request.update({
            where: { id },
            data: {
                status: newStatus
            }
        })
    }

}