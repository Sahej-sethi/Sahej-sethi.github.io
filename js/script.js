// ============================================================
// 1. Reading Progress Bar + Resume Prompt (formerly readingProgress.js)
// ============================================================

const POSITION_KEY = "site_last_scroll_px";
const PERCENT_KEY  = "site_last_scroll_pct";

function howFarThrough() {
    const scrolled  = window.scrollY;
    const canScroll = document.documentElement.scrollHeight - window.innerHeight;

    if (canScroll <= 0) return 0;

    return Math.min(Math.round((scrolled / canScroll) * 100), 100);
}

function rememberPosition() {
    localStorage.setItem(POSITION_KEY, window.scrollY.toString());
    localStorage.setItem(PERCENT_KEY, howFarThrough().toString());

    // Clear saved position if user has essentially finished reading
    if (howFarThrough() >= 95) {
        localStorage.removeItem(POSITION_KEY);
        localStorage.removeItem(PERCENT_KEY);
    }
}

function lastKnownPosition() {
    const pixels  = localStorage.getItem(POSITION_KEY);
    const percent = localStorage.getItem(PERCENT_KEY);

    if (pixels === null || percent === null) return null;

    return {
        scrollY:  parseInt(pixels),
        percent:  parseInt(percent),
    };
}

function refreshProgressBar(progressBar) {
    progressBar.style.width = howFarThrough() + "%";
}

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

    requestAnimationFrame(() => {
        prompt.classList.add("resume-prompt-visible");
    });

    const slideOut = () => {
        prompt.classList.remove("resume-prompt-visible");
        prompt.addEventListener("transitionend", () => prompt.remove(), { once: true });
    };

    prompt.querySelector(".resume-btn-yes").addEventListener("click", () => {
        window.scrollTo({ top: savedPosition.scrollY, behavior: "smooth" });
        slideOut();
    });

    prompt.querySelector(".resume-btn-no").addEventListener("click", slideOut);

    setTimeout(() => {
        if (document.body.contains(prompt)) slideOut();
    }, 8000);
}

// Init reading progress
{
    const progressBar = document.querySelector(".reading-progress-bar");

    window.addEventListener("scroll", () => {
        refreshProgressBar(progressBar);
        rememberPosition();
    });

    refreshProgressBar(progressBar);

    const savedPosition = lastKnownPosition();
    if (savedPosition && savedPosition.percent > 5) {
        offerToResume(savedPosition);
    }
}

// ============================================================
// 2. Active Nav Link Highlighting (IntersectionObserver)
// ============================================================

{
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-links");

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                navLinks.forEach(link => {
                    link.classList.toggle("active", link.getAttribute("href") === "#" + id);
                });
            }
        });
    }, {
        rootMargin: "-40% 0px -55% 0px",
        threshold: 0
    });

    sections.forEach(section => navObserver.observe(section));
}

// ============================================================
// 3. TypedText Class + Instantiation
// ============================================================

class TypedText {

  constructor(element, config) {

    this.element = element;

    this.strings = config.strings;
    this.typingSpeed = config.typingSpeed;
    this.eraseSpeed = config.eraseSpeed;
    this.pauseDuration = config.pauseDuration;

    this.idx = 0;
    this.charidx = 0;
    this.isDeleting = false;

    this.type();
  }

  type() {

    const current = this.strings[this.idx];

    if (this.isDeleting) {
      this.charidx--;
    } else {
      this.charidx++;
    }

    this.element.textContent = current.substring(0, this.charidx);

    let speed = this.isDeleting ? this.eraseSpeed : this.typingSpeed;

    if (this.charidx === current.length && !this.isDeleting) {
      this.isDeleting = true;
      speed = this.pauseDuration;
    }

    else if (this.charidx === 0 && this.isDeleting) {
      this.isDeleting = false;
      this.idx = (this.idx + 1) % this.strings.length;
      speed = 500;
    }

    setTimeout(() => this.type(), speed);
  }
}

