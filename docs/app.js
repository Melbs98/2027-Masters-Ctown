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

  container.innerHTML = `
    <div class="masters-banner-wrap">
      <div class="masters-banner">
        <div class="masters-banner-inner">
          <div class="masters-banner-message">${message}</div>
        </div>
      </div>
    </div>
  `;
}

function getCountdownParts(targetDate) {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return {
      days: "000",
      hours: "00",
      minutes: "00",
      seconds: "00"
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days: String(days).padStart(3, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0")
  };
}

function insertOrUpdateCountdown() {
  const pageHeader = document.querySelector(".page-header");
  if (!pageHeader) return;

  let countdownCard = document.getElementById("countdown-section");

  if (!countdownCard) {
    countdownCard = document.createElement("section");
    countdownCard.id = "countdown-section";
    countdownCard.className = "countdown-hero-section";

    countdownCard.innerHTML = `
      <div class="tick-style-countdown">
        <div class="tick-style-overlay"></div>
        <div class="tick-style-inner">
          <div class="tick-style-title">Countdown to the 2027 Masters Draft</div>

          <div class="tick-style-grid">
            <div class="tick-style-unit">
              <div class="tick-style-value" id="countdown-days">000</div>
              <div class="tick-style-label">Days</div>
            </div>

            <div class="tick-style-colon">:</div>

            <div class="tick-style-unit">
              <div class="tick-style-value" id="countdown-hours">00</div>
              <div class="tick-style-label">Hours</div>
            </div>

            <div class="tick-style-colon">:</div>

            <div class="tick-style-unit">
              <div class="tick-style-value" id="countdown-minutes">00</div>
              <div class="tick-style-label">Minutes</div>
            </div>

            <div class="tick-style-colon">:</div>

            <div class="tick-style-unit">
              <div class="tick-style-value tick-style-seconds" id="countdown-seconds">00</div>
              <div class="tick-style-label">Seconds</div>
            </div>
          </div>

          <div class="tick-style-subtext">April 7, 2027 at 7:00 PM PT</div>
        </div>
      </div>
    `;

    pageHeader.insertAdjacentElement("afterend", countdownCard);
  }

  const targetDate = new Date("2027-04-08T02:00:00Z");
  const parts = getCountdownParts(targetDate);

  const daysEl = document.getElementById("countdown-days");
  const hoursEl = document.getElementById("countdown-hours");
  const minutesEl = document.getElementById("countdown-minutes");
  const secondsEl = document.getElementById("countdown-seconds");

  if (daysEl) daysEl.textContent = parts.days;
  if (hoursEl) hoursEl.textContent = parts.hours;
  if (minutesEl) minutesEl.textContent = parts.minutes;
  if (secondsEl) secondsEl.textContent = parts.seconds;
}

function movePayoutsBelowGif() {
  const payoutsSection = document.getElementById("payouts-list")?.closest(".section-card");
  if (!payoutsSection) return;

  const gifImage = document.querySelector('img[alt="Celebration GIF"], img[alt="Masters Image"], img');
  if (!gifImage) return;

  const gifBlock = gifImage.closest("div");
  if (!gifBlock) return;

  if (gifBlock.nextElementSibling !== payoutsSection) {
    gifBlock.insertAdjacentElement("afterend", payoutsSection);
  }
}

function hideOffseasonSections() {
  const teamsGrid = document.getElementById("teams-grid");
  const scoresTable = document.getElementById("scores-table");

  const teamsSection = teamsGrid?.closest(".section-card");
  const scoresSection = scoresTable?.closest(".section-card");

  if (teamsSection) teamsSection.style.display = "none";
  if (scoresSection) scoresSection.style.display = "none";
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

  setTimeout(movePayoutsBelowGif, 50);

  setInterval(() => updateTimestamp(meta), 30000);
  setInterval(insertOrUpdateCountdown, 1000);
}

main().catch(error => {
  console.error(error);
  const updatedEl = document.getElementById("updated");
  if (updatedEl) {
    updatedEl.textContent = "Could not load updated data.";
  }
});
