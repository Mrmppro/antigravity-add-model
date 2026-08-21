/**
 * The update lifecycle states, as they travel over IPC.
 *
 * These strings are a wire contract, not an implementation detail: the toolkit
 * parses them in `parseStateType`
 * (agent_ui_toolkit/dev/providers/createAppUpdateService.ts) and maps them onto
 * its own `UpdateStateType` enum. A string it does not recognise is silently
 * treated as `Idle` rather than rejected, so a typo here would fail quietly.
 * Spell them once, here.
 *
 * This app only emits a subset today. The rest are listed because they are
 * part of the contract, so nobody has to guess at a spelling to add one.
 */
export const UpdateState = {
  Idle: 'idle',
  Disabled: 'disabled',
  CheckingForUpdates: 'checking for updates',
  AvailableForDownload: 'available for download',
  Downloading: 'downloading',
  Downloaded: 'downloaded',
  Updating: 'updating',
  Ready: 'ready',
} as const;

export type UpdateStateType = (typeof UpdateState)[keyof typeof UpdateState];