if (document.querySelector(".var-text")) {
  const line = document.querySelector(".var-text");

  new TypedText(line, {
    strings: [
      "Systems Programmer",
      "Competitive Programmer", 
      "C++ Developer",
      "Open Source Builder"
    ],
    typingSpeed: 100,
    eraseSpeed: 50,
    pauseDuration: 2000
  });
}

// ============================================================
// 4. Particle Canvas
// ============================================================

if (document.getElementById("particles-in-bg")) {

  class particle {
    constructor(posX, posY, speedY, r, op) {
      this.posX = posX;
      this.posY = posY;
      this.speedY = speedY;
      this.r = r;
      this.op = op;
    }
  };

  const canvas = document.getElementById("particles-in-bg");
  const cv = canvas.getContext("2d");

  const homeSection = document.getElementById("home");

  function sizeCanvas() {
    canvas.width = homeSection.offsetWidth;
    canvas.height = homeSection.offsetHeight;
  }

  sizeCanvas();
  window.addEventListener("resize", sizeCanvas);

  const particles = [];
  const count_of_particles = 60;

  function create_particles() {
    for (let i = 0; i < count_of_particles; i++) {
      const posX = canvas.width / 4 + Math.random() * canvas.width / 2;
      const posY = Math.random() * canvas.height;
      const vY = (Math.random()) * 0.3;
      const r = Math.random() * 2 + 0.5;
      const op = Math.random() * 0.4 + 0.3;
      const obj = new particle(posX, posY, vY, r, op);
      particles.push(obj);
    }
  }

  function update_particles() {
    for (let i = 0; i < count_of_particles; i++) {
      particles[i].posY = (particles[i].posY + particles[i].speedY) % canvas.height;
    }
  }

  function draw_particles() {
    for (let i = 0; i < count_of_particles; i++) {
      cv.beginPath();
      cv.arc(particles[i].posX, particles[i].posY, particles[i].r, 0, 2 * Math.PI);
      const isDark = document.documentElement.classList.contains("dark");

      // If isDark is true, use the blue. If false, use the charcoal.
      cv.fillStyle = isDark ? `rgba(96,165,250,${particles[i].op})` : `rgba(28,28,28,${particles[i].op})`;
      cv.fill();
    }
  }

  create_particles();
  function animate() {
    cv.clearRect(0, 0, canvas.width, canvas.height);
    update_particles();
    draw_particles();
    requestAnimationFrame(animate)
  }

  animate();
}

// ============================================================
// 5. Timeline DOM Building + Scroll Handler + IntersectionObserver
// ============================================================

