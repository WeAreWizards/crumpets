function monthly_rate(principal: number, r: number, t: number): number {
  return principal * r * Math.pow(r + 1, t) / (Math.pow(r + 1, t) - 1);
}

function principal_left(principal: number, r: number, A: number, t: number): number {
  var s: number = 0;
  for (var i = 0; i < t; i++) {
    s += Math.pow(1 + r, i);
  }
  return principal * Math.pow(1 + r, t) - A * s;
}

function progression(
  principal: number,
  fixed_years: number,
  initial_rate: number,
  followup_rate: number,
  total_duration_month: number): number[]
{
  var A_initial = monthly_rate(principal, initial_rate, total_duration_month);
  var left = principal_left(principal, initial_rate, A_initial, fixed_years);
  var A_followup = monthly_rate(left, followup_rate, total_duration_month - fixed_years);

  return [A_initial, A_followup];
}

angular
  .module("mortgage", [])
  .value("mortgage", {
    monthly_rate: monthly_rate,
    principal_left: principal_left,
    progression: progression
  });

