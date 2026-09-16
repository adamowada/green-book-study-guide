export type GreenBookSectionId =
  | 'army-values'
  | 'soldiers-creed'
  | 'military-time'
  | 'general-orders'
  | 'special-orders'
  | 'phonetic-alphabet'
  | 'rank-structure'
  | 'battle-buddy-system'
  | 'golden-rules'
  | 'improper-relationships'
  | 'national-anthem-army-song'
  | 'code-of-conduct'

export const DEFAULT_SECTION_IDS = [
  'army-values',
  'soldiers-creed',
  'military-time',
  'general-orders',
  'special-orders',
  'phonetic-alphabet',
  'rank-structure',
] as const satisfies readonly GreenBookSectionId[]

export const ADDITIONAL_SECTION_IDS = [
  'battle-buddy-system',
  'golden-rules',
  'improper-relationships',
  'national-anthem-army-song',
  'code-of-conduct',
] as const satisfies readonly GreenBookSectionId[]

export type GreenBookInputKind = 'text' | 'textarea' | 'four-digit-year' | 'unordered-list' | 'composite'

export type GreenBookGradingProfile =
  | 'army-value'
  | 'recitation'
  | 'short-text'
  | 'formatted-value'
  | 'phonetic'
  | 'rank-identification'
  | 'unordered-recitation'
  | 'all-or-nothing-composite'
  | 'code-article'

export type GreenBookFieldPart = {
  id: string
  label: string
  answer: string
  aliases?: readonly string[]
  inputKind: 'text' | 'textarea' | 'four-digit-year'
}

export type GreenBookListItem = {
  id: string
  answer: string
  aliases?: readonly string[]
}

export type GreenBookField = {
  id: string
  prompt: string
  answer: string
  aliases?: readonly string[]
  inputKind: GreenBookInputKind
  gradingProfile: GreenBookGradingProfile
  points: number
  group?: string
  parts?: readonly GreenBookFieldPart[]
  items?: readonly GreenBookListItem[]
  rowCount?: number
  listScoring?: 'per-item' | 'all-or-nothing'
  acceptedLeadingLabels?: readonly string[]
  postGradeNote?: string
  referenceText?: string
  imageSrc?: string | null
  visualLabel?: string
  payGrade?: string
  remarks?: string
}

export function getRankPayGradeFieldId(rankFieldId: string): string {
  return `${rankFieldId}:pay-grade`
}

export function getFieldPartAnswerId(fieldId: string, partId: string): string {
  return `${fieldId}:${partId}`
}

export type GreenBookSectionGroup = {
  id: string
  title: string
}

export type GreenBookContextBlock = {
  id: string
  title?: string
  text: string
}

export type GreenBookSection = {
  id: GreenBookSectionId
  title: string
  fields: readonly GreenBookField[]
  defaultIncluded: boolean
  groups?: readonly GreenBookSectionGroup[]
  context?: readonly GreenBookContextBlock[]
}

type GreenBookFieldDefinition = Omit<GreenBookField, 'inputKind' | 'gradingProfile' | 'points'> &
  Partial<Pick<GreenBookField, 'inputKind' | 'gradingProfile' | 'points'>>

type GreenBookSectionDefinition = Omit<GreenBookSection, 'fields' | 'defaultIncluded'> & {
  fields: readonly GreenBookFieldDefinition[]
}

const LEGACY_SECTION_DEFAULTS: Record<
  (typeof DEFAULT_SECTION_IDS)[number],
  Pick<GreenBookField, 'inputKind' | 'gradingProfile'>
> = {
  'army-values': { inputKind: 'text', gradingProfile: 'army-value' },
  'soldiers-creed': { inputKind: 'textarea', gradingProfile: 'recitation' },
  'military-time': { inputKind: 'text', gradingProfile: 'formatted-value' },
  'general-orders': { inputKind: 'textarea', gradingProfile: 'recitation' },
  'special-orders': { inputKind: 'textarea', gradingProfile: 'recitation' },
  'phonetic-alphabet': { inputKind: 'text', gradingProfile: 'phonetic' },
  'rank-structure': { inputKind: 'composite', gradingProfile: 'rank-identification' },
}

function isDefaultSectionId(
  sectionId: GreenBookSectionId,
): sectionId is (typeof DEFAULT_SECTION_IDS)[number] {
  return (DEFAULT_SECTION_IDS as readonly GreenBookSectionId[]).includes(sectionId)
}

function defineSection(section: GreenBookSectionDefinition): GreenBookSection {
  const defaults = isDefaultSectionId(section.id) ? LEGACY_SECTION_DEFAULTS[section.id] : undefined

  return {
    ...section,
    defaultIncluded: isDefaultSectionId(section.id),
    fields: section.fields.map((field) => ({
      inputKind: defaults?.inputKind ?? 'text',
      gradingProfile: defaults?.gradingProfile ?? 'short-text',
      points: 1,
      ...field,
    })),
  }
}

