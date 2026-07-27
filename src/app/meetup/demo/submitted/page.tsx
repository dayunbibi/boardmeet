"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import MobileShell from "../../../components/MobileShell";
import { supabase } from "../../../components/lib/supabase";

type JoinedMeetup = {
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

type ParticipantData = {
  name?: string;
  meetupId?: string;
  inviteCode?: string;
};

type SubmittedResponseData = {
  id?: string;
  meetupId?: string;
  inviteCode?: string;
  participantName?: string;
  availability?: Record<string, string[]>;
  selectedGameIds?: string[];
  selectedGames?: string[];
  submittedAt?: string;
};

type SupabaseResponseRow = {
  id: string;
  meetup_id: string;
  participant_name: string;
  availability: Record<string, string[]>;
  selected_game_ids: string[];
  selected_games: string[];
  submitted_at: string;
  updated_at: string;
};

type AvailabilityEntry = {
  date: string;
  slots: string[];
};

const TIME_SLOT_LABELS: Record<
  string,
  string
> = {
  "12:00-14:00": "12:00 PM–2:00 PM",
  "14:00-16:00": "2:00 PM–4:00 PM",
  "16:00-18:00": "4:00 PM–6:00 PM",
  "18:00-20:00": "6:00 PM–8:00 PM",
  "20:00-22:00": "8:00 PM–10:00 PM",
};

export default function SubmittedPage() {
  const router = useRouter();

  const [meetup, setMeetup] =
    useState<JoinedMeetup | null>(null);

  const [participantName, setParticipantName] =
    useState("Guest");

  const [availability, setAvailability] =
    useState<Record<string, string[]>>({});

  const [selectedGames, setSelectedGames] =
    useState<string[]>([]);

  const [submittedAt, setSubmittedAt] =
    useState<string | null>(null);

  const [isLoaded, setIsLoaded] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadSubmittedResponse() {
      const savedMeetup =
        sessionStorage.getItem(
          "boardmeet-joined-meetup",
        );

      if (!savedMeetup) {
        setIsLoaded(true);
        router.replace("/join");
        return;
      }

      let parsedMeetup: JoinedMeetup;

      try {
        parsedMeetup = JSON.parse(
          savedMeetup,
        ) as JoinedMeetup;

        if (
          !parsedMeetup.id ||
          !parsedMeetup.invite_code ||
          !parsedMeetup.meetup_name
        ) {
          throw new Error(
            "Invalid meetup information.",
          );
        }

        setMeetup(parsedMeetup);
      } catch (error) {
        console.error(
          "Could not read joined meetup.",
          error,
        );

        setIsLoaded(true);
        router.replace("/join");
        return;
      }

      const savedParticipant =
        sessionStorage.getItem(
          "boardmeet-participant",
        );

      if (!savedParticipant) {
        setIsLoaded(true);
        router.replace("/meetup/demo");
        return;
      }

      let parsedParticipant: ParticipantData;

      try {
        parsedParticipant = JSON.parse(
          savedParticipant,
        ) as ParticipantData;

        if (!parsedParticipant.name?.trim()) {
          throw new Error(
            "Participant name is missing.",
          );
        }

        setParticipantName(
          parsedParticipant.name.trim(),
        );
      } catch (error) {
        console.error(
          "Could not read participant data.",
          error,
        );

        setIsLoaded(true);
        router.replace("/meetup/demo");
        return;
      }

      const savedSubmittedResponse =
        sessionStorage.getItem(
          "boardmeet-submitted-response",
        );

      if (savedSubmittedResponse) {
        try {
          const parsedResponse = JSON.parse(
            savedSubmittedResponse,
          ) as SubmittedResponseData;

          const belongsToCurrentMeetup =
            !parsedResponse.meetupId ||
            parsedResponse.meetupId ===
              parsedMeetup.id;

          const belongsToCurrentParticipant =
            !parsedResponse.participantName ||
            parsedResponse.participantName
              .trim()
              .toLowerCase() ===
              parsedParticipant.name
                .trim()
                .toLowerCase();

          if (
            belongsToCurrentMeetup &&
            belongsToCurrentParticipant
          ) {
            setAvailability(
              parsedResponse.availability ??
                {},
            );

            setSelectedGames(
              Array.isArray(
                parsedResponse.selectedGames,
              )
                ? parsedResponse.selectedGames
                : [],
            );

            setSubmittedAt(
              parsedResponse.submittedAt ??
                null,
            );
          }
        } catch (error) {
          console.error(
            "Could not read submitted response.",
            error,
          );
        }
      }

      const { data, error } = await supabase
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
        .eq("meetup_id", parsedMeetup.id)
        .eq(
          "participant_name",
          parsedParticipant.name.trim(),
        )
        .maybeSingle<SupabaseResponseRow>();

      if (error) {
        console.error(
          "Could not load response from Supabase:",
          error,
        );

        if (!savedSubmittedResponse) {
          setErrorMessage(
            "Your submitted response could not be loaded.",
          );
        }

        setIsLoaded(true);
        return;
      }

      if (data) {
        setAvailability(
          isAvailabilityRecord(
            data.availability,
          )
            ? data.availability
            : {},
        );

        setSelectedGames(
          Array.isArray(data.selected_games)
            ? data.selected_games
            : [],
        );

        setSubmittedAt(
          data.submitted_at,
        );

        sessionStorage.setItem(
          "boardmeet-submitted-response",
          JSON.stringify({
            id: data.id,
            meetupId: data.meetup_id,
            inviteCode:
              parsedMeetup.invite_code,
            participantName:
              data.participant_name,
            availability:
              data.availability,
            selectedGameIds:
              data.selected_game_ids,
            selectedGames:
              data.selected_games,
            submittedAt:
              data.submitted_at,
          }),
        );
      } else if (!savedSubmittedResponse) {
        setErrorMessage(
          "No submitted response was found.",
        );
      }

      setIsLoaded(true);
    }

    void loadSubmittedResponse();
  }, [router]);

  const availabilityEntries =
    useMemo<AvailabilityEntry[]>(() => {
      return Object.entries(availability)
        .filter(
          ([, slots]) =>
            Array.isArray(slots) &&
            slots.length > 0,
        )
        .map(([date, slots]) => ({
          date,
          slots,
        }))
        .sort((a, b) =>
          a.date.localeCompare(b.date),
        );
    }, [availability]);

  const selectedDatesCount =
    availabilityEntries.length;

  const selectedSlotsCount =
    availabilityEntries.reduce(
      (total, entry) =>
        total + entry.slots.length,
      0,
    );

  function handleDone() {
    router.push("/");
  }

  function handleEditAvailability() {
    router.push(
      "/meetup/demo/availability",
    );
  }

  function handleEditGames() {
    router.push("/meetup/demo/games");
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
              Loading your response...
            </p>
          </div>
        </div>
      </MobileShell>
    );
  }

  if (!meetup) {
    return null;
  }

  return (
    <MobileShell>
      <div className="min-h-screen bg-[#FAF9FF] pb-10">
        <header className="border-b border-gray-100 bg-[#FAF9FF]">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="h-10 w-10" />

            <div className="min-w-0 px-3 text-center">
              <p className="text-xs font-medium text-gray-400">
                BoardMeet
              </p>

              <p className="max-w-[220px] truncate text-sm font-bold text-gray-900">
                {meetup.meetup_name}
              </p>
            </div>

            <button
              type="button"
              className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-sm"
            >
              EN
            </button>
          </div>
        </header>

        <main className="px-5 pt-7">
          <section className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600">
                <span
                  className="material-symbols-rounded text-[54px]"
                  style={{
                    fontVariationSettings:
                      "'FILL' 1",
                  }}
                >
                  check_circle
                </span>
              </div>

              <div className="absolute -right-1 -top-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-[#FAF9FF] bg-violet-600 text-white">
                <span className="material-symbols-rounded text-[18px]">
                  celebration
                </span>
              </div>
            </div>

            <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
              Response submitted
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950">
              You&apos;re all set
            </h1>

            <p className="mt-4 max-w-[330px] text-sm leading-6 text-gray-500">
              Thanks, {participantName}. Your
              availability and game votes have
              been saved for the host.
            </p>

            {submittedAt && (
              <p className="mt-3 text-xs font-medium text-gray-400">
                Submitted{" "}
                {formatSubmittedDate(
                  submittedAt,
                )}
              </p>
            )}
          </section>

          {errorMessage && (
            <section
              className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"
              role="alert"
            >
              <span className="material-symbols-rounded mt-0.5 text-[21px] text-red-600">
                error
              </span>

              <div>
                <p className="text-sm font-bold text-red-800">
                  Response unavailable
                </p>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  {errorMessage}
                </p>
              </div>
            </section>
          )}

          <section className="mt-8 overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  <span className="material-symbols-rounded text-[25px]">
                    receipt_long
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Your response
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-gray-950">
                    Submission summary
                  </h2>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                    <span className="material-symbols-rounded text-[26px]">
                      calendar_month
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-950">
                      Availability
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {selectedDatesCount}{" "}
                      {selectedDatesCount === 1
                        ? "date"
                        : "dates"}{" "}
                      and {selectedSlotsCount}{" "}
                      {selectedSlotsCount === 1
                        ? "time slot"
                        : "time slots"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleEditAvailability
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition active:scale-95"
                    aria-label="Edit availability"
                  >
                    <span className="material-symbols-rounded text-[21px]">
                      edit
                    </span>
                  </button>
                </div>

                {availabilityEntries.length >
                0 ? (
                  <div className="mt-4 space-y-3">
                    {availabilityEntries.map(
                      (entry) => (
                        <div
                          key={entry.date}
                          className="rounded-2xl bg-blue-50 p-4"
                        >
                          <p className="text-sm font-bold text-blue-900">
                            {formatFullDate(
                              entry.date,
                            )}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {entry.slots.map(
                              (slot) => (
                                <span
                                  key={`${entry.date}-${slot}`}
                                  className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm"
                                >
                                  {formatTimeSlot(
                                    slot,
                                  )}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">
                    No availability selected
                  </p>
                )}
              </div>

              <div className="flex items-start gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <span className="material-symbols-rounded text-[26px]">
                    casino
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-950">
                    Game votes
                  </p>

                  {selectedGames.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedGames.map(
                        (game, index) => (
                          <span
                            key={`${game}-${index}`}
                            className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800"
                          >
                            {game}
                          </span>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">
                      No games selected
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleEditGames}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition active:scale-95"
                  aria-label="Edit game votes"
                >
                  <span className="material-symbols-rounded text-[21px]">
                    edit
                  </span>
                </button>
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                <span className="material-symbols-rounded text-[27px]">
                  event
                </span>
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Meetup
                </p>

                <h2 className="mt-1 text-base font-bold text-gray-950">
                  {meetup.meetup_name}
                </h2>

                {meetup.location && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                    <span className="material-symbols-rounded text-[18px]">
                      location_on
                    </span>

                    {meetup.location}
                  </p>
                )}

                <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                  <span className="material-symbols-rounded text-[18px]">
                    password
                  </span>

                  <span className="font-mono font-bold">
                    {meetup.invite_code}
                  </span>
                </p>
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-[24px] bg-gradient-to-br from-violet-600 to-indigo-700 p-5 text-white shadow-lg shadow-violet-200">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <span className="material-symbols-rounded text-[27px]">
                  notifications_active
                </span>
              </div>

              <div>
                <h2 className="text-base font-bold">
                  What happens next?
                </h2>

                <p className="mt-2 text-sm leading-6 text-violet-100">
                  The host will review
                  everyone&apos;s availability and
                  game votes, then confirm the final
                  meetup details.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-5 flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4">
            <span className="material-symbols-rounded mt-0.5 text-[21px] text-gray-500">
              info
            </span>

            <p className="text-sm leading-6 text-gray-600">
              You can still update your answers
              using the edit buttons above. Submit
              the games page again to save your
              updated response.
            </p>
          </section>

          <button
            type="button"
            onClick={handleDone}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-4 text-base font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 active:scale-[0.99]"
          >
            Done

            <span className="material-symbols-rounded text-[21px]">
              home
            </span>
          </button>
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

function formatFullDate(dateKey: string) {
  const [year, month, day] = dateKey
    .split("-")
    .map(Number);

  if (!year || !month || !day) {
    return dateKey;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      weekday: "short",
      month: "long",
      day: "numeric",
    },
  ).format(
    new Date(year, month - 1, day),
  );
}

function formatTimeSlot(slot: string) {
  return TIME_SLOT_LABELS[slot] ?? slot;
}

function formatSubmittedDate(
  dateValue: string,
) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(date);
}