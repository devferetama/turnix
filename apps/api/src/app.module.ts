import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantResolutionMiddleware } from './common/tenant/tenant-resolution.middleware';
import { TenantResolutionService } from './common/tenant/tenant-resolution.service';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { BranchesModule } from './modules/branches/branches.module';
import { PublicBookingModule } from './modules/public-booking/public-booking.module';
import { SchedulingModule } from './modules/scheduling/scheduling.module';
import { ServicesModule } from './modules/services/services.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    AuthModule,
    AppointmentsModule,
    BranchesModule,
    PublicBookingModule,
    SchedulingModule,
    ServicesModule,
  ],
  controllers: [AppController],
  providers: [AppService, TenantResolutionService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantResolutionMiddleware).forRoutes('*');
  }
}
