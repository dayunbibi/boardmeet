"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MobileShell from "../../../components/MobileShell";

type ParticipantData = {
  name?: string;
};

type MeetupDraft = {
  meetupName?: string;
};

type AvailabilityData = {
  availability?: Record<string, string[]>;
};

type GamesData = {
  votes?: string[];
};

export default function SubmittedPage() {
  const router = useRouter();

  const [participantName, setParticipantName] =
    useState("Guest");

  const [meetupName, setMeetupName] = useState(
    "Board Game Meetup",
  );

  const [selectedDatesCount, setSelectedDatesCount] =
    useState(0);

  const [selectedSlotsCount, setSelectedSlotsCount] =
    useState(0);

  const [selectedGames, setSelectedGames] = useState<
    string[]
  >([]);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedParticipant = sessionStorage.getItem(
      "boardmeet-participant",
    );

    if (savedParticipant) {
      try {
        const parsedParticipant = JSON.parse(
          savedParticipant,
        ) as ParticipantData;

        if (parsedParticipant.name?.trim()) {
          setParticipantName(parsedParticipant.name.trim());
        }
      } catch {
        console.error(
          "Could not read boardmeet-participant.",
        );
      }
    }

    const savedDraft = sessionStorage.getItem(
      "boardmeet-create-draft",
    );

    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(
          savedDraft,
        ) as MeetupDraft;

        if (parsedDraft.meetupName?.trim()) {
          setMeetupName(parsedDraft.meetupName.trim());
        }
      } catch {
        console.error(
          "Could not read boardmeet-create-draft.",
        );
      }
    }

    const savedAvailability = sessionStorage.getItem(
      "boardmeet-availability",
    );

    if (savedAvailability) {
      try {
        const parsedAvailability = JSON.parse(
          savedAvailability,
        ) as AvailabilityData;

        const availability =
          parsedAvailability.availability ?? {};

        const datesWithSelections = Object.values(
          availability,
        ).filter((slots) => slots.length > 0);

        setSelectedDatesCount(datesWithSelections.length);

        const totalSlots = datesWithSelections.reduce(
          (total, slots) => total + slots.length,
          0,
        );

        setSelectedSlotsCount(totalSlots);
      } catch {
        console.error(
          "Could not read boardmeet-availability.",
        );
      }
    }

    const savedGames = sessionStorage.getItem(
      "boardmeet-games",
    );

    if (savedGames) {
      try {
        const parsedGames = JSON.parse(
          savedGames,
        ) as GamesData;

        if (Array.isArray(parsedGames.votes)) {
          setSelectedGames(parsedGames.votes);
        }
      } catch {
        console.error("Could not read boardmeet-games.");
      }
    }

    setIsLoaded(true);
  }, []);

  function handleDone() {
    router.push("/");
  }

  function handleEditAvailability() {
    router.push("/meetup/demo/availability");
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
              Loading your response
            </p>
          </div>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="min-h-screen bg-[#FAF9FF] pb-10">
        <header className="border-b border-gray-100 bg-[#FAF9FF]">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="h-10 w-10" />

            <div className="text-center">
              <p className="text-xs font-medium text-gray-400">
                BoardMeet
              </p>

              <p className="max-w-[220px] truncate text-sm font-bold text-gray-900">
                {meetupName}
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
                    fontVariationSettings: "'FILL' 1",
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
              Thanks, {participantName}. Your availability and
              game votes have been saved for the host.
            </p>
          </section>

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
              <div className="flex items-center gap-4 p-5">
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
                  onClick={handleEditAvailability}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition active:scale-95"
                  aria-label="Edit availability"
                >
                  <span className="material-symbols-rounded text-[21px]">
                    edit
                  </span>
                </button>
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
                      {selectedGames.map((game) => (
                        <span
                          key={game}
                          className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800"
                        >
                          {game}
                        </span>
                      ))}
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
                  The host will review everyone&apos;s
                  availability and game votes, then confirm the
                  final meetup details.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-5 flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4">
            <span className="material-symbols-rounded mt-0.5 text-[21px] text-gray-500">
              info
            </span>

            <p className="text-sm leading-6 text-gray-600">
              You can still update your answers using the edit
              buttons above before the host confirms the meetup.
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