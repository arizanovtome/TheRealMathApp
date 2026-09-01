import type { LearnSection, LearnTopicId } from '@/features/learn/learnTopics';
import type { SupportedLocale } from '@/i18n/types';

export type LearnContext = {
  introduction: LearnSection;
  mathUses: LearnSection;
  realLifeUses: LearnSection;
};

const EN_CONTEXT: Record<LearnTopicId, LearnContext> = {
  shapes: {
    introduction: { heading: 'What are shapes?', body: 'Shapes describe the outline or form of an object. We recognize them by features such as sides, corners, curves, and symmetry.' },
    mathUses: { heading: 'How shapes are used in mathematics', body: 'Shapes are the starting point for geometry. Their properties help us classify figures, find patterns, and later calculate perimeter, area, and volume.' },
    realLifeUses: { heading: 'Where shapes appear in real life', body: 'Shapes appear in road signs, buildings, art, toys, maps, and packaging. Recognizing them helps us describe and organize the world around us.' },
  },
  numbers: {
    introduction: { heading: 'What are numbers?', body: 'Numbers tell us how many, which position, or how much. Their order lets us compare quantities and see what comes before or after.' },
    mathUses: { heading: 'How numbers are used in mathematics', body: 'Numbers are the foundation of counting, arithmetic, measurement, algebra, and data. Odd, even, and missing-number patterns reveal how number systems behave.' },
    realLifeUses: { heading: 'Where numbers appear in real life', body: 'We use numbers for ages, prices, addresses, scores, dates, distances, and quantities—almost whenever we count or measure something.' },
  },
  patterns: {
    introduction: { heading: 'What is a pattern?', body: 'A pattern follows a rule. Once we identify what repeats or changes, we can predict what should come next.' },
    mathUses: { heading: 'How patterns are used in mathematics', body: 'Patterns lead to sequences, multiplication rules, algebra, and functions. They help mathematicians describe regular change with a compact rule.' },
    realLifeUses: { heading: 'Where patterns appear in real life', body: 'Patterns appear in music, calendars, textiles, nature, schedules, and computer instructions. Spotting them helps us predict and plan.' },
  },
  clock: {
    introduction: { heading: 'What does a clock show?', body: 'A clock shows where we are in the day. The hour and minute hands divide the day into measurable intervals.' },
    mathUses: { heading: 'How time is used in mathematics', body: 'Time introduces measurement, units, intervals, addition, subtraction, and fractions of a circle. Elapsed-time questions connect all of these ideas.' },
    realLifeUses: { heading: 'Where time appears in real life', body: 'We use time to follow schedules, catch transport, cook food, plan activities, and work out how long an event lasts.' },
  },
  addition: {
    introduction: { heading: 'What is addition?', body: 'Addition combines quantities to find a total. The numbers being combined are addends, and the result is the sum.' },
    mathUses: { heading: 'How addition is used in mathematics', body: 'Addition supports nearly every later topic, including multiplication, algebra, measurement, statistics, and calculus. It combines separate values into one total.' },
    realLifeUses: { heading: 'Where addition appears in real life', body: 'We add prices while shopping, points in a game, distances on a journey, ingredients in a recipe, and people or objects in groups.' },
  },
  subtraction: {
    introduction: { heading: 'What is subtraction?', body: 'Subtraction finds what remains, the difference between two values, or how far one value is from another.' },
    mathUses: { heading: 'How subtraction is used in mathematics', body: 'Subtraction is the inverse of addition. It is used to compare values, solve equations, find changes, and calculate differences in measurements and data.' },
    realLifeUses: { heading: 'Where subtraction appears in real life', body: 'We subtract to calculate change after paying, remaining time, distance left, score differences, and how much of something has been used.' },
  },
  multiplication: {
    introduction: { heading: 'What is multiplication?', body: 'Multiplication combines equal groups. It is a compact way to represent repeated addition and scaling.' },
    mathUses: { heading: 'How multiplication is used in mathematics', body: 'Multiplication builds area, fractions, ratios, powers, algebra, and probability. It describes how a quantity changes when it is scaled.' },
    realLifeUses: { heading: 'Where multiplication appears in real life', body: 'We multiply when finding the cost of several equal items, arranging rows, scaling recipes, converting units, or calculating an area.' },
  },
  division: {
    introduction: { heading: 'What is division?', body: 'Division separates a quantity into equal groups or finds how many equal groups fit inside it.' },
    mathUses: { heading: 'How division is used in mathematics', body: 'Division is the inverse of multiplication. It creates fractions and ratios, simplifies expressions, and helps solve equations and rates.' },
    realLifeUses: { heading: 'Where division appears in real life', body: 'We divide when sharing fairly, splitting a bill, finding a price per item, calculating speed, or arranging objects into equal groups.' },
  },
  comparison: {
    introduction: { heading: 'What is comparison?', body: 'Comparison tells whether one value is less than, greater than, or equal to another—even when the values are written in different forms.' },
    mathUses: { heading: 'How comparison is used in mathematics', body: 'Comparison orders numbers, checks bounds, interprets inequalities, and helps decide which expression, fraction, measurement, or probability is larger.' },
    realLifeUses: { heading: 'Where comparison appears in real life', body: 'We compare prices, temperatures, distances, scores, discounts, quantities, and measurements to make informed choices.' },
  },
  rounding: {
    introduction: { heading: 'What is rounding?', body: 'Rounding replaces a number with a nearby, simpler value while keeping its approximate size.' },
    mathUses: { heading: 'How rounding is used in mathematics', body: 'Rounding supports estimation, checks whether an answer is reasonable, and communicates measurements at an appropriate level of precision.' },
    realLifeUses: { heading: 'Where rounding appears in real life', body: 'We round prices, travel times, populations, distances, and measurements when an exact value is unnecessary or unavailable.' },
  },
  fractions: {
    introduction: { heading: 'What is a fraction?', body: 'A fraction represents equal parts of a whole or a ratio between quantities. The numerator counts parts; the denominator tells how many equal parts make the whole.' },
    mathUses: { heading: 'How fractions are used in mathematics', body: 'Fractions represent exact division and connect arithmetic to ratios, decimals, percentages, probability, algebra, and calculus.' },
    realLifeUses: { heading: 'Where fractions appear in real life', body: 'Fractions appear in recipes, time, music, measurements, sharing, discounts, and descriptions such as half a tank or three quarters of an hour.' },
  },
  squaring: {
    introduction: { heading: 'What is squaring?', body: 'Squaring a number means multiplying it by itself. The notation n² records that repeated factor.' },
    mathUses: { heading: 'How squares are used in mathematics', body: 'Squares appear in area, the Pythagorean theorem, quadratic equations, distance formulas, statistics, and many algebraic identities.' },
    realLifeUses: { heading: 'Where squares appear in real life', body: 'Squared quantities are used to calculate floor area, compare signal strength and energy, and model how effects change with distance or speed.' },
  },
  square_roots: {
    introduction: { heading: 'What is a square root?', body: 'A square root reverses squaring. √a asks which nonnegative number multiplied by itself equals a.' },
    mathUses: { heading: 'How square roots are used in mathematics', body: 'Square roots solve equations involving squares and appear in geometry, distance formulas, standard deviation, and trigonometry.' },
    realLifeUses: { heading: 'Where square roots appear in real life', body: 'Square roots help recover a side length from an area, calculate straight-line distance, and interpret variation in scientific and statistical data.' },
  },
  geometry: {
    introduction: { heading: 'What is geometry?', body: 'Geometry studies shapes, positions, lengths, angles, areas, and volumes. It turns spatial relationships into quantities we can calculate.' },
    mathUses: { heading: 'How geometry is used in mathematics', body: 'Geometry connects measurement with algebra and trigonometry. Diagrams and formulas help prove relationships and calculate unknown dimensions.' },
    realLifeUses: { heading: 'Where geometry appears in real life', body: 'Geometry is used in architecture, construction, maps, product design, art, manufacturing, landscaping, and estimating materials or space.' },
  },
  order_of_operations: {
    introduction: { heading: 'Why do operations need an order?', body: 'A shared order ensures that everyone evaluates the same expression in the same way, without adding extra instructions.' },
    mathUses: { heading: 'How operation order is used in mathematics', body: 'The order of operations makes arithmetic and algebra unambiguous. It is essential when evaluating formulas, equations, functions, and computer calculations.' },
    realLifeUses: { heading: 'Where operation order appears in real life', body: 'Multi-step formulas for costs, measurements, finance, science, and spreadsheets rely on the correct order to produce the intended result.' },
  },
  equivalent_expressions: {
    introduction: { heading: 'What are equivalent expressions?', body: 'Equivalent expressions may look different but have the same value for every allowed value of their variables.' },
    mathUses: { heading: 'How equivalent expressions are used in mathematics', body: 'Expanding, factoring, and simplifying reveal useful forms of an expression. These skills support equations, functions, calculus, and proofs.' },
    realLifeUses: { heading: 'Where equivalent expressions appear in real life', body: 'Equivalent formulas let us rearrange models for cost, distance, area, or scientific quantities so the needed value is easier to calculate.' },
  },
  equations_xy: {
    introduction: { heading: 'What is a system of equations?', body: 'A system uses two equations that must be true at the same time. Their shared solution gives values for both x and y.' },
    mathUses: { heading: 'How systems are used in mathematics', body: 'Systems find where relationships intersect and solve problems with several unknowns. They lead into coordinate geometry, matrices, and modelling.' },
    realLifeUses: { heading: 'Where systems appear in real life', body: 'Systems can compare pricing plans, mix quantities, balance budgets, find speeds and times, or determine where two changing quantities meet.' },
  },
  advanced_equations: {
    introduction: { heading: 'What are linear and quadratic equations?', body: 'Linear equations have variables to the first power. Quadratic equations include x² and can have two, one, or no real solutions.' },
    mathUses: { heading: 'How these equations are used in mathematics', body: 'Linear equations model constant change, while quadratics model curved relationships. Solving them supports functions, graphs, geometry, and calculus.' },
    realLifeUses: { heading: 'Where these equations appear in real life', body: 'Linear models describe steady costs or motion. Quadratic models appear in projectile paths, area problems, optimisation, and some engineering calculations.' },
  },
  trigonometry: {
    introduction: { heading: 'What is trigonometry?', body: 'Trigonometry relates the angles of a triangle to its side lengths. In right triangles, sine, cosine, and tangent describe these ratios.' },
    mathUses: { heading: 'How trigonometry is used in mathematics', body: 'Trigonometry solves triangles and describes rotation, waves, and repeating behaviour. It connects geometry, algebra, and calculus.' },
    realLifeUses: { heading: 'Where trigonometry appears in real life', body: 'Surveying, navigation, architecture, astronomy, sound, electrical signals, and computer graphics all use angles and trigonometric relationships.' },
  },
  logarithm: {
    introduction: { heading: 'What is a logarithm?', body: 'A logarithm answers which exponent produces a value from a chosen base. It reverses exponentiation.' },
    mathUses: { heading: 'How logarithms are used in mathematics', body: 'Logarithms solve exponential equations, turn multiplication into addition, and support calculus, growth models, and numerical computation.' },
    realLifeUses: { heading: 'Where logarithms appear in real life', body: 'Logarithmic scales describe sound intensity, acidity, earthquake magnitude, information, and growth or decay across very large ranges.' },
  },
  limits: {
    introduction: { heading: 'What is a limit?', body: 'A limit describes the value an expression approaches as its input gets closer to a point or grows without bound.' },
    mathUses: { heading: 'How limits are used in mathematics', body: 'Limits define continuity, derivatives, and integrals. They also describe the long-term behaviour of sequences and functions.' },
    realLifeUses: { heading: 'Where limits appear in real life', body: 'Limits model instantaneous speed, long-term growth, changing physical systems, and totals built from many increasingly small pieces.' },
  },
  differentiation: {
    introduction: { heading: 'What is differentiation?', body: 'Differentiation finds a derivative: the instantaneous rate at which one quantity changes with another.' },
    mathUses: { heading: 'How differentiation is used in mathematics', body: 'Derivatives give slopes, locate turning points, analyse functions, approximate changes, and solve optimisation and motion problems.' },
    realLifeUses: { heading: 'Where differentiation appears in real life', body: 'Differentiation is used for velocity and acceleration, marginal cost, population change, control systems, optimisation, and changing scientific measurements.' },
  },
  integration: {
    introduction: { heading: 'What is integration?', body: 'Integration accumulates many small contributions into a total and reverses differentiation through antiderivatives.' },
    mathUses: { heading: 'How integration is used in mathematics', body: 'Integrals calculate accumulated change, areas, volumes, averages, and totals from rates. They are linked to derivatives by the fundamental theorem of calculus.' },
    realLifeUses: { heading: 'Where integration appears in real life', body: 'Integration finds distance from changing speed, total flow, energy, probability, area or volume, and accumulated quantities in science, engineering, and economics.' },
  },
};

