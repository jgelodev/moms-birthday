/* ==========================================================================
   Happy Birthday, Mom. — behaviour
   ========================================================================== */

(function () {
  'use strict';

  // How long the "Open your letter" scroll takes, in milliseconds (1800 = 1.8 seconds)
  var SCROLL_TO_LETTER_MS = 1600;

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.classList.add('js');

  initScrollMotion();
  initSmoothScrollLinks();
  initLightbox();

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /* ----------------------------------------------------------------------
     SCROLL MOTION
     Elements fade, rise and tilt in as they approach the middle of the
     screen, and they reverse as you scroll back up. Photos drift against
     the scroll and skew with scroll speed. The envelope opens as you leave
     the top of the page. Values are smoothed so nothing snaps.
     ---------------------------------------------------------------------- */
  function initScrollMotion() {
    var progressBar = document.querySelector('.scroll-progress');
    var targets = reduceMotion
      ? []
      : Array.prototype.slice.call(document.querySelectorAll('.reveal, .hero-text, .hero-photo, .divider'));

    var items = targets.map(function (el) {
      return { el: el, top: 0, height: 0, progress: 0, shift: 0 };
    });

    var lastScrollY = window.scrollY;
    var velocity = 0;
    var frameQueued = false;

    // Read each element's position in the document. offsetTop ignores CSS
    // transforms, so the measurements stay stable while things move.
    function measure() {
      items.forEach(function (item) {
        var top = 0;
        var node = item.el;
        while (node) {
          top += node.offsetTop;
          node = node.offsetParent;
        }
        item.top = top;
        item.height = item.el.offsetHeight;
      });
    }

    function frame() {
      frameQueued = false;

      var scrollY = window.scrollY;
      var viewportH = window.innerHeight;
      var delta = scrollY - lastScrollY;
      lastScrollY = scrollY;

      // Scroll speed, smoothed. Used to skew photos while you scroll.
      var velocityTarget = clamp(delta / 30, -1, 1);
      var nextVelocity = velocity + (velocityTarget - velocity) * 0.2;
      var moving = Math.abs(velocityTarget - nextVelocity) > 0.001 || Math.abs(nextVelocity) > 0.001;
      velocity = Math.abs(nextVelocity) < 0.001 ? 0 : nextVelocity;
      root.style.setProperty('--velocity', velocity.toFixed(3));

      items.forEach(function (item) {
        var center = item.top + item.height / 2 - scrollY;

        // 0 = off screen, 1 = fully present. Works in both scroll directions.
        var fadeIn = clamp((viewportH - center) / (viewportH * 0.2), 0, 1);
        var fadeOut = clamp(center / (viewportH * 0.2), 0, 1);
        var targetProgress = Math.min(fadeIn, fadeOut);

        // Gentle counter-drift for photos
        var targetShift = (center - viewportH / 2) * -0.03;

        item.progress += (targetProgress - item.progress) * 0.2;
        item.shift += (targetShift - item.shift) * 0.2;

        if (Math.abs(targetProgress - item.progress) > 0.001 || Math.abs(targetShift - item.shift) > 0.05) {
          moving = true;
        }

        item.el.style.setProperty('--p', item.progress.toFixed(3));
        item.el.style.setProperty('--shift', item.shift.toFixed(2));
      });

      // Envelope opens as you scroll away from the top, and closes as you scroll back
      if (!reduceMotion) {
        root.style.setProperty('--envelope-open', clamp(scrollY / (viewportH * 0.45), 0, 1).toFixed(3));
      }

      if (progressBar) {
        var scrollable = root.scrollHeight - viewportH;
        var ratio = scrollable > 0 ? clamp(scrollY / scrollable, 0, 1) : 0;
        progressBar.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
      }

      if (moving) {
        requestFrame();
      }
    }

    function requestFrame() {
      if (!frameQueued) {
        frameQueued = true;
        window.requestAnimationFrame(frame);
      }
    }

    window.addEventListener('scroll', requestFrame, { passive: true });
    window.addEventListener('resize', function () {
      measure();
      requestFrame();
    });
    window.addEventListener('load', function () {
      measure();
      requestFrame();
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        measure();
        requestFrame();
      });
    }

    measure();
    requestFrame();
  }

  /* ----------------------------------------------------------------------
     SMOOTH SCROLL for in-page links ("Open your letter")
     Scrolls over SCROLL_TO_LETTER_MS with an ease-in-out curve. Any wheel,
     touch or key press cancels it so the visitor is always in control.
     ---------------------------------------------------------------------- */
  function initSmoothScrollLinks() {
    var links = document.querySelectorAll('a[href^="#"]');

    Array.prototype.forEach.call(links, function (link) {
      link.addEventListener('click', function (event) {
        var id = link.getAttribute('href').slice(1);
        var target = id ? document.getElementById(id) : null;
        if (!target) {
          return;
        }
        event.preventDefault();
        scrollToElement(target, id);
      });
    });
  }

  function scrollToElement(target, id) {
    var startY = window.scrollY;
    var maxY = root.scrollHeight - window.innerHeight;
    var endY = clamp(target.getBoundingClientRect().top + startY, 0, maxY);
    var distance = endY - startY;

    if (reduceMotion || Math.abs(distance) < 2) {
      window.scrollTo(0, endY);
      updateHash(id);
      return;
    }

    var startTime = null;
    var finished = false;
    var previousBehavior = root.style.scrollBehavior;

    // Stop the browser's own smooth scrolling so our frame-by-frame scroll stays exact
    root.style.scrollBehavior = 'auto';
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });
    window.addEventListener('keydown', stop);

    function cleanup() {
      finished = true;
      root.style.scrollBehavior = previousBehavior;
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
      window.removeEventListener('keydown', stop);
    }

    function stop() {
      if (!finished) {
        cleanup();
      }
    }

    function step(timestamp) {
      if (finished) {
        return;
      }
      if (startTime === null) {
        startTime = timestamp;
      }
      var t = clamp((timestamp - startTime) / SCROLL_TO_LETTER_MS, 0, 1);
      window.scrollTo(0, startY + distance * easeInOutCubic(t));

      if (t < 1) {
        window.requestAnimationFrame(step);
      } else {
        cleanup();
        updateHash(id);
      }
    }

    window.requestAnimationFrame(step);
  }

  function updateHash(id) {
    if (id && window.history && window.history.replaceState) {
      window.history.replaceState(null, '', '#' + id);
    }
  }

  /* ----------------------------------------------------------------------
     PHOTO VIEWER
     Opens from any [data-lightbox-trigger] button. Closes with ×, Escape,
     or a tap outside the photo. Arrow keys and phone swipes move between photos.
     ---------------------------------------------------------------------- */
  function initLightbox() {
    var dialog = document.getElementById('lightbox');
    var triggers = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox-trigger]'));

    if (!dialog || !triggers.length || typeof dialog.showModal !== 'function') {
      return;
    }

    var image = document.getElementById('lightbox-image');
    var caption = document.getElementById('lightbox-caption');
    var closeButton = dialog.querySelector('[data-lightbox-close]');
    var prevButton = dialog.querySelector('[data-lightbox-prev]');
    var nextButton = dialog.querySelector('[data-lightbox-next]');
    var currentIndex = 0;
    var touchStartX = null;

    function showPhoto(index) {
      var total = triggers.length;
      currentIndex = (index + total) % total;

      var trigger = triggers[currentIndex];
      var sourceImage = trigger.querySelector('img');
      var figure = trigger.closest('figure');
      var sourceCaption = figure ? figure.querySelector('figcaption') : null;

      image.setAttribute('src', sourceImage.getAttribute('src'));
      image.setAttribute('alt', sourceImage.getAttribute('alt') || '');
      caption.textContent = sourceCaption ? sourceCaption.textContent : '';

      var onlyOnePhoto = total < 2;
      prevButton.hidden = onlyOnePhoto;
      nextButton.hidden = onlyOnePhoto;
    }

    function openPhoto(index) {
      showPhoto(index);
      document.body.classList.add('lightbox-open');
      dialog.showModal();
      closeButton.focus();
    }

    function closePhoto() {
      dialog.close();
    }

    triggers.forEach(function (trigger, index) {
      trigger.addEventListener('click', function () {
        openPhoto(index);
      });
    });

    closeButton.addEventListener('click', closePhoto);
    prevButton.addEventListener('click', function () {
      showPhoto(currentIndex - 1);
    });
    nextButton.addEventListener('click', function () {
      showPhoto(currentIndex + 1);
    });

    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) {
        closePhoto();
      }
    });

    dialog.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closePhoto();
      } else if (event.key === 'ArrowLeft') {
        showPhoto(currentIndex - 1);
      } else if (event.key === 'ArrowRight') {
        showPhoto(currentIndex + 1);
      }
    });

    dialog.addEventListener('touchstart', function (event) {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });

    dialog.addEventListener('touchend', function (event) {
      if (touchStartX === null) {
        return;
      }
      var distance = event.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(distance) > 50) {
        showPhoto(currentIndex + (distance < 0 ? 1 : -1));
      }
    }, { passive: true });

    dialog.addEventListener('close', function () {
      document.body.classList.remove('lightbox-open');
      triggers[currentIndex].focus({ preventScroll: true });
    });
  }
})();