const greenBookSectionDefinitions = [
  {
    id: 'army-values',
    title: 'Army Values',
    fields: [
      {
        id: 'army-values-loyalty',
        prompt: 'Bear true faith and allegiance to the U.S. Constitution, the Army, your unit, and other Soldiers.',
        answer: 'Loyalty',
        referenceText:
          'A loyal Soldier supports the leadership, stands up for fellow Soldiers, and displays loyalty by doing their share.',
      },
      {
        id: 'army-values-duty',
        prompt: 'Fulfill your obligations.',
        answer: 'Duty',
        referenceText:
          'Duty means accomplishing tasks as part of a team and resisting shortcuts that undermine the final product.',
      },
      {
        id: 'army-values-respect',
        prompt: 'Treat people as they should be treated.',
        answer: 'Respect',
        referenceText:
          'Respect means treating others with dignity while trusting that all people performed their jobs and fulfilled their duty.',
      },
      {
        id: 'army-values-selfless-service',
        prompt: 'Put the welfare of the Nation, the Army, and your subordinates before your own.',
        answer: 'Selfless Service',
        referenceText:
          'Selfless service means serving without thought of recognition or gain and adding to the team effort.',
      },
      {
        id: 'army-values-honor',
        prompt: 'Live up to all the Army Values.',
        answer: 'Honor',
        referenceText:
          'Honor is carrying out and living the values of respect, duty, loyalty, selfless service, integrity, and personal courage.',
      },
      {
        id: 'army-values-integrity',
        prompt: "Do what's right, legally and morally.",
        answer: 'Integrity',
        referenceText:
          'Integrity grows by adhering to moral principles, avoiding deception, and making choices that build trust.',
      },
      {
        id: 'army-values-personal-courage',
        prompt: 'Face fear, danger, or adversity (physical or moral).',
        answer: 'Personal Courage',
        referenceText:
          'Personal courage includes enduring physical duress and continuing forward on the right path when facing moral adversity.',
      },
    ],
  },
  {
    id: 'soldiers-creed',
    title: "Soldier's Creed",
    fields: [
      {
        id: 'soldiers-creed-1',
        prompt: "Soldier's Creed line 1",
        answer: 'I am an American Soldier.',
      },
      {
        id: 'soldiers-creed-2',
        prompt: "Soldier's Creed line 2",
        answer: 'I am a warrior and a member of a team.',
      },
      {
        id: 'soldiers-creed-3',
        prompt: "Soldier's Creed line 3",
        answer: 'I serve the people of the United States and live the Army Values.',
      },
      {
        id: 'soldiers-creed-4',
        prompt: "Soldier's Creed line 4",
        answer: 'I will always place the mission first.',
      },
      {
        id: 'soldiers-creed-5',
        prompt: "Soldier's Creed line 5",
        answer: 'I will never accept defeat.',
      },
      {
        id: 'soldiers-creed-6',
        prompt: "Soldier's Creed line 6",
        answer: 'I will never quit.',
      },
      {
        id: 'soldiers-creed-7',
        prompt: "Soldier's Creed line 7",
        answer: 'I will never leave a fallen comrade.',
      },
      {
        id: 'soldiers-creed-8',
        prompt: "Soldier's Creed line 8",
        answer: 'I am disciplined, physically and mentally tough, trained and proficient in my Warrior tasks and drills.',
      },
      {
        id: 'soldiers-creed-9',
        prompt: "Soldier's Creed line 9",
        answer: 'I always maintain my arms, my equipment and myself.',
      },
      {
        id: 'soldiers-creed-10',
        prompt: "Soldier's Creed line 10",
        answer: 'I am an expert and I am a professional.',
      },
      {
        id: 'soldiers-creed-11',
        prompt: "Soldier's Creed line 11",
        answer: 'I stand ready to deploy, engage, and destroy the enemies of the United States of America in close combat.',
      },
      {
        id: 'soldiers-creed-12',
        prompt: "Soldier's Creed line 12",
        answer: 'I am a guardian of freedom and the American way of life.',
      },
      {
        id: 'soldiers-creed-13',
        prompt: "Soldier's Creed line 13",
        answer: 'I am an American Soldier.',
      },
    ],
  },
  {
    id: 'military-time',
    title: 'Military Time',
    fields: [
      { id: 'military-time-0000', prompt: '12:00 Midnight', answer: '0000' },
      { id: 'military-time-0001', prompt: '12:01 AM', answer: '0001' },
      { id: 'military-time-0100', prompt: '1:00 AM', answer: '0100' },
      { id: 'military-time-0200', prompt: '2:00 AM', answer: '0200' },
      { id: 'military-time-0300', prompt: '3:00 AM', answer: '0300' },
      { id: 'military-time-0400', prompt: '4:00 AM', answer: '0400' },
      { id: 'military-time-0500', prompt: '5:00 AM', answer: '0500' },
      { id: 'military-time-0600', prompt: '6:00 AM', answer: '0600' },
      { id: 'military-time-0700', prompt: '7:00 AM', answer: '0700' },
      { id: 'military-time-0800', prompt: '8:00 AM', answer: '0800' },
      { id: 'military-time-0900', prompt: '9:00 AM', answer: '0900' },
      { id: 'military-time-1000', prompt: '10:00 AM', answer: '1000' },
      { id: 'military-time-1100', prompt: '11:00 AM', answer: '1100' },
      { id: 'military-time-1200', prompt: '12:00 Noon', answer: '1200' },
      { id: 'military-time-1300', prompt: '1:00 PM', answer: '1300' },
      { id: 'military-time-1400', prompt: '2:00 PM', answer: '1400' },
      { id: 'military-time-1500', prompt: '3:00 PM', answer: '1500' },
      { id: 'military-time-1600', prompt: '4:00 PM', answer: '1600' },
      { id: 'military-time-1700', prompt: '5:00 PM', answer: '1700' },
      { id: 'military-time-1800', prompt: '6:00 PM', answer: '1800' },
      { id: 'military-time-1900', prompt: '7:00 PM', answer: '1900' },
      { id: 'military-time-2000', prompt: '8:00 PM', answer: '2000' },
      { id: 'military-time-2100', prompt: '9:00 PM', answer: '2100' },
      { id: 'military-time-2200', prompt: '10:00 PM', answer: '2200' },
      { id: 'military-time-2300', prompt: '11:00 PM', answer: '2300' },
      { id: 'military-time-2359', prompt: '11:59 PM', answer: '2359' },
    ],
  },
  {
    id: 'general-orders',
    title: 'General Orders',
    fields: [
      {
        id: 'general-order-1',
        prompt: 'General Order 1',
        answer: 'I will guard everything within the limits of my post and quit my post only when properly relieved.',
      },
      {
        id: 'general-order-2',
        prompt: 'General Order 2',
        answer: 'I will obey my special orders and perform all my duties in a military manner.',
      },
      {
        id: 'general-order-3',
        prompt: 'General Order 3',
        answer:
          'I will report violations of my special orders, emergencies, and anything not covered in my instructions to the commander of relief.',
        aliases: [
          'I will report violations of my special orders, emergencies, and anything not covered in my instructions to the commander of the relief.',
        ],
        postGradeNote:
          'Wording note: Official Army publications use both “commander of relief” and “commander of the relief.” Both are accepted here; use the version your cadre teaches.',
      },
    ],
  },
  {
    id: 'special-orders',
    title: 'Special Orders',
    fields: [
      {
        id: 'special-orders-definition',
        prompt: 'Special Orders definition',
        answer: 'Additional requirements or instructions that augment the general orders.',
      },
    ],
  },
  {
    id: 'phonetic-alphabet',
    title: 'Phonetic Alphabet',
    fields: [
      { id: 'phonetic-a', prompt: 'A', answer: 'ALPHA' },
      { id: 'phonetic-b', prompt: 'B', answer: 'BRAVO' },
      { id: 'phonetic-c', prompt: 'C', answer: 'CHARLIE' },
      { id: 'phonetic-d', prompt: 'D', answer: 'DELTA' },
      { id: 'phonetic-e', prompt: 'E', answer: 'ECHO' },
      { id: 'phonetic-f', prompt: 'F', answer: 'FOXTROT' },
      { id: 'phonetic-g', prompt: 'G', answer: 'GOLF' },
      { id: 'phonetic-h', prompt: 'H', answer: 'HOTEL' },
      { id: 'phonetic-i', prompt: 'I', answer: 'INDIA' },
      { id: 'phonetic-j', prompt: 'J', answer: 'JULIET' },
      { id: 'phonetic-k', prompt: 'K', answer: 'KILO' },
      { id: 'phonetic-l', prompt: 'L', answer: 'LIMA' },
      { id: 'phonetic-m', prompt: 'M', answer: 'MIKE' },
      { id: 'phonetic-n', prompt: 'N', answer: 'NOVEMBER' },
      { id: 'phonetic-o', prompt: 'O', answer: 'OSCAR' },
      { id: 'phonetic-p', prompt: 'P', answer: 'PAPA' },
      { id: 'phonetic-q', prompt: 'Q', answer: 'QUEBEC' },
      { id: 'phonetic-r', prompt: 'R', answer: 'ROMEO' },
      { id: 'phonetic-s', prompt: 'S', answer: 'SIERRA' },
      { id: 'phonetic-t', prompt: 'T', answer: 'TANGO' },
      { id: 'phonetic-u', prompt: 'U', answer: 'UNIFORM' },
      { id: 'phonetic-v', prompt: 'V', answer: 'VICTOR' },
      { id: 'phonetic-w', prompt: 'W', answer: 'WHISKEY' },
      { id: 'phonetic-x', prompt: 'X', answer: 'X-RAY' },
      { id: 'phonetic-y', prompt: 'Y', answer: 'YANKEE' },
      { id: 'phonetic-z', prompt: 'Z', answer: 'ZULU' },
    ],
  },
  {
    id: 'rank-structure',
    title: 'Rank Structure',
    fields: [
      // Rank identities/pay grades follow the official DoD/Army rank charts; visual prompts use common Army
      // insignia terms and are derived from the official insignia artwork when prose descriptions are unavailable.
      {
        id: 'rank-pvt',
        prompt: 'No rank insignia.',
        answer: 'Private (PVT)',
        aliases: ['Private (PVT)', 'Private', 'PVT', 'Private PVT'],
        imageSrc: null,
        visualLabel: 'No Chevron',
        payGrade: 'E-1',
      },
      {
        id: 'rank-pv2',
        prompt: 'One chevron.',
        answer: 'Private (PV2)',
        aliases: ['Private (PV2)', 'Private', 'PV2', 'Private PV2'],
        imageSrc: '/ranks/rank-pv2.png',
        payGrade: 'E-2',
      },
      {
        id: 'rank-pfc',
        prompt: 'One chevron over one rocker.',
        answer: 'Private First Class (PFC)',
        aliases: ['Private First Class (PFC)', 'Private First Class', 'PFC', 'Private First Class PFC'],
        imageSrc: '/ranks/rank-pfc.png',
        payGrade: 'E-3',
      },
      {
        id: 'rank-spc',
        prompt: 'An eagle centered on a shield.',
        answer: 'Specialist (SPC)',
        aliases: ['Specialist (SPC)', 'Specialist', 'SPC', 'Specialist SPC'],
        imageSrc: '/ranks/rank-spc.png',
        payGrade: 'E-4',
      },
      {
        id: 'rank-cpl',
        prompt: 'Two chevrons.',
        answer: 'Corporal (CPL)',
        aliases: ['Corporal (CPL)', 'Corporal', 'CPL', 'Corporal CPL'],
        imageSrc: '/ranks/rank-cpl.png',
        payGrade: 'E-4',
        remarks: 'A SPC recognized with NCO authorities',
      },
      {
        id: 'rank-sgt',
        prompt: 'Three chevrons.',
        answer: 'Sergeant (SGT)',
        aliases: ['Sergeant (SGT)', 'Sergeant', 'SGT', 'Sergeant SGT'],
        imageSrc: '/ranks/rank-sgt.png',
        payGrade: 'E-5',
        remarks: 'Team leader',
      },
      {
        id: 'rank-ssg',
        prompt: 'Three chevrons over one rocker.',
        answer: 'Staff Sergeant (SSG)',
        aliases: ['Staff Sergeant (SSG)', 'Staff Sergeant', 'SSG', 'Staff Sergeant SSG'],
        imageSrc: '/ranks/rank-ssg.png',
        payGrade: 'E-6',
        remarks: 'Squad leader or section chief',
      },
      {
        id: 'rank-sfc',
        prompt: 'Three chevrons over two rockers.',
        answer: 'Sergeant First Class (SFC)',
        aliases: ['Sergeant First Class (SFC)', 'Sergeant First Class', 'SFC', 'Sergeant First Class SFC'],
        imageSrc: '/ranks/rank-sfc.png',
        payGrade: 'E-7',
        remarks: 'Senior NCO in a platoon',
      },
      {
        id: 'rank-msg',
        prompt: 'Three chevrons over three rockers.',
        answer: 'Master Sergeant (MSG)',
        aliases: ['Master Sergeant (MSG)', 'Master Sergeant', 'MSG', 'Master Sergeant MSG'],
        imageSrc: '/ranks/rank-msg.png',
        payGrade: 'E-8',
        remarks: 'NCOIC at battalion and brigade',
      },
      {
        id: 'rank-1sg',
        prompt: 'Three chevrons over three rockers with a diamond in the center.',
        answer: 'First Sergeant (1SG)',
        aliases: ['First Sergeant (1SG)', 'First Sergeant', '1SG', 'First Sergeant 1SG'],
        imageSrc: '/ranks/rank-1sg.png',
        payGrade: 'E-8',
        remarks: 'Senior NCO in a company; advisor to the commander',
      },
      {
        id: 'rank-sgm',
        prompt: 'Three chevrons over three rockers with a star in the center.',
        answer: 'Sergeant Major (SGM)',
        aliases: ['Sergeant Major (SGM)', 'Sergeant Major', 'SGM', 'Sergeant Major SGM'],
        imageSrc: '/ranks/rank-sgm.png',
        payGrade: 'E-9',
        remarks: 'Principal advisor on a battalion and higher HQs staff',
      },
      {
        id: 'rank-csm',
        prompt: 'Three chevrons over three rockers with a star in the center inside a wreath.',
        answer: 'Command Sergeant Major (CSM)',
        aliases: ['Command Sergeant Major (CSM)', 'Command Sergeant Major', 'CSM', 'Command Sergeant Major CSM'],
        imageSrc: '/ranks/rank-csm.png',
        payGrade: 'E-9',
        remarks: 'Senior enlisted advisor at battalion and higher HQs',
      },
      {
        id: 'rank-sma',
        prompt: 'Three chevrons over three rockers with the Army eagle between two stars in the center.',
        answer: 'Sergeant Major of the Army (SMA)',
        aliases: [
          'Sergeant Major of the Army (SMA)',
          'Sergeant Major of the Army',
          'SMA',
          'Sergeant Major of the Army SMA',
        ],
        imageSrc: '/ranks/rank-sma.png',
        payGrade: 'E-9',
        remarks: 'Senior NCO in the Army; advisor to the Chief of Staff of the Army',
      },
      {
        id: 'rank-wo1',
        prompt: 'One black square centered on a silver bar.',
        answer: 'Warrant Officer 1 (WO1)',
        aliases: ['Warrant Officer 1 (WO1)', 'Warrant Officer 1', 'Warrant Officer One', 'WO1', 'Warrant Officer 1 WO1'],
        imageSrc: '/ranks/rank-wo1.png',
        payGrade: 'W-1',
        remarks: 'Company and battalion staffs',
      },
      {
        id: 'rank-cw2',
        prompt: 'Two black squares centered on a silver bar.',
        answer: 'Chief Warrant Officer 2 (CW2)',
        aliases: [
          'Chief Warrant Officer 2 (CW2)',
          'Chief Warrant Officer 2',
          'Chief Warrant Officer Two',
          'CW2',
          'Chief Warrant Officer 2 CW2',
        ],
        imageSrc: '/ranks/rank-cw2.png',
        payGrade: 'W-2',
        remarks: 'Company and battalion staffs',
      },
      {
        id: 'rank-cw3',
        prompt: 'Three black squares centered on a silver bar.',
        answer: 'Chief Warrant Officer 3 (CW3)',
        aliases: [
          'Chief Warrant Officer 3 (CW3)',
          'Chief Warrant Officer 3',
          'Chief Warrant Officer Three',
          'CW3',
          'Chief Warrant Officer 3 CW3',
        ],
        imageSrc: '/ranks/rank-cw3.png',
        payGrade: 'W-3',
        remarks: 'Company and higher staffs',
      },
      {
        id: 'rank-cw4',
        prompt: 'Four black squares centered on a silver bar.',
        answer: 'Chief Warrant Officer 4 (CW4)',
        aliases: [
          'Chief Warrant Officer 4 (CW4)',
          'Chief Warrant Officer 4',
          'Chief Warrant Officer Four',
          'CW4',
          'Chief Warrant Officer 4 CW4',
        ],
        imageSrc: '/ranks/rank-cw4.png',
        payGrade: 'W-4',
        remarks: 'Battalion and higher staffs',
      },
      {
        id: 'rank-cw5',
        prompt: 'One long black vertical stripe centered on a silver bar.',
        answer: 'Chief Warrant Officer 5 (CW5)',
        aliases: [
          'Chief Warrant Officer 5 (CW5)',
          'Chief Warrant Officer 5',
          'Chief Warrant Officer Five',
          'CW5',
          'Chief Warrant Officer 5 CW5',
        ],
        imageSrc: '/ranks/rank-cw5.png',
        payGrade: 'W-5',
        remarks: 'Brigade and higher staffs',
      },
      {
        id: 'rank-2lt',
        prompt: 'One gold bar.',
        answer: '2nd Lieutenant (2LT)',
        aliases: ['2nd Lieutenant (2LT)', '2nd Lieutenant', 'Second Lieutenant', '2LT', '2nd Lieutenant 2LT'],
        imageSrc: '/ranks/rank-2lt.png',
        payGrade: 'O-1',
        remarks: 'Platoon Leader',
      },
      {
        id: 'rank-1lt',
        prompt: 'One silver bar.',
        answer: '1st Lieutenant (1LT)',
        aliases: ['1st Lieutenant (1LT)', '1st Lieutenant', 'First Lieutenant', '1LT', '1st Lieutenant 1LT'],
        imageSrc: '/ranks/rank-1lt.png',
        payGrade: 'O-2',
        remarks: 'Company Executive Officer',
      },
      {
        id: 'rank-cpt',
        prompt: 'Two connected silver bars.',
        answer: 'Captain (CPT)',
        aliases: ['Captain (CPT)', 'Captain', 'CPT', 'Captain CPT'],
        imageSrc: '/ranks/rank-cpt.png',
        payGrade: 'O-3',
        remarks: 'Company Commander; Battalion Staff Officer',
      },
      {
        id: 'rank-maj',
        prompt: 'One gold oak leaf.',
        answer: 'Major (MAJ)',
        aliases: ['Major (MAJ)', 'Major', 'MAJ', 'Major MAJ'],
        imageSrc: '/ranks/rank-maj.png',
        payGrade: 'O-4',
        remarks: 'Battalion Executive Officer; Brigade Staff Officer',
      },
      {
        id: 'rank-ltc',
        prompt: 'One silver oak leaf.',
        answer: 'Lieutenant Colonel (LTC)',
        aliases: ['Lieutenant Colonel (LTC)', 'Lieutenant Colonel', 'LTC', 'Lieutenant Colonel LTC'],
        imageSrc: '/ranks/rank-ltc.png',
        payGrade: 'O-5',
        remarks: 'Battalion Commander; Division Staff Officer',
      },
      {
        id: 'rank-col',
        prompt: 'One silver eagle.',
        answer: 'Colonel (COL)',
        aliases: ['Colonel (COL)', 'Colonel', 'COL', 'Colonel COL'],
        imageSrc: '/ranks/rank-col.png',
        payGrade: 'O-6',
        remarks: 'Brigade Commander; Division Staff Officer',
      },
      {
        id: 'rank-bg',
        prompt: 'One silver star.',
        answer: 'Brigadier General (BG)',
        aliases: ['Brigadier General (BG)', 'Brigadier General', 'BG', 'Brigadier General BG'],
        imageSrc: '/ranks/rank-bg.png',
        payGrade: 'O-7',
      },
      {
        id: 'rank-mg',
        prompt: 'Two silver stars.',
        answer: 'Major General (MG)',
        aliases: ['Major General (MG)', 'Major General', 'MG', 'Major General MG'],
        imageSrc: '/ranks/rank-mg.png',
        payGrade: 'O-8',
      },
      {
        id: 'rank-ltg',
        prompt: 'Three silver stars.',
        answer: 'Lieutenant General (LTG)',
        aliases: ['Lieutenant General (LTG)', 'Lieutenant General', 'LTG', 'Lieutenant General LTG'],
        imageSrc: '/ranks/rank-ltg.png',
        payGrade: 'O-9',
      },
      {
        id: 'rank-gen',
        prompt: 'Four silver stars.',
        answer: 'General (GEN)',
        aliases: ['General (GEN)', 'General', 'GEN', 'General GEN'],
        imageSrc: '/ranks/rank-gen.png',
        payGrade: 'O-10',
      },
    ],
  },
  {
    id: 'battle-buddy-system',
    title: 'Battle Buddy System',
    context: [
      {
        id: 'battle-buddy-introduction',
        text:
          "Soldiers rely on one another to stay motivated and reach peak performance. Although required in Initial Military Training, Soldiers will form natural bonds with their fellow Soldiers as part of Army culture. To contribute to this team spirit, we live by the buddy system. A buddy team is usually defined as two Soldiers (same sex) in the same unit who always look after each other.\n\nBy getting to know other Soldiers on a professional and personal level, you learn how to improve yourself and encourage others. Working together, you and your battle buddy learn initiative, responsibility, trust, and dependability.\n\nWhile at the reception battalion, BCT or OSUT, Soldiers are placed in buddy teams. With the requirement to excel in Army training, some Soldiers need more positive reinforcement than others. For that reason, you may also be paired based on your strengths, so you and your buddy can complement each other's weaknesses.",
      },
      {
        id: 'battle-buddy-closing',
        text:
          'In the end, the most rewarding part of the buddy system is making every Soldier your buddy; any buddy could help you accomplish your mission or save your life.',
      },
    ],
    fields: [
      {
        id: 'battle-buddy-responsibilities',
        prompt: 'List the eight battle buddy responsibilities.',
        answer:
          "Never leave your buddy alone.\nNever let your buddy go into an office or room by themselves; even if a drill sergeant, or instructor says it's okay (If it happens, report it).\nKeep your buddy safe and free from harm.\nAlways know the whereabouts of your buddy.\nPass information to your buddy.\nEncourage and support your buddy to train harder and do better.\nHelp your buddy solve problems.\nInform Cadre of any changes in your buddy's behavior.",
        inputKind: 'unordered-list',
        gradingProfile: 'unordered-recitation',
        points: 8,
        rowCount: 8,
        listScoring: 'per-item',
        items: [
          { id: 'never-leave-alone', answer: 'Never leave your buddy alone.' },
          {
            id: 'never-enter-alone',
            answer:
              "Never let your buddy go into an office or room by themselves; even if a drill sergeant, or instructor says it's okay (If it happens, report it).",
          },
          { id: 'keep-safe', answer: 'Keep your buddy safe and free from harm.' },
          { id: 'know-whereabouts', answer: 'Always know the whereabouts of your buddy.' },
          { id: 'pass-information', answer: 'Pass information to your buddy.' },
          {
            id: 'encourage-and-support',
            answer: 'Encourage and support your buddy to train harder and do better.',
          },
          { id: 'help-solve-problems', answer: 'Help your buddy solve problems.' },
          { id: 'inform-cadre', answer: "Inform Cadre of any changes in your buddy's behavior." },
        ],
      },
    ],
  },
  {
    id: 'golden-rules',
    title: 'BCT/OSUT/AIT “Golden Rules”',
    fields: [
      {
        id: 'golden-rule-1',
        prompt: 'Golden Rule #1',
        answer: 'DO NOT: bully, haze, assault or harass a fellow Soldier.\nDO: help and assist your teammate.',
        inputKind: 'composite',
        gradingProfile: 'all-or-nothing-composite',
        points: 1,
        parts: [
          {
            id: 'do-not',
            label: 'DO NOT',
            answer: 'bully, haze, assault or harass a fellow Soldier.',
            inputKind: 'textarea',
          },
          { id: 'do', label: 'DO', answer: 'help and assist your teammate.', inputKind: 'textarea' },
        ],
      },
      {
        id: 'golden-rule-2',
        prompt: 'Golden Rule #2',
        answer:
          'DO NOT: use vulgar language, rude gestures, or discriminate against others.\nDO: treat everyone with dignity and respect.',
        inputKind: 'composite',
        gradingProfile: 'all-or-nothing-composite',
        points: 1,
        parts: [
          {
            id: 'do-not',
            label: 'DO NOT',
            answer: 'use vulgar language, rude gestures, or discriminate against others.',
            inputKind: 'textarea',
          },
          {
            id: 'do',
            label: 'DO',
            answer: 'treat everyone with dignity and respect.',
            inputKind: 'textarea',
          },
        ],
      },
      {
        id: 'golden-rule-3',
        prompt: 'Golden Rule #3',
        answer:
          "DO NOT: kiss, attempt to kiss, or touch a fellow Soldier.\nDO: respect your teammate's personal space.",
        inputKind: 'composite',
        gradingProfile: 'all-or-nothing-composite',
        points: 1,
        parts: [
          {
            id: 'do-not',
            label: 'DO NOT',
            answer: 'kiss, attempt to kiss, or touch a fellow Soldier.',
            inputKind: 'textarea',
          },
          {
            id: 'do',
            label: 'DO',
            answer: "respect your teammate's personal space.",
            inputKind: 'textarea',
          },
        ],
      },
      {
        id: 'golden-rule-4',
        prompt: 'Golden Rule #4',
        answer:
          'DO NOT: steal or take something that does not belong to you.\nDO: build trust with teammates through your ethical and disciplined actions.',
        inputKind: 'composite',
        gradingProfile: 'all-or-nothing-composite',
        points: 1,
        parts: [
          {
            id: 'do-not',
            label: 'DO NOT',
            answer: 'steal or take something that does not belong to you.',
            inputKind: 'textarea',
          },
          {
            id: 'do',
            label: 'DO',
            answer: 'build trust with teammates through your ethical and disciplined actions.',
            inputKind: 'textarea',
          },
        ],
      },
      {
        id: 'golden-rule-5',
        prompt: 'Golden Rule #5',
        answer:
          'DO NOT: go anywhere without your battle buddy.\nDO: report violations of policies and regulations to your platoon and company leadership.',
        inputKind: 'composite',
        gradingProfile: 'all-or-nothing-composite',
        points: 1,
        parts: [
          {
            id: 'do-not',
            label: 'DO NOT',
            answer: 'go anywhere without your battle buddy.',
            inputKind: 'textarea',
          },
          {
            id: 'do',
            label: 'DO',
            answer: 'report violations of policies and regulations to your platoon and company leadership.',
            inputKind: 'textarea',
          },
        ],
      },
    ],
  },
  {
    id: 'improper-relationships',
    title: 'Improper Relationships',
    context: [
      {
        id: 'improper-relationships-awareness-note',
        title: 'For awareness',
        text: 'Trainees sign a written acknowledgment of these rules; trainers complete a separate acknowledgment.',
      },
    ],
    fields: [
      {
        id: 'improper-relationships-categories',
        prompt: 'What are the two major categories of illegal associations?',
        answer: 'Cadre-Trainee\nTrainee-Trainee',
        inputKind: 'unordered-list',
        gradingProfile: 'unordered-recitation',
        points: 1,
        rowCount: 2,
        listScoring: 'all-or-nothing',
        items: [
          {
            id: 'cadre-trainee',
            answer: 'Cadre-Trainee',
            aliases: ['Cadre/Trainee', 'Cadre Trainee'],
          },
          {
            id: 'trainee-trainee',
            answer: 'Trainee-Trainee',
            aliases: ['Trainee/Trainee', 'Trainee Trainee'],
          },
        ],
      },
      {
        id: 'improper-relationships-training-mission',
        prompt: 'When is a relationship between permanent party personnel and a Trainee Soldier permitted?',
        answer: 'required by the training mission',
        inputKind: 'text',
        gradingProfile: 'short-text',
        points: 1,
      },
      {
        id: 'improper-relationships-no-consensual',
        prompt: 'Recite the rule about consensual relationships during BCT/OSUT/AIT.',
        answer:
          'There are no consensual relationships between cadre/permanent party - Trainee or between Trainee-Trainee during BCT/OSUT/AIT.',
        inputKind: 'textarea',
        gradingProfile: 'recitation',
        points: 1,
      },
    ],
  },
  {
    id: 'national-anthem-army-song',
    title: 'National Anthem & Army Song',
    groups: [
      { id: 'national-anthem-background', title: 'National Anthem — Background' },
      { id: 'national-anthem-lyrics', title: 'National Anthem — Lyrics' },
      { id: 'army-song-background', title: 'Army Song — Background' },
      { id: 'army-song-lyrics', title: 'Army Song — Lyrics' },
    ],
    context: [
      {
        id: 'national-anthem-source-context',
        title: 'The National Anthem',
        text:
          "Written by Francis Scott Key in 1814, the Star Spangled Banner was played at military occasions ordered by President Woodrow Wilson in 1916, and in 1931 was designated as our national anthem by an Act of Congress.\n\nThe Star-Spangled Banner is the timeless rendition of our sacred American Flag and country's patriotic spirit.",
      },
      {
        id: 'army-song-source-context',
        title: 'The Army Song',
        text:
          'The Army Song tells the heroic story of our past, present, and future. It was originally written by First Lieutenant Edmund L. Gruber, a Field Artillery officer, in 1908 and it was adopted in 1952 as the official song of our Army. As a time-honored tradition, the song is played at the conclusion of every U.S. Army ceremony in which all Soldiers are expected to stand and proudly sing the lyrics.',
      },
    ],
    fields: [
      {
        id: 'national-anthem-author',
        prompt: 'Who wrote the Star-Spangled Banner?',
        answer: 'Francis Scott Key',
        inputKind: 'text',
        gradingProfile: 'short-text',
        points: 1,
        group: 'national-anthem-background',
      },
      {
        id: 'national-anthem-written-year',
        prompt: 'In what year was it written?',
        answer: '1814',
        inputKind: 'four-digit-year',
        gradingProfile: 'short-text',
        points: 1,
        group: 'national-anthem-background',
      },
      {
        id: 'national-anthem-military-occasions',
        prompt: 'Who ordered it played at military occasions, and in what year?',
        answer: 'President Woodrow Wilson — 1916',
        inputKind: 'composite',
        gradingProfile: 'all-or-nothing-composite',
        points: 1,
        group: 'national-anthem-background',
        parts: [
          {
            id: 'president',
            label: 'President',
            answer: 'President Woodrow Wilson',
            inputKind: 'text',
          },
          { id: 'year', label: 'Year', answer: '1916', inputKind: 'four-digit-year' },
        ],
      },
      {
        id: 'national-anthem-designation',
        prompt: 'How and when was it designated as our national anthem?',
        answer: 'An Act of Congress — 1931',
        inputKind: 'composite',
        gradingProfile: 'all-or-nothing-composite',
        points: 1,
        group: 'national-anthem-background',
        parts: [
          { id: 'action', label: 'Action', answer: 'An Act of Congress', inputKind: 'text' },
          { id: 'year', label: 'Year', answer: '1931', inputKind: 'four-digit-year' },
        ],
      },
      {
        id: 'national-anthem-represents',
        prompt: 'What does the Star-Spangled Banner represent?',
        answer: "The timeless rendition of our sacred American Flag and country's patriotic spirit.",
        inputKind: 'textarea',
        gradingProfile: 'recitation',
        points: 1,
        group: 'national-anthem-background',
      },
      {
        id: 'national-anthem-lyrics-1',
        prompt: 'National Anthem — lyric block 1',
        answer: "Oh, say, can you see, by the dawn's early light,",
        inputKind: 'textarea',
        gradingProfile: 'recitation',
        points: 1,
        group: 'national-anthem-lyrics',
      },
      {
        id: 'national-anthem-lyrics-2',
        prompt: 'National Anthem — lyric block 2',
        answer: "What so proudly we hailed at the twilight's last gleaming?",
        inputKind: 'textarea',
        gradingProfile: 'recitation',
        points: 1,
        group: 'national-anthem-lyrics',
      },
      {
        id: 'national-anthem-lyrics-3',
        prompt: 'National Anthem — lyric block 3',
        answer: "Whose broad stripes and bright stars, thro' the perilous fight'",
        aliases: ['Whose broad stripes and bright stars, through the perilous fight'],
        inputKind: 'textarea',
        gradingProfile: 'recitation',
        points: 1,
        group: 'national-anthem-lyrics',
      },
      {
        id: 'national-anthem-lyrics-4',
        prompt: 'National Anthem — lyric block 4',
        answer: "O'er the ramparts we watched were so gallantly streaming.",
        aliases: ['Over the ramparts we watched were so gallantly streaming.'],
        inputKind: 'textarea',
        gradingProfile: 'recitation',
        points: 1,
        group: 'national-anthem-lyrics',
      },
      {
        id: 'national-anthem-lyrics-5',
        prompt: 'National Anthem — lyric block 5',
        answer:
          'And the rockets’ red glare, the bombs bursting in air, gave proof through the night that our flag was still there. Oh, say, does that Star-Spangled Banner yet wave',
        inputKind: 'textarea',
        gradingProfile: 'recitation',
        points: 1,
        group: 'national-anthem-lyrics',
      },
      {
        id: 'national-anthem-lyrics-6',
        prompt: 'National Anthem — lyric block 6',
        answer: "O'er the land of the free and the home of the brave?",
        aliases: ['Over the land of the free and the home of the brave?'],
        inputKind: 'textarea',
        gradingProfile: 'recitation',
        points: 1,
        group: 'national-anthem-lyrics',
      },
      {
        id: 'army-song-story',
        prompt: "What does the Army Song's heroic story cover?",
        answer: 'Our past, present, and future.',
        inputKind: 'text',
        gradingProfile: 'recitation',
        points: 1,
        group: 'army-song-background',
      },
      {
        id: 'army-song-author',
        prompt: 'Who originally wrote the Army Song, and what was his branch?',
        answer: 'First Lieutenant Edmund L. Gruber — Field Artillery',
        aliases: ['1LT Edmund L. Gruber — Field Artillery'],
        inputKind: 'composite',
        gradingProfile: 'all-or-nothing-composite',
        points: 1,
        group: 'army-song-background',
        parts: [
          {
            id: 'author',
            label: 'Author',
            answer: 'First Lieutenant Edmund L. Gruber',
            aliases: ['1LT Edmund L. Gruber'],
            inputKind: 'text',
          },
          { id: 'branch', label: 'Branch', answer: 'Field Artillery', inputKind: 'text' },
        ],
      },
      {
        id: 'army-song-written-year',
        prompt: 'In what year was the Army Song written?',
        answer: '1908',
        inputKind: 'four-digit-year',
        gradingProfile: 'short-text',
        points: 1,
        group: 'army-song-background',
      },
      {
        id: 'army-song-adopted-year',
        prompt: 'In what year was it adopted as the official song of our Army?',
        answer: '1952',
        inputKind: 'four-digit-year',
        gradingProfile: 'short-text',
        points: 1,
        group: 'army-song-background',
      },
      {
        id: 'army-song-ceremony',
        prompt: 'When is the Army Song played, and what are Soldiers expected to do?',
        answer:
          'At the conclusion of every U.S. Army ceremony — Stand and proudly sing the lyrics',
        inputKind: 'composite',
        gradingProfile: 'all-or-nothing-composite',
        points: 1,
        group: 'army-song-background',
        parts: [
          {
            id: 'when',
            label: 'When played',
            answer: 'At the conclusion of every U.S. Army ceremony',
            inputKind: 'text',
          },
          {
            id: 'response',
            label: "Soldiers' response",
            answer: 'Stand and proudly sing the lyrics',
            inputKind: 'text',
          },
        ],
      },
      {
        id: 'army-song-lyrics-1',
        prompt: 'Army Song — lyric block 1',
        answer: 'March along, sing our song, with the Army of the free.',
        inputKind: 'textarea',
        gradingProfile: 'recitation',
        points: 1,
        group: 'army-song-lyrics',
      },
      {
        id: 'army-song-lyrics-2',
        prompt: 'Army Song — lyric block 2',
        answer: 'Count the brave, count the true, who have fought to victory.',
        inputKind: 'textarea',
        gradingProfile: 'recitation',
        points: 1,
        group: 'army-song-lyrics',
      },
      {
        id: 'army-song-lyrics-3',
        prompt: 'Army Song — lyric block 3',
        answer: "We're the Army and proud of our name! We're the Army and proudly proclaim.",
        inputKind: 'textarea',
        gradingProfile: 'recitation',
        points: 1,
        group: 'army-song-lyrics',
      },
      {
        id: 'army-song-lyrics-4',
        prompt: 'Army Song — lyric block 4',
        answer:
          "First to fight for the right, And to build the Nation's might, And The Army Goes Rolling Along.",
        inputKind: 'textarea',
        gradingProfile: 'recitation',
        points: 1,
        group: 'army-song-lyrics',
      },
      {
        id: 'army-song-lyrics-5',
        prompt: 'Army Song — lyric block 5',
        answer:
          "Proud of all we have done, Fighting till the battle's won, And the Army Goes Rolling Along.",
        inputKind: 'textarea',
        gradingProfile: 'recitation',
        points: 1,
        group: 'army-song-lyrics',
      },
      {
        id: 'army-song-lyrics-6',
        prompt: 'Army Song — lyric block 6',
        answer:
          "Then it's Hi! Hi! Hey! The Army's on its way. Count off the cadence loud and strong.",
        inputKind: 'textarea',
        gradingProfile: 'recitation',
        points: 1,
        group: 'army-song-lyrics',
      },
      {
        id: 'army-song-lyrics-7',
        prompt: 'Army Song — lyric block 7',
        answer:
          "For where e'er we go, you will always know, That The Army Goes Rolling Along.",
        aliases: ["For where'er we go, you will always know, That The Army Goes Rolling Along."],
        inputKind: 'textarea',
        gradingProfile: 'recitation',
        points: 1,
        group: 'army-song-lyrics',
      },
    ],
  },
  {
    id: 'code-of-conduct',
    title: 'Code of Conduct',
    context: [
      {
        id: 'code-of-conduct-introduction',
        text:
          "The Code of Conduct is our guide for how all Soldiers, Sailors, Airmen, Marines, and Coast Guard must conduct themselves if captured by the enemy. The Code of Conduct, in six brief articles, addresses the intense situations and decisions that to some degree, all military services members could encounter. It contains the critical information for U.S. prisoners of war to survive honorably while faithfully resisting the enemy's efforts of exploitation.",
      },
    ],
    fields: [
      {
        id: 'code-of-conduct-article-1',
        prompt: 'Article I',
        answer:
          'I am an American, fighting in the forces which guard my country and our way of life. I am prepared to give my life in their defense.',
        inputKind: 'textarea',
        gradingProfile: 'code-article',
        points: 1,
        acceptedLeadingLabels: ['a.', '1', 'Article I'],
      },
      {
        id: 'code-of-conduct-article-2',
        prompt: 'Article II',
        answer:
          'I will never surrender of my own free will. If in command, I will never surrender the members of my command while they still have the means to resist.',
        inputKind: 'textarea',
        gradingProfile: 'code-article',
        points: 1,
        acceptedLeadingLabels: ['b.', '2', 'Article II'],
      },
      {
        id: 'code-of-conduct-article-3',
        prompt: 'Article III',
        answer:
          'If I am captured, I will continue to resist by all means available. I will make every effort to escape and aid others to escape. I will accept neither parole nor special favors from the enemy.',
        aliases: [
          'If I am captured, I will continue to resist by all means available. I will make every effort to escape and to aid others to escape. I will accept neither parole nor special favors from the enemy.',
        ],
        inputKind: 'textarea',
        gradingProfile: 'code-article',
        points: 1,
        acceptedLeadingLabels: ['c.', '3', 'Article III'],
      },
      {
        id: 'code-of-conduct-article-4',
        prompt: 'Article IV',
        answer:
          'If I become a prisoner of war, I will keep faith with my fellow prisoners. I will give no information or take part in any action which might be harmful to my comrades. If I am senior, I will take command. If not, I will obey the lawful orders of those appointed over me and will back them up in every way.',
        inputKind: 'textarea',
        gradingProfile: 'code-article',
        points: 1,
        acceptedLeadingLabels: ['d.', '4', 'Article IV'],
      },
      {
        id: 'code-of-conduct-article-5',
        prompt: 'Article V',
        answer:
          'When questioned, should I become a prisoner of war, I am required to give name, rank, service number, and date of birth. I will evade answering further questions to the utmost of my ability. I will make no oral or written statements disloyal to my country and its allies or harmful to their cause.',
        inputKind: 'textarea',
        gradingProfile: 'code-article',
        points: 1,
        acceptedLeadingLabels: ['e.', '5', 'Article V'],
      },
      {
        id: 'code-of-conduct-article-6',
        prompt: 'Article VI',
        answer:
          'I will never forget that I am an American, fighting for freedom, responsible for my actions, and dedicated to the principles which made my country free. I will trust in my God and in the United States of America.',
        inputKind: 'textarea',
        gradingProfile: 'code-article',
        points: 1,
        acceptedLeadingLabels: ['f.', '6', 'Article VI'],
      },
    ],
  },
] satisfies readonly GreenBookSectionDefinition[]

export const greenBookSections: readonly GreenBookSection[] = greenBookSectionDefinitions.map(defineSection)