const MK_CONTEXT: Record<LearnTopicId, LearnContext> = {
  shapes: {
    introduction: { heading: 'Што се форми?', body: 'Формите ја опишуваат контурата или обликот на предметот. Ги препознаваме според страните, аглите, кривите линии и симетријата.' },
    mathUses: { heading: 'Како се користат формите во математиката', body: 'Формите се почеток на геометријата. Нивните својства ни помагаат да класифицираме фигури, да наоѓаме шеми и подоцна да пресметуваме периметар, плоштина и волумен.' },
    realLifeUses: { heading: 'Каде се појавуваат формите во реалниот живот', body: 'Форми гледаме на сообраќајни знаци, згради, играчки, мапи, уметнички дела и пакувања. Нивното препознавање ни помага да го опишеме светот околу нас.' },
  },
  numbers: {
    introduction: { heading: 'Што се броеви?', body: 'Броевите кажуваат колку, кое по ред или колкава е некоја количина. Нивниот редослед ни овозможува да споредуваме и да видиме што доаѓа пред или потоа.' },
    mathUses: { heading: 'Како се користат броевите во математиката', body: 'Броевите се основа за броење, аритметика, мерење, алгебра и податоци. Парните, непарните и броевите што недостигаат откриваат како се однесува бројниот систем.' },
    realLifeUses: { heading: 'Каде се појавуваат броевите во реалниот живот', body: 'Броеви користиме за возраст, цени, адреси, резултати, датуми, растојанија и количини—речиси секогаш кога броиме или мериме.' },
  },
  patterns: {
    introduction: { heading: 'Што е шема?', body: 'Шемата следи правило. Кога ќе откриеме што се повторува или менува, можеме да предвидиме што следува.' },
    mathUses: { heading: 'Како се користат шемите во математиката', body: 'Шемите водат кон низи, правила за множење, алгебра и функции. Тие опишуваат правилна промена со кратко правило.' },
    realLifeUses: { heading: 'Каде се појавуваат шемите во реалниот живот', body: 'Шеми има во музиката, календарите, ткаенините, природата, распоредите и компјутерските инструкции. Нивното препознавање помага да предвидуваме и планираме.' },
  },
  clock: {
    introduction: { heading: 'Што покажува часовникот?', body: 'Часовникот покажува каде се наоѓаме во текот на денот. Часовната и минутната стрелка го делат денот на мерливи интервали.' },
    mathUses: { heading: 'Како се користи времето во математиката', body: 'Времето воведува мерење, единици, интервали, собирање, одземање и делови од круг. Задачите со изминато време ги поврзуваат овие идеи.' },
    realLifeUses: { heading: 'Каде се појавува времето во реалниот живот', body: 'Времето го користиме за распоред, превоз, готвење, планирање активности и пресметување колку долго трае некој настан.' },
  },
  addition: {
    introduction: { heading: 'Што е собирање?', body: 'Собирањето соединува количини за да се добие вкупен износ. Броевите што ги собираме се собироци, а резултатот е збир.' },
    mathUses: { heading: 'Како се користи собирањето во математиката', body: 'Собирањето е основа за множење, алгебра, мерење, статистика и анализа. Тоа соединува одделни вредности во една вкупна вредност.' },
    realLifeUses: { heading: 'Каде се појавува собирањето во реалниот живот', body: 'Собираме цени при купување, поени во игра, растојанија, состојки во рецепт и луѓе или предмети во групи.' },
  },
  subtraction: {
    introduction: { heading: 'Што е одземање?', body: 'Одземањето открива колку останува, колкава е разликата меѓу две вредности или колку се оддалечени една од друга.' },
    mathUses: { heading: 'Како се користи одземањето во математиката', body: 'Одземањето е обратна операција на собирањето. Се користи за споредување, решавање равенки и наоѓање промени во мерења и податоци.' },
    realLifeUses: { heading: 'Каде се појавува одземањето во реалниот живот', body: 'Одземаме за да пресметаме кусур, преостанато време или растојание, разлика во резултат и колку од нешто е потрошено.' },
  },
  multiplication: {
    introduction: { heading: 'Што е множење?', body: 'Множењето соединува еднакви групи. Тоа е краток запис за повторено собирање и зголемување во размер.' },
    mathUses: { heading: 'Како се користи множењето во математиката', body: 'Множењето е основа за плоштина, дропки, односи, степени, алгебра и веројатност. Тоа покажува како количината се менува кога ја размеруваме.' },
    realLifeUses: { heading: 'Каде се појавува множењето во реалниот живот', body: 'Множиме при пресметка на цена за повеќе исти предмети, редење во редови, зголемување рецепт, претворање единици или наоѓање плоштина.' },
  },
  division: {
    introduction: { heading: 'Што е делење?', body: 'Делењето раздвојува количина во еднакви групи или открива колку еднакви групи собира во неа.' },
    mathUses: { heading: 'Како се користи делењето во математиката', body: 'Делењето е обратна операција на множењето. Создава дропки и односи, поедноставува изрази и помага при решавање равенки и стапки.' },
    realLifeUses: { heading: 'Каде се појавува делењето во реалниот живот', body: 'Делиме кога распределуваме рамноправно, делиме сметка, наоѓаме цена по производ, пресметуваме брзина или правиме еднакви групи.' },
  },
  comparison: {
    introduction: { heading: 'Што е споредување?', body: 'Споредувањето кажува дали една вредност е помала, поголема или еднаква на друга, дури и кога се запишани во различни форми.' },
    mathUses: { heading: 'Како се користи споредувањето во математиката', body: 'Со споредување подредуваме броеви, толкуваме неравенства и одлучуваме кој израз, дропка, мерка или веројатност е поголем.' },
    realLifeUses: { heading: 'Каде се појавува споредувањето во реалниот живот', body: 'Споредуваме цени, температури, растојанија, резултати, попусти, количини и мерки за да донесеме подобра одлука.' },
  },
  rounding: {
    introduction: { heading: 'Што е заокружување?', body: 'Заокружувањето заменува број со блиска, поедноставна вредност, а приближната големина останува иста.' },
    mathUses: { heading: 'Како се користи заокружувањето во математиката', body: 'Заокружувањето помага при проценка, проверка дали одговорот е разумен и прикажување мерење со соодветна прецизност.' },
    realLifeUses: { heading: 'Каде се појавува заокружувањето во реалниот живот', body: 'Заокружуваме цени, време на патување, население, растојанија и мерења кога точната вредност не е потребна или не е позната.' },
  },
  fractions: {
    introduction: { heading: 'Што е дропка?', body: 'Дропката претставува еднакви делови од целина или однос меѓу количини. Броителот ги брои деловите, а именителот кажува колку еднакви делови ја сочинуваат целината.' },
    mathUses: { heading: 'Како се користат дропките во математиката', body: 'Дропките претставуваат точно делење и ја поврзуваат аритметиката со односи, децимали, проценти, веројатност, алгебра и анализа.' },
    realLifeUses: { heading: 'Каде се појавуваат дропките во реалниот живот', body: 'Дропки има во рецепти, време, музика, мерења, делење, попусти и изрази како половина резервоар или три четвртини час.' },
  },
  squaring: {
    introduction: { heading: 'Што е квадрирање?', body: 'Квадрирање значи бројот да се помножи сам со себе. Ознаката n² го запишува тој повторен множител.' },
    mathUses: { heading: 'Како се користат квадратите во математиката', body: 'Квадратите се појавуваат во плоштина, Питагоровата теорема, квадратни равенки, формули за растојание, статистика и алгебарски идентитети.' },
    realLifeUses: { heading: 'Каде се појавуваат квадратите во реалниот живот', body: 'Квадрирани величини се користат за плоштина, јачина на сигнал и енергија и за моделирање промени поврзани со растојание или брзина.' },
  },
  square_roots: {
    introduction: { heading: 'Што е квадратен корен?', body: 'Квадратниот корен го поништува квадрирањето. √a прашува кој ненегативен број помножен сам со себе дава a.' },
    mathUses: { heading: 'Како се користат квадратните корени во математиката', body: 'Квадратните корени решаваат равенки со квадрати и се појавуваат во геометрија, формули за растојание, стандардна девијација и тригонометрија.' },
    realLifeUses: { heading: 'Каде се појавуваат квадратните корени во реалниот живот', body: 'Квадратните корени помагаат да најдеме страна од плоштина, директно растојание и варијација во научни и статистички податоци.' },
  },
  geometry: {
    introduction: { heading: 'Што е геометрија?', body: 'Геометријата ги проучува формите, положбите, должините, аглите, плоштините и волумените. Просторните односи ги претвора во вредности што можеме да ги пресметаме.' },
    mathUses: { heading: 'Како се користи геометријата во математиката', body: 'Геометријата го поврзува мерењето со алгебра и тригонометрија. Дијаграмите и формулите помагаат да докажеме односи и да најдеме непознати димензии.' },
    realLifeUses: { heading: 'Каде се појавува геометријата во реалниот живот', body: 'Геометријата се користи во архитектура, градежништво, мапи, дизајн, уметност, производство, уредување простор и проценка на материјали.' },
  },
  order_of_operations: {
    introduction: { heading: 'Зошто е потребен редослед?', body: 'Заедничкиот редослед осигурува сите да го пресметаат истиот израз на ист начин, без дополнителни инструкции.' },
    mathUses: { heading: 'Како се користи редоследот на операции во математиката', body: 'Редоследот ги прави аритметиката и алгебрата недвосмислени. Тој е неопходен за формули, равенки, функции и компјутерски пресметки.' },
    realLifeUses: { heading: 'Каде се појавува редоследот на операции во реалниот живот', body: 'Формулите со повеќе чекори за трошоци, мерења, финансии, наука и табеларни пресметки зависат од правилниот редослед.' },
  },
  equivalent_expressions: {
    introduction: { heading: 'Што се еквивалентни изрази?', body: 'Еквивалентните изрази изгледаат различно, но имаат иста вредност за секоја дозволена вредност на променливите.' },
    mathUses: { heading: 'Како се користат еквивалентните изрази во математиката', body: 'Развивањето, факторизацијата и поедноставувањето откриваат корисни форми на изразот и се основа за равенки, функции, анализа и докази.' },
    realLifeUses: { heading: 'Каде се појавуваат еквивалентните изрази во реалниот живот', body: 'Еквивалентните формули овозможуваат модел за цена, растојание, плоштина или научна величина да се пренареди за полесно да се најде потребната вредност.' },
  },
  equations_xy: {
    introduction: { heading: 'Што е систем равенки?', body: 'Системот содржи две равенки што мора да важат истовремено. Заедничкото решение ги дава вредностите на x и y.' },
    mathUses: { heading: 'Како се користат системите во математиката', body: 'Системите наоѓаат каде се сечат односи и решаваат проблеми со повеќе непознати. Тие водат кон координатна геометрија, матрици и моделирање.' },
    realLifeUses: { heading: 'Каде се појавуваат системите во реалниот живот', body: 'Со системи споредуваме ценовни планови, мешаме количини, балансираме буџети, наоѓаме брзини и времиња или точка на средба.' },
  },
  advanced_equations: {
    introduction: { heading: 'Што се линеарни и квадратни равенки?', body: 'Линеарните равенки имаат променлива на прв степен. Квадратните содржат x² и можат да имаат две, едно или ниедно реално решение.' },
    mathUses: { heading: 'Како се користат овие равенки во математиката', body: 'Линеарните равенки моделираат постојана промена, а квадратните криволиниски односи. Нивното решавање е основа за функции, графици, геометрија и анализа.' },
    realLifeUses: { heading: 'Каде се појавуваат овие равенки во реалниот живот', body: 'Линеарните модели опишуваат постојани трошоци или движење. Квадратните се јавуваат кај траектории, плоштина, оптимизација и инженерски пресметки.' },
  },
  trigonometry: {
    introduction: { heading: 'Што е тригонометрија?', body: 'Тригонометријата ги поврзува аглите на триаголникот со должините на страните. Кај правоаголен триаголник, синус, косинус и тангенс ги опишуваат овие односи.' },
    mathUses: { heading: 'Како се користи тригонометријата во математиката', body: 'Тригонометријата решава триаголници и опишува ротација, бранови и периодично однесување. Таа ги поврзува геометријата, алгебрата и анализата.' },
    realLifeUses: { heading: 'Каде се појавува тригонометријата во реалниот живот', body: 'Геодезија, навигација, архитектура, астрономија, звук, електрични сигнали и компјутерска графика користат агли и тригонометриски односи.' },
  },
  logarithm: {
    introduction: { heading: 'Што е логаритам?', body: 'Логаритамот кажува кој степен создава дадена вредност од избрана основа. Тој е обратна операција на степенувањето.' },
    mathUses: { heading: 'Како се користат логаритмите во математиката', body: 'Логаритмите решаваат експоненцијални равенки, го претвораат множењето во собирање и се користат во анализа, модели на раст и нумерички пресметки.' },
    realLifeUses: { heading: 'Каде се појавуваат логаритмите во реалниот живот', body: 'Логаритамски скали опишуваат јачина на звук, киселост, магнитуда на земјотрес, информации и раст или опаѓање во многу голем опсег.' },
  },
  limits: {
    introduction: { heading: 'Што е граница?', body: 'Границата ја опишува вредноста кон која се приближува изразот кога влезната вредност се приближува кон точка или расте без ограничување.' },
    mathUses: { heading: 'Како се користат границите во математиката', body: 'Границите ги дефинираат непрекинатоста, изводите и интегралите. Тие го опишуваат и долгорочното однесување на низи и функции.' },
    realLifeUses: { heading: 'Каде се појавуваат границите во реалниот живот', body: 'Границите моделираат моментална брзина, долгорочен раст, променливи физички системи и вкупни количини составени од сè помали делови.' },
  },
  differentiation: {
    introduction: { heading: 'Што е диференцирање?', body: 'Диференцирањето наоѓа извод: моменталната стапка со која една количина се менува во однос на друга.' },
    mathUses: { heading: 'Како се користи диференцирањето во математиката', body: 'Изводите даваат наклони, наоѓаат пресвртни точки, анализираат функции, приближуваат промени и решаваат проблеми со оптимизација и движење.' },
    realLifeUses: { heading: 'Каде се појавува диференцирањето во реалниот живот', body: 'Диференцирањето се користи за брзина и забрзување, маргинален трошок, промена на население, контролни системи, оптимизација и научни мерења.' },
  },
  integration: {
    introduction: { heading: 'Што е интегрирање?', body: 'Интегрирањето собира многу мали придонеси во вкупна количина и го поништува диференцирањето преку примитивни функции.' },
    mathUses: { heading: 'Како се користи интегрирањето во математиката', body: 'Интегралите пресметуваат акумулирана промена, плоштини, волумени, просеци и вкупни вредности од стапки. Со изводите се поврзани преку основната теорема на анализата.' },
    realLifeUses: { heading: 'Каде се појавува интегрирањето во реалниот живот', body: 'Интегрирањето наоѓа растојание од променлива брзина, вкупен проток, енергија, веројатност, плоштина, волумен и акумулирани количини во науката, инженерството и економијата.' },
  },
};

export function getLearnContext(id: LearnTopicId, locale: SupportedLocale): LearnContext {
  return locale === 'mk' ? MK_CONTEXT[id] : EN_CONTEXT[id];
}
