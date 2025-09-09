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

interface InteractiveDemoProps {
  showLegacy: boolean
  showNew: boolean
}

export function InteractiveDemo({ showLegacy, showNew }: InteractiveDemoProps) {
  // Interactive form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    newsletter: false
  })

  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Counter demo states
  const [count, setCount] = useState(0)
  const [newCount, setNewCount] = useState(0)

  // Toggle demo states
  const [toggles, setToggles] = useState({
    feature1: false,
    feature2: false,
    feature3: false
  })

  const [newToggles, setNewToggles] = useState({
    feature1: false,
    feature2: false,
    feature3: false
  })

  // Theme demo states
  const [themeColors, setThemeColors] = useState({
    primary: 'blue',
    secondary: 'gray',
    accent: 'pink'
  })

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user types
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const errors = {
      name: formData.name.trim() ? '' : 'Name is required',
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? '' : 'Valid email is required',
      message: formData.message.trim() ? '' : 'Message is required'
    }
    setFormErrors(errors)
    return !Object.values(errors).some(error => error)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const handleReset = () => {
    setFormData({ name: '', email: '', message: '', newsletter: false })
    setFormErrors({ name: '', email: '', message: '' })
    setIsSubmitted(false)
  }

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">
          Interactive Demos
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Interactive demonstrations of component states, form handling, and user interactions.
          Compare how legacy and new components handle different states and user inputs.
        </p>
      </div>

      {/* Counter Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Counter Demo</CardTitle>
          <CardDescription>
            Interactive counter with different button states
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {showLegacy && (
              <div className="space-y-6">
                <h4 className="font-semibold">Legacy Counter</h4>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold text-primary">{count}</div>
                  <div className="flex justify-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCount(Math.max(0, count - 1))}
                      disabled={count === 0}
                    >
                      -1
                    </Button>
                    <Button 
                      variant="default"
                      onClick={() => setCount(count + 1)}
                    >
                      +1
                    </Button>
                    <Button 
                      variant="secondary"
                      onClick={() => setCount(count + 10)}
                    >
                      +10
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setCount(0)}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            )}

            {showNew && (
              <div className="space-y-6">
                <h4 className="font-semibold">New Counter</h4>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold text-[hsl(214,96%,56%)]">{newCount}</div>
                  <div className="flex justify-center gap-2">
                    <NewButton 
                      variant="outline" 
                      size="sm"
                      onClick={() => setNewCount(Math.max(0, newCount - 1))}
                      disabled={newCount === 0}
                    >
                      -1
                    </NewButton>
                    <NewButton 
                      variant="primary"
                      onClick={() => setNewCount(newCount + 1)}
                    >
                      +1
                    </NewButton>
                    <NewButton 
                      variant="secondary"
                      onClick={() => setNewCount(newCount + 10)}
                    >
                      +10
                    </NewButton>
                  </div>
                  <NewButton 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setNewCount(0)}
                  >
                    Reset
                  </NewButton>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Toggle Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Toggle Demo</CardTitle>
          <CardDescription>
            Feature toggle switches with state management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {showLegacy && (
              <div className="space-y-6">
                <h4 className="font-semibold">Legacy Toggles</h4>
                <div className="space-y-4">
                  {Object.entries(toggles).map(([key, value]) => (
                    <div key={`legacy-${key}`} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">Feature {key.slice(-1)}</div>
                        <div className="text-sm text-muted-foreground">
                          {value ? 'Enabled' : 'Disabled'}
                        </div>
                      </div>
                      <Button
                        variant={value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setToggles(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                      >
                        {value ? 'On' : 'Off'}
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <Badge variant={Object.values(toggles).every(v => v) ? 'default' : 'secondary'}>
                    {Object.values(toggles).filter(v => v).length} of {Object.values(toggles).length} enabled
                  </Badge>
                </div>
              </div>
            )}

            {showNew && (
              <div className="space-y-6">
                <h4 className="font-semibold">New Toggles</h4>
                <div className="space-y-4">
                  {Object.entries(newToggles).map(([key, value]) => (
                    <div key={`new-${key}`} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">Feature {key.slice(-1)}</div>
                        <div className="text-sm text-muted-foreground">
                          {value ? 'Enabled' : 'Disabled'}
                        </div>
                      </div>
                      <NewButton
                        variant={value ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setNewToggles(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                      >
                        {value ? 'On' : 'Off'}
                      </NewButton>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <Badge variant={Object.values(newToggles).every(v => v) ? 'default' : 'secondary'}>
                    {Object.values(newToggles).filter(v => v).length} of {Object.values(newToggles).length} enabled
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Form Demo</CardTitle>
          <CardDescription>
            Complete form with validation, loading states, and error handling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {showLegacy && (
              <div className="space-y-6">
                <h4 className="font-semibold">Legacy Form</h4>
                {isSubmitted ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <div className="text-6xl">✅</div>
                        <div>
                          <h3 className="text-lg font-semibold">Success!</h3>
                          <p className="text-sm text-muted-foreground">
                            Thank you, {formData.name}! Your message has been received.
                          </p>
                        </div>
                        <Button onClick={handleReset}>
                          Submit Another
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="legacy-name">Name</Label>
                      <Input
                        id="legacy-name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={formErrors.name ? 'border-red-500' : ''}
                      />
                      {formErrors.name && (
                        <p className="text-sm text-red-500">{formErrors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="legacy-email">Email</Label>
                      <Input
                        id="legacy-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={formErrors.email ? 'border-red-500' : ''}
                      />
                      {formErrors.email && (
                        <p className="text-sm text-red-500">{formErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="legacy-message">Message</Label>
                      <textarea
                        id="legacy-message"
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                        rows={3}
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                      />
                      {formErrors.message && (
                        <p className="text-sm text-red-500">{formErrors.message}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="legacy-newsletter"
                        checked={formData.newsletter}
                        onChange={(e) => handleInputChange('newsletter', e.target.checked)}
                      />
                      <Label htmlFor="legacy-newsletter">Subscribe to newsletter</Label>
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? 'Submitting...' : 'Submit Form'}
                    </Button>
                  </form>
                )}
              </div>
            )}

            {showNew && (
              <div className="space-y-6">
                <h4 className="font-semibold">New Form</h4>
                {isSubmitted ? (
                  <NewCard>
                    <NewCardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <div className="text-6xl">✅</div>
                        <div>
                          <h3 className="text-lg font-semibold">Success!</h3>
                          <p className="text-sm text-muted-foreground">
                            Thank you, {formData.name}! Your message has been received.
                          </p>
                        </div>
                        <NewButton onClick={handleReset}>
                          Submit Another
                        </NewButton>
                      </div>
                    </NewCardContent>
                  </NewCard>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-name">Name</Label>
                      <NewInput
                        id="new-name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        error={!!formErrors.name}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-email">Email</Label>
                      <NewInput
                        id="new-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        error={!!formErrors.email}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-message">Message</Label>
                      <textarea
                        id="new-message"
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                        rows={3}
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                      />
                      {formErrors.message && (
                        <p className="text-sm text-red-500">{formErrors.message}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="new-newsletter"
                        checked={formData.newsletter}
                        onChange={(e) => handleInputChange('newsletter', e.target.checked)}
                      />
                      <Label htmlFor="new-newsletter">Subscribe to newsletter</Label>
                    </div>

                    <NewButton type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? 'Submitting...' : 'Submit Form'}
                    </NewButton>
                  </form>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Cards</CardTitle>
          <CardDescription>
            Cards with hover effects and click interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {showLegacy && (
              <>
                <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105">
                  <CardHeader>
                    <CardTitle>Hover Me</CardTitle>
                    <CardDescription>Legacy card with hover effect</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This card scales and gains shadow on hover.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed border-primary/50">
                  <CardHeader>
                    <CardTitle>Dashed Border</CardTitle>
                    <CardDescription>Card with dashed border</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This card shows dashed border styling.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
                  <CardHeader>
                    <CardTitle>Gradient Background</CardTitle>
                    <CardDescription>Card with gradient background</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This card has a subtle gradient background.
                    </p>
                  </CardContent>
                </Card>
              </>
            )}

            {showNew && (
              <>
                <NewCard className="cursor-pointer transition-all hover:shadow-lg hover:scale-105">
                  <NewCardHeader>
                    <NewCardTitle>Hover Me</NewCardTitle>
                    <NewCardDescription>New card with hover effect</NewCardDescription>
                  </NewCardHeader>
                  <NewCardContent>
                    <p className="text-sm text-muted-foreground">
                      This card scales and gains shadow on hover.
                    </p>
                  </NewCardContent>
                </NewCard>

                <NewCard className="border-2 border-dashed border-[hsl(214,96%,56%)]/50">
                  <NewCardHeader>
                    <NewCardTitle>Dashed Border</NewCardTitle>
                    <NewCardDescription>Card with dashed border</NewCardDescription>
                  </NewCardHeader>
                  <NewCardContent>
                    <p className="text-sm text-muted-foreground">
                      This card shows dashed border styling.
                    </p>
                  </NewCardContent>
                </NewCard>

                <NewCard className="bg-gradient-to-r from-[hsl(214,96%,56%)]/10 to-[hsl(346,77%,49%)]/10">
                  <NewCardHeader>
                    <NewCardTitle>Gradient Background</NewCardTitle>
                    <NewCardDescription>Card with gradient background</NewCardDescription>
                  </NewCardHeader>
                  <NewCardContent>
                    <p className="text-sm text-muted-foreground">
                      This card has a subtle gradient background.
                    </p>
                  </NewCardContent>
                </NewCard>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* State Management Demo */}
      <Card>
        <CardHeader>
          <CardTitle>State Management Demo</CardTitle>
          <CardDescription>
            Complex state interactions and data flow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {showLegacy && (
              <div className="space-y-6">
                <h4 className="font-semibold">Legacy State Demo</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm font-medium mb-2">Form Data Preview</div>
                    <pre className="text-xs bg-background p-2 rounded">
                      {JSON.stringify(formData, null, 2)}
                    </pre>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm font-medium mb-2">Validation State</div>
                    <div className="space-y-2">
                      {Object.entries(formErrors).map(([field, error]) => (
                        <div key={`legacy-error-${field}`} className="flex items-center gap-2">
                          <span className="text-xs">{field}:</span>
                          <Badge variant={error ? 'destructive' : 'default'}>
                            {error ? 'Error' : 'Valid'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showNew && (
              <div className="space-y-6">
                <h4 className="font-semibold">New State Demo</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm font-medium mb-2">Form Data Preview</div>
                    <pre className="text-xs bg-background p-2 rounded">
                      {JSON.stringify(formData, null, 2)}
                    </pre>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm font-medium mb-2">Validation State</div>
                    <div className="space-y-2">
                      {Object.entries(formErrors).map(([field, error]) => (
                        <div key={`new-error-${field}`} className="flex items-center gap-2">
                          <span className="text-xs">{field}:</span>
                          <Badge variant={error ? 'destructive' : 'default'}>
                            {error ? 'Error' : 'Valid'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}