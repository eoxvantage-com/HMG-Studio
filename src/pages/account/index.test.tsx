import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { onlineManager } from "@tanstack/react-query";
import { Refine, type DataProvider } from "@refinedev/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AccountPreferences } from "./index";

const prefs = { date_format: "YYYY-MM-DD", time_format: "24h", timezone: "UTC" };
const custom = vi.fn();
const notify = vi.fn();
const provider = { getApiUrl: () => "https://qa.example.invalid", custom } as unknown as DataProvider;
const notificationProvider = () => ({ open: notify, close: vi.fn() });

function mount() {
  return render(<Refine dataProvider={{ default: provider, app: provider }} notificationProvider={notificationProvider}
    options={{ disableTelemetry: true, warnWhenUnsavedChanges: true }}><AccountPreferences /></Refine>);
}

describe("native account preferences page", () => {
  beforeEach(() => { custom.mockResolvedValue({ data: { ok: true, verified: true, preferences: prefs } }); });
  afterEach(cleanup);

  it("loads through the existing app provider and renders native values", async () => {
    mount();
    expect(await screen.findByDisplayValue("UTC")).toBeTruthy();
    expect(custom.mock.calls[0][0]).toMatchObject({ url: "hmg-account-preferences-v1", method: "post", meta: { kind: "function", async: false } });
  });
  it("shows a skeleton/status instead of a blank form while loading", () => {
    custom.mockReturnValue(new Promise(() => {}));
    mount();
    expect(screen.getByRole("status", { name: "Loading account preferences" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Save changes" })).toBeNull();
  });
  it("changes only the edited preference and reports success after verified response", async () => {
    mount();
    fireEvent.change(await screen.findByDisplayValue("UTC"), { target: { value: "Asia/Kolkata" } });
    custom.mockResolvedValue({ data: { ok: true, verified: true, preferences: { ...prefs, timezone: "Asia/Kolkata" } } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(notify).toHaveBeenCalledWith(expect.objectContaining({ type: "success" })));
    expect(custom.mock.calls.at(-1)?.[0]).toMatchObject({ payload: { action: "update", values: { timezone: "Asia/Kolkata" } } });
  });
  it("cancel restores native values without a mutation", async () => {
    mount();
    fireEvent.change(await screen.findByDisplayValue("UTC"), { target: { value: "Europe/London" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByDisplayValue("UTC")).toBeTruthy();
    expect(custom).toHaveBeenCalledTimes(1);
  });
  it("preserves dirty edits when the connection returns", async () => {
    mount();
    fireEvent.change(await screen.findByDisplayValue("UTC"), { target: { value: "Europe/London" } });
    await act(async () => { onlineManager.setOnline(false); onlineManager.setOnline(true); await new Promise(resolve => setTimeout(resolve, 50)); });
    expect(custom).toHaveBeenCalledTimes(1);
    expect(screen.getByDisplayValue("Europe/London")).toBeTruthy();
  });
  it("disables non-native format selectors while a save is pending", async () => {
    mount();
    fireEvent.change(await screen.findByDisplayValue("UTC"), { target: { value: "Europe/London" } });
    custom.mockReturnValue(new Promise(() => {}));
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(custom).toHaveBeenCalledTimes(2));
    expect(screen.getByRole("combobox", { name: /Date format/ }).getAttribute("aria-disabled")).toBe("true");
    expect(screen.getByRole("combobox", { name: /Time format/ }).getAttribute("aria-disabled")).toBe("true");
  });
  it("cancel also resets a changed format selector", async () => {
    mount();
    await screen.findByDisplayValue("UTC");
    fireEvent.mouseDown(screen.getByRole("combobox", { name: /Time format/ }));
    fireEvent.click(screen.getByRole("option", { name: "12-hour" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("combobox", { name: /Time format/ }).textContent).toBe("24-hour");
  });
  it("keeps input and displays field errors without success on rejected validation", async () => {
    mount();
    fireEvent.change(await screen.findByDisplayValue("UTC"), { target: { value: "Not/AZone" } });
    custom.mockResolvedValue({ data: { ok: false, verified: false, code: "VALIDATION_ERROR", errors: { timezone: "bad" } } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await screen.findByText("Enter a valid IANA timezone, such as Asia/Kolkata.");
    expect(screen.getByDisplayValue("Not/AZone")).toBeTruthy();
    expect(notify).not.toHaveBeenCalledWith(expect.objectContaining({ type: "success" }));
  });
  it("requires reload after an uncertain save and does not retry the write", async () => {
    mount();
    fireEvent.change(await screen.findByDisplayValue("UTC"), { target: { value: "Europe/London" } });
    custom.mockResolvedValue({ data: { ok: false, code: "READBACK_FAILED" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await screen.findByText(/Save could not be verified/);
    expect((screen.getByRole("button", { name: "Save changes" }) as HTMLButtonElement).disabled).toBe(true);
    expect(custom).toHaveBeenCalledTimes(2);
    expect(notify).not.toHaveBeenCalledWith(expect.objectContaining({ type: "success" }));
  });
  it("shows a retryable load error with no fake default values", async () => {
    custom.mockRejectedValue({ statusCode: 403, message: "Forbidden" });
    mount();
    await screen.findByText("Unable to load account preferences.");
    expect(screen.queryByDisplayValue("UTC")).toBeNull();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
    expect(custom).toHaveBeenCalledTimes(1);
  });
});
