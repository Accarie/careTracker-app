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
import { useAuth } from "@/lib/auth-context"
import { programsAPI } from "@/lib/api"
import { Plus, Calendar, Users, Edit, Trash2, Loader2 } from "lucide-react"
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

interface Program {
  id: string
  name: string
  description: string
  frequency: "daily" | "weekly" | "monthly"
  sessionsCount: number
  enrolledPatients?: number
  createdAt: string
  patientPrograms?: Array<{ patientId: string }>
}

export default function ProgramsPage() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [programToDelete, setProgramToDelete] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    frequency: "weekly" as "daily" | "weekly" | "monthly",
    sessionsCount: "",
  })

  useEffect(() => {
    if (token) {
      loadPrograms()
    }
  }, [token])

  const loadPrograms = async () => {
    if (!token) return
    try {
      setLoading(true)
      const data = await programsAPI.getAll(token)
      setPrograms(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load programs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredPrograms = programs.filter(
    (program) =>
      program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    try {
      setSubmitting(true)
      if (editingProgram) {
        await programsAPI.update(
          editingProgram.id,
          {
            name: formData.name,
            description: formData.description,
            frequency: formData.frequency,
            sessionsCount: parseInt(formData.sessionsCount),
          },
          token,
        )
        toast({ 
          title: "Success", 
          description: "Program updated successfully",
        })
      } else {
        await programsAPI.create(
          {
            name: formData.name,
            description: formData.description,
            frequency: formData.frequency,
            sessionsCount: parseInt(formData.sessionsCount),
          },
          token,
        )
        toast({ 
          title: "Success", 
          description: "Program created successfully",
        })
      }
      await loadPrograms()
      handleDialogClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save program",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (program: Program) => {
    setEditingProgram(program)
    setFormData({
      name: program.name,
      description: program.description,
      frequency: program.frequency,
      sessionsCount: String(program.sessionsCount),
    })
    setIsAddDialogOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setProgramToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!token || !programToDelete) return

    try {
      await programsAPI.delete(programToDelete, token)
      setDeleteDialogOpen(false)
      setProgramToDelete(null)
      toast({ 
        title: "Success", 
        description: "Program deleted successfully",
      })
      await loadPrograms()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete program",
        variant: "destructive",
      })
      await loadPrograms()
    }
  }

  const handleDialogClose = () => {
    setIsAddDialogOpen(false)
    setEditingProgram(null)
    setFormData({ name: "", description: "", frequency: "weekly", sessionsCount: "" })
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
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Programs</h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">Manage healthcare programs and sessions</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleDialogClose()} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Program
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-full sm:max-w-lg mx-4">
                <DialogHeader>
                  <DialogTitle>{editingProgram ? "Edit Program" : "Add New Program"}</DialogTitle>
                  <DialogDescription>
                    {editingProgram
                      ? "Update the program details below."
                      : "Create a new healthcare program for patients."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Program Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Diabetes Management"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the program..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={formData.frequency}
                      onValueChange={(value: "daily" | "weekly" | "monthly") =>
                        setFormData({ ...formData, frequency: value })
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
                    <Label htmlFor="sessions">Total Sessions</Label>
                    <Input
                      id="sessions"
                      type="number"
                      placeholder="e.g., 12"
                      value={formData.sessionsCount}
                      onChange={(e) => setFormData({ ...formData, sessionsCount: e.target.value })}
                      required
                      min="1"
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
                      ) : editingProgram ? (
                        "Update"
                      ) : (
                        "Create"
                      )}{" "}
                      Program
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="flex gap-4">
            <Input
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:max-w-sm"
            />
          </div>

          {/* Programs Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPrograms.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No programs found. Create your first program to get started.</p>
              </div>
            ) : (
              filteredPrograms.map((program) => (
                <Card key={program.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{program.name}</CardTitle>
                        <CardDescription className="mt-2">{program.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="capitalize">{program.frequency}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{program.patientPrograms?.length || program.enrolledPatients || 0} enrolled</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <Badge variant="secondary">{program.sessionsCount} sessions</Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(program)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(program.id)}
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
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the program
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProgramToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
