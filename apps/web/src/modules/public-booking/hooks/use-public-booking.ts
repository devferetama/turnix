"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { publicBookingQueryKeys } from "@/modules/public-booking/constants/public-booking.constants";
import { useCurrentTenant } from "@/modules/tenant/hooks/use-current-tenant";
import {
  cancelPublicAppointmentByCode,
  createPublicBooking,
  getPublicAppointmentByCode,
  getPublicServices,
  getPublicSlots,
  reschedulePublicAppointmentByCode,
} from "@/modules/public-booking/services/public-booking-api";
import { useBookingFlowStore } from "@/modules/public-booking/store/booking-flow-store";
import type {
  CancelPublicAppointmentInput,
  CreatePublicAppointmentInput,
  ListPublicServiceSlotsQuery,
  ListPublicServicesQuery,
  ReschedulePublicAppointmentInput,
} from "@/modules/public-booking/types/public-booking.types";

export function usePublicServicesQuery(query: ListPublicServicesQuery = {}) {
  const tenant = useCurrentTenant();

  return useQuery({
    queryKey: publicBookingQueryKeys.services(tenant.slug, query),
    queryFn: () => getPublicServices(query),
    placeholderData: keepPreviousData,
  });
}

export function usePublicSlotsQuery(
  serviceId?: string,
  query: ListPublicServiceSlotsQuery = {},
) {
  const tenant = useCurrentTenant();

  return useQuery({
    queryKey: publicBookingQueryKeys.slots(tenant.slug, serviceId, query),
    queryFn: () => getPublicSlots(serviceId ?? "", query),
    enabled: Boolean(serviceId),
    placeholderData: keepPreviousData,
  });
}

export function useCreatePublicBookingMutation() {
  const queryClient = useQueryClient();
  const tenant = useCurrentTenant();

  return useMutation({
    mutationFn: (input: CreatePublicAppointmentInput) => createPublicBooking(input),
    onSuccess: async (_data, variables: CreatePublicAppointmentInput) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...publicBookingQueryKeys.all(tenant.slug), "slots"],
        }),
        queryClient.invalidateQueries({
          queryKey: [...publicBookingQueryKeys.all(tenant.slug), "services"],
        }),
      ]);

      if (variables.serviceId) {
        await queryClient.invalidateQueries({
          queryKey: publicBookingQueryKeys.slots(tenant.slug, variables.serviceId),
        });
      }
    },
  });
}

export function usePublicAppointmentQuery(code?: string) {
  const tenant = useCurrentTenant();

  return useQuery({
    queryKey: publicBookingQueryKeys.appointment(tenant.slug, code),
    queryFn: () => getPublicAppointmentByCode(code ?? ""),
    enabled: Boolean(code?.trim()),
  });
}

export function useCancelPublicAppointmentMutation() {
  const queryClient = useQueryClient();
  const tenant = useCurrentTenant();

  return useMutation({
    mutationFn: ({
      code,
      payload,
    }: {
      code: string;
      payload: CancelPublicAppointmentInput;
    }) => cancelPublicAppointmentByCode(code, payload),
    onSuccess: async (appointment, variables) => {
      queryClient.setQueryData(
        publicBookingQueryKeys.appointment(tenant.slug, variables.code),
        appointment,
      );

      await queryClient.invalidateQueries({
        queryKey: publicBookingQueryKeys.appointment(tenant.slug, variables.code),
      });
    },
  });
}

export function useReschedulePublicAppointmentMutation() {
  const queryClient = useQueryClient();
  const tenant = useCurrentTenant();

  return useMutation({
    mutationFn: ({
      code,
      payload,
    }: {
      code: string;
      payload: ReschedulePublicAppointmentInput;
    }) => reschedulePublicAppointmentByCode(code, payload),
    onSuccess: async (appointment, variables) => {
      queryClient.setQueryData(
        publicBookingQueryKeys.appointment(tenant.slug, variables.code),
        appointment,
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: publicBookingQueryKeys.appointment(tenant.slug, variables.code),
        }),
        queryClient.invalidateQueries({
          queryKey: [...publicBookingQueryKeys.all(tenant.slug), "slots"],
        }),
      ]);
    },
  });
}

export function useBookingFlow() {
  return useBookingFlowStore();
}
