# SPDX-License-Identifier: AGPL-3.0-only
# Source-informed adaptation of Inventoros Supplier/Customer Store/Update requests,
# commit 1f78e818d9aee025020fe7489955f4f0c448c53a.
# https://github.com/Inventoros/Inventoros | https://www.gnu.org/licenses/agpl-3.0.html
# Local APP body only. See docs/inventory/CONTACT_SERVER_VALIDATION.md.


def main(params, user_data, sdk_client):
    """Validate visible full-form input only; no authentication or persistence."""
    import re
    from urllib.parse import urlsplit

    result = {
        "valid": False,
        "errors": {},
        "validation_scope": "input_only",
        "persistence": False,
        "unchecked": ["authorization", "relationships", "uniqueness", "workflow",
                      "email_rfc_validation", "source_url_equivalence", "storage_bounds"],
    }
    errors = result["errors"]
    form_error = "Only a supported resource and its visible form values are accepted."
    # Runtime-injected metadata is opaque, never read, trusted, merged or echoed.
    if (type(params) is not dict or len(params) not in (2, 3, 4, 5)
            or any(key not in ("resource", "values", "__function__", "request", "__method__") for key in params)
            or type(params.get("resource")) is not str
            or params["resource"] not in ("suppliers", "customers")
            or type(params.get("values")) is not dict):
        errors["_form"] = form_error
        return result

    resource = params["resource"]
    data = params["values"]
    if resource == "suppliers":
        text_fields = (
            "name", "code", "contact_name", "email", "phone", "website",
            "address", "city", "state", "zip_code", "country", "payment_terms",
            "currency", "notes",
        )
        number_field = "rating"
    else:
        text_fields = (
            "name", "code", "company_name", "contact_name", "email", "phone",
            "billing_address", "billing_city", "billing_state", "billing_zip_code",
            "billing_country", "shipping_address", "shipping_city", "shipping_state",
            "shipping_zip_code", "shipping_country", "tax_id", "payment_terms",
            "currency", "notes",
        )
        number_field = "credit_limit"
    allowed = text_fields + (number_field, "is_active")
    if len(data) > len(allowed) or any(key not in allowed for key in data):
        errors["_form"] = form_error
        return result

    values = {}
    # Same inspected source charset as catalog, kept local for standalone APP use.
    trim_characters = (
        "\x00\t\n\v\f\r \x85\xa0\u1680\u2028\u2029\u202f\u205f\u3000"
        "\u00ad\u034f\u061c\u115f\u1160\u17b4\u17b5\u180e"
        "\u2800\u3164\ufeff\uffa0\U0001d159\U000e0020"
        + "".join(chr(c) for c in range(0x2000, 0x2010))
        + "".join(chr(c) for c in range(0x2060, 0x2066))
        + "".join(chr(c) for c in range(0x206A, 0x2070))
        + "".join(chr(c) for c in range(0x1D173, 0x1D17B))
    )

    def normalize(value, bound=65536):
        # Bound BEFORE strip/regex/conversion; do not stringify untrusted values.
        if type(value) is str:
            if len(value) > bound:
                return None, "Input exceeds the validation size limit."
            value = value.strip(trim_characters)
            if any(0xD800 <= ord(char) <= 0xDFFF
                   or (ord(char) < 32 and char not in "\t\n\r")
                   or 127 <= ord(char) <= 159 for char in value):
                return None, "Use valid text without unsupported control characters."
            return value or None, None
        return value, None

    for field in text_fields:
        if field not in data:
            if field == "name":
                errors[field] = "This field is required."
            continue
        raw = data[field]
        if raw is not None and type(raw) is not str:
            errors[field] = "Must be text."
            continue
        value, error = normalize(raw)
        if error:
            errors[field] = error
            continue
        limit = 3 if field == "currency" else 255
        if field == "name" and value is None:
            errors[field] = "This field is required."
        elif (value is not None and field not in
              ("address", "billing_address", "shipping_address", "notes") and len(value) > limit):
            errors[field] = "Use at most 3 characters." if limit == 3 else "Use at most 255 characters."
        else:
            values[field] = value

    # Conservative syntax only, deliberately not Egulias/RFC or DNS validation.
    label = r"[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?"
    email = values.get("email")
    if email is not None:
        atom = r"[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+"
        if (not re.fullmatch(atom + r"(?:\." + atom + r")*@" + label + r"(?:\." + label + r")+", email)
                or len(email.split("@", 1)[0]) > 64):
            errors["email"] = "Enter an email address, such as name@example.com."

    website = values.get("website")
    if website is not None:
        url_valid = False
        if not any(char.isspace() or char == "\\" for char in website):
            try:
                url = urlsplit(website)
                url_valid = (
                    url.scheme.lower() in ("http", "https")
                    and url.username is None and url.password is None
                    and url.hostname is not None
                    and re.fullmatch(label + r"(?:\." + label + r")*", url.hostname) is not None
                    and (url.port is None or 0 <= url.port <= 65535)
                )
            except ValueError:
                url_valid = False
        if not url_valid:
            errors["website"] = "Enter an HTTP or HTTPS website URL without credentials."

    if "is_active" in data:
        active, error = normalize(data["is_active"])
        if error:
            errors["is_active"] = error
        elif active is None or type(active) is bool:
            values["is_active"] = active
        elif type(active) is int and active in (0, 1):
            values["is_active"] = active == 1
        elif type(active) is str and active in ("0", "1"):
            values["is_active"] = active == "1"
        else:
            errors["is_active"] = "Must be a boolean (true/false or 1/0), or empty."

    if number_field in data:
        number, error = normalize(data[number_field], 64)
        if error:
            errors[number_field] = error
        elif number is None:
            values[number_field] = None
        elif number_field == "rating":
            if type(number) is str and re.fullmatch(r"[+-]?[0-9]+", number):
                number = int(number)
            if type(number) is int and 0 <= number <= 5:
                values[number_field] = number
            else:
                errors[number_field] = "Choose a whole-number rating from 0 to 5, or leave it unrated."
        else:
            # Integer input is bounded before str(); floats are NEVER accepted.
            if type(number) is int and 0 <= number <= 9999999999:
                number = str(number)
            if type(number) is str and re.fullmatch(r"[0-9]{1,10}(?:\.[0-9]{1,2})?", number):
                values[number_field] = number
            else:
                errors[number_field] = "Enter 0 to 9999999999.99 as decimal text with at most 2 decimal places."

    if not errors:
        result["valid"] = True
        result["values"] = values
    return result
