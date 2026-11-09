"""Private Taruvi function. Identity belongs to the injected native SDK only."""
import pytz


def failure(code, errors=None):
    return {"ok": False, "verified": False, "code": code, "errors": errors or {}}


def preferences_from_response(response):
    if not isinstance(response, dict) or response.get("status") != "success":
        return None
    data = response.get("data")
    fields = ("date_format", "time_format", "timezone")
    if not isinstance(data, dict) or not all(isinstance(data.get(key), str) and data[key] for key in fields):
        return None
    return {key: data[key] for key in fields}


def main(params, user_data, sdk_client):
    if not user_data:
        return failure("UNAUTHENTICATED")
    if not isinstance(params, dict):
        return failure("VALIDATION_ERROR", {"_form": "Expected an object."})
    # Runtime metadata is not an identity/authorization source.
    if any(key not in ("action", "values", "__function__", "__method__", "request") for key in params):
        return failure("VALIDATION_ERROR", {"_form": "Unsupported request field."})
    action = params.get("action", "get")
    if action not in ("get", "update") or (action == "get" and "values" in params):
        return failure("VALIDATION_ERROR", {"_form": "Unsupported request action."})

    values = {}
    if action == "update":
        values = params.get("values")
        if not isinstance(values, dict) or not values or any(
            key not in ("date_format", "time_format", "timezone") for key in values
        ):
            return failure("VALIDATION_ERROR", {"_form": "Provide only date format, time format or timezone."})
        errors = {}
        for key, value in values.items():
            if key == "date_format" and value not in ("YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY", "DD-MMM-YYYY"):
                errors[key] = "Choose a supported date format."
            elif key == "time_format" and value not in ("24h", "12h"):
                errors[key] = "Choose 24h or 12h."
            elif key == "timezone" and (not isinstance(value, str) or value not in pytz.all_timezones_set):
                errors[key] = "Enter a valid IANA timezone, such as Asia/Kolkata."
        if errors:
            return failure("VALIDATION_ERROR", errors)
        try:
            response = sdk_client.users.update_preferences(values)
            if not isinstance(response, dict) or response.get("status") != "success":
                return failure("UPDATE_FAILED")
        except Exception:
            # No retry: a network error may happen after the native write commits.
            return failure("UPDATE_UNCONFIRMED")

    try:
        preferences = preferences_from_response(sdk_client.users.get_preferences())
    except Exception:
        return failure("READBACK_FAILED" if action == "update" else "LOAD_FAILED")
    if preferences is None:
        return failure("READBACK_FAILED" if action == "update" else "LOAD_FAILED")
    if any(preferences.get(key) != value for key, value in values.items()):
        return failure("READBACK_FAILED")
    return {"ok": True, "verified": True, "preferences": preferences}
