"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/lib/auth-context"
import { sessionsAPI, programsAPI, patientsAPI } from "@/lib/api"
import { Plus, Calendar, Edit, Trash2, Loader2, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Session {
  id: string
  programId: string
  program?: { name: string }
  patientId: string
  patient?: { name: string }
  date: string
  status: "attended" | "missed" | "canceled"
  cancelReason?: string
  notes?: string
}

export default function SessionsPage() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [sessions, setSessions] = useState<Session[]>([])
  const [programs, setPrograms] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    programId: "all",
    patientId: "all",
    status: "all",
  })

  const [formData, setFormData] = useState({
    programId: "",
    patientId: "",
    date: "",
    status: "missed" as "attended" | "missed" | "canceled",
    cancelReason: "",
    notes: "",
  })

  useEffect(() => {
    if (token) {
      loadData()
    }
  }, [token, filters])

  const loadData = async () => {
    if (!token) return
    try {
      setLoading(true)
      const [sessionsData, programsData, patientsData] = await Promise.all([
        sessionsAPI.getAll(
          token,
          {
            programId: filters.programId !== "all" ? filters.programId : undefined,
            patientId: filters.patientId !== "all" ? filters.patientId : undefined,
            status: filters.status !== "all" ? filters.status : undefined,
          },
        ),
        programsAPI.getAll(token),
        patientsAPI.getAll(token),
      ])
      setSessions(sessionsData)
      setPrograms(programsData)
      setPatients(patientsData)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    try {
      setSubmitting(true)
      if (editingSession) {
        await sessionsAPI.update(
          editingSession.id,
          {
            programId: formData.programId,
            patientId: formData.patientId,
            date: formData.date,
            status: formData.status,
            cancelReason: formData.cancelReason || undefined,
            notes: formData.notes || undefined,
          },
          token,
        )
        toast({ 
          title: "Success", 
          description: "Session updated successfully",
        })
      } else {
        await sessionsAPI.create(
          {
            programId: formData.programId,
            patientId: formData.patientId,
            date: formData.date,
            status: formData.status,
            cancelReason: formData.cancelReason || undefined,
            notes: formData.notes || undefined,
          },
          token,
        )
        toast({ 
          title: "Success", 
          description: "Session created successfully",
        })
      }
      await loadData()
      handleDialogClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save session",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (session: Session) => {
    setEditingSession(session)
    setFormData({
      programId: session.programId,
      patientId: session.patientId,
      date: new Date(session.date).toISOString().split("T")[0],
      status: session.status,
      cancelReason: session.cancelReason || "",
      notes: session.notes || "",
    })
    setIsAddDialogOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setSessionToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!token || !sessionToDelete) return

    try {
      await sessionsAPI.delete(sessionToDelete, token)
      setDeleteDialogOpen(false)
      setSessionToDelete(null)
      toast({ 
        title: "Success", 
        description: "Session deleted successfully",
      })
      await loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete session",
        variant: "destructive",
      })
      await loadData()
    }
  }

  const handleDialogClose = () => {
    setIsAddDialogOpen(false)
    setEditingSession(null)
    setFormData({
      programId: "",
      patientId: "",
      date: "",
      status: "missed",
      cancelReason: "",
      notes: "",
    })
  }

  const handleMarkMissed = async () => {
    if (!token) return
    try {
      await sessionsAPI.markMissed(token)
      toast({ title: "Success", description: "Past sessions marked as missed" })
      await loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark missed sessions",
        variant: "destructive",
      })
    }
  }

  if (loading) {
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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Sessions</h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">Manage patient session attendance and tracking</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleMarkMissed} className="w-full sm:w-auto text-xs sm:text-sm">
                Mark Past Sessions as Missed
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleDialogClose()} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Session
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-full sm:max-w-2xl mx-4">
                  <DialogHeader>
                    <DialogTitle>{editingSession ? "Edit Session" : "Add New Session"}</DialogTitle>
                    <DialogDescription>
                      {editingSession ? "Update the session details below." : "Create a new patient session."}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="program">Program</Label>
                        <Select
                          value={formData.programId}
                          onValueChange={(value) => setFormData({ ...formData, programId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select program" />
                          </SelectTrigger>
                          <SelectContent>
                            {programs.map((program) => (
                              <SelectItem key={program.id} value={program.id}>
                                {program.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="patient">Patient</Label>
                        <Select
                          value={formData.patientId}
                          onValueChange={(value) => setFormData({ ...formData, patientId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select patient" />
                          </SelectTrigger>
                          <SelectContent>
                            {patients.map((patient) => (
                              <SelectItem key={patient.id} value={patient.id}>
                                {patient.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Session Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value: "attended" | "missed" | "canceled") =>
                            setFormData({ ...formData, status: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="attended">Attended</SelectItem>
                            <SelectItem value="missed">Missed</SelectItem>
                            <SelectItem value="canceled">Canceled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {formData.status === "canceled" && (
                      <div className="space-y-2">
                        <Label htmlFor="cancelReason">Cancel Reason</Label>
                        <Input
                          id="cancelReason"
                          placeholder="Reason for cancellation"
                          value={formData.cancelReason}
                          onChange={(e) => setFormData({ ...formData, cancelReason: e.target.value })}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Additional session notes..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={handleDialogClose} disabled={submitting}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : editingSession ? (
                          "Update"
                        ) : (
                          "Add"
                        )}{" "}
                        Session
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              value={filters.programId}
              onValueChange={(value) => setFilters({ ...filters, programId: value })}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.patientId}
              onValueChange={(value) => setFilters({ ...filters, patientId: value })}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by patient" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patients</SelectItem>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="attended">Attended</SelectItem>
                <SelectItem value="missed">Missed</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sessions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Session Records</CardTitle>
              <CardDescription>View and manage all patient session records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cancel Reason</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-muted-foreground">No sessions found.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Activity className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{session.patient?.name || "Unknown"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{session.program?.name || "Unknown"}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(session.date).toLocaleDateString()}
                          </div>
                        </TableCell>
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
                        <TableCell>
                          <p className="text-sm text-muted-foreground">{session.cancelReason || "N/A"}</p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(session)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteClick(session.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the session record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSessionToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

