"use client"

import { useState, useEffect } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/lib/auth-context"
import { reportsAPI, patientsAPI, programsAPI, sessionsAPI, medicationsAPI } from "@/lib/api"
import { Download, FileText, TrendingUp, Users, Calendar, Pill, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ReportsPage() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [reportType, setReportType] = useState<"patients" | "programs" | "sessions" | "prescriptions">("patients")
  const [dateRange, setDateRange] = useState("all")
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [reportData, setReportData] = useState<any[]>([])

  useEffect(() => {
    if (token) {
      loadData()
    }
  }, [token, reportType])

  const loadData = async () => {
    if (!token) return
    try {
      setLoading(true)
      const [statsData] = await Promise.all([reportsAPI.getDashboardStats(token)])

      setStats(statsData)

      // Load report preview data
      switch (reportType) {
        case "patients":
          const patients = await patientsAPI.getAll(token)
          setReportData(patients)
          break
        case "programs":
          const programs = await programsAPI.getAll(token)
          setReportData(programs)
          break
        case "sessions":
          const sessions = await sessionsAPI.getAll(token)
          setReportData(sessions)
          break
        case "prescriptions":
          const prescriptions = await medicationsAPI.getAllPrescriptions(token)
          setReportData(prescriptions)
          break
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!token) return

    try {
      setExporting(true)
      const startDate = dateRange === "all" ? undefined : getDateRange(dateRange).start
      const endDate = dateRange === "all" ? undefined : getDateRange(dateRange).end

      switch (reportType) {
        case "patients":
          await reportsAPI.exportPatients(token, startDate, endDate)
          break
        case "programs":
          await reportsAPI.exportPrograms(token, startDate, endDate)
          break
        case "sessions":
          await reportsAPI.exportSessions(token, startDate, endDate)
          break
        case "prescriptions":
          await reportsAPI.exportPrescriptions(token, startDate, endDate)
          break
      }

      toast({ 
        title: "Success", 
        description: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report exported successfully`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export report",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const getDateRange = (range: string) => {
    const today = new Date()
    const start = new Date()

    switch (range) {
      case "month":
        start.setMonth(start.getMonth() - 1)
        break
      case "quarter":
        start.setMonth(start.getMonth() - 3)
        break
      case "year":
        start.setFullYear(start.getFullYear() - 1)
        break
      default:
        return { start: undefined, end: undefined }
    }

    return {
      start: start.toISOString().split("T")[0],
      end: today.toISOString().split("T")[0],
    }
  }

  if (loading || !stats) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <SidebarNav />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  const calculateInsights = () => {
    if (reportType === "patients" && reportData.length > 0) {
      const activeCount = reportData.filter((p: any) => p.status === "active").length
      const avgPrograms =
        reportData.reduce((sum: number, p: any) => sum + (p.patientPrograms?.length || p.programs?.length || 0), 0) /
        reportData.length

      return {
        retentionRate: Math.round((activeCount / reportData.length) * 100),
        avgPrograms: avgPrograms.toFixed(1),
      }
    }

    if (reportType === "sessions" && reportData.length > 0) {
      const attended = reportData.filter((s: any) => s.status === "attended").length
      const missed = reportData.filter((s: any) => s.status === "missed").length
      return {
        attendanceRate: Math.round((attended / (attended + missed)) * 100) || 0,
      }
    }

    if (reportType === "prescriptions" && reportData.length > 0) {
      const overdue = reportData.filter((p: any) => p.status === "overdue").length
      return {
        compliance: Math.round(((reportData.length - overdue) / reportData.length) * 100) || 0,
      }
    }

    return {}
  }

  const insights = calculateInsights()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">Generate and export system reports</p>
          </div>

          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPatients}</div>
                <p className="text-xs text-muted-foreground mt-1">{stats.activePatients} active patients</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Programs</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPrograms}</div>
                <p className="text-xs text-muted-foreground mt-1">{stats.totalEnrollments} enrollments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Session Attendance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.attendedSessions}</div>
                <p className="text-xs text-muted-foreground mt-1">{stats.missedSessions} missed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Adherence</CardTitle>
                <Pill className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageAdherence}%</div>
                <p className="text-xs text-muted-foreground mt-1">{stats.overduePrescriptions} overdue</p>
              </CardContent>
            </Card>
          </div>

          {/* Export Section */}
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>Generate and download reports in CSV format</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patients">Patient Report</SelectItem>
                      <SelectItem value="programs">Program Report</SelectItem>
                      <SelectItem value="sessions">Session Report</SelectItem>
                      <SelectItem value="prescriptions">Prescription Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="quarter">Last Quarter</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleExport} disabled={exporting} className="w-full sm:w-auto">
                  {exporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Report Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
              <CardDescription>Preview of {reportType} data</CardDescription>
            </CardHeader>
            <CardContent>
              {reportType === "patients" && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Assigned Staff</TableHead>
                      <TableHead>Adherence</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <p className="text-muted-foreground">No patients found.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      reportData.map((patient: any) => (
                        <TableRow key={patient.id}>
                          <TableCell className="font-medium">{patient.name}</TableCell>
                          <TableCell>{patient.email}</TableCell>
                          <TableCell>{patient.assignedStaff?.name || "N/A"}</TableCell>
                          <TableCell>{patient.adherenceRate || 0}%</TableCell>
                          <TableCell>
                            <Badge variant={patient.status === "active" ? "default" : "secondary"}>
                              {patient.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                </div>
              )}

              {reportType === "programs" && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                    <TableRow>
                      <TableHead>Program Name</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Sessions</TableHead>
                      <TableHead>Enrolled</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <p className="text-muted-foreground">No programs found.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      reportData.map((program: any) => (
                        <TableRow key={program.id}>
                          <TableCell className="font-medium">{program.name}</TableCell>
                          <TableCell className="capitalize">{program.frequency}</TableCell>
                          <TableCell>{program.sessionsCount}</TableCell>
                          <TableCell>{program.patientPrograms?.length || program.enrolledPatients || 0}</TableCell>
                          <TableCell>{new Date(program.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                </div>
              )}

              {reportType === "sessions" && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                    <TableRow>
                      <TableHead>Program</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <p className="text-muted-foreground">No sessions found.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      reportData.map((session: any) => (
                        <TableRow key={session.id}>
                          <TableCell className="font-medium">{session.program?.name || "Unknown"}</TableCell>
                          <TableCell>{session.patient?.name || "Unknown"}</TableCell>
                          <TableCell>{new Date(session.date).toLocaleDateString()}</TableCell>
                          <TableCell>
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
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                </div>
              )}

              {reportType === "prescriptions" && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Collected</TableHead>
                      <TableHead>Next Due</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <p className="text-muted-foreground">No prescriptions found.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      reportData.map((prescription: any) => (
                        <TableRow key={prescription.id}>
                          <TableCell className="font-medium">
                            {prescription.medication
                              ? `${prescription.medication.name} ${prescription.medication.dosage}`
                              : prescription.medicationName || "Unknown"}
                          </TableCell>
                          <TableCell>{prescription.patient?.name || prescription.patientName || "Unknown"}</TableCell>
                          <TableCell>{new Date(prescription.dateCollected).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(prescription.nextDueDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                prescription.status === "collected"
                                  ? "default"
                                  : prescription.status === "overdue"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {prescription.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Insights */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reportType === "patients" && (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2 gap-2">
                      <span className="text-sm text-muted-foreground">Patient Retention Rate</span>
                      <span className="font-semibold">{insights.retentionRate || 0}%</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2 gap-2">
                      <span className="text-sm text-muted-foreground">Avg. Programs per Patient</span>
                      <span className="font-semibold">{insights.avgPrograms || "0.0"}</span>
                    </div>
                  </>
                )}
                {reportType === "sessions" && (
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-sm text-muted-foreground">Session Attendance Rate</span>
                    <span className="font-semibold">{insights.attendanceRate || 0}%</span>
                  </div>
                )}
                {reportType === "prescriptions" && (
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-sm text-muted-foreground">Prescription Compliance</span>
                    <span className="font-semibold">{insights.compliance || 0}%</span>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">System Health Score</span>
                  <span className="font-semibold text-green-600">Excellent</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">Total Active Enrollments</span>
                  <span className="font-semibold">{stats.totalEnrollments}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">Completed Sessions</span>
                  <span className="font-semibold">{stats.attendedSessions}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">Active Prescriptions</span>
                  <span className="font-semibold">{reportData.length}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">System Health Score</span>
                  <span className="font-semibold text-green-600">Excellent</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
