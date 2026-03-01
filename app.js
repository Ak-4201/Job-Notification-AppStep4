(function () {
  var routes = {
    "/": {
      key: "/dashboard",
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
        "No jobs yet. In the next step, you will load a realistic dataset.",
      pageTitle: "Dashboard",
      pageSubtitle:
        "No jobs yet. In the next step, you will load a realistic dataset.",
    },
    "/saved": {
      key: "/saved",
      headerTitle: "Saved",
      headerSubtitle:
        "No saved jobs yet. In the next step, you will be able to keep roles you want to revisit.",
      pageTitle: "Saved",
      pageSubtitle:
        "No saved jobs yet. In the next step, you will be able to keep roles you want to revisit.",
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

  render(window.location.pathname);
})();

