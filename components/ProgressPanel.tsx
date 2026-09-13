"use client";

import React, { useEffect, useState } from "react";
import type { ConceptStatus, ProgressOverview, RevisionReasonCode, RevisionRecommendation, SubjectAnalytics } from "@/types/progress";
import StageBadge from "@/components/StageBadge";
import { CALIBRATION_LABEL, REVISION_REASON_LABEL, TRANSFER_LABEL, revisionIntentLabel } from "@/lib/ui/labels";

// The same priority order revisionIntentLabel already uses (prerequisite > misconception > review
// > transfer > plateau > continue) -- applied here only to pick WHICH already-server-provided
// reason reads best as a single "why" sentence, never to derive a new reason (Step 15: "use actual
// existing server content, do not manufacture recommendation logic").
const REASON_DISPLAY_PRIORITY: RevisionReasonCode[] = ["PREREQUISITE_BLOCKER", "ACTIVE_MISCONCEPTION", "REVIEW_DUE", "TRANSFER_NOT_DEMONSTRATED", "PRACTICE_PLATEAU", "MASTERY_DEVELOPING"];
function primaryReasonCode(codes: RevisionReasonCode[]): RevisionReasonCode {
  return REASON_DISPLAY_PRIORITY.find((code) => codes.includes(code)) ?? codes[0];
}

interface ProgressPanelProps {
  onPracticeSubject: (subject: string) => void;
}

function ConceptRow({ concept }: { concept: ConceptStatus }) {
  return (
    <li className="border-t border-line py-3.5 first:border-t-0">
      <div className="flex items-start justify-between gap-3">
        <span className="min-w-0">
          <span className="block truncate text-[13px] text-ink/90">{concept.displayName}</span>
          {concept.why.length > 0 && (
            <ul className="mt-1.5 flex flex-col gap-0.5">
              {concept.why.map((line, i) => (
                <li key={i} className="text-[11.5px] leading-relaxed text-muted">
                  {line}
                </li>
              ))}
            </ul>
          )}
          <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            {concept.activeMisconception && <span className="text-[11px] text-[#e9a991]">This idea may need another pass</span>}
            {concept.transferReadiness && <span className="text-[11px] text-muted">Applying it: {TRANSFER_LABEL[concept.transferReadiness]}</span>}
          </span>
        </span>
        <StageBadge stage={concept.stage} className="flex-shrink-0 pt-0.5" />
      </div>
    </li>
  );
}

function RevisionRow({ item, onPractice }: { item: RevisionRecommendation; onPractice: (subject: string) => void }) {
  return (
    <li className="border-t border-line py-3.5 first:border-t-0">
      <div className="flex items-start justify-between gap-3">
        <span className="min-w-0">
          <span className="block truncate text-[13px] text-ink/90">{item.displayName}</span>
          <span className="mt-1 block text-[11px] font-medium uppercase tracking-[0.16em] text-accent-dim">{revisionIntentLabel(item.reasonCodes)}</span>
          <span className="mt-1 block text-[11.5px] leading-relaxed text-muted">{REVISION_REASON_LABEL[primaryReasonCode(item.reasonCodes)]}</span>
        </span>
        <button
          type="button"
          onClick={() => onPractice(item.subject)}
          className="flex-shrink-0 rounded-md border border-line-strong px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.15em] text-ink transition-colors hover:border-accent/60 hover:text-accent focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Practice
        </button>
      </div>
    </li>
  );
}

