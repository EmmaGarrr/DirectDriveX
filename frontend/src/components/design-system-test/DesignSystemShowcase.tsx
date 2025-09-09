
'use client'

import React from 'react'
import { ColorPaletteShowcase } from './ColorPaletteShowcase'
import { TypographyShowcase } from './TypographyShowcase'
import { ComponentShowcase } from './ComponentShowcase'
import { LayoutShowcase } from './LayoutShowcase'
import { InteractiveDemo } from './InteractiveDemo'
import { ResponsiveShowcase } from './ResponsiveShowcase'
import { OverviewShowcase } from './OverviewShowcase'

interface DesignSystemShowcaseProps {
  activeTab: string
  showLegacy: boolean
  showNew: boolean
}

export function DesignSystemShowcase({ activeTab, showLegacy, showNew }: DesignSystemShowcaseProps) {
  switch (activeTab) {
    case 'overview':
      return <OverviewShowcase showLegacy={showLegacy} showNew={showNew} />
    case 'colors':
      return <ColorPaletteShowcase showLegacy={showLegacy} showNew={showNew} />
    case 'typography':
      return <TypographyShowcase showLegacy={showLegacy} showNew={showNew} />
    case 'components':
      return <ComponentShowcase showLegacy={showLegacy} showNew={showNew} />
    case 'layout':
      return <LayoutShowcase showLegacy={showLegacy} showNew={showNew} />
    case 'interactive':
      return <InteractiveDemo showLegacy={showLegacy} showNew={showNew} />
    case 'responsive':
      return <ResponsiveShowcase showLegacy={showLegacy} showNew={showNew} />
    default:
      return <OverviewShowcase showLegacy={showLegacy} showNew={showNew} />
  }
}