'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'ui'
import { ChevronsUpDown } from 'lucide-react'
import CodeBlock from '@/components/CodeBlock/CodeBlock'

const NO_FILTER = 'unset'

interface FilterOption {
  value: string
  label: string
}

interface FilterConfig {
  label: string
  options: FilterOption[]
}

interface Filters {
  [key: string]: FilterConfig
}

interface ChartDataItem {
  label: string
  value: number
  rawValue: number
}

interface FilterColumnConfig {
  label: string
  options: string[]
}

const FILTER_COLUMN_CONFIGS: Record<string, FilterColumnConfig> = {
  team_size: {
    label: 'Team Size',
    options: ['1–10', '11–50', '51–100', '101–250', '250+'],
  },
  money_raised: {
    label: 'Money Raised',
    options: ['USD $0–10M', 'USD $11–50M', 'USD $51–100M', 'USD $100M+'],
  },
  person_age: {
    label: 'Age',
    options: ['18–21', '22–29', '30–39', '40–49', '50–59', '60+'],
  },
  location: {
    label: 'Location',
    options: [
      'Africa',
      'Asia',
      'Europe',
      'Middle East',
      'North America',
      'South America',
      'Remote',
    ],
  },
}

function useFilterOptions(filterColumns: string[]) {
  const filters: Filters = {}

  for (const column of filterColumns) {
    const config = FILTER_COLUMN_CONFIGS[column]

    if (!config) {
      console.warn(`No configuration found for filter column: ${column}`)
      continue
    }

    filters[column] = {
      label: config.label,
      options: config.options.map((option) => ({ value: option, label: option })),
    }
  }

  return { filters }
}

interface SurveyChartProps {
  title: string
  targetColumn: string
  filterColumns: string[]
  generateSQLQuery?: (activeFilters: Record<string, string>) => string
  functionName: string
}

export function SurveyChart({
  title,
  targetColumn,
  filterColumns,
  generateSQLQuery,
  functionName,
}: SurveyChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const { filters } = useFilterOptions(filterColumns)

  const [activeFilters, setActiveFilters] = useState(
    filterColumns.reduce(
      (acc: Record<string, string>, col: string) => ({ ...acc, [col]: NO_FILTER }),
      {}
    )
  )

  const [view, setView] = useState<'chart' | 'sql'>('chart')
  const [isExpanded, setIsExpanded] = useState(false)

  const setFilterValue = (filterKey: string, value: string) => {
    setActiveFilters((prev: Record<string, string>) => ({
      ...prev,
      [filterKey]: value,
    }))
  }

  const FIXED_HEIGHT = 300
  const BUTTON_AREA_HEIGHT = 40
  const CHART_HEIGHT = FIXED_HEIGHT - BUTTON_AREA_HEIGHT

  return (
    <div
      ref={chartRef}
      className="w-full bg-200 border-t border-muted"
      style={{
        background: `radial-gradient(circle at center -150%, hsl(var(--brand-300)), transparent 80%), radial-gradient(ellipse at center 230%, hsl(var(--background-surface-200)), transparent 75%)`,
      }}
    >
      <header className="px-8 py-8">
        <p className="text-foreground/30 text-sm font-mono uppercase tracking-widest">Q&A</p>
        <h3 className="text-foreground text-xl tracking-tight text-balance">{title}</h3>
      </header>

      <div className="px-8 py-12">
        <p className="text-foreground-muted text-center">
          Survey data visualization disabled - Supabase removed
        </p>
      </div>

      <div>
        <div className="flex flex-row flex-wrap gap-6 px-8 pb-4 justify-between">
          {filters && activeFilters && setFilterValue && (
            <div className="flex flex-wrap gap-3">
              {Object.entries(filters).map(([filterKey, filterConfig]) => (
                <SurveyFilter
                  key={filterKey}
                  filterKey={filterKey}
                  filterConfig={filterConfig}
                  selectedValue={activeFilters[filterKey]}
                  setFilterValue={setFilterValue}
                />
              ))}
            </div>
          )}
          <div className="hidden xs:block">
            <div className="flex border border-overlay rounded-md">
              <Button
                type={view === 'chart' ? 'primary' : 'default'}
                size="tiny"
                onClick={() => setView('chart')}
                className="rounded-r-none border-0"
              >
                Chart
              </Button>
              <Button
                type={view === 'sql' ? 'primary' : 'default'}
                size="tiny"
                onClick={() => setView('sql')}
                className="rounded-l-none border-0"
              >
                SQL
              </Button>
            </div>
          </div>
        </div>
        <motion.div
          key={view}
          className="overflow-hidden relative"
          initial={false}
          animate={{
            height: isExpanded ? 'auto' : `${FIXED_HEIGHT}px`,
          }}
          transition={{
            duration: 0.2,
            ease: 'easeInOut',
          }}
        >
          {view === 'chart' ? (
            <div className="flex flex-col h-full w-full justify-between px-8 pt-4 pb-12 min-h-[300px]">
              <div className="flex-1 pt-8 flex flex-col items-center justify-center gap-4">
                <p className="text-foreground-lighter text-balance text-center">
                  Survey data unavailable - Supabase connectivity disabled
                </p>
              </div>
            </div>
          ) : (
            <div className="px-8 pt-4 pb-8">
              {generateSQLQuery ? (
                <CodeBlock lang="sql">{generateSQLQuery(activeFilters)}</CodeBlock>
              ) : (
                <CodeBlock lang="ts">
                  {`// Function call: ${functionName}\n// Supabase has been removed from the system`}
                </CodeBlock>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export function buildWhereClause(
  activeFilters: Record<string, string>,
  initialClauses: string[] = []
) {
  const whereClauses: string[] = [...initialClauses]

  for (const [column, value] of Object.entries(activeFilters)) {
    if (value && value !== NO_FILTER) {
      whereClauses.push(`${column} = '${value}'`)
    }
  }

  return whereClauses.length > 0 ? `WHERE ${whereClauses.join('\n  AND ')}` : ''
}

function SurveyFilter({
  filterKey,
  filterConfig,
  selectedValue,
  setFilterValue,
}: {
  filterKey: string
  filterConfig: {
    label: string
    options: { value: string; label: string }[]
  }
  selectedValue: string
  setFilterValue: (filterKey: string, value: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="default"
          size="tiny"
          iconRight={<ChevronsUpDown className="text-foreground-muted" strokeWidth={2} size={14} />}
        >
          <div className="w-full flex gap-1">
            <p className="text-foreground-lighter">{filterConfig.label}</p>
            {selectedValue !== NO_FILTER && <p className="text-foreground">{selectedValue}</p>}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {filterConfig.options
          .filter((opt) => opt.value !== NO_FILTER)
          .map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setFilterValue(filterKey, option.value)}
              className={selectedValue === option.value ? 'text-brand-600' : ''}
            >
              {option.label}
            </DropdownMenuItem>
          ))}

        {selectedValue !== NO_FILTER && (
          <div className="border-t border-border mt-1 pt-1">
            <DropdownMenuItem
              onClick={() => setFilterValue(filterKey, NO_FILTER)}
              className="text-foreground-lighter"
            >
              Clear
            </DropdownMenuItem>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