if (document.querySelector(".timeline-cont")) {
  
  
  const timelineData = [
    {
      commit_hash: "f0d3c0d",
      branch: "HEAD -> origins",
      organization: "@ Self-Taught, 9th-10th Grade",
      title: "First Lines of Code",
      description: "Spent COVID lockdown teaching myself HTML, CSS, and Python from scratch — no courses, just documentation and trial-and-error. Built small websites and games purely out of curiosity about how software actually worked.",
      commit_stats: ["HTML/CSS/Python", "+Self-Taught", "+Curiosity-Driven"],
      date: "2020-2021"
    },
    {
      commit_hash: "a1e95c4",
      branch: "HEAD -> foundations",
      organization: "@ JEE 2025",
      title: "Engineering Entrance Excellence",
      description: "Achieved a CRL 1508 in JEE Mains and 3863 in JEE Advanced, alongside a 95% in Class 12 Boards. This period defined my foundation in analytical thinking and high-pressure problem solving.",
      commit_stats: ["Mains: 1508", "+Adv: 3863", "+CBSE: 95%"],
      date: "2023-2025"
    },
    {
      commit_hash: "b2c3d4e",
      branch: "HEAD -> iiith-cse",
      organization: "@ IIIT Hyderabad",
      title: "Joining IIIT-H, Acing First Year",
      description: "Joined the B.Tech Computer Science program at IIIT-H, immersing myself in a curriculum known for its rigorous algorithmic approach. Closed out my first year with a perfect 10.0 CGPA across both semesters — covering DSA, Intro to Software Systems, Real Analysis, Discrete Math, Linear Algebra, and more.",
      commit_stats: ["10.0 CGPA", "+2 Semesters", "-0 Backlogs"],
      date: "Aug 2025-May 2026"
    },
    {
      commit_hash: "c7p3e1a",
      branch: "HEAD -> main",
      organization: "@ Present",
      title: "Building, Competing, and Looking Ahead",
      description: "Splitting time between systems and ML projects, regular competitive programming on Codeforces and CSES, and coursework — while actively seeking internship opportunities to bring this foundation into a real engineering team.",
      commit_stats: ["Systems + ML", "+200 CP Problems", "+Open to Internships"],
      date: "2025-Present"
    }
  ];

  const timelineCont = document.querySelector(".timeline-cont")

  document.querySelector('.timeline-cont').classList.add('js-enabled');
  let isleft = true;
  for (let card of timelineData) {

    const cd = document.createElement("article");

    const div_header = document.createElement("div");
    div_header.classList.add("timeline-card-header");
    const commithash = document.createElement("code");
    commithash.classList.add("timeline-card-header-hash");
    const branch = document.createElement("span");
    branch.classList.add("timeline-card-header-branch");

    commithash.textContent = card.commit_hash;
    branch.textContent = card.branch;

    div_header.appendChild(commithash);
    div_header.appendChild(branch);

    cd.appendChild(div_header);

    const title = document.createElement("div");
    title.classList.add("timeline-card-main");
    const title_main = document.createElement("h4");
    title_main.classList.add("timeline-card-main-title");
    const title_org = document.createElement("span");
    title_org.classList.add("timeline-card-main-org");

    title_main.textContent = card.title;
    title_org.textContent = card.organization;

    title.appendChild(title_main);
    title.appendChild(title_org);

    cd.appendChild(title);

    const para = document.createElement("p");
    para.classList.add("timeline-card-description");

    para.textContent = card.description;

    cd.appendChild(para);

    const footer = document.createElement("div");
    footer.classList.add("timeline-card-footer");

    const f1 = document.createElement("span");
    f1.classList.add("timeline-card-footer-c1");
    const f2 = document.createElement("span");
    f2.classList.add("timeline-card-footer-c2");
    const f3 = document.createElement("span");
    f3.classList.add("timeline-card-footer-c3");

    f1.textContent = card.commit_stats[0];
    f2.textContent = card.commit_stats[1];
    f3.textContent = card.commit_stats[2];

    footer.appendChild(f1);
    footer.appendChild(f2);
    footer.appendChild(f3);

    cd.appendChild(footer);

    // const date = document.createElement("span");

    const dateParent = document.createElement("span");
    const i = document.createElement("i");
    i.classList.add("fa-regular", "fa-calendar");
    const date = document.createElement("span");
    date.textContent = card.date;
    date.classList.add("timeline-date-text");
    dateParent.appendChild(i);
    dateParent.appendChild(date);
    dateParent.classList.add("timeline-date");

    const timelineDateconnector = document.createElement("span");
    timelineDateconnector.classList.add("timelineDateconnector");
    cd.appendChild(timelineDateconnector);

    const timelineCardConnector = document.createElement("span");
    timelineCardConnector.classList.add("timeline-card-connector");
    cd.appendChild(timelineCardConnector);

    const node = document.createElement("span");
    node.classList.add("timeline-card-node");

    cd.appendChild(node);

    cd.append(dateParent);

    timelineCont.appendChild(cd);
    if (isleft) {
      cd.classList.add("timeline-card-left", "timeline-card");
    } else {
      cd.classList.add("timeline-card-right", "timeline-card");
    }
    isleft = !isleft;
  }
}

