"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import MobileShell from "../../../components/MobileShell";

const ALL_TIME_SLOTS = [
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

type AvailabilityByDate = Record<string, string[]>;

type MeetupDraft = {
  meetupName?: string;
  candidateDates?: string[];
  timeSlots?: string[];
};

type ParticipantData = {
  name?: string;
};

type SavedAvailability = {
  participantName?: string;
  availability?: AvailabilityByDate;
  updatedAt?: string;
};

export default function AvailabilityPage() {
  const router = useRouter();

  const [meetupDraft, setMeetupDraft] =
    useState<MeetupDraft>({});

  const [participantName, setParticipantName] =
    useState("Guest");

  const [availability, setAvailability] =
    useState<AvailabilityByDate>({});

    const [openDate, setOpenDate] =
  useState<string | null>(null);

  useEffect(() => {
    const savedDraft = sessionStorage.getItem(
      "boardmeet-create-draft",
    );

    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(
          savedDraft,
        ) as MeetupDraft;

        setMeetupDraft(parsedDraft);
      } catch {
        console.error(
          "Could not read meetup data.",
        );
      }
    }

    const savedParticipant = sessionStorage.getItem(
      "boardmeet-participant",
    );

    if (savedParticipant) {
      try {
        const participant = JSON.parse(
          savedParticipant,
        ) as ParticipantData;

        if (participant.name?.trim()) {
          setParticipantName(
            participant.name.trim(),
          );
        }
      } catch {
        console.error(
          "Could not read participant data.",
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
        ) as SavedAvailability;

        if (parsedAvailability.availability) {
          setAvailability(
            parsedAvailability.availability,
          );
        }
      } catch {
        console.error(
          "Could not read availability data.",
        );
      }
    }
  }, []);

  const candidateDates = useMemo(() => {
    if (meetupDraft.candidateDates?.length) {
      return meetupDraft.candidateDates;
    }

    return [];
  }, [meetupDraft.candidateDates]);

  const availableTimeSlots = useMemo(() => {
    if (!meetupDraft.timeSlots?.length) {
      return [];
    }

    return ALL_TIME_SLOTS.filter((slot) =>
      meetupDraft.timeSlots?.includes(slot.id),
    );
  }, [meetupDraft.timeSlots]);

  function toggleTimeSlot(
    dateKey: string,
    slotId: string,
  ) {
    setAvailability((current) => {
      const currentSlots = current[dateKey] ?? [];

      const alreadySelected =
        currentSlots.includes(slotId);

      return {
        ...current,
        [dateKey]: alreadySelected
          ? currentSlots.filter(
              (slot) => slot !== slotId,
            )
          : [...currentSlots, slotId],
      };
    });
  }

  function selectAllForDate(dateKey: string) {
    const selectedSlots =
      availability[dateKey] ?? [];

    const availableSlotIds =
      availableTimeSlots.map((slot) => slot.id);

    const allSelected =
      availableSlotIds.length > 0 &&
      availableSlotIds.every((slotId) =>
        selectedSlots.includes(slotId),
      );

    setAvailability((current) => ({
      ...current,
      [dateKey]: allSelected
        ? []
        : availableSlotIds,
    }));
  }

  function handleContinue() {
    const hasAtLeastOneSelection = Object.values(
      availability,
    ).some((slots) => slots.length > 0);

    if (!hasAtLeastOneSelection) {
      alert(
        "Please select at least one available time slot.",
      );

      return;
    }

    sessionStorage.setItem(
      "boardmeet-availability",
      JSON.stringify({
        participantName,
        availability,
        updatedAt: new Date().toISOString(),
      }),
    );

    router.push("/meetup/demo/games");
  }

  return (
    <MobileShell>
      <div className="min-h-screen bg-[#FAF9FF] pb-28">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-[#FAF9FF]/95 px-5 py-4 backdrop-blur">
          <button
            type="button"
            onClick={() =>
              router.push("/meetup/demo")
            }
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm"
            aria-label="Go back"
          >
            <span className="material-symbols-rounded">
              arrow_back
            </span>
          </button>

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

        <main className="px-5 pt-6">
          <section className="rounded-[28px] bg-gradient-to-br from-violet-600 to-purple-700 p-5 text-white shadow-xl shadow-violet-200">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-violet-100">
              Your availability
            </p>

            <h1 className="mt-3 text-[27px] font-bold leading-tight tracking-tight">
              {meetupDraft.meetupName ||
                "Board Game Meetup"}
            </h1>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                <span className="material-symbols-rounded">
                  person
                </span>
              </div>

              <div>
                <p className="text-xs text-violet-100">
                  Responding as
                </p>

                <p className="text-sm font-bold">
                  {participantName}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-7">
            <p className="text-sm font-bold text-violet-600">
              Select your times
            </p>

            <h2 className="mt-2 text-[28px] font-bold leading-tight tracking-tight text-gray-950">
              When are you free?
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Choose every time slot that works for
              you. You can select multiple slots on
              each date.
            </p>
          </section>

          {candidateDates.length === 0 ||
          availableTimeSlots.length === 0 ? (
            <section className="mt-7 rounded-[24px] border border-red-100 bg-red-50 p-5">
              <div className="flex items-start gap-3">
                <span className="material-symbols-rounded text-red-600">
                  error
                </span>

                <div>
                  <p className="text-sm font-bold text-red-900">
                    Meetup information is missing
                  </p>

                  <p className="mt-1 text-sm leading-6 text-red-700">
                    Create a new meetup and select
                    candidate dates and time slots
                    before continuing.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push("/create")
                }
                className="mt-4 w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white"
              >
                Create New Meetup
              </button>
            </section>
          ) : (
            <section className="mt-7 space-y-4">
              {candidateDates.map((dateKey) => {
                const selectedSlots =
                  availability[dateKey] ?? [];

                const availableSlotIds =
                  availableTimeSlots.map(
                    (slot) => slot.id,
                  );

                const selectedCount =
                  availableSlotIds.filter((slotId) =>
                    selectedSlots.includes(slotId),
                  ).length;

                const allSelected =
                  availableSlotIds.length > 0 &&
                  availableSlotIds.every((slotId) =>
                    selectedSlots.includes(slotId),
                  );

                return (
                  <article
                    key={dateKey}
                    className="overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-sm"
                  >
                   <button
  type="button"
  onClick={() =>
    setOpenDate((current) =>
      current === dateKey ? null : dateKey,
    )
  }
  className="flex w-full items-center justify-between px-4 py-4 text-left"
>
  <div>
    <p className="text-base font-bold text-gray-950">
      {formatFullDate(dateKey)}
    </p>

    <p className="mt-1 text-xs text-gray-400">
      {selectedCount} of{" "}
      {availableTimeSlots.length} selected
    </p>
  </div>

  <span
    className={`material-symbols-rounded text-gray-500 transition-transform ${
      openDate === dateKey
        ? "rotate-180"
        : ""
    }`}
  >
    expand_more
  </span>
</button>

                  {openDate === dateKey && (
  <div className="border-t border-gray-100 p-4">
    <div className="mb-3 flex justify-end">
      <button
        type="button"
        onClick={() =>
          selectAllForDate(dateKey)
        }
        className={`rounded-full px-3 py-2 text-xs font-bold transition ${
          allSelected
            ? "bg-violet-600 text-white"
            : "bg-violet-50 text-violet-700"
        }`}
      >
        {allSelected
          ? "Clear all"
          : "Select all"}
      </button>
    </div>

    <div className="space-y-2">
      {availableTimeSlots.map((slot) => {
        const selected =
          selectedSlots.includes(slot.id);

        return (
          <button
            key={slot.id}
            type="button"
            onClick={() =>
              toggleTimeSlot(
                dateKey,
                slot.id,
              )
            }
            className={`flex w-full items-center justify-between rounded-2xl border-2 px-4 py-4 text-left transition ${
              selected
                ? "border-violet-600 bg-violet-50"
                : "border-gray-200 bg-white hover:border-violet-200"
            }`}
          >
            <span
              className={`text-sm font-bold ${
                selected
                  ? "text-violet-700"
                  : "text-gray-800"
              }`}
            >
              {slot.label}
            </span>

            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                selected
                  ? "bg-violet-600 text-white"
                  : "border border-gray-300 bg-white text-transparent"
              }`}
            >
              <span className="material-symbols-rounded text-[17px]">
                check
              </span>
            </span>
          </button>
        );
      })}
    </div>
  </div>
)}
                  </article>
                );
              })}
            </section>
          )}

          <section className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <span className="material-symbols-rounded text-[21px] text-blue-600">
              info
            </span>

            <p className="text-sm leading-6 text-blue-800">
              You can change your response later
              before the deadline.
            </p>
          </section>
        </main>

        {candidateDates.length > 0 &&
          availableTimeSlots.length > 0 && (
            <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-[430px] border-t border-gray-100 bg-white/95 px-5 pb-6 pt-4 backdrop-blur">
              <button
                type="button"
                onClick={handleContinue}
                className="flex w-full items-center justify-center rounded-2xl bg-violet-600 px-5 py-4 text-base font-bold text-white shadow-lg shadow-violet-200 transition active:scale-[0.99]"
              >
                Continue to Games

                <span className="material-symbols-rounded ml-2 text-[20px]">
                  arrow_forward
                </span>
              </button>
            </div>
          )}
      </div>
    </MobileShell>
  );
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