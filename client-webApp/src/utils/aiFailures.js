const FAILURE_LABELS = {
  output_truncated: "The reply was cut off before it finished.",
};

export function aiFailureLabel(code) {
  return FAILURE_LABELS[code] || code;
}
