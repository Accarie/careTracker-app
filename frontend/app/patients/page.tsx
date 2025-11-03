"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
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
import { patientsAPI, programsAPI, usersAPI } from "@/lib/api"
import { Plus, Mail, Phone, Edit, Trash2, User, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
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

interface Patient {
  id: string
  name: string
  email: string
  phone: string
  assignedStaffId: string
  assignedStaff?: { name: string }
  programs: string[]
  adherenceRate: number
  status: "active" | "inactive"
  createdAt: string
  patientPrograms?: Array<{ programId: string; program: { name: string } }>
}

export default function PatientsPage() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [patients, setPatients] = useState<Patient[]>([])
  const [programs, setPrograms] = useState<any[]>([])
  const [staffMembers, setStaffMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    assignedStaffId: "",
    programs: [] as string[],
    status: "active" as "active" | "inactive",
  })

  useEffect(() => {
    if (token) {
      loadData()
    }
  }, [token, statusFilter])

  const loadData = async () => {
    if (!token) return
    try {
      setLoading(true)
      const [patientsData, programsData, staffData] = await Promise.all([
        patientsAPI.getAll(token, { status: statusFilter === "all" ? undefined : statusFilter }),
        programsAPI.getAll(token),
        usersAPI.getStaff(token),
      ])
      setPatients(patientsData)
      setPrograms(programsData)
      setStaffMembers(staffData)
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

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    try {
      setSubmitting(true)
      if (editingPatient) {
        await patientsAPI.update(editingPatient.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          assignedStaffId: formData.assignedStaffId,
          programIds: formData.programs,
          status: formData.status,
        }, token)
        toast({ 
          title: "Success", 
          description: "Patient updated successfully",
        })
      } else {
        await patientsAPI.create({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          assignedStaffId: formData.assignedStaffId,
          programIds: formData.programs,
          status: formData.status,
        }, token)
        toast({ 
          title: "Success", 
          description: "Patient created successfully",
        })
      }
      await loadData()
      handleDialogClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save patient",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient)
    setFormData({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      assignedStaffId: patient.assignedStaffId,
      programs: patient.programs ? (Array.isArray(patient.programs) ? patient.programs : patient.patientPrograms?.map((pp: any) => pp.programId) || []) : [],
      status: patient.status,
    })
    setIsAddDialogOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setPatientToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!token || !patientToDelete) return

    try {
      await patientsAPI.delete(patientToDelete, token)
      setDeleteDialogOpen(false)
      setPatientToDelete(null)
      toast({ 
        title: "Success", 
        description: "Patient deleted successfully",
      })
      await loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete patient",
        variant: "destructive",
      })
      await loadData()
    }
  }

  const handleDialogClose = () => {
    setIsAddDialogOpen(false)
    setEditingPatient(null)
    setFormData({
      name: "",
      email: "",
      phone: "",
      assignedStaffId: "",
      programs: [],
      status: "active",
    })
  }

  const toggleProgram = (programId: string) => {
    const currentPrograms = formData.programs || []
    setFormData({
      ...formData,
      programs: currentPrograms.includes(programId)
        ? currentPrograms.filter((id) => id !== programId)
        : [...currentPrograms, programId],
    })
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
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Patients</h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">Manage patient records and program assignments</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleDialogClose()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-full sm:max-w-2xl mx-4">
                <DialogHeader>
                  <DialogTitle>{editingPatient ? "Edit Patient" : "Add New Patient"}</DialogTitle>
                  <DialogDescription>
                    {editingPatient
                      ? "Update the patient details below."
                      : "Add a new patient to the healthcare system."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="John Smith"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="staff">Assigned Staff</Label>
                      <Select
                        value={formData.assignedStaffId}
                        onValueChange={(value) => setFormData({ ...formData, assignedStaffId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                        <SelectContent>
                          {staffMembers.map((staff) => (
                            <SelectItem key={staff.id} value={staff.id}>
                              {staff.name}
                            </SelectItem>
                          ))}
                          {staffMembers.length === 0 && (
                            <SelectItem value="" disabled>No staff available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Assigned Programs</Label>
                    <div className="border rounded-lg p-4 space-y-3 max-h-48 overflow-y-auto">
                      {programs.map((program) => (
                        <div key={program.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`program-${program.id}`}
                            checked={formData.programs?.includes(program.id) || false}
                            onCheckedChange={() => toggleProgram(program.id)}
                          />
                          <label
                            htmlFor={`program-${program.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {program.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : editingPatient ? "Update" : "Add"}{" "}
                      Patient
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:max-w-sm"
            />
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Patients Table */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Records</CardTitle>
              <CardDescription>View and manage all patient information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Assigned Staff</TableHead>
                    <TableHead>Programs</TableHead>
                    <TableHead>Adherence</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-sm text-muted-foreground">ID: {patient.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{patient.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{patient.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{patient.assignedStaff?.name || "N/A"}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(patient.patientPrograms || []).map((pp: any) => (
                            <Badge key={pp.programId} variant="secondary" className="text-xs">
                              {pp.program?.name.split(" ")[0] || "N/A"}
                            </Badge>
                          ))}
                          {patient.programs && patient.programs.length > 0 && patient.patientPrograms?.length === 0 && (
                            patient.programs.map((programId: string) => (
                              <Badge key={programId} variant="secondary" className="text-xs">
                                {programId.slice(0, 8)}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{patient.adherenceRate}%</span>
                          </div>
                          <Progress value={patient.adherenceRate} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={patient.status === "active" ? "default" : "secondary"}>{patient.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(patient)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteClick(patient.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>

              {filteredPatients.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No patients found.</p>
                </div>
              )}
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
              This action cannot be undone. This will permanently delete the patient record
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPatientToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
