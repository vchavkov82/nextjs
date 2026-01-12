import { getPayload } from 'payload'
import config from '../src/payload.config'

/**
 * Helper function to create Lexical content structure
 */
function createLexicalContent(paragraphs: string[], headings?: Array<{ level: 1 | 2 | 3 | 4; text: string }>) {
  const children: any[] = []

  if (headings) {
    headings.forEach((heading) => {
      children.push({
        type: 'heading',
        tag: `h${heading.level}`,
        children: [
          {
            text: heading.text,
            type: 'text',
          },
        ],
      })
    })
  }

  paragraphs.forEach((text) => {
    children.push({
      type: 'paragraph',
      children: [
        {
          text: text,
          type: 'text',
        },
      ],
    })
  })

  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

/**
 * Get or create a category
 */
async function getOrCreateCategory(payload: any, name: string, slug: string) {
  const existing = await payload.find({
    collection: 'categories',
    where: {
      slug: {
        equals: slug,
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
      slug,
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
 * Get the first available author
 */
async function getFirstAuthor(payload: any) {
  const authors = await payload.find({
    collection: 'authors',
    limit: 1,
  })

  if (authors.docs.length === 0) {
    throw new Error('No authors found. Please create at least one author in the CMS.')
  }

  return authors.docs[0].id
}

async function seedBlogPosts() {
  try {
    const payload = await getPayload({ config })

    console.log('🌱 Starting to seed CI/CD Runners blog posts...')

    // Get or create category
    const categoryId = await getOrCreateCategory(payload, 'Product', 'product')
    console.log('✅ Category ready')

    // Get or create tags
    const cicdTagId = await getOrCreateTag(payload, 'CI/CD')
    const runnersTagId = await getOrCreateTag(payload, 'Runners')
    const githubTagId = await getOrCreateTag(payload, 'GitHub Actions')
    const gitlabTagId = await getOrCreateTag(payload, 'GitLab')
    const devopsTagId = await getOrCreateTag(payload, 'DevOps')
    console.log('✅ Tags ready')

    // Get first author
    const authorId = await getFirstAuthor(payload)
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
            'CI/CD Runners have revolutionized how teams approach continuous integration and deployment. By running your CI/CD workflows on self-hosted infrastructure, you gain better performance, significant cost savings, and complete control over your build environment.',
            'In this comprehensive guide, we\'ll walk you through everything you need to know about CI/CD Runners, from initial setup to advanced configuration.',
            'Self-hosted runners offer several key advantages over hosted solutions. First and foremost, they provide substantial cost savings—often reducing CI/CD expenses by 50% or more compared to hosted runners. This is especially valuable for teams with high build volumes or long-running test suites.',
            'Performance is another major benefit. With CI/CD Runners, you can customize your compute resources to match your specific workload requirements. Whether you need high-memory instances for large builds, GPU acceleration for machine learning workloads, or fast CPUs for compilation tasks, you have full control.',
            'Security and compliance are also critical considerations. Self-hosted runners allow you to keep sensitive code and build artifacts on your own infrastructure, ensuring they never leave your network. This is essential for organizations with strict compliance requirements or those working with proprietary code.',
          ],
          [
            { level: 2, text: 'Why Choose Self-Hosted Runners?' },
            { level: 2, text: 'Getting Started' },
          ]
        ),
        date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
      {
        title: 'Optimizing GitHub Actions with Self-Hosted Runners',
        slug: 'optimizing-github-actions-self-hosted-runners',
        description:
          'Discover how to reduce GitHub Actions costs by up to 50% while improving build times with self-hosted runners.',
        content: createLexicalContent(
          [
            'GitHub Actions is one of the most popular CI/CD platforms, but the costs can quickly add up for teams with high build volumes. Self-hosted runners offer a compelling alternative that can reduce costs by up to 50% while providing faster builds.',
            'With CI/CD Runners, you can run unlimited concurrent jobs without the per-minute billing that comes with GitHub-hosted runners. This makes it ideal for teams that run extensive test suites, build multiple applications, or have high-frequency deployments.',
            'Setting up self-hosted runners for GitHub Actions is straightforward. You simply register your runner with your GitHub repository or organization, and GitHub will automatically route jobs to your runners when they\'re available.',
            'One of the key advantages of using CI/CD Runners with GitHub Actions is the ability to use job labels to route specific workflows to specific runner types. For example, you can configure Linux runners for most builds, Windows runners for cross-platform testing, and GPU runners for machine learning workloads.',
            'Caching is another area where self-hosted runners excel. CI/CD Runners support distributed caching that can dramatically speed up builds by reusing dependencies and build artifacts across runs. This is especially valuable for projects with large dependency trees or long compilation times.',
            'Monitoring and observability are built into CI/CD Runners, giving you insights into runner utilization, job performance, and cost optimization opportunities. You can track which workflows are using the most resources and optimize accordingly.',
          ],
          [
            { level: 2, text: 'Cost Savings' },
            { level: 2, text: 'Performance Benefits' },
            { level: 2, text: 'Configuration and Setup' },
          ]
        ),
        date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        title: 'Advanced CI/CD Runner Configurations: Pools, Caching, and More',
        slug: 'advanced-cicd-runner-configurations',
        description:
          'Explore advanced features like warm pools, distributed caching, and custom images to maximize your CI/CD efficiency.',
        content: createLexicalContent(
          [
            'Once you\'ve mastered the basics of CI/CD Runners, it\'s time to explore advanced configurations that can further optimize your build pipeline. From warm pools that eliminate cold starts to distributed caching that speeds up builds, there are many features to leverage.',
            'Warm pools keep a set of runners ready and waiting for jobs, eliminating the startup delay that comes with spinning up new instances. This is especially valuable for teams with predictable build schedules or high-frequency deployments. With warm pools, jobs can start executing immediately without waiting for instance provisioning.',
            'Distributed caching is another game-changer. By caching build artifacts, dependencies, and intermediate files, you can dramatically reduce build times. CI/CD Runners support remote caching for popular build tools like Bazel, Go, Gradle, Turborepo, sccache, and Pants. This means that if a dependency or build artifact hasn\'t changed, it can be retrieved from cache instead of being rebuilt.',
            'Custom images allow you to pre-install dependencies, configure your build environment exactly as needed, and ensure consistency across all your builds. This reduces setup time and eliminates "works on my machine" issues. You can create images with your specific toolchain, compilers, and dependencies pre-installed, ensuring every build starts from the same known-good state.',
            'Resource tagging is another powerful feature that helps with cost allocation and management. You can tag runners with project names, team identifiers, or cost centers, making it easy to track spending and optimize resource allocation.',
            'Spot instances can provide additional cost savings for non-critical workloads. CI/CD Runners support spot instances that can reduce costs by up to 90% compared to on-demand pricing, with automatic fallback to on-demand instances if spot capacity isn\'t available.',
          ],
          [
            { level: 2, text: 'Warm Pools' },
            { level: 2, text: 'Distributed Caching' },
            { level: 2, text: 'Custom Images' },
            { level: 2, text: 'Cost Optimization' },
          ]
        ),
        date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        title: 'CI/CD Runners for GitLab: Complete Setup Guide',
        slug: 'cicd-runners-gitlab-setup-guide',
        description:
          'Learn how to configure CI/CD Runners with GitLab CI/CD for scalable, cost-effective pipeline execution.',
        content: createLexicalContent(
          [
            'GitLab CI/CD is a powerful platform for continuous integration and deployment, and CI/CD Runners provide excellent support for GitLab workflows. Whether you\'re using GitLab.com or a self-hosted GitLab instance, you can leverage CI/CD Runners to improve performance and reduce costs.',
            'Setting up CI/CD Runners with GitLab involves registering GitLab Runner on your infrastructure and configuring it to work with your GitLab instance. CI/CD Runners support multiple executors including Docker, Kubernetes, and shell executors, giving you flexibility in how you run your jobs.',
            'One of the key advantages of using CI/CD Runners with GitLab is the ability to scale runners based on your workload. You can configure auto-scaling to spin up additional runners during peak times and scale down during quiet periods, optimizing both performance and cost.',
            'Security is also a major consideration. CI/CD Runners allow you to keep sensitive builds on your own infrastructure, ensuring that proprietary code and build artifacts never leave your network. This is especially important for organizations with strict compliance requirements.',
            'GitLab Runner registration is straightforward. You\'ll need a registration token from your GitLab instance, which you can obtain from the project or group settings. Once registered, your runners will appear in the GitLab UI and can be assigned to specific projects or made available to all projects in a group.',
            'Tag-based job routing allows you to control which runners execute which jobs. You can tag runners with specific capabilities (like "docker", "kubernetes", or "gpu") and then specify those tags in your GitLab CI/CD pipeline configuration. This ensures jobs run on runners with the appropriate resources and configurations.',
            'Monitoring GitLab runners is essential for maintaining a healthy CI/CD pipeline. CI/CD Runners provide detailed metrics on runner utilization, job execution times, and error rates. You can use these metrics to identify bottlenecks, optimize configurations, and ensure your runners are being used efficiently.',
          ],
          [
            { level: 2, text: 'Getting Started' },
            { level: 2, text: 'Runner Registration' },
            { level: 2, text: 'Scaling and Performance' },
            { level: 2, text: 'Security Considerations' },
            { level: 2, text: 'Best Practices' },
          ]
        ),
        date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    ]

    for (const postData of posts) {
      // Check if post already exists
      const existing = await payload.find({
        collection: 'posts',
        where: {
          slug: {
            equals: postData.slug,
          },
        },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        console.log(`⏭️  Post "${postData.title}" already exists, skipping...`)
        continue
      }

      // Determine tags based on post content
      let postTags = [cicdTagId, runnersTagId]
      if (postData.slug.includes('github')) {
        postTags.push(githubTagId)
      }
      if (postData.slug.includes('gitlab')) {
        postTags.push(gitlabTagId)
      }
      if (postData.slug.includes('advanced') || postData.slug.includes('optimizing')) {
        postTags.push(devopsTagId)
      }

      // Create the post
      const post = await payload.create({
        collection: 'posts',
        data: {
          ...postData,
          authors: [authorId],
          categories: [categoryId],
          tags: postTags,
          _status: 'published',
        },
      })

      console.log(`✅ Created post: "${postData.title}"`)
    }

    console.log('🎉 Successfully seeded CI/CD Runners blog posts!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Error seeding blog posts:', err)
    process.exit(1)
  }
}

seedBlogPosts()
