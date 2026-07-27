"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import MobileShell from "../../../components/MobileShell";
import { supabase } from "../../../components/lib/supabase";type Game = {
  id: string;
  name: string;
  description: string;
  icon: string;
  addedBy?: string;
};

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

type AvailabilityData = {
  meetupId?: string;
  inviteCode?: string;
  participantName?: string;
  availability?: Record<string, string[]>;
  updatedAt?: string;
};

type SavedGamesData = {
  meetupId?: string;
  inviteCode?: string;
  games?: Game[];
  selectedGameIds?: string[];
  votes?: string[];
  participantName?: string;
  submittedAt?: string;
};

const DEFAULT_GAMES: Game[] = [
  {
    id: "catan",
    name: "Catan",
    description: "Trade, build, and settle",
    icon: "landscape",
  },
  {
    id: "splendor",
    name: "Splendor",
    description: "Collect gems and build prestige",
    icon: "diamond",
  },
  {
    id: "azul",
    name: "Azul",
    description: "Create a beautiful tile wall",
    icon: "grid_view",
  },
  {
    id: "wingspan",
    name: "Wingspan",
    description: "Build your bird sanctuary",
    icon: "flutter_dash",
  },
];

export default function GamesPage() {
  const router = useRouter();

  const [meetup, setMeetup] =
    useState<JoinedMeetup | null>(null);

  const [participantName, setParticipantName] =
    useState("Guest");

  const [games, setGames] =
    useState<Game[]>(DEFAULT_GAMES);

  const [selectedGameIds, setSelectedGameIds] =
    useState<string[]>([]);

  const [recommendation, setRecommendation] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isLoaded, setIsLoaded] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  useEffect(() => {
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
        "Could not read boardmeet-joined-meetup.",
        error,
      );

      sessionStorage.removeItem(
        "boardmeet-joined-meetup",
      );

      sessionStorage.removeItem(
        "boardmeet-joined-code",
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

      const belongsToCurrentMeetup =
        !parsedParticipant.meetupId ||
        parsedParticipant.meetupId ===
          parsedMeetup.id;

      if (!belongsToCurrentMeetup) {
        sessionStorage.removeItem(
          "boardmeet-participant",
        );

        sessionStorage.removeItem(
          "boardmeet-availability",
        );

        sessionStorage.removeItem(
          "boardmeet-games",
        );

        setIsLoaded(true);
        router.replace("/meetup/demo");
        return;
      }

      setParticipantName(
        parsedParticipant.name.trim(),
      );
    } catch (error) {
      console.error(
        "Could not read boardmeet-participant.",
        error,
      );

      setIsLoaded(true);
      router.replace("/meetup/demo");
      return;
    }

    const savedAvailability =
      sessionStorage.getItem(
        "boardmeet-availability",
      );

    if (!savedAvailability) {
      setIsLoaded(true);

      router.replace(
        "/meetup/demo/availability",
      );

      return;
    }

    try {
      const parsedAvailability =
        JSON.parse(
          savedAvailability,
        ) as AvailabilityData;

      const belongsToCurrentMeetup =
        !parsedAvailability.meetupId ||
        parsedAvailability.meetupId ===
          parsedMeetup.id;

      const hasAvailability =
        parsedAvailability.availability &&
        Object.values(
          parsedAvailability.availability,
        ).some(
          (timeSlots) =>
            Array.isArray(timeSlots) &&
            timeSlots.length > 0,
        );

      if (
        !belongsToCurrentMeetup ||
        !hasAvailability
      ) {
        setIsLoaded(true);

        router.replace(
          "/meetup/demo/availability",
        );

        return;
      }
    } catch (error) {
      console.error(
        "Could not read boardmeet-availability.",
        error,
      );

      setIsLoaded(true);

      router.replace(
        "/meetup/demo/availability",
      );

      return;
    }

    const savedGames =
      sessionStorage.getItem(
        "boardmeet-games",
      );

    if (savedGames) {
      try {
        const parsedGames = JSON.parse(
          savedGames,
        ) as SavedGamesData;

        const belongsToCurrentMeetup =
          !parsedGames.meetupId ||
          parsedGames.meetupId ===
            parsedMeetup.id;

        const belongsToCurrentParticipant =
          !parsedGames.participantName ||
          parsedGames.participantName
            .trim()
            .toLowerCase() ===
            parsedParticipant.name
              .trim()
              .toLowerCase();

        if (
          belongsToCurrentMeetup &&
          belongsToCurrentParticipant
        ) {
          if (
            Array.isArray(
              parsedGames.games,
            ) &&
            parsedGames.games.length > 0
          ) {
            setGames(parsedGames.games);
          }

          if (
            Array.isArray(
              parsedGames.selectedGameIds,
            )
          ) {
            setSelectedGameIds(
              parsedGames.selectedGameIds,
            );
          }
        }
      } catch (error) {
        console.error(
          "Could not read boardmeet-games.",
          error,
        );
      }
    }

    setIsLoaded(true);
  }, [router]);

  function toggleGame(gameId: string) {
    setErrorMessage("");

    setSelectedGameIds((current) =>
      current.includes(gameId)
        ? current.filter(
            (id) => id !== gameId,
          )
        : [...current, gameId],
    );
  }

  function handleAddRecommendation(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleanedName =
      recommendation.trim();

    if (!cleanedName) {
      setErrorMessage(
        "Please enter a game name.",
      );
      return;
    }

    const alreadyExists = games.some(
      (game) =>
        game.name
          .trim()
          .toLowerCase() ===
        cleanedName.toLowerCase(),
    );

    if (alreadyExists) {
      setErrorMessage(
        "This game is already in the suggestion list.",
      );
      return;
    }

    const newGame: Game = {
      id: createGameId(cleanedName),
      name: cleanedName,
      description: `Recommended by ${participantName}`,
      icon: "extension",
      addedBy: participantName,
    };

    setGames((current) => [
      ...current,
      newGame,
    ]);

    setSelectedGameIds((current) => [
      ...current,
      newGame.id,
    ]);

    setRecommendation("");
    setErrorMessage("");
  }

  async function handleSubmit() {
    if (!meetup || isSubmitting) {
      return;
    }

    setErrorMessage("");

    if (selectedGameIds.length === 0) {
      setErrorMessage(
        "Please select at least one game before submitting.",
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    const savedAvailability =
      sessionStorage.getItem(
        "boardmeet-availability",
      );

    if (!savedAvailability) {
      setErrorMessage(
        "Your availability could not be found. Please select your available times again.",
      );

      return;
    }

    let availability: Record<
      string,
      string[]
    > = {};

    try {
      const parsedAvailability =
        JSON.parse(
          savedAvailability,
        ) as AvailabilityData;

      const belongsToCurrentMeetup =
        !parsedAvailability.meetupId ||
        parsedAvailability.meetupId ===
          meetup.id;

      if (
        belongsToCurrentMeetup &&
        parsedAvailability.availability
      ) {
        availability =
          parsedAvailability.availability;
      }
    } catch (error) {
      console.error(
        "Could not read boardmeet-availability.",
        error,
      );
    }

    const hasAvailability = Object.values(
      availability,
    ).some(
      (timeSlots) =>
        Array.isArray(timeSlots) &&
        timeSlots.length > 0,
    );

    if (!hasAvailability) {
      setErrorMessage(
        "Your availability could not be found. Please select your available times again.",
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    const selectedGames = games.filter(
      (game) =>
        selectedGameIds.includes(game.id),
    );

    const selectedGameNames =
      selectedGames.map(
        (game) => game.name,
      );

    const submittedAt =
      new Date().toISOString();

    setIsSubmitting(true);

    const { data, error } = await supabase
      .from("responses")
      .upsert(
        {
          meetup_id: meetup.id,
          participant_name:
            participantName.trim(),
          availability,
          selected_game_ids:
            selectedGameIds,
          selected_games:
            selectedGameNames,
          submitted_at: submittedAt,
          updated_at: submittedAt,
        },
        {
          onConflict:
            "meetup_id,participant_name",
        },
      )
      .select()
      .single();

    if (error) {
      console.error(
        "Supabase response submission failed:",
        error,
      );

      setErrorMessage(
        `Could not submit your response: ${error.message}`,
      );

      setIsSubmitting(false);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    sessionStorage.setItem(
      "boardmeet-games",
      JSON.stringify({
        meetupId: meetup.id,
        inviteCode: meetup.invite_code,
        participantName:
          participantName.trim(),
        games,
        selectedGameIds,
        votes: selectedGameNames,
        responseId: data.id,
        submittedAt,
      }),
    );

    sessionStorage.setItem(
      "boardmeet-submitted-response",
      JSON.stringify({
        id: data.id,
        meetupId: meetup.id,
        inviteCode: meetup.invite_code,
        participantName:
          participantName.trim(),
        availability,
        selectedGameIds,
        selectedGames:
          selectedGameNames,
        submittedAt,
      }),
    );

    router.push(
      "/meetup/demo/submitted",
    );
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
              Loading games...
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
      <div className="min-h-screen bg-[#FAF9FF] pb-32">
        <header className="sticky top-0 z-30 border-b border-gray-100 bg-[#FAF9FF]/95 backdrop-blur">
          <div className="flex items-center justify-between px-5 py-4">
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/meetup/demo/availability",
                )
              }
              disabled={isSubmitting}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-700 shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Go back"
            >
              <span className="material-symbols-rounded">
                arrow_back
              </span>
            </button>

            <div className="min-w-0 px-3 text-center">
              <p className="text-xs font-medium text-gray-400">
                BoardMeet
              </p>

              <p className="max-w-[200px] truncate text-sm font-bold text-gray-900">
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

        <main className="px-5 pt-6">
          <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 text-white shadow-xl shadow-violet-200">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-white/10" />

            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <span className="material-symbols-rounded text-[32px]">
                  casino
                </span>
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.15em] text-violet-100">
                Game voting
              </p>

              <h1 className="mt-2 text-[30px] font-bold leading-tight tracking-tight">
                Choose your games
              </h1>

              <p className="mt-3 max-w-[310px] text-sm leading-6 text-violet-100">
                Vote for every game you would be
                happy to play. You can also
                recommend another game.
              </p>

              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <span className="material-symbols-rounded text-[22px]">
                    person
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs text-violet-100">
                    Voting as
                  </p>

                  <p className="truncate text-sm font-bold">
                    {participantName}
                  </p>
                </div>

                <span className="shrink-0 font-mono text-xs font-bold text-violet-100">
                  {meetup.invite_code}
                </span>
              </div>
            </div>
          </section>

          {errorMessage && (
            <section
              className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"
              role="alert"
            >
              <span className="material-symbols-rounded mt-0.5 text-[21px] text-red-600">
                error
              </span>

              <div className="flex-1">
                <p className="text-sm font-bold text-red-800">
                  Something needs your attention
                </p>

                <p className="mt-1 break-words text-sm leading-5 text-red-700">
                  {errorMessage}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setErrorMessage("")
                }
                className="text-red-500"
                aria-label="Dismiss message"
              >
                <span className="material-symbols-rounded text-[20px]">
                  close
                </span>
              </button>
            </section>
          )}

          <section className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-violet-600">
                  Available games
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-950">
                  What should we play?
                </h2>
              </div>

              <div className="shrink-0 rounded-full bg-violet-100 px-3 py-2 text-xs font-bold text-violet-700">
                {selectedGameIds.length} selected
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Tap a card to select or remove a game
              from your vote.
            </p>
          </section>

          <section className="mt-5 space-y-3">
            {games.map((game) => {
              const selected =
                selectedGameIds.includes(
                  game.id,
                );

              return (
                <button
                  key={game.id}
                  type="button"
                  onClick={() =>
                    toggleGame(game.id)
                  }
                  disabled={isSubmitting}
                  aria-pressed={selected}
                  className={`group flex w-full items-center gap-4 rounded-[24px] border-2 p-4 text-left shadow-sm transition duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
                    selected
                      ? "border-violet-600 bg-violet-50 shadow-violet-100"
                      : "border-gray-100 bg-white hover:border-violet-200"
                  }`}
                >
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition ${
                      selected
                        ? "bg-violet-600 text-white"
                        : "bg-gray-100 text-gray-600 group-hover:bg-violet-100 group-hover:text-violet-700"
                    }`}
                  >
                    <span className="material-symbols-rounded text-[29px]">
                      {game.icon}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`truncate text-base font-bold ${
                          selected
                            ? "text-violet-800"
                            : "text-gray-950"
                        }`}
                      >
                        {game.name}
                      </h3>

                      {game.addedBy && (
                        <span className="rounded-full bg-indigo-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-700">
                          Suggested
                        </span>
                      )}
                    </div>

                    <p
                      className={`mt-1 truncate text-sm ${
                        selected
                          ? "text-violet-600"
                          : "text-gray-500"
                      }`}
                    >
                      {game.description}
                    </p>
                  </div>

                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${
                      selected
                        ? "bg-violet-600 text-white"
                        : "border-2 border-gray-200 bg-white text-transparent"
                    }`}
                  >
                    <span className="material-symbols-rounded text-[18px]">
                      check
                    </span>
                  </div>
                </button>
              );
            })}
          </section>

          <section className="mt-8 rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <span className="material-symbols-rounded text-[27px]">
                  add_reaction
                </span>
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-950">
                  Recommend another game
                </h2>

                <p className="mt-1 text-sm leading-5 text-gray-500">
                  Add a game that is not currently
                  listed. It will automatically be
                  included in your vote.
                </p>
              </div>
            </div>

            <form
              onSubmit={
                handleAddRecommendation
              }
              className="mt-5"
            >
              <label
                htmlFor="game-recommendation"
                className="text-sm font-bold text-gray-800"
              >
                Game name
              </label>

              <div className="mt-2 flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <span className="material-symbols-rounded pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[21px] text-gray-400">
                    extension
                  </span>

                  <input
                    id="game-recommendation"
                    type="text"
                    value={recommendation}
                    disabled={isSubmitting}
                    onChange={(event) => {
                      setRecommendation(
                        event.target.value,
                      );

                      setErrorMessage("");
                    }}
                    placeholder="e.g. Ticket to Ride"
                    maxLength={50}
                    className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-14 shrink-0 items-center justify-center gap-1 rounded-2xl bg-gray-950 px-4 text-sm font-bold text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="material-symbols-rounded text-[20px]">
                    add
                  </span>

                  Add
                </button>
              </div>

              <div className="mt-2 flex justify-end">
                <p className="text-xs text-gray-400">
                  {recommendation.length}/50
                </p>
              </div>
            </form>
          </section>

          <section className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <span className="material-symbols-rounded mt-0.5 text-[21px] text-blue-600">
              info
            </span>

            <p className="text-sm leading-6 text-blue-800">
              You may vote for multiple games. The
              host will see the games ranked by
              total votes.
            </p>
          </section>
        </main>

        <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px] border-t border-gray-100 bg-white/95 px-5 pb-6 pt-4 backdrop-blur">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-4 text-base font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-violet-400"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-rounded animate-spin text-[21px]">
                  progress_activity
                </span>

                Submitting...
              </>
            ) : (
              <>
                Submit Response

                <span className="material-symbols-rounded text-[21px]">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </MobileShell>
  );
}

function createGameId(gameName: string) {
  const normalizedName = gameName
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9가-힣]+/g,
      "-",
    )
    .replace(/^-+|-+$/g, "");

  return `${
    normalizedName || "game"
  }-${Date.now()}`;
}