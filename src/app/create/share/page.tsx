"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MobileShell from "../../components/MobileShell";

type MeetupDraft = {
  meetupName?: string;
  location?: string;
  candidateDates?: string[];
  timeSlots?: string[];
  responseDeadline?: string;
  inviteCode?: string;
};

export default function ShareMeetupPage() {
  const router = useRouter();

  const [meetupName, setMeetupName] = useState(
    "Board Game Meetup",
  );
  const [location, setLocation] = useState(
    "Location not set",
  );
  const [selectedDates, setSelectedDates] = useState<
    string[]
  >([]);
  const [selectedSlots, setSelectedSlots] = useState<
    string[]
  >([]);
  const [inviteUrl, setInviteUrl] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedDraft = sessionStorage.getItem(
      "boardmeet-create-draft",
    );

    if (savedDraft) {
      try {
        const draft = JSON.parse(
          savedDraft,
        ) as MeetupDraft;

        if (draft.meetupName?.trim()) {
          setMeetupName(
            draft.meetupName.trim(),
          );
        }

        if (draft.location?.trim()) {
          setLocation(
            draft.location.trim(),
          );
        }

        if (
          Array.isArray(
            draft.candidateDates,
          )
        ) {
          setSelectedDates(
            draft.candidateDates,
          );
        }

        if (
          Array.isArray(draft.timeSlots)
        ) {
          setSelectedSlots(
            draft.timeSlots,
          );
        }

        if (draft.inviteCode?.trim()) {
          setInviteCode(
            draft.inviteCode
              .trim()
              .toUpperCase(),
          );
        }
      } catch {
        console.error(
          "Could not read meetup draft.",
        );
      }
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!inviteCode) {
      setInviteUrl("");
      return;
    }

    setInviteUrl(
      `${window.location.origin}/join?code=${encodeURIComponent(
        inviteCode,
      )}`,
    );
  }, [inviteCode]);

  async function handleCopyLink() {
    if (!inviteUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        inviteUrl,
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      alert(
        "Could not copy the invite link.",
      );
    }
  }

  async function handleCopyCode() {
    if (!inviteCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        inviteCode,
      );

      setCodeCopied(true);

      window.setTimeout(() => {
        setCodeCopied(false);
      }, 2000);
    } catch {
      alert(
        "Could not copy the invite code.",
      );
    }
  }

  async function handleShare() {
    if (!inviteUrl) {
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: meetupName,
          text: `Join my board game meetup: ${meetupName}`,
          url: inviteUrl,
        });

        return;
      }

      await handleCopyLink();
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      await handleCopyLink();
    }
  }

  function handleEditMeetup() {
    router.push("/create");
  }

  function handleOpenInvite() {
    if (!inviteCode) {
      return;
    }

    router.push(
      `/join?code=${encodeURIComponent(
        inviteCode,
      )}`,
    );
  }

  function handleDashboard() {
    router.push(
      "/meetup/demo/results",
    );
  }

  if (!isLoaded) {
    return (
      <MobileShell>
        <div className="flex min-h-screen items-center justify-center bg-[#FAF9FF]">
          <span className="material-symbols-rounded animate-spin text-4xl text-violet-600">
            progress_activity
          </span>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="min-h-screen bg-[#FAF9FF] pb-10">
        <header className="border-b border-gray-100 px-5 py-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={
                handleEditMeetup
              }
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 active:scale-95"
              aria-label="Go back"
            >
              <span className="material-symbols-rounded">
                arrow_back
              </span>
            </button>

            <div className="text-center">
              <p className="text-xs font-semibold text-gray-400">
                BoardMeet
              </p>

              <p className="text-sm font-bold text-gray-950">
                Meetup created
              </p>
            </div>

            <div className="h-10 w-10" />
          </div>
        </header>

        <main className="px-5 pt-8">
          <section className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                <span
                  className="material-symbols-rounded text-[52px]"
                  style={{
                    fontVariationSettings:
                      "'FILL' 1",
                  }}
                >
                  celebration
                </span>
              </div>

              <div className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full border-4 border-[#FAF9FF] bg-green-500 text-white">
                <span className="material-symbols-rounded text-[21px]">
                  check
                </span>
              </div>
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
              Your meetup is ready
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950">
              Share it with your
              group
            </h1>

            <p className="mt-4 max-w-[340px] text-sm leading-6 text-gray-500">
              Send the invite link or
              code so everyone can
              choose their availability
              and vote for games.
            </p>
          </section>

          <section className="mt-8 rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Meetup
                </p>

                <h2 className="mt-2 truncate text-xl font-bold text-gray-950">
                  {meetupName}
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  handleEditMeetup
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 active:scale-95"
                aria-label="Edit meetup"
              >
                <span className="material-symbols-rounded text-[21px]">
                  edit
                </span>
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <span className="material-symbols-rounded text-[22px]">
                    calendar_month
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-400">
                    Possible dates
                  </p>

                  {selectedDates.length >
                  0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedDates.map(
                        (date) => (
                          <span
                            key={
                              date
                            }
                            className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800"
                          >
                            {formatDate(
                              date,
                            )}
                          </span>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-gray-700">
                      No dates selected
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <span className="material-symbols-rounded text-[22px]">
                    schedule
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-400">
                    Time options
                  </p>

                  {selectedSlots.length >
                  0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedSlots.map(
                        (slot) => (
                          <span
                            key={
                              slot
                            }
                            className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800"
                          >
                            {formatTimeSlot(
                              slot,
                            )}
                          </span>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-gray-700">
                      No time options
                      selected
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                  <span className="material-symbols-rounded text-[22px]">
                    location_on
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400">
                    Location
                  </p>

                  <p className="mt-1 text-sm font-bold text-gray-800">
                    {location}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                <span className="material-symbols-rounded text-[24px]">
                  password
                </span>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Invite code
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-600">
                  Guests can use this
                  code to join
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-4">
              <p className="min-w-0 truncate font-mono text-xl font-black tracking-[0.12em] text-gray-950">
                {inviteCode ||
                  "BM------"}
              </p>

              <button
                type="button"
                onClick={
                  handleCopyCode
                }
                disabled={!inviteCode}
                className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-violet-700 shadow-sm transition hover:bg-violet-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="material-symbols-rounded text-[20px]">
                  {codeCopied
                    ? "check"
                    : "content_copy"}
                </span>

                {codeCopied
                  ? "Copied"
                  : "Copy"}
              </button>
            </div>
          </section>

          <section className="mt-5 rounded-[28px] border border-violet-200 bg-violet-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white">
                <span className="material-symbols-rounded text-[24px]">
                  link
                </span>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-violet-500">
                  Invite link
                </p>

                <p className="mt-1 text-sm font-bold text-violet-950">
                  Anyone with this link
                  can respond
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-violet-200 bg-white p-2">
              <p className="min-w-0 flex-1 truncate px-2 text-sm font-medium text-gray-600">
                {inviteUrl ||
                  "Creating invite link..."}
              </p>

              <button
                type="button"
                onClick={
                  handleCopyLink
                }
                disabled={!inviteUrl}
                className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-100 px-4 text-sm font-bold text-violet-700 transition hover:bg-violet-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="material-symbols-rounded text-[20px]">
                  {copied
                    ? "check"
                    : "content_copy"}
                </span>

                {copied
                  ? "Copied"
                  : "Copy"}
              </button>
            </div>
          </section>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleShare}
              disabled={!inviteUrl}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-4 text-base font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-rounded text-[22px]">
                ios_share
              </span>

              Share invite
            </button>

            <button
              type="button"
              onClick={
                handleOpenInvite
              }
              disabled={!inviteCode}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-base font-bold text-gray-800 transition hover:bg-gray-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-rounded text-[22px]">
                visibility
              </span>

              Preview invite
            </button>

            <button
              type="button"
              onClick={
                handleDashboard
              }
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-violet-200 bg-violet-50 px-5 py-4 text-sm font-bold text-violet-700 transition hover:bg-violet-100 active:scale-[0.99]"
            >
              <span className="material-symbols-rounded text-[21px]">
                monitoring
              </span>

              View responses
            </button>
          </div>

          <section className="mt-6 flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4">
            <span className="material-symbols-rounded mt-0.5 text-[21px] text-gray-500">
              info
            </span>

            <p className="text-sm leading-6 text-gray-600">
              While developing
              locally, the copied link
              uses localhost and only
              works on your computer.
              After deployment, it will
              use your real website
              address automatically.
            </p>
          </section>
        </main>
      </div>
    </MobileShell>
  );
}

function formatDate(
  dateKey: string,
) {
  const [year, month, day] =
    dateKey
      .split("-")
      .map(Number);

  if (!year || !month || !day) {
    return dateKey;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(
    new Date(
      year,
      month - 1,
      day,
    ),
  );
}

function formatTimeSlot(
  slotId: string,
) {
  const slotLabels: Record<
    string,
    string
  > = {
    "12:00-14:00":
      "12:00 PM–2:00 PM",
    "14:00-16:00":
      "2:00 PM–4:00 PM",
    "16:00-18:00":
      "4:00 PM–6:00 PM",
    "18:00-20:00":
      "6:00 PM–8:00 PM",
    "20:00-22:00":
      "8:00 PM–10:00 PM",
  };

  return (
    slotLabels[slotId] ??
    slotId
  );
}