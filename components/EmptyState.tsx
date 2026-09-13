"use client";

import React from "react";
import { ExplanationMode, ExamMarks } from "@/types/chat";
import Composer from "@/components/Composer";
import ModeControls from "@/components/ModeControls";

interface EmptyStateProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  mode: ExplanationMode;
  onModeChange: (mode: ExplanationMode) => void;
  marks: ExamMarks;
  onMarksChange: (marks: ExamMarks) => void;
  onUploadClick: () => void;
  hasReadyDocs: boolean;
  selectedCount: number;
  selectedName?: string;
  disabled?: boolean;
}

export default function EmptyState({
  input,
  onInputChange,
  onSend,
  mode,
  onModeChange,
  marks,
  onMarksChange,
  onUploadClick,
  hasReadyDocs,
  selectedCount,
  selectedName,
  disabled = false,
}: EmptyStateProps) {
  const grounded = selectedCount > 0;

  // Step 4/20: the full editorial pitch belongs to the very first arrival (no material yet at
  // all) -- once documents exist, this same empty-conversation screen recedes toward a compact
  // "ready to ask" prompt rather than repeating the marketing pitch, using only the hasReadyDocs
  // state this component already receives.
  const eyebrow = !hasReadyDocs ? "Personalized Learning Engine" : grounded ? "Ready" : "Choose your sources";

  const headline = !hasReadyDocs
    ? "Learn from your\nmaterial. At your pace."
    : grounded
      ? "Ask from your\nmaterial."
      : "Select your\nsources.";

  const subtitle = !hasReadyDocs
    ? "Grounded in your notes. Adapted to your progress."
    : grounded
      ? selectedCount === 1 && selectedName
        ? `Answering from ${selectedName}. Ask a question and every claim will point back to a page.`
        : `Answering from ${selectedCount} sources. Ask a question and every claim will point back to a page.`
      : "Choose one or more ready documents on the left. The assistant answers only from what you select.";

  return (
    <div className={`mx-auto flex min-h-full max-w-[820px] flex-col items-center justify-center px-6 ${hasReadyDocs ? "py-8" : "py-12"}`}>
      <div className="w-full text-center">
        <p className="rise text-[10px] font-medium uppercase tracking-[0.32em] text-muted [animation-delay:0ms]">
          {eyebrow}
        </p>

        <h1
          className={`rise mt-4 whitespace-pre-line font-semibold leading-[1.05] tracking-[-0.022em] text-ink [animation-delay:70ms] ${
            hasReadyDocs ? "text-[1.7rem] sm:text-[2.1rem]" : "text-[2.1rem] sm:text-[2.7rem]"
          }`}
        >
          {headline}
        </h1>

        <p className="rise mx-auto mt-4 max-w-[46ch] text-[14px] leading-relaxed text-[#bebcb5] [animation-delay:140ms]">
          {subtitle}
        </p>

        {!hasReadyDocs ? (
          <div className="rise mt-9 flex flex-col items-center gap-5 [animation-delay:210ms]">
            <button
              type="button"
              onClick={onUploadClick}
              disabled={disabled}
              className="rounded-lg border border-line-strong px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.18em] text-ink transition-[color,border-color,transform] duration-150 hover:border-accent/60 hover:text-accent active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Upload PDF
            </button>
            <p className="flex items-center gap-2.5 text-[10px] font-medium uppercase tracking-[0.24em] text-muted/65">
              <span>Upload</span>
              <span aria-hidden className="text-muted/30">→</span>
              <span>Learn</span>
              <span aria-hidden className="text-muted/30">→</span>
              <span>Adapt</span>
            </p>
          </div>
        ) : null}

        <div className={`rise [animation-delay:210ms] ${hasReadyDocs ? "mt-7" : "mt-9"}`}>
          <Composer
            value={input}
            onChange={onInputChange}
            onSend={onSend}
            mode={mode}
            marks={marks}
            disabled={disabled}
            variant="hero"
            placeholder={grounded ? "Ask about your selected material…" : "Ask anything…"}
          />
          {!grounded && hasReadyDocs && (
            <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-muted/60">
              No source selected · answers are general
            </p>
          )}
        </div>

        <div className="rise mt-6 [animation-delay:280ms]">
          <ModeControls
            mode={mode}
            onModeChange={onModeChange}
            marks={marks}
            onMarksChange={onMarksChange}
            disabled={disabled}
            align="center"
          />
        </div>
      </div>
    </div>
  );
}
