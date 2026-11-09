import { useEffect, useRef, useState } from "react";
import { useCustom, useCustomMutation, useNotification, useWarnAboutChange } from "@refinedev/core";
import { Controller, useForm } from "react-hook-form";
import { Alert, Box, Breadcrumbs, Button, Card, CardContent, CircularProgress, Link, MenuItem, Skeleton, Stack, TextField, Typography } from "@mui/material";
import { PageContainer } from "../../components/PageContainer";
import {
  ACCOUNT_PREFERENCES_FUNCTION, DATE_FORMATS, FUNCTION_META, PREFERENCE_FIELDS,
  decodePreferences, preferenceChanges, PreferencesError, type AccountPreferences as Preferences,
} from "../../services/accountPreferences";

const queryOptions = {
  retry: false, refetchOnWindowFocus: false, refetchOnReconnect: false,
  select: (response: { data: unknown }) => ({ data: decodePreferences(response.data) }),
};

function PreferencesForm({ initial, reload, reloading }: { initial: Preferences; reload: () => void; reloading: boolean }) {
  const baseline = useRef(initial);
  const { control, register, handleSubmit, reset, setError, formState: { errors, isDirty, isSubmitting } } = useForm<Preferences>({ defaultValues: initial });
  const { mutateAsync, mutation } = useCustomMutation();
  const { open } = useNotification();
  const { setWarnWhen } = useWarnAboutChange();
  const [message, setMessage] = useState("");
  const [needsReload, setNeedsReload] = useState(false);
  const busy = isSubmitting || mutation.isPending || reloading;
  useEffect(() => { setWarnWhen?.(isDirty); return () => setWarnWhen?.(false); }, [isDirty, setWarnWhen]);

  const save = handleSubmit(async (values) => {
    if (needsReload) return;
    const changes = preferenceChanges(baseline.current, values);
    if (!Object.keys(changes).length) return;
    setMessage("");
    try {
      const response = await mutateAsync({
        url: ACCOUNT_PREFERENCES_FUNCTION, method: "post", dataProviderName: "app",
        meta: FUNCTION_META, values: { action: "update", values: changes },
        successNotification: false, errorNotification: false,
      });
      const saved = decodePreferences(response.data);
      baseline.current = saved;
      reset(saved);
      open?.({ type: "success", message: "Preferences saved and verified." });
    } catch (error) {
      const known = error instanceof PreferencesError;
      setMessage(known ? error.message : "Save could not be confirmed. Reload preferences before trying again.");
      setNeedsReload(!known || ["READBACK_FAILED", "UPDATE_UNCONFIRMED", "INVALID_RESPONSE"].includes(error.code));
      if (known) for (const key of PREFERENCE_FIELDS) {
        if (error.fields[key]) setError(key, { type: "server", message: error.fields[key] });
      }
    }
  });

  return <Box component="form" onSubmit={save} noValidate aria-busy={busy}>
    {message && <Alert severity="error" sx={{ mb: 2 }}>{message}</Alert>}
    <Box component="fieldset" disabled={busy} sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
      <Stack spacing={2}>
        <Typography variant="h6" component="h3">Regional preferences</Typography>
        <Controller control={control} name="date_format" rules={{ required: "Choose a date format." }} render={({ field }) => <TextField select required disabled={busy} label="Date format" {...field} value={field.value ?? ""}
          error={!!errors.date_format} helperText={errors.date_format?.message}>
          {DATE_FORMATS.map(format => <MenuItem key={format} value={format}>{format}</MenuItem>)}
        </TextField>} />
        <Controller control={control} name="time_format" rules={{ required: "Choose a time format." }} render={({ field }) => <TextField select required disabled={busy} label="Time format" {...field} value={field.value ?? ""}
          error={!!errors.time_format} helperText={errors.time_format?.message}>
          <MenuItem value="24h">24-hour</MenuItem><MenuItem value="12h">12-hour</MenuItem>
        </TextField>} />
        <TextField required disabled={busy} label="Timezone" {...register("timezone", { required: "Enter an IANA timezone.", maxLength: { value: 100, message: "Timezone must be at most 100 characters." } })}
          error={!!errors.timezone} helperText={errors.timezone?.message ?? "IANA name, for example Asia/Kolkata or UTC."} />
      </Stack>
    </Box>
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ mt: 3, justifyContent: "flex-end" }}>
      <Button type="button" disabled={busy || (isDirty && !needsReload)} onClick={reload}>Reload preferences</Button>
      <Button type="button" variant="outlined" disabled={busy} onClick={() => { reset(baseline.current); if (!needsReload) setMessage(""); }}>Cancel</Button>
      <Button type="submit" variant="contained" disabled={busy || !isDirty || needsReload}
        startIcon={busy ? <CircularProgress size={16} /> : undefined}>Save changes</Button>
    </Stack>
  </Box>;
}

export function AccountPreferences() {
  const { result, query } = useCustom<Preferences>({
    url: ACCOUNT_PREFERENCES_FUNCTION, method: "post", dataProviderName: "app",
    meta: FUNCTION_META, queryOptions, errorNotification: false,
  });
  return <PageContainer>
    <Breadcrumbs aria-label="Breadcrumb"><Link href="/">Home</Link><Typography>Account preferences</Typography></Breadcrumbs>
    <Typography variant="h2" sx={{ mt: 2, mb: 1 }}>Account preferences</Typography>
    <Typography color="text.secondary" sx={{ mb: 3 }}>Your Taruvi account's date, time and timezone preferences. These apply to your account, not the organization's settings.</Typography>
    <Card><CardContent>
      {query.isLoading ? <Stack role="status" aria-label="Loading account preferences" spacing={2}>
        <Skeleton height={56} /><Skeleton height={56} /><Skeleton height={56} />
      </Stack> : query.isError ? <Alert severity="error" action={<Button onClick={() => void query.refetch()}>Retry</Button>}>
        Unable to load account preferences.
      </Alert> : <PreferencesForm key={query.dataUpdatedAt} initial={result.data} reloading={query.isFetching} reload={() => void query.refetch()} />}
    </CardContent></Card>
  </PageContainer>;
}
