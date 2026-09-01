import raw from './buildInfo.json';

export type BuildInfoKind = 'development' | 'build' | 'update';

export type BuildInfo = {
  kind: BuildInfoKind;
  stampedAt: string | null;
  label: string | null;
};

export const BUILD_INFO: BuildInfo = raw as BuildInfo;
