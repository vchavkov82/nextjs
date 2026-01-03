import { ArrowDown, Check, X } from 'lucide-react'
import Link from 'next/link'
import { Badge, Button, Image } from 'ui'
import { Admonition, type AdmonitionProps } from 'ui-patterns/admonition'
import { GlassPanel } from 'ui-patterns/GlassPanel'
import { IconPanel } from 'ui-patterns/IconPanel'
import SqlToRest from 'ui-patterns/SqlToRest'
import { Heading } from 'ui/src/components/CustomHTMLElements'
import dynamic from 'next/dynamic'
import { CodeBlock } from '~/features/ui/CodeBlock/CodeBlock'
import { NamedCodeBlock } from '~/features/directives/CodeTabs.components'
import { Accordion, AccordionItem } from '~/features/ui/Accordion'
import InfoTooltip from '~/features/ui/InfoTooltip'
import { ShowUntil } from '~/features/ui/ShowUntil'
import { TabPanel, Tabs } from '~/features/ui/Tabs'
import { ErrorCodes } from '../ui/ErrorCodes'
import { McpConfigPanel } from '../ui/McpConfigPanel'
import StepHikeCompact from '~/components/StepHikeCompact'

// Dynamic imports for heavy components
const AiPromptsIndex = dynamic(() => import('~/app/guides/getting-started/ai-prompts/[slug]/AiPromptsIndex'), {
  loading: () => <div>Loading...</div>
})
const AppleSecretGenerator = dynamic(() => import('~/components/AppleSecretGenerator'), {
  loading: () => <div>Loading...</div>
})
const AuthProviders = dynamic(() => import('~/components/AuthProviders'), {
  loading: () => <div>Loading...</div>
})
const AuthSmsProviderConfig = dynamic(() => import('~/components/AuthSmsProviderConfig'), {
  loading: () => <div>Loading...</div>
})
const CostWarning = dynamic(() => import('~/components/AuthSmsProviderConfig/AuthSmsProviderConfig.Warnings'), {
  loading: () => <div>Loading...</div>
})
const ButtonCard = dynamic(() => import('~/components/ButtonCard'), {
  loading: () => <div>Loading...</div>
})
const Extensions = dynamic(() => import('~/components/Extensions'), {
  loading: () => <div>Loading...</div>
})
const JwtGenerator = dynamic(() => import('~/components/JwtGenerator').then(mod => ({ default: mod.JwtGenerator })), {
  loading: () => <div>Loading...</div>
})
const JwtGeneratorSimple = dynamic(() => import('~/components/JwtGenerator').then(mod => ({ default: mod.JwtGeneratorSimple })), {
  loading: () => <div>Loading...</div>
})
const MetricsStackCards = dynamic(() => import('~/components/MetricsStackCards'), {
  loading: () => <div>Loading...</div>
})
const NavData = dynamic(() => import('~/components/NavData'), {
  loading: () => <div>Loading...</div>
})
const Price = dynamic(() => import('~/components/Price'), {
  loading: () => <div>Loading...</div>
})
const ProjectConfigVariables = dynamic(() => import('~/components/ProjectConfigVariables'), {
  loading: () => <div>Loading...</div>
})
const RealtimeLimitsEstimator = dynamic(() => import('~/components/RealtimeLimitsEstimator'), {
  loading: () => <div>Loading...</div>
})
const RegionsList = dynamic(() => import('~/components/RegionsList').then(mod => ({ default: mod.RegionsList })), {
  loading: () => <div>Loading...</div>
})
const SmartRegionsList = dynamic(() => import('~/components/RegionsList').then(mod => ({ default: mod.SmartRegionsList })), {
  loading: () => <div>Loading...</div>
})
const SharedData = dynamic(() => import('~/components/SharedData'), {
  loading: () => <div>Loading...</div>
})
const CodeSampleDummy = dynamic(() => import('~/features/directives/CodeSample.client').then(mod => ({ default: mod.CodeSampleDummy })), {
  loading: () => <div>Loading...</div>
})
const CodeSampleWrapper = dynamic(() => import('~/features/directives/CodeSample.client').then(mod => ({ default: mod.CodeSampleWrapper })), {
  loading: () => <div>Loading...</div>
})

// Wrap Admonition for Docs-specific styling (within MDX prose, requires a margin-bottom)
const AdmonitionWithMargin = (props: AdmonitionProps) => {
  return <Admonition {...props} className="mb-8" />
}

const components = {
  Accordion,
  AccordionItem,
  Admonition: AdmonitionWithMargin,
  AiPromptsIndex,
  AuthSmsProviderConfig,
  AppleSecretGenerator,
  AuthProviders,
  Badge,
  Button,
  ButtonCard,
  CodeSampleDummy,
  CodeSampleWrapper,
  CostWarning,
  ErrorCodes,
  Extensions,
  GlassPanel,
  IconArrowDown: ArrowDown,
  IconCheck: Check,
  IconPanel,
  IconX: X,
  Image: (props: any) => <Image fill alt="" className="object-contain" {...props} />,
  JwtGenerator,
  JwtGeneratorSimple,
  Link,
  McpConfigPanel,
  MetricsStackCards,
  NamedCodeBlock,
  NavData,
  ProjectConfigVariables,
  RealtimeLimitsEstimator,
  RegionsList,
  SmartRegionsList,
  SharedData,
  ShowUntil,
  SqlToRest,
  StepHikeCompact,
  Tabs,
  TabPanel,
  InfoTooltip,
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
  Price,
}

export { components }
