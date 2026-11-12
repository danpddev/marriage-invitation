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

async function personalizeInvitation() {
  const match = window.location.pathname.match(/^\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/?$/i);
  if (!match) return;

  try {
    const response = await fetch("/invitados.json", { cache: "no-store" });
    if (!response.ok) return;
    const guests = await response.json();
    const id = match[1].toLowerCase();
    if (!guests || !Object.prototype.hasOwnProperty.call(guests, id)) return;
    const guest = guests[id];
    // Keep existing name-only entries working as individual invitations.
    const name = typeof guest === "string" ? guest : guest?.nombre;
    const type = typeof guest === "string" ? "uno" : guest?.tipo ?? "uno";
    if (typeof name !== "string" || !name.trim()) return;
    if (type !== "uno" && type !== "varios") return;

    $("#guestName").textContent = name.trim();
    $("#invite-heading").textContent = type === "varios" ? "¡Están invitados!" : "¡Estás invitado!";
    $("#invite-body").textContent = type === "varios" ? "sean" : "seas";
    $("#waitingPage").hidden = true;
    $("#invitationPage").hidden = false;
    updateCountdown();
    renderMusic();
    playMusic();
    setInterval(updateCountdown, 1000);
  } catch (error) {
    console.error("No se pudo cargar la invitación.", error);
  }
}

const weddingAudio = $("#weddingAudio");
let musicError = false;

function formatAudioTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "--:--";
  return `${pad(Math.floor(seconds / 60))}:${pad(Math.floor(seconds % 60))}`;
}

function renderMusic() {
  const playing = !weddingAudio.paused && !weddingAudio.ended;
  const label = playing ? "Pausar música" : "Reproducir música";
  $("#musicStatus").textContent = musicError ? "Audio no disponible" : playing ? "Música activada" : "Reproducir música";
  for (const selector of ["#musicToggle", "#topMusicToggle"]) {
    $(selector).setAttribute("aria-label", label);
    $(selector).setAttribute("aria-pressed", String(playing));
  }
  $("#musicToggleIcon").src = playing ? "assets/pause.svg" : "assets/play.svg";

  const current = weddingAudio.currentTime || 0;
  const duration = weddingAudio.duration;
  const progress = Number.isFinite(duration) && duration > 0
    ? Math.min(100, Math.max(0, current / duration * 100)) : 0;
  $("#musicProgress").style.width = `${progress}%`;
  $("#musicProgressBar").setAttribute("aria-valuenow", String(Math.round(progress)));
  $("#trackTime").textContent = formatAudioTime(current);
  $("#musicTime").textContent = `${formatAudioTime(current)} / ${formatAudioTime(duration)}`;
}

async function playMusic() {
  if ($("#invitationPage").hidden) return;
  musicError = false;
  try {
    await weddingAudio.play();
  } catch (error) {
    // Browsers may require a user gesture before playing audible media.
    musicError = error.name !== "NotAllowedError" && error.name !== "AbortError";
  }
  renderMusic();
}

function toggleMusic() {
  if (weddingAudio.paused || weddingAudio.ended) {
    if (weddingAudio.ended) weddingAudio.currentTime = 0;
    playMusic();
  } else {
    weddingAudio.pause();
  }
}

for (const event of ["play", "playing", "pause", "ended", "timeupdate", "loadedmetadata", "durationchange", "emptied"]) {
  weddingAudio.addEventListener(event, renderMusic);
}
weddingAudio.addEventListener("error", () => {
  musicError = true;
  renderMusic();
});

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
$("#acceptGiftDialog").addEventListener("click", () => {
  giftDialog.close();
  window.open('https://docs.google.com/spreadsheets/d/1evWLB6Fx00jHGuXn-tNj37cd7ef4PQk3_mU6bPnd61o/edit?usp=drivesdk', '_blank');
});
giftDialog.addEventListener("click", (event) => {
  const bounds = giftDialog.getBoundingClientRect();
  const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  if (outside) giftDialog.close();
});

$("#musicToggle").addEventListener("click", toggleMusic);
$("#topMusicToggle").addEventListener("click", toggleMusic);
$("#calendarButton").addEventListener("click", downloadCalendarEvent);

personalizeInvitation();
