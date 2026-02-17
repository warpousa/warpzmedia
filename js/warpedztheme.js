/**
 * warpedztheme.js
 * Behavior layer for flavor toggles + motion toggle.
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

    // Remove any existing bg_imgX classes
    bgClasses.forEach(cls => body.classList.remove(cls));

    // Pick a random one
    const randomClass = bgClasses[Math.floor(Math.random() * bgClasses.length)];

    // Apply it
    body.classList.add(randomClass);
  }  
    
  // ------------------------------
  // Drupal Behavior
  // ------------------------------
  Drupal.behaviors.warpedztheme = {
    attach(context) {
      
      // --------------------------
      // Ensure a flavor is always set
      // --------------------------
      const savedFlavor = getCookie(COOKIE_FLAVOR);
      const body = document.body;
      const hasFlavorClass = FLAVORS.some((f) => body.classList.contains(f));

      let flavorToApply = null;

      if (savedFlavor && FLAVORS.includes(savedFlavor)) {
        // Valid saved flavor in cookie
        flavorToApply = savedFlavor;
      } else if (hasFlavorClass) {
        // Body already has a flavor class (e.g., server-side)
        flavorToApply = FLAVORS.find((f) => body.classList.contains(f));
      } else {
        // No cookie + no class → use default (index 0)
        flavorToApply = FLAVORS[0];
        setCookie(COOKIE_FLAVOR, flavorToApply);
      }

      applyFlavor(flavorToApply);

      // --------------------------
      // Restore saved motion preference
      // --------------------------
      const savedMotion = getCookie(COOKIE_MOTION);
      if (savedMotion) {
        applyMotionPreference(savedMotion);
      }

      // --------------------------
      // Random background image
      // --------------------------
      applyRandomBackground();      
      
      // --------------------------
      // Flavor Toggle Buttons
      // --------------------------
      once("warp-flavor", ".toggle-warpedztheme-flavor", context).forEach(
        (el) => {
          el.addEventListener("click", () => {
            const flavor = el.dataset.flavor;
            if (!FLAVORS.includes(flavor)) return;

            // Apply flavor + persist
            applyFlavor(flavor);
            setCookie(COOKIE_FLAVOR, flavor);

            // Update aria-pressed states (mutually exclusive)
            context
              .querySelectorAll(".toggle-warpedztheme-flavor")
              .forEach((btn) => {
                const isActive = btn === el;
                btn.setAttribute("aria-pressed", isActive ? "true" : "false");
              });
          });
        }
      );

      // --------------------------
      // Motion Toggle Button
      // --------------------------
      once("warp-motion", ".toggle-warp-motion", context).forEach((el) => {
        el.addEventListener("click", () => {
          const current = getCookie(COOKIE_MOTION) === "on" ? "off" : "on";
          applyMotionPreference(current);
          setCookie(COOKIE_MOTION, current);
          el.setAttribute("aria-pressed", current === "on" ? "true" : "false");
        });
      });
    },
  };
})(Drupal, once);