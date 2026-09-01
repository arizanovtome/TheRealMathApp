import type { Manifest } from 'expo-updates';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

import { BUILD_INFO, type BuildInfoKind } from '@/constants/buildInfo';

function readString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Reads the EAS update message from the running update manifest when present. */
export function getUpdateMessageFromManifest(manifest: Partial<Manifest> | undefined): string | null {
  if (!manifest) return null;

  const record = manifest as Record<string, unknown>;
  const metadata = record.metadata as Record<string, unknown> | undefined;
  const fromMetadata =
    readString(metadata?.message) ??
    readString(metadata?.commitMessage) ??
    readString(metadata?.updateMessage);
  if (fromMetadata) return fromMetadata;

  const extra = record.extra as Record<string, unknown> | undefined;
  const expoClient = extra?.expoClient as Record<string, unknown> | undefined;
  const clientExtra = expoClient?.extra as Record<string, unknown> | undefined;
  return readString(clientExtra?.message) ?? readString(extra?.message);
}

export type BuildStampInfo = {
  kind: BuildInfoKind;
  stampedAt: string | null;
  label: string | null;
};

export type TesterUpdateInfo = {
  updateId: string | null;
  updateMessage: string | null;
  runtimeVersion: string | null;
  channel: string | null;
  isEmbeddedLaunch: boolean;
  isDevelopment: boolean;
  appVersion: string | null;
  buildStamp: BuildStampInfo;
};

/** Snapshot of the running build for the About / tester info screen. */
export function buildTesterUpdateInfo(): TesterUpdateInfo {
  const manifest = Updates.manifest;
  const isDevelopment = __DEV__ && !Updates.updateId;

  return {
    updateId: Updates.updateId,
    updateMessage: getUpdateMessageFromManifest(manifest),
    runtimeVersion: Updates.runtimeVersion,
    channel: Updates.channel,
    isEmbeddedLaunch: Updates.isEmbeddedLaunch,
    isDevelopment,
    appVersion: Constants.expoConfig?.version ?? null,
    buildStamp: {
      kind: BUILD_INFO.kind,
      stampedAt: BUILD_INFO.stampedAt,
      label: BUILD_INFO.label,
    },
  };
}
