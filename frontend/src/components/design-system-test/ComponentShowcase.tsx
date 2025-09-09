'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'

// Import new components
import { Button as NewButton } from '@/components/ui-new/button'
import { Card as NewCard, CardHeader as NewCardHeader, CardTitle as NewCardTitle, CardDescription as NewCardDescription, CardContent as NewCardContent } from '@/components/ui-new/card'
import { Input as NewInput } from '@/components/ui-new/input'

interface ComponentShowcaseProps {
  showLegacy: boolean
  showNew: boolean
}

export function ComponentShowcase({ showLegacy, showNew }: ComponentShowcaseProps) {
  const [inputValue, setInputValue] = useState('')
  const [newInputValue, setNewInputValue] = useState('')
  const [buttonLoading, setButtonLoading] = useState(false)
  const [newButtonLoading, setNewButtonLoading] = useState(false)

  const handleLegacyButtonClick = () => {
    setButtonLoading(true)
    setTimeout(() => setButtonLoading(false), 2000)
  }

  const handleNewButtonClick = () => {
    setNewButtonLoading(true)
    setTimeout(() => setNewButtonLoading(false), 2000)
  }

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">
          Component Showcase
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Complete showcase of all components with their variants, states, and interactions.
          Compare legacy components with the new design system implementation.
        </p>
      </div>

      {/* Component System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {showLegacy && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🧩</span>
                Legacy Components
              </CardTitle>
              <CardDescription>
                Current shadcn/ui component library
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Components</span>
                    <Badge variant="secondary">30+</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Variants</span>
                    <Badge variant="secondary">15+</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">States</span>
                    <Badge variant="secondary">5</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Accessibility</span>
                    <Badge variant="secondary">✓</Badge>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>• shadcn/ui based</p>
                  <p>• BOLT color system</p>
                  <p>• TypeScript support</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {showNew && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                New Components
              </CardTitle>
              <CardDescription>
                Enhanced design system components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Components</span>
                    <Badge variant="default">5+</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Variants</span>
                    <Badge variant="default">8+</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">States</span>
                    <Badge variant="default">6</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Accessibility</span>
                    <Badge variant="default">✓✓</Badge>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>• Design tokens</p>
                  <p>• Enhanced states</p>
                  <p>• Better TypeScript</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Button Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Button Components</CardTitle>
          <CardDescription>
            All button variants, sizes, and states
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {showLegacy && (
            <div className="space-y-6">
              <h4 className="font-semibold">Legacy Buttons</h4>
              
              {/* Button Variants */}
              <div className="space-y-4">
                <h5 className="text-sm font-medium text-muted-foreground">Variants</h5>
                <div className="flex flex-wrap gap-3">
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>

              {/* Button Sizes */}
              <div className="space-y-4">
                <h5 className="text-sm font-medium text-muted-foreground">Sizes</h5>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="sm">📎</Button>
                </div>
              </div>

              {/* Button States */}
              <div className="space-y-4">
                <h5 className="text-sm font-medium text-muted-foreground">States</h5>
                <div className="flex flex-wrap gap-3">
                  <Button>Normal</Button>
                  <Button disabled>Disabled</Button>
                  <Button disabled={buttonLoading} onClick={handleLegacyButtonClick}>
                    {buttonLoading ? 'Loading...' : 'Click to Load'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {showNew && (
            <div className="space-y-6">
              <h4 className="font-semibold">New Buttons</h4>
              
              {/* Button Variants */}
              <div className="space-y-4">
                <h5 className="text-sm font-medium text-muted-foreground">Variants</h5>
                <div className="flex flex-wrap gap-3">
                  <NewButton variant="primary">Primary</NewButton>
                  <NewButton variant="secondary">Secondary</NewButton>
                  <NewButton variant="destructive">Destructive</NewButton>
                  <NewButton variant="outline">Outline</NewButton>
                  <NewButton variant="ghost">Ghost</NewButton>
                  <NewButton variant="link">Link</NewButton>
                </div>
              </div>

              {/* Button Sizes */}
              <div className="space-y-4">
                <h5 className="text-sm font-medium text-muted-foreground">Sizes</h5>
                <div className="flex flex-wrap items-center gap-3">
                  <NewButton size="sm">Small</NewButton>
                  <NewButton size="default">Default</NewButton>
                  <NewButton size="lg">Large</NewButton>
                  <NewButton size="lg">📎</NewButton>
                </div>
              </div>

              {/* Button States */}
              <div className="space-y-4">
                <h5 className="text-sm font-medium text-muted-foreground">States</h5>
                <div className="flex flex-wrap gap-3">
                  <NewButton>Normal</NewButton>
                  <NewButton disabled>Disabled</NewButton>
                  <NewButton loading={newButtonLoading} onClick={handleNewButtonClick}>
                    {newButtonLoading ? 'Loading...' : 'Click to Load'}
                  </NewButton>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Input Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Input Components</CardTitle>
          <CardDescription>
            Input fields with different states and validation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {showLegacy && (
            <div className="space-y-6">
              <h4 className="font-semibold">Legacy Inputs</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="legacy-input">Standard Input</Label>
                  <Input
                    id="legacy-input"
                    placeholder="Enter text..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">Value: {inputValue}</p>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="legacy-disabled">Disabled Input</Label>
                  <Input
                    id="legacy-disabled"
                    placeholder="Disabled..."
                    disabled
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="legacy-error">Error State</Label>
                  <Input
                    id="legacy-error"
                    placeholder="Error state..."
                    className="border-red-500 focus:border-red-500"
                  />
                  <p className="text-sm text-red-500">This field is required</p>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="legacy-success">Success State</Label>
                  <Input
                    id="legacy-success"
                    placeholder="Success state..."
                    className="border-green-500 focus:border-green-500"
                  />
                  <p className="text-sm text-green-500">Looks good!</p>
                </div>
              </div>
            </div>
          )}

          {showNew && (
            <div className="space-y-6">
              <h4 className="font-semibold">New Inputs</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="new-input">Standard Input</Label>
                  <NewInput
                    id="new-input"
                    placeholder="Enter text..."
                    value={newInputValue}
                    onChange={(e) => setNewInputValue(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">Value: {newInputValue}</p>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="new-disabled">Disabled Input</Label>
                  <NewInput
                    id="new-disabled"
                    placeholder="Disabled..."
                    disabled
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="new-error">Error State</Label>
                  <NewInput
                    id="new-error"
                    placeholder="Error state..."
                    error={true}
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="new-success">Success State</Label>
                  <NewInput
                    id="new-success"
                    placeholder="Success state..."
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Card Components</CardTitle>
          <CardDescription>
            Card layouts with different content arrangements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {showLegacy && (
              <div className="space-y-6">
                <h4 className="font-semibold">Legacy Cards</h4>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card description text</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This is the card content area. It demonstrates the legacy card component 
                      with its default styling and layout.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Interactive Card</CardTitle>
                    <CardDescription>Hover and click interactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        This card shows interactive elements and states.
                      </p>
                      <Button size="sm">Action Button</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {showNew && (
              <div className="space-y-6">
                <h4 className="font-semibold">New Cards</h4>
                
                <NewCard>
                  <NewCardHeader>
                    <NewCardTitle>Card Title</NewCardTitle>
                    <NewCardDescription>Card description text</NewCardDescription>
                  </NewCardHeader>
                  <NewCardContent>
                    <p className="text-sm text-muted-foreground">
                      This is the new card component with enhanced styling and better 
                      typography integration.
                    </p>
                  </NewCardContent>
                </NewCard>

                <NewCard>
                  <NewCardHeader>
                    <NewCardTitle>Interactive Card</NewCardTitle>
                    <NewCardDescription>Enhanced interactions</NewCardDescription>
                  </NewCardHeader>
                  <NewCardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        This card demonstrates the new component system with improved 
                        accessibility and state management.
                      </p>
                      <NewButton size="sm">Action Button</NewButton>
                    </div>
                  </NewCardContent>
                </NewCard>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Badge Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Badge Components</CardTitle>
          <CardDescription>
            Badge variants and usage patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h5 className="text-sm font-medium text-muted-foreground">Badge Variants</h5>
            <div className="flex flex-wrap gap-3">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="text-sm font-medium text-muted-foreground">Usage Examples</h5>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">Status:</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Priority:</span>
                <Badge variant="destructive">High</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Category:</span>
                <Badge variant="outline">Design</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Component Usage Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Patterns</CardTitle>
          <CardDescription>
            Common component combinations and layouts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-semibold">Form Layout</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {showLegacy && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h5 className="text-sm font-medium">Legacy Form</h5>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="legacy-email">Email</Label>
                      <Input id="legacy-email" type="email" placeholder="Enter email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="legacy-password">Password</Label>
                      <Input id="legacy-password" type="password" placeholder="Enter password" />
                    </div>
                    <Button className="w-full">Submit</Button>
                  </div>
                </div>
              )}

              {showNew && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h5 className="text-sm font-medium">New Form</h5>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="new-email">Email</Label>
                      <NewInput id="new-email" type="email" placeholder="Enter email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Password</Label>
                      <NewInput id="new-password" type="password" placeholder="Enter password" />
                    </div>
                    <NewButton className="w-full">Submit</NewButton>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Card with Actions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {showLegacy && (
                <Card>
                  <CardHeader>
                    <CardTitle>User Profile</CardTitle>
                    <CardDescription>Manage your account settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                        JD
                      </div>
                      <div>
                        <p className="font-medium">John Doe</p>
                        <p className="text-sm text-muted-foreground">john@example.com</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm">Save</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {showNew && (
                <NewCard>
                  <NewCardHeader>
                    <NewCardTitle>User Profile</NewCardTitle>
                    <NewCardDescription>Manage your account settings</NewCardDescription>
                  </NewCardHeader>
                  <NewCardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[hsl(214,96%,56%)] rounded-full flex items-center justify-center text-[hsl(0,0%,98%)] font-semibold">
                        JD
                      </div>
                      <div>
                        <p className="font-medium">John Doe</p>
                        <p className="text-sm text-muted-foreground">john@example.com</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <NewButton size="sm" variant="outline">Edit</NewButton>
                      <NewButton size="sm">Save</NewButton>
                    </div>
                  </NewCardContent>
                </NewCard>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}