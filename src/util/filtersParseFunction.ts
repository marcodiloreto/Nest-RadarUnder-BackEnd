import { BadRequestException } from "@nestjs/common";
import { Week } from "@prisma/client";

export function weekDaysParser(weekString: string): Week[] {
    const week: string[] = weekString.split(',');
    return week.map((item) => {
        console.log(item)
        switch (item) {
            case 'LUNES':
                return Week.LUNES
            case 'MARTES':
                return Week.MARTES
            case 'MIERCOLES':
                return Week.MIERCOLES
            case 'JUEVES':
                return Week.JUEVES
            case 'VIERNES':
                return Week.VIERNES
            case 'SABADO':
                return Week.SABADO
            case 'DOMINGO':
                return Week.DOMINGO
            default:
                throw new BadRequestException("la variable WeekDays solo acepta dias de la semana en mayuscula y separados por coma'")
        }
    })
}

export function addDaysToday(days): Date {
    var result = new Date();
    result.setDate(result.getDate() + days);
    return result;
}

export function parseRepeatable(repeatable: string): boolean {
    if (repeatable === 'true') {
        return true;
    } else if (repeatable === 'false') {
        return false
    } else {
        throw new BadRequestException("repeatable solo acepta 'true' o 'false' como valor")
    }
}
