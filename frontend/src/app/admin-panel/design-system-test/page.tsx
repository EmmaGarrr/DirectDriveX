/**
 * DirectDriveX Design System Test Page
 * Comprehensive visual testing of all design system components and tokens
 * 
 * This page serves as a complete reference for all design system elements,
 * ensuring visual consistency and providing a testing ground for developers.
 */

'use client'

import React, { useState } from 'react'
import { DesignSystemExample } from '@/components/ui-new/example'
import { Button } from '@/components/ui-new/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui-new/card'
import { Input } from '@/components/ui-new/input'
import { Label } from '@/components/ui-new/label'
import { Textarea } from '@/components/ui-new/textarea'
import { Checkbox, CheckboxGroup } from '@/components/ui-new/checkbox'
import { RadioGroup } from '@/components/ui-new/radio-group'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui-new/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui-new/alert'
import { Badge } from '@/components/ui-new/badge'
import { Progress, LoadingSpinner, Skeleton } from '@/components/ui-new/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui-new/tabs'
import { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator, BreadcrumbHome } from '@/components/ui-new/breadcrumb'
import { Pagination, PaginationItem, PaginationEllipsis, PaginationPrevious, PaginationNext, PaginationContent } from '@/components/ui-new/pagination'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from '@/components/ui-new/dialog'
import { Sheet, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription, SheetTrigger, SheetClose } from '@/components/ui-new/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter, TableCaption, TableCheckbox, TableEmptyState, TableLoadingState } from '@/components/ui-new/table'
import { FileUploadZone, FileCard, FileGrid } from '@/components/ui-new/file-upload'
import { StatCard, ActivityFeed, QuickActions, SystemStatus, AdminTable } from '@/components/ui-new/admin-panel'
import { cn } from '@/lib/utils'

