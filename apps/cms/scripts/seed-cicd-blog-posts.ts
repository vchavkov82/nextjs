import path from 'path'
import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'

// Load environment variables from .env files BEFORE importing anything else
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.join(__dirname, '..')

const envFiles = [`${projectRoot}/.env.local`, `${projectRoot}/.env`]
for (const envFile of envFiles) {
  try {
    const content = readFileSync(envFile, 'utf-8')
    content.split('\n').forEach((line) => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        const value = valueParts.join('=')
        if (key && value) {
          process.env[key] = value
        }
      }
    })
  } catch {
    // File doesn't exist, skip
  }
}

// Wrap the rest in an async IIFE to allow dynamic imports
;(async () => {
  // Now dynamically import the rest of the code
  const { getPayload } = await import('payload')
  const { default: config } = await import('../src/payload.config')

  /**
   * Helper function to create Lexical content structure
   */
  function createLexicalContent(paragraphs: string[], headings?: Array<{ level: 1 | 2 | 3 | 4; text: string }>) {
    const children: Array<{
      type: string
      [key: string]: any
    }> = []

    if (headings) {
      headings.forEach((heading) => {
        children.push({
          type: 'heading' as const,
          tag: `h${heading.level}`,
          children: [
            {
              text: heading.text,
              type: 'text',
            },
          ],
        } as any)
      })
    }

    paragraphs.forEach((text) => {
      children.push({
        type: 'paragraph' as const,
        children: [
          {
            text: text,
            type: 'text',
          },
        ],
      } as any)
    })

    return {
      root: {
        type: 'root' as const,
        children: children as any,
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1,
      },
    } as any
  }

  /**
   * Get or create a category
   */
  async function getOrCreateCategory(payload: any, name: string) {
    const existing = await payload.find({
      collection: 'categories',
      where: {
        name: {
          equals: name,
        },
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      return existing.docs[0].id
    }

    const category = await payload.create({
      collection: 'categories',
      data: {
        name,
      },
    })

    return category.id
  }

  /**
   * Get or create a tag
   */
  async function getOrCreateTag(payload: any, name: string) {
    const existing = await payload.find({
      collection: 'tags',
      where: {
        name: {
          equals: name,
        },
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      return existing.docs[0].id
    }

    const tag = await payload.create({
      collection: 'tags',
      data: {
        name,
      },
    })

    return tag.id
  }

  /**
   * Get or create a default author
   */
  async function getOrCreateDefaultAuthor(payload: any) {
    const authors = await payload.find({
      collection: 'authors',
      limit: 1,
    })

    if (authors.docs.length > 0) {
      return authors.docs[0].id
    }

    // Create a default author
    const author = await payload.create({
      collection: 'authors',
      data: {
        author: 'BA Team',
        author_id: 'ba-team',
        position: 'Technical Writer',
        company: 'BA',
      },
    })

    return author.id
  }

  async function seedBlogPosts() {
    try {
      const payload = await getPayload({ config })

      console.log('🌱 Starting to seed CI/CD Runners blog posts...')

      // Get or create category
      const categoryId = await getOrCreateCategory(payload, 'Product')
      console.log('✅ Category ready')

      // Get or create tags
      const cicdTagId = await getOrCreateTag(payload, 'CI/CD')
      const runnersTagId = await getOrCreateTag(payload, 'Runners')
      const githubTagId = await getOrCreateTag(payload, 'GitHub Actions')
      const gitlabTagId = await getOrCreateTag(payload, 'GitLab')
      const devopsTagId = await getOrCreateTag(payload, 'DevOps')
      console.log('✅ Tags ready')

      // Get or create default author
      const authorId = await getOrCreateDefaultAuthor(payload)
      console.log('✅ Author ready')

      const today = new Date()
      const posts = [
        {
          title: 'Getting Started with CI/CD Runners: A Complete Guide',
          slug: 'getting-started-with-cicd-runners',
          description:
            'Learn how to set up and configure self-hosted CI/CD runners to improve your build performance and reduce costs.',
          content: createLexicalContent(
            [
              'CI/CD runners are powerful tools that allow you to execute automated workflows on your own infrastructure. Whether you are running GitHub Actions, GitLab CI, or other CI/CD platforms, self-hosted runners give you full control over your build environment.',
              'Self-hosted runners enable faster builds, better resource utilization, and the ability to run builds on your own servers. This guide will walk you through everything you need to know to get started with CI/CD runners.',
              'From installation and configuration to monitoring and maintenance, we cover all the essential aspects of running your own CI/CD infrastructure.',
            ],
            [
              { level: 1, text: 'Why Use Self-Hosted Runners?' },
              { level: 2, text: 'Performance Benefits' },
              { level: 2, text: 'Cost Optimization' },
            ]
          ),
          authors: [authorId],
          category: categoryId,
          tags: [cicdTagId, runnersTagId, devopsTagId],
          publishedDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          title: 'GitHub Actions Runners: Scaling Your Workflows',
          slug: 'github-actions-runners-scaling',
          description:
            'Discover how to scale your GitHub Actions workflows using self-hosted runners for better performance and control.',
          content: createLexicalContent(
            [
              'GitHub Actions is a powerful CI/CD platform built directly into GitHub. While GitHub-hosted runners are convenient, self-hosted runners provide superior performance and customization options.',
              'By setting up self-hosted runners, you can run your entire CI/CD pipeline on your own infrastructure, giving you complete control over the environment and resources.',
              'Learn how to set up, configure, and manage GitHub Actions runners to optimize your development workflow.',
            ],
            [
              { level: 1, text: 'GitHub Actions Runner Architecture' },
              { level: 2, text: 'Installation and Setup' },
              { level: 2, text: 'Configuration Options' },
            ]
          ),
          authors: [authorId],
          category: categoryId,
          tags: [githubTagId, runnersTagId, cicdTagId],
          publishedDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          title: 'GitLab CI Runners: Building Better Pipelines',
          slug: 'gitlab-ci-runners-pipelines',
          description:
            'Master GitLab CI runners and learn how to build robust and efficient CI/CD pipelines with self-hosted runners.',
          content: createLexicalContent(
            [
              'GitLab CI is an integrated CI/CD solution that comes with GitLab. GitLab Runners are the agents that run your CI/CD jobs.',
              'Self-hosted GitLab Runners give you the flexibility to customize your build environment and run jobs on your own hardware.',
              'This comprehensive guide covers everything you need to know about setting up and managing GitLab Runners.',
            ],
            [
              { level: 1, text: 'Understanding GitLab Runners' },
              { level: 2, text: 'Runner Types and Tags' },
              { level: 2, text: 'Configuration and Maintenance' },
            ]
          ),
          authors: [authorId],
          category: categoryId,
          tags: [gitlabTagId, runnersTagId, cicdTagId],
          publishedDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          title: 'DevOps Best Practices with CI/CD Runners',
          slug: 'devops-best-practices-runners',
          description:
            'Implement DevOps best practices when using CI/CD runners to ensure security, reliability, and scalability.',
          content: createLexicalContent(
            [
              'Building a robust CI/CD infrastructure requires following DevOps best practices. Security, monitoring, and automation are critical components.',
              'When deploying self-hosted CI/CD runners, you need to consider security implications, resource management, and operational monitoring.',
              'Learn industry-proven practices for managing CI/CD runners in production environments.',
            ],
            [
              { level: 1, text: 'Security Considerations' },
              { level: 2, text: 'Access Control and Permissions' },
              { level: 2, text: 'Monitoring and Logging' },
            ]
          ),
          authors: [authorId],
          category: categoryId,
          tags: [devopsTagId, cicdTagId, runnersTagId],
          publishedDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      // Create or update posts
      for (const post of posts) {
        try {
          const existing = await payload.find({
            collection: 'posts',
            where: {
              slug: {
                equals: post.slug,
              },
            },
            limit: 1,
          })

          if (existing.docs.length > 0) {
            console.log(`📝 Post "${post.title}" already exists`)
          } else {
            await payload.create({
              collection: 'posts',
              data: post as any,
            })
            console.log(`✅ Created post: "${post.title}"`)
          }
        } catch (error) {
          console.error(`❌ Error with post "${post.title}":`, error)
        }
      }

      console.log('✅ All CI/CD Runners blog posts have been seeded!')
      process.exit(0)
    } catch (error) {
      console.error('❌ Error seeding blog posts:', error)
      process.exit(1)
    }
  }

  seedBlogPosts()
})()
