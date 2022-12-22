import { Injectable, NotFoundException } from '@nestjs/common';
import { ActivityState, Week } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { getDaysTillNext, getNext4dates, weekEnumToNumber } from 'src/util/dateManagementFunctions';


interface activityDates {
    id: number, startDate: Date, endDate: Date, address: string, plan: { startTime: Date, endTime: Date, days: Week[] }[]
}

interface createEvent {
    startDate: Date,
    endDate: Date,
    address: string,
    activityId: number,
}

@Injectable()
export class EventService {

    constructor(private readonly prisma: PrismaService) { }

    async changeStatus(id: number, status: ActivityState) {
        const exists = await this.prisma.event.findUnique({
            where: { id }
        })
        if (!exists) throw new NotFoundException('No se pudo encontrar el evento en la base de datos')

        //TODO: si el estado es CANCELED, poner fecha de baja
        return await this.prisma.event.update({
            where: { id },
            data: {
                state: status
            }
        })
    }


    async createFourEach(activity: activityDates) {
        const { plan } = activity;

        const eventDates = plan.flatMap((plan) => {
            const dates = plan.days.flatMap((day) => {
                const numberedDay = weekEnumToNumber(day)
                let daysTillNext = getDaysTillNext(numberedDay, activity.startDate)
                return getNext4dates(daysTillNext, plan.startTime, plan.endTime, activity.startDate, activity.endDate);
            })
            return dates
        })
        const createEventArray: createEvent[] = eventDates.map((eventDates) => {
            return {
                activityId: activity.id,
                address: activity.address,
                startDate: eventDates[0],
                endDate: eventDates[1]
            }
        })



        return await this.prisma.event.createMany({
            data: createEventArray
        })

    }




}


