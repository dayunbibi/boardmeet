-- Track poll participation independently from selected options so a time-poll
-- response with every option marked unavailable is still represented.
CREATE TABLE "PollParticipant" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "voterName" TEXT NOT NULL,
    "deviceToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PollParticipant_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PollParticipant_pollId_idx" ON "PollParticipant"("pollId");
CREATE UNIQUE INDEX "PollParticipant_pollId_deviceToken_key" ON "PollParticipant"("pollId", "deviceToken");

ALTER TABLE "PollParticipant" ADD CONSTRAINT "PollParticipant_pollId_fkey"
FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Preserve all existing participants when this migration is deployed.
INSERT INTO "PollParticipant" ("id", "pollId", "voterName", "deviceToken", "createdAt", "updatedAt")
SELECT
    'legacy_' || md5("pollId" || ':' || "deviceToken"),
    "pollId",
    "voterName",
    "deviceToken",
    "createdAt",
    CURRENT_TIMESTAMP
FROM (
    SELECT DISTINCT ON (po."pollId", v."deviceToken")
        po."pollId", v."voterName", v."deviceToken", v."createdAt"
    FROM "Vote" v
    JOIN "PollOption" po ON po."id" = v."pollOptionId"
    ORDER BY po."pollId", v."deviceToken", v."createdAt" DESC
) AS existing_votes
;
