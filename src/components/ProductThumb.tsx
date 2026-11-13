import { useEffect, useState } from "react";
import { useDataProvider, useGetIdentity } from "@refinedev/core";
import { Avatar, Skeleton } from "@mui/material";
import ImageNotSupportedRoundedIcon from "@mui/icons-material/ImageNotSupportedRounded";
import { privateProductImagePath } from "../services/productMedia";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Small list thumbnail for a private product image (session-backed storage download, local object URL). */
export function ProductThumb({ source, alt, size = 44, fill = false }: { source: unknown; alt: string; size?: number; fill?: boolean }) {
  const provider = useDataProvider();
  const identity = useGetIdentity<{ id: string }>();
  const owner = !identity.isLoading && !identity.isError && identity.data?.id && UUID.test(identity.data.id) ? identity.data.id : "";
  const match = typeof source === "string" ? privateProductImagePath(source) : null;
  const key = `${owner}|${typeof source === "string" ? source : ""}`;
  const [state, setState] = useState<{ key: string; url?: string; failed?: boolean }>({ key: "" });
  const bucket = match?.bucket; const path = match?.path;
  useEffect(() => {
    let disposed = false; let objectUrl: string | undefined;
    if (!owner || !bucket || !path) return;
    setState({ key });
    void (async () => {
      try {
        const { data } = await provider("storage").getOne({ resource: bucket, id: path });
        if (disposed) return;
        if (!(data instanceof Blob) || !["image/jpeg", "image/png", "image/webp"].includes(data.type) || data.size === 0 || data.size > 8 * 1024 * 1024) throw new Error("Unsupported raster");
        objectUrl = URL.createObjectURL(data); setState({ key, url: objectUrl });
      } catch { if (!disposed) setState({ key, failed: true }); }
    })();
    return () => { disposed = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [bucket, path, owner, key, provider]);
  const box = fill ? { width: "100%", height: 280, borderRadius: 2, bgcolor: "action.hover", color: "text.disabled", "& img": { objectFit: "contain" } } : { width: size, height: size, borderRadius: 1.5, bgcolor: "action.hover", color: "text.disabled" };
  if (match && owner && (state.key !== key || (!state.url && !state.failed))) return <Skeleton variant="rounded" width={fill ? "100%" : size} height={fill ? 280 : size} />;
  if (!state.url || state.key !== key) return <Avatar variant="rounded" sx={box} aria-label={`${alt}: no image`}><ImageNotSupportedRoundedIcon fontSize={fill ? "large" : "small"} /></Avatar>;
  return <Avatar variant="rounded" src={state.url} alt={alt} sx={box} />;
}
