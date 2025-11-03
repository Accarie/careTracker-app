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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { medicationsAPI, patientsAPI } from "@/lib/api"
import { Plus, Pill, Edit, Trash2, Calendar, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
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

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: "daily" | "weekly" | "monthly"
  description: string
}

interface Prescription {
  id: string
  medicationId: string
  medication?: { name: string; dosage: string }
  medicationName?: string
  patientId: string
  patient?: { name: string }
  patientName?: string
  dateCollected: string
  nextDueDate: string
  status: "collected" | "pending" | "overdue"
}

export default function MedicationsPage() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [medications, setMedications] = useState<Medication[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isMedDialogOpen, setIsMedDialogOpen] = useState(false)
  const [isPrescDialogOpen, setIsPrescDialogOpen] = useState(false)
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteMedDialogOpen, setDeleteMedDialogOpen] = useState(false)
  const [deletePrescDialogOpen, setDeletePrescDialogOpen] = useState(false)
  const [medicationToDelete, setMedicationToDelete] = useState<string | null>(null)
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<string | null>(null)

  const [medFormData, setMedFormData] = useState({
    name: "",
    dosage: "",
    frequency: "daily" as "daily" | "weekly" | "monthly",
    description: "",
  })

  const [prescFormData, setPrescFormData] = useState({
    medicationId: "",
    patientId: "",
    dateCollected: "",
    nextDueDate: "",
  })

  useEffect(() => {
    if (token) {
      loadData()
    }
  }, [token])

  const loadData = async () => {
    if (!token) return
    try {
      setLoading(true)
      const [medsData, prescData, patientsData] = await Promise.all([
        medicationsAPI.getAll(token),
        medicationsAPI.getAllPrescriptions(token),
        patientsAPI.getAll(token),
      ])
      setMedications(medsData)
      setPrescriptions(prescData)
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

  const filteredMedications = medications.filter((med) => med.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleMedSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    try {
      setSubmitting(true)
      if (editingMedication) {
        await medicationsAPI.update(
          editingMedication.id,
          {
            name: medFormData.name,
            dosage: medFormData.dosage,
            frequency: medFormData.frequency,
            description: medFormData.description,
          },
          token,
        )
        toast({ 
          title: "Success", 
          description: "Medication updated successfully",
        })
      } else {
        await medicationsAPI.create(
          {
            name: medFormData.name,
            dosage: medFormData.dosage,
            frequency: medFormData.frequency,
            description: medFormData.description,
          },
          token,
        )
        toast({ 
          title: "Success", 
          description: "Medication created successfully",
        })
      }
      await loadData()
      handleMedDialogClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save medication",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrescSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    try {
      setSubmitting(true)
      await medicationsAPI.createPrescription(
        {
          medicationId: prescFormData.medicationId,
          patientId: prescFormData.patientId,
          dateCollected: prescFormData.dateCollected,
          nextDueDate: prescFormData.nextDueDate,
        },
        token,
      )
      toast({ 
        title: "Success", 
        description: "Prescription created successfully",
      })
      await loadData()
      setPrescFormData({ medicationId: "", patientId: "", dateCollected: "", nextDueDate: "" })
      setIsPrescDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create prescription",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditMed = (medication: Medication) => {
    setEditingMedication(medication)
    setMedFormData({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      description: medication.description,
    })
    setIsMedDialogOpen(true)
  }

  const handleDeleteMedClick = (id: string) => {
    setMedicationToDelete(id)
    setDeleteMedDialogOpen(true)
  }

  const handleDeleteMed = async () => {
    if (!token || !medicationToDelete) return

    try {
      await medicationsAPI.delete(medicationToDelete, token)
      setDeleteMedDialogOpen(false)
      setMedicationToDelete(null)
      toast({ 
        title: "Success", 
        description: "Medication deleted successfully",
      })
      await loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete medication",
        variant: "destructive",
      })
      await loadData()
    }
  }

  const handleDeletePrescClick = (id: string) => {
    setPrescriptionToDelete(id)
    setDeletePrescDialogOpen(true)
  }

  const handleDeletePresc = async () => {
    if (!token || !prescriptionToDelete) return

    try {
      await medicationsAPI.deletePrescription(prescriptionToDelete, token)
      setDeletePrescDialogOpen(false)
      setPrescriptionToDelete(null)
      toast({ 
        title: "Success", 
        description: "Prescription deleted successfully",
      })
      await loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete prescription",
        variant: "destructive",
      })
      await loadData()
    }
  }

  const handleMedDialogClose = () => {
    setIsMedDialogOpen(false)
    setEditingMedication(null)
    setMedFormData({ name: "", dosage: "", frequency: "daily", description: "" })
  }

  const updatePrescriptionStatus = async (id: string, status: "collected" | "pending" | "overdue") => {
    if (!token) return

    try {
      await medicationsAPI.updatePrescriptionStatus(id, status, token)
      toast({ 
        title: "Success", 
        description: "Prescription status updated",
      })
      await loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update prescription status",
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
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Medications</h1>
            <p className="text-muted-foreground mt-1">Manage medications and patient prescriptions</p>
          </div>

          <Tabs defaultValue="medications" className="space-y-6">
            <TabsList>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            </TabsList>

            {/* Medications Tab */}
            <TabsContent value="medications" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Input
                  placeholder="Search medications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:max-w-sm"
                />
                <Dialog open={isMedDialogOpen} onOpenChange={setIsMedDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => handleMedDialogClose()} className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Medication
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-full sm:max-w-lg mx-4">
                    <DialogHeader>
                      <DialogTitle>{editingMedication ? "Edit Medication" : "Add New Medication"}</DialogTitle>
                      <DialogDescription>
                        {editingMedication
                          ? "Update the medication details below."
                          : "Add a new medication to the system."}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleMedSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="med-name">Medication Name</Label>
                        <Input
                          id="med-name"
                          placeholder="e.g., Metformin"
                          value={medFormData.name}
                          onChange={(e) => setMedFormData({ ...medFormData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dosage">Dosage</Label>
                        <Input
                          id="dosage"
                          placeholder="e.g., 500mg"
                          value={medFormData.dosage}
                          onChange={(e) => setMedFormData({ ...medFormData, dosage: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="frequency">Frequency</Label>
                        <Select
                          value={medFormData.frequency}
                          onValueChange={(value: "daily" | "weekly" | "monthly") =>
                            setMedFormData({ ...medFormData, frequency: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Medication description..."
                          value={medFormData.description}
                          onChange={(e) => setMedFormData({ ...medFormData, description: e.target.value })}
                          required
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={handleMedDialogClose} disabled={submitting}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : editingMedication ? (
                            "Update"
                          ) : (
                            "Add"
                          )}{" "}
                          Medication
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredMedications.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">No medications found.</p>
                  </div>
                ) : (
                  filteredMedications.map((medication) => (
                    <Card key={medication.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Pill className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{medication.name}</CardTitle>
                              <CardDescription>{medication.dosage}</CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">{medication.description}</p>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <Badge variant="secondary" className="capitalize">
                            {medication.frequency}
                          </Badge>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEditMed(medication)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteMedClick(medication.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Prescriptions Tab */}
            <TabsContent value="prescriptions" className="space-y-6">
              <div className="flex justify-end">
                <Dialog open={isPrescDialogOpen} onOpenChange={setIsPrescDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Prescription
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-full sm:max-w-lg mx-4">
                    <DialogHeader>
                      <DialogTitle>Add New Prescription</DialogTitle>
                      <DialogDescription>Assign a medication to a patient.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePrescSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="medication">Medication</Label>
                        <Select
                          value={prescFormData.medicationId}
                          onValueChange={(value) => setPrescFormData({ ...prescFormData, medicationId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select medication" />
                          </SelectTrigger>
                          <SelectContent>
                            {medications.map((med) => (
                              <SelectItem key={med.id} value={med.id}>
                                {med.name} {med.dosage}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="patient">Patient</Label>
                        <Select
                          value={prescFormData.patientId}
                          onValueChange={(value) => setPrescFormData({ ...prescFormData, patientId: value })}
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
                      <div className="space-y-2">
                        <Label htmlFor="collected">Date Collected</Label>
                        <Input
                          id="collected"
                          type="date"
                          value={prescFormData.dateCollected}
                          onChange={(e) => setPrescFormData({ ...prescFormData, dateCollected: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="due">Next Due Date</Label>
                        <Input
                          id="due"
                          type="date"
                          value={prescFormData.nextDueDate}
                          onChange={(e) => setPrescFormData({ ...prescFormData, nextDueDate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsPrescDialogOpen(false)}
                          disabled={submitting}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            "Add Prescription"
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Active Prescriptions</CardTitle>
                  <CardDescription>Track patient medication schedules</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Medication</TableHead>
                        <TableHead>Date Collected</TableHead>
                        <TableHead>Next Due</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prescriptions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <p className="text-muted-foreground">No prescriptions found.</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        prescriptions.map((prescription) => (
                          <TableRow key={prescription.id}>
                            <TableCell>
                              <p className="font-medium">
                                {prescription.patient?.name || prescription.patientName || "Unknown"}
                              </p>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Pill className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {prescription.medication
                                    ? `${prescription.medication.name} ${prescription.medication.dosage}`
                                    : prescription.medicationName || "Unknown"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(prescription.dateCollected).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(prescription.nextDueDate).toLocaleDateString()}
                              </div>
                            </TableCell>
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
                                {prescription.status === "collected" && <CheckCircle className="h-3 w-3 mr-1" />}
                                {prescription.status === "overdue" && <AlertCircle className="h-3 w-3 mr-1" />}
                                {prescription.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {prescription.status === "pending" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updatePrescriptionStatus(prescription.id, "collected")}
                                  >
                                    Mark Collected
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeletePrescClick(prescription.id)}
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
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Delete Medication Confirmation Dialog */}
      <AlertDialog open={deleteMedDialogOpen} onOpenChange={setDeleteMedDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the medication
              and all associated prescriptions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMedicationToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMed} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Prescription Confirmation Dialog */}
      <AlertDialog open={deletePrescDialogOpen} onOpenChange={setDeletePrescDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the prescription record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPrescriptionToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePresc} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
