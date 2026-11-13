import { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
import { prepareProductImage, type ProductImageSelection } from "../services/productMedia";
import { PrivateProductImage } from "./PrivateProductImage";

export function ProductImageField({ selection, existingSource, disabled, onChange, onPendingChange, onErrorChange }: {
  selection: ProductImageSelection | null;
  existingSource?: string;
  disabled: boolean;
  onChange: (selection: ProductImageSelection | null) => void;
  onPendingChange: (pending: boolean) => void;
  onErrorChange: (failed: boolean) => void;
}) {
  const generation = useRef(0);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<{ file: File; url: string }>();
  useEffect(() => () => { generation.current += 1; }, []);
  useEffect(() => {
    if (!selection) { setPreview(undefined); return; }
    const url = URL.createObjectURL(selection.file);
    setPreview({ file: selection.file, url });
    return () => URL.revokeObjectURL(url);
  }, [selection]);
  const choose = async (file: File) => {
    const version = ++generation.current;
    setPreparing(true); onPendingChange(true); setError(""); onErrorChange(false);
    try {
      const prepared = await prepareProductImage(file);
      if (generation.current === version) onChange(prepared);
    } catch (reason) {
      if (generation.current === version) {
        setError(reason instanceof Error ? reason.message : "Unable to prepare the image. Choose another file.");
        onErrorChange(true);
      }
    } finally {
      if (generation.current === version) { setPreparing(false); onPendingChange(false); }
    }
  };
  return <Stack spacing={2}>
    <Typography variant="h6">Product image</Typography>
    <Typography variant="body2" color="text.secondary">PNG, JPEG or WebP, up to 2 MB. The image is saved with the product.</Typography>
    {error && <Alert severity="error">{error} Remove the selection or choose another file before saving.</Alert>}
    {selection ? <>
      {preview?.file === selection.file && <Box component="img" src={preview.url} alt="Selected product image preview" sx={{ maxWidth: "100%", height: 200, objectFit: "contain", alignSelf: "flex-start" }} />}
      <Typography variant="body2">{selection.file.name}</Typography>
      <Typography variant="caption">Selected image — not saved yet.</Typography>
    </> : existingSource ? <Box sx={{ maxWidth: 360 }}><PrivateProductImage source={existingSource} alt="Current product image" /></Box> : <Typography color="text.secondary">No product image selected.</Typography>}
    <Stack direction="row" spacing={1.25}>
      <Button component="label" variant="outlined" disabled={disabled || preparing} startIcon={preparing ? <CircularProgress size={16} /> : <UploadRoundedIcon />}>
        {preparing ? "Preparing image" : "Choose image"}
        <input type="file" hidden aria-label="Product image file" accept="image/png,image/jpeg,image/webp" disabled={disabled || preparing} onChange={event => {
          const file = event.target.files?.[0]; event.target.value = "";
          if (file) void choose(file);
        }} />
      </Button>
      {(selection || error) && <Button disabled={disabled || preparing} onClick={() => { onChange(null); setError(""); onErrorChange(false); }}>Remove selected image</Button>}
    </Stack>
    {existingSource && <Typography variant="caption">Removing a selection keeps the existing saved image.</Typography>}
  </Stack>;
}
