"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import MobileShell from "../../../components/MobileShell";

type MeetupDraft = {
  meetupName?: string;
  location?: string;
  inviteCode?: string;
};

type MeetupResponse = {
  id: string;
  inviteCode: string;
  participantName: string;
  availability: Record<string, string[]>;
  selectedGameIds: string[];
  selectedGames: string[];
  submittedAt: string;
};

type SlotResult = {
  dateKey: string;
  slotId: string;
  count: number;
  participants: string[];
};

type GameResult = {
  name: string;
  count: number;
  participants: string[];
};

const TIME_SLOT_LABELS: Record<string, string> = {
  "12:00-14:00": "12:00 PM–2:00 PM",
  "14:00-16:00": "2:00 PM–4:00 PM",
  "16:00-18:00": "4:00 PM–6:00 PM",
  "18:00-20:00": "6:00 PM–8:00 PM",
  "20:00-22:00": "8:00 PM–10:00 PM",
};

export default function ResultsPage() {
  const router = useRouter();

  const [meetupDraft, setMeetupDraft] =
    useState<MeetupDraft>({});

  const [responses, setResponses] = useState<
    MeetupResponse[]
  >([]);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedDraft = sessionStorage.getItem(
      "boardmeet-create-draft",
    );

    let currentInviteCode = "";

    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(
          savedDraft,
        ) as MeetupDraft;

        setMeetupDraft(parsedDraft);

        currentInviteCode =
          parsedDraft.inviteCode?.trim() ?? "";
      } catch {
        console.error(
          "Could not read boardmeet-create-draft.",
        );
      }
    }

    const savedResponses = sessionStorage.getItem(
      "boardmeet-responses",
    );

    if (savedResponses) {
      try {
        const parsedResponses = JSON.parse(
          savedResponses,
        ) as MeetupResponse[];

        if (Array.isArray(parsedResponses)) {
          const meetupResponses =
            currentInviteCode.length > 0
              ? parsedResponses.filter(
                  (response) =>
                    response.inviteCode ===
                    currentInviteCode,
                )
              : parsedResponses;

          setResponses(meetupResponses);
        }
      } catch {
        console.error(
          "Could not read boardmeet-responses.",
        );
      }
    }

    setIsLoaded(true);
  }, []);

  const slotResults = useMemo<SlotResult[]>(() => {
    const resultMap = new Map<
      string,
      SlotResult
    >();

    responses.forEach((response) => {
      Object.entries(response.availability).forEach(
        ([dateKey, slots]) => {
          slots.forEach((slotId) => {
            const resultKey = `${dateKey}-${slotId}`;

            const existingResult =
              resultMap.get(resultKey);

            if (existingResult) {
              existingResult.count += 1;

              if (
                !existingResult.participants.includes(
                  response.participantName,
                )
              ) {
                existingResult.participants.push(
                  response.participantName,
                );
              }

              return;
            }

            resultMap.set(resultKey, {
              dateKey,
              slotId,
              count: 1,
              participants: [
                response.participantName,
              ],
            });
          });
        },
      );
    });

    return Array.from(resultMap.values()).sort(
      (first, second) => {
        if (second.count !== first.count) {
          return second.count - first.count;
        }

        const firstDateTime = `${first.dateKey}-${first.slotId}`;
        const secondDateTime = `${second.dateKey}-${second.slotId}`;

        return firstDateTime.localeCompare(
          secondDateTime,
        );
      },
    );
  }, [responses]);

  const gameResults = useMemo<GameResult[]>(() => {
    const resultMap = new Map<
      string,
      GameResult
    >();

    responses.forEach((response) => {
      response.selectedGames.forEach((gameName) => {
        const normalizedName = gameName
          .trim()
          .toLowerCase();

        const existingResult =
          resultMap.get(normalizedName);

        if (existingResult) {
          existingResult.count += 1;

          if (
            !existingResult.participants.includes(
              response.participantName,
            )
          ) {
            existingResult.participants.push(
              response.participantName,
            );
          }

          return;
        }

        resultMap.set(normalizedName, {
          name: gameName,
          count: 1,
          participants: [
            response.participantName,
          ],
        });
      });
    });

    return Array.from(resultMap.values()).sort(
      (first, second) => {
        if (second.count !== first.count) {
          return second.count - first.count;
        }

        return first.name.localeCompare(second.name);
      },
    );
  }, [responses]);

  const bestSlot = slotResults[0];
  const mostPopularGame = gameResults[0];

  function handleClearResponses() {
    const shouldClear = window.confirm(
      "Delete all participant responses for this meetup?",
    );

    if (!shouldClear) {
      return;
    }

    const savedResponses = sessionStorage.getItem(
      "boardmeet-responses",
    );

    if (!savedResponses) {
      setResponses([]);
      return;
    }

    try {
      const parsedResponses = JSON.parse(
        savedResponses,
      ) as MeetupResponse[];

      const inviteCode =
        meetupDraft.inviteCode?.trim();

      const remainingResponses = inviteCode
        ? parsedResponses.filter(
            (response) =>
              response.inviteCode !== inviteCode,
          )
        : [];

      sessionStorage.setItem(
        "boardmeet-responses",
        JSON.stringify(remainingResponses),
      );

      setResponses([]);
    } catch {
      console.error(
        "Could not clear boardmeet-responses.",
      );
    }
  }

  if (!isLoaded) {
    return (
      <MobileShell>
        <div className="flex min-h-screen items-center justify-center bg-[#FAF9FF]">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-rounded animate-spin text-4xl text-violet-600">
              progress_activity
            </span>

            <p className="text-sm font-semibold text-gray-500">
              Loading results
            </p>
          </div>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="min-h-screen bg-[#FAF9FF] pb-12">
        <header className="sticky top-0 z-30 border-b border-gray-100 bg-[#FAF9FF]/95 backdrop-blur">
          <div className="flex items-center justify-between px-5 py-4">
            <button
              type="button"
              onClick={() =>
                router.push("/create/share")
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-700 shadow-sm"
              aria-label="Go back"
            >
              <span className="material-symbols-rounded">
                arrow_back
              </span>
            </button>

            <div className="text-center">
              <p className="text-xs font-medium text-gray-400">
                Host dashboard
              </p>

              <p className="max-w-[210px] truncate text-sm font-bold text-gray-900">
                {meetupDraft.meetupName ||
                  "Board Game Meetup"}
              </p>
            </div>

            <button
              type="button"
              className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700"
            >
              EN
            </button>
          </div>
        </header>

        <main className="px-5 pt-6">
          <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 text-white shadow-xl shadow-violet-200">
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 -left-10 h-36 w-36 rounded-full bg-white/10" />

            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-violet-100">
                Meetup results
              </p>

              <h1 className="mt-3 text-[29px] font-bold leading-tight tracking-tight">
                {meetupDraft.meetupName ||
                  "Board Game Meetup"}
              </h1>

              {meetupDraft.location && (
                <div className="mt-4 flex items-center gap-2 text-sm text-violet-100">
                  <span className="material-symbols-rounded text-[19px]">
                    location_on
                  </span>

                  <span>{meetupDraft.location}</span>
                </div>
              )}

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs text-violet-100">
                    Responses
                  </p>

                  <p className="mt-1 text-3xl font-bold">
                    {responses.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs text-violet-100">
                    Game options
                  </p>

                  <p className="mt-1 text-3xl font-bold">
                    {gameResults.length}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {responses.length === 0 ? (
            <section className="mt-6 rounded-[26px] border border-gray-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                <span className="material-symbols-rounded text-[34px]">
                  group
                </span>
              </div>

              <h2 className="mt-5 text-xl font-bold text-gray-950">
                No responses yet
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Participant responses will appear here
                after they submit their availability and
                game votes.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/create/share")
                }
                className="mt-5 w-full rounded-2xl bg-violet-600 px-5 py-4 text-sm font-bold text-white"
              >
                View Invite
              </button>
            </section>
          ) : (
            <>
              <section className="mt-6 grid grid-cols-1 gap-4">
                <article className="rounded-[26px] border border-green-100 bg-green-50 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-600 text-white">
                      <span className="material-symbols-rounded text-[27px]">
                        event_available
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-green-700">
                        Best time
                      </p>

                      {bestSlot ? (
                        <>
                          <h2 className="mt-2 text-lg font-bold text-green-950">
                            {formatFullDate(
                              bestSlot.dateKey,
                            )}
                          </h2>

                          <p className="mt-1 text-sm font-semibold text-green-800">
                            {getTimeSlotLabel(
                              bestSlot.slotId,
                            )}
                          </p>

                          <p className="mt-2 text-sm text-green-700">
                            {bestSlot.count} of{" "}
                            {responses.length} participants
                            available
                          </p>
                        </>
                      ) : (
                        <p className="mt-2 text-sm text-green-800">
                          No availability selected
                        </p>
                      )}
                    </div>
                  </div>
                </article>

                <article className="rounded-[26px] border border-amber-100 bg-amber-50 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white">
                      <span className="material-symbols-rounded text-[27px]">
                        emoji_events
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                        Top game
                      </p>

                      {mostPopularGame ? (
                        <>
                          <h2 className="mt-2 text-lg font-bold text-amber-950">
                            {mostPopularGame.name}
                          </h2>

                          <p className="mt-2 text-sm text-amber-700">
                            {mostPopularGame.count} of{" "}
                            {responses.length} votes
                          </p>
                        </>
                      ) : (
                        <p className="mt-2 text-sm text-amber-800">
                          No games selected
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              </section>

              <section className="mt-8">
                <p className="text-sm font-bold text-violet-600">
                  Availability ranking
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-950">
                  Best meetup times
                </h2>

                <div className="mt-4 space-y-3">
                  {slotResults.map((result, index) => {
                    const percentage = Math.round(
                      (result.count /
                        responses.length) *
                        100,
                    );

                    return (
                      <article
                        key={`${result.dateKey}-${result.slotId}`}
                        className="rounded-[22px] border border-gray-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                            {index + 1}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-bold text-gray-950">
                                  {formatFullDate(
                                    result.dateKey,
                                  )}
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                  {getTimeSlotLabel(
                                    result.slotId,
                                  )}
                                </p>
                              </div>

                              <span className="shrink-0 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-700">
                                {result.count}/
                                {responses.length}
                              </span>
                            </div>

                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-violet-600"
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />
                            </div>

                            <p className="mt-3 text-xs leading-5 text-gray-400">
                              {result.participants.join(
                                ", ",
                              )}
                            </p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className="mt-8">
                <p className="text-sm font-bold text-violet-600">
                  Game ranking
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-950">
                  Most popular games
                </h2>

                <div className="mt-4 space-y-3">
                  {gameResults.map((game, index) => (
                    <article
                      key={game.name}
                      className="flex items-center gap-4 rounded-[22px] border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 font-bold text-amber-700">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-gray-950">
                          {game.name}
                        </p>

                        <p className="mt-1 truncate text-xs text-gray-400">
                          {game.participants.join(", ")}
                        </p>
                      </div>

                      <span className="rounded-full bg-amber-100 px-3 py-2 text-xs font-bold text-amber-800">
                        {game.count}{" "}
                        {game.count === 1
                          ? "vote"
                          : "votes"}
                      </span>
                    </article>
                  ))}
                </div>
              </section>

              <section className="mt-8">
                <p className="text-sm font-bold text-violet-600">
                  Participants
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-950">
                  Individual responses
                </h2>

                <div className="mt-4 space-y-4">
                  {responses.map((response) => {
                    const availabilityEntries =
                      Object.entries(
                        response.availability,
                      ).filter(
                        ([, slots]) =>
                          slots.length > 0,
                      );

                    return (
                      <article
                        key={response.id}
                        className="overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-sm"
                      >
                        <div className="flex items-center gap-3 border-b border-gray-100 p-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                            <span className="material-symbols-rounded">
                              person
                            </span>
                          </div>

                          <div>
                            <p className="text-sm font-bold text-gray-950">
                              {
                                response.participantName
                              }
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              Submitted{" "}
                              {formatSubmittedDate(
                                response.submittedAt,
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                            Availability
                          </p>

                          <div className="mt-3 space-y-3">
                            {availabilityEntries.length >
                            0 ? (
                              availabilityEntries.map(
                                ([dateKey, slots]) => (
                                  <div key={dateKey}>
                                    <p className="text-sm font-bold text-gray-800">
                                      {formatFullDate(
                                        dateKey,
                                      )}
                                    </p>

                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {slots.map(
                                        (slotId) => (
                                          <span
                                            key={
                                              slotId
                                            }
                                            className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                                          >
                                            {getTimeSlotLabel(
                                              slotId,
                                            )}
                                          </span>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                ),
                              )
                            ) : (
                              <p className="text-sm text-gray-500">
                                No availability
                                selected
                              </p>
                            )}
                          </div>

                          <p className="mt-5 text-xs font-bold uppercase tracking-wide text-gray-400">
                            Game votes
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {response.selectedGames.length >
                            0 ? (
                              response.selectedGames.map(
                                (game) => (
                                  <span
                                    key={game}
                                    className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800"
                                  >
                                    {game}
                                  </span>
                                ),
                              )
                            ) : (
                              <p className="text-sm text-gray-500">
                                No games selected
                              </p>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <button
                type="button"
                onClick={handleClearResponses}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700"
              >
                <span className="material-symbols-rounded text-[20px]">
                  delete
                </span>

                Clear Demo Responses
              </button>
            </>
          )}
        </main>
      </div>
    </MobileShell>
  );
}

function getTimeSlotLabel(slotId: string) {
  return TIME_SLOT_LABELS[slotId] ?? slotId;
}

function formatFullDate(dateKey: string) {
  const [year, month, day] = dateKey
    .split("-")
    .map(Number);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
}

function formatSubmittedDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}