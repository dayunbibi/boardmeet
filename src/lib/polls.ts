import type { Poll, PollOption, Vote } from "@prisma/client";

export type PollWithVotes = Poll & {
  options: (PollOption & { votes: Vote[] })[];
};

export function isPollClosed(poll: Poll): boolean {
  if (poll.isClosed) return true;
  if (poll.deadline && poll.deadline.getTime() < Date.now()) return true;
  return false;
}

export type OptionResult = {
  id: string;
  label: string;
  order: number;
  count: number;
  voterNames: string[];
  percentage: number;
  isWinner: boolean;
};

export function getParticipantCount(poll: PollWithVotes): number {
  const tokens = new Set(poll.options.flatMap((o) => o.votes.map((v) => v.deviceToken)));
  return tokens.size;
}

export function getOptionResults(poll: PollWithVotes): OptionResult[] {
  const totalParticipants = getParticipantCount(poll);
  const results = poll.options.map((o) => ({
    id: o.id,
    label: o.label,
    order: o.order,
    count: o.votes.length,
    voterNames: o.votes.map((v) => v.voterName),
  }));
  const maxCount = Math.max(0, ...results.map((r) => r.count));

  return results.map((r) => ({
    ...r,
    percentage:
      totalParticipants > 0 ? Math.round((r.count / totalParticipants) * 100) : 0,
    isWinner: maxCount > 0 && r.count === maxCount,
  }));
}

export type Participant = {
  key: string;
  name: string;
  optionLabels: string[];
};

export function getParticipants(poll: PollWithVotes): Participant[] {
  const byToken = new Map<string, Participant>();
  for (const option of poll.options) {
    for (const vote of option.votes) {
      const existing = byToken.get(vote.deviceToken);
      if (existing) {
        existing.optionLabels.push(option.label);
      } else {
        byToken.set(vote.deviceToken, {
          key: vote.deviceToken,
          name: vote.voterName,
          optionLabels: [option.label],
        });
      }
    }
  }
  return Array.from(byToken.values());
}
