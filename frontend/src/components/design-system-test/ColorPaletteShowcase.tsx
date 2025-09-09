'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ColorPaletteShowcaseProps {
  showLegacy: boolean
  showNew: boolean
}

// Legacy BOLT colors
const legacyColors = [
  { name: 'Primary', value: 'hsl(214, 96%, 56%)', class: 'bg-primary' },
  { name: 'Secondary', value: 'hsl(214, 32%, 91%)', class: 'bg-secondary' },
  { name: 'Accent', value: 'hsl(346, 77%, 49%)', class: 'bg-accent' },
  { name: 'Muted', value: 'hsl(214, 32%, 91%)', class: 'bg-muted' },
  { name: 'Foreground', value: 'hsl(222, 84%, 5%)', class: 'bg-foreground' },
  { name: 'Background', value: 'hsl(0, 0%, 100%)', class: 'bg-background' },
  { name: 'Card', value: 'hsl(0, 0%, 100%)', class: 'bg-card' },
  { name: 'Border', value: 'hsl(214, 32%, 91%)', class: 'bg-border' },
  { name: 'Ring', value: 'hsl(214, 96%, 56%)', class: 'bg-ring' },
  { name: 'Destructive', value: 'hsl(0, 84%, 60%)', class: 'bg-destructive' },
  { name: 'Success', value: 'hsl(142, 76%, 36%)', class: 'bg-green-600' },
  { name: 'Warning', value: 'hsl(38, 92%, 50%)', class: 'bg-yellow-500' },
  { name: 'Info', value: 'hsl(199, 89%, 48%)', class: 'bg-blue-600' }
]

// New design system colors
const newColors = [
  { name: 'Primary', value: 'hsl(214, 96%, 56%)', class: 'bg-[hsl(214,96%,56%)]' },
  { name: 'Primary Foreground', value: 'hsl(0, 0%, 98%)', class: 'bg-[hsl(0,0%,98%)]' },
  { name: 'Secondary', value: 'hsl(214, 32%, 91%)', class: 'bg-[hsl(214,32%,91%)]' },
  { name: 'Secondary Foreground', value: 'hsl(0, 0%, 10%)', class: 'bg-[hsl(0,0%,10%)]' },
  { name: 'Accent', value: 'hsl(346, 77%, 49%)', class: 'bg-[hsl(346,77%,49%)]' },
  { name: 'Accent Foreground', value: 'hsl(0, 0%, 98%)', class: 'bg-[hsl(0,0%,98%)]' },
  { name: 'Muted', value: 'hsl(214, 32%, 91%)', class: 'bg-[hsl(214,32%,91%)]' },
  { name: 'Muted Foreground', value: 'hsl(215, 16%, 47%)', class: 'bg-[hsl(215,16%,47%)]' },
  { name: 'Background', value: 'hsl(0, 0%, 100%)', class: 'bg-[hsl(0,0%,100%)]' },
  { name: 'Foreground', value: 'hsl(222, 84%, 5%)', class: 'bg-[hsl(222,84%,5%)]' },
  { name: 'Card', value: 'hsl(0, 0%, 100%)', class: 'bg-[hsl(0,0%,100%)]' },
  { name: 'Card Foreground', value: 'hsl(222, 84%, 5%)', class: 'bg-[hsl(222,84%,5%)]' },
  { name: 'Border', value: 'hsl(214, 32%, 91%)', class: 'bg-[hsl(214,32%,91%)]' },
  { name: 'Ring', value: 'hsl(214, 96%, 56%)', class: 'bg-[hsl(214,96%,56%)]' },
  { name: 'Destructive', value: 'hsl(0, 84%, 60%)', class: 'bg-[hsl(0,84%,60%)]' },
  { name: 'Destructive Foreground', value: 'hsl(0, 0%, 98%)', class: 'bg-[hsl(0,0%,98%)]' },
  { name: 'Success', value: 'hsl(142, 76%, 36%)', class: 'bg-[hsl(142,76%,36%)]' },
  { name: 'Success Foreground', value: 'hsl(0, 0%, 98%)', class: 'bg-[hsl(0,0%,98%)]' },
  { name: 'Warning', value: 'hsl(38, 92%, 50%)', class: 'bg-[hsl(38,92%,50%)]' },
  { name: 'Warning Foreground', value: 'hsl(0, 0%, 10%)', class: 'bg-[hsl(0,0%,10%)]' },
  { name: 'Info', value: 'hsl(199, 89%, 48%)', class: 'bg-[hsl(199,89%,48%)]' },
  { name: 'Info Foreground', value: 'hsl(0, 0%, 98%)', class: 'bg-[hsl(0,0%,98%)]' }
]

