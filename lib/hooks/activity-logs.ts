import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getActivityLogs,
    getActivityLogByDate,
    createOrUpdateActivityLog,
} from '@/lib/supabase/activities';

export function useActivityLogs(activityId: string, startDate?: string, endDate?: string) {
    return useQuery({
      queryKey: ['activityLogs', activityId, startDate, endDate],
      queryFn: () => getActivityLogs(activityId, startDate, endDate),
      enabled: !!activityId, // Only run query if activityId is provided
    });
  }
  
  export function useActivityLogByDate(activityId: string, date: string) {
    return useQuery({
      queryKey: ['activityLog', activityId, date],
      queryFn: () => getActivityLogByDate(activityId, date),
      enabled: !!activityId && !!date, // Only run query if both params are provided
    });
  }
  
  export function useUpdateActivityLog() {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: ({ 
        activityId, 
        date, 
        status 
      }: { 
        activityId: string, 
        date: string, 
        status: 'success' | 'relapsed' | 'none' 
      }) => createOrUpdateActivityLog(activityId, date, status),
      onSuccess: (data) => {
        // Invalidate related queries
        queryClient.invalidateQueries({ 
          queryKey: ['activityLogs', data.activity_id] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['activityLog', data.activity_id, data.date] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['streak', data.activity_id] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['heatmap', data.activity_id] 
        });
      }
    });
  }
  