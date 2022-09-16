import {CallHandler, ExecutionContext, NestInterceptor} from '@nestjs/common'
import { Observable } from 'rxjs'
import * as jwt from 'jsonwebtoken'

export class UserInterceptor implements NestInterceptor{
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest()
        const codedJwt = request.headers?.authorization?.split('Bearer ')[1]
        request.user = jwt.decode(codedJwt);
        return next.handle()
    }
}