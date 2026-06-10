const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
const revealTargets = document.querySelectorAll("[data-reveal]");
const quoteModal = document.querySelector(".quote-modal");
const quoteModalTriggers = document.querySelectorAll("[data-open-quote]");
const quoteModalCloseTargets = quoteModal?.querySelectorAll("[data-quote-close]");
const contactForm = document.querySelector("#contact-form");
const contactStatus = document.querySelector("[data-contact-status]");

const emailjsConfig = {
  serviceId: "YOUR_EMAILJS_SERVICE_ID",
  templateId: "template_0gvn4sk",
  publicKey: "YOUR_EMAILJS_PUBLIC_KEY",
};

if (window.emailjs && emailjsConfig.publicKey && !emailjsConfig.publicKey.includes("YOUR_")) {
  window.emailjs.init({ publicKey: emailjsConfig.publicKey });
}

let quoteModalCloseTimer;

function openQuoteModal() {
  if (!quoteModal) {
    return;
  }

  if (quoteModalCloseTimer) {
    window.clearTimeout(quoteModalCloseTimer);
    quoteModalCloseTimer = undefined;
  }

  quoteModal.hidden = false;
  quoteModal.setAttribute("aria-hidden", "false");
  quoteModalTriggers.forEach((trigger) => trigger.setAttribute("aria-expanded", "true"));

  window.requestAnimationFrame(() => {
    quoteModal.classList.add("is-open");
    document.body.classList.add("no-scroll");

    const focusTarget = contactForm?.querySelector("input, textarea, button") ?? quoteModal.querySelector(".quote-modal__close");
    if (focusTarget) {
      focusTarget.focus();
    }
  });
}

function closeQuoteModal() {
  if (!quoteModal || quoteModal.hidden) {
    return;
  }

  quoteModal.classList.remove("is-open");
  quoteModal.setAttribute("aria-hidden", "true");
  quoteModalTriggers.forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
  document.body.classList.remove("no-scroll");

  quoteModalCloseTimer = window.setTimeout(() => {
    if (!quoteModal.classList.contains("is-open")) {
      quoteModal.hidden = true;
    }
  }, 240);
}

quoteModalTriggers.forEach((trigger) => {
  trigger.addEventListener("click", openQuoteModal);
});

quoteModalCloseTargets?.forEach((target) => {
  target.addEventListener("click", closeQuoteModal);
});

quoteModal?.addEventListener("click", (event) => {
  if (event.target === quoteModal) {
    closeQuoteModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && quoteModal && quoteModal.classList.contains("is-open")) {
    closeQuoteModal();
  }
});

if (revealTargets.length) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsObserver = typeof IntersectionObserver === "function";

  revealTargets.forEach((target, index) => {
    target.style.setProperty("--reveal-delay", `${Math.min(index * 85, 560)}ms`);
  });

  if (reduceMotion) {
    revealTargets.forEach((target) => target.classList.add("is-revealed"));
  } else if (supportsObserver) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    revealTargets.forEach((target) => revealObserver.observe(target));
  } else {
    revealTargets.forEach((target, index) => {
      window.setTimeout(() => {
        target.classList.add("is-revealed");
      }, Math.min(index * 85, 560));
    });
  }
}

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 920px)").matches) {
        nav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  });
}

if (contactForm) {
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const defaultButtonLabel = submitButton ? submitButton.textContent : "Send Message";

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!window.emailjs) {
      if (contactStatus) {
        contactStatus.textContent = "EmailJS is not loaded yet.";
      }
      return;
    }

    const { serviceId, templateId, publicKey } = emailjsConfig;
    const missingConfig =
      !serviceId ||
      serviceId.includes("YOUR_") ||
      !publicKey ||
      publicKey.includes("YOUR_");

    if (missingConfig) {
      if (contactStatus) {
        contactStatus.textContent = "Add your EmailJS service ID and public key in script.js.";
      }
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    if (contactStatus) {
      contactStatus.textContent = "Sending message...";
    }

    try {
      await window.emailjs.sendForm(serviceId, templateId, contactForm);
      contactForm.reset();
      if (contactStatus) {
        contactStatus.textContent = "Message sent. We'll be in touch soon.";
      }
    } catch (error) {
      console.error("EmailJS send failed:", error);
      if (contactStatus) {
        contactStatus.textContent = "Something went wrong sending the message.";
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = defaultButtonLabel;
      }
    }
  });
}
