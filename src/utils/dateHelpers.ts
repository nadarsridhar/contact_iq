function formatDuration(seconds: number, config = {}): string {
  const hours = Math.floor(seconds / 3600); // Calculate hours
  const minutes = Math.floor((seconds % 3600) / 60); // Calculate remaining minutes
  const remainingSeconds = Math.floor(seconds % 60); // Calculate remaining seconds
  // Ensure two-digit formatting for minutes and seconds
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  if (!config?.showHours) return `${formattedMinutes}:${formattedSeconds}`;
  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

function formatDurationStats(seconds) {
  const days = Math.floor(seconds / 86400);
  const remaining = seconds % 86400;

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const secs = remaining % 60;

  const timeStr = [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(secs).padStart(2, "0"),
  ].join(":");

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} ${timeStr}`;
  } else {
    return timeStr;
  }
}

function convertDateTime(unixTimestamp, onlyTime = false, hideYear = false) {
  const date = new Date(unixTimestamp * 1000); // Convert to milliseconds

  const timeOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  const dayTimeOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  if (hideYear) delete dayTimeOptions["year"];

  let options;
  if (onlyTime) {
    options = timeOptions;
  } else {
    options = dayTimeOptions;
  }

  return date.toLocaleString("en-GB", options).replace(",", "").toUpperCase();
}

function convertCallDurationSeconds(seconds) {
  const date = new Date(null);
  date.setSeconds(seconds);
  return date.toISOString().substr(11, 8);
}

export {
  convertDateTime,
  formatDuration,
  convertCallDurationSeconds,
  formatDurationStats,
};
