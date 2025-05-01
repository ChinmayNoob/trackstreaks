import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityById,
  getOrCreateDefaultActivities,
} from '@/lib/supabase/activities';

export function useActivities() {
  return useQuery({
    queryKey: ['activities'],
    queryFn: getActivities,
  });
}

export function useActivity(id: string) {
  return useQuery({
    queryKey: ['activity', id],
    queryFn: () => getActivityById(id),
    enabled: !!id, // Only run query if id is provided
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ name, description }: { name: string, description?: string }) => 
      createActivity(name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    }
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, name, description }: { id: string, name: string, description?: string }) => 
      updateActivity(id, name, description),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activity', data.id] });
    }
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteActivity(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activity', variables] });
    }
  });
}

export function useDefaultActivities() {
  return useQuery({
    queryKey: ['defaultActivities'],
    queryFn: getOrCreateDefaultActivities,
  });
}