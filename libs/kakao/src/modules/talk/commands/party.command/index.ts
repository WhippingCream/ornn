import { PartyCreateCommand } from './party-create.command';
import { PartyExitCommand } from './party-exit.command';
import { PartyJoinCommand } from './party-join.command';
import { PartyPrintListCommand } from './party-print-list.command';
import { PartyUpdateTimeCommand } from './party-update-time.command';

export const PartyCommands = [
  PartyCreateCommand,
  PartyPrintListCommand,
  PartyJoinCommand,
  PartyExitCommand,
  PartyUpdateTimeCommand,
];
