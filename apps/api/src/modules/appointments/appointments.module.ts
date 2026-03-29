import { Module } from '@nestjs/common';
import { AppointmentReschedulingService } from './appointment-rescheduling.service';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';

@Module({
  controllers: [AppointmentsController],
  providers: [AppointmentsService, AppointmentReschedulingService],
  exports: [AppointmentsService, AppointmentReschedulingService],
})
export class AppointmentsModule {}
