const params = {
  breakdowns: "age, gender",
  // date_preset: "this_year",
  time_range: { since: "2023-12-01", until: "2023-12-31" },
  time_increment: 1,
  action_attribution_windows: ["7d_click", "1d_click", "1d_view"],
  sort: ["date_start_ascending"],
  level: "adset",
};

module.exports = params;
