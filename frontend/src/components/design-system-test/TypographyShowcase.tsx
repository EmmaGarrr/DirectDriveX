'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TypographyShowcaseProps {
  showLegacy: boolean
  showNew: boolean
}

// Typography scale examples
const typographyScale = [
  { name: 'Heading 1', class: 'text-4xl', weight: 'font-bold', sample: 'The Quick Brown Fox' },
  { name: 'Heading 2', class: 'text-3xl', weight: 'font-semibold', sample: 'The Quick Brown Fox' },
  { name: 'Heading 3', class: 'text-2xl', weight: 'font-semibold', sample: 'The Quick Brown Fox' },
  { name: 'Heading 4', class: 'text-xl', weight: 'font-semibold', sample: 'The Quick Brown Fox' },
  { name: 'Heading 5', class: 'text-lg', weight: 'font-medium', sample: 'The Quick Brown Fox' },
  { name: 'Heading 6', class: 'text-base', weight: 'font-medium', sample: 'The Quick Brown Fox' },
  { name: 'Body Large', class: 'text-lg', weight: 'font-normal', sample: 'The quick brown fox jumps over the lazy dog' },
  { name: 'Body Base', class: 'text-base', weight: 'font-normal', sample: 'The quick brown fox jumps over the lazy dog' },
  { name: 'Body Small', class: 'text-sm', weight: 'font-normal', sample: 'The quick brown fox jumps over the lazy dog' },
  { name: 'Caption', class: 'text-xs', weight: 'font-normal', sample: 'The quick brown fox jumps over the lazy dog' }
]

const fontWeights = [
  { name: 'Thin', class: 'font-thin', value: '100', sample: 'The Quick Brown Fox' },
  { name: 'Extra Light', class: 'font-extralight', value: '200', sample: 'The Quick Brown Fox' },
  { name: 'Light', class: 'font-light', value: '300', sample: 'The Quick Brown Fox' },
  { name: 'Normal', class: 'font-normal', value: '400', sample: 'The Quick Brown Fox' },
  { name: 'Medium', class: 'font-medium', value: '500', sample: 'The Quick Brown Fox' },
  { name: 'Semi Bold', class: 'font-semibold', value: '600', sample: 'The Quick Brown Fox' },
  { name: 'Bold', class: 'font-bold', value: '700', sample: 'The Quick Brown Fox' },
  { name: 'Extra Bold', class: 'font-extrabold', value: '800', sample: 'The Quick Brown Fox' },
  { name: 'Black', class: 'font-black', value: '900', sample: 'The Quick Brown Fox' }
]

const textStyles = [
  { name: 'Leading Tight', class: 'leading-tight', sample: 'The quick brown fox jumps over the lazy dog. This text demonstrates tight line height.' },
  { name: 'Leading Snug', class: 'leading-snug', sample: 'The quick brown fox jumps over the lazy dog. This text demonstrates snug line height.' },
  { name: 'Leading Normal', class: 'leading-normal', sample: 'The quick brown fox jumps over the lazy dog. This text demonstrates normal line height.' },
  { name: 'Leading Relaxed', class: 'leading-relaxed', sample: 'The quick brown fox jumps over the lazy dog. This text demonstrates relaxed line height.' },
  { name: 'Leading Loose', class: 'leading-loose', sample: 'The quick brown fox jumps over the lazy dog. This text demonstrates loose line height.' }
]

const trackingStyles = [
  { name: 'Tighter', class: 'tracking-tighter', sample: 'The Quick Brown Fox' },
  { name: 'Tight', class: 'tracking-tight', sample: 'The Quick Brown Fox' },
  { name: 'Normal', class: 'tracking-normal', sample: 'The Quick Brown Fox' },
  { name: 'Wide', class: 'tracking-wide', sample: 'The Quick Brown Fox' },
  { name: 'Wider', class: 'tracking-wider', sample: 'The Quick Brown Fox' },
  { name: 'Widest', class: 'tracking-widest', sample: 'The Quick Brown Fox' }
]

function TypographyExample({ name, class: className, weight, sample }: { 
  name: string; 
  class: string; 
  weight?: string; 
  sample: string; 
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{name}</span>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">{className}</Badge>
          {weight && <Badge variant="secondary" className="text-xs">{weight}</Badge>}
        </div>
      </div>
      <div className={`${className} ${weight || ''} p-4 bg-muted rounded-lg`}>
        {sample}
      </div>
    </div>
  )
}

