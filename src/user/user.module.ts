import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service'
import { UserService } from './user.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserService],
  imports: [PrismaModule],
  exports: [UserService]
})
export class UserModule { }
