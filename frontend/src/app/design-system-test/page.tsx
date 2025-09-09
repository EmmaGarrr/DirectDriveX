'use client'

import React, { useState } from 'react'
import { DesignSystemShowcase } from '@/components/design-system-test/DesignSystemShowcase'
import { useTheme } from 'next-themes'

export default function DesignSystemTestPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const { theme, setTheme } = useTheme()
  const [showLegacy, setShowLegacy] = useState(true)
  const [showNew, setShowNew] = useState(true)

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🎨' },
    { id: 'colors', label: 'Colors', icon: '🎨' },
    { id: 'typography', label: 'Typography', icon: '📝' },
    { id: 'components', label: 'Components', icon: '🧩' },
    { id: 'layout', label: 'Layout', icon: '📐' },
    { id: 'interactive', label: 'Interactive', icon: '🎯' },
    { id: 'responsive', label: 'Responsive', icon: '📱' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                DirectDriveX Design System Test
              </h1>
              <p className="text-muted-foreground mt-2">
                Visual testing and component showcase
              </p>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Theme:</span>
                <button
                  onClick={() => setTheme('light')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    theme === 'light' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    theme === 'dark' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  Dark
                </button>
              </div>

              {/* System Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Show:</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLegacy}
                    onChange={(e) => setShowLegacy(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Legacy</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showNew}
                    onChange={(e) => setShowNew(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">New System</span>
                </label>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6">
            <nav className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <DesignSystemShowcase 
          activeTab={activeTab} 
          showLegacy={showLegacy}
          showNew={showNew}
        />
      </div>
    </div>
  )
}