export function TypographyShowcase({ showLegacy, showNew }: TypographyShowcaseProps) {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">
          Typography Showcase
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Comprehensive typography system demonstration showing font sizes, weights, line heights, 
          and letter spacing. Both legacy and new systems use the same typography foundation.
        </p>
      </div>

      {/* Typography System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {showLegacy && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📝</span>
                Legacy Typography
              </CardTitle>
              <CardDescription>
                Current typography system using Tailwind classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Font Sizes</span>
                    <Badge variant="secondary">10</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Font Weights</span>
                    <Badge variant="secondary">9</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Line Heights</span>
                    <Badge variant="secondary">5</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Letter Spacing</span>
                    <Badge variant="secondary">6</Badge>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>• Direct Tailwind class usage</p>
                  <p>• Inter font family</p>
                  <p>• Responsive typography</p>
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
                New Typography System
              </CardTitle>
              <CardDescription>
                Enhanced typography with design tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Font Sizes</span>
                    <Badge variant="default">10</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Font Weights</span>
                    <Badge variant="default">9</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Line Heights</span>
                    <Badge variant="default">5</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Letter Spacing</span>
                    <Badge variant="default">6</Badge>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>• Design token integration</p>
                  <p>• Type-safe utilities</p>
                  <p>• Improved accessibility</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Typography Scale */}
      <Card>
        <CardHeader>
          <CardTitle>Typography Scale</CardTitle>
          <CardDescription>
            Complete typography scale from headings to body text
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {typographyScale.map((item, index) => (
              <TypographyExample
                key={`scale-${index}`}
                name={item.name}
                class={item.class}
                weight={item.weight}
                sample={item.sample}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Font Weights */}
      <Card>
        <CardHeader>
          <CardTitle>Font Weights</CardTitle>
          <CardDescription>
            Complete range of font weights from thin to black
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fontWeights.map((weight, index) => (
              <div key={`weight-${index}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{weight.name}</span>
                  <Badge variant="outline" className="text-xs">{weight.value}</Badge>
                </div>
                <div className={`${weight.class} p-4 bg-muted rounded-lg`}>
                  {weight.sample}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Line Heights */}
      <Card>
        <CardHeader>
          <CardTitle>Line Heights</CardTitle>
          <CardDescription>
            Different line height options for text readability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {textStyles.map((style, index) => (
              <div key={`leading-${index}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{style.name}</span>
                  <Badge variant="outline" className="text-xs">{style.class}</Badge>
                </div>
                <div className={`${style.class} p-4 bg-muted rounded-lg`}>
                  {style.sample}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Letter Spacing */}
      <Card>
        <CardHeader>
          <CardTitle>Letter Spacing</CardTitle>
          <CardDescription>
            Different letter spacing options for text styling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trackingStyles.map((style, index) => (
              <div key={`tracking-${index}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{style.name}</span>
                  <Badge variant="outline" className="text-xs">{style.class}</Badge>
                </div>
                <div className={`${style.class} p-4 bg-muted rounded-lg text-center`}>
                  {style.sample}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Typography Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
          <CardDescription>
            Real-world typography usage patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-semibold">Article Layout</h4>
            <div className="space-y-4 p-6 bg-muted rounded-lg">
              <h1 className="text-4xl font-bold">Article Title</h1>
              <h2 className="text-2xl font-semibold">Section Heading</h2>
              <p className="text-base leading-relaxed">
                This is a paragraph of body text that demonstrates the normal text size and line height. 
                It should be comfortable to read and provide good readability for longer content.
              </p>
              <h3 className="text-xl font-semibold">Subsection Heading</h3>
              <p className="text-base leading-relaxed">
                Another paragraph showing how the typography system works together to create 
                a cohesive reading experience.
              </p>
              <p className="text-sm text-muted-foreground">
                This is a caption or small text that might be used for image captions, footnotes, 
                or other secondary information.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">UI Components</h4>
            <div className="space-y-4 p-6 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Card Title</span>
                <span className="text-sm text-muted-foreground">2 min read</span>
              </div>
              <p className="text-base">
                Card body text with medium importance
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Metadata 1</span>
                <span>•</span>
                <span>Metadata 2</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Typography Accessibility</CardTitle>
          <CardDescription>
            Best practices for accessible typography
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold">WCAG Guidelines</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Minimum font size: 16px for body text</li>
                <li>• Line height: 1.5x font size</li>
                <li>• Character spacing: 0.12x font size</li>
                <li>• Word spacing: 0.16x font size</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Best Practices</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Limit to 2-3 font families</li>
                <li>• Maintain consistent scale</li>
                <li>• Ensure adequate contrast</li>
                <li>• Test across devices</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}