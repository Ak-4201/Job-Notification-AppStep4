(function () {
  var STORAGE_KEY = "job-notification-tracker-saved";
  var PREFERENCES_KEY = "jobTrackerPreferences";
  var DIGEST_KEY_PREFIX = "jobTrackerDigest_";
  var jobs = (typeof window.JOB_DATA !== "undefined" && window.JOB_DATA) || [];

  var routes = {
    "/": {
      key: null,
      headerTitle: "Stop Missing The Right Jobs.",
      headerSubtitle:
        "Precision-matched job discovery delivered daily at 9AM.",
      pageTitle: "Stop Missing The Right Jobs.",
      pageSubtitle:
        "Precision-matched job discovery delivered daily at 9AM.",
      showStartTrackingCta: true,
    },
    "/dashboard": {
      key: "/dashboard",
      headerTitle: "Dashboard",
      headerSubtitle:
        "Browse and filter jobs. Save roles you want to revisit.",
      pageTitle: "Dashboard",
      pageSubtitle:
        "Browse and filter jobs. Save roles you want to revisit.",
    },
    "/saved": {
      key: "/saved",
      headerTitle: "Saved",
      headerSubtitle:
        "Jobs you’ve saved for later. They persist across sessions.",
      pageTitle: "Saved",
      pageSubtitle:
        "Jobs you’ve saved for later. They persist across sessions.",
    },
    "/digest": {
      key: "/digest",
      headerTitle: "Digest",
      headerSubtitle:
        "Your daily 9AM summary of top jobs, personalized by your preferences.",
      pageTitle: "Digest",
      pageSubtitle:
        "Your daily 9AM summary of top jobs, personalized by your preferences.",
    },
    "/settings": {
      key: "/settings",
      headerTitle: "Settings",
      headerSubtitle:
        "Define how job notifications should behave. Saving will be added in a later step.",
      pageTitle: "Settings",
      pageSubtitle:
        "Set up role keywords, locations, and preferences. This is a placeholder – no data is stored yet.",
    },
    "/proof": {
      key: "/proof",
      headerTitle: "Proof",
      headerSubtitle:
        "A placeholder space for artifacts that demonstrate how your notification system behaves.",
      pageTitle: "Proof",
      pageSubtitle:
        "In the next step, this page will collect links, screenshots, and other proof of behavior.",
    },
    notFound: {
      key: null,
      headerTitle: "Page Not Found",
      headerSubtitle: "The page you are looking for does not exist.",
      pageTitle: "Page Not Found",
      pageSubtitle: "The page you are looking for does not exist.",
    },
  };

  var headerTitle = document.querySelector(".context-header__title");
  var headerSubtitle = document.querySelector(".context-header__subtitle");
  var placeholderTitle = document.querySelector(".route-placeholder__title");
  var placeholderSubtitle = document.querySelector(
    ".route-placeholder__subtitle"
  );
  var ctaContainer = document.querySelector(".route-placeholder__actions");
  var settingsSection = document.querySelector(".settings-placeholder");
  var nav = document.querySelector(".app-nav");
  var navToggle = document.querySelector(".app-nav__toggle");
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll(".app-nav__link")
  );
  var brandLink = document.querySelector(".app-name");
  var promptCopyButton = document.querySelector(".js-prompt-copy");
  var promptBody = document.querySelector(".prompt-block__body");
  var startTrackingButton = document.querySelector(".js-start-tracking");
  var jobsView = document.getElementById("jobs-view");
  var routePlaceholder = document.getElementById("route-placeholder");
  var jobCardsGrid = document.getElementById("job-cards-grid");
  var jobsEmptyState = document.getElementById("jobs-empty-state");
  var savedEmptyState = document.getElementById("saved-empty-state");
  var jobModal = document.getElementById("job-modal");
  var modalTitle = document.getElementById("job-modal-title");
  var modalMeta = document.querySelector(".modal__meta");
  var modalDescription = document.querySelector(".modal__description");
  var modalSkills = document.querySelector(".modal__skills");
  var modalSaveBtn = document.querySelector(".js-modal-save");
  var modalApplyLink = document.querySelector(".js-modal-apply");
  var digestView = document.getElementById("digest-view");
  var digestNoPrefs = document.getElementById("digest-no-prefs");
  var digestGenerateArea = document.getElementById("digest-generate-area");
  var digestContent = document.getElementById("digest-content");
  var digestNoMatches = document.getElementById("digest-no-matches");
  var digestJobsList = document.getElementById("digest-jobs-list");
  var digestDateEl = document.getElementById("digest-date");

  function getSavedIds() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveJob(id) {
    var ids = getSavedIds();
    if (ids.indexOf(id) === -1) {
      ids.push(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    }
  }

  function removeSaved(id) {
    var ids = getSavedIds().filter(function (x) { return x !== id; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }

  function getPreferences() {
    try {
      var raw = localStorage.getItem(PREFERENCES_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setPreferences(prefs) {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  }

  function getMatchScore(job) {
    var num = parseInt((job.id || "").replace(/\D/g, ""), 10) || 0;
    return 65 + (num % 34);
  }

  function getTodayKey() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function getDigestKey() {
    return DIGEST_KEY_PREFIX + getTodayKey();
  }

  function loadDigest() {
    try {
      var raw = localStorage.getItem(getDigestKey());
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveDigest(list) {
    localStorage.setItem(getDigestKey(), JSON.stringify(list));
  }

  function generateDigest() {
    var sorted = jobs.slice().map(function (j) {
      return { job: j, matchScore: getMatchScore(j), postedDaysAgo: j.postedDaysAgo != null ? j.postedDaysAgo : 0 };
    });
    sorted.sort(function (a, b) {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return a.postedDaysAgo - b.postedDaysAgo;
    });
    var top10 = sorted.slice(0, 10).map(function (x) {
      var j = x.job;
      return { id: j.id, title: j.title, company: j.company, location: j.location, experience: j.experience, matchScore: x.matchScore, applyUrl: j.applyUrl };
    });
    saveDigest(top10);
    return top10;
  }

  function formatDigestPlainText(list) {
    var lines = ["Top 10 Jobs For You — 9AM Digest", getTodayKey(), ""];
    list.forEach(function (item, i) {
      lines.push((i + 1) + ". " + (item.title || "") + " @ " + (item.company || ""));
      lines.push("   " + (item.location || "") + " · " + (item.experience || "") + " · Match: " + (item.matchScore || "") + "%");
      lines.push("   Apply: " + (item.applyUrl || ""));
      lines.push("");
    });
    lines.push("This digest was generated based on your preferences.");
    return lines.join("\n");
  }

  function handleEmailDraft() {
    var list = loadDigest();
    if (!list || list.length === 0) return;
    var subject = "My 9AM Job Digest";
    var body = formatDigestPlainText(list);
    if (body.length > 800) body = body.slice(0, 800) + "\n\n[Content truncated…]";
    window.location.href =
      "mailto:?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    } finally {
      document.body.removeChild(ta);
    }
  }

  function getFilterValues() {
    return {
      keyword: (document.getElementById("filter-keyword") || {}).value || "",
      location: (document.getElementById("filter-location") || {}).value || "",
      mode: (document.getElementById("filter-mode") || {}).value || "",
      experience: (document.getElementById("filter-experience") || {}).value || "",
      source: (document.getElementById("filter-source") || {}).value || "",
      sort: (document.getElementById("filter-sort") || {}).value || "latest"
    };
  }

  function filterAndSortJobs(list, filters) {
    var result = list.slice();
    var kw = (filters.keyword || "").trim().toLowerCase();
    if (kw) {
      result = result.filter(function (j) {
        return (
          (j.title || "").toLowerCase().indexOf(kw) >= 0 ||
          (j.company || "").toLowerCase().indexOf(kw) >= 0
        );
      });
    }
    if (filters.location) {
      result = result.filter(function (j) { return (j.location || "") === filters.location; });
    }
    if (filters.mode) {
      result = result.filter(function (j) { return (j.mode || "") === filters.mode; });
    }
    if (filters.experience) {
      result = result.filter(function (j) { return (j.experience || "") === filters.experience; });
    }
    if (filters.source) {
      result = result.filter(function (j) { return (j.source || "") === filters.source; });
    }
    result.sort(function (a, b) {
      var da = (a.postedDaysAgo != null) ? a.postedDaysAgo : 0;
      var db = (b.postedDaysAgo != null) ? b.postedDaysAgo : 0;
      return filters.sort === "oldest" ? da - db : db - da;
    });
    return result;
  }

  function getJobsToRender(pathname) {
    var filters = getFilterValues();
    var list = pathname === "/saved"
      ? jobs.filter(function (j) { return getSavedIds().indexOf(j.id) >= 0; })
      : jobs;
    return filterAndSortJobs(list, filters);
  }

  function formatPosted(days) {
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return days + " days ago";
  }

  function renderJobCards(pathname) {
    if (!jobCardsGrid) return;
    var list = getJobsToRender(pathname);
    var savedSet = {};
    getSavedIds().forEach(function (id) { savedSet[id] = true; });

    jobCardsGrid.innerHTML = "";
    if (jobsEmptyState) jobsEmptyState.classList.add("empty-state--hidden");
    if (savedEmptyState) savedEmptyState.classList.add("empty-state--hidden");

    if (pathname === "/saved" && list.length === 0) {
      if (savedEmptyState) savedEmptyState.classList.remove("empty-state--hidden");
      return;
    }
    if (list.length === 0) {
      if (jobsEmptyState) jobsEmptyState.classList.remove("empty-state--hidden");
      return;
    }

    list.forEach(function (job) {
      var card = document.createElement("div");
      card.className = "job-card";
      card.setAttribute("data-job-id", job.id);
      var posted = formatPosted(typeof job.postedDaysAgo === "number" ? job.postedDaysAgo : 0);
      var saved = savedSet[job.id];
      card.innerHTML =
        '<h3 class="job-card__title">' + escapeHtml(job.title || "") + "</h3>" +
        '<p class="job-card__company">' + escapeHtml(job.company || "") + "</p>" +
        '<p class="job-card__meta">' +
        escapeHtml((job.location || "") + " · " + (job.mode || "")) +
        "</p>" +
        '<p class="job-card__meta">Experience: ' + escapeHtml(job.experience || "") + "</p>" +
        '<p class="job-card__salary">' + escapeHtml(job.salaryRange || "") + "</p>" +
        '<span class="source-badge source-badge--' + (job.source || "other").toLowerCase() + '">' +
        escapeHtml(job.source || "") + "</span>" +
        '<span class="job-card__posted">' + escapeHtml(posted) + "</span>" +
        '<div class="job-card__actions">' +
        '<button type="button" class="btn btn--secondary btn--sm js-job-view">View</button>' +
        '<button type="button" class="btn btn--secondary btn--sm js-job-save">' +
        (saved ? "Saved" : "Save") +
        "</button>" +
        '<a href="' + escapeHtml(job.applyUrl || "#") + '" target="_blank" rel="noopener" class="btn btn--primary btn--sm js-job-apply">Apply</a>' +
        "</div>";
      jobCardsGrid.appendChild(card);
    });
  }

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function updateJobsView(pathname) {
    var isJobs = pathname === "/dashboard" || pathname === "/saved";
    if (jobsView) {
      if (isJobs) {
        jobsView.classList.remove("jobs-view--hidden");
        renderJobCards(pathname);
      } else {
        jobsView.classList.add("jobs-view--hidden");
      }
    }
    var isDigest = pathname === "/digest";
    if (routePlaceholder) {
      routePlaceholder.classList.toggle("route-placeholder--hidden", isJobs || isDigest);
    }
  }

  function renderDigestView() {
    var hasPrefs = !!getPreferences();
    if (digestNoPrefs) digestNoPrefs.classList.toggle("digest-blocking--hidden", hasPrefs);
    if (digestGenerateArea) digestGenerateArea.classList.toggle("digest-generate-area--hidden", !hasPrefs);

    if (!hasPrefs) {
      if (digestContent) digestContent.classList.add("digest-content--hidden");
      if (digestNoMatches) digestNoMatches.classList.add("digest-blocking--hidden");
      return;
    }

    var existing = loadDigest();
    if (existing) {
      if (existing.length === 0) {
        if (digestContent) digestContent.classList.add("digest-content--hidden");
        if (digestNoMatches) digestNoMatches.classList.remove("digest-blocking--hidden");
        if (digestGenerateArea) digestGenerateArea.classList.add("digest-generate-area--hidden");
      } else {
        if (digestNoMatches) digestNoMatches.classList.add("digest-blocking--hidden");
        if (digestGenerateArea) digestGenerateArea.classList.add("digest-generate-area--hidden");
        if (digestContent) digestContent.classList.remove("digest-content--hidden");
        if (digestDateEl) digestDateEl.textContent = getTodayKey();
        if (digestJobsList) {
          digestJobsList.innerHTML = existing.map(function (item) {
            return (
              '<div class="digest-job">' +
              '<h3 class="digest-job__title">' + escapeHtml(item.title || "") + "</h3>" +
              '<p class="digest-job__meta">' +
              escapeHtml((item.company || "") + " · " + (item.location || "") + " · " + (item.experience || "")) +
              "</p>" +
              '<p class="digest-job__score">Match: ' + escapeHtml(String(item.matchScore || "")) + "%</p>" +
              '<a href="' + escapeHtml(item.applyUrl || "#") + '" target="_blank" rel="noopener" class="btn btn--primary btn--sm">Apply</a>' +
              "</div>"
            );
          }).join("");
        }
      }
    } else {
      if (digestContent) digestContent.classList.add("digest-content--hidden");
      if (digestNoMatches) digestNoMatches.classList.add("digest-blocking--hidden");
    }
  }

  function updateDigestView(pathname) {
    var isDigest = pathname === "/digest";
    if (digestView) {
      if (isDigest) {
        digestView.classList.remove("digest-view--hidden");
        renderDigestView();
      } else {
        digestView.classList.add("digest-view--hidden");
      }
    }
  }

  function openModal(job) {
    if (!jobModal || !job) return;
    var saved = getSavedIds().indexOf(job.id) >= 0;
    if (modalTitle) modalTitle.textContent = job.title || "";
    if (modalMeta) {
      modalMeta.innerHTML =
        escapeHtml((job.company || "") + " · " + (job.location || "") + " · " + (job.mode || "")) +
        "<br>" + escapeHtml(job.salaryRange || "") + " · " + escapeHtml(job.source || "");
    }
    if (modalDescription) {
      modalDescription.textContent = job.description || "";
    }
    if (modalSkills) {
      var skills = (job.skills || []);
      modalSkills.textContent = skills.length ? "Skills: " + skills.join(", ") : "";
    }
    if (modalSaveBtn) {
      modalSaveBtn.textContent = saved ? "Saved" : "Save";
      modalSaveBtn.disabled = !!saved;
    }
    if (modalApplyLink) {
      modalApplyLink.href = job.applyUrl || "#";
    }
    jobModal.setAttribute("data-current-job-id", job.id);
    jobModal.classList.remove("modal--hidden");
  }

  function closeModal() {
    if (jobModal) {
      jobModal.classList.add("modal--hidden");
      jobModal.removeAttribute("data-current-job-id");
    }
  }

  function resolveRoute(pathname) {
    if (!pathname || pathname === "/") {
      return routes["/"];
    }
    if (routes[pathname]) {
      return routes[pathname];
    }
    return routes.notFound;
  }

  function setActiveLink(route) {
    var targetKey = route && route.key;
    navLinks.forEach(function (link) {
      var linkRoute = link.getAttribute("data-route");
      if (targetKey && linkRoute === targetKey) {
        link.classList.add("app-nav__link--active");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("app-nav__link--active");
        link.removeAttribute("aria-current");
      }
    });
  }

  function render(pathname) {
    var route = resolveRoute(pathname);
    if (headerTitle && route.headerTitle) {
      headerTitle.textContent = route.headerTitle;
    }
    if (headerSubtitle && route.headerSubtitle) {
      headerSubtitle.textContent = route.headerSubtitle;
    }
    if (placeholderTitle && route.pageTitle) {
      placeholderTitle.textContent = route.pageTitle;
    }
    if (placeholderSubtitle && route.pageSubtitle) {
      placeholderSubtitle.textContent = route.pageSubtitle;
    }

    if (ctaContainer) {
      if (route.showStartTrackingCta) {
        ctaContainer.classList.remove("route-placeholder__actions--hidden");
      } else {
        ctaContainer.classList.add("route-placeholder__actions--hidden");
      }
    }

    if (settingsSection) {
      if (route.key === "/settings") {
        settingsSection.classList.remove("settings-placeholder--hidden");
        loadPreferencesIntoForm();
      } else {
        settingsSection.classList.add("settings-placeholder--hidden");
      }
    }
    updateJobsView(pathname);
    updateDigestView(pathname);
    setActiveLink(route);
  }

  function navigate(pathname) {
    if (window.location.pathname === pathname) {
      render(pathname);
      return;
    }
    window.history.pushState({}, "", pathname);
    render(pathname);
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("app-nav--open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      var target = link.getAttribute("href");
      if (!target) return;
      navigate(target);
      if (nav && nav.classList.contains("app-nav--open") && navToggle) {
        nav.classList.remove("app-nav--open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  if (brandLink) {
    brandLink.addEventListener("click", function (event) {
      event.preventDefault();
      navigate("/");
    });
  }

  if (startTrackingButton) {
    startTrackingButton.addEventListener("click", function (event) {
      event.preventDefault();
      navigate("/settings");
    });
  }

  var settingsSaveBtn = document.querySelector(".js-settings-save");
  if (settingsSaveBtn) {
    settingsSaveBtn.addEventListener("click", function () {
      var prefs = {
        roleKeywords: (document.getElementById("settings-role-keywords") || {}).value || "",
        locations: (document.getElementById("settings-preferred-locations") || {}).value || "",
        mode: (document.getElementById("settings-mode") || {}).value || "",
        experience: (document.getElementById("settings-experience") || {}).value || ""
      };
      setPreferences(prefs);
      if (window.location.pathname === "/digest") renderDigestView();
    });
  }

  function loadPreferencesIntoForm() {
    var prefs = getPreferences();
    if (!prefs) return;
    var kw = document.getElementById("settings-role-keywords");
    var loc = document.getElementById("settings-preferred-locations");
    var mode = document.getElementById("settings-mode");
    var exp = document.getElementById("settings-experience");
    if (kw) kw.value = prefs.roleKeywords || "";
    if (loc) loc.value = prefs.locations || "";
    if (mode) mode.value = prefs.mode || "";
    if (exp) exp.value = prefs.experience || "";
  }

  var digestGenerateBtn = document.querySelector(".js-digest-generate");
  if (digestGenerateBtn) {
    digestGenerateBtn.addEventListener("click", function () {
      var existing = loadDigest();
      if (!existing) {
        generateDigest();
      }
      renderDigestView();
    });
  }

  var digestCopyBtn = document.querySelector(".js-digest-copy");
  if (digestCopyBtn) {
    digestCopyBtn.addEventListener("click", function (e) {
      e.preventDefault();
      var list = loadDigest();
      if (!list || list.length === 0) return;
      var text = formatDigestPlainText(list);
      copyToClipboard(text)
        .then(function () {
          var orig = digestCopyBtn.textContent;
          digestCopyBtn.textContent = "Copied";
          setTimeout(function () { digestCopyBtn.textContent = orig; }, 2000);
        })
        .catch(function () {
          window.alert("Could not copy. Please select and copy the digest manually.");
        });
    });
  }

  var digestEmailBtn = document.querySelector(".js-digest-email");
  if (digestEmailBtn) {
    digestEmailBtn.addEventListener("click", handleEmailDraft);
  }

  var digestGoSettingsBtn = document.querySelector(".js-digest-go-settings");
  if (digestGoSettingsBtn) {
    digestGoSettingsBtn.addEventListener("click", function (e) {
      e.preventDefault();
      navigate("/settings");
    });
  }

  if (promptCopyButton && promptBody) {
    promptCopyButton.addEventListener("click", function () {
      var content =
        promptBody.value || promptBody.textContent || "";
      if (!content) {
        return;
      }

      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(content)
          .then(function () {
            var originalLabel = promptCopyButton.textContent;
            promptCopyButton.textContent = "Copied";
            window.setTimeout(function () {
              promptCopyButton.textContent = originalLabel;
            }, 2000);
          })
          .catch(function () {
            window.alert(
              "We couldn’t copy this automatically. Please select the text and copy it manually."
            );
          });
      } else {
        window.alert(
          "We couldn’t copy this automatically. Please select the text and copy it manually."
        );
      }
    });
  }

  window.addEventListener("popstate", function () {
    render(window.location.pathname);
  });

  function initFilters() {
    var locSelect = document.getElementById("filter-location");
    if (locSelect) {
      var locs = {};
      jobs.forEach(function (j) {
        if (j.location) locs[j.location] = true;
      });
      var sorted = Object.keys(locs).sort();
      sorted.forEach(function (l) {
        var opt = document.createElement("option");
        opt.value = l;
        opt.textContent = l;
        locSelect.appendChild(opt);
      });
    }
  }

  function onFilterChange() {
    var path = window.location.pathname;
    if (path === "/dashboard" || path === "/saved") {
      renderJobCards(path);
    }
  }

  ["filter-keyword", "filter-location", "filter-mode", "filter-experience", "filter-source", "filter-sort"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener("change", onFilterChange);
      el.addEventListener("input", onFilterChange);
    }
  });

  if (jobCardsGrid) {
    jobCardsGrid.addEventListener("click", function (e) {
      var card = e.target.closest(".job-card");
      if (!card) return;
      var id = card.getAttribute("data-job-id");
      var job = jobs.find(function (j) { return j.id === id; });
      if (!job) return;
      if (e.target.closest(".js-job-view")) {
        e.preventDefault();
        openModal(job);
      }
      if (e.target.closest(".js-job-save")) {
        e.preventDefault();
        saveJob(id);
        renderJobCards(window.location.pathname);
        var mId = jobModal && jobModal.getAttribute("data-current-job-id");
        if (mId === id && modalSaveBtn) {
          modalSaveBtn.textContent = "Saved";
          modalSaveBtn.disabled = true;
        }
      }
    });
  }

  var modalClose = document.querySelector(".modal__close");
  var modalBackdrop = document.querySelector(".modal__backdrop");
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener("click", closeModal);
  if (jobModal) {
    jobModal.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });
  }

  if (modalSaveBtn) {
    modalSaveBtn.addEventListener("click", function () {
      var id = jobModal && jobModal.getAttribute("data-current-job-id");
      if (id) {
        saveJob(id);
        modalSaveBtn.textContent = "Saved";
        modalSaveBtn.disabled = true;
        var path = window.location.pathname;
        if (path === "/dashboard" || path === "/saved") renderJobCards(path);
      }
    });
  }

  initFilters();
  render(window.location.pathname);
})();

