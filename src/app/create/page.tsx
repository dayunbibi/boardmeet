"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import MobileShell from "../components/MobileShell";
import { supabase } from "../components/lib/supabase";
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const TIME_SLOTS = [
  {
    id: "12:00-14:00",
    label: "12:00 PM–2:00 PM",
  },
  {
    id: "14:00-16:00",
    label: "2:00 PM–4:00 PM",
  },
  {
    id: "16:00-18:00",
    label: "4:00 PM–6:00 PM",
  },
  {
    id: "18:00-20:00",
    label: "6:00 PM–8:00 PM",
  },
  {
    id: "20:00-22:00",
    label: "8:00 PM–10:00 PM",
  },
];

type MeetupDraft = {
  meetupId: string;
  meetupName: string;
  location: string;
  month: string;
  candidateDates: string[];
  timeSlots: string[];
  responseDeadline: string;
  inviteCode: string;
  updatedAt: string;
};

export default function CreateMeetupPage() {
  const router = useRouter();
  const today = new Date();

  const [meetupName, setMeetupName] = useState("");
  const [location, setLocation] = useState("");

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const year = today.getFullYear();
    const month = String(
      today.getMonth() + 1,
    ).padStart(2, "0");

    return `${year}-${month}`;
  });

  const [selectedDates, setSelectedDates] = useState<
    string[]
  >([]);

  const [selectedSlots, setSelectedSlots] = useState<
    string[]
  >(TIME_SLOTS.map((slot) => slot.id));

  const [responseDeadline, setResponseDeadline] =
    useState("");

  const [isCreating, setIsCreating] = useState(false);

  const calendarDays = useMemo(
    () => buildCalendarDays(selectedMonth),
    [selectedMonth],
  );

  const monthTitle = useMemo(() => {
    const [year, month] = selectedMonth
      .split("-")
      .map(Number);

    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(new Date(year, month - 1, 1));
  }, [selectedMonth]);

  function changeMonth(amount: number) {
    const [year, month] = selectedMonth
      .split("-")
      .map(Number);

    const newDate = new Date(
      year,
      month - 1 + amount,
      1,
    );

    const newYear = newDate.getFullYear();

    const newMonth = String(
      newDate.getMonth() + 1,
    ).padStart(2, "0");

    setSelectedMonth(`${newYear}-${newMonth}`);
  }

  function toggleDate(dateKey: string) {
    setSelectedDates((current) => {
      if (current.includes(dateKey)) {
        return current.filter(
          (date) => date !== dateKey,
        );
      }

      if (current.length >= 10) {
        alert(
          "You can select up to 10 candidate dates.",
        );

        return current;
      }

      return [...current, dateKey].sort();
    });
  }

  function toggleSlot(slotId: string) {
    setSelectedSlots((current) =>
      current.includes(slotId)
        ? current.filter(
            (item) => item !== slotId,
          )
        : [...current, slotId],
    );
  }

  async function handleCreateMeetup() {
    if (isCreating) {
      return;
    }

    if (!meetupName.trim()) {
      alert("Please enter a meetup name.");
      return;
    }

    if (!location.trim()) {
      alert("Please enter a location.");
      return;
    }

    if (selectedDates.length < 2) {
      alert(
        "Please select at least two candidate dates.",
      );
      return;
    }

    if (selectedSlots.length === 0) {
      alert(
        "Please select at least one time slot.",
      );
      return;
    }

    if (!responseDeadline) {
      alert(
        "Please choose a response deadline.",
      );
      return;
    }

    const deadline = new Date(
      `${responseDeadline}T23:59:59`,
    );

    if (deadline < new Date()) {
      alert(
        "The response deadline cannot be in the past.",
      );
      return;
    }

    setIsCreating(true);

    const inviteCode = generateInviteCode();

    try {
      const { data, error } = await supabase
        .from("meetups")
        .insert({
          invite_code: inviteCode,
          meetup_name: meetupName.trim(),
          location: location.trim(),
          month: selectedMonth,
          candidate_dates: selectedDates,
          time_slots: selectedSlots,
          response_deadline: responseDeadline,
        })
        .select("id")
        .single();

      if (error) {
        console.error(
          "Supabase create meetup error:",
          error,
        );

        alert(
          `Could not create the meetup.\n\n${error.message}`,
        );

        return;
      }

      if (!data?.id) {
        alert(
          "The meetup was created, but its ID could not be found.",
        );

        return;
      }

      const meetupDraft: MeetupDraft = {
        meetupId: data.id,
        meetupName: meetupName.trim(),
        location: location.trim(),
        month: selectedMonth,
        candidateDates: selectedDates,
        timeSlots: selectedSlots,
        responseDeadline,
        inviteCode,
        updatedAt: new Date().toISOString(),
      };

      sessionStorage.setItem(
        "boardmeet-create-draft",
        JSON.stringify(meetupDraft),
      );

      router.push("/create/share");
    } catch (error) {
      console.error(
        "Unexpected create meetup error:",
        error,
      );

      alert(
        "Something went wrong while creating the meetup.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <MobileShell>
      <div className="min-h-screen bg-[#FAF9FF]">
        <header className="flex items-center justify-between px-5 py-5">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm"
            aria-label="Go back"
          >
            <span className="material-symbols-rounded">
              arrow_back
            </span>
          </Link>

          <span className="text-sm font-bold text-gray-900">
            BoardMeet
          </span>

          <button
            type="button"
            className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700"
          >
            EN
          </button>
        </header>

        <section className="px-6 pb-32 pt-5">
          <p className="text-sm font-bold text-violet-600">
            Host Setup
          </p>

          <h1 className="mt-2 text-[32px] font-bold leading-tight tracking-tight text-gray-950">
            Let&apos;s plan your
            <br />
            next game night.
          </h1>

          <p className="mt-4 text-base leading-7 text-gray-600">
            Choose the location, dates, and time slots
            your group can vote on.
          </p>

          <div className="mt-10 space-y-7">
            {/* Meetup name */}
            <div>
              <label
                htmlFor="meetupName"
                className="mb-2 block text-sm font-bold text-gray-900"
              >
                Meetup name
              </label>

              <input
                id="meetupName"
                type="text"
                value={meetupName}
                onChange={(event) =>
                  setMeetupName(event.target.value)
                }
                placeholder="August Board Game Night"
                maxLength={60}
                disabled={isCreating}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <div className="mt-2 flex justify-end">
                <span className="text-xs text-gray-400">
                  {meetupName.length}/60
                </span>
              </div>
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-bold text-gray-900"
              >
                Location
              </label>

              <div className="flex items-center rounded-2xl border border-gray-200 bg-white px-4 transition focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-100">
                <span className="material-symbols-rounded mr-3 text-[23px] text-gray-400">
                  location_on
                </span>

                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  placeholder="Downtown Toronto"
                  maxLength={80}
                  disabled={isCreating}
                  className="min-w-0 flex-1 bg-transparent py-4 text-base text-gray-950 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
                />

                {location.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setLocation("")}
                    disabled={isCreating}
                    className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Clear location"
                  >
                    <span className="material-symbols-rounded text-[19px]">
                      cancel
                    </span>
                  </button>
                )}
              </div>

              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-xs text-gray-400">
                  Enter a venue, neighborhood, or address.
                </p>

                <span className="shrink-0 text-xs text-gray-400">
                  {location.length}/80
                </span>
              </div>
            </div>

            {/* Candidate dates */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    Candidate dates
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Select 2–10 dates
                  </p>
                </div>

                <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-600">
                  {selectedDates.length}/10
                </span>
              </div>

              <div className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => changeMonth(-1)}
                    disabled={isCreating}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-700 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Previous month"
                  >
                    <span className="material-symbols-rounded">
                      chevron_left
                    </span>
                  </button>

                  <h2 className="font-bold text-gray-950">
                    {monthTitle}
                  </h2>

                  <button
                    type="button"
                    onClick={() => changeMonth(1)}
                    disabled={isCreating}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-700 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Next month"
                  >
                    <span className="material-symbols-rounded">
                      chevron_right
                    </span>
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-7 text-center text-xs font-semibold text-gray-400">
                  {WEEKDAYS.map((day, index) => (
                    <span key={`${day}-${index}`}>
                      {day}
                    </span>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-7 gap-y-2 text-center text-sm">
                  {calendarDays.map((calendarDay) => {
                    if (!calendarDay.dateKey) {
                      return (
                        <div
                          key={calendarDay.key}
                          className="h-10"
                        />
                      );
                    }

                    const isSelected =
                      selectedDates.includes(
                        calendarDay.dateKey,
                      );

                    return (
                      <button
                        key={calendarDay.key}
                        type="button"
                        disabled={isCreating}
                        onClick={() => {
                          if (calendarDay.dateKey) {
                            toggleDate(
                              calendarDay.dateKey,
                            );
                          }
                        }}
                        className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          isSelected
                            ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                            : "text-gray-800 hover:bg-violet-50"
                        }`}
                      >
                        {calendarDay.day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedDates.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedDates.map((dateKey) => (
                    <button
                      key={dateKey}
                      type="button"
                      disabled={isCreating}
                      onClick={() =>
                        toggleDate(dateKey)
                      }
                      className="flex items-center gap-1 rounded-full bg-violet-100 px-3 py-2 text-xs font-bold text-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {formatDate(dateKey)}

                      <span className="material-symbols-rounded text-[15px]">
                        close
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Time slots */}
            <div>
              <div className="mb-3">
                <p className="text-sm font-bold text-gray-900">
                  Time slots
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-400">
                  Guests can select multiple available
                  slots for each date.
                </p>
              </div>

              <div className="space-y-3">
                {TIME_SLOTS.map((slot) => {
                  const selected =
                    selectedSlots.includes(slot.id);

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={isCreating}
                      onClick={() =>
                        toggleSlot(slot.id)
                      }
                      className={`flex w-full items-center justify-between rounded-2xl border-2 px-4 py-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        selected
                          ? "border-violet-600 bg-violet-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <span
                        className={`font-semibold ${
                          selected
                            ? "text-violet-700"
                            : "text-gray-800"
                        }`}
                      >
                        {slot.label}
                      </span>

                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                          selected
                            ? "bg-violet-600 text-white"
                            : "border border-gray-300 text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label
                htmlFor="deadline"
                className="mb-2 block text-sm font-bold text-gray-900"
              >
                Response deadline
              </label>

              <input
                id="deadline"
                type="date"
                value={responseDeadline}
                min={toDateInputValue(today)}
                disabled={isCreating}
                onChange={(event) =>
                  setResponseDeadline(
                    event.target.value,
                  )
                }
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-gray-700 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <p className="mt-2 text-xs leading-5 text-gray-400">
                Guests can update their response until
                this deadline.
              </p>
            </div>

            {/* Edit notice */}
            <div className="flex gap-3 rounded-2xl border border-violet-100 bg-violet-50 p-4">
              <span className="material-symbols-rounded text-violet-600">
                edit_calendar
              </span>

              <div>
                <p className="text-sm font-bold text-violet-900">
                  You can edit this meetup later
                </p>

                <p className="mt-1 text-xs leading-5 text-violet-700">
                  The host management page will let
                  you update dates, time slots, games,
                  and the response deadline.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom button */}
        <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-[430px] border-t border-gray-100 bg-white/95 px-5 pb-6 pt-4 backdrop-blur">
          <button
            type="button"
            onClick={handleCreateMeetup}
            disabled={isCreating}
            className="flex w-full items-center justify-center rounded-2xl bg-violet-600 px-5 py-4 text-base font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreating
              ? "Creating Meetup..."
              : "Create Meetup"}

            <span
              className={`material-symbols-rounded ml-2 text-[20px] ${
                isCreating ? "animate-spin" : ""
              }`}
            >
              {isCreating
                ? "progress_activity"
                : "arrow_forward"}
            </span>
          </button>
        </div>
      </div>
    </MobileShell>
  );
}

function buildCalendarDays(monthKey: string) {
  const [year, month] = monthKey
    .split("-")
    .map(Number);

  const monthIndex = month - 1;

  const firstWeekday = new Date(
    year,
    monthIndex,
    1,
  ).getDay();

  const totalDays = new Date(
    year,
    monthIndex + 1,
    0,
  ).getDate();

  const days: {
    key: string;
    day: number | null;
    dateKey: string | null;
  }[] = [];

  for (
    let index = 0;
    index < firstWeekday;
    index += 1
  ) {
    days.push({
      key: `empty-${index}`,
      day: null,
      dateKey: null,
    });
  }

  for (
    let day = 1;
    day <= totalDays;
    day += 1
  ) {
    const dayString = String(day).padStart(
      2,
      "0",
    );

    const dateKey = `${monthKey}-${dayString}`;

    days.push({
      key: dateKey,
      day,
      dateKey,
    });
  }

  return days;
}

function formatDate(dateKey: string) {
  const [year, month, day] = dateKey
    .split("-")
    .map(Number);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(date.getDate()).padStart(
    2,
    "0",
  );

  return `${year}-${month}-${day}`;
}

function generateInviteCode() {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (
    let index = 0;
    index < 6;
    index += 1
  ) {
    const randomIndex = Math.floor(
      Math.random() * characters.length,
    );

    code += characters[randomIndex];
  }

  return `BM-${code}`;
}