Here you go — a clean, **plug-and-play `COGNITION.md`** you can drop in as-is.
No changes to your other files required.

```md
# COGNITION.md
> Cognitive compensation layer for LLM agents.  
> Purpose: simulate missing human instincts (entropy reduction, intent memory, causality, coherence, taste) **without** changing model weights.

---

## 0) Scope & Load Order
- **Load after** `AGENTS.md` and **before** model-specific files (e.g., `CLAUDE.md`).
- This file **does not duplicate** repository rules; it adds the *how to think* overlay.
- If guidance conflicts, **`AGENTS.md` takes precedence** (project doctrine > cognition).

**Operating Modes (align with your Adaptive Framework):**
- **MINIMAL** (≤20 lines or 1 file): use only the short checklists.
- **LIGHTWEIGHT** (≤100 lines or ≤3 modules): use all checklists + short reports.
- **FULL** (>100 lines or ≥3 modules / risky refactors): run all sections + full reports.

---

## 1) Cognitive Compensations (Human-Trait Overlays)

### 1.1 Entropy Reduction (default instinct override)
**Risk (native LLM):** linear patching, duplication, boundary blur.  
**Compensation (required):**
- **Preflight (before coding):**
  - Is there an existing abstraction I can extend?  
  - Will this change *reduce* duplication / complexity?
- **Postflight (before final output):**
  - Duplication ↓ ? Complexity ↓ ? Boundaries respected ? A simpler option exists ?
- **Decision:** If any answer is “no”, refactor or propose an alternative.

**Mini Report (Lite):**
```

### 🧩 Entropy Summary

* Duplication: ↓ / → / ↑
* Complexity: ↓ / → / ↑
* Boundaries: kept / blurred
* Simpler alternative? yes/no (why)

```

---

### 1.2 Intent Memory (remember the “why”)
**Risk:** loses design purpose mid-task.  
**Compensation:** maintain an **Intent Log**.

**Template:**
```

### 🧭 Intent Log

* Goal: [one line]
* Constraints: [tokens/time/interfaces]
* Non-goals: [out of scope items]
* Success criteria: [observable checks]

```

---

### 1.3 Hierarchical Awareness (think in layers)
**Risk:** edits at the wrong abstraction level.  
**Compensation:** declare the current target layer and enforce responsibilities.

**Template:**
```

### 🧱 Layer Target

* Layer: [Domain / Feature / Module / Function]
* Responsibilities at this layer: [...]
* Anti-patterns avoided: [cross-layer logic / hidden state / side effects]

```

---

### 1.4 Global Coherence (project-wide consistency)
**Risk:** local fixes break ecosystem patterns.  
**Compensation:** run a **Coherence Check**.

**Checklist:**
- Naming matches precedent?  
- Schema/validators aligned?  
- Error/Logging patterns reused?  
- Imports and folder boundaries consistent?

---

### 1.5 Causal Intuition (trace “why”)
**Risk:** treats symptoms; ignores causes.  
**Compensation:** run a **Causality Trace**.

**Template:**
```

### 🔬 Causality Trace

Hypothesis: [what caused it]
Evidence: [logs/tests/diffs]
Experiment: [what I changed to test]
Result: [observed outcome]
Conclusion: [confirmed/ruled out cause]

```

---

### 1.6 Aesthetic Consistency (“taste”)
**Risk:** code “works” but feels wrong to maintain.  
**Compensation:** anchor to existing exemplars.

**Template:**
```

### 🎨 Taste Anchors

* Follow style from: [files or modules]
* Naming rhythm: [verbNoun, PascalCase types, etc.]
* Keep functions small (≤ X lines) unless justified.

```

---

### 1.7 Motivated Constraint (budget & deadlines)
**Risk:** ignores cost/urgency; over-thinks.  
**Compensation:** set explicit budgets.

**Template:**
```

### ⏱️ Constraint Guard

