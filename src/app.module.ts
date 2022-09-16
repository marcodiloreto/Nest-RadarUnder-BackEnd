import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { UserInterceptor } from './user/interceptor/user.interceptor';
import { ActivityModule } from './activity/activity.module';
import { DisciplineModule } from './discipline/discipline.module';
import { AuthGuard } from './user/auth/guards/auth.guard';
import { EventModule } from './event/event.module';

@Module({
  imports: [UserModule, PrismaModule, ActivityModule, DisciplineModule, EventModule],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_INTERCEPTOR,
    useClass: UserInterceptor
  }, {
      provide: APP_GUARD,
      useClass: AuthGuard
    }],
})
export class AppModule { }