export default function DesignSystemTestPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [selectedSection, setSelectedSection] = useState('overview')

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  // Navigation sections
  const sections = [
    { id: 'overview', name: 'Overview', icon: '📋' },
    { id: 'buttons', name: 'Buttons', icon: '🔘' },
    { id: 'forms', name: 'Forms', icon: '📝' },
    { id: 'cards', name: 'Cards', icon: '🃏' },
    { id: 'alerts', name: 'Alerts', icon: '⚠️' },
    { id: 'badges', name: 'Badges', icon: '🏷️' },
    { id: 'tables', name: 'Tables', icon: '📋' },
    { id: 'modals', name: 'Modals', icon: '🪟' },
    { id: 'documentation', name: 'Documentation', icon: '📚' },
  ]

  return (
    <div className={cn(
      'min-h-screen bg-background text-foreground',
      darkMode && 'dark'
    )}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">DirectDriveX Design System</h1>
              <p className="text-sm text-muted-foreground">Comprehensive visual testing and reference</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleDarkMode}
              >
                {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </Button>
              <Button variant="primary" size="sm">
                📋 Copy Stats
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-muted/30 border-r min-h-screen p-4">
          <div className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                  selectedSection === section.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                <span>{section.icon}</span>
                <span>{section.name}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Overview Section */}
            {selectedSection === 'overview' && (
              <section id="overview" className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Design System Overview</h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Complete visual reference for all DirectDriveX design system components and tokens.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sections.filter(s => s.id !== 'overview').map((section) => (
                    <Card key={section.id} className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedSection(section.id)}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <span>{section.icon}</span>
                          {section.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Explore {section.name.toLowerCase()} components and examples.
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Buttons Section */}
            {selectedSection === 'buttons' && (
              <section id="buttons" className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Buttons</h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Complete button component library with various styles and states.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Button Variants</CardTitle>
                    <CardDescription>
                      Different button styles for various use cases.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-wrap gap-4">
                      <Button>Default</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="link">Link</Button>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <Button size="sm">Small</Button>
                      <Button size="default">Medium</Button>
                      <Button size="lg">Large</Button>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <Button disabled>Disabled</Button>
                      <Button loading>Loading</Button>
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Forms Section */}
            {selectedSection === 'forms' && (
              <section id="forms" className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Forms</h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Complete form components with validation and accessibility.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Form Components</CardTitle>
                    <CardDescription>
                      Various form controls and their states.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="input-test">Input Field</Label>
                          <Input id="input-test" placeholder="Enter text..." />
                        </div>
                        
                        <div>
                          <Label htmlFor="textarea-test">Textarea</Label>
                          <Textarea id="textarea-test" placeholder="Enter long text..." />
                        </div>

                        <div>
                          <Label htmlFor="select-test">Select</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="option1">Option 1</SelectItem>
                              <SelectItem value="option2">Option 2</SelectItem>
                              <SelectItem value="option3">Option 3</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="checkbox-test" />
                          <Label htmlFor="checkbox-test">Checkbox Option</Label>
                        </div>

                        <div>
                          <Label>Radio Group</Label>
                          <RadioGroup defaultValue="option1" options={[
                            { label: 'Option 1', value: 'option1' },
                            { label: 'Option 2', value: 'option2' }
                          ]}>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="option1" id="radio1" />
                              <Label htmlFor="radio1">Option 1</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="option2" id="radio2" />
                              <Label htmlFor="radio2">Option 2</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Cards Section */}
            {selectedSection === 'cards' && (
              <section id="cards" className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Cards</h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Flexible card components for displaying content.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Simple Card</CardTitle>
                      <CardDescription>A basic card with header and content</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>This is the content area of the card. It can contain any type of content.</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Card with Footer</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>This card has a footer section with actions.</p>
                    </CardContent>
                    <CardFooter>
                      <Button>Action</Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <p>This card has no header, just content.</p>
                    </CardContent>
                  </Card>
                </div>
              </section>
            )}

            {/* Alerts Section */}
            {selectedSection === 'alerts' && (
              <section id="alerts" className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Alerts</h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Alert components for displaying important messages.
                  </p>
                </div>

                <div className="space-y-4">
                  <Alert>
                    <AlertTitle>Information</AlertTitle>
                    <AlertDescription>
                      This is an informational alert message.
                    </AlertDescription>
                  </Alert>

                  <Alert variant="warning">
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>
                      This is a warning alert message.
                    </AlertDescription>
                  </Alert>

                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      This is an error alert message.
                    </AlertDescription>
                  </Alert>

                  <Alert variant="success">
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>
                      This is a success alert message.
                    </AlertDescription>
                  </Alert>
                </div>
              </section>
            )}

            {/* Badges Section */}
            {selectedSection === 'badges' && (
              <section id="badges" className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Badges</h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Badge components for displaying status and labels.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Badge Variants</CardTitle>
                    <CardDescription>
                      Different badge styles for various use cases.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-wrap gap-4">
                      <Badge>Default</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="outline">Outline</Badge>
                      <Badge variant="destructive">Destructive</Badge>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <Badge className="bg-blue-500 text-white">Custom</Badge>
                      <Badge className="bg-green-500 text-white">Success</Badge>
                      <Badge className="bg-yellow-500 text-black">Warning</Badge>
                      <Badge className="bg-red-500 text-white">Error</Badge>
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Tables Section */}
            {selectedSection === 'tables' && (
              <section id="tables" className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Tables</h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Table components for displaying structured data.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Basic Table</CardTitle>
                    <CardDescription>
                      Simple table with sorting and selection.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>John Doe</TableCell>
                          <TableCell>john@example.com</TableCell>
                          <TableCell>Admin</TableCell>
                          <TableCell><Badge variant="secondary">Active</Badge></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Jane Smith</TableCell>
                          <TableCell>jane@example.com</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell><Badge variant="secondary">Active</Badge></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Bob Johnson</TableCell>
                          <TableCell>bob@example.com</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell><Badge variant="outline">Inactive</Badge></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Modals Section */}
            {selectedSection === 'modals' && (
              <section id="modals" className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Modals</h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Modal components for dialogs and overlays.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Dialog</CardTitle>
                      <CardDescription>
                        Modal dialog for important interactions.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>Open Dialog</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Dialog Title</DialogTitle>
                            <DialogDescription>
                              This is a dialog description.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <p>Dialog content goes here.</p>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button>Confirm</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Sheet</CardTitle>
                      <CardDescription>
                        Side sheet for secondary content.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button>Open Sheet</Button>
                        </SheetTrigger>
                        <SheetContent>
                          <SheetHeader>
                            <SheetTitle>Sheet Title</SheetTitle>
                            <SheetDescription>
                              This is a sheet description.
                            </SheetDescription>
                          </SheetHeader>
                          <div className="py-4">
                            <p>Sheet content goes here.</p>
                          </div>
                          <SheetFooter>
                            <SheetClose asChild>
                              <Button variant="outline">Close</Button>
                            </SheetClose>
                          </SheetFooter>
                        </SheetContent>
                      </Sheet>
                    </CardContent>
                  </Card>
                </div>
              </section>
            )}

            {/* Documentation Section */}
            {selectedSection === 'documentation' && (
              <section id="documentation" className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Documentation</h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Component documentation and usage examples.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Start</CardTitle>
                    <CardDescription>
                      Get started with the design system.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Installation</h4>
                      <pre className="text-sm bg-black text-white p-3 rounded overflow-x-auto">
{`import { Button } from '@/components/ui-new/button'
import { Card } from '@/components/ui-new/card'`}
                      </pre>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Usage</h4>
                      <pre className="text-sm bg-black text-white p-3 rounded overflow-x-auto">
{`<Button variant="primary" onClick={() => console.log('clicked')}>
  Click me
</Button>`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}