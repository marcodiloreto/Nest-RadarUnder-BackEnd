import { Week } from "@prisma/client";
import 'datejs';




export function weekEnumToNumber(day: Week) {
    const weekArray = Object.values(Week)
    for (let i = 0; i < weekArray.length; i++) {
        if (day === weekArray[i]) {
            return i;
        }
    }
}

//TODO: este metodo puede mandarse una cagada si alguien sube un evento exactamente a las 11:59:59:999 o por ahí
export function getDaysTillNext(numberedWeekDay: number, startDate: Date) {
    const date = startDate.getDay()
    if (date > numberedWeekDay) {
        const negative = numberedWeekDay - date
        return 7 + negative
    } else {
        return numberedWeekDay - date
    }
}

export function getNext4dates(daysTillNext: number, startTime: Date, endTime: Date, startDate: Date, endDate?: Date) {
    const dates: Date[][] = [];
    for (let i = 0; i < 4; i++) {

        var date = new Date(startDate).add({ days: (daysTillNext + (7 * i)) })
        console.log('days till next: ' + daysTillNext + '+' + (7 * i))
        console.log(date + " vs " + endDate)
        if (!endDate || !date.isAfter(endDate)) {
            const twoDate = []
            date.setHours(startTime.getHours())
            date.setMinutes(startTime.getMinutes())
            date.setSeconds(0), date.setMilliseconds(0)
            twoDate.push(date)
            var end = new Date(date)
            end.setHours(endTime.getHours())
            end.setMinutes(endTime.getMinutes())
            end.setSeconds(0), end.setMilliseconds(0)
            twoDate.push(end)
            dates.push(twoDate)
        } else {
            i = 4
        }
    }

    return dates
}