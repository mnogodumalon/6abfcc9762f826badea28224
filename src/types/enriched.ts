import type { Aufenthalte, Hunde, PfotenPortraet } from './app';

export type EnrichedHunde = Hunde & {
  besitzerName: string;
};

export type EnrichedAufenthalte = Aufenthalte & {
  hundName: string;
};

export type EnrichedPfotenPortraet = PfotenPortraet & {
  aufenthaltName: string;
  hundName: string;
};
