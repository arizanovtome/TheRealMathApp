import type { MathOperation } from '@/features/learning-plan/learningPlan.types';

type Template = (a: number, b: number, result: number) => string;

export const WORD_PROBLEM_TEMPLATES_MK: Partial<Record<MathOperation, Template[]>> = {
  addition: [
    (a, b) => `Мија има ${a} налепници и добива уште ${b}. Колку налепници има сега?`,
    (a, b) => `На дрво има ${a} птици. Уште ${b} слетаa. Колку птици има сегa?`,
    (a, b) => `Сам собра ${a} школки и најде уште ${b} на плажата. Колку школки вкупно?`,
  ],
  subtraction: [
    (a, b) => `Имаше ${a} колачиња. Децата изедо ${b}. Колку колачиња останаa?`,
    (a, b) => `Лео имаше ${a} marbles и подари ${b}. Колку marbles му останаa?`,
    (a, b) => `Автобусот имаше ${a} patnici. ${b} слегоa. Колку patnici останаa?`,
  ],
  multiplication: [
    (a, b) => `Секоја торба има ${b} јаболка. Имате ${a} torbi. Колку јаболка вкупно?`,
    (a, b) => `Има ${a} redovi со ${b} svezdi vo sekoj. Kolku svezdi?`,
    (a, b) => `Пакет има ${b} molivi. Купувате ${a} paketi. Kolku molivi?`,
  ],
  division: [
    (a, b) => `Споделувате ${a} slatkisi megu ${b} prijateli. Kolku dobiva sekoj?`,
    (a, b) => `${a} nalепnici se delat na ${b} ednakvi grupi. Kolku vo sekoja?`,
    (a, b) => `Нastavnikot ima ${a} molivi i gi stava vo ${b} ednakvi kupi. Kolku vo sekoja?`,
  ],
};
