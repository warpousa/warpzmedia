(function (Drupal, once) {
  const FLAVORS = ["sun-plasma", "strawberry", "chill", "key-lime"];
  const COOKIE_NAME = "warpZ_flavor";
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
  Drupal.behaviors.warpedZFlavor = {
    attach(context) {
      // Apply saved flavor on load, or default to sun-plasma
      const saved = getCookie(COOKIE_NAME);
      if (saved && FLAVORS.includes(saved)) {
        applyFlavor(saved);
      } else {
        // First-time visitor or invalid cookie value
        applyFlavor("sun-plasma");
        setCookie(COOKIE_NAME, "sun-plasma");
      }
      // Bind click handlers
      once('warp-flavor', '.toggle-warp-flavor', context).forEach(el => {
        el.addEventListener('click', () => {
          const flavor = el.dataset.flavor;
          if (FLAVORS.includes(flavor)) {
            applyFlavor(flavor);
            setCookie(COOKIE_NAME, flavor);
          }
        });
      });
    }
  };
})(Drupal, once);