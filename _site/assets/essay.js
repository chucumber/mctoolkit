// loading lazy //
        $('img').each(function() {
    if (!$(this).attr('loading')) {
        $(this).attr('loading', 'lazy');
    }
});

// draggable
$(function () {
  const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (isDesktop) {
    // Desktop → enable draggable
    $(".foreword, .author-bio").draggable({
      containment: "#leftPane",
      scroll: false
    });

    $(".foreword, .author-bio").attr('title', 'Hold and drag');
  } else {
    // Touch device → mark it with a class
    $('.foreword, .author-bio').addClass('touch-screen');
  }
});

// author bio
document.querySelectorAll('.author-toggle').forEach(button => {
  button.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent the document click from firing
    const bio = button.nextElementSibling;
    bio.classList.toggle('active');
  });
});

// Close when clicking the × button
document.querySelectorAll('.author-close').forEach(closeBtn => {
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent reopening
    closeBtn.parentElement.classList.remove('active');
  });
});

// Close when clicking outside the author bio
document.addEventListener('click', (e) => {
  document.querySelectorAll('.author-bio.active').forEach(bio => {
    if (!bio.contains(e.target) && !bio.previousElementSibling.contains(e.target)) {
      bio.classList.remove('active');
    }
  });
});


// Add popup container to body
const popup = document.createElement('div');
popup.className = 'popup';
document.body.appendChild(popup);

// Handle image clicks
document.querySelectorAll('.content img:not(.floating img)').forEach(img => {
   
  img.addEventListener('click', () => {
    popup.innerHTML = '';

    const popupImg = document.createElement('img');
    popupImg.src = img.src;

    const credit = document.createElement('div');
    credit.className = 'credit';
    credit.innerHTML = img.getAttribute("data-caption") || '';

    popup.appendChild(popupImg);
    popup.appendChild(credit);
    popup.classList.add('active');
  });
  
});


// Close popup when clicking
popup.addEventListener('click', (e) => {
  if (e.target === popup) {   // only close if click backdrop, not image
    popup.classList.remove('active');
  }
});

// Bubble text animation
if (document.querySelectorAll('.bubble').length > 0) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '-50px'
  });

  document.querySelectorAll('.bubble').forEach((bubble) => {
    observer.observe(bubble);
  });
}

// image caption
document.querySelectorAll("figure").forEach(figure => {
  const img = figure.querySelector("img");
  const caption = figure.querySelector("figcaption");
  if (img && caption && !caption.innerHTML.trim()) {
    const captionHTML = img.getAttribute("data-caption") || img.getAttribute("alt");
    caption.innerHTML = captionHTML;
  }
});

// auto slideshow
document.addEventListener("DOMContentLoaded", () => {
  const slideshows = document.querySelectorAll(".auto-slideshow");
  const intervalTime = 2000;

  slideshows.forEach(slideshow => {
    const figures = slideshow.querySelectorAll("figure");
    let index = 0;

    figures[index].classList.add("active");

    setInterval(() => {
      figures[index].classList.remove("active");
      index = (index + 1) % figures.length;
      figures[index].classList.add("active");
    }, intervalTime);
  });
});


//contributor info
$(document).ready(function () {
  $('.contributor-card').on('click', function () {
    const target = $(this).data('target');
    const popup = $('#' + target);
    $('.contributor-popup').addClass('hidden');
    popup.removeClass('hidden');
    $('body').addClass('no-scroll');
  });

  // Close with "X" button
  $('.contributor-popup .close').on('click', function () {
    $('.contributor-popup').addClass('hidden');
    $('body').removeClass('no-scroll');
  });

  // Close by clicking outside popup content
  $(document).on('click', function (e) {
    const $popup = $('.contributor-popup:visible');
    if ($popup.length && $(e.target).is('.contributor-popup')) {
      $popup.addClass('hidden');
      $('body').removeClass('no-scroll');
    }
  });
});


document.getElementById("top-btn").addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});


// Lightbox
const initLightbox = () => {
  const lightboxScroll = document.querySelector('.lightbox-scroll');
  const imgInfo = document.querySelector('.img-info');
  if (!lightboxScroll || !imgInfo) return;

  const images = Array.from(lightboxScroll.querySelectorAll('img'));
  if (images.length === 0) return;

  let currentIndex = 0;
  const totalImages = images.length;

  let imagePositions = [0];
  let totalWidth = 0;

  Promise.all(images.map(img => {
    return new Promise(resolve => {
      if (img.complete) resolve(img);
      img.onload = () => resolve(img);
    });
  })).then(loadedImages => {
    loadedImages.forEach((img, i) => {
      if (i < totalImages - 1) {
        totalWidth += img.offsetWidth;
        imagePositions.push(totalWidth);
      }
    });

    const updateCredit = (index) => {
      const img = images[index];
      const credit = img.getAttribute("data-caption") || '';
      imgInfo.innerHTML = credit;
    };

    const goToImage = (index) => {
      currentIndex = index;
      const offset = imagePositions[currentIndex];
      lightboxScroll.style.transform = `translateX(-${offset}px)`;
      updateCounter();
      updateCredit(currentIndex);
    };

    const nextImage = () => {
      currentIndex = (currentIndex + 1) % totalImages;
      goToImage(currentIndex);
    };

    const prevImage = () => {
      currentIndex = (currentIndex - 1 + totalImages) % totalImages;
      goToImage(currentIndex);
    };

    const updateCounter = () => {
      const counter = document.querySelector('.lightbox-counter');
      counter.textContent = `( ${currentIndex + 1}/${totalImages} )`;
    };

    document.querySelector('.lightbox-button.next').addEventListener('click', nextImage);
    document.querySelector('.lightbox-button.prev').addEventListener('click', prevImage);

    // Swipe detection for mobile
    let startX = 0;
    let endX = 0;

    lightboxScroll.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });

    lightboxScroll.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      handleSwipe();
    });

    const handleSwipe = () => {
      let diffX = endX - startX;
      if (Math.abs(diffX) > 50) { // threshold: 50px
        if (diffX > 0) {
          prevImage(); // swipe right → previous
        } else {
          nextImage(); // swipe left → next
        }
      }
    };

    // Init
    updateCounter();
    updateCredit(0);
  });
};

initLightbox();


// arrow cursor
const customCursor = document.querySelector('.custom-cursor');
const prevBtn = document.querySelector('.lightbox-button.prev');
const nextBtn = document.querySelector('.lightbox-button.next');

document.addEventListener('mousemove', e => {
  customCursor.style.left = `${e.clientX}px`;
  customCursor.style.top = `${e.clientY}px`;
});

// When hovering on prev button → show ←
prevBtn.addEventListener('mouseenter', () => {
  customCursor.textContent = '←';
  customCursor.style.opacity = 1;
});
prevBtn.addEventListener('mouseleave', () => {
  customCursor.style.opacity = 0;
});

// When hovering on next button → show →
nextBtn.addEventListener('mouseenter', () => {
  customCursor.textContent = '→';
  customCursor.style.opacity = 1;
});
nextBtn.addEventListener('mouseleave', () => {
  customCursor.style.opacity = 0;
});
