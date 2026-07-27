"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import MobileShell from "../components/MobileShell";

type MeetupDraft = {
  meetupName?: string;
  inviteCode?: string;
};

export default function JoinMeetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasAutoJoined = useRef(false);

  const [inviteCode, setInviteCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  function handleCodeChange(value: string) {
    const formattedCode = value
      .toUpperCase()
      .replace(/\s/g, "")
      .slice(0, 9);

    setInviteCode(formattedCode);
    setErrorMessage("");
  }

  const handleJoinMeetup = useCallback(
    (code?: string) => {
      const enteredCode = (
        code ?? inviteCode
      )
        .trim()
        .toUpperCase();

      if (!enteredCode) {
        setErrorMessage(
          "Please enter an invite code.",
        );
        return;
      }

      const savedDraft = sessionStorage.getItem(
        "boardmeet-create-draft",
      );

      if (!savedDraft) {
        setErrorMessage(
          "No meetup was found on this device.",
        );
        return;
      }

      try {
        const draft = JSON.parse(
          savedDraft,
        ) as MeetupDraft;

        const savedInviteCode = draft.inviteCode
          ?.trim()
          .toUpperCase();

        if (!savedInviteCode) {
          setErrorMessage(
            "This meetup does not have an invite code.",
          );
          return;
        }

        if (enteredCode !== savedInviteCode) {
          setErrorMessage(
            "That invite code is not correct.",
          );
          return;
        }

        setIsJoining(true);
        setErrorMessage("");

        sessionStorage.setItem(
          "boardmeet-joined-code",
          savedInviteCode,
        );

        sessionStorage.removeItem(
          "boardmeet-participant",
        );

        sessionStorage.removeItem(
          "boardmeet-availability",
        );

        sessionStorage.removeItem(
          "boardmeet-games",
        );

        router.push("/meetup/demo");
      } catch {
        setIsJoining(false);

        setErrorMessage(
          "The saved meetup information could not be read.",
        );
      }
    },
    [inviteCode, router],
  );

  useEffect(() => {
    const codeFromUrl = searchParams
      .get("code")
      ?.trim()
      .toUpperCase();

    if (!codeFromUrl) {
      return;
    }

    if (hasAutoJoined.current) {
      return;
    }

    hasAutoJoined.current = true;

    setInviteCode(codeFromUrl);
    handleJoinMeetup(codeFromUrl);
  }, [searchParams, handleJoinMeetup]);

  return (
    <MobileShell>
      <div className="min-h-screen bg-[#FAF9FF]">
        <header className="flex items-center justify-between px-5 py-5">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm transition active:scale-95"
            aria-label="Go back"
          >
            <span className="material-symbols-rounded">
              arrow_back
            </span>
          </Link>

          <span className="text-sm font-bold text-gray-900">
            BoardMeet
          </span>

          <div className="h-10 w-10" />
        </header>

        <main className="px-6 pb-12 pt-10">
          <section className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-violet-100 text-violet-700">
              <span
                className="material-symbols-rounded text-[50px]"
                style={{
                  fontVariationSettings: "'FILL' 1",
                }}
              >
                group_add
              </span>
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
              Join a meetup
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950">
              Enter your invite code
            </h1>

            <p className="mt-4 max-w-[330px] text-sm leading-6 text-gray-500">
              Ask the host for the code, then enter
              it below to choose your availability
              and vote for games.
            </p>
          </section>

          <section className="mt-10 rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
            <label
              htmlFor="inviteCode"
              className="text-sm font-bold text-gray-900"
            >
              Invite code
            </label>

            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 transition focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-100">
              <span className="material-symbols-rounded text-[23px] text-gray-400">
                password
              </span>

              <input
                id="inviteCode"
                type="text"
                value={inviteCode}
                onChange={(event) =>
                  handleCodeChange(
                    event.target.value,
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !isJoining
                  ) {
                    handleJoinMeetup();
                  }
                }}
                placeholder="BM-ABC123"
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                maxLength={9}
                disabled={isJoining}
                className="min-w-0 flex-1 bg-transparent py-4 font-mono text-lg font-black uppercase tracking-[0.12em] text-gray-950 outline-none placeholder:font-semibold placeholder:tracking-normal placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {errorMessage && (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-3 text-red-700">
                <span className="material-symbols-rounded mt-0.5 text-[18px]">
                  error
                </span>

                <p className="text-sm font-semibold leading-5">
                  {errorMessage}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                handleJoinMeetup()
              }
              disabled={isJoining}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-4 text-base font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isJoining ? (
                <>
                  <span className="material-symbols-rounded animate-spin text-[21px]">
                    progress_activity
                  </span>

                  Joining...
                </>
              ) : (
                <>
                  Join Meetup

                  <span className="material-symbols-rounded text-[21px]">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </section>

          <section className="mt-5 flex items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50 p-4">
            <span className="material-symbols-rounded mt-0.5 text-[21px] text-violet-600">
              info
            </span>

            <div>
              <p className="text-sm font-bold text-violet-900">
                Local development version
              </p>

              <p className="mt-1 text-xs leading-5 text-violet-700">
                For now, this code only works for
                a meetup created in the same browser.
                A database will allow guests on other
                devices to join later.
              </p>
            </div>
          </section>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Want to organize your own game night?
            </p>

            <Link
              href="/create"
              className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-violet-700"
            >
              Create a meetup

              <span className="material-symbols-rounded text-[18px]">
                arrow_forward
              </span>
            </Link>
          </div>
        </main>
      </div>
    </MobileShell>
  );
}