// Timeline Fill (scroll handler + IntersectionObserver for cards)
if (document.querySelector(".timeline-cont")) {
  const progress = document.querySelector(".timeline-progress");
  const timeline = document.querySelector(".timeline-cont");
  const nodes = document.querySelectorAll(".timeline-card-node");
  const connectors = document.querySelectorAll(".timelineDateconnector");

  window.addEventListener("scroll", () => {

    const rect = timeline.getBoundingClientRect(); // gives dIstance of top, bottom relative to viewport top
    const trigger = window.innerHeight * 0.7; // like if total window = 1000px, then line till 700px

    const percent = Math.min(Math.max((trigger - rect.top) / rect.height, 0), 1);
    // we calculate fraction of timeline filled, but we want to bound it bw 0 and 1

    progress.style.height = percent * 100 + "%";


    // Activate nodes
    nodes.forEach(node => {
      const nodeRect = node.getBoundingClientRect();

      if (nodeRect.top < trigger) {
        node.classList.add("timeline-node-active");
      }
    });

    // Activate connectors
    connectors.forEach(connector => {
      const connectorRect = connector.getBoundingClientRect();

      if (connectorRect.top < trigger) {
        connector.classList.add("timelineDateconnector-active");
      }
    });

  });

  const timelineCards = document.querySelectorAll(".timeline-card");

  const timelineObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        timelineObserver.unobserve(entry.target);
      }
    });
  }, {
    // Matches your progress line trigger (approx 70% down the screen)
    rootMargin: "0px 0px -10% 0px",
    threshold: 0
  });

  timelineCards.forEach(card => timelineObserver.observe(card));
}

// ============================================================
// 6. Tech Stack DOM Building + IntersectionObserver
// ============================================================

if (document.querySelector(".stack-cont")) {
  const techStack = [
  // Languages
  { name: "C", icon: "https://cdn.simpleicons.org/c" },
  { name: "C++", icon: "https://cdn.simpleicons.org/cplusplus" },
  { name: "Python", icon: "https://cdn.simpleicons.org/python" },
  { name: "JavaScript", icon: "https://cdn.simpleicons.org/javascript" },

  // ML
  { name: "ScikitLearn", icon: "https://cdn.simpleicons.org/scikitlearn" },

  // Frameworks & Web
  { name: "FastAPI", icon: "https://cdn.simpleicons.org/fastapi" },
  { name: "React", icon: "https://cdn.simpleicons.org/react" },

  // Databases
  { name: "MySQL", icon: "https://cdn.simpleicons.org/mysql" },
  { name: "MongoDB", icon: "https://cdn.simpleicons.org/mongodb" },
  { name: "SQLite", icon: "https://cdn.simpleicons.org/sqlite" },

  // Tools & Systems
  { name: "Git", icon: "https://cdn.simpleicons.org/git" },
  { name: "Linux", icon: "https://cdn.simpleicons.org/linux" },
  { name: "Bash", icon: "https://cdn.simpleicons.org/gnubash" },
];

  const stackCont = document.querySelector(".stack-cont");

  techStack.forEach((tech, index) => {
    const img = document.createElement("img");
    img.src = tech.icon;
    img.alt = tech.name + " Img";
    img.classList.add("tech-stack-img");

    const name = document.createElement("span");
    name.textContent = tech.name;
    name.classList.add("tech-stack-name");

    const create_div = document.createElement("div");
    create_div.appendChild(img);
    create_div.appendChild(name);

    create_div.classList.add("stack-node");

    create_div.style.setProperty('--i', index / 4);

    stackCont.appendChild(create_div);
  });

  const stackobserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.classList.toggle("show", entry.isIntersecting);
    })
  }, {
    threshold: 1
  }
  );

  const stackNodes = document.querySelectorAll(".stack-node");

  stackNodes.forEach(stack => {
    stackobserver.observe(stack);
  });
}

