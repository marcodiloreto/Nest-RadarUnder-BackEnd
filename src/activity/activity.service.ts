import { ConflictException, Injectable, NotFoundException, PreconditionFailedException, UnauthorizedException } from '@nestjs/common';
import { Plan, Week, InterestType, Activity } from '@prisma/client';
import { EventService } from 'src/event/event.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ImageService } from 'src/image/image.service'
import 'datejs'
import { ActivityControlData, ActivityDetails, CreatedActivityResponse, ActivitylistData, UpdateActivityDto, ActivityDataForMapMarker } from './dtos/activity.dto';
import { create } from 'domain';

export interface Filters {
    term?: string;
    name?: {
        contains: string;
        mode: 'insensitive'
    }
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
    disciplines?: {
        some: {
            disciplineId: number
        }
    },
    isDeleted: null
}



interface CreateActivityData {
    name: string,
    description: string,
    price?: number,
    startDate: Date,
    endDate?: Date,
    maxQuota?: number,
    disciplines: { id: number }[],
    plan?: {
        startTime: Date,
        endTime: Date,
        days: Week[]
    }[],
    location: {
        address: string,
        lng: number,
        lat: number,

    }
    repeatable: boolean,
}

class updateActivityData {
    name?: string
    description?: string
    price?: number
    startDate?: Date
    endDate?: Date
    address?: string
    maxQuota?: number
    longitude?: number
    latitude?: number

    constructor(activity: UpdateActivityDto, lat: number, lng: number) {
        delete activity.location
        Object.assign(this, activity)
        this.latitude = lat
        this.longitude = lng

    }
}

class UpdateActivityFullData extends updateActivityData {
    disciplines?: { id: number }[]
    plan?: { startTime: Date, endTime: Date, days: Week[] }[]

    constructor(activity: UpdateActivityDto) {
        super(activity, activity.location.lat, activity.location.lng)
    }
}
@Injectable()
export class ActivityService {

    constructor(private readonly prisma: PrismaService, private readonly eventService: EventService) { }

