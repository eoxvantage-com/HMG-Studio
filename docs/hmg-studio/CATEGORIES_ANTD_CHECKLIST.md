# Categories Ant Design refinement checklist

- [x] Replaced Categories page controls/layout with Ant Design v5; preserved query and create-function payload/readback code.
- [x] Removed duplicate page breadcrumb (workspace shell retains its breadcrumb); added 24px content padding, 8px component rhythm, responsive `[16,16]` card grid, compact titles, one primary create action, default export actions, and scoped theme tokens.
- [ ] Focused Categories tests: 8 of 10 passed on the last run; view-switch and AntD organization-select interaction tests still fail in JSDOM and require correction/verification.
- [ ] Capture and compare 1440px / 1920px authenticated screenshots. Headless local capture redirected to login; CUA browser host also unavailable.
- [ ] Live Taruvi CRUD/persistence is separate from this visual-only scope; verify only with Pradeep's authenticated Taruvi session and available app access.
- [ ] Continue user-requested create/edit/business-action workflows one at a time after this page is verified; no other module changed in this pass.