const semanticColors = [
  { name: 'Success', value: 'hsl(142, 76%, 36%)', class: 'bg-green-600' },
  { name: 'Warning', value: 'hsl(38, 92%, 50%)', class: 'bg-yellow-500' },
  { name: 'Error', value: 'hsl(0, 84%, 60%)', class: 'bg-red-600' },
  { name: 'Info', value: 'hsl(199, 89%, 48%)', class: 'bg-blue-600' }
]

function ColorSwatch({ name, value, className }: { name: string; value: string; className: string }) {
  const isLight = value.includes('100%') || value.includes('98%') || value.includes('91%')
  const textColor = isLight ? 'text-gray-900' : 'text-white'
  
  return (
    <div className="space-y-2">
      <div className={`h-20 rounded-lg border border-gray-300 ${className} flex items-center justify-center`}>
        <span className={`text-sm font-medium ${textColor}`}>{name}</span>
      </div>
      <div className="text-center">
        <div className="text-xs font-mono text-muted-foreground">{value}</div>
        <div className="text-xs text-muted-foreground">{className}</div>
      </div>
    </div>
  )
}

export function ColorPaletteShowcase({ showLegacy, showNew }: ColorPaletteShowcaseProps) {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">
          Color Palette Showcase
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Visual comparison of color palettes between the legacy BOLT system and the new design system.
          Each color is displayed with its HSL value and CSS class.
        </p>
      </div>

      {/* Color System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {showLegacy && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🎨</span>
                Legacy BOLT Colors
              </CardTitle>
              <CardDescription>
                Current color system using standard Tailwind classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Total Colors</span>
                    <Badge variant="secondary">13</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Named Colors</span>
                    <Badge variant="secondary">10</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Semantic</span>
                    <Badge variant="secondary">4</Badge>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>• Direct Tailwind class integration</p>
                  <p>• No design tokens</p>
                  <p>• Limited color variations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {showNew && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🌈</span>
                New Design System Colors
              </CardTitle>
              <CardDescription>
                Enhanced color system with comprehensive design tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Total Colors</span>
                    <Badge variant="default">22</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Named Colors</span>
                    <Badge variant="default">16</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Semantic</span>
                    <Badge variant="default">4</Badge>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>• Comprehensive design tokens</p>
                  <p>• Foreground/Background pairs</p>
                  <p>• Better accessibility ratios</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Color Palettes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {showLegacy && (
          <Card>
            <CardHeader>
              <CardTitle>Legacy BOLT Colors</CardTitle>
              <CardDescription>
                Current color system with direct Tailwind classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {legacyColors.map((color, index) => (
                  <ColorSwatch
                    key={`legacy-${index}`}
                    name={color.name}
                    value={color.value}
                    className={color.class}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {showNew && (
          <Card>
            <CardHeader>
              <CardTitle>New Design System Colors</CardTitle>
              <CardDescription>
                Enhanced color system with design tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {newColors.map((color, index) => (
                  <ColorSwatch
                    key={`new-${index}`}
                    name={color.name}
                    value={color.value}
                    className={color.class}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Semantic Colors */}
      {showLegacy && showNew && (
        <Card>
          <CardHeader>
            <CardTitle>Semantic Colors</CardTitle>
            <CardDescription>
              Status colors used throughout the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {semanticColors.map((color, index) => (
                <ColorSwatch
                  key={`semantic-${index}`}
                  name={color.name}
                  value={color.value}
                  className={color.class}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Color Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Color Usage Examples</CardTitle>
          <CardDescription>
            How colors are applied in different contexts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Button States</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-8 bg-primary rounded"></div>
                  <span className="text-sm">Primary (Default)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-8 bg-secondary rounded"></div>
                  <span className="text-sm">Secondary</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-8 bg-destructive rounded"></div>
                  <span className="text-sm">Destructive</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Background Variations</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-8 bg-background border rounded"></div>
                  <span className="text-sm">Background</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-8 bg-muted border rounded"></div>
                  <span className="text-sm">Muted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-8 bg-card border rounded"></div>
                  <span className="text-sm">Card</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Compliance</CardTitle>
          <CardDescription>
            Color contrast ratios and accessibility features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold">WCAG 2.1 AA Standards</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Normal text: 4.5:1 minimum contrast</li>
                <li>• Large text: 3:1 minimum contrast</li>
                <li>• Non-text elements: 3:1 minimum contrast</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Color System Features</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Consistent naming conventions</li>
                <li>• Dark mode support</li>
                <li>• Semantic color mapping</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}