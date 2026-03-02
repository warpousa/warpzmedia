/**
 * warpedztheme.js
 * Behavior layer for flavor toggles + motion toggle + modal confirm.
 * Uses cookies to persist user preferences.
 */
(function (Drupal, once) {

  const COOKIE_FLAVOR = "warpedztheme_flavor";
  const COOKIE_MOTION = "warpedztheme_motion";
  const FLAVORS = ["sun-plasma", "strawberry", "chill", "key-lime"];

  // ------------------------------
  // Cookie Helpers
  // ------------------------------
  function setCookie(name, value) {
    document.cookie = `${name}=${value}; path=/; max-age=31536000`; // 1 year
  }

  function getCookie(name) {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? match[1] : null;
  }

  // ------------------------------
  // Apply Flavor
  // ------------------------------
  function applyFlavor(flavor) {
    if (!flavor || !FLAVORS.includes(flavor)) return;
    document.body.classList.remove(...FLAVORS);
    document.body.classList.add(flavor);
  }

  // ------------------------------
  // Apply Motion Preference
  // ------------------------------
  function applyMotionPreference(state) {
    if (state === "on") {
      document.body.classList.add("transition-fx");
    } else {
      document.body.classList.remove("transition-fx");
    }
  }

  // ------------------------------
  // Random Background Assignment
  // ------------------------------
  function applyRandomBackground() {
    const body = document.body;
    const bgClasses = ["bg_img1", "bg_img2", "bg_img3", "bg_img4", "bg_img5"];

    bgClasses.forEach(cls => body.classList.remove(cls));

    const randomClass = bgClasses[Math.floor(Math.random() * bgClasses.length)];
    body.classList.add(randomClass);
  }

  // ------------------------------
  // Main Theme Behavior
  // ------------------------------
  Drupal.behaviors.warpedztheme = {
    attach(context) {

      // Ensure a flavor is always set
      const savedFlavor = getCookie(COOKIE_FLAVOR);
      const body = document.body;
      const hasFlavorClass = FLAVORS.some(f => body.classList.contains(f));

      let flavorToApply = null;

      if (savedFlavor && FLAVORS.includes(savedFlavor)) {
        flavorToApply = savedFlavor;
      } else if (hasFlavorClass) {
        flavorToApply = FLAVORS.find(f => body.classList.contains(f));
      } else {
        flavorToApply = FLAVORS[0];
        setCookie(COOKIE_FLAVOR, flavorToApply);
      }

      applyFlavor(flavorToApply);

      // Restore saved motion preference
      const savedMotion = getCookie(COOKIE_MOTION);
      if (savedMotion) {
        applyMotionPreference(savedMotion);
      }

      // Random background image
      applyRandomBackground();

      // Flavor Toggle Buttons
      once("warp-flavor", ".toggle-warpedztheme-flavor", context).forEach(el => {
        el.addEventListener("click", () => {
          const flavor = el.dataset.flavor;
          if (!FLAVORS.includes(flavor)) return;

          applyFlavor(flavor);
          setCookie(COOKIE_FLAVOR, flavor);

          context.querySelectorAll(".toggle-warpedztheme-flavor").forEach(btn => {
            btn.setAttribute("aria-pressed", btn === el ? "true" : "false");
          });
        });
      });

      // Motion Toggle Button
      once("warp-motion", ".toggle-warp-motion", context).forEach(el => {
        el.addEventListener("click", () => {
          const current = getCookie(COOKIE_MOTION) === "on" ? "off" : "on";
          applyMotionPreference(current);
          setCookie(COOKIE_MOTION, current);
          el.setAttribute("aria-pressed", current === "on" ? "true" : "false");
        });
      });
    }
  };

  // ------------------------------
  // Modal Confirm Behavior
  // ------------------------------
  Drupal.behaviors.warpzModalAutoFocus = {
    attach(context) {
      const modal = once('warpz-modal', '.warpz-modal-backdrop', context).shift();
      if (!modal) return;

      const modalInner = modal.querySelector('.warpz-modal');
      if (!modalInner) return;

      // If modal is already active when behaviors attach, run immediately
      if (modal.classList.contains('is-active')) {
        activateModal();
      }

      // Watch for future activations
      const observer = new MutationObserver(() => {
        if (modal.classList.contains('is-active')) {
          activateModal();
        } else {
          deactivateModal();
        }
      });

      observer.observe(modal, { attributes: true, attributeFilter: ['class'] });

      function activateModal() {
        waitForStableDOM().then(() => {
          modalInner.querySelectorAll('[tabindex="-1"]').forEach(el => {
            el.setAttribute('tabindex', '0');
          });

          modalInner.focus();

          let firstInteractive = modalInner.querySelector('a');
          if (!firstInteractive) {
            firstInteractive = modalInner.querySelector('#edit-cancel, .dialog-cancel');
          }

          if (firstInteractive) firstInteractive.focus();

          document.addEventListener('keydown', escHandler);
          modal.addEventListener('click', backdropHandler);
        });
      }

      function deactivateModal() {
        document.removeEventListener('keydown', escHandler);
        modal.removeEventListener('click', backdropHandler);
      }

      function escHandler(e) {
        if (e.key === 'Escape') {
          modal.classList.remove('is-active');
        }
      }

      function backdropHandler(e) {
        if (e.target === modal) {
          modal.classList.remove('is-active');
        }
      }

      function waitForStableDOM() {
        return new Promise(resolve => {
          let lastHTML = "";
          let stableCount = 0;

          const check = () => {
            const currentHTML = modalInner.innerHTML;

            if (currentHTML === lastHTML) {
              stableCount++;
            } else {
              stableCount = 0;
              lastHTML = currentHTML;
            }

            if (stableCount >= 2) {
              resolve();
            } else {
              Promise.resolve().then(check);
            }
          };

          check();
        });
      }
    }
  };
})(Drupal, once);