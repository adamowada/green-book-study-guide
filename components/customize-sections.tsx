'use client'

import * as Headless from '@headlessui/react'
import { ChevronDown, SlidersHorizontal } from 'lucide-react'

import { Checkbox } from '@/components/checkbox'
import { Description, Field, Label } from '@/components/fieldset'
import type { GreenBookSection, GreenBookSectionId } from '@/lib/green-book-content'

type CustomizeSectionsProps = {
  sections: readonly GreenBookSection[]
  selectedSectionIds: readonly GreenBookSectionId[]
  disabled?: boolean
  onToggle: (sectionId: GreenBookSectionId, included: boolean) => void
}

function SectionGroup({
  title,
  sections,
  selectedSectionIds,
  selectedCount,
  disabled,
  onToggle,
}: {
  title: string
  sections: readonly GreenBookSection[]
  selectedSectionIds: ReadonlySet<GreenBookSectionId>
  selectedCount: number
  disabled: boolean
  onToggle: (sectionId: GreenBookSectionId, included: boolean) => void
}) {
  if (sections.length === 0) {
    return null
  }

  return (
    <fieldset>
      <legend className="text-xs/5 font-semibold tracking-wide text-zinc-500 uppercase">{title}</legend>
      <div className="mt-1 divide-y divide-zinc-100">
        {sections.map((section) => {
          const isIncluded = selectedSectionIds.has(section.id)
          const isLastIncludedSection = isIncluded && selectedCount === 1
          const isControlDisabled = disabled || isLastIncludedSection

          return (
            <Field
              key={section.id}
              disabled={isControlDisabled}
              className="grid grid-cols-[1rem_minmax(0,1fr)] items-start gap-x-3 py-2"
            >
              <Checkbox
                color="green"
                checked={isIncluded}
                disabled={isControlDisabled}
                onChange={(included) => {
                  if (!included && selectedCount <= 1) {
                    return
                  }

                  onToggle(section.id, included)
                }}
                className="mt-0.5"
              />
              <Label className="cursor-pointer text-sm/5 font-medium text-zinc-800 data-disabled:cursor-not-allowed">
                {section.title}
              </Label>
              {isLastIncludedSection ? (
                <Description className="sr-only">At least one section is required.</Description>
              ) : null}
            </Field>
          )
        })}
      </div>
    </fieldset>
  )
}

export function CustomizeSections({
  sections,
  selectedSectionIds,
  disabled = false,
  onToggle,
}: CustomizeSectionsProps) {
  const selectedIds = new Set(selectedSectionIds)
  const selectedCount = sections.reduce((count, section) => count + Number(selectedIds.has(section.id)), 0)
  const defaultSections = sections.filter((section) => section.defaultIncluded)
  const additionalSections = sections.filter((section) => !section.defaultIncluded)

  return (
    <Headless.Disclosure as="section" className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <Headless.DisclosureButton
        disabled={disabled}
        className="group flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-green-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-green-800 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-green-800/10 text-green-900">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1 text-sm/6 font-semibold text-zinc-950">Customize</span>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs/5 font-semibold text-zinc-600 tabular-nums">
          {selectedCount}/{sections.length}
        </span>
        <ChevronDown
          className="size-4 shrink-0 text-zinc-500 transition-transform group-data-open:rotate-180"
          aria-hidden="true"
        />
      </Headless.DisclosureButton>

      <Headless.DisclosurePanel className="border-t border-zinc-200 px-3 pt-3 pb-2">
        <div className="space-y-4">
          <SectionGroup
            title="Default sections"
            sections={defaultSections}
            selectedSectionIds={selectedIds}
            selectedCount={selectedCount}
            disabled={disabled}
            onToggle={onToggle}
          />
          <SectionGroup
            title="Additional sections"
            sections={additionalSections}
            selectedSectionIds={selectedIds}
            selectedCount={selectedCount}
            disabled={disabled}
            onToggle={onToggle}
          />
        </div>

        {selectedCount === 1 ? (
          <p className="mt-2 border-t border-zinc-100 pt-2 text-xs/5 text-zinc-500">
            At least one section is required.
          </p>
        ) : null}
      </Headless.DisclosurePanel>
    </Headless.Disclosure>
  )
}
