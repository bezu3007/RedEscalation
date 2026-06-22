import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { casesApi, type CasesQueryParams } from "../api/casesApi";

import { useCaseStore } from "../store/caseStore";



export const CASES_KEY = "cases";



export function useCases(extraParams?: Partial<CasesQueryParams>) {

  const { filters, page, pageSize } = useCaseStore();



  return useQuery({

    queryKey: [CASES_KEY, filters, page, pageSize, extraParams],

    queryFn: () =>

      casesApi.getAll({ ...filters, page, pageSize, ...extraParams }),

    placeholderData: (prev) => prev,

  });

}



export function useCase(id: number | null) {

  return useQuery({

    queryKey: [CASES_KEY, id],

    queryFn: () => casesApi.getById(id!),

    enabled: id !== null,

  });

}



export function useCreateCase() {

  const qc = useQueryClient();

  return useMutation({

    mutationFn: casesApi.create,

    onSuccess: () => qc.invalidateQueries({ queryKey: [CASES_KEY] }),

  });

}



export function useUpdateCase() {

  const qc = useQueryClient();

  return useMutation({

    mutationFn: ({ id, body }: { id: number; body: Parameters<typeof casesApi.update>[1] }) =>

      casesApi.update(id, body),

    onSuccess: (data) => {

      qc.invalidateQueries({ queryKey: [CASES_KEY] });

      qc.setQueryData([CASES_KEY, data.id], data);

    },

  });

}



export function useDevelopers() {

  return useQuery({

    queryKey: ["developers"],

    queryFn: casesApi.getDevelopers,

    staleTime: 5 * 60 * 1000,

  });

}