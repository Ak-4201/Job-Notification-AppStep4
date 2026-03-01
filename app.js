(function () {
  var STORAGE_KEY = "job-notification-tracker-saved";
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
        "A daily 9AM summary of relevant roles will appear here in a later step.",
      pageTitle: "Digest",
      pageSubtitle:
        "A daily 9AM summary of relevant roles will appear here in a later step.",
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
    if (routePlaceholder) {
      routePlaceholder.classList.toggle("route-placeholder--hidden", isJobs);
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
      } else {
        settingsSection.classList.add("settings-placeholder--hidden");
      }
    }
    updateJobsView(pathname);
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

