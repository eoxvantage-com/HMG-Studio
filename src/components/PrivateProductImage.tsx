import { useEffect, useState } from "react";
import { useDataProvider, useGetIdentity } from "@refinedev/core";
import { Empty, Image, Skeleton } from "antd";
import { privateProductImagePath } from "../services/productMedia";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Download private rasters using the existing session-backed storage provider.
 * Object URLs are local, short-lived and never persisted in the database.
 */
export function PrivateProductImage({ source, alt }: { source: string; alt: string }) {
  const provider = useDataProvider();
  const identityQuery = useGetIdentity<{ id: string }>();
  const identity = identityQuery.data;
  const owner = !identityQuery.isLoading && !identityQuery.isError && !identityQuery.isFetching && identity?.id && UUID.test(identity.id) ? identity.id : "";
  const [state, setState] = useState<{ key: string; url?: string; failed?: boolean }>({ key: "" });
  const key = `${owner}|${source}`;
  const match = privateProductImagePath(source);
  const bucket = match?.bucket; const path = match?.path;
  useEffect(() => {
    let disposed = false; let objectUrl: string | undefined;
    if (!owner || !bucket || !path) return;
    setState({ key });
    void (async () => {
      try {
        const { data } = await provider("storage").getOne({ resource: bucket, id: path });
        if (disposed) return;
        if (!(data instanceof Blob) || !["image/jpeg", "image/png", "image/webp"].includes(data.type) || data.size === 0 || data.size > 8 * 1024 * 1024) throw new Error("Unsupported raster response");
        objectUrl = URL.createObjectURL(data);
        setState({ key, url: objectUrl });
      } catch { if (!disposed) setState({ key, failed: true }); }
    })();
    return () => { disposed = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [bucket, path, owner, key, provider]);
  if (!owner || !match || state.key === key && state.failed) return <Empty description="Product image unavailable" />;
  if (state.key !== key || !state.url) return <div role="status" aria-label="Loading private product image"><Skeleton.Image active /></div>;
  return <Image src={state.url} alt={alt} width="100%" height={260} style={{ objectFit: "contain" }} preview={false} onError={() => setState({ key, failed: true })} />;
}
