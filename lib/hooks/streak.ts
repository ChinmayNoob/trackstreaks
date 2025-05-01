import { useQuery } from '@tanstack/react-query';
import {
    getStreak,
    getActivityHeatmap,
} from '@/lib/supabase/activities';

export function useStreak(activityId: string) {
    return useQuery({
      queryKey: ['streak', activityId],
      queryFn: () => getStreak(activityId),
      enabled: !!activityId, // Only run query if activityId is provided
    });
  }
  
  export function useActivityHeatmap(activityId: string, startDate?: string, endDate?: string) {
    return useQuery({
      queryKey: ['heatmap', activityId, startDate, endDate],
      queryFn: () => getActivityHeatmap(activityId, startDate, endDate),
      enabled: !!activityId, // Only run query if activityId is provided
    });
  }