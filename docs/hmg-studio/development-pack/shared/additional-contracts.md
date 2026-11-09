# Shared contracts — additional-contracts.md

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

Read only the relevant sections for the active module; this file owns mixed-module registers and common rules. Return to [START HERE](../00_START_HERE.md).

- [](#e0473)

<a id="e0473"></a>

> Audit provenance: `additional-contracts.md` lines 1–6. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.



The source page inventory was complete before this appendix. A final independent path comparison identified the following API request subclasses and enum files not explicitly named by full repository path in the preceding chapters. Their exact source is included to avoid silently losing API-specific overrides, inheritance, or accepted status values. This is supplementary static evidence, not executed validation. If a subclass inherits a web request, use the parent contract already covered in the relevant chapter; do not assume all API and web behaviors are identical.

Inventory: **76 request files; 11 enum files**. Supplemented here: **36 files**.

