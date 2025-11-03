"use client"

import { useState, useEffect } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { reportsAPI, sessionsAPI } from "@/lib/api"
import { Users, Calendar, TrendingUp, Activity, AlertCircle } from "lucide-react"
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function DashboardPage() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [adherenceData, setAdherenceData] = useState<any[]>([])
  const [enrollmentData, setEnrollmentData] = useState<any[]>([])
  const [sessionStatusData, setSessionStatusData] = useState<any[]>([])
  const [recentSessions, setRecentSessions] = useState<any[]>([])
  const [weeklyTrendData, setWeeklyTrendData] = useState<any[]>([])

  useEffect(() => {
    if (token) {
      loadDashboardData()
    }
  }, [token])

  const calculateWeeklyTrends = (sessions: any[]) => {
    if (!sessions || sessions.length === 0) {
      return [
        { week: "Week 1", patients: 0, sessions: 0 },
        { week: "Week 2", patients: 0, sessions: 0 },
        { week: "Week 3", patients: 0, sessions: 0 },
        { week: "Week 4", patients: 0, sessions: 0 },
      ]
    }

    const now = new Date()
    const weeks = []
    
    // Calculate last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const weekEnd = new Date(now)
      weekEnd.setDate(now.getDate() - (i * 7))
      weekEnd.setHours(23, 59, 59, 999)
      
      const weekStart = new Date(weekEnd)
      weekStart.setDate(weekEnd.getDate() - 6)
      weekStart.setHours(0, 0, 0, 0)
      
      weeks.push({
        start: weekStart,
        end: weekEnd,
        label: `Week ${4 - i}`
      })
    }

    // Group sessions by week
    const weeklyData = weeks.map((week, index) => {
      const weekSessions = sessions.filter((session: any) => {
        const sessionDate = new Date(session.date)
        return sessionDate >= week.start && sessionDate <= week.end
      })
      
      // Count unique patients in this week
      const uniquePatients = new Set(
        weekSessions.map((s: any) => s.patientId).filter((id: any) => id)
      )
      
      return {
        week: week.label,
        patients: uniquePatients.size,
        sessions: weekSessions.length
      }
    })
    
    return weeklyData
  }

  const loadDashboardData = async () => {
    if (!token) return
    
    try {
      setLoading(true)
      const [dashboardStats, adherence, enrollment, sessionStatus, sessions] = await Promise.all([
        reportsAPI.getDashboardStats(token),
        reportsAPI.getAdherenceData(token),
        reportsAPI.getEnrollmentData(token),
        reportsAPI.getSessionStatusData(token),
        sessionsAPI.getAll(token, {}),
      ])

      setStats(dashboardStats)
      setAdherenceData(adherence)
      setEnrollmentData(enrollment)
      setSessionStatusData(sessionStatus.map((s: any) => ({
        ...s,
        color: s.name === "Attended" ? "hsl(var(--chart-1))" : s.name === "Missed" ? "hsl(var(--chart-2))" : "hsl(var(--chart-3))",
      })))
      setRecentSessions(sessions.slice(0, 5))
      
      // Calculate weekly trends from real session data
      const weeklyTrends = calculateWeeklyTrends(sessions)
      setWeeklyTrendData(weeklyTrends)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <SidebarNav />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />

        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">Overview of your healthcare management system</p>
            </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{stats.totalPatients}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-600 font-medium">{stats.activePatients} active</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPrograms}</div>
                <p className="text-xs text-muted-foreground mt-1">{stats.totalEnrollments} total enrollments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Adherence</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageAdherence}%</div>
                <Progress value={stats.averageAdherence} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue Meds</CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{stats.overduePrescriptions}</div>
                <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Patient Adherence Rates</CardTitle>
                <CardDescription>Individual patient medication adherence</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    adherence: {
                      label: "Adherence",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[250px] md:h-[300px]"
                >
                  <BarChart data={adherenceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="adherence" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Program Enrollment</CardTitle>
                <CardDescription>Number of patients enrolled per program</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    enrolled: {
                      label: "Enrolled",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[250px] md:h-[300px]"
                >
                  <BarChart data={enrollmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="enrolled" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Session Status Distribution</CardTitle>
                <CardDescription>Breakdown of session attendance</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    attended: {
                      label: "Attended",
                      color: "hsl(var(--chart-1))",
                    },
                    missed: {
                      label: "Missed",
                      color: "hsl(var(--chart-2))",
                    },
                    canceled: {
                      label: "Canceled",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-[250px] md:h-[300px]"
                >
                  <PieChart>
                    <Pie
                      data={sessionStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sessionStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend 
                      content={({ payload }) => {
                        const total = sessionStatusData.reduce((sum: number, item: any) => sum + item.value, 0);
                        return (
                          <div className="flex flex-wrap justify-center gap-4 pt-4">
                            {payload?.map((entry: any, index: number) => {
                              const percentage = total > 0 ? ((entry.payload.value / total) * 100).toFixed(0) : 0;
                              return (
                                <div key={`legend-${index}`} className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span className="text-xs text-muted-foreground dark:text-gray-400">
                                    {entry.value} {percentage}%
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Trends</CardTitle>
                <CardDescription>Patient and session activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    patients: {
                      label: "Patients",
                      color: "hsl(var(--chart-1))",
                    },
                    sessions: {
                      label: "Sessions",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[250px] md:h-[300px]"
                >
                  <LineChart data={weeklyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="patients"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sessions"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>Latest patient session activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSessions.length > 0 ? (
                  recentSessions.map((session: any) => (
                    <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 last:border-0 gap-2 sm:gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                          <Activity className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{session.patient?.name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground truncate">{session.program?.name || 'Unknown Program'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4">
                        <p className="text-xs sm:text-sm text-muted-foreground">{new Date(session.date).toLocaleDateString()}</p>
                        <Badge
                          variant={
                            session.status === "attended"
                              ? "default"
                              : session.status === "missed"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {session.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No recent sessions</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
