"""Native SDK boundaries are fakes here; live authorization is a separate gate."""
import importlib.util
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock

import pytest


def invoke(params, sdk, user=None):
    path = Path(__file__).parents[1] / "functions" / "account_preferences.py"
    assert path.exists(), "Native account preferences function is not implemented"
    spec = importlib.util.spec_from_file_location("account_preferences", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.main(params, user, sdk)


@pytest.fixture
def sdk():
    return SimpleNamespace(users=SimpleNamespace(
        get_preferences=Mock(return_value={"status": "success", "data": {
            "date_format": "YYYY-MM-DD", "time_format": "24h", "timezone": "UTC",
            "theme": "dark", "widget_config": {"other_app": "must not leak or overwrite"},
        }}),
        update_preferences=Mock(return_value={"status": "success", "data": {}}),
    ))


def test_anonymous_does_not_reach_sdk(sdk):
    assert invoke({}, sdk)["code"] == "UNAUTHENTICATED"
    sdk.users.get_preferences.assert_not_called()


def test_get_projects_only_editable_fields(sdk):
    result = invoke({}, sdk, {"id": "trusted-platform-context"})
    assert result == {"ok": True, "verified": True, "preferences": {
        "date_format": "YYYY-MM-DD", "time_format": "24h", "timezone": "UTC"}}
    sdk.users.update_preferences.assert_not_called()


def test_ignores_runtime_request_metadata_without_treating_it_as_identity(sdk):
    result = invoke({"request": {"method": "POST"}, "__function__": {}, "__method__": "POST"}, sdk, {"id": "qa"})
    assert result["ok"] is True
    assert invoke({"request": {"user_id": "forged"}}, sdk)["code"] == "UNAUTHENTICATED"


@pytest.mark.parametrize("params", [
    {"username": "someone_else"}, {"organization_id": "foreign"},
    {"user_data": {"id": "fake"}}, {"action": "delete"}, [],
    {"action": "get", "values": {"timezone": "UTC"}},
    {"action": "update", "values": {"widget_config": {}}},
    {"action": "update", "values": {"theme": "auto"}},
    {"action": "update", "values": {}},
])
def test_rejects_unsupported_input_before_any_sdk_access(sdk, params):
    assert invoke(params, sdk, {"id": "qa"})["code"] == "VALIDATION_ERROR"
    sdk.users.update_preferences.assert_not_called()
    sdk.users.get_preferences.assert_not_called()


@pytest.mark.parametrize("field,value", [
    ("date_format", "Y-m-d"), ("date_format", None), ("time_format", "H:i"),
    ("timezone", "Not/AZone"), ("timezone", ""), ("timezone", []),
])
def test_returns_field_errors(sdk, field, value):
    result = invoke({"action": "update", "values": {field: value}}, sdk, {"id": "qa"})
    assert result["code"] == "VALIDATION_ERROR"
    assert field in result["errors"]
    sdk.users.update_preferences.assert_not_called()


def test_partial_update_omits_unrelated_preferences_and_verifies_readback(sdk):
    result = invoke({"action": "update", "values": {"timezone": "UTC"}}, sdk, {"id": "qa"})
    assert result["ok"] is True and result["verified"] is True
    sdk.users.update_preferences.assert_called_once_with({"timezone": "UTC"})
    sdk.users.get_preferences.assert_called_once_with()


def test_mismatched_readback_is_not_success(sdk):
    result = invoke({"action": "update", "values": {"timezone": "Asia/Kolkata"}}, sdk, {"id": "qa"})
    assert result["code"] == "READBACK_FAILED"
    assert result["ok"] is False
    sdk.users.update_preferences.assert_called_once()


def test_failed_readback_does_not_retry_write_or_expose_exception(sdk):
    sdk.users.get_preferences.side_effect = RuntimeError("PRIVATE_PROVIDER_DETAIL")
    result = invoke({"action": "update", "values": {"timezone": "UTC"}}, sdk, {"id": "qa"})
    assert result["code"] == "READBACK_FAILED"
    assert "PRIVATE_PROVIDER_DETAIL" not in str(result)
    sdk.users.update_preferences.assert_called_once()


def test_native_error_envelope_is_not_success(sdk):
    sdk.users.update_preferences.return_value = {"status": "error", "message": "PRIVATE"}
    result = invoke({"action": "update", "values": {"timezone": "UTC"}}, sdk, {"id": "qa"})
    assert result["code"] == "UPDATE_FAILED"
    assert "PRIVATE" not in str(result)
    sdk.users.get_preferences.assert_not_called()


def test_invalid_native_read_is_not_replaced_with_demo_defaults(sdk):
    sdk.users.get_preferences.return_value = {"status": "success", "data": {}}
    assert invoke({}, sdk, {"id": "qa"})["code"] == "LOAD_FAILED"
