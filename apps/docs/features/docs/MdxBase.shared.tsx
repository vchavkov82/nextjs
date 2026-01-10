import { ArrowDown, Check, X } from 'lucide-react'
import Link from 'next/link'
import { Badge, Button, Image } from 'ui'
import { Admonition, type AdmonitionProps } from 'ui-patterns/admonition'
import { GlassPanel } from 'ui-patterns/GlassPanel'
import { IconPanel } from 'ui-patterns/IconPanel'
import SqlToRest from 'ui-patterns/SqlToRest'
import { Heading } from 'ui/src/components/CustomHTMLElements'
import { CodeBlock } from '~/features/ui/CodeBlock/CodeBlock'
import { NamedCodeBlock } from '~/features/directives/CodeTabs.components'
import { Accordion, AccordionItem } from '~/features/ui/Accordion.server'
import InfoTooltip from '~/features/ui/InfoTooltip.server'
import { TabPanel, Tabs } from '~/features/ui/Tabs.server'
// Client components removed from components map - they cause serialization errors
// import { ShowUntil } from '~/features/ui/ShowUntil.server'
// import { ErrorCodes } from '../ui/ErrorCodes.server'
// import { McpConfigPanel } from '../ui/McpConfigPanel.server'
import StepHikeCompactBase, { Step, Details, Code } from '~/components/StepHikeCompact'
// StepHikeCompact and its sub-components are statically imported
// We transform <StepHikeCompact.Step> to <StepHikeCompactStep> in preprocessing,
// so we provide flat component names: StepHikeCompactStep, StepHikeCompactDetails, StepHikeCompactCode

// NavData must be statically imported to avoid serialization issues with render props
// Functions cannot be passed from Server Components to Client Components
import { NavData } from '~/components/NavData'
import { ProjectConfigVariables } from '~/components/ProjectConfigVariables/ProjectConfigVariables.server'

// Static imports for Server Components
// Dynamic imports from next/dynamic create Module objects that cannot be serialized
// when passed to compileMDX from next-mdx-remote/rsc
// Since we're in a Server Component context, we can use static imports
import { AiPromptsIndex } from '~/app/guides/getting-started/ai-prompts/[slug]/AiPromptsIndex'
// Client components removed - they cause serialization errors in compileMDX
// import { AppleSecretGenerator } from '~/components/AppleSecretGenerator/index.server'
import AuthProviders from '~/components/AuthProviders'
import ButtonCard from '~/components/ButtonCard'
// import { Extensions } from '~/components/Extensions/index.server'
// import { JwtGenerator, JwtGeneratorSimple } from '~/components/JwtGenerator/index.server'
import { MetricsStackCards } from '~/components/MetricsStackCards'
// import { Price } from '~/components/Price.server'
// import { RealtimeLimitsEstimator } from '~/components/RealtimeLimitsEstimator/index.server'
import { RegionsList, SmartRegionsList } from '~/components/RegionsList'
import { SharedData } from '~/components/SharedData'
import { CodeSampleDummy, CodeSampleWrapper } from '~/features/directives/CodeSample.client'

// Wrap Admonition for Docs-specific styling (within MDX prose, requires a margin-bottom)
const AdmonitionWithMargin = (props: AdmonitionProps) => {
  return <Admonition {...props} className="mb-8" />
}

const components = {
  Accordion,
  AccordionItem,
  Admonition: AdmonitionWithMargin,
  AiPromptsIndex,
  // AppleSecretGenerator,
  AuthProviders,
  Badge,
  Button,
  ButtonCard,
  CodeSampleDummy,
  CodeSampleWrapper,
  // ErrorCodes,
  // Extensions,
  GlassPanel,
  IconArrowDown: ArrowDown,
  IconCheck: Check,
  IconPanel,
  IconX: X,
  Image: (props: any) => <Image fill alt="" className="object-contain" {...props} />,
  // isFeatureEnabled is handled in preprocessing, not provided as a component
  // JwtGenerator,
  // JwtGeneratorSimple,
  Link,
  // McpConfigPanel,
  MetricsStackCards,
  NamedCodeBlock,
  NavData,
  ProjectConfigVariables,
  // RealtimeLimitsEstimator,
  RegionsList,
  SmartRegionsList,
  SharedData,
  // ShowUntil,
  SqlToRest,
  // StepHikeCompact and its sub-components are provided as flat component names
  // We transform <StepHikeCompact.Step> to <StepHikeCompactStep> in preprocessing (see MdxBase.tsx)
  // so we provide these flat names here
  StepHikeCompact: StepHikeCompactBase,
  StepHikeCompactStep: Step,
  StepHikeCompactDetails: Details,
  StepHikeCompactCode: Code,
  InfoTooltip,
  Tabs,
  TabPanel,
  h2: (props: any) => (
    <Heading tag="h2" {...props}>
      {props.children}
    </Heading>
  ),
  h3: (props: any) => (
    <Heading tag="h3" {...props}>
      {props.children}
    </Heading>
  ),
  h4: (props: any) => (
    <Heading tag="h4" {...props}>
      {props.children}
    </Heading>
  ),
  pre: CodeBlock,
  // Price,
}

export { components }
