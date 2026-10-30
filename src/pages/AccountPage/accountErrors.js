import { apiFieldErrors, apiFormError } from "@utils/validation";

/**
 * Splits an API error into messages for the fields it names and one for the
 * whole form. The resend cooldown (429 with a `retryAfter` detail) and the
 * admin refusal (403) carry wording meant for the visitor, so it is shown as is.
 */
export function accountErrors(error) {
  if (error.status === 429) {
    return { fields: {}, form: error.details ? error.message : apiFormError(error) };
  }

  if (error.status === 403) {
    return { fields: {}, form: error.message };
  }

  const fields = apiFieldErrors(error);

  return { fields, form: Object.keys(fields).length ? "" : apiFormError(error) };
}