// ============================================================
// 7. Dark Mode Toggle
// ============================================================

const themeimg = document.querySelector(".theme-img");
const toggle = document.getElementById("theme-toggle");

// Sync image with whatever class the head script already set
if (document.documentElement.classList.contains("dark")) {
  themeimg.src = "images/moon.webp";
}

toggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");

  const theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
  localStorage.setItem("theme", theme);
  themeimg.src = theme === "dark" ? "images/moon.webp" : "images/sun.webp";
});

// ============================================================
// 8. Contact Form Validation
// ============================================================

if (document.querySelector("#contact-form")) {
  const form = document.querySelector("#contact-form");
  const nameInput = document.querySelector("#name");
  const emailInput = document.querySelector("#email");
  const msgInput = document.querySelector("#msg");
  const Formstatus = document.querySelector("#form-status");

  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const msg = msgInput.value.trim();

    Formstatus.textContent = "";
    Formstatus.className = "";

    if (name.length < 2) {
      Formstatus.textContent = "Please enter a valid name.";
      Formstatus.classList.add("error");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      Formstatus.textContent = "Please enter a valid email address.";
      Formstatus.classList.add("error");
      return;
    }

    if (msg.length < 10) {
      Formstatus.textContent = "Message should be at least 10 characters.";
      Formstatus.classList.add("error");
      return;
    }

    // Disable button + show sending state
    const submitBtn = form.querySelector("button");
    submitBtn.disabled = true;
    Formstatus.textContent = "Sending...";

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: "d8d338e7-4732-4df6-b781-370e8e62527d",
          name: name,
          email: email,
          message: msg,
          subject: `New message from ${name} — portfolio site`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        Formstatus.textContent = "✓ Message sent successfully! I'll get back to you soon.";
        Formstatus.classList.remove("error");
        Formstatus.classList.add("success");
        form.reset();
      } else {
        throw new Error(result.message || "Submission failed");
      }
    } catch (err) {
      Formstatus.textContent = "Something went wrong. Please email me directly instead.";
      Formstatus.classList.add("error");
      submitBtn.disabled = false; // let them retry
    }
  });
}

// ============================================================
// 9. Projects Accordion DOM Building + Scroll Reveal
// ============================================================

