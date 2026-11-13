import { useEffect, useRef, useState } from "react";
import { useCustomMutation, useNotification } from "@refinedev/core";
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import type { ErpRecord } from "../services/erp";

const CONTACT_COMMAND = "hmg-contact-master-v1";
type Values = { name: string; company_name: string; contact_name: string; email: string; phone: string; billing_address: string; billing_city: string; billing_state: string; billing_zip_code: string; shipping_address: string };
const EMPTY: Values = { name: "", company_name: "", contact_name: "", email: "", phone: "", billing_address: "", billing_city: "", billing_state: "", billing_zip_code: "", shipping_address: "" };
const LABELS: Record<keyof Values, string> = { name: "Customer name", company_name: "Company", contact_name: "Contact person", email: "Email", phone: "Phone", billing_address: "Billing address", billing_city: "City", billing_state: "State", billing_zip_code: "PIN code", shipping_address: "Shipping address (if different)" };

/**
 * Saves one customer through the verified contact command, then hands the
 * read-back record to the caller so the order form can prefill from it.
 * The order itself is a separate, explicit save.
 */
export function QuickCustomerDialog({ open, organizationId, currency, initialName, onClose, onCreated }: {
  open: boolean; organizationId: string; currency: string; initialName?: string;
  onClose: () => void; onCreated: (customer: ErpRecord) => void;
}) {
  const [values, setValues] = useState<Values>(EMPTY);
  const [error, setError] = useState("");
  const requestId = useRef("");
  const { mutateAsync, mutation } = useCustomMutation();
  const { open: notify } = useNotification();
  useEffect(() => { if (open) { setValues({ ...EMPTY, name: initialName?.trim() ?? "" }); setError(""); requestId.current = crypto.randomUUID(); } }, [open, initialName]);
  const set = (key: keyof Values) => (event: React.ChangeEvent<HTMLInputElement>) => setValues(current => ({ ...current, [key]: event.target.value }));
  const nameError = !values.name.trim() ? "Enter the customer name." : values.name.trim().length > 255 ? "Use 255 characters or fewer." : "";
  const emailError = values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()) ? "Enter an email address, such as name@example.com." : "";
  const save = async () => {
    if (nameError || emailError || mutation.isPending) return;
    setError("");
    const trimmed = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]).filter(([, value]) => value !== ""));
    const payload = { ...trimmed, shipping_address: values.shipping_address.trim() || values.billing_address.trim() || undefined, billing_country: "IN", currency, is_active: true };
    try {
      const response = await mutateAsync({ url: CONTACT_COMMAND, method: "post", dataProviderName: "app", meta: { kind: "function", async: false },
        values: { resource: "customers", action: "create", organization_id: organizationId, request_id: requestId.current, values: Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)) },
        successNotification: false, errorNotification: false });
      const result = response.data as { ok?: boolean; verified?: boolean; code?: string; record?: ErpRecord } | undefined;
      if (result?.ok !== true || result.verified !== true || !result.record?.id) {
        setError(result?.code === "DUPLICATE_CODE" ? "A customer with this code already exists." : "The customer could not be saved. Check the details and try again.");
        return;
      }
      notify?.({ type: "success", message: "Customer added", description: `${String(result.record.name)} is saved and selected for this order.` });
      onCreated(result.record);
    } catch {
      setError("The customer could not be confirmed. Check the Customers list before trying again.");
    }
  };
  return <Dialog open={open} onClose={() => { if (!mutation.isPending) onClose(); }} aria-labelledby="quick-customer-title" fullWidth maxWidth="sm">
    <DialogTitle id="quick-customer-title">Add new customer</DialogTitle>
    <DialogContent>
      <Stack spacing={2} sx={{ pt: 1 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label={LABELS.name} required autoFocus value={values.name} onChange={set("name")} error={!!nameError && values.name !== ""} helperText={values.name !== "" ? nameError : undefined} inputProps={{ maxLength: 255 }} />
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
          <TextField label={LABELS.company_name} value={values.company_name} onChange={set("company_name")} />
          <TextField label={LABELS.contact_name} value={values.contact_name} onChange={set("contact_name")} />
          <TextField label={LABELS.email} type="email" value={values.email} onChange={set("email")} error={!!emailError} helperText={emailError || undefined} />
          <TextField label={LABELS.phone} type="tel" value={values.phone} onChange={set("phone")} />
        </Box>
        <TextField label={LABELS.billing_address} multiline minRows={2} value={values.billing_address} onChange={set("billing_address")} />
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" } }}>
          <TextField label={LABELS.billing_city} value={values.billing_city} onChange={set("billing_city")} />
          <TextField label={LABELS.billing_state} value={values.billing_state} onChange={set("billing_state")} />
          <TextField label={LABELS.billing_zip_code} value={values.billing_zip_code} onChange={set("billing_zip_code")} />
        </Box>
        <TextField label={LABELS.shipping_address} multiline minRows={2} value={values.shipping_address} onChange={set("shipping_address")} helperText="Leave blank to ship to the billing address." />
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
      <Button variant="contained" onClick={() => void save()} disabled={!!nameError || !!emailError || mutation.isPending || !organizationId} startIcon={mutation.isPending ? <CircularProgress size={16} /> : undefined}>Save customer</Button>
    </DialogActions>
  </Dialog>;
}
