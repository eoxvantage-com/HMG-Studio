import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PrivateProductImage } from "./PrivateProductImage";
const getOne = vi.fn();
const provider = () => ({ getOne });
let owner: string | null = "11111111-1111-4111-8111-111111111111";
let identityError = false;
vi.mock("@refinedev/core", () => ({ useDataProvider: () => provider, useGetIdentity: () => ({ data: owner ? { id: owner } : null, isError: identityError }) }));
const source = `storage://products/hmg-catalogue/${"a".repeat(64)}.jpg`;
beforeEach(() => { identityError = false; owner = "11111111-1111-4111-8111-111111111111"; getOne.mockReset(); getOne.mockResolvedValue({ data: new Blob(["photo"], { type: "image/jpeg" }) }); URL.createObjectURL = vi.fn(() => "blob:local-photo"); URL.revokeObjectURL = vi.fn(); });
afterEach(cleanup);
describe("private product media", () => {
  it("downloads a new scoped product upload through the same private provider", async () => {
    const path = `hmg-products/${owner}/${owner}/${"b".repeat(64)}.png`;
    render(<PrivateProductImage source={`storage://products/${path}`} alt="New marble" />);
    expect(await screen.findByAltText("New marble")).toBeTruthy();
    expect(getOne).toHaveBeenCalledWith({ resource: "products", id: path });
  });
  it("revokes a previously visible image when identity refresh fails", async () => {
    const view = render(<PrivateProductImage source={source} alt="Marble" />);
    await screen.findByAltText("Marble");
    identityError = true; view.rerender(<PrivateProductImage source={source} alt="Marble" />);
    expect(screen.queryByAltText("Marble")).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:local-photo");
  });
  it("handles a synchronous unavailable-provider failure", async () => {
    getOne.mockImplementation(() => { throw new Error("Unavailable provider"); });
    render(<PrivateProductImage source={source} alt="Marble" />);
    expect(await screen.findByText("Product image unavailable")).toBeTruthy();
  });
  it("downloads through the session storage provider and revokes the object URL", async () => {
    const view = render(<PrivateProductImage source={source} alt="Marble" />);
    await waitFor(() => expect(screen.getByAltText("Marble").getAttribute("src")).toBe("blob:local-photo"));
    expect(getOne).toHaveBeenCalledWith({ resource: "products", id: `hmg-catalogue/${"a".repeat(64)}.jpg` });
    view.unmount(); expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:local-photo");
  });
  it("does not request private data without a confirmed identity", () => {
    owner = null; render(<PrivateProductImage source={source} alt="Marble" />);
    expect(getOne).not.toHaveBeenCalled(); expect(screen.queryByAltText("Marble")).toBeNull();
  });
  it.each(["storage://other/private.jpg", "storage://products/../secret", "https://evil.test/a.jpg"])("rejects unapproved path %s", invalid => {
    render(<PrivateProductImage source={invalid} alt="Marble" />); expect(getOne).not.toHaveBeenCalled();
  });
  it("does not turn denied storage or SVG into an image", async () => {
    getOne.mockResolvedValue({ data: new Blob(["<svg/>"], { type: "image/svg+xml" }) });
    render(<PrivateProductImage source={source} alt="Marble" />);
    expect(await screen.findByText("Product image unavailable")).toBeTruthy(); expect(URL.createObjectURL).not.toHaveBeenCalled();
  });
  it("discards late responses after identity changes", async () => {
    let resolve!: (value: unknown) => void;
    getOne.mockReturnValue(new Promise(value => { resolve = value; }));
    const view = render(<PrivateProductImage source={source} alt="Marble" />);
    owner = null; view.rerender(<PrivateProductImage source={source} alt="Marble" />);
    resolve({ data: new Blob(["photo"], { type: "image/jpeg" }) });
    await waitFor(() => expect(screen.queryByAltText("Marble")).toBeNull()); expect(URL.createObjectURL).not.toHaveBeenCalled();
  });
});

it("reads approved migrated product images through authenticated storage", async () => {
  const path = `migration-b6cc3e51248d4cfe91f8dfcfc8fcea41/hmg-catalogue/${"c".repeat(64)}.jpg`;
  render(<PrivateProductImage source={`storage://products/${path}`} alt="Migrated marble" />);
  expect(await screen.findByAltText("Migrated marble")).toBeTruthy();
  expect(getOne).toHaveBeenCalledWith({resource:"products",id:path});
});
