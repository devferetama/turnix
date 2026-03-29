"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useCurrentSession } from "@/modules/auth/hooks/use-current-session";
import { appointmentsQueryKeys } from "@/modules/appointments/constants/appointments.constants";
import {
  cancelAppointment,
  createAppointment,
  rescheduleAppointment,
  updateAppointmentStatus,
} from "@/modules/appointments/services/appointments-api";
import type {
  AppointmentRecord,
  CancelAppointmentInput,
  CreateAppointmentInput,
  RescheduleAppointmentInput,
  UpdateAppointmentStatusInput,
} from "@/modules/appointments/types/appointment.types";

export function useCreateAppointmentMutation() {
  const queryClient = useQueryClient();
  const { data: session } = useCurrentSession();
  const tenantId = session?.user.tenantId;

  return useMutation({
    mutationFn: (input: CreateAppointmentInput) =>
      createAppointment({
        input,
        tenantId,
        accessToken: session?.accessToken,
      }),
    onSuccess: (appointment) => {
      queryClient.setQueryData(
        appointmentsQueryKeys.detail(tenantId, appointment.id),
        appointment,
      );
      void queryClient.invalidateQueries({
        queryKey: appointmentsQueryKeys.all,
      });
    },
  });
}

export function useUpdateAppointmentStatusMutation(appointmentId: string) {
  const queryClient = useQueryClient();
  const { data: session } = useCurrentSession();
  const tenantId = session?.user.tenantId;

  return useMutation({
    mutationFn: (input: UpdateAppointmentStatusInput) =>
      updateAppointmentStatus({
        id: appointmentId,
        input,
        tenantId,
        accessToken: session?.accessToken,
      }),
    onSuccess: (appointment: AppointmentRecord) => {
      queryClient.setQueryData(
        appointmentsQueryKeys.detail(tenantId, appointment.id),
        appointment,
      );
      void queryClient.invalidateQueries({
        queryKey: appointmentsQueryKeys.all,
      });
    },
  });
}

export function useCancelAppointmentMutation(appointmentId: string) {
  const queryClient = useQueryClient();
  const { data: session } = useCurrentSession();
  const tenantId = session?.user.tenantId;

  return useMutation({
    mutationFn: (input: CancelAppointmentInput) =>
      cancelAppointment({
        id: appointmentId,
        input,
        tenantId,
        accessToken: session?.accessToken,
      }),
    onSuccess: (appointment: AppointmentRecord) => {
      queryClient.setQueryData(
        appointmentsQueryKeys.detail(tenantId, appointment.id),
        appointment,
      );
      void queryClient.invalidateQueries({
        queryKey: appointmentsQueryKeys.all,
      });
    },
  });
}

export function useRescheduleAppointmentMutation(appointmentId: string) {
  const queryClient = useQueryClient();
  const { data: session } = useCurrentSession();
  const tenantId = session?.user.tenantId;

  return useMutation({
    mutationFn: (input: RescheduleAppointmentInput) =>
      rescheduleAppointment({
        id: appointmentId,
        input,
        tenantId,
        accessToken: session?.accessToken,
      }),
    onSuccess: (appointment: AppointmentRecord) => {
      queryClient.setQueryData(
        appointmentsQueryKeys.detail(tenantId, appointment.id),
        appointment,
      );
      void queryClient.invalidateQueries({
        queryKey: appointmentsQueryKeys.all,
      });
    },
  });
}
