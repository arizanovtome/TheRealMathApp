import { createContext } from 'react';

export type OperationVisibility = string | ReadonlySet<string> | null;

export const FocusedOperationContext = createContext<OperationVisibility>(null);
