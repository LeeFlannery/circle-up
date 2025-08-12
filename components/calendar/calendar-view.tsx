"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  Eye,
  Users,
  Settings,
  Lock,
} from "lucide-react"

interface CalendarEvent {
  id: string
  title: string
  description: string
  start_date: string
  end_date: string
  location: string
  visibility: "public" | "friends" | "leaders" | "admin"
  created_by: string
  created_at: string
  creator_name?: string
}

interface CalendarViewProps {
  currentUserId: string
  userRole: "admin" | "leader" | "member"
}

export default function CalendarView({ currentUserId, userRole }: CalendarViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    location: "",
    visibility: "public" as "public" | "friends" | "leaders" | "admin",
  })
  const supabase = createClient()

  useEffect(() => {
    fetchEvents()
  }, [currentDate])

  const fetchEvents = async () => {
    try {
      // Get events for the current month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const { data: eventsData, error: eventsError } = await supabase
        .from("calendar_events")
        .select(`
          *,
          user_profiles!calendar_events_created_by_fkey(first_name, last_name)
        `)
        .gte("start_date", startOfMonth.toISOString())
        .lte("start_date", endOfMonth.toISOString())
        .order("start_date")

      if (eventsError) throw eventsError

      // Filter events based on visibility and user role
      const visibleEvents = (eventsData || [])
        .map((event) => ({
          ...event,
          creator_name: `${event.user_profiles?.first_name} ${event.user_profiles?.last_name}`,
        }))
        .filter((event) => {
          if (event.visibility === "public") return true
          if (event.visibility === "friends") return true // TODO: Check friendship status
          if (event.visibility === "leaders" && (userRole === "leader" || userRole === "admin")) return true
          if (event.visibility === "admin" && userRole === "admin") return true
          if (event.created_by === currentUserId) return true
          return false
        })

      setEvents(visibleEvents)
    } catch (err) {
      setError("Failed to load events")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.start_date) return

    setCreateLoading(true)
    try {
      const { error } = await supabase.from("calendar_events").insert({
        title: newEvent.title,
        description: newEvent.description,
        start_date: newEvent.start_date,
        end_date: newEvent.end_date || newEvent.start_date,
        location: newEvent.location,
        visibility: newEvent.visibility,
        created_by: currentUserId,
      })

      if (error) throw error

      setShowCreateDialog(false)
      setNewEvent({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        location: "",
        visibility: "public",
      })
      await fetchEvents()
    } catch (err) {
      setError("Failed to create event")
      console.error(err)
    } finally {
      setCreateLoading(false)
    }
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "public":
        return <Eye className="w-3 h-3" />
      case "friends":
        return <Users className="w-3 h-3" />
      case "leaders":
        return <Settings className="w-3 h-3" />
      case "admin":
        return <Lock className="w-3 h-3" />
      default:
        return <Eye className="w-3 h-3" />
    }
  }

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case "public":
        return "bg-accent text-accent-foreground"
      case "friends":
        return "bg-secondary text-secondary-foreground"
      case "leaders":
        return "bg-primary text-primary-foreground"
      case "admin":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-accent text-accent-foreground"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  // Generate calendar grid for month view
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const current = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      // 6 weeks * 7 days
      const dayEvents = events.filter((event) => {
        const eventDate = new Date(event.start_date)
        return (
          eventDate.getDate() === current.getDate() &&
          eventDate.getMonth() === current.getMonth() &&
          eventDate.getFullYear() === current.getFullYear()
        )
      })

      days.push({
        date: new Date(current),
        events: dayEvents,
        isCurrentMonth: current.getMonth() === month,
        isToday:
          current.getDate() === new Date().getDate() &&
          current.getMonth() === new Date().getMonth() &&
          current.getFullYear() === new Date().getFullYear(),
      })

      current.setDate(current.getDate() + 1)
    }

    return days
  }

  const calendarDays = generateCalendarDays()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Calendar className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-lg text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Calendar Header */}
      <Card className="groovy-card">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="font-serif text-2xl font-bold">
                {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h2>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Select value={viewMode} onValueChange={(value: "month" | "week" | "list") => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                </SelectContent>
              </Select>

              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="groovy-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">Create Event</DialogTitle>
                    <DialogDescription>Add a new event to the church calendar</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Event Title</Label>
                      <Input
                        id="title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        placeholder="Sunday Service"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        placeholder="Join us for worship and fellowship"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start_date">Start Date & Time</Label>
                        <Input
                          id="start_date"
                          type="datetime-local"
                          value={newEvent.start_date}
                          onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end_date">End Date & Time</Label>
                        <Input
                          id="end_date"
                          type="datetime-local"
                          value={newEvent.end_date}
                          onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        placeholder="Main Sanctuary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Visibility</Label>
                      <Select
                        value={newEvent.visibility}
                        onValueChange={(value: "public" | "friends" | "leaders" | "admin") =>
                          setNewEvent({ ...newEvent, visibility: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              <span>Public - Everyone can see</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="friends">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>Friends - Friends can see</span>
                            </div>
                          </SelectItem>
                          {(userRole === "leader" || userRole === "admin") && (
                            <SelectItem value="leaders">
                              <div className="flex items-center gap-2">
                                <Settings className="w-4 h-4" />
                                <span>Leaders - Leaders and admins only</span>
                              </div>
                            </SelectItem>
                          )}
                          {userRole === "admin" && (
                            <SelectItem value="admin">
                              <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                <span>Admin - Administrators only</span>
                              </div>
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={createEvent} disabled={createLoading} className="groovy-button flex-1">
                        {createLoading ? "Creating..." : "Create Event"}
                      </Button>
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Content */}
      {viewMode === "month" ? (
        <Card className="groovy-card">
          <CardContent className="p-6">
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-2 text-center font-semibold text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-24 p-2 border rounded-lg ${
                    day.isCurrentMonth ? "bg-card" : "bg-muted/30"
                  } ${day.isToday ? "ring-2 ring-primary" : ""}`}
                >
                  <div className={`text-sm font-medium mb-1 ${day.isCurrentMonth ? "" : "text-muted-foreground"}`}>
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {day.events.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded bg-primary/10 text-primary truncate cursor-pointer hover:bg-primary/20"
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {day.events.length > 2 && (
                      <div className="text-xs text-muted-foreground">+{day.events.length - 2} more</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* List View */
        <div className="space-y-4">
          {events.length === 0 ? (
            <Card className="groovy-card">
              <CardContent className="text-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif text-xl font-bold mb-2">No Events This Month</h3>
                <p className="text-muted-foreground mb-4">No events are scheduled for this time period</p>
                <Button onClick={() => setShowCreateDialog(true)} className="groovy-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Create the First Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            events.map((event) => (
              <Card key={event.id} className="groovy-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="font-serif text-xl mb-2">{event.title}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getVisibilityColor(event.visibility)}>
                          <div className="flex items-center gap-1">
                            {getVisibilityIcon(event.visibility)}
                            <span className="capitalize">{event.visibility}</span>
                          </div>
                        </Badge>
                      </div>
                      {event.description && <CardDescription className="text-sm">{event.description}</CardDescription>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {formatDate(event.start_date)} at {formatTime(event.start_date)}
                      {event.end_date && event.end_date !== event.start_date && (
                        <span> - {formatTime(event.end_date)}</span>
                      )}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>Created by {event.creator_name}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
