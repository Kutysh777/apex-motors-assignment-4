(() => {
  "use strict";

  const formStates = new WeakMap();

  const clearStatus = (form) => {
    const status = form.querySelector("[data-form-status]");
    if (status) {
      status.textContent = "";
      delete status.dataset.state;
      status.classList.remove("is-success", "is-error");
    }
  };

  const showStatus = (form, message, state) => {
    const status = form.querySelector("[data-form-status]");
    if (status) {
      status.textContent = message;
      status.dataset.state = state;
      status.classList.toggle("is-success", state === "success");
      status.classList.toggle("is-error", state === "error");
    }
  };

  const validationMessage = (field) => {
    const value = field.type === "password" ? field.value : field.value.trim();
    if (field.required && value.trim().length === 0) {
      return "This field is required.";
    }
    if (value.length === 0) {
      return "";
    }
    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Enter a valid email address, such as name@example.com.";
    }
    const minimumLength = Number(field.getAttribute("minlength"));
    if (minimumLength > 0 && value.length < minimumLength) {
      return `Use at least ${minimumLength} characters.`;
    }
    if (field.dataset.confirm) {
      const original = document.getElementById(field.dataset.confirm);
      if (original && value !== original.value) {
        return "Passwords must match.";
      }
    }
    return "";
  };

  const validateField = (field) => {
    const message = validationMessage(field);
    const error = document.getElementById(`${field.id}-error`);
    if (error) {
      error.textContent = message;
    }
    field.setAttribute("aria-invalid", String(Boolean(message)));
    return message.length === 0;
  };

  const resetForm = (form) => {
    form.reset();
    formStates.set(form, { attempted: false });
    form.querySelectorAll("[data-validate]").forEach((field) => {
      field.removeAttribute("aria-invalid");
      const error = document.getElementById(`${field.id}-error`);
      if (error) {
        error.textContent = "";
      }
    });
    clearStatus(form);
  };

  document.querySelectorAll("[data-validate-form]").forEach((form) => {
    formStates.set(form, { attempted: false });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearStatus(form);
      formStates.get(form).attempted = true;
      let firstInvalid = null;
      form.querySelectorAll("[data-validate]").forEach((field) => {
        if (!validateField(field) && !firstInvalid) {
          firstInvalid = field;
        }
      });
      if (firstInvalid) {
        showStatus(form, "Please correct the highlighted fields.", "error");
        firstInvalid.focus();
        return;
      }
      resetForm(form);
      showStatus(form, form.dataset.success || "Your sample form is valid. No data was sent or stored.", "success");
    });
    form.addEventListener("input", () => {
      clearStatus(form);
      if (formStates.get(form).attempted) {
        form.querySelectorAll("[data-validate]").forEach(validateField);
      }
    });
  });

  document.querySelectorAll("[data-accordion-trigger]").forEach((trigger) => {
    const panel = document.getElementById(trigger.getAttribute("aria-controls"));
    const item = trigger.closest(".faq-item");
    if (!panel || !item) {
      return;
    }
    const setExpanded = (expanded) => {
      trigger.setAttribute("aria-expanded", String(expanded));
      panel.setAttribute("aria-hidden", String(!expanded));
      panel.inert = !expanded;
      item.classList.toggle("is-open", expanded);
    };
    setExpanded(false);
    trigger.addEventListener("click", () => {
      setExpanded(trigger.getAttribute("aria-expanded") !== "true");
    });
  });

  const subscriptionDialog = document.querySelector("[data-subscription-dialog]");
  if (subscriptionDialog && typeof subscriptionDialog.showModal === "function") {
    document.querySelectorAll("[data-open-subscription]").forEach((button) => {
      button.addEventListener("click", () => {
        if (subscriptionDialog.open) {
          return;
        }
        subscriptionDialog.querySelectorAll("[data-validate-form]").forEach(resetForm);
        subscriptionDialog.showModal();
      });
    });
    subscriptionDialog.querySelectorAll("[data-close-subscription]").forEach((button) => {
      button.addEventListener("click", () => subscriptionDialog.close());
    });
    subscriptionDialog.addEventListener("click", (event) => {
      if (event.target !== subscriptionDialog) {
        return;
      }
      const bounds = subscriptionDialog.getBoundingClientRect();
      const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
      if (outside) {
        subscriptionDialog.close();
      }
    });
    subscriptionDialog.addEventListener("cancel", (event) => {
      event.preventDefault();
    });
  }

  const backgrounds = [
    { color: "#f5f0e7", label: "Warm ivory" },
    { color: "#edf2f7", label: "Mist blue" },
    { color: "#edf3ee", label: "Soft sage" }
  ];
  let backgroundIndex = 0;
  const updateBackgroundStatus = () => {
    document.querySelectorAll("[data-background-status]").forEach((status) => {
      status.textContent = backgrounds[backgroundIndex].label;
    });
    document.querySelectorAll("[data-change-background]").forEach((button) => {
      button.dataset.backgroundIndex = String(backgroundIndex);
    });
  };
  updateBackgroundStatus();
  document.querySelectorAll("[data-change-background]").forEach((button) => {
    button.addEventListener("click", () => {
      backgroundIndex = (backgroundIndex + 1) % backgrounds.length;
      document.body.style.backgroundColor = backgrounds[backgroundIndex].color;
      updateBackgroundStatus();
    });
  });

  const clocks = document.querySelectorAll("[data-current-time]");
  if (clocks.length > 0) {
    const formatter = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short"
    });
    const updateTime = () => {
      const now = new Date();
      clocks.forEach((clock) => {
        clock.dateTime = now.toISOString();
        clock.textContent = formatter.format(now);
      });
    };
    updateTime();
    window.setInterval(updateTime, 1000);
  }
})();
