/**
 * LocalStack Design System - Example Component
 *
 * This component demonstrates how to use the LocalStack design system.
 * It showcases:
 * - Typography scale
 * - Color system
 * - Components (cards, buttons, badges)
 * - Animations
 * - Responsive design
 */

'use client'

import { useState } from 'react'

export function LocalStackExamples() {
  const [activeTab, setActiveTab] = useState<'typography' | 'colors' | 'components' | 'animations'>(
    'typography'
  )

  return (
    <div className="min-h-screen bg-ls-bg-primary text-ls-text-primary p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <h1 className="ls-h1 mb-4">LocalStack Design System</h1>
        <p className="ls-body-lg text-ls-text-secondary mb-8">
          A comprehensive design system inspired by LocalStack's modern aesthetic, featuring
          purple-toned colors, Aeonik typography, and smooth animations.
        </p>

        {/* Tab Navigation */}
        <div className="flex gap-2 flex-wrap mb-8">
          {(['typography', 'colors', 'components', 'animations'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`ls-button ${
                activeTab === tab ? 'ls-button--primary' : 'ls-button--secondary'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto">
        {/* Typography Section */}
        {activeTab === 'typography' && (
          <section className="space-y-12">
            <h2 className="ls-h2">Typography Scale</h2>

            {/* Headings */}
            <div className="space-y-6">
              <h3 className="ls-h3">Headings</h3>
              <div className="grid gap-6">
                <div>
                  <p className="ls-caption mb-2">H1 - 48px, Bold</p>
                  <h1 className="ls-h1">The quick brown fox jumps over the lazy dog</h1>
                </div>
                <div>
                  <p className="ls-caption mb-2">H2 - 36px, Bold</p>
                  <h2 className="ls-h2">The quick brown fox jumps over the lazy dog</h2>
                </div>
                <div>
                  <p className="ls-caption mb-2">H3 - 30px, Semibold</p>
                  <h3 className="ls-h3">The quick brown fox jumps over the lazy dog</h3>
                </div>
                <div>
                  <p className="ls-caption mb-2">H4 - 24px, Semibold</p>
                  <h4 className="ls-h4">The quick brown fox jumps over the lazy dog</h4>
                </div>
                <div>
                  <p className="ls-caption mb-2">H5 - 20px, Semibold</p>
                  <h5 className="ls-h5">The quick brown fox jumps over the lazy dog</h5>
                </div>
                <div>
                  <p className="ls-caption mb-2">H6 - 18px, Semibold</p>
                  <h6 className="ls-h6">The quick brown fox jumps over the lazy dog</h6>
                </div>
              </div>
            </div>

            {/* Body Text */}
            <div className="space-y-6">
              <h3 className="ls-h3">Body Text</h3>
              <div className="grid gap-6">
                <div>
                  <p className="ls-caption mb-2">Body Large - 18px</p>
                  <p className="ls-body-lg">
                    The quick brown fox jumps over the lazy dog. This is the large body text size used
                    for prominent content and long-form reading.
                  </p>
                </div>
                <div>
                  <p className="ls-caption mb-2">Body - 16px (Default)</p>
                  <p className="ls-body">
                    The quick brown fox jumps over the lazy dog. This is the default body text size used
                    throughout the application.
                  </p>
                </div>
                <div>
                  <p className="ls-caption mb-2">Body Small - 14px</p>
                  <p className="ls-body-sm">
                    The quick brown fox jumps over the lazy dog. This is the small body text size used
                    for secondary information.
                  </p>
                </div>
              </div>
            </div>

            {/* Special Text */}
            <div className="space-y-6">
              <h3 className="ls-h3">Special Text Styles</h3>
              <div className="grid gap-6">
                <div>
                  <p className="ls-caption mb-2">Caption - Uppercase, 12px</p>
                  <span className="ls-caption">This is a caption label</span>
                </div>
                <div>
                  <p className="ls-caption mb-2">Code - Monospace</p>
                  <code className="ls-code">npm install localstack</code>
                </div>
                <div>
                  <p className="ls-caption mb-2">Gradient Text</p>
                  <h3 className="ls-gradient-text text-2xl font-bold">
                    Gradient Text Effect with Aeonik
                  </h3>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Colors Section */}
        {activeTab === 'colors' && (
          <section className="space-y-12">
            <h2 className="ls-h2">Color Palette</h2>

            {/* Brand Colors */}
            <div className="space-y-4">
              <h3 className="ls-h3">Brand Colors (Purple)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Primary', color: '#4d0dcf', var: '--ls-purple-primary' },
                  { name: 'Accent', color: '#6e3ae8', var: '--ls-purple-accent' },
                  { name: 'Accent Low', color: '#241b47', var: '--ls-purple-accent-low' },
                  { name: 'Accent High', color: '#c6c1fa', var: '--ls-purple-accent-high' },
                ].map(({ name, color, var: cssVar }) => (
                  <div key={name} className="space-y-2">
                    <div
                      className="w-full h-24 rounded-lg border border-ls-border-primary"
                      style={{ backgroundColor: color }}
                    />
                    <p className="ls-caption">{name}</p>
                    <p className="ls-body-sm font-mono">{color}</p>
                    <p className="ls-body-sm text-ls-text-tertiary font-mono text-xs">{cssVar}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Gray Scale */}
            <div className="space-y-4">
              <h3 className="ls-h3">Gray Scale</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Gray 100', color: '#eceef2' },
                  { name: 'Gray 200', color: '#c0c2c7' },
                  { name: 'Gray 300', color: '#888b96' },
                  { name: 'Gray 400', color: '#545861' },
                  { name: 'Gray 500', color: '#353841' },
                  { name: 'Gray 600', color: '#24272f' },
                  { name: 'Gray 700', color: '#17181c' },
                ].map(({ name, color }) => (
                  <div key={name} className="space-y-2">
                    <div
                      className="w-full h-24 rounded-lg border border-ls-border-primary"
                      style={{ backgroundColor: color }}
                    />
                    <p className="ls-caption">{name}</p>
                    <p className="ls-body-sm font-mono text-xs">{color}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Semantic Colors */}
            <div className="space-y-4">
              <h3 className="ls-h3">Semantic Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Success', color: '#3ecf8e', var: '--ls-success' },
                  { name: 'Warning', color: '#f4af41', var: '--ls-warning' },
                  { name: 'Error', color: '#ff6b6b', var: '--ls-error' },
                  { name: 'Info', color: '#00d4ff', var: '--ls-info' },
                ].map(({ name, color, var: cssVar }) => (
                  <div key={name} className="space-y-2">
                    <div
                      className="w-full h-24 rounded-lg border border-ls-border-primary"
                      style={{ backgroundColor: color }}
                    />
                    <p className="ls-caption">{name}</p>
                    <p className="ls-body-sm font-mono text-xs">{color}</p>
                    <p className="ls-body-sm text-ls-text-tertiary font-mono text-xs">{cssVar}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Components Section */}
        {activeTab === 'components' && (
          <section className="space-y-12">
            <h2 className="ls-h2">Components</h2>

            {/* Cards */}
            <div className="space-y-4">
              <h3 className="ls-h3">Cards</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="ls-card">
                  <h4 className="ls-h4 mb-3">Default Card</h4>
                  <p className="ls-body">
                    Standard card with border and subtle shadow. Perfect for content containers.
                  </p>
                </div>
                <div className="ls-card ls-card--elevated">
                  <h4 className="ls-h4 mb-3">Elevated Card</h4>
                  <p className="ls-body">
                    Elevated card with stronger shadow. Use for prominent content.
                  </p>
                </div>
                <div className="ls-card ls-card--interactive hover:cursor-pointer">
                  <h4 className="ls-h4 mb-3">Interactive Card</h4>
                  <p className="ls-body">
                    Interactive card with hover effects. Lifts on hover for better UX.
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-4">
              <h3 className="ls-h3">Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <button className="ls-button ls-button--primary">Primary Button</button>
                <button className="ls-button ls-button--secondary">Secondary Button</button>
                <button className="ls-button ls-button--ghost">Ghost Button</button>
                <button className="ls-button ls-button--primary" disabled>
                  Disabled Button
                </button>
              </div>
            </div>

            {/* Badges */}
            <div className="space-y-4">
              <h3 className="ls-h3">Badges</h3>
              <div className="flex flex-wrap gap-4">
                <span className="ls-badge">Default</span>
                <span className="ls-badge ls-badge--success">Success</span>
                <span className="ls-badge ls-badge--warning">Warning</span>
                <span className="ls-badge ls-badge--error">Error</span>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <h3 className="ls-h3">Inputs</h3>
              <input type="text" className="ls-input" placeholder="Text input..." />
              <textarea className="ls-input" placeholder="Textarea..." rows={4} />
            </div>
          </section>
        )}

        {/* Animations Section */}
        {activeTab === 'animations' && (
          <section className="space-y-12">
            <h2 className="ls-h2">Animations</h2>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                { name: 'Fade In', class: 'ls-animate-fade' },
                { name: 'Fade In Up', class: 'ls-animate-fade-in-up' },
                { name: 'Slide In Right', class: 'ls-animate-slide-in-right' },
                { name: 'Scale In', class: 'ls-animate-scale-in' },
                { name: 'Pulse', class: 'ls-animate-pulse' },
                { name: 'Glow', class: 'ls-animate-glow' },
                { name: 'Float', class: 'ls-animate-float' },
                { name: 'Spin', class: 'ls-animate-spin' },
              ].map(({ name, class: animClass }) => (
                <div key={name} className="space-y-3">
                  <p className="ls-caption">{name}</p>
                  <div
                    className={`ls-card p-12 flex items-center justify-center ${animClass}`}
                    style={{ minHeight: '200px' }}
                  >
                    <div className="w-12 h-12 bg-ls-purple-primary rounded-lg" />
                  </div>
                </div>
              ))}
            </div>

            {/* Hover Effects */}
            <div className="space-y-4">
              <h3 className="ls-h3">Hover Effects</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="ls-card ls-hover-lift">
                  <p className="ls-body">Hover Lift</p>
                </div>
                <div className="ls-card ls-hover-glow">
                  <p className="ls-body">Hover Glow</p>
                </div>
                <div className="ls-card ls-hover-scale">
                  <p className="ls-body">Hover Scale</p>
                </div>
              </div>
            </div>

            {/* Stagger Animation */}
            <div className="space-y-4">
              <h3 className="ls-h3">Stagger Animation</h3>
              <div className="ls-animate-stagger flex flex-wrap gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="ls-badge ls-badge--success">
                    Item {i}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-ls-border-primary">
        <p className="ls-body text-ls-text-tertiary">
          See <code className="ls-code">LOCALSTACK_DESIGN_GUIDE.md</code> for comprehensive
          documentation.
        </p>
      </div>
    </div>
  )
}
