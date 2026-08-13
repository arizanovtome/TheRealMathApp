import { createContext } from 'react';

import type { MathOperation } from '@/features/learning-plan/learningPlan.types';

export const FocusedOperationContext = createContext<MathOperation | null>(null);
