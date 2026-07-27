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

type AvailabilityByDate = Record<
  string,
  string[]
>;

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

type SavedAvailability = {
  meetupId?: string;
  inviteCode?: string;
  participantName?: string;
  availability?: AvailabilityByDate;
  updatedAt?: string;
};

export default function AvailabilityPage() {
  const router = useRouter();

  const [meetup, setMeetup] =
    useState<JoinedMeetup | null>(null);

  const [
    participantName,
    setParticipantName,
  ] = useState("Guest");

  const [
    availability,
    setAvailability,
  ] = useState<AvailabilityByDate>({});

  const [openDate, setOpenDate] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    const savedMeetup =
      sessionStorage.getItem(
        "boardmeet-joined-meetup",
      );

    if (!savedMeetup) {
      setIsLoading(false);
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
          "Invalid meetup data.",
        );
      }

      setMeetup(parsedMeetup);
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
      return;
    }

    const savedParticipant =
      sessionStorage.getItem(
        "boardmeet-participant",
      );

    if (!savedParticipant) {
      setIsLoading(false);
      router.replace("/meetup/demo");
      return;
    }

    try {
      const participant = JSON.parse(
        savedParticipant,
      ) as ParticipantData;

      if (!participant.name?.trim()) {
        setIsLoading(false);
        router.replace("/meetup/demo");
        return;
      }

      setParticipantName(
        participant.name.trim(),
      );
    } catch (error) {
      console.error(
        "Could not read participant data.",
        error,
      );

      setIsLoading(false);
      router.replace("/meetup/demo");
      return;
    }

    const savedAvailability =
      sessionStorage.getItem(
        "boardmeet-availability",
      );

    if (savedAvailability) {
      try {
        const parsedAvailability =
          JSON.parse(
            savedAvailability,
          ) as SavedAvailability;

        const belongsToCurrentMeetup =
          !parsedAvailability.meetupId ||
          parsedAvailability.meetupId ===
            parsedMeetup.id;

        if (
          belongsToCurrentMeetup &&
          parsedAvailability.availability
        ) {
          setAvailability(
            parsedAvailability.availability,
          );
        }
      } catch (error) {
        console.error(
          "Could not read availability data.",
          error,
        );
      }
    }

    const firstCandidateDate =
      parsedMeetup.candidate_dates?.[0];

    if (firstCandidateDate) {
      setOpenDate(firstCandidateDate);
    }

    setIsLoading(false);
  }, [router]);

  const candidateDates = useMemo(() => {
    if (
      !Array.isArray(
        meetup?.candidate_dates,
      )
    ) {
      return [];
    }

    return meetup.candidate_dates.filter(
      (date): date is string =>
        typeof date === "string" &&
        date.trim().length > 0,
    );
  }, [meetup?.candidate_dates]);

  const availableTimeSlots = useMemo(() => {
    if (
      !Array.isArray(meetup?.time_slots)
    ) {
      return [];
    }

    return ALL_TIME_SLOTS.filter(
      (slot) =>
        meetup.time_slots.includes(slot.id),
    );
  }, [meetup?.time_slots]);

  function toggleTimeSlot(
    dateKey: string,
    slotId: string,
  ) {
    setAvailability((current) => {
      const currentSlots =
        current[dateKey] ?? [];

      const alreadySelected =
        currentSlots.includes(slotId);

      const nextSlots = alreadySelected
        ? currentSlots.filter(
            (slot) => slot !== slotId,
          )
        : [...currentSlots, slotId];

      return {
        ...current,
        [dateKey]: nextSlots,
      };
    });
  }

  function selectAllForDate(
    dateKey: string,
  ) {
    const selectedSlots =
      availability[dateKey] ?? [];

    const availableSlotIds =
      availableTimeSlots.map(
        (slot) => slot.id,
      );

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
    if (!meetup) {
      alert(
        "The meetup information could not be found.",
      );
      return;
    }

    const cleanedAvailability =
      Object.fromEntries(
        candidateDates.map((dateKey) => [
          dateKey,
          (
            availability[dateKey] ?? []
          ).filter((slotId) =>
            availableTimeSlots.some(
              (slot) =>
                slot.id === slotId,
            ),
          ),
        ]),
      ) as AvailabilityByDate;

    const hasAtLeastOneSelection =
      Object.values(
        cleanedAvailability,
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
        meetupId: meetup.id,
        inviteCode: meetup.invite_code,
        participantName,
        availability:
          cleanedAvailability,
        updatedAt:
          new Date().toISOString(),
      }),
    );

    router.push("/meetup/demo/games");
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
              Loading availability...
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
      <div className="min-h-screen bg-[#FAF9FF] pb-28">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-[#FAF9FF]/95 px-5 py-4 backdrop-blur">
          <button
            type="button"
            onClick={() =>
              router.push("/meetup/demo")
            }
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm transition active:scale-95"
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
              {meetup.meetup_name}
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

            <div className="mt-4 flex items-center gap-2 text-xs text-violet-100">
              <span className="material-symbols-rounded text-[17px]">
                password
              </span>

              <span className="font-mono font-bold">
                {meetup.invite_code}
              </span>
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
                    This meetup does not have valid
                    candidate dates or time slots.
                    Ask the host to create a new
                    meetup.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push("/join")
                }
                className="mt-4 w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white"
              >
                Return to Join
              </button>
            </section>
          ) : (
            <section className="mt-7 space-y-4">
              {candidateDates.map(
                (dateKey) => {
                  const selectedSlots =
                    availability[dateKey] ??
                    [];

                  const availableSlotIds =
                    availableTimeSlots.map(
                      (slot) => slot.id,
                    );

                  const selectedCount =
                    availableSlotIds.filter(
                      (slotId) =>
                        selectedSlots.includes(
                          slotId,
                        ),
                    ).length;

                  const allSelected =
                    availableSlotIds.length >
                      0 &&
                    availableSlotIds.every(
                      (slotId) =>
                        selectedSlots.includes(
                          slotId,
                        ),
                    );

                  return (
                    <article
                      key={dateKey}
                      className="overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenDate(
                            (current) =>
                              current ===
                              dateKey
                                ? null
                                : dateKey,
                          )
                        }
                        className="flex w-full items-center justify-between px-4 py-4 text-left"
                      >
                        <div>
                          <p className="text-base font-bold text-gray-950">
                            {formatFullDate(
                              dateKey,
                            )}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {selectedCount} of{" "}
                            {
                              availableTimeSlots.length
                            }{" "}
                            selected
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

                      {openDate ===
                        dateKey && (
                        <div className="border-t border-gray-100 p-4">
                          <div className="mb-3 flex justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                selectAllForDate(
                                  dateKey,
                                )
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
                            {availableTimeSlots.map(
                              (slot) => {
                                const selected =
                                  selectedSlots.includes(
                                    slot.id,
                                  );

                                return (
                                  <button
                                    key={
                                      slot.id
                                    }
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
                                      {
                                        slot.label
                                      }
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
                              },
                            )}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                },
              )}
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

function formatFullDate(
  dateKey: string,
) {
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