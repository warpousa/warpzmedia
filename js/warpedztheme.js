(function (Drupal, once) {

  const FLAVORS = ["sun-plasma", "strawberry", "chill", "key-lime"];
  const COOKIE_FLAVOR = "warpZ_flavor";
  const COOKIE_MOTION = "warpZ_motion";

  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  };

  const setCookie = (name, value) => {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000`;
  };

  const applyFlavor = (flavor) => {
    const body = document.body;
    FLAVORS.forEach(f => body.classList.remove(f));
    if (FLAVORS.includes(flavor)) {
      body.classList.add(flavor);
    }
  };

  const applyMotionPreference = (motion) => {
    const body = document.body;
    body.classList.remove("transition-fx");
    if (motion === "on") {
      body.classList.add("transition-fx");
    }
  };

  Drupal.behaviors.warpedzthemeFlavor = {
    attach(context) {

      // --- FLAVOR LOGIC ---
      const savedFlavor = getCookie(COOKIE_FLAVOR);
      if (savedFlavor && FLAVORS.includes(savedFlavor)) {
        applyFlavor(savedFlavor);
      } else {
        applyFlavor("sun-plasma");
        setCookie(COOKIE_FLAVOR, "sun-plasma");
      }

      // --- MOTION LOGIC ---
      const savedMotion = getCookie(COOKIE_MOTION);
      if (savedMotion === "on" || savedMotion === "off") {
        applyMotionPreference(savedMotion);
      } else {
        // First-time visitor → enable transitions
        applyMotionPreference("on");
        setCookie(COOKIE_MOTION, "on");
      }

      // --- FLAVOR TOGGLE HANDLERS ---
      once('warp-flavor', '.toggle-warp-flavor', context).forEach(el => {
        el.addEventListener('click', () => {
          const flavor = el.dataset.flavor;
          if (FLAVORS.includes(flavor)) {
            applyFlavor(flavor);
            setCookie(COOKIE_FLAVOR, flavor);
          }
        });
      });

      // --- MOTION TOGGLE HANDLER ---
      once('warp-motion', '.toggle-warp-motion', context).forEach(el => {
        el.addEventListener('click', () => {
          const current = getCookie(COOKIE_MOTION) === "on" ? "off" : "on";
          applyMotionPreference(current);
          setCookie(COOKIE_MOTION, current);
        });
      });

    }
  };

})(Drupal, once);