'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface LayoutShowcaseProps {
  showLegacy: boolean
  showNew: boolean
}

// Spacing scale examples
const spacingScale = [
  { name: 'Extra Small', class: 'p-1', size: '0.25rem', value: '4px' },
  { name: 'Small', class: 'p-2', size: '0.5rem', value: '8px' },
  { name: 'Medium', class: 'p-4', size: '1rem', value: '16px' },
  { name: 'Large', class: 'p-6', size: '1.5rem', value: '24px' },
  { name: 'Extra Large', class: 'p-8', size: '2rem', value: '32px' },
  { name: '2X Large', class: 'p-12', size: '3rem', value: '48px' },
  { name: '3X Large', class: 'p-16', size: '4rem', value: '64px' },
  { name: '4X Large', class: 'p-20', size: '5rem', value: '80px' }
]

// Gap scale examples
const gapScale = [
  { name: 'None', class: 'gap-0', size: '0px' },
  { name: 'Extra Small', class: 'gap-1', size: '0.25rem' },
  { name: 'Small', class: 'gap-2', size: '0.5rem' },
  { name: 'Medium', class: 'gap-4', size: '1rem' },
  { name: 'Large', class: 'gap-6', size: '1.5rem' },
  { name: 'Extra Large', class: 'gap-8', size: '2rem' }
]

// Margin examples
const marginExamples = [
  { name: 'No Margin', class: 'm-0' },
  { name: 'Small Margin', class: 'm-2' },
  { name: 'Medium Margin', class: 'm-4' },
  { name: 'Large Margin', class: 'm-6' },
  { name: 'Auto Margin', class: 'mx-auto' }
]

// Padding examples
const paddingExamples = [
  { name: 'No Padding', class: 'p-0' },
  { name: 'Small Padding', class: 'p-2' },
  { name: 'Medium Padding', class: 'p-4' },
  { name: 'Large Padding', class: 'p-6' },
  { name: 'Responsive Padding', class: 'p-4 md:p-6 lg:p-8' }
]

