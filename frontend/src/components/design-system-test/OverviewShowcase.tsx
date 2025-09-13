'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DesignSystemExample } from '@/components/ui-new/example'

interface OverviewShowcaseProps {
  showLegacy: boolean
  showNew: boolean
}

export function OverviewShowcase({ showLegacy, showNew }: OverviewShowcaseProps) {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-foreground">
          DirectDriveX Design System
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          A comprehensive design system ensuring visual consistency across all DirectDriveX applications. 
          This page showcases both the legacy system and the new design system implementation.
        </p>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {showLegacy && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🏛️</span>
                Legacy Design System
              </CardTitle>
              <CardDescription>
                Current design system using BOLT colors and shadcn/ui components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Components</span>
                  <span className="text-sm">30+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Color Palette</span>
                  <span className="text-sm">BOLT Colors</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Framework</span>
                  <span className="text-sm">shadcn/ui</span>
                </div>
              </div>
              <div className="pt-4">
                <Button variant="outline" size="sm" className="w-full">
                  View Legacy Components
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {showNew && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                New Design System
              </CardTitle>
              <CardDescription>
                Enhanced design system with ds- prefix and improved architecture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="default">Phase 1 Complete</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Components</span>
                  <span className="text-sm">5+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Color Palette</span>
                  <span className="text-sm">Design Tokens</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Features</span>
                  <span className="text-sm">Type Safety, Accessibility</span>
                </div>
              </div>
              <div className="pt-4">
                <Button variant="default" size="sm" className="w-full">
                  View New Components
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Demo */}
      {showNew && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Demo - New Design System</CardTitle>
            <CardDescription>
              Interactive preview of the new design system components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DesignSystemExample />
          </CardContent>
        </Card>
      )}

      {/* Feature Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">🎨</span>
              Design Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Comprehensive color system
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Typography scale
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Spacing system
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Shadow system
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">♿</span>
              Accessibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Keyboard navigation
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Screen reader support
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Color contrast
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Focus management
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">📱</span>
              Responsive Design
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Mobile-first approach
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Breakpoint system
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Flexible grid
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Adaptive components
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Learn how to use the design system in your components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Legacy System</h4>
              <div className="bg-muted p-3 rounded-md text-sm font-mono">
                <div>import &#123; Button &#125; from "@/components/ui/button"</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">New System</h4>
              <div className="bg-muted p-3 rounded-md text-sm font-mono">
                <div>import &#123; Button &#125; from "@/components/ui-new/button"</div>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <h4 className="font-semibold mb-2">Design System Utilities</h4>
            <div className="bg-muted p-3 rounded-md text-sm font-mono">
              <div>import &#123; getColor, getSpacing, dcn &#125; from "@/lib/design-system-new"</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}