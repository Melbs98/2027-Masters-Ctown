async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
}

function formatRelativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes === 1) return "1 minute ago";
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours === 1) return "1 hour ago";
  if (diffHours < 24) return `${diffHours} hours ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

function formatLastUpdated(isoString) {
  const date = new Date(isoString);

  const formattedTime = date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });

  return `Last updated: ${formattedTime} (${formatRelativeTime(date)})`;
}

function updateTimestamp(meta) {
  const updatedEl = document.getElementById("updated");
  if (!updatedEl || !meta?.last_updated) return;
  updatedEl.textContent = formatLastUpdated(meta.last_updated);
}

function renderPayouts(data) {
  const container = document.getElementById("payouts-list");
  if (!container) return;

  container.innerHTML = "";

  const firstSection = data?.sections?.[0];
  const message = firstSection?.banner_message ?? "Wait for 2027, losers";
  const title = firstSection?.title ?? "Payouts";

  container.innerHTML = `
    <div class="masters-banner-wrap">
      <div class="masters-banner">
        <div class="masters-banner-inner">
          <div class="masters-banner-title">${title}</div>
          <div class="masters-banner-message">${message}</div>
        </div>
      </div>
    </div>
  `;
}

function getCountdownText(targetDate) {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return "Draft day is here.";
  }

  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  const dayLabel = days === 1 ? "day" : "days";
  const hourLabel = hours === 1 ? "hour" : "hours";

  return `${days} ${dayLabel}, ${hours} ${hourLabel}`;
}

function insertOrUpdateCountdown() {
  const payoutsList = document.getElementById("payouts-list");
  if (!payoutsList) return;

  const payoutsSection = payoutsList.closest(".section-card");
  if (!payoutsSection) return;

  let countdownCard = document.getElementById("countdown-section");

  if (!countdownCard) {
    countdownCard = document.createElement("section");
    countdownCard.id = "countdown-section";
    countdownCard.className = "section-card countdown-section";

    countdownCard.innerHTML = `
      <h2>Countdown to the 2027 Masters Draft</h2>
      <div class="countdown-card">
        <div class="countdown-time" id="countdown-time"></div>
        <div class="countdown-subtext">April 7, 2027 at 7:00 PM PT</div>
      </div>
    `;

    payoutsSection.insertAdjacentElement("afterend", countdownCard);
  }

  const countdownEl = document.getElementById("countdown-time");
  if (!countdownEl) return;

  // April 7, 2027 at 7:00 PM PT = April 8, 2027 02:00:00 UTC
  const targetDate = new Date("2027-04-08T02:00:00Z");
  countdownEl.textContent = getCountdownText(targetDate);
}

function hideOffseasonSections() {
  const teamsGrid = document.getElementById("teams-grid");
  const scoresTable = document.getElementById("scores-table");

  const teamsSection = teamsGrid?.closest(".section-card");
  const scoresSection = scoresTable?.closest(".section-card");

  if (teamsSection) {
    teamsSection.style.display = "none";
  }

  if (scoresSection) {
    scoresSection.style.display = "none";
  }
}

async function main() {
  const [payouts, meta] = await Promise.all([
    loadJson("./data/payouts_static.json"),
    loadJson("./data/meta.json")
  ]);

  renderPayouts(payouts);
  updateTimestamp(meta);
  insertOrUpdateCountdown();
  hideOffseasonSections();

  setInterval(() => updateTimestamp(meta), 30000);
  setInterval(insertOrUpdateCountdown, 60000);
}

main().catch(error => {
  console.error(error);
  const updatedEl = document.getElementById("updated");
  if (updatedEl) {
    updatedEl.textContent = "Could not load updated data.";
  }
});
