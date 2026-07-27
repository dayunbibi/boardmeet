"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import MobileShell from "../../components/MobileShell";

type ParticipantData = {
  name?: string;
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

export default function MeetupParticipantPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const [meetup, setMeetup] =
    useState<JoinedMeetup | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    const savedParticipant =
      sessionStorage.getItem(
        "boardmeet-participant",
      );

    if (savedParticipant) {
      try {
        const participant = JSON.parse(
          savedParticipant,
        ) as ParticipantData;

        if (participant.name?.trim()) {
          setName(participant.name.trim());
        }
      } catch {
        console.error(
          "Could not read participant data.",
        );
      }
    }

    const savedMeetup =
      sessionStorage.getItem(
        "boardmeet-joined-meetup",
      );

    if (!savedMeetup) {
      setIsLoading(false);
      router.replace("/join");
      return;
    }

    try {
      const parsedMeetup = JSON.parse(
        savedMeetup,
      ) as JoinedMeetup;

      if (
        !parsedMeetup.id ||
        !parsedMeetup.invite_code ||
        !parsedMeetup.meetup_name
      ) {
        sessionStorage.removeItem(
          "boardmeet-joined-meetup",
        );

        sessionStorage.removeItem(
          "boardmeet-joined-code",
        );

        setIsLoading(false);
        router.replace("/join");
        return;
      }

      setMeetup(parsedMeetup);
      setIsLoading(false);
    } catch (error) {
      console.error(
        "Could not read joined meetup data.",
        error,
      );

      sessionStorage.removeItem(
        "boardmeet-joined-meetup",
      );

      sessionStorage.removeItem(
        "boardmeet-joined-code",
      );

      setIsLoading(false);
      router.replace("/join");
    }
  }, [router]);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    if (!meetup) {
      setError(
        "The meetup information could not be found.",
      );
      return;
    }

    sessionStorage.setItem(
      "boardmeet-participant",
      JSON.stringify({
        name: trimmedName,
        meetupId: meetup.id,
        inviteCode: meetup.invite_code,
      }),
    );

    router.push("/meetup/demo/availability");
  }

  if (isLoading) {
    return (
      <MobileShell>
        <div className="flex min-h-screen items-center justify-center bg-[#FAF9FF]">
          <div className="flex flex-col items-center">
            <span className="material-symbols-rounded animate-spin text-[36px] text-violet-600">
              progress_activity
            </span>

            <p className="mt-3 text-sm font-semibold text-gray-500">
              Loading meetup...
            </p>
          </div>
        </div>
      </MobileShell>
    );
  }

  if (!meetup) {
    return null;
  }

  const meetupName = meetup.meetup_name;
  const location =
    meetup.location?.trim() ||
    "Location not set";

  return (
    <MobileShell>
      <div className="flex min-h-screen flex-col bg-[#FAF9FF]">
        <header className="border-b border-gray-100 px-5 py-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push("/join")}
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 active:scale-95"
              aria-label="Go back"
            >
              <span className="material-symbols-rounded">
                arrow_back
              </span>
            </button>

            <div className="min-w-0 px-3 text-center">
              <p className="text-xs font-semibold text-gray-400">
                BoardMeet
              </p>

              <p className="max-w-[220px] truncate text-sm font-bold text-gray-950">
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

        <main className="flex flex-1 flex-col px-5 pb-10 pt-8">
          <section>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <span
                className="material-symbols-rounded text-[30px]"
                style={{
                  fontVariationSettings: "'FILL' 1",
                }}
              >
                waving_hand
              </span>
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
              You&apos;re invited
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950">
              Let&apos;s get your response
            </h1>

            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-500">
              Enter your name so the host knows who
              submitted the availability and game
              votes.
            </p>
          </section>

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-1 flex-col"
          >
            <div>
              <label
                htmlFor="participant-name"
                className="text-sm font-bold text-gray-900"
              >
                Your name
              </label>

              <div
                className={`mt-3 flex items-center rounded-2xl border bg-white px-4 shadow-sm transition ${
                  error
                    ? "border-red-400 ring-4 ring-red-50"
                    : "border-gray-200 focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-100"
                }`}
              >
                <span className="material-symbols-rounded mr-3 text-[23px] text-gray-400">
                  person
                </span>

                <input
                  id="participant-name"
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);

                    if (error) {
                      setError("");
                    }
                  }}
                  placeholder="Enter your name"
                  autoComplete="name"
                  maxLength={40}
                  className="min-w-0 flex-1 bg-transparent py-4 text-base font-medium text-gray-950 outline-none placeholder:text-gray-400"
                />

                {name.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setName("");
                      setError("");
                    }}
                    className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Clear name"
                  >
                    <span className="material-symbols-rounded text-[19px]">
                      cancel
                    </span>
                  </button>
                )}
              </div>

              <div className="mt-2 flex min-h-5 items-start justify-between gap-3">
                {error ? (
                  <p className="flex items-center gap-1 text-xs font-semibold text-red-600">
                    <span className="material-symbols-rounded text-[16px]">
                      error
                    </span>

                    {error}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">
                    This name will be visible to the host.
                  </p>
                )}

                <span className="shrink-0 text-xs text-gray-400">
                  {name.length}/40
                </span>
              </div>
            </div>

            <section className="mt-6 rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <span className="material-symbols-rounded text-[24px]">
                    event
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-950">
                    {meetupName}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Choose when you&apos;re available
                    and vote for the games you want to
                    play.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-gray-50 p-3">
                  <p className="text-xs font-semibold text-gray-400">
                    Meetup
                  </p>

                  <p className="mt-1 truncate text-sm font-bold text-gray-800">
                    {meetupName}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-3">
                  <p className="text-xs font-semibold text-gray-400">
                    Location
                  </p>

                  <p className="mt-1 truncate text-sm font-bold text-gray-800">
                    {location}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-gray-50 p-3">
                  <p className="text-xs font-semibold text-gray-400">
                    Invite code
                  </p>

                  <p className="mt-1 truncate font-mono text-sm font-bold text-gray-800">
                    {meetup.invite_code}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-3">
                  <p className="text-xs font-semibold text-gray-400">
                    Deadline
                  </p>

                  <p className="mt-1 truncate text-sm font-bold text-gray-800">
                    {formatDeadline(
                      meetup.response_deadline,
                    )}
                  </p>
                </div>
              </div>
            </section>

            <div className="mt-auto pt-8">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-4 text-base font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 active:scale-[0.99]"
              >
                Continue

                <span className="material-symbols-rounded text-[21px]">
                  arrow_forward
                </span>
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-gray-400">
                No account required. Your selections
                will be saved while you complete the
                response.
              </p>
            </div>
          </form>
        </main>
      </div>
    </MobileShell>
  );
}

function formatDeadline(
  deadline: string | null,
) {
  if (!deadline) {
    return "Not set";
  }

  const [year, month, day] = deadline
    .split("-")
    .map(Number);

  if (!year || !month || !day) {
    return deadline;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}