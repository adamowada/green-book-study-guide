import { Heading, Subheading } from '@/components/heading'

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-950 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="mb-3 text-sm/6 font-semibold uppercase text-green-800">Stage 1 scaffold</p>
        <Heading className="text-3xl/9 sm:text-4xl/10">Green Book Memorizer</Heading>
        <p className="mt-4 max-w-2xl text-base/7 text-zinc-600">
          This minimal Next.js App Router scaffold is ready for the Green Book memorization workflow planned for later
          stages.
        </p>

        <section className="mt-10 border-t border-zinc-200 pt-6">
          <Subheading level={2}>Included sections planned</Subheading>
          <ul className="mt-4 grid gap-2 text-sm/6 text-zinc-700 sm:grid-cols-2">
            <li>Army Values</li>
            <li>Soldier&apos;s Creed</li>
            <li>Military Time</li>
            <li>General and Special Orders</li>
            <li>Phonetic Alphabet</li>
            <li>Rank Structure</li>
          </ul>
        </section>
      </div>
    </main>
  )
}
