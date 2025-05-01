/* eslint-disable prefer-const */
// lib/supabase/activities.ts
import { createClient } from '@/lib/supabase/client';

export type Activity = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type ActivityLog = {
  id: string;
  user_id: string;
  activity_id: string;
  date: string;
  status: 'success' | 'relapsed' | 'none';
  created_at: string;
  updated_at: string;
};

export type Streak = {
  id: string;
  user_id: string;
  activity_id: string;
  current_streak: number;
  max_streak: number;
  last_updated_at: string;
  created_at: string;
  updated_at: string;
};

// Activities API
export async function getActivities() {
  const supabase = createClient();
  
  // Get current authenticated user
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) throw new Error("User must be authenticated");
  
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', authData.user.id)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Activity[];
}

export async function getActivityById(id: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as Activity;
}

export async function createActivity(name: string, description?: string) {
  const supabase = createClient();
  
  // Get current authenticated user
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) throw new Error("User must be authenticated");
  
  const { data, error } = await supabase
    .from('activities')
    .insert([{ 
      name,
      description,
      user_id: authData.user.id
    }])
    .select()
    .single();
  
  if (error) throw error;
  
  // Create initial streak record
  await createInitialStreak(data.id);
  
  return data as Activity;
}

export async function updateActivity(id: string, name: string, description?: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('activities')
    .update({ name, description, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Activity;
}

export async function deleteActivity(id: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}

// Activity Logs API
export async function getActivityLogs(activityId: string, startDate?: string, endDate?: string) {
  const supabase = createClient();
  
  // Get current authenticated user
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) throw new Error("User must be authenticated");
  
  let query = supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', authData.user.id)
    .eq('activity_id', activityId);
  
  if (startDate) {
    query = query.gte('date', startDate);
  }
  
  if (endDate) {
    query = query.lte('date', endDate);
  }
  
  const { data, error } = await query.order('date', { ascending: false });
  
  if (error) throw error;
  return data as ActivityLog[];
}

export async function getActivityLogByDate(activityId: string, date: string) {
  const supabase = createClient();
  
  // Get current authenticated user
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) throw new Error("User must be authenticated");
  
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', authData.user.id)
    .eq('activity_id', activityId)
    .eq('date', date)
    .maybeSingle();
  
  if (error) throw error;
  return data as ActivityLog | null;
}

export async function createOrUpdateActivityLog(
  activityId: string,
  date: string,
  status: 'success' | 'relapsed' | 'none'
) {
  const supabase = createClient();
  
  // Get current authenticated user
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) throw new Error("User must be authenticated");
  
  // Check if log already exists for this date
  const { data: existingLog } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', authData.user.id)
    .eq('activity_id', activityId)
    .eq('date', date)
    .maybeSingle();
  
  let result;
  
  if (existingLog) {
    // Update existing log
    const { data, error } = await supabase
      .from('activity_logs')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', existingLog.id)
      .select()
      .single();
    
    if (error) throw error;
    result = data;
  } else {
    // Create new log
    const { data, error } = await supabase
      .from('activity_logs')
      .insert([{ 
        user_id: authData.user.id,
        activity_id: activityId, 
        date, 
        status 
      }])
      .select()
      .single();
    
    if (error) throw error;
    result = data;
  }
  
  // Update streak
  await updateStreak(activityId);
  
  return result as ActivityLog;
}

// Streaks API
export async function getStreak(activityId: string) {
  const supabase = createClient();
  
  // Get current authenticated user
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) throw new Error("User must be authenticated");
  
  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', authData.user.id)
    .eq('activity_id', activityId)
    .single();
  
  if (error) throw error;
  return data as Streak;
}

async function createInitialStreak(activityId: string) {
  const supabase = createClient();
  
  // Get current authenticated user
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) throw new Error("User must be authenticated");
  
  const { error } = await supabase
    .from('streaks')
    .insert([{ 
      activity_id: activityId,
      user_id: authData.user.id,
      current_streak: 0, 
      max_streak: 0 
    }]);
  
  if (error) throw error;
  return true;
}