function SubjectDetail({ analytics, onPracticeSubject }: { analytics: SubjectAnalytics; onPracticeSubject: (subject: string) => void }) {
  const assessedConcepts = analytics.concepts.filter((c) => c.evidenceCount > 0);
  const unassessedConcepts = analytics.concepts.filter((c) => c.evidenceCount === 0);

  return (
    <div className="flex flex-col gap-7">
      <section>
        <div className="flex items-baseline justify-between">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted">Concepts</h3>
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted/60">
            {analytics.conceptsAssessed} of {analytics.concepts.length} assessed
          </span>
        </div>
        {analytics.concepts.length === 0 ? (
          <p className="mt-3 text-[12px] leading-relaxed text-muted">No concepts registered for this subject yet.</p>
        ) : (
          <ul className="mt-2">
            {[...assessedConcepts, ...unassessedConcepts].map((concept) => (
              <ConceptRow key={concept.conceptId} concept={concept} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted">Focus next</h3>
        {analytics.revisionRecommendations.length === 0 && analytics.transferPractice.length === 0 ? (
          <p className="mt-3 text-[12px] leading-relaxed text-muted">Nothing needs revision right now — keep practicing to build up evidence.</p>
        ) : (
          <ul className="mt-2">
            {analytics.revisionRecommendations.map((item) => (
              <RevisionRow key={item.conceptId} item={item} onPractice={onPracticeSubject} />
            ))}
            {analytics.transferPractice.map((item) => (
              <RevisionRow key={`transfer-${item.conceptId}`} item={item} onPractice={onPracticeSubject} />
            ))}
          </ul>
        )}
      </section>

      <section className="border-t border-line pt-5">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted">This subject</h3>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-[12px]">
          <div>
            <dt className="text-muted/70">Review due</dt>
            <dd className="mt-0.5 text-ink/90">{analytics.reviewDueCount}</dd>
          </div>
          <div>
            <dt className="text-muted/70">Active misconceptions</dt>
            <dd className="mt-0.5 text-ink/90">{analytics.activeMisconceptionCount}</dd>
          </div>
          <div>
            <dt className="text-muted/70">Applied successfully</dt>
            <dd className="mt-0.5 text-ink/90">
              {analytics.transferCoverage.readyCount} of {analytics.transferCoverage.masteredCount} mastered
            </dd>
          </div>
          <div>
            <dt className="text-muted/70">Support level</dt>
            <dd className="mt-0.5 text-ink/90">
              {analytics.autonomy ? (analytics.autonomy.trend === "improving" ? "Working more independently" : analytics.autonomy.trend === "declining" ? "Needs a bit more guidance" : "Steady") : "Not enough evidence yet"}
            </dd>
          </div>
        </dl>
        {analytics.calibration.state !== "insufficient_evidence" && (
          <p className="mt-3 text-[12px] text-muted">Confidence check: {CALIBRATION_LABEL[analytics.calibration.state]}</p>
        )}
      </section>

      <button
        type="button"
        onClick={() => onPracticeSubject(analytics.subject)}
        className="rounded-lg border border-line-strong px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.18em] text-ink transition-[color,border-color] hover:border-accent/60 hover:text-accent focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Practice {analytics.subject}
      </button>
    </div>
  );
}

export default function ProgressPanel({ onPracticeSubject }: ProgressPanelProps) {
  const [overview, setOverview] = useState<ProgressOverview | null>(null);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/learning/progress");
        const data = (await response.json()) as ProgressOverview & { error?: string };
        if (!response.ok) throw new Error(data.error || "Could not load your progress.");
        if (cancelled) return;
        setOverview(data);
        if (data.subjects.length > 0) setActiveSubject(data.subjects[0].subject);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load your progress.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) return <p className="text-[13px] text-muted">Loading…</p>;
  if (error)
    return (
      <p role="alert" className="text-[13px] text-[#e9a991]">
        {error}
      </p>
    );
  if (!overview || overview.subjects.length === 0) {
    return <p className="text-[13px] leading-relaxed text-muted">No concept evidence yet. Ask a question or start a practice session to begin building your progress.</p>;
  }

  const current = overview.subjects.find((s) => s.subject === activeSubject) ?? overview.subjects[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Step 12: "where am I" starts with the subject itself, always visible -- not only when
          there happens to be more than one to switch between. */}
      <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-muted/60">{current.subject}</p>
      {overview.subjects.length > 1 && (
        <div className="-mt-3 flex flex-wrap gap-2">
          {overview.subjects.map((s) => (
            <button
              key={s.subject}
              type="button"
              onClick={() => setActiveSubject(s.subject)}
              aria-pressed={s.subject === current.subject}
              className={`rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                s.subject === current.subject ? "border-accent/60 text-accent-dim" : "border-line-strong text-muted hover:text-ink"
              }`}
            >
              {s.subject}
            </button>
          ))}
        </div>
      )}
      <SubjectDetail analytics={current} onPracticeSubject={onPracticeSubject} />
    </div>
  );
}
