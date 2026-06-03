import { StudyApp } from './study-app'
import { getSiteUrl, siteDescription, siteName, siteTopics } from '@/lib/site-config'

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['WebApplication', 'LearningResource'],
    name: siteName,
    description: siteDescription,
    url: getSiteUrl(),
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Any',
    isAccessibleForFree: true,
    educationalUse: 'Practice',
    learningResourceType: 'Study guide',
    about: siteTopics.map((topic) => ({ '@type': 'Thing', name: topic })),
    author: {
      '@type': 'Person',
      name: 'Adam Owada',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <StudyApp />
    </>
  )
}
