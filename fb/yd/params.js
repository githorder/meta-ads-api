const params = {
  breakdowns: "age, gender",
  // date_preset: "this_year",
  time_range: { since: "2024-01-01", until: "2024-01-18" },
  time_increment: 1,
  action_attribution_windows: ["7d_click", "1d_click", "1d_view"],
  sort: ["date_start_ascending"],
  level: "adset",
};

module.exports = params;
