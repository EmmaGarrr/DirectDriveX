'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ResponsiveShowcaseProps {
  showLegacy: boolean
  showNew: boolean
}

export function ResponsiveShowcase({ showLegacy, showNew }: ResponsiveShowcaseProps) {
  const [currentBreakpoint, setCurrentBreakpoint] = useState('all')

  const breakpoints = [
    { name: 'All', value: 'all', width: 'Any' },
    { name: 'Mobile', value: 'sm', width: '< 640px' },
    { name: 'Tablet', value: 'md', width: '≥ 768px' },
    { name: 'Desktop', value: 'lg', width: '≥ 1024px' },
    { name: 'Large Desktop', value: 'xl', width: '≥ 1280px' }
  ]

  const responsiveExamples = [
    {
      title: 'Responsive Grid',
      description: 'Grid that adapts to screen size',
      component: (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-primary/10 border border-primary/20 rounded p-4 text-center">
              <div className="text-sm font-medium">Item {i}</div>
              <div className="text-xs text-muted-foreground">
                <span className="hidden sm:inline">sm:</span>
                <span className="hidden md:inline sm:hidden">md:</span>
                <span className="hidden lg:inline md:hidden">lg:</span>
                <span className="lg:hidden xl:inline">xl:</span>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'Responsive Text',
      description: 'Text that scales with screen size',
      component: (
        <div className="text-center space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
            Responsive Heading
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground">
            This text adapts to different screen sizes for optimal readability.
          </p>
        </div>
      )
    },
    {
      title: 'Responsive Sidebar',
      description: 'Layout that changes based on screen size',
      component: (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-secondary/10 border border-secondary/20 rounded p-4">
              <h3 className="font-semibold mb-3">Sidebar</h3>
              <div className="space-y-2">
                {['Home', 'About', 'Services', 'Contact'].map(item => (
                  <button key={item} className="w-full text-left p-2 hover:bg-secondary/20 rounded text-sm">
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="bg-primary/10 border border-primary/20 rounded p-6">
              <h3 className="font-semibold mb-3">Main Content</h3>
              <p className="text-sm text-muted-foreground">
                On mobile devices, the sidebar appears above the main content. 
                On desktop devices, the sidebar appears on the left side.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Responsive Cards',
      description: 'Cards that rearrange based on available space',
      component: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Card 1', content: 'This card adapts to different screen sizes.' },
            { title: 'Card 2', content: 'Cards rearrange automatically.' },
            { title: 'Card 3', content: 'Grid system handles responsiveness.' },
            { title: 'Card 4', content: 'No need for separate mobile layouts.' },
            { title: 'Card 5', content: 'Built-in responsive utilities.' },
            { title: 'Card 6', content: 'Works on all device sizes.' }
          ].map((card, index) => (
            <div key={index} className="bg-accent/10 border border-accent/20 rounded p-4">
              <h4 className="font-semibold mb-2">{card.title}</h4>
              <p className="text-sm text-muted-foreground">{card.content}</p>
            </div>
          ))}
        </div>
      )
    }
  ]

  const responsiveNavigation = (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline">Home</Button>
        <Button size="sm" variant="outline">About</Button>
        <Button size="sm" variant="outline">Services</Button>
        <Button size="sm" variant="outline">Portfolio</Button>
        <Button size="sm" variant="outline">Contact</Button>
      </div>
      <div className="md:hidden text-center">
        <Badge variant="secondary">Mobile Navigation</Badge>
      </div>
      <div className="hidden md:block lg:hidden text-center">
        <Badge variant="secondary">Tablet Navigation</Badge>
      </div>
      <div className="hidden lg:block text-center">
        <Badge variant="default">Desktop Navigation</Badge>
      </div>
    </div>
  )

  const responsiveImages = (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
            <span className="text-sm font-medium">Image {i}</span>
          </div>
        ))}
      </div>
      <div className="text-center text-sm text-muted-foreground">
        2 columns on mobile → 4 columns on desktop
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">
          Responsive Design Showcase
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Comprehensive demonstration of responsive design patterns and utilities.
          Test how components adapt to different screen sizes and orientations.
        </p>
      </div>

      {/* Breakpoint Information */}
      <Card>
        <CardHeader>
          <CardTitle>Breakpoint System</CardTitle>
          <CardDescription>
            Tailwind CSS breakpoints and responsive utilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {breakpoints.map(bp => (
              <div
                key={bp.value}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  currentBreakpoint === bp.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setCurrentBreakpoint(bp.value)}
              >
                <div className="text-center">
                  <div className="font-semibold">{bp.name}</div>
                  <div className="text-sm text-muted-foreground">{bp.width}</div>
                  <div className="text-xs font-mono mt-1">{bp.value}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Responsive Examples */}
      {responsiveExamples.map((example, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{example.title}</CardTitle>
            <CardDescription>{example.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {example.component}
          </CardContent>
        </Card>
      ))}

      {/* Responsive Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Responsive Navigation</CardTitle>
          <CardDescription>
            Navigation that adapts to different screen sizes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {responsiveNavigation}
        </CardContent>
      </Card>

      {/* Responsive Images */}
      <Card>
        <CardHeader>
          <CardTitle>Responsive Image Grid</CardTitle>
          <CardDescription>
            Image grid that adjusts column count based on screen size
          </CardDescription>
        </CardHeader>
        <CardContent>
          {responsiveImages}
        </CardContent>
      </Card>

      {/* Responsive Typography */}
      <Card>
        <CardHeader>
          <CardTitle>Responsive Typography</CardTitle>
          <CardDescription>
            Text sizing that adapts to viewport width
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              Hero Title
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8">
              This text scales smoothly across different screen sizes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-semibold">Content Section</h3>
              <p className="text-sm sm:text-base leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
                nostrud exercitation ullamco laboris.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-semibold">Another Section</h3>
              <p className="text-sm sm:text-base leading-relaxed">
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore 
                eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responsive Forms */}
      <Card>
        <CardHeader>
          <CardTitle>Responsive Forms</CardTitle>
          <CardDescription>
            Form layouts that adapt to different screen sizes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Form</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <textarea
                  placeholder="Message"
                  rows={4}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button className="w-full sm:w-auto">Send Message</Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Newsletter Signup</h3>
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" className="flex-1">Monthly</Button>
                  <Button variant="outline" className="flex-1">Weekly</Button>
                  <Button className="flex-1">Subscribe</Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Device Testing</CardTitle>
          <CardDescription>
            Test how your design looks on different devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-full max-w-xs mx-auto bg-black rounded-lg p-4">
                <div className="bg-white rounded p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-20 bg-gray-100 rounded mt-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Mobile Portrait</p>
            </div>

            <div className="text-center">
              <div className="w-full max-w-sm mx-auto bg-black rounded-lg p-4">
                <div className="bg-white rounded p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="h-16 bg-gray-100 rounded"></div>
                    <div className="h-16 bg-gray-100 rounded"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Mobile Landscape</p>
            </div>

            <div className="text-center">
              <div className="w-full max-w-md mx-auto bg-black rounded-lg p-4">
                <div className="bg-white rounded p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="h-20 bg-gray-100 rounded"></div>
                    <div className="h-20 bg-gray-100 rounded"></div>
                    <div className="h-20 bg-gray-100 rounded"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Tablet/Desktop</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Resize your browser window to see how the design adapts to different screen sizes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Responsive Best Practices</CardTitle>
          <CardDescription>
            Key principles and guidelines for responsive design
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Mobile-First Approach</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Design for mobile screens first</li>
                <li>• Progressively enhance for larger screens</li>
                <li>• Start with single column layouts</li>
                <li>• Add complexity as screen size increases</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Performance Considerations</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Optimize images for different devices</li>
                <li>• Use responsive images with srcset</li>
                <li>• Minimize HTTP requests</li>
                <li>• Consider loading states for mobile</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Touch Targets</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Minimum 44x44px touch targets</li>
                <li>• Adequate spacing between interactive elements</li>
                <li>• Consider thumb zones on mobile</li>
                <li>• Large, easy-to-tap buttons</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Content Strategy</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Prioritize content for mobile users</li>
                <li>• Use progressive disclosure</li>
                <li>• Consider content hierarchy</li>
                <li>• Test with real content</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}