* Token/time budget: [numbers]
* Degradation policy if over: [fallback plan]
* Cut scope first; never cut tests or type safety.

```

---

### 1.8 Innovation vs. Repetition (rate-limit novelty)
**Risk:** invents patterns where reuse is better.  
**Compensation:** new abstractions require a micro-RFC.

**Gate:**
```

### 🛠️ RFC-Lite (only if introducing a new abstraction)

Problem: [what existing code can’t solve]
Options considered: [reuse/refactor/new]
Why new is justified: [1–2 lines]
Migration path: [how others will adopt it]

```

---

## 2) Runtime Checkpoints (insert into your reasoning flow)

**Before Implementation (all modes):**
```

[PRE] Intent Log ✅  | Layer Target ✅  | Coherence Check (quick) ✅

```

**Mid-Task (LIGHTWEIGHT/FULL):**
```

[MID] Causality Trace (if fixing bugs) ✅ | Taste Anchors ✅

```

**Before Final Output (all modes):**
```

[POST] Entropy Summary ✅ | Constraint Guard ✅ | RFC-Lite (if any) ✅

```

---

## 3) Reporting Templates (copy-paste blocks)

**A) Context-First Analysis (Lite)**
```

## 🧠 Context-First Analysis (Lite)

Related code: [list]
Reuse: [where/how]
Plan: [steps + rationale]
Risk: [low/med/high]

```

**B) Introspection Summary**
```

## 📌 Introspection Summary

* Reused modules: ✅/❌  [list]
* Impact scope: [small/med/large]
* Confidence: [high/med/low]

```

**C) Entropy Summary**  
(see 1.1 mini report)

**D) Causality Trace**  
(see 1.5 template)

**E) Coherence Map (FULL only)**
```

## 🌐 Coherence Map

* Naming/Schema/Errors/Logging: [pass/fail notes]
* Boundary notes: [controllers/validators/utils separation]

```

---

## 4) Emergency Waiver (time-critical only)
When full reasoning isn’t feasible:

```

### 🚨 TIME-CONSTRAINED WAIVER

* Scope: [hotfix/security/ops]
* Minimal patch: [what/where]
* Risk accepted: [tradeoffs]
* Post-mortem due within 24h: [yes]

```

---

## 5) Mode Selection Heuristics (plug-and-play)
- **Use MINIMAL** if: ≤20 lines, 1 file, no public API change.
- **Use LIGHTWEIGHT** if: ≤100 lines, ≤3 modules, medium risk.
- **Use FULL** if: cross-module, schema/contract changes, or refactor.

Optional header for strict budgets:
```

> ⚠️ Lite Mode: summaries only, ≤500 tokens/report. Use FULL only for audits/refactors.

```

---

## 6) Persistence Hooks (optional, non-blocking)
If your environment supports logs, persist these one-liners after each session:

```

/logs/behavior_summary.md

* Entropy: ↓/→/↑
* Reuse ratio: [0–1]
* Violations spotted: [list]
* Notes: [1 line]

```

Feeding short prior summaries into new sessions **stabilizes behavior** without retraining.

---

## 7) Conflict & Quality Guard (single-screen reminder)
- **Conflicts:** DETECT → DIFF → EXPLAIN → RESOLVE → VERIFY
- **Quality automation:** lint, types, tests; failing checks = not done.
- **No banned hacks:** no `any`, no commented-out tests, no silent schema drift.

---

## 8) Handshake with Other Docs
- Project doctrine & rules: **`AGENTS.md`**  
- Metrics/compliance/audits: **`AGENTS-APPENDIX.md`**  
- Model-specific execution: **`CLAUDE.md` / `...`**  
This file is the *cognitive overlay*; keep it loaded but lightweight.

---

### End of COGNITION.md
```

If you want this split into **MINIMAL / LIGHTWEIGHT / FULL** separate snippets to keep tokens ultra-lean in small tasks, say the word and I’ll carve it into three micro-files.
