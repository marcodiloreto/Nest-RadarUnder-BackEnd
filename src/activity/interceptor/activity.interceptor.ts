import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";

export class ParseFormDataInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const shit = context.switchToHttp().getRequest()
        console.log('INTERCEPTOR!!!')
        console.log(JSON.stringify(shit, null, 2))
        return next.handle()
    }

}