export async function updateStreak(activityId: string) {
  const supabase = createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get current authenticated user
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) throw new Error("User must be authenticated");
  const userId = authData.user.id;
  
  // Get all logs for this activity, sorted by date
  const { data: logs, error: logsError } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('activity_id', activityId)
    .order('date', { ascending: false });
  
  if (logsError) throw logsError;
  
  // Calculate current streak
  let currentStreak = 0;
  let date = new Date(today);
  
  // Check if today's entry exists and is a success
  const todayFormatted = today.toISOString().split('T')[0];
  const todayLog = logs.find(log => log.date === todayFormatted);
  
  // If today has a success, start counting from today
  if (todayLog && todayLog.status === 'success') {
    currentStreak = 1;
    date.setDate(date.getDate() - 1);
  } else {
    // If today doesn't have a success, start from yesterday
    date.setDate(date.getDate() - 1);
  }
  
  // Count consecutive days with 'success' status
  while (true) {
    const dateFormatted = date.toISOString().split('T')[0];
    const log = logs.find(log => log.date === dateFormatted);
    
    if (log && log.status === 'success') {
      currentStreak++;
      date.setDate(date.getDate() - 1);
    } else {
      break;
    }
  }
  
  // Get current streak record
  const { data: streakData, error: streakError } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .eq('activity_id', activityId)
    .single();
  
  if (streakError && streakError.code !== 'PGRST116') throw streakError;
  
  let maxStreak = streakData?.max_streak || 0;
  
  // Update max streak if current streak is larger
  if (currentStreak > maxStreak) {
    maxStreak = currentStreak;
  }
  
  // Update or create streak record
  if (streakData) {
    const { error: updateError } = await supabase
      .from('streaks')
      .update({
        current_streak: currentStreak,
        max_streak: maxStreak,
        last_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', streakData.id);
    
    if (updateError) throw updateError;
  } else {
    const { error: insertError } = await supabase
      .from('streaks')
      .insert([{
        user_id: userId,
        activity_id: activityId,
        current_streak: currentStreak,
        max_streak: maxStreak,
        last_updated_at: new Date().toISOString()
      }]);
    
    if (insertError) throw insertError;
  }
  
  return { currentStreak, maxStreak };
}

// Get activity heatmap data (similar to GitHub streaks)
export async function getActivityHeatmap(activityId: string, startDate?: string, endDate?: string) {
  const supabase = createClient();
  
  // Default to last 365 days if no date range is provided
  if (!startDate) {
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 365);
    startDate = defaultStartDate.toISOString().split('T')[0];
  }
  
  if (!endDate) {
    endDate = new Date().toISOString().split('T')[0];
  }
  
  const { data, error } = await supabase
    .from('activity_logs')
    .select('date, status')
    .eq('activity_id', activityId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });
  
  if (error) throw error;
  
  // Format to heatmap data
  const heatmapData = data.map(log => ({
    date: log.date,
    value: log.status === 'success' ? 1 : log.status === 'relapsed' ? -1 : 0
  }));
  
  return heatmapData;
}

// Function to initialize activities for new users or get existing ones
export async function getOrCreateDefaultActivities() {
  const supabase = createClient();
  
  // Get current authenticated user
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) throw new Error("User must be authenticated");
  
  // Get existing activities for the user
  const { data: existingActivities, error } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', authData.user.id);
  
  if (error) throw error;
  
  // If user already has activities, return them
  if (existingActivities && existingActivities.length > 0) {
    return existingActivities as Activity[];
  }
  
  const defaultActivities = [
    { name: 'Quit Smoking', description: 'Track progress in quitting smoking' },
    { name: 'Quit Alcohol', description: 'Track progress in quitting alcohol' },
    { name: 'Quit Social Media', description: 'Track progress in reducing social media usage' }
  ];
  
  // Create default activities
  const createdActivities = [];
  for (const activity of defaultActivities) {
    const created = await createActivity(activity.name, activity.description);
    createdActivities.push(created);
  }
  
  return createdActivities as Activity[];
}