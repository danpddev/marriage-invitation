const WEDDING_DATE = new Date("2026-12-06T16:00:00-05:00");

const $ = (selector) => document.querySelector(selector);
const pad = (value) => String(value).padStart(2, "0");

function updateCountdown() {
  const remaining = Math.max(0, WEDDING_DATE.getTime() - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);
  $("#days").textContent = Math.floor(totalSeconds / 86400);
  $("#hours").textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
  $("#minutes").textContent = pad(Math.floor((totalSeconds % 3600) / 60));
  $("#seconds").textContent = pad(totalSeconds % 60);
}

function personalizeInvitation() {
  const params = new URLSearchParams(window.location.search);
  const guest = params.get("invitado") || params.get("guest");
  if (!guest) return;
  const cleanGuest = guest.trim().slice(0, 70);
  if (cleanGuest) $("#guestName").textContent = cleanGuest;
}

let musicPlaying = true;
let simulatedProgress = 44;
function renderMusic() {
  $("#musicStatus").textContent = musicPlaying ? "Música activada" : "Música pausada";
  $("#musicToggle").setAttribute("aria-label", musicPlaying ? "Pausar música" : "Reanudar música");
  $("#musicToggleIcon").src = musicPlaying ? "assets/pause.svg" : "assets/music-note.svg";
}
function toggleMusic() {
  musicPlaying = !musicPlaying;
  renderMusic();
}

setInterval(() => {
  if (!musicPlaying) return;
  simulatedProgress = simulatedProgress >= 100 ? 0 : simulatedProgress + .12;
  $("#musicProgress").style.width = `${simulatedProgress}%`;
}, 250);

function downloadCalendarEvent() {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Andres y Marianny//Invitacion de boda//ES",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:andres-marianny-20261206@boda",
    "DTSTAMP:20261028T120000Z",
    "DTSTART:20261206T210000Z",
    "DTEND:20261207T040000Z",
    "SUMMARY:Boda de Andrés y Marianny",
    "DESCRIPTION:Acompáñanos a celebrar el inicio de nuestra vida juntos.",
    "LOCATION:Salón Comunal de Muzu, Cl. 42 Sur 51C-07, Bogotá, Colombia",
    "BEGIN:VALARM",
    "TRIGGER:-P7D",
    "ACTION:DISPLAY",
    "DESCRIPTION:La boda de Andrés y Marianny es en una semana",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "boda-andres-marianny.ics";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Recordatorio listo para agregar a tu calendario");
}

let toastTimer;
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

const giftDialog = $("#giftDialog");
$("#giftButton").addEventListener("click", () => giftDialog.showModal());
$("#closeGiftDialog").addEventListener("click", () => giftDialog.close());
$("#acceptGiftDialog").addEventListener("click", () => giftDialog.close());
giftDialog.addEventListener("click", (event) => {
  const bounds = giftDialog.getBoundingClientRect();
  const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  if (outside) giftDialog.close();
});

$("#musicToggle").addEventListener("click", toggleMusic);
$("#topMusicToggle").addEventListener("click", toggleMusic);
$("#calendarButton").addEventListener("click", downloadCalendarEvent);

personalizeInvitation();
updateCountdown();
renderMusic();
setInterval(updateCountdown, 1000);
