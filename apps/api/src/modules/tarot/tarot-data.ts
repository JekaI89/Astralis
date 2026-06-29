import type { TarotCard } from '@astralis/types'

export const MAJOR_ARCANA: TarotCard[] = [
  {
    id: 0, name: 'The Fool', nameRu: 'Шут', arcana: 'major',
    imageUrl: '/tarot/major/00-fool.webp',
    keywordUpright: ['начало', 'спонтанность', 'вера', 'авантюризм'],
    keywordReversed: ['безрассудство', 'наивность', 'риск'],
    descriptionUpright: 'Новое начало полно потенциала. Доверьтесь своей интуиции и сделайте шаг в неизвестность.',
    descriptionReversed: 'Остановитесь и подумайте. Возможно, вы действуете слишком импульсивно.',
    isReversed: false,
  },
  {
    id: 1, name: 'The Magician', nameRu: 'Маг', arcana: 'major',
    imageUrl: '/tarot/major/01-magician.webp',
    keywordUpright: ['воля', 'мастерство', 'концентрация', 'манифестация'],
    keywordReversed: ['манипуляция', 'нереализованный потенциал'],
    descriptionUpright: 'У вас есть все инструменты для достижения цели. Действуйте с намерением.',
    descriptionReversed: 'Вы используете свои таланты не по назначению или блокируете их.',
    isReversed: false,
  },
  {
    id: 2, name: 'The High Priestess', nameRu: 'Верховная Жрица', arcana: 'major',
    imageUrl: '/tarot/major/02-high-priestess.webp',
    keywordUpright: ['интуиция', 'тайна', 'подсознание', 'мудрость'],
    keywordReversed: ['скрытые повестки', 'игнорирование интуиции'],
    descriptionUpright: 'Прислушайтесь к внутреннему голосу. Ответ уже внутри вас.',
    descriptionReversed: 'Вы игнорируете интуицию или кто-то скрывает от вас важную информацию.',
    isReversed: false,
  },
  {
    id: 21, name: 'The World', nameRu: 'Мир', arcana: 'major',
    imageUrl: '/tarot/major/21-world.webp',
    keywordUpright: ['завершение', 'интеграция', 'успех', 'путешествие'],
    keywordReversed: ['незавершённость', 'задержки'],
    descriptionUpright: 'Вы достигли завершения важного цикла. Празднуйте победу.',
    descriptionReversed: 'Цикл ещё не завершён. Осталось сделать последний шаг.',
    isReversed: false,
  },
]