export function LayoutShowcase({ showLegacy, showNew }: LayoutShowcaseProps) {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">
          Layout & Spacing Showcase
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Comprehensive demonstration of spacing scales, layout systems, and responsive design patterns.
          Both legacy and new systems use the same Tailwind spacing foundation.
        </p>
      </div>

      {/* Layout System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {showLegacy && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📐</span>
                Legacy Layout
              </CardTitle>
              <CardDescription>
                Current layout system using Tailwind utilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Spacing Scale</span>
                    <Badge variant="secondary">8</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Grid System</span>
                    <Badge variant="secondary">12</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Flexbox</span>
                    <Badge variant="secondary">✓</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Responsive</span>
                    <Badge variant="secondary">✓</Badge>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>• Tailwind utilities</p>
                  <p>• 12-column grid</p>
                  <p>• Responsive breakpoints</p>
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
                New Layout System
              </CardTitle>
              <CardDescription>
                Enhanced layout with design tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Spacing Scale</span>
                    <Badge variant="default">8</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Grid System</span>
                    <Badge variant="default">12</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Layout Utils</span>
                    <Badge variant="default">✓</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Type Safety</span>
                    <Badge variant="default">✓</Badge>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>• Design token integration</p>
                  <p>• Layout utilities</p>
                  <p>• Better TypeScript</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Spacing Scale */}
      <Card>
        <CardHeader>
          <CardTitle>Spacing Scale</CardTitle>
          <CardDescription>
            Complete spacing scale from 0.25rem to 5rem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {spacingScale.map((spacing, index) => (
              <div key={`spacing-${index}`} className="text-center">
                <div className={`bg-primary/10 border border-primary/20 rounded ${spacing.class} mb-2`}>
                  <div className="flex items-center justify-center h-full text-xs text-primary">
                    {spacing.size}
                  </div>
                </div>
                <div className="text-xs">
                  <div className="font-medium">{spacing.name}</div>
                  <div className="text-muted-foreground">{spacing.class}</div>
                  <div className="text-muted-foreground">{spacing.value}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gap System */}
      <Card>
        <CardHeader>
          <CardTitle>Gap System</CardTitle>
          <CardDescription>
            Gap utilities for spacing between elements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {gapScale.map((gap, index) => (
              <div key={`gap-${index}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{gap.name}</span>
                  <Badge variant="outline" className="text-xs">{gap.class}</Badge>
                </div>
                <div className={`flex ${gap.class}`}>
                  <div className="w-16 h-16 bg-primary rounded"></div>
                  <div className="w-16 h-16 bg-secondary rounded"></div>
                  <div className="w-16 h-16 bg-accent rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Margin Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Margin Examples</CardTitle>
          <CardDescription>
            Different margin utilities and their effects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {marginExamples.map((margin, index) => (
              <div key={`margin-${index}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{margin.name}</span>
                  <Badge variant="outline" className="text-xs">{margin.class}</Badge>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className={`bg-primary/20 border border-primary/30 rounded w-32 h-16 ${margin.class}`}>
                    <div className="flex items-center justify-center h-full text-xs text-primary">
                      Element
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Padding Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Padding Examples</CardTitle>
          <CardDescription>
            Different padding utilities and their effects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {paddingExamples.map((padding, index) => (
              <div key={`padding-${index}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{padding.name}</span>
                  <Badge variant="outline" className="text-xs">{padding.class}</Badge>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className={`bg-primary/20 border border-primary/30 rounded ${padding.class}`}>
                    <div className="flex items-center justify-center h-full text-xs text-primary">
                      Content
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grid System */}
      <Card>
        <CardHeader>
          <CardTitle>Grid System</CardTitle>
          <CardDescription>
            12-column grid system with responsive breakpoints
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-semibold">Basic Grid</h4>
            <div className="grid grid-cols-12 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={`basic-${i}`} className="bg-primary/10 border border-primary/20 rounded p-2 text-xs text-center">
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Column Spans</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 bg-primary/20 border border-primary/30 rounded p-4 text-center">
                  col-span-12
                </div>
              </div>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6 bg-primary/20 border border-primary/30 rounded p-4 text-center">
                  col-span-6
                </div>
                <div className="col-span-6 bg-secondary/20 border border-secondary/30 rounded p-4 text-center">
                  col-span-6
                </div>
              </div>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4 bg-primary/20 border border-primary/30 rounded p-4 text-center">
                  col-span-4
                </div>
                <div className="col-span-4 bg-secondary/20 border border-secondary/30 rounded p-4 text-center">
                  col-span-4
                </div>
                <div className="col-span-4 bg-accent/20 border border-accent/30 rounded p-4 text-center">
                  col-span-4
                </div>
              </div>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3 bg-primary/20 border border-primary/30 rounded p-4 text-center">
                  col-span-3
                </div>
                <div className="col-span-6 bg-secondary/20 border border-secondary/30 rounded p-4 text-center">
                  col-span-6
                </div>
                <div className="col-span-3 bg-accent/20 border border-accent/30 rounded p-4 text-center">
                  col-span-3
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Responsive Grid</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-primary/20 border border-primary/30 rounded p-4 text-center">
                  Mobile: Full<br/>Desktop: 1/4
                </div>
                <div className="bg-secondary/20 border border-secondary/30 rounded p-4 text-center">
                  Mobile: Full<br/>Desktop: 1/4
                </div>
                <div className="bg-accent/20 border border-accent/30 rounded p-4 text-center">
                  Mobile: Full<br/>Desktop: 1/4
                </div>
                <div className="bg-muted/50 border border-muted rounded p-4 text-center">
                  Mobile: Full<br/>Desktop: 1/4
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flexbox Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Flexbox Layouts</CardTitle>
          <CardDescription>
            Common flexbox patterns and utilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-semibold">Flex Direction</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">flex-row</div>
                <div className="flex gap-2 bg-muted p-4 rounded-lg">
                  <div className="w-16 h-16 bg-primary rounded"></div>
                  <div className="w-16 h-16 bg-secondary rounded"></div>
                  <div className="w-16 h-16 bg-accent rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">flex-col</div>
                <div className="flex flex-col gap-2 bg-muted p-4 rounded-lg">
                  <div className="w-16 h-16 bg-primary rounded"></div>
                  <div className="w-16 h-16 bg-secondary rounded"></div>
                  <div className="w-16 h-16 bg-accent rounded"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Justify Content</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">justify-start</div>
                <div className="flex justify-start gap-2 bg-muted p-4 rounded-lg">
                  <div className="w-12 h-12 bg-primary rounded"></div>
                  <div className="w-12 h-12 bg-secondary rounded"></div>
                  <div className="w-12 h-12 bg-accent rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">justify-center</div>
                <div className="flex justify-center gap-2 bg-muted p-4 rounded-lg">
                  <div className="w-12 h-12 bg-primary rounded"></div>
                  <div className="w-12 h-12 bg-secondary rounded"></div>
                  <div className="w-12 h-12 bg-accent rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">justify-between</div>
                <div className="flex justify-between gap-2 bg-muted p-4 rounded-lg">
                  <div className="w-12 h-12 bg-primary rounded"></div>
                  <div className="w-12 h-12 bg-secondary rounded"></div>
                  <div className="w-12 h-12 bg-accent rounded"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Align Items</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">items-start</div>
                <div className="flex items-start gap-2 bg-muted p-4 rounded-lg h-32">
                  <div className="w-12 h-12 bg-primary rounded"></div>
                  <div className="w-12 h-16 bg-secondary rounded"></div>
                  <div className="w-12 h-8 bg-accent rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">items-center</div>
                <div className="flex items-center gap-2 bg-muted p-4 rounded-lg h-32">
                  <div className="w-12 h-12 bg-primary rounded"></div>
                  <div className="w-12 h-16 bg-secondary rounded"></div>
                  <div className="w-12 h-8 bg-accent rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Layout Patterns</CardTitle>
          <CardDescription>
            Common layout patterns and best practices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-semibold">Card Layout</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Card 1</CardTitle>
                  <CardDescription>Card description</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This is a card component demonstrating the layout system.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Card 2</CardTitle>
                  <CardDescription>Card description</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Cards can be arranged in responsive grids.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Card 3</CardTitle>
                  <CardDescription>Card description</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    They adapt to different screen sizes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Sidebar Layout</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Sidebar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      Menu Item 1
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      Menu Item 2
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      Menu Item 3
                    </Button>
                  </CardContent>
                </Card>
              </div>
              <div className="md:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Main Content</CardTitle>
                    <CardDescription>Primary content area</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This is the main content area that takes up the remaining space.
                      The layout automatically adjusts on smaller screens.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responsive Breakpoints */}
      <Card>
        <CardHeader>
          <CardTitle>Responsive Breakpoints</CardTitle>
          <CardDescription>
            Breakpoint system and responsive utilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-lg font-semibold">sm:</div>
              <div className="text-sm text-muted-foreground">640px</div>
              <div className="text-xs">Small devices</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-lg font-semibold">md:</div>
              <div className="text-sm text-muted-foreground">768px</div>
              <div className="text-xs">Medium devices</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-lg font-semibold">lg:</div>
              <div className="text-sm text-muted-foreground">1024px</div>
              <div className="text-xs">Large devices</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-lg font-semibold">xl:</div>
              <div className="text-sm text-muted-foreground">1280px</div>
              <div className="text-xs">Extra large</div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Responsive Text</h4>
            <div className="text-center space-y-2">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold">
                Responsive Heading
              </div>
              <div className="text-sm md:text-base lg:text-lg text-muted-foreground">
                This text changes size based on screen width
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}