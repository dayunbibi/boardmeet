"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import MobileShell from "../../../components/MobileShell";
import { supabase } from "../../../components/lib/supabase";

type MeetupDraft = {
  meetupId?: string;
  meetupName?: string;
  location?: string;
  inviteCode?: string;
};

type MeetupRow = {
  id: string;
  invite_code: string;
  meetup_name: string;
  location: string | null;
  month: string | null;
  candidate_dates: string[];
  time_slots: string[];
  response_deadline: string | null;
  created_at: string;
};

type ResponseRow = {
  id: string;
  meetup_id: string;
  participant_name: string;
  availability: Record<string, string[]>;
  selected_game_ids: string[];
  selected_games: string[];
  submitted_at: string;
  updated_at: string;
};

type MeetupResponse = {
  id: string;
  meetupId: string;
  participantName: string;
  availability: Record<string, string[]>;
  selectedGameIds: string[];
  selectedGames: string[];
  submittedAt: string;
  updatedAt: string;
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

  const [meetup, setMeetup] =
    useState<MeetupRow | null>(null);

  const [responses, setResponses] = useState<
    MeetupResponse[]
  >([]);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] =
    useState(false);
  const [isDeleting, setIsDeleting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const loadResults = useCallback(
    async (showRefreshing = false) => {
      if (showRefreshing) {
        setIsRefreshing(true);
      }

      setErrorMessage("");

      const savedDraft = sessionStorage.getItem(
        "boardmeet-create-draft",
      );

      if (!savedDraft) {
        setErrorMessage(
          "The meetup information could not be found. Create a meetup first.",
        );
        setIsLoaded(true);
        setIsRefreshing(false);
        return;
      }

      let parsedDraft: MeetupDraft;

      try {
        parsedDraft = JSON.parse(
          savedDraft,
        ) as MeetupDraft;
      } catch (error) {
        console.error(
          "Could not read boardmeet-create-draft.",
          error,
        );

        setErrorMessage(
          "The saved meetup information is invalid.",
        );
        setIsLoaded(true);
        setIsRefreshing(false);
        return;
      }

      const inviteCode =
        parsedDraft.inviteCode?.trim();

      if (!inviteCode) {
        setErrorMessage(
          "No invite code was found for this meetup.",
        );
        setIsLoaded(true);
        setIsRefreshing(false);
        return;
      }

      const {
        data: meetupData,
        error: meetupError,
      } = await supabase
        .from("meetups")
        .select(
          `
            id,
            invite_code,
            meetup_name,
            location,
            month,
            candidate_dates,
            time_slots,
            response_deadline,
            created_at
          `,
        )
        .eq("invite_code", inviteCode)
        .maybeSingle<MeetupRow>();

      if (meetupError) {
        console.error(
          "Could not load meetup:",
          meetupError,
        );

        setErrorMessage(
          "The meetup could not be loaded from Supabase.",
        );
        setIsLoaded(true);
        setIsRefreshing(false);
        return;
      }

      if (!meetupData) {
        setErrorMessage(
          "No meetup was found for this invite code.",
        );
        setIsLoaded(true);
        setIsRefreshing(false);
        return;
      }

      setMeetup({
        ...meetupData,
        candidate_dates: Array.isArray(
          meetupData.candidate_dates,
        )
          ? meetupData.candidate_dates
          : [],
        time_slots: Array.isArray(
          meetupData.time_slots,
        )
          ? meetupData.time_slots
          : [],
      });

      const {
        data: responseData,
        error: responseError,
      } = await supabase
        .from("responses")
        .select(
          `
            id,
            meetup_id,
            participant_name,
            availability,
            selected_game_ids,
            selected_games,
            submitted_at,
            updated_at
          `,
        )
        .eq("meetup_id", meetupData.id)
        .order("submitted_at", {
          ascending: false,
        });

      if (responseError) {
        console.error(
          "Could not load responses:",
          responseError,
        );

        setResponses([]);
        setErrorMessage(
          "Participant responses could not be loaded.",
        );
        setIsLoaded(true);
        setIsRefreshing(false);
        return;
      }

      const normalizedResponses = (
        responseData ?? []
      ).map((response: ResponseRow) => ({
        id: response.id,
        meetupId: response.meetup_id,
        participantName:
          response.participant_name,
        availability: isAvailabilityRecord(
          response.availability,
        )
          ? response.availability
          : {},
        selectedGameIds: Array.isArray(
          response.selected_game_ids,
        )
          ? response.selected_game_ids
          : [],
        selectedGames: Array.isArray(
          response.selected_games,
        )
          ? response.selected_games
          : [],
        submittedAt: response.submitted_at,
        updatedAt: response.updated_at,
      }));

      setResponses(normalizedResponses);
      setIsLoaded(true);
      setIsRefreshing(false);
    },
    [],
  );

  useEffect(() => {
    void loadResults();
  }, [loadResults]);

  const slotResults = useMemo<SlotResult[]>(() => {
    const resultMap = new Map<
      string,
      SlotResult
    >();

    responses.forEach((response) => {
      Object.entries(
        response.availability,
      ).forEach(([dateKey, slots]) => {
        if (!Array.isArray(slots)) {
          return;
        }

        slots.forEach((slotId) => {
          const resultKey = `${dateKey}-${slotId}`;
          const existingResult =
            resultMap.get(resultKey);

          if (existingResult) {
            if (
              !existingResult.participants.includes(
                response.participantName,
              )
            ) {
              existingResult.participants.push(
                response.participantName,
              );

              existingResult.count =
                existingResult.participants.length;
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
      });
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
      const uniqueGames = Array.from(
        new Set(
          response.selectedGames
            .map((game) => game.trim())
            .filter(Boolean),
        ),
      );

      uniqueGames.forEach((gameName) => {
        const normalizedName =
          gameName.toLowerCase();

        const existingResult =
          resultMap.get(normalizedName);

        if (existingResult) {
          if (
            !existingResult.participants.includes(
              response.participantName,
            )
          ) {
            existingResult.participants.push(
              response.participantName,
            );

            existingResult.count =
              existingResult.participants.length;
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

        return first.name.localeCompare(
          second.name,
        );
      },
    );
  }, [responses]);

  const bestSlot = slotResults[0];
  const mostPopularGame = gameResults[0];

  async function handleClearResponses() {
    if (!meetup) {
      return;
    }

    const shouldClear = window.confirm(
      "Delete all participant responses for this meetup? This cannot be undone.",
    );

    if (!shouldClear) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage("");

    const { error } = await supabase
      .from("responses")
      .delete()
      .eq("meetup_id", meetup.id);

    if (error) {
      console.error(
        "Could not delete responses:",
        error,
      );

      setErrorMessage(
        "The responses could not be deleted. Check the Supabase delete policy for the responses table.",
      );

      setIsDeleting(false);
      return;
    }

    setResponses([]);
    setIsDeleting(false);
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

            <div className="min-w-0 px-3 text-center">
              <p className="text-xs font-medium text-gray-400">
                Host dashboard
              </p>

              <p className="max-w-[190px] truncate text-sm font-bold text-gray-900">
                {meetup?.meetup_name ??
                  "Board Game Meetup"}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadResults(true)
              }
              disabled={isRefreshing}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm disabled:opacity-60"
              aria-label="Refresh results"
            >
              <span
                className={`material-symbols-rounded text-[21px] ${
                  isRefreshing
                    ? "animate-spin"
                    : ""
                }`}
              >
                refresh
              </span>
            </button>
          </div>
        </header>

        <main className="px-5 pt-6">
          {errorMessage && (
            <section
              className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"
              role="alert"
            >
              <span className="material-symbols-rounded mt-0.5 text-[21px] text-red-600">
                error
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-red-800">
                  Something went wrong
                </p>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  {errorMessage}
                </p>
              </div>
            </section>
          )}

          <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 text-white shadow-xl shadow-violet-200">
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 -left-10 h-36 w-36 rounded-full bg-white/10" />

            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-violet-100">
                Meetup results
              </p>

              <h1 className="mt-3 text-[29px] font-bold leading-tight tracking-tight">
                {meetup?.meetup_name ??
                  "Board Game Meetup"}
              </h1>

              {meetup?.location && (
                <div className="mt-4 flex items-center gap-2 text-sm text-violet-100">
                  <span className="material-symbols-rounded text-[19px]">
                    location_on
                  </span>

                  <span>{meetup.location}</span>
                </div>
              )}

              {meetup?.invite_code && (
                <div className="mt-3 flex items-center gap-2 text-sm text-violet-100">
                  <span className="material-symbols-rounded text-[19px]">
                    password
                  </span>

                  <span className="font-mono font-bold tracking-wider">
                    {meetup.invite_code}
                  </span>
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
                Participant responses will appear
                here after they submit their
                availability and game votes.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/create/share")
                }
                className="mt-5 w-full rounded-2xl bg-violet-600 px-5 py-4 text-sm font-bold text-white transition hover:bg-violet-700 active:scale-[0.99]"
              >
                View Invite
              </button>

              <button
                type="button"
                onClick={() =>
                  void loadResults(true)
                }
                disabled={isRefreshing}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm font-bold text-gray-700 disabled:opacity-60"
              >
                <span
                  className={`material-symbols-rounded text-[20px] ${
                    isRefreshing
                      ? "animate-spin"
                      : ""
                  }`}
                >
                  refresh
                </span>

                Refresh Responses
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

                    <div className="min-w-0">
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
                            {responses.length}{" "}
                            participants available
                          </p>

                          <p className="mt-2 text-xs leading-5 text-green-700">
                            {bestSlot.participants.join(
                              ", ",
                            )}
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

                    <div className="min-w-0">
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

                          <p className="mt-2 text-xs leading-5 text-amber-700">
                            {mostPopularGame.participants.join(
                              ", ",
                            )}
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

                {slotResults.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {slotResults.map(
                      (result, index) => {
                        const percentage =
                          Math.round(
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
                                    {
                                      responses.length
                                    }
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

                                <p className="mt-2 text-xs font-semibold text-violet-600">
                                  {percentage}% available
                                </p>

                                <p className="mt-2 text-xs leading-5 text-gray-400">
                                  {result.participants.join(
                                    ", ",
                                  )}
                                </p>
                              </div>
                            </div>
                          </article>
                        );
                      },
                    )}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-500">
                    No availability was selected.
                  </div>
                )}
              </section>

              <section className="mt-8">
                <p className="text-sm font-bold text-violet-600">
                  Game ranking
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-950">
                  Most popular games
                </h2>

                {gameResults.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {gameResults.map(
                      (game, index) => (
                        <article
                          key={`${game.name}-${index}`}
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
                              {game.participants.join(
                                ", ",
                              )}
                            </p>
                          </div>

                          <span className="rounded-full bg-amber-100 px-3 py-2 text-xs font-bold text-amber-800">
                            {game.count}{" "}
                            {game.count === 1
                              ? "vote"
                              : "votes"}
                          </span>
                        </article>
                      ),
                    )}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-500">
                    No games were selected.
                  </div>
                )}
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
                      )
                        .filter(
                          ([, slots]) =>
                            Array.isArray(slots) &&
                            slots.length > 0,
                        )
                        .sort(([firstDate], [
                          secondDate,
                        ]) =>
                          firstDate.localeCompare(
                            secondDate,
                          ),
                        );

                    return (
                      <article
                        key={response.id}
                        className="overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-sm"
                      >
                        <div className="flex items-center gap-3 border-b border-gray-100 p-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                            <span className="material-symbols-rounded">
                              person
                            </span>
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-gray-950">
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
                                ([
                                  dateKey,
                                  slots,
                                ]) => (
                                  <div key={dateKey}>
                                    <p className="text-sm font-bold text-gray-800">
                                      {formatFullDate(
                                        dateKey,
                                      )}
                                    </p>

                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {slots.map(
                                        (
                                          slotId,
                                          index,
                                        ) => (
                                          <span
                                            key={`${dateKey}-${slotId}-${index}`}
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
                            {response.selectedGames
                              .length > 0 ? (
                              response.selectedGames.map(
                                (game, index) => (
                                  <span
                                    key={`${game}-${index}`}
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
                onClick={() =>
                  void loadResults(true)
                }
                disabled={isRefreshing}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span
                  className={`material-symbols-rounded text-[20px] ${
                    isRefreshing
                      ? "animate-spin"
                      : ""
                  }`}
                >
                  refresh
                </span>

                {isRefreshing
                  ? "Refreshing..."
                  : "Refresh Responses"}
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleClearResponses()
                }
                disabled={isDeleting}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span
                  className={`material-symbols-rounded text-[20px] ${
                    isDeleting
                      ? "animate-spin"
                      : ""
                  }`}
                >
                  {isDeleting
                    ? "progress_activity"
                    : "delete"}
                </span>

                {isDeleting
                  ? "Deleting..."
                  : "Clear All Responses"}
              </button>
            </>
          )}
        </main>
      </div>
    </MobileShell>
  );
}

function isAvailabilityRecord(
  value: unknown,
): value is Record<string, string[]> {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }

  return Object.values(value).every(
    (slots) =>
      Array.isArray(slots) &&
      slots.every(
        (slot) => typeof slot === "string",
      ),
  );
}

function getTimeSlotLabel(slotId: string) {
  return TIME_SLOT_LABELS[slotId] ?? slotId;
}

function formatFullDate(dateKey: string) {
  const [year, month, day] = dateKey
    .split("-")
    .map(Number);

  if (!year || !month || !day) {
    return dateKey;
  }

  const date = new Date(
    year,
    month - 1,
    day,
  );

  if (Number.isNaN(date.getTime())) {
    return dateKey;
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatSubmittedDate(
  dateString: string,
) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}