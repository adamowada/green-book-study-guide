export type GreenBookSectionId =
  | 'army-values'
  | 'soldiers-creed'
  | 'military-time'
  | 'general-orders'
  | 'special-orders'
  | 'phonetic-alphabet'
  | 'rank-structure'

export type GreenBookField = {
  id: string
  prompt: string
  answer: string
  aliases?: readonly string[]
  referenceText?: string
  imageSrc?: string | null
  visualLabel?: string
  payGrade?: string
  remarks?: string
}

export function getRankPayGradeFieldId(rankFieldId: string): string {
  return `${rankFieldId}:pay-grade`
}

export type GreenBookSection = {
  id: GreenBookSectionId
  title: string
  fields: readonly GreenBookField[]
}

export const greenBookSections = [
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
] as const satisfies readonly GreenBookSection[]
