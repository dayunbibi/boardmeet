"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import MobileShell from "../components/MobileShell";
import { supabase } from "../components/lib/supabase";

type MeetupLookupRow = {
  id: string;
  invite_code: string;
};

export default function ResultsLookupPage() {
  const router = useRouter();

  const [inviteCode, setInviteCode] = useState("");
  const [errorMessage, setErrorMessage] =
    useState("");
  const [isLoading, setIsLoading] =
    useState(false);

  function handleCodeChange(value: string) {
    const formattedCode = value
      .toUpperCase()
      .replace(/\s/g, "")
      .slice(0, 9);

    setInviteCode(formattedCode);
    setErrorMessage("");
  }

  async function handleViewResults() {
    if (isLoading) {
      return;
    }

    const enteredCode = inviteCode
      .trim()
      .toUpperCase();

    if (!enteredCode) {
      setErrorMessage(
        "Please enter an invite code.",
      );
      return;
    }

    if (!/^BM-[A-Z0-9]{6}$/.test(enteredCode)) {
      setErrorMessage(
        "Please enter a valid invite code.",
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase
        .from("meetups")
        .select("id, invite_code")
        .eq("invite_code", enteredCode)
        .maybeSingle<MeetupLookupRow>();

      if (error) {
        console.error(
          "Could not look up meetup:",
          error,
        );

        setErrorMessage(
          "The meetup could not be loaded. Please try again.",
        );
        return;
      }

      if (!data) {
        setErrorMessage(
          "No meetup was found with that invite code.",
        );
        return;
      }

      sessionStorage.setItem(
        "boardmeet-results-code",
        data.invite_code,
      );

      router.push("/meetup/demo/results");
    } catch (error) {
      console.error(
        "Unexpected results lookup error:",
        error,
      );

      setErrorMessage(
        "Something went wrong while loading the results.",
      );
    } finally {
      setIsLoading(false);
    }
  }

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
                  fontVariationSettings:
                    "'FILL' 1",
                }}
              >
                monitoring
              </span>
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
              Host results
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950">
              View meetup results
            </h1>

            <p className="mt-4 max-w-[330px] text-sm leading-6 text-gray-500">
              Enter the meetup invite code to view
              participant availability and game
              voting results.
            </p>
          </section>

          <section className="mt-10 rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
            <label
              htmlFor="resultsInviteCode"
              className="text-sm font-bold text-gray-900"
            >
              Invite code
            </label>

            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 transition focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-100">
              <span className="material-symbols-rounded text-[23px] text-gray-400">
                password
              </span>

              <input
                id="resultsInviteCode"
                type="text"
                value={inviteCode}
                onChange={(event) =>
                  handleCodeChange(event.target.value)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !isLoading
                  ) {
                    void handleViewResults();
                  }
                }}
                placeholder="BM-ABC123"
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                maxLength={9}
                disabled={isLoading}
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
                void handleViewResults()
              }
              disabled={isLoading}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-4 text-base font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-rounded animate-spin text-[21px]">
                    progress_activity
                  </span>

                  Loading Results...
                </>
              ) : (
                <>
                  View Results

                  <span className="material-symbols-rounded text-[21px]">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </section>

          <section className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <span className="material-symbols-rounded mt-0.5 text-[21px] text-amber-600">
              lock_open
            </span>

            <div>
              <p className="text-sm font-bold text-amber-900">
                Temporary host access
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-800">
                Anyone who knows the invite code can
                currently view the results. Host-only
                access will be added with account
                login later.
              </p>
            </div>
          </section>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Need to join as a participant?
            </p>

            <Link
              href="/join"
              className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-violet-700"
            >
              Join a meetup

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