    async getAllActivities(filters: Filters)/*: Promise<AcivitySearchResponseDto[]>*/ {
        //TODO: logica de streaming / buffering de resultados Activityservice.getAllActivities
        //TODO: paginacion?? Activityservice.getAllActivities
        const activities = await this.prisma.activity.findMany({
            where: filters,
            include: {
                createdBy: {
                    take: 1,   //TODO: debería devolver todo. cappacitar front para ello
                    select: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                lastName: true,
                                avRating: true,
                                profilePic: {
                                    select: {
                                        url: true
                                    }
                                }
                            }
                        }
                    },
                },
                _count: {
                    select: {
                        interestedUsers: true
                    }
                },
                disciplines: {
                    select: {
                        discipline: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                },
                plan: {
                    select: {
                        id: true,
                        startTime: true,
                        endTime: true,
                        days: true,
                    }
                }
            }
        })
        return activities.map(act => new ActivityDataForMapMarker(act))
    }

    async getActivityById(id: number) {
        const activity = await this.prisma.activity.findUnique({
            where: {
                id
            },
            include: {
                plan: {
                    select: {
                        startTime: true,
                        endTime: true,
                        days: true
                    }
                },
                images: {
                    select: {
                        id: true,
                        url: true
                    }
                },
                disciplines: {
                    include: {
                        discipline: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        })

        return new ActivityControlData(activity)
    }



    async createActivity({ name, description, price, startDate, endDate, location, maxQuota = 0, disciplines, plan, repeatable }: CreateActivityData,
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
                address: location.address,
                maxQuota,
                plan: {
                    create: plan
                },
                latitude: location.lat,
                longitude: location.lng,
                repeatable
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

        await this.linkDisciplines(activity.id, disciplines)


        //añadir creador
        await this.addCreator(user.id, activity.id)

        //TODO: ESTO ESTÁ COMO EL ORRRRRTO, debería hacerse con un Cron de Nest y estar en un service aparte
        //calcular fechas para eventos segun plan!!! importanteeeeee y despues hacer una create many 
        //await this.eventService.createFourEach(activity)

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


    async deleteActivity(id: number) {
        const exists = await this.prisma.activity.findUnique({
            where: {
                id
            }
        })

        if (!exists) throw new NotFoundException('No se encontró la actividad')

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

        if (!exists) throw new NotFoundException('No se encontró la actividad')

        return await this.prisma.activity.update({
            where: { id },
            data: {
                isDeleted: null
            }
        })
    }

    async updateActivity(body: UpdateActivityDto, id: number) {

        const activity = new UpdateActivityFullData(body)

        const { disciplines, plan } = activity
        delete activity.disciplines
        delete activity.plan
        if (disciplines) {
            const createManyArgs = disciplines.map(discipline => {
                return { disciplineId: discipline.id, activityId: id }
            })

            await this.prisma.activitiesToDisciplines.deleteMany({
                where: {
                    activityId: id
                }
            })

            await this.prisma.activitiesToDisciplines.createMany({
                data: createManyArgs
            })
        }

        if (plan) {

            const createManyArgs = plan.map((p) => {
                return { ...p, activityId: id }
            })

            await this.prisma.plan.deleteMany({
                where: {
                    activityId: id
                }
            })

            await this.prisma.plan.createMany({
                data: createManyArgs
            })
        }

        return await this.prisma.activity.update({
            where: { id },
            data: activity as updateActivityData
        })
    }

    async getCreatedActivities(user): Promise<CreatedActivityResponse> {
        const activities = await this.prisma.activity.findMany({
            where: {
                createdBy: {
                    every: {
                        userId: {
                            equals: user.id
                        }
                    }
                }
            },
            include: {
                images: {
                    take: 3,
                    select: {
                        url: true,
                    }
                },
                createdBy: {
                    take: 1,   //TODO: debería devolver todo. cappacitar front para ello
                    select: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                lastName: true,
                                avRating: true,
                                profilePic: {
                                    select: {
                                        url: true
                                    }
                                }
                            }
                        }
                    },
                },
                _count: {
                    select: {
                        interestedUsers: true
                    }
                },
                disciplines: {
                    select: {
                        discipline: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                },
                plan: {
                    select: {
                        id: true,
                        startTime: true,
                        endTime: true,
                        days: true,
                    }
                }
            }
        })
        const response = { activities: activities.map((act) => { return new ActivitylistData(act) }) }
        return response;
    }

    async extendDetails(id: number) {
        const details = await this.prisma.activity.findUnique({
            where: { id },
            select: {
                description: true,
                images: {
                    select: {
                        url: true,
                        id: true
                    }
                },
                createdBy: {
                    take: 1,   //TODO: debería devolver todo. capacitar front para ello
                    select: {
                        user: {
                            select: {
                                phone: true,
                                email: true,
                                //TODO: whatsapp ??? instagram ???? facebook ???
                            }
                        }
                    },
                },

            }
        })

        return new ActivityDetails(details)
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
        if (!userInActivity) throw new UnauthorizedException('No sos el dueño de esta actividad')
        const { createdBy } = userInActivity
        var flag = false;
        createdBy.forEach((activityUser) => {
            if (activityUser.userId === userId) {
                flag = true;
            }
        });
        if (!flag) throw new UnauthorizedException('No sos el dueño de esta actividad')
    }

    async linkDisciplines(activityId: number, disciplines: { id: number }[]) {
        //TODO: sera mejor mapear el array a un objeto compatible conn el .crateMany({}) ???
        disciplines.forEach(async (discipline) => {
            await this.prisma.activitiesToDisciplines.create({
                data: {
                    activityId,
                    disciplineId: discipline.id
                }
            })
        })
    }

    async linkInterestedUser(userId: number, activityId: number, relation: InterestType) {
        const owned = await this.prisma.userCreatedActivities.findFirst({
            where: {
                AND: [
                    {
                        activityId,
                    },
                    {
                        userId
                    }
                ]
            }
        })
        if (owned) return false

        const link = await this.prisma.userInterestedActivity.findUnique({
            where: {
                userId_activityId: {
                    activityId,
                    userId
                }
            }
        })
        console.log(link)
        if (link) {
            await this.prisma.userInterestedActivity.update({
                data: {
                    relation,
                },
                where: {
                    userId_activityId: {
                        activityId,
                        userId
                    }
                }
            })
        } else {
            await this.prisma.userInterestedActivity.create({
                data: {
                    activityId,
                    userId,
                    relation
                }
            })
        }

        return true
    }

    async getInterestedActivities(userId: number) {
        const inscribedResults = await this.prisma.activity.findMany({
            where: {
                interestedUsers: {
                    some: {
                        AND: [{
                            userId
                        }, {
                            relation: 'INSCRIBED'
                        }]
                    }
                }
            },
            include: {
                images: {
                    take: 3,
                    select: {
                        url: true,
                    }
                },
                createdBy: {
                    take: 1,
                    select: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                lastName: true,
                                avRating: true,
                                profilePic: {
                                    select: {
                                        url: true
                                    }
                                }
                            }
                        }
                    },
                },
                _count: {
                    select: {
                        interestedUsers: true
                    }
                },
                disciplines: {
                    select: {
                        discipline: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                },
                plan: {
                    select: {
                        id: true,
                        startTime: true,
                        endTime: true,
                        days: true,
                    }
                }
            }
        })

        const inscribed = inscribedResults.map(ac => new ActivitylistData(ac))


        const likedResults = await this.prisma.activity.findMany({
            where: {
                interestedUsers: {
                    some: {
                        AND: [{
                            userId
                        }, {
                            relation: 'LIKE'
                        }]
                    }
                }
            },
            include: {
                images: {
                    take: 3,
                    select: {
                        url: true,
                    }
                },
                createdBy: {
                    take: 1,
                    select: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                lastName: true,
                                avRating: true,
                                profilePic: {
                                    select: {
                                        url: true
                                    }
                                }
                            }
                        }
                    },
                },
                _count: {
                    select: {
                        interestedUsers: true
                    }
                },
                disciplines: {
                    select: {
                        discipline: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                },
                plan: {
                    select: {
                        id: true,
                        startTime: true,
                        endTime: true,
                        days: true,
                    }
                }
            }
        })

        const liked = likedResults.map(ac => new ActivitylistData(ac))

        return {
            inscribed,
            liked,
        }
    }

    async getInscribedCount(activityId: number) {
        return this.prisma.userInterestedActivity.count({
            where: {
                AND: [{
                    activityId
                }, {
                    relation: 'INSCRIBED'
                }]
            }
        })

    }

}