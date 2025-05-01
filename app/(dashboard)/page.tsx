/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState } from 'react'
import { useUser } from '@/lib/hooks/user'
import {
    useActivities,
    useCreateActivity,
    useUpdateActivity,
    useDeleteActivity,
} from '@/lib/hooks/activity'
import {
    useActivityLogByDate,
    useUpdateActivityLog
} from '@/lib/hooks/activity-logs'
import {
    useStreak,
    useActivityHeatmap
} from '@/lib/hooks/streak'
import { ResponsiveCalendar } from '@nivo/calendar'
import { Calendar, Award, Settings, PlusCircle, Trash2, Edit, Activity, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/motion/accordion'

export default function Dashboard() {
    const { data: user } = useUser()
    const { data: activities, isLoading: activitiesLoading } = useActivities()
    const { mutate: createActivity } = useCreateActivity()
    const { mutate: updateActivity } = useUpdateActivity()
    const { mutate: deleteActivity } = useDeleteActivity()
    const [selectedActivityId, setSelectedActivityId] = useState('')
    const [activityName, setActivityName] = useState('')
    const [activityDescription, setActivityDescription] = useState('')
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())

    const { data: todayLog, isLoading: todayLogLoading } = useActivityLogByDate(
        selectedActivityId,
        selectedDate
    )
    const { mutate: updateLog } = useUpdateActivityLog()
    const { data: streak, isLoading: streakLoading } = useStreak(selectedActivityId)
    const { data: heatmap, isLoading: heatmapLoading } = useActivityHeatmap(selectedActivityId)

    // Handle activity selection
    const handleSelectActivity = (activityId: any) => {
        setSelectedActivityId(activityId === selectedActivityId ? '' : activityId)

        // Find and set the activity details
        const activity = activities?.find(a => a.id === activityId)
        if (activity) {
            setActivityName(activity.name)
            setActivityDescription(activity.description || '')
        }
    }

    // Handle creating a new activity
    const handleCreateActivity = () => {
        if (!activityName) return

        createActivity({
            name: activityName,
            description: activityDescription
        }, {
            onSuccess: () => {
                setActivityName('')
                setActivityDescription('')
                setShowCreateForm(false)
            }
        })
    }

    const handleUpdateActivity = () => {
        if (!selectedActivityId || !activityName) return

        updateActivity({
            id: selectedActivityId,
            name: activityName,
            description: activityDescription
        }, {
            onSuccess: () => {
                setShowSettings(false)
            }
        })
    }

    const handleDeleteActivity = () => {
        if (!selectedActivityId) return

        deleteActivity(selectedActivityId, {
            onSuccess: () => {
                setSelectedActivityId('')
                setActivityName('')
                setActivityDescription('')
                setShowSettings(false)
            }
        })
    }

    // Handle updating activity log
    const handleUpdateLog = (status: any) => {
        if (!selectedActivityId) return

        updateLog({
            activityId: selectedActivityId,
            date: selectedDate,
            status: status
        })
    }

    // Transform heatmap data for Nivo Calendar
    const formatHeatmapForNivo = () => {
        if (!heatmap || !heatmap.length) return []

        return heatmap
            .filter(item => item.date.startsWith(selectedYear))
            .map(item => ({
                day: item.date,
                value: item.value
            }))
    }

    const calendarData = formatHeatmapForNivo()
    const yearRange = {
        from: `${selectedYear}-01-01`,
        to: `${selectedYear}-12-31`
    }

    const availableYears = ["2023", "2024", "2025"]

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return "Good morning"
        if (hour < 18) return "Good afternoon"
        return "Good evening"
    }

    if (activitiesLoading) {
        return (
            <div className="flex justify-center items-center h-64 bg-black text-gray-400">
                <div className="animate-pulse flex space-x-2 items-center">
                    <div className="h-3 w-3 bg-gray-700 rounded-full"></div>
                    <div className="h-3 w-3 bg-gray-700 rounded-full"></div>
                    <div className="h-3 w-3 bg-gray-700 rounded-full"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-black text-gray-300 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-white flex items-center">
                        <Activity className="mr-2 h-5 w-5 text-gray-400" />
                        Track your Streaks
                    </h1>
                    <p className="text-gray-500 mt-1">{getGreeting()}{user ? `, ${user.email}` : ''}</p>
                </div>
                <Button
                    variant={'outline'}
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="p-2 rounded-md text-lg text-gray-300 hover:text-white hover:bg-gray-900 transition-colors"
                >
                    <PlusCircle className="h-5 w-5" />
                    Create
                </Button>
            </div>

            {showCreateForm && (
                <div className="mb-6 p-4 bg-black border border-gray-900 rounded-lg">
                    <h2 className="text-lg font-medium mb-4 text-white">Create New Activity</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">Activity Name</label>
                            <input
                                type="text"
                                placeholder="Enter activity name"
                                value={activityName}
                                onChange={(e) => setActivityName(e.target.value)}
                                className="w-full border border-gray-800 bg-black text-gray-300 rounded p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">Description (optional)</label>
                            <input
                                type="text"
                                placeholder="Enter description"
                                value={activityDescription}
                                onChange={(e) => setActivityDescription(e.target.value)}
                                className="w-full border border-gray-800 bg-black text-gray-300 rounded p-2"
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowCreateForm(false)}
                                className="px-4 py-2 border border-gray-800 text-gray-400 rounded-md hover:bg-gray-900"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateActivity}
                                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                                disabled={!activityName}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-6">
                <h2 className="text-lg font-medium mb-3 text-gray-300 flex items-center">
                    <Activity className="mr-2 h-4 w-4 text-gray-400" />
                    Your Activities
                </h2>
                {(activities ?? []).length > 0 ? (
                    <Accordion
                        className="flex w-full flex-col border border-gray-900 rounded-lg overflow-hidden"
                        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                        variants={{
                            expanded: { opacity: 1, scale: 1 },
                            collapsed: { opacity: 0, scale: 0.7 }
                        }}
                        expandedValue={selectedActivityId}
                        onValueChange={(value) => handleSelectActivity(String(value) || '')}
                    >
                        {(activities ?? []).map((activity) => (
                            <AccordionItem
                                key={activity.id}
                                value={activity.id}
                                className="border-b border-gray-900 last:border-b-0"
                            >
                                <AccordionTrigger
                                    className="flex items-center w-full p-3 text-left text-gray-300 hover:bg-gray-900 hover:text-white cursor-pointer"
                                >
                                    <div className="flex items-center w-full">
                                        <ChevronRight className="h-4 w-4 text-gray-500 transition-transform duration-200 group-data-expanded:rotate-90" />
                                        <div className="ml-2">{activity.name}</div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="origin-left p-3 bg-gray-900/30">
                                    {activity.description && (
                                        <p className="text-gray-500 mb-4">{activity.description}</p>
                                    )}
                                    {selectedActivityId === activity.id && renderActivityDashboard()}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <div className="text-center py-8 border border-gray-900 rounded-lg">
                        <p className="text-gray-500 mb-3">No activities found</p>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 inline-flex items-center"
                        >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Create Your First Activity
                        </button>
                    </div>
                )}
            </div>
        </div>
    )

    function renderActivityDashboard() {
        return (
            <>
                {/* Activity Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-white">{activityName}</h2>
                    </div>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 rounded-md text-gray-400 hover:text-gray-300 hover:bg-gray-900"
                    >
                        <Settings className="h-5 w-5" />
                    </button>
                </div>

                {/* Activity Settings */}
                {showSettings && (
                    <div className="mb-6 p-4 bg-black border border-gray-900 rounded-lg">
                        <h3 className="text-lg font-medium mb-4 text-white">Activity Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Activity Name</label>
                                <input
                                    type="text"
                                    value={activityName}
                                    onChange={(e) => setActivityName(e.target.value)}
                                    className="w-full border border-gray-800 bg-black text-gray-300 rounded p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={activityDescription}
                                    onChange={(e) => setActivityDescription(e.target.value)}
                                    className="w-full border border-gray-800 bg-black text-gray-300 rounded p-2"
                                />
                            </div>
                            <div className="flex justify-between">
                                <button
                                    onClick={handleDeleteActivity}
                                    className="px-3 py-1.5 text-red-500 border border-red-900 rounded-md hover:bg-red-900/20 inline-flex items-center"
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                </button>
                                <div className="space-x-3">
                                    <button
                                        onClick={() => setShowSettings(false)}
                                        className="px-4 py-2 border border-gray-800 text-gray-400 rounded-md hover:bg-gray-900"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateActivity}
                                        className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 inline-flex items-center"
                                    >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Update
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="bg-black shadow-lg rounded-lg p-6 mb-8 border border-gray-900">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                        <div className="mb-4 sm:mb-0">
                            <h2 className="text-lg font-medium mb-1 flex items-center text-gray-300">
                                <Award className="mr-2 h-4 w-4 text-gray-400" />
                                <span>Current Streak</span>
                            </h2>
                            <div className="flex items-end">
                                <span className="text-4xl font-bold text-white">
                                    {streakLoading ? '...' : streak?.current_streak || 0}
                                </span>
                                <span className="text-gray-500 ml-2 mb-1">days</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                                Best: {streakLoading ? '...' : streak?.max_streak || 0} days
                            </div>
                        </div>

                        <div className="border-l border-gray-900 h-16 mx-4 hidden sm:block"></div>

                        {/* Status Update Section */}
                        <div className="text-center">
                            <h2 className="text-lg font-medium mb-3 flex items-center justify-center text-gray-300">
                                <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                                {selectedDate === new Date().toISOString().split('T')[0] ? "Today's Status" : `Status for ${selectedDate}`}
                            </h2>

                            <div className="mb-4">
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    max={new Date().toISOString().split('T')[0]}
                                    className="border border-gray-800 bg-black text-gray-300 rounded p-2 text-center w-full"
                                />
                            </div>

                            {todayLogLoading ? (
                                <div className="py-2 px-4 bg-black rounded-md animate-pulse">Loading...</div>
                            ) : todayLog && todayLog.status !== 'none' ? (
                                <div className="flex items-center justify-center space-x-3">
                                    <div className={`py-1.5 px-3 rounded-md ${todayLog.status === 'success' ? 'bg-black text-green-500 border border-green-900' : 'bg-black text-red-500 border border-red-900'}`}>
                                        {todayLog.status === 'success' ? 'Success ✓' : 'Relapsed ✗'}
                                    </div>
                                    <button
                                        onClick={() => {
                                            handleUpdateLog(todayLog.status === 'success' ? 'relapsed' : 'success')
                                        }}
                                        className="py-1.5 px-3 bg-black hover:bg-gray-900 text-gray-300 border border-gray-800 rounded-md transition-colors"
                                    >
                                        Change
                                    </button>
                                </div>
                            ) : (
                                <div className="space-x-3">
                                    <button
                                        onClick={() => handleUpdateLog('success')}
                                        className="py-1.5 px-3 bg-black hover:bg-gray-900 text-green-500 border border-green-900 rounded-md transition-colors"
                                    >
                                        Success
                                    </button>
                                    <button
                                        onClick={() => handleUpdateLog('relapsed')}
                                        className="py-1.5 px-3 bg-black hover:bg-gray-900 text-red-500 border border-red-900 rounded-md transition-colors"
                                    >
                                        Relapsed
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Heatmap Calendar */}
                    <div className="mt-10">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-medium flex items-center text-gray-300">
                                <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                                Your Progress
                            </h2>

                            <div className="w-28">
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="bg-black border-gray-900 text-gray-300 h-8 text-sm rounded-md p-1 w-full border"
                                >
                                    {availableYears.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {heatmapLoading ? (
                            <div className="text-center py-4 text-gray-600">Loading...</div>
                        ) : calendarData.length > 0 ? (
                            <div style={{ height: 320 }} className="mt-6">
                                <ResponsiveCalendar
                                    data={calendarData}
                                    from={yearRange.from}
                                    to={yearRange.to}
                                    emptyColor="#080808"
                                    colors={['#991b1b', '#080808', '#20cd2f']}
                                    margin={{ top: 30, right: 20, bottom: 20, left: 20 }}
                                    yearSpacing={40}
                                    monthBorderColor="#000000"
                                    monthLegendOffset={10}
                                    dayBorderWidth={1}
                                    dayBorderColor="#111111"
                                    legends={[
                                        {
                                            anchor: 'bottom-right',
                                            direction: 'row',
                                            translateY: 36,
                                            itemCount: 3,
                                            itemWidth: 60,
                                            itemHeight: 18,
                                            itemsSpacing: 5,
                                            itemDirection: 'right-to-left',
                                            symbolSize: 12,
                                            symbolShape: 'square',
                                        }
                                    ]}
                                    theme={{
                                        text: { color: '#ffffff', fontSize: 14 },
                                        axis: {
                                            domain: {
                                                line: {
                                                    stroke: '#111111',
                                                    strokeWidth: 1,
                                                },
                                            },
                                            ticks: {
                                                line: {
                                                    stroke: '#111111',
                                                    strokeWidth: 1,
                                                },
                                            },
                                        },
                                        tooltip: {
                                            container: {
                                                background: '#000000',
                                                color: '#e5e7eb',
                                                fontSize: 12,
                                                borderRadius: 4,
                                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.5)',
                                                padding: '8px 12px',
                                                border: '1px solid #111111'
                                            },
                                        },
                                    }}
                                    tooltip={({ day, value, color }) => (
                                        <div>
                                            <div className="font-medium">{day}</div>
                                            <div className="flex items-center mt-1">
                                                <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: color }}></div>
                                                <span>{Number(value) === 1 ? 'Success' : Number(value) === -1 ? 'Relapsed' : 'Not tracked'}</span>
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>
                        ) : (
                            <div className="text-center py-12 rounded-lg bg-black border border-gray-900 text-gray-600">
                                No data available for {selectedYear}. Start tracking your progress.
                            </div>
                        )}
                    </div>
                </div>
            </>
        )
    }
}