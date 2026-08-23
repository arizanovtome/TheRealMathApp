import type { SupportedLocale } from '@/i18n/types';
import type { LearnTutorial } from '@/features/learn/learnTopics';
import { buildGeometryFormulaTables } from '@/features/learn/geometryLearnContent';
import { buildMultiplicationFormulaTables } from '@/features/learn/multiplicationLearnContent';

type LearnOverride = Partial<
  Pick<LearnTutorial, 'title' | 'summary' | 'formula' | 'sections' | 'examples'>
> & {
  formulaTables?: LearnTutorial['formulaTables'];
};

export const LEARN_TOPIC_OVERRIDES_MK: Partial<Record<LearnTutorial['id'], LearnOverride>> = {
  addition: {
    title: 'Собирање',
    summary: 'Соединување броеви за да се дознае колку се заедно.',
    sections: [
      {
        heading: 'Што е собирање?',
        body: 'Собирањето значи комбинирање на две количини. Одговорот се вика збир.',
      },
      {
        heading: 'Како да собираме',
        body: 'Почнете со првиот број, па бројете нагоре со вториот. При поголеми броеви порамнете ги цифрите.',
      },
    ],
  },
  subtraction: {
    title: 'Одземање',
    summary: 'Наоѓање разлика кога одземаме.',
    sections: [
      {
        heading: 'Што е одземање?',
        body: 'Одземањето кажува колку останува откако ќе отстраните некоја количина, или колку е еден број поголем од друг.',
      },
    ],
  },
  multiplication: {
    title: 'Множење',
    summary: 'Еднакви групи или повторено собирање.',
    sections: [
      {
        heading: 'Што е множење?',
        body:
          'Множењето е брз начин да го соберете истиот број повеќе пати. 3 × 4 значи три групи по четири. Кога множите, го собирате истиот број неколку пати — на пример, 4 × 3 = 4 + 4 + 4 = 12, а 5 × 2 = 5 + 5 = 10. Множењето е пократок начин за повторено собирање.',
      },
    ],
    examples: [
      { prompt: '4 × 3 = ?', solution: '12 (4 + 4 + 4)' },
      { prompt: '6 × 5 = ?', solution: '30' },
    ],
  },
  division: {
    title: 'Делење',
    summary: 'Поделба на еднакви делови, наоѓање колку групи или делење со остаток.',
    sections: [
      {
        heading: 'Што е делење?',
        body: 'Делењето ја дели вкупната количина на еднакви делови. Одговорот може да биде колку во секоја група или колку групи.',
      },
      {
        heading: 'Количник и остаток',
        body:
          'Понекогаш делењето не излегува нацело. Целобројниот дел е количникот, а она што останува е остатокот. На пример, 17 ÷ 5 = 3 ост. 2 бидејќи 5 × 3 = 15 и 17 − 15 = 2.',
      },
      {
        heading: 'Остаток со негативни броеви',
        body:
          'Остатокот секогаш се запишува како позитивен број. Кога количникот е негативен, остатокот пак е позитивен. На пример, −23 ÷ 5 = −4 ост. 3 бидејќи (−4) × 5 + 3 = −23.',
      },
    ],
    examples: [
      { prompt: '12 ÷ 3 = ?', solution: '4' },
      { prompt: '17 ÷ 5 = ? remainder ?', solution: '3 ост. 2' },
      { prompt: '−23 ÷ 5 = ? remainder ?', solution: '−4 ост. 3' },
    ],
  },
  squaring: {
    title: 'Квадирање',
    summary: 'Број помножен со себе.',
    sections: [{ heading: 'Квадрати', body: 'n² значи n × n. Пример: 5² = 5 × 5 = 25.' }],
    formula: 'n² = n × n',
  },
  square_roots: {
    title: 'Квадратни корени',
    summary: 'Бројот што бил квадриран.',
    sections: [
      {
        heading: 'Квадратни корени',
        body: '√49 прашува: кој број помножен со себе дава 49? Одговорот е 7.',
      },
    ],
    formula: 'Ако n² = a, тогаш √a = n (за целобројни квадрати).',
  },
  rounding: {
    title: 'Заокружување',
    summary: 'Приближување до најблиската десетка, сто или децимала.',
    sections: [
      {
        heading: 'Најблиска десетка',
        body: 'Погледнете ја цифрата на единиците. 5 или повеќе заокружува нагоре; 4 или помалку надолу. 47 → 50.',
      },
    ],
  },
  order_of_operations: {
    title: 'Ред на операции',
    summary: 'Пресметајте ги степените и корените пред множењето, а потоа собирајте.',
    sections: [
      {
        heading: 'Множење пред собирање',
        body: 'Во 3 + 4 × 5, прво множете: 4 × 5 = 20, па додадете 3 за да добиете 23.',
      },
      {
        heading: 'Квадрати и квадратни корени',
        body: 'Прво пресметајте ги квадратите и квадратните корени. Во 3 + 4² × 2, прво пресметајте 4² = 16. Во 3 + √16 × 2, прво пресметајте √16 = 4.',
      },
    ],
    examples: [
      { prompt: '3 + 4 × 5 = ?', solution: '23' },
      { prompt: '3 + 4² × 2 = ?', solution: '35' },
      { prompt: '3 + √16 × 2 = ?', solution: '11' },
    ],
  },
  equivalent_expressions: {
    title: 'Еквивалентни изрази',
    summary: 'Изрази што изгледаат различно, но имаат иста вредност или алгебарско значење.',
    sections: [
      {
        heading: 'Квадрат на бином',
        body: '(a + b)² = a² + 2ab + b² и (a − b)² = a² − 2ab + b². Средниот член се добива затоа што a и b се множат двапати.',
      },
      {
        heading: 'Отстранување загради',
        body: 'Плусот пред заградата ги задржува знаците. Минусот пред заградата го менува секој знак во неа: 100 − (50 + 20) = 100 − 50 − 20, а 100 − (50 − 20) = 100 − 50 + 20.',
      },
      {
        heading: 'Дистрибутивност и факторизација',
        body: 'При дистрибуирање се множи секој член: a(b + c) = ab + ac. Факторизацијата е обратна постапка и го издвојува заедничкиот множител: ab + ac = a(b + c).',
      },
      {
        heading: 'Разлика на квадрати',
        body: 'Разликата на два квадрати се разложува вака: a² − b² = (a + b)(a − b).',
      },
    ],
    examples: [
      { prompt: '(a + b)² = ?', solution: 'a² + 2ab + b²' },
      { prompt: '100 − (50 + 20) = ?', solution: '100 − 50 − 20' },
      { prompt: '3(x + 4) = ?', solution: '3x + 12' },
      { prompt: '6x + 9 = ?', solution: '3(2x + 3)' },
      { prompt: 'a² − b² = ?', solution: '(a + b)(a − b)' },
    ],
  },
  equations_x: {
    title: 'Равенки со x',
    summary: 'Најдете го скриениот број што ја прави равенката точна.',
    sections: [
      {
        heading: 'Една непозната',
        body: 'x е број што го не знаете. x + 3 = 8 значи x = 5.',
      },
    ],
  },
  equations_xy: {
    title: 'Системи на равенки',
    summary: 'Две равенки, една непозната по пат.',
    sections: [
      {
        heading: 'Две променливи',
        body: 'Добивате две равенки со x и y. Користете ги заедно за да најдете една вредност.',
      },
    ],
  },
  geometry: {
    title: 'Геометрија',
    summary: 'Обиколка, плоштина и волумен — формули и пресметки за секоја форма.',
    sections: [
      {
        heading: 'Два типа прашања',
        body: 'Прашањата за формула бараат која формула да се користи. Прашањата за пресметка даваат димензии (1–10) и бараат пресметка.',
      },
      {
        heading: 'Ознаки на дијаграмот',
        body: 'Страните се a, b, c и d (иста буква = еднаква должина). r е радиус, h е висина, а d1 и d2 се дијагоналите на ромб или делтоид.',
      },
    ],
    examples: [
      {
        prompt: 'Обиколка на квадрат со страна 5',
        solution: '4 × 5 = 20',
      },
      {
        prompt: 'Плоштина на круг со радиус 3 (пресметка, π форма)',
        solution: '9π',
      },
    ],
  },
  trigonometry: {
    title: 'Тригонометрија',
    summary: 'Правоаголни триаголници — именување страни и sin, cos, tan.',
    sections: [
      {
        heading: 'Релативно на агол θ',
        body: 'Хипотенузата е најдолгата страна. Спротивната е спротивно од θ. Секачната ја допира θ но не е хипотенуза.',
      },
      {
        heading: 'Изберете формула',
        body: 'Прашањата бараат да изберете кој однос ги поврзува страните — не број.',
      },
      {
        heading: 'SOH-CAH-TOA',
        body: 'Sin користи спротивна и хипотенуза. Cos — секачна и хипотенуза. Tan — спротивна и секачна.',
      },
    ],
  },
  logarithm: {
    title: 'Логаритми',
    summary: 'Обратно на степенување — правила за log, основа 10 и природен log ln со e.',
    sections: [
      {
        heading: 'Што е логаритам?',
        body:
          'Логаритамот одговара: „На која степен треба да ја воздигнеме основата за да го добиеме бројот?“ На пример, log₁₀(100) = 2 бидејќи 10² = 100.',
      },
      {
        heading: 'Бројот e',
        body:
          'e ≈ 2.718… е посебна константа во calculus. Природниот логаритам ln користи основа e. По дефиниција, ln(e) = 1 и ln(eⁿ) = n.',
      },
      {
        heading: 'Правила за log',
        body:
          'Правилата за производ, част и степен ви помагаат да препишете log без калкулатор. Во вежбање може да проширите log(4 × 5) како log 4 + log 5 или да пресметате log₁₀(1000) и ln(e²).',
      },
    ],
    examples: [
      { prompt: 'log(6 × 5) = ?', solution: 'log 6 + log 5' },
      { prompt: 'log₁₀(1000) = ?', solution: '3' },
      { prompt: 'ln(e²) = ?', solution: '2' },
      { prompt: 'log(x⁴) = ?', solution: '4 log x' },
    ],
  },
  fractions: {
    title: 'Дропки',
    summary: 'Делови од целина и пресметки со дропки.',
    sections: [
      {
        heading: 'Делови од целина',
        body: 'Во 3/4, долниот број (4) е колку еднакви делови; горниот (3) е колку се обоени или преброени.',
      },
      {
        heading: 'Собирање дропки',
        body: 'Ист знаменик: соберете ги бројниците. Различен знаменик: прво најдете заеднички.',
      },
    ],
  },
  comparison: {
    title: 'Споредување',
    summary: 'Споредување броеви и изрази со <, > и =.',
    sections: [
      {
        heading: 'Симbolи',
        body: '< значи помало, > поголемо, = еднакво.',
      },
    ],
  },
  clock: {
    title: 'Часовник / време',
    summary: 'Читање аналogni часовници и поминато време.',
    sections: [
      {
        heading: 'Читање на часовник',
        body: 'Кratkata стрелка покажува час. Долгата — минути. Секој број е 5 минути.',
      },
    ],
  },
  shapes: {
    title: 'Препознавање форми',
    summary: 'Препознавање на името и бојата на основните форми.',
    sections: [
      {
        heading: 'Погледнете ја контурата',
        body: 'Кругот е заоблен без агли. Квадратот има четири еднакви страни.',
      },
      {
        heading: 'Препознавање бои',
        body: 'Истата форма може да биде црвена, сина, зелена или жолта. Набљудувајте ја бојата одделно од формата.',
      },
    ],
    examples: [{ prompt: 'Која боја е синиот триаголник?', solution: 'Сина' }],
  },
  numbers: {
    title: 'Броеви',
    summary: 'Разберете редослед на броеви, недостасувачки вредности и парни и непарни броеви.',
    sections: [
      {
        heading: 'Претходник и следбеник',
        body: 'Бројот пред еден помал. Бројот после еден поголем.',
      },
      {
        heading: 'Парни и непарни',
        body: 'Парните броеви можат да се подредат во парови без остаток. Кај непарните останува еден.',
      },
    ],
    examples: [
      { prompt: 'Кој број е по 6?', solution: '7' },
      { prompt: '1, 2, ?, 4', solution: '3' },
      { prompt: 'Дали 8 е парен или непарен?', solution: 'Парен' },
    ],
  },
  patterns: {
    title: 'Шеми и низи',
    summary: 'Најдете го правилото и продолжете.',
    sections: [
      {
        heading: 'Бројни шеми',
        body: 'Барајте што се менува — додавање, множење или прескокнување.',
      },
      {
        heading: 'Шеми со бои и форми',
        body: 'Следете ги и бојата и формата. По црвен круг, син квадрат, црвен круг, син квадрат следува црвен круг.',
      },
    ],
    examples: [{ prompt: 'Црвен круг, син квадрат, црвен круг, син квадрат, ?', solution: 'Црвен круг' }],
  },
  differentiation: {
    title: 'Диференцирање',
    summary: 'Наоѓање на стапка на промена — извод, вклучувајќи ln x, sin/cos и част.',
    sections: [
      {
        heading: 'Што е извод?',
        body: 'Изводот кажува колку брзо нешто се менува. На овој nivo се правила, не графици.',
      },
      {
        heading: 'Природен log',
        body: "Изводот на ln x е 1/x. Пример: (ln x)' = 1/x.",
      },
      {
        heading: 'Тригонометриски функции',
        body: "(sin x)' = cos x и (cos x)' = −sin x.",
      },
      {
        heading: 'Правило za част (делење)',
        body: "Za f(x)/g(x) važi (f/g)' = (f'g − fg') / g². Low d-High minus High d-Low, over Low squared.",
      },
    ],
    formula: "(f/g)' = (f'g − fg') / g²",
    examples: [
      { prompt: "(x²)' = ?", solution: '2x' },
      { prompt: "(ln x)' = ?", solution: '1/x' },
      { prompt: "(sin x)' = ?", solution: 'cos x' },
      { prompt: "(2x/(x + 3))' = ?", solution: '6/(x + 3)²' },
    ],
  },
  integration: {
    title: 'Интегрирање',
    summary: 'Обратно диференцирање — antiderivativ + C, вклучувајќи ln x, sin/cos и част.',
    sections: [
      {
        heading: 'Што е integral?',
        body: 'Интеграцијата е спротивно на диференцирање. Секогаш додаваме + C.',
      },
      {
        heading: 'Интеграл на 1/x',
        body: '∫(1/x) dx = ln|x| + C. На овој nivo честo pišuvame ln x + C za x > 0.',
      },
      {
        heading: 'Тригонометриски функции',
        body: '∫ sin x dx = −cos x + C и ∫ cos x dx = sin x + C.',
      },
      {
        heading: 'Поедnostavи фракции',
        body: 'Integracija nema quotient rule. Koga integrалot e frakcija od stepeni na x, prvo poednostavi, pa power rule.',
      },
    ],
    formula: '∫xⁿ dx = xⁿ⁺¹/(n+1) + C  (n ≠ −1)',
    examples: [
      { prompt: '∫x² dx = ?', solution: 'x³/3 + C' },
      { prompt: '∫(1/x) dx = ?', solution: 'ln x + C' },
      { prompt: '∫ sin x dx = ?', solution: '−cos x + C' },
      { prompt: '∫(x³/x) dx = ?', solution: 'x³/3 + C' },
    ],
  },
};

export function applyLearnLocale(topic: LearnTutorial, locale: SupportedLocale): LearnTutorial {
  const override = locale === 'mk' ? LEARN_TOPIC_OVERRIDES_MK[topic.id] : undefined;
  const merged: LearnTutorial = override
    ? {
        ...topic,
        ...override,
        sections: override.sections ?? topic.sections,
        examples: override.examples ?? topic.examples,
        formulaTables: override.formulaTables ?? topic.formulaTables,
      }
    : topic;

  if (topic.id === 'geometry') {
    return {
      ...merged,
      formulaTables: buildGeometryFormulaTables(locale),
    };
  }

  if (topic.id === 'multiplication') {
    return {
      ...merged,
      formulaTables: buildMultiplicationFormulaTables(locale),
    };
  }

  return merged;
}
