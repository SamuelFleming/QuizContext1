let guard = null;

export function setLeaveGuard(next) {
  guard = next;
}

export function confirmLeave() {
  return guard ? guard() : true;
}
