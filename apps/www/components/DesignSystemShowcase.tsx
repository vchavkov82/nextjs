/**
 * Modern Design System Showcase
 * Demonstrates: Buttons, Cards, Typography, Colors, and Animations
 */

'use client'

import { useState } from 'react'

export function DesignSystemShowcase() {
  const [activeTab, setActiveTab] = useState<'buttons' | 'cards' | 'typography' | 'colors'>(
    'buttons'
  )

  return (
    <div style={{ backgroundColor: 'var(--ds-bg)', color: 'var(--ds-text)', minHeight: '100vh', padding: '60px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '60px' }}>
          <h1 className="h1" style={{ marginBottom: '16px', fontSize: '48px', fontWeight: 700 }}>
            Modern Design System
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--ds-text-secondary)', marginBottom: '40px' }}>
            Clean, professional components inspired by Supabase & LocalStack
          </p>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '40px', flexWrap: 'wrap' }}>
            {(['buttons', 'cards', 'typography', 'colors'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'buttons' && (
          <section style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '32px' }}>Button Styles</h2>

            {/* Primary Buttons */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--ds-text-secondary)' }}>
                Primary (Blue Gradient)
              </h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary">Default</button>
                <button className="btn btn-primary btn-lg">Large</button>
                <button className="btn btn-primary btn-sm">Small</button>
                <button className="btn btn-primary" disabled>
                  Disabled
                </button>
              </div>
            </div>

            {/* Success Buttons */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--ds-text-secondary)' }}>
                Success (Green Gradient) ✓
              </h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn btn-success">Success Action</button>
                <button className="btn btn-success btn-lg">Create Item</button>
                <button className="btn btn-success btn-sm">Confirm</button>
              </div>
            </div>

            {/* Secondary Buttons */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--ds-text-secondary)' }}>
                Secondary (Outlined)
              </h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn btn-secondary">Secondary</button>
                <button className="btn btn-secondary btn-lg">Learn More</button>
                <button className="btn btn-secondary btn-sm">Cancel</button>
              </div>
            </div>

            {/* Danger Buttons */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--ds-text-secondary)' }}>
                Danger (Red Gradient)
              </h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn btn-danger">Delete</button>
                <button className="btn btn-danger btn-lg">Remove Item</button>
                <button className="btn btn-danger btn-sm">Cancel</button>
              </div>
            </div>

            {/* Ghost & Link Buttons */}
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--ds-text-secondary)' }}>
                Ghost & Link
              </h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn btn-ghost">Ghost Button</button>
                <button className="btn btn-link">Link Button →</button>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'cards' && (
          <section style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '32px' }}>Card Styles</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {/* Default Card */}
              <div className="card">
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>Default Card</h3>
                <p style={{ color: 'var(--ds-text-secondary)', marginBottom: '16px' }}>
                  Standard card with subtle shadow and border. Perfect for content.
                </p>
                <button className="btn btn-primary btn-sm">Learn More</button>
              </div>

              {/* Elevated Card */}
              <div className="card card-elevated">
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>Elevated Card</h3>
                <p style={{ color: 'var(--ds-text-secondary)', marginBottom: '16px' }}>
                  Elevated card with stronger shadow. Good for featured content.
                </p>
                <button className="btn btn-success btn-sm">Featured</button>
              </div>

              {/* Hoverable Card */}
              <div className="card hover-lift" style={{ cursor: 'pointer' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>Interactive Card</h3>
                <p style={{ color: 'var(--ds-text-secondary)', marginBottom: '16px' }}>
                  Hover over this card to see the lift effect in action.
                </p>
                <button className="btn btn-ghost btn-sm">Click Me</button>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'typography' && (
          <section style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '32px' }}>Typography Scale</h2>

            <div style={{ display: 'grid', gap: '24px' }}>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--ds-text-muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
                  Heading 1
                </p>
                <h1 style={{ fontSize: '48px', fontWeight: 700 }}>The quick brown fox jumps over the lazy dog</h1>
              </div>

              <div>
                <p style={{ fontSize: '12px', color: 'var(--ds-text-muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
                  Heading 2
                </p>
                <h2 style={{ fontSize: '36px', fontWeight: 700 }}>The quick brown fox jumps over the lazy dog</h2>
              </div>

              <div>
                <p style={{ fontSize: '12px', color: 'var(--ds-text-muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
                  Heading 3
                </p>
                <h3 style={{ fontSize: '30px', fontWeight: 600 }}>The quick brown fox jumps over the lazy dog</h3>
              </div>

              <div>
                <p style={{ fontSize: '12px', color: 'var(--ds-text-muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
                  Body Large
                </p>
                <p style={{ fontSize: '18px', color: 'var(--ds-text-secondary)', lineHeight: 1.75 }}>
                  The quick brown fox jumps over the lazy dog. This is the large body size for important content.
                </p>
              </div>

              <div>
                <p style={{ fontSize: '12px', color: 'var(--ds-text-muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
                  Body (Default)
                </p>
                <p style={{ fontSize: '16px', color: 'var(--ds-text-secondary)', lineHeight: 1.75 }}>
                  The quick brown fox jumps over the lazy dog. This is the standard body size.
                </p>
              </div>

              <div>
                <p style={{ fontSize: '12px', color: 'var(--ds-text-muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
                  Small
                </p>
                <p style={{ fontSize: '14px', color: 'var(--ds-text-secondary)' }}>
                  The quick brown fox jumps over the lazy dog.
                </p>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'colors' && (
          <section style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '32px' }}>Color Palette</h2>

            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--ds-text-secondary)' }}>
                Primary Colors
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                {[
                  { name: 'Primary', color: '#3b82f6' },
                  { name: 'Secondary', color: '#8b5cf6' },
                  { name: 'Accent', color: '#06b6d4' },
                  { name: 'Success', color: '#10b981' },
                ].map(({ name, color }) => (
                  <div key={name}>
                    <div
                      style={{
                        width: '100%',
                        height: '100px',
                        backgroundColor: color,
                        borderRadius: '8px',
                        marginBottom: '8px',
                      }}
                    />
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ds-text)' }}>{name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--ds-text-muted)', fontFamily: 'monospace' }}>
                      {color}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--ds-text-secondary)' }}>
                Semantic Colors
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                {[
                  { name: 'Danger', color: '#ef4444' },
                  { name: 'Warning', color: '#f59e0b' },
                  { name: 'Info', color: '#06b6d4' },
                  { name: 'Muted', color: '#9ca3af' },
                ].map(({ name, color }) => (
                  <div key={name}>
                    <div
                      style={{
                        width: '100%',
                        height: '100px',
                        backgroundColor: color,
                        borderRadius: '8px',
                        marginBottom: '8px',
                      }}
                    />
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ds-text)' }}>{name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--ds-text-muted)', fontFamily: 'monospace' }}>
                      {color}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Badges Section */}
        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>Badges</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <span className="badge">Default</span>
            <span className="badge badge-primary">Primary</span>
            <span className="badge badge-success">Success</span>
            <span className="badge badge-warning">Warning</span>
            <span className="badge badge-danger">Danger</span>
          </div>
        </section>
      </div>
    </div>
  )
}
