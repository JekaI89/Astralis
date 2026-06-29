import type { AngelNumber } from '@astralis/types'

const ANGEL_NUMBERS: AngelNumber[] = [
  {
    pattern: '11:11',
    title: 'Портал желаний',
    message: 'Вселенная слышит вас. Ваши мысли прямо сейчас особенно мощны — направьте их на то, чего вы действительно хотите.',
    affirmation: 'Я нахожусь в идеальном месте в нужное время. Мои желания воплощаются.',
  },
  {
    pattern: '22:22',
    title: 'Строитель судьбы',
    message: 'Число мастера-строителя. Вы закладываете фундамент чего-то великого. Будьте внимательны к деталям.',
    affirmation: 'Мои действия создают прочную основу для будущего процветания.',
  },
  {
    pattern: '33:33',
    title: 'Число Учителя',
    message: 'Призыв к состраданию и творчеству. Поделитесь своими дарами с миром.',
    affirmation: 'Я несу свет и вдохновляю других своим примером.',
  },
  {
    pattern: '12:12',
    title: 'Шаг вперёд',
    message: 'Отпустите прошлое. Вы на пороге нового цикла — смело шагайте в него.',
    affirmation: 'Я открыт(а) новым возможностям и доверяю своему пути.',
  },
  {
    pattern: '00:00',
    title: 'Начало бесконечности',
    message: 'Точка нуля — момент чистого потенциала. Всё возможно прямо сейчас.',
    affirmation: 'Я нахожусь в центре бесконечных возможностей.',
  },
]

export function detectAngelNumber(timeString: string): AngelNumber | null {
  return ANGEL_NUMBERS.find((a) => a.pattern === timeString) ?? null
}

export function getAllAngelNumbers(): AngelNumber[] {
  return ANGEL_NUMBERS
}