if (document.querySelector(".projects-list")) {
  const projects = [
    {
      id: "01",
      title: "Terminal Collab Code Editor",
      tags: ["C++", "ncurses", "epoll", "Operational Transformation", "Gap Buffer", "TCP Sockets"],
      image: "images/collab.png",
      does: "A real-time collaborative terminal code editor where multiple users edit the same file simultaneously, with live cursor presence, C++ syntax highlighting, and conflict resolution — all over raw TCP with a custom protocol.",
      why: "Built to explore low-level systems programming: Linux epoll for async I/O, Operational Transformation for concurrent edits, and a Gap Buffer for efficient text storage — the core ideas behind Google Docs, implemented from scratch.",
      improve: "Add OT-aware undo/redo, multiple file tabs, and explore CRDTs as an alternative to the current centralized OT model.",
      tradeoffs: "Chose OT over CRDTs to keep conflict resolution transparent and auditable — at the cost of requiring a central server.",
      github: "",
      demo: ""
    },
    {
      id: "02",
      title: "IPO Alpha Predictor",
      tags: ["Python", "XGBoost", "SHAP", "Time-Series CV", "Feature Engineering"],
      image: "images/shap_beeswarm.png",
      does: "Predicts NSE IPO listing gains using pre-listing subscription and market data. Built on 333 mainboard IPOs (2018–2024), with a regression model for exact gain % and a classifier for listing direction.",
      why: "Wanted to explore whether subscription data alone could predict listing performance using proper ML methodology — time-based CV, nested tuning, and zero future leakage.",
      improve: "Incorporate grey market premium (GMP) and expand beyond 333 rows — market signals like Nifty momentum would likely become meaningful at larger scale.",
      tradeoffs: "Chose XGBoost over LightGBM despite lower raw R² — on 333 rows, LightGBM's larger generalization gap (0.068 vs 0.010) makes it the less trustworthy pick.",
      github: "",
      demo: ""
    },
        {
      id: "03",
      title: "Kernel Panic — Biometric Multiplayer Arena",
      tags: ["FastAPI", "WebSockets", "MongoDB", "SQLite", "Facial Recognition"],
      image: "images/kernel-panic.webp",
      does: "A real-time multiplayer Tic-Tac-Toe app with facial recognition login, a live WebSocket lobby with challenge/accept flow, and an Elo-based leaderboard.",
      why: "Built to design a polyglot persistence system — SQLite for relational data, MongoDB for face data — wired together with real-time WebSockets and biometric auth.",
      improve: "Add JWT auth for stateless scaling, switch face matching to a vector index instead of linear scan, and support reconnection without forfeiting.",
      tradeoffs: "Kept gameplay fully server-authoritative — clients only send move requests — trading some responsiveness for strong anti-cheat.",
      github: "",
      demo: ""
    },
    {
      id: "04",
      title: "SmartPark — IoT Live Parking Monitor",
      tags: ["ESP32", "MQTT", "Firebase", "IoT", "Real-Time Dashboard"],
      image: "images/smartpark.png",
      does: "An end-to-end IoT parking system: ESP32 nodes with IR + ultrasonic sensors detect slot occupancy, control an automated gate, and publish over MQTT to a live Firebase dashboard with charts and uptime tracking.",
      why: "Wanted to build a complete IoT pipeline from raw sensors to cloud to UI — covering hardware debouncing, dual-core task scheduling, and real-time sync, not just the software layer.",
      improve: "Replace the external MQTT-to-Firebase bridge with a direct connection, and add historical analytics for occupancy trends over time.",
      tradeoffs: "Used dual-sensor (IR + ultrasonic) confirmation instead of a single sensor — adds hardware cost but eliminates false positives from debris or lighting.",
      github: "",
      demo: ""
    },
    {
      id: "05",
      title: "Dusk — Campus Meal Marketplace",
      tags: ["Next.js", "FastAPI", "AI/OCR", "PostgreSQL"],
      image: "images/dusk.webp",
      does: "A campus platform that allows students to sell unused mess coupons and coordinate external food group orders through a collaborative ordering system.",
      why: "Built during Hack-IIIT to solve two common campus problems: wasted mess coupons and chaotic bill splitting during group food orders.",
      improve: "I would expand the marketplace with real payment integration and improve OCR accuracy using a specialized receipt-parsing model.",
      tradeoffs: "Used SQLite during development for simplicity while keeping PostgreSQL compatibility for production scalability.",
      github: "https://github.com/Sahej-sethi/dusk",
      demo: "#"
    },
    {
      id: "06",
      title: "Twixt — Terminal Strategy Game",
      tags: ["C", "Algorithms", "Game Logic", "DFS"],
      image: "images/twixt.webp",
      does: "A fully interactive terminal implementation of the Twixt strategy board game featuring real-time keyboard controls, automatic link generation, and win detection using DFS pathfinding.",
      why: "Created to explore graph algorithms, geometric intersection detection, and advanced terminal rendering techniques in C.",
      improve: "I would add an AI opponent using minimax or Monte Carlo tree search and support for network multiplayer.",
      tradeoffs: "Focused on efficient terminal rendering and deterministic logic instead of building a graphical interface.",
      github: "https://github.com/Sahej-sethi/twixt",
      demo: "#"
    },

    {
      id: "07",
      title: "C-Unplugged — CLI Music Library Manager",
      tags: ["C", "Data Structures", "CLI", "File I/O"],
      image: "images/cunplugged.webp",
      does: "A command-line music library manager that supports album and playlist management, song playback simulation with a progress bar, and persistent storage using file I/O.",
      why: "Built to practice core systems programming concepts such as linked lists, command parsing, and modular program design in C.",
      improve: "Future improvements include shuffle mode, playlist export, and advanced search or sorting features.",
      tradeoffs: "Used a custom doubly linked list instead of external libraries to reinforce data structure fundamentals.",
      github: "https://github.com/Sahej-sethi/C-Unplugged",
      demo: "#"
    }
  ];

  const list = document.querySelector(".projects-list");

  projects.forEach((p, index) => {
    // ${p.tags.map(tag=>`<span>${tag}</span>`).join("")}
    // not too much, just defn of map and join from python
    // and inside map give an arrow function
    const projectHTMl = `
  <li class="project">
    <div class="project-header" tabindex="0" role="button" aria-expanded="false">

    <span class="project-number">${p.id}</span>

    <h3 class="project-name">${p.title}</h3>

    <div class="project-tags">
    ${p.tags.map(tag => `<span>${tag}</span>`).join("")}
    </div>

    <button class="project-toggle" aria-expanded="false">⌄</button>

    </div>

    <div class="project-content">

    <div class="project-image">
    <img src="${p.image}" alt="${p.title} screenshot">
    </div>

    <div class="project-details">

    <h4 class="project-questions">What it does</h4>
    <p class="projects-answers">${p.does}</p>

    <h4 class="project-questions">Why I built it</h4>
    <p class="projects-answers">${p.why}</p>

    <h4 class="project-questions">What I'd do differently</h4>
    <p class="projects-answers">${p.improve}</p>

    <h4 class="project-questions">Technology tradeoffs</h4>
    <p class="projects-answers">${p.tradeoffs}</p>

    <div class="project-buttons">
    <a class="projects-source-link" href="${p.github}">Source Code</a>
    <a class="projects-demo-link" href="${p.demo}">Live Demo</a>
    </div>

    </div>

    </div>
  </li> 
  `
    // Take this string, conver into DOM element then insert at end of this 
    list.insertAdjacentHTML("beforeend", projectHTMl);
    // can put  beforeend, beforebegin, afterbegin and all
  });

  // Accordion toggle

  const headers = document.querySelectorAll(".project-header")
  headers.forEach(header => {
    header.addEventListener("click", () => {
      const project = header.closest(".project");
      const toggle = header.querySelector(".project-toggle");
      const isOpen = project.classList.contains("open");

      // close all others first (single-open accordion)
      document.querySelectorAll(".project.open").forEach(openProject => {
        if (openProject !== project) {
          openProject.classList.remove("open");
          const otherHeader = openProject.querySelector(".project-header");
          otherHeader.setAttribute("aria-expanded", "false");
          otherHeader.querySelector(".project-toggle").setAttribute("aria-expanded", "false");
        }
      });

      // toggle this one
      project.classList.toggle("open");
      header.setAttribute("aria-expanded", String(!isOpen));
      toggle.setAttribute("aria-expanded", String(!isOpen));

      // smooth scroll into view when opening
      if (!isOpen) {
        // Wait for CSS transition
        setTimeout(() => {
          // Move the page to fit 
          project.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 200);
      }
    });
  });

  // Staggered scroll reveal - useful if more projects are added
  const projectObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        projectObserver.unobserve(entry.target); // once only
      }
    });
  }, {
    threshold: 0.15
  });

  document.querySelectorAll(".project").forEach((p, i) => {
    p.style.transitionDelay = `${i * 120}ms`;
    projectObserver.observe(p);
  });
}

// ============================================================
// 10. Hamburger Menu
// ============================================================

const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.links-parent');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    const isOpen = hamburger.classList.contains('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu when a nav link is clicked (Important)
  document.querySelectorAll('.nav-links').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}