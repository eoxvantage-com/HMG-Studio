import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProductImageField } from "./ProductImageField";
import type { ProductImageSelection } from "../services/productMedia";

const prepare = vi.hoisted(() => vi.fn());
vi.mock("../services/productMedia", () => ({ prepareProductImage: prepare }));
vi.mock("./PrivateProductImage", () => ({ PrivateProductImage: () => <div>Saved image</div> }));
const selection = { file: new File(["image"], "Marble.png", { type: "image/png" }), upload: { content_base64: "aW1hZ2U=", content_type: "image/png" }, sha256: "a".repeat(64) } satisfies ProductImageSelection;
const change = vi.fn(); const pending = vi.fn(); const failure = vi.fn();
const props = { selection: null, disabled: false, onChange: change, onPendingChange: pending, onErrorChange: failure };
beforeEach(() => {
  prepare.mockReset(); prepare.mockResolvedValue(selection); change.mockReset(); pending.mockReset(); failure.mockReset();
  URL.createObjectURL = vi.fn(() => "blob:preview"); URL.revokeObjectURL = vi.fn();
});
afterEach(cleanup);

describe("product image field", () => {
  it("prepares a selected file and reports pending state", async () => {
    render(<ProductImageField {...props} />);
    fireEvent.change(screen.getByLabelText("Product image file"), { target: { files: [selection.file] } });
    await waitFor(() => expect(change).toHaveBeenCalledWith(selection));
    expect(pending.mock.calls.map(([value]) => value)).toEqual([true, false]);
  });
  it("reports invalid files as a blocking selection error rather than saving the prior image silently", async () => {
    prepare.mockRejectedValue(new Error("Choose PNG, JPEG or WebP."));
    render(<ProductImageField {...props} selection={selection} />);
    fireEvent.change(screen.getByLabelText("Product image file"), { target: { files: [new File(["svg"], "bad.svg")] } });
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(failure).toHaveBeenLastCalledWith(true);
    expect(change).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Remove selected image" }));
    expect(change).toHaveBeenCalledWith(null);
    expect(failure).toHaveBeenLastCalledWith(false);
  });
  it("revokes local previews and does not delete existing media when removing a draft selection", async () => {
    const view = render(<ProductImageField {...props} selection={selection} existingSource="storage://products/existing" />);
    await screen.findByAltText("Selected product image preview");
    fireEvent.click(screen.getByRole("button", { name: "Remove selected image" }));
    expect(change).toHaveBeenCalledWith(null);
    view.rerender(<ProductImageField {...props} existingSource="storage://products/existing" />);
    expect(screen.getByText("Saved image")).toBeTruthy();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });
  it("discards late file processing after unmount", async () => {
    let resolve!: (value: ProductImageSelection) => void;
    prepare.mockReturnValue(new Promise(value => { resolve = value; }));
    const view = render(<ProductImageField {...props} />);
    fireEvent.change(screen.getByLabelText("Product image file"), { target: { files: [selection.file] } });
    view.unmount(); resolve(selection);
    await Promise.resolve();
    expect(change).not.toHaveBeenCalled();
  });
});
