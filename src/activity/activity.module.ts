import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { EventModule } from 'src/event/event.module';

@Module({
  providers: [ActivityService],
  controllers: [ActivityController],
  imports: [PrismaModule, UserModule, EventModule]
})
export class ActivityModule { }
