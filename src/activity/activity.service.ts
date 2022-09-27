import { ConflictException, Injectable, NotFoundException, PreconditionFailedException, UnauthorizedException } from '@nestjs/common';
import { Week } from '@prisma/client';
import { EventService } from 'src/event/event.service';
import { PrismaService } from 'src/prisma/prisma.service';
import 'datejs'
import { CreateActivityDto, CreateActivityResponse, CreatedActivitylistData } from './dtos/activity.dto';

export interface Filters {
    price?: {
        lte?: number
        gte?: number
    },
    event?: {
        some: {
            startDate: {
                lte?: Date
                gte?: Date
            }
        }
    },
    plan?: {
        some: {
            days: {
                hasSome: Week[]
            }
        }
    },
    avRating?: {
        gte: number
    },
    repeatable?: boolean,
    maxQuota?: {
        lte?: number,
        gte?: number
    },
    disciplineId?: number
}



interface CreateActivityData {
    name: string,
    description: string,
    price?: number,
    startDate: Date,
    endDate?: Date,
    address: string,
    maxQuota?: number,
    disciplineId: number,
    plan: {
        startTime: Date,
        endTime: Date,
        days: Week[]
    }[],
    longitude: number,
    latitude: number,
}

interface updateActivityData {
    name?: string,
    description?: string,
    price?: number,
    startDate?: Date,
    endDate?: Date,
    address?: string,
    maxQuota?: number,
    disciplineId?: number,
    longitude?: number,
    latitude?: number,
}
@Injectable()
export class ActivityService {

    constructor(private readonly prisma: PrismaService, private readonly eventService: EventService) { }

    async getAllActivities(filters: Filters)/*: Promise<AcivitySearchResponseDto[]>*/ {
        //TODO: logica de streaming / buffering de resultados Activityservice.getAllActivities
        //TODO: paginacion?? Activityservice.getAllActivities
        return await this.prisma.activity.findMany({ where: filters })
    }

    async getActivityById(id) {


        return await this.prisma.activity.findUnique({
            where: {
                id
            }
        })
    }



    async createActivity({ name, description, price, startDate, endDate, address, maxQuota, disciplineId, plan, latitude, longitude }: CreateActivityData,
        user) {

        //chequear que no exista nombre
        const act = await this.prisma.activity.findUnique({
            where: {
                name
            }
        })
        if (act) throw new PreconditionFailedException('ya existe una activiidad con ese nombre')

        //crear la actividad
        const activity = await this.prisma.activity.create({
            data: {
                name,
                description,
                price,
                startDate,
                endDate,
                address,
                maxQuota,
                disciplineId,
                plan: {
                    create: plan
                },
                latitude,
                longitude,
            },
            select: {
                id: true,
                plan: {
                    select: {
                        days: true,
                        startTime: true,
                        endTime: true
                    }
                },
                startDate: true,
                endDate: true,
                address: true
            }
        })
        //añadir creador
        await this.addCreator(user.id, activity.id)

        //calcular fechas para eventos segun plan!!! importanteeeeee y despues hacer una create many 
        await this.eventService.createFourEach(activity)

        return activity
    }

    async addCreator(userId: number, activityId: number) {

        const exists = await this.prisma.userCreatedActivities.findFirst({
            where: {
                AND: [
                    { activityId }, { userId }
                ]
            }
        })

        if (exists) throw new ConflictException('Ese usuario ya está registrado como creador!')


        await this.prisma.userCreatedActivities.create({
            data: {
                userId,
                activityId
            },
        })

        return await this.prisma.activity.findUnique({
            where: { id: activityId },
            select: { createdBy: true }
        })
    }

    //TODO: isDeleted ya no es booleano (poner fecha del momento de baja)
    async deleteActivity(id: number) {
        const exists = await this.prisma.activity.findUnique({
            where: {
                id
            }
        })

        if (!exists) throw new NotFoundException('No se encontrño la actividad')

        const deleteTime = new Date()
        return await this.prisma.activity.update({
            where: { id },
            data: {
                isDeleted: deleteTime
            }
        })
    }

    async undoDeleteActivity(id: number) {

        const exists = await this.prisma.activity.findUnique({
            where: {
                id
            }
        })

        if (!exists) throw new NotFoundException('No se encontrño la actividad')

        return await this.prisma.activity.update({
            where: { id },
            data: {
                isDeleted: null
            }
        })
    }

    async updateActivity(body: updateActivityData, id: number) {
        return await this.prisma.activity.update({
            where: { id },
            data: body
        })
    }

    async getCreatedActivities(user): Promise<CreateActivityResponse> {
        const activities = await this.prisma.activity.findMany({
            where: {
                createdBy: {
                    every: {
                        userId: {
                            equals: user.id
                        }
                    }
                }
            }
        })

        const response = { activities: activities.map((act) => { return new CreatedActivitylistData(act) }) }
        return response;
    }



    async validateUserOwnership(userId: number, activityId: number) {
        const userInActivity = await this.prisma.activity.findUnique({
            where: {
                id: activityId
            },
            select: {
                createdBy: true
            }
        })
        const { createdBy } = userInActivity
        var flag = false;
        createdBy.forEach((activityUser) => {
            console.log(activityUser)
            if (activityUser.userId === userId) {
                flag = true;
            }
        });
        if (!flag) throw new UnauthorizedException('No sos el dueño de esta actividad')
    }


}