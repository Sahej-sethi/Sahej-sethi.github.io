// Reading Progress — About Page
// Remembers how far the visitor got and offers to take them back there.

const POSITION_KEY = "about_last_scroll_px";
const PERCENT_KEY  = "about_last_scroll_pct";

// How far through the page is the reader right now, as a 0–100 integer.
// We subtract innerHeight because the last "screen" of content isn't
// truly scrollable — you arrive at the bottom without ever scrolling past it.
export function howFarThrough() {
    const scrolled  = window.scrollY;
    const canScroll = document.documentElement.scrollHeight - window.innerHeight;

    if (canScroll <= 0) return 0; // page fits on screen, nothing to track

    return Math.min(Math.round((scrolled / canScroll) * 100), 100);
}

// Snapshot the reader's current position into sessionStorage.
// Session storage is intentional — if they close the tab, the bookmark
// disappears. It only makes sense to resume within the same visit.
export function rememberPosition() {
    sessionStorage.setItem(POSITION_KEY, window.scrollY.toString());
    sessionStorage.setItem(PERCENT_KEY, howFarThrough().toString());
}

// Pull back whatever position we saved, or null if there's nothing saved yet.
export function lastKnownPosition() {
    const pixels  = sessionStorage.getItem(POSITION_KEY);
    const percent = sessionStorage.getItem(PERCENT_KEY);

    if (pixels === null || percent === null) return null;

    return {
        scrollY:  parseInt(pixels),
        percent:  parseInt(percent),
    };
}

// Nudge the progress bar to match where the reader currently is.
function refreshProgressBar(progressBar) {
    progressBar.style.width = howFarThrough() + "%";
}

// Stamp a thin progress bar onto the top of the page.
// Appearance (height, color, z-index) lives in CSS — we just create the element.
function mountProgressBar() {
    const progressBar = document.createElement("div");
    progressBar.classList.add("reading-progress-bar");
    document.body.appendChild(progressBar);
    return progressBar;
}

// Slide in a little prompt asking if the reader wants to pick up where they left off.
// We only show this when they were meaningfully into the page (see initReadingProgress).
function offerToResume(savedPosition) {
    const prompt = document.createElement("div");
    prompt.classList.add("resume-prompt");

    prompt.innerHTML = `
        <div class="resume-prompt-content">
            <i class="fa-solid fa-bookmark resume-prompt-icon"></i>
            <span class="resume-prompt-text">
                You made it ${savedPosition.percent}% through last time
            </span>
            <button class="resume-prompt-btn resume-btn-yes">Take me back</button>
            <button class="resume-prompt-btn resume-btn-no">Start from the top</button>
        </div>
    `;

    document.body.appendChild(prompt);

    // The element needs one frame to exist in the DOM before the CSS transition
    // has anything to animate from. Without this, the entrance animation is skipped.
    requestAnimationFrame(() => {
        prompt.classList.add("resume-prompt-visible");
    });

    const slideOut = () => {
        prompt.classList.remove("resume-prompt-visible");

        // Wait for the exit transition to finish before removing from DOM,
        // so the animation isn't cut short.
        prompt.addEventListener("transitionend", () => prompt.remove(), { once: true });
    };

    prompt.querySelector(".resume-btn-yes").addEventListener("click", () => {
        window.scrollTo({ top: savedPosition.scrollY, behavior: "smooth" });
        slideOut();
    });

    prompt.querySelector(".resume-btn-no").addEventListener("click", slideOut);

    // If they ignore the prompt, get it out of the way after 8 seconds.
    setTimeout(() => {
        if (document.body.contains(prompt)) slideOut();
    }, 8000);
}

// Wire everything up.
export function initReadingProgress() {
    const progressBar = mountProgressBar();

    window.addEventListener("scroll", () => {
        refreshProgressBar(progressBar);
        rememberPosition();
    });

    // Reflect position immediately in case the browser restored scroll on load.
    refreshProgressBar(progressBar);

    // Only offer to resume if they actually read something worth returning to.
    // 5% filters out people who barely glanced at the page.
    const savedPosition = lastKnownPosition();
    if (savedPosition && savedPosition.percent > 5) {
        offerToResume(savedPosition);
    }
}