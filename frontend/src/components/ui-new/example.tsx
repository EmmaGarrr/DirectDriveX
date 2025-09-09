/**
 * DirectDriveX New Design System - Example Usage
 * Phase 1: Foundation Setup
 * 
 * This file demonstrates how to use the new design system components.
 * All components follow the design system rules with ds- prefix.
 */

import React from 'react'
import { Button } from './button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card'
import { Input } from './input'
import { cn } from '@/lib/utils'

/**
 * Example component showcasing the new design system
 */
export const DesignSystemExample = () => {
  const [inputValue, setInputValue] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const handleButtonClick = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
  }

  return (
    <div className="ds-example-wrapper p-8 space-y-8">
      {/* Example 1: Button Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Button Variants</CardTitle>
          <CardDescription>
            All button variants following the design system rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="ds-button-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </CardContent>
      </Card>

      {/* Example 2: Button Sizes */}
      <Card>
        <CardHeader>
          <CardTitle>Button Sizes</CardTitle>
          <CardDescription>
            All button sizes following the design system rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="ds-button-sizes flex flex-wrap gap-4 items-center">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
          </div>
        </CardContent>
      </Card>

      {/* Example 3: Card Variants */}
      <div className="ds-card-variants grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="default">
          <CardHeader>
            <CardTitle>Default Card</CardTitle>
            <CardDescription>
              This is the default card variant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here with proper spacing and typography.</p>
          </CardContent>
          <CardFooter>
            <Button variant="primary" size="sm">Action</Button>
          </CardFooter>
        </Card>

        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Outlined Card</CardTitle>
            <CardDescription>
              This is the outlined card variant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here with proper spacing and typography.</p>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" size="sm">Action</Button>
          </CardFooter>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Elevated Card</CardTitle>
            <CardDescription>
              This is the elevated card variant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here with proper spacing and typography.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm">Action</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Example 4: Input Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Input Variants</CardTitle>
          <CardDescription>
            All input variants following the design system rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="ds-input-form space-y-4">
            <Input
              variant="default"
              placeholder="Default input"
              value={inputValue}
              onChange={handleInputChange}
            />
            <Input
              variant="filled"
              placeholder="Filled input"
              value={inputValue}
              onChange={handleInputChange}
            />
            <Input
              variant="outlined"
              placeholder="Outlined input"
              value={inputValue}
              onChange={handleInputChange}
            />
            <Input
              variant="default"
              placeholder="Input with error"
              error={true}
              value={inputValue}
              onChange={handleInputChange}
            />
            <Input
              variant="default"
              placeholder="Disabled input"
              disabled
              value={inputValue}
              onChange={handleInputChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Example 5: Interactive Demo */}
      <Card interactive>
        <CardHeader>
          <CardTitle>Interactive Demo</CardTitle>
          <CardDescription>
            Click this card to see interactive states
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="ds-interactive-content space-y-4">
            <Input
              variant="default"
              placeholder="Type something..."
              value={inputValue}
              onChange={handleInputChange}
            />
            <Button 
              variant="primary" 
              onClick={handleButtonClick}
              loading={isLoading}
            >
              {isLoading ? 'Processing...' : 'Click Me'}
            </Button>
            <p className="text-sm text-muted-foreground">
              Input value: {inputValue || '(empty)'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DesignSystemExample