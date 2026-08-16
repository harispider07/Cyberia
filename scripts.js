(function(){
"use strict";

var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
var isMobile = window.innerWidth < 768;

/* ---------- LOADER ---------- */
var loaderMsgs = ["INITIALIZING CYBERIA...", "LOADING DIGITAL EXPERIENCE...", "SYSTEM READY"];
var loaderStatus = document.getElementById('loaderStatus');
var li = 0;
var loaderInterval = setInterval(function(){
  li++;
  if(li < loaderMsgs.length){ loaderStatus.textContent = loaderMsgs[li]; }
}, 700);
window.addEventListener('load', function(){
  setTimeout(function(){
    clearInterval(loaderInterval);
    document.getElementById('loaderStatus').textContent = loaderMsgs[loaderMsgs.length-1];
    setTimeout(function(){
      document.getElementById('loader').classList.add('hidden');
    }, 400);
  }, 1400);
});

/* ---------- FILM REEL HOLES ---------- */
['reelLeft','reelRight'].forEach(function(id){
  var bar = document.getElementById(id);
  if(!bar) return;
  var frag = document.createDocumentFragment();
  for(var i=0;i<28;i++){
    var h = document.createElement('div');
    h.className = 'reel-hole';
    h.style.animationDelay = (i*0.08)+'s';
    frag.appendChild(h);
  }
  bar.appendChild(frag);
});

/* ---------- NAV ---------- */
var navbar = document.getElementById('navbar');
var navLinks = document.getElementById('navLinks');
var navToggle = document.getElementById('navToggle');

window.addEventListener('scroll', function(){
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, {passive:true});

navToggle.addEventListener('click', function(){
  var open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});
navLinks.querySelectorAll('a').forEach(function(a){
  a.addEventListener('click', function(){
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* active section indicator */
var sections = ['hero','about','events','brochure','gallery','team','venue','contact'];
var navAnchors = {};
navLinks.querySelectorAll('a[href^="#"]').forEach(function(a){
  navAnchors[a.getAttribute('href').substring(1)] = a;
});
var sectionObserver = new IntersectionObserver(function(entries){
  entries.forEach(function(entry){
    if(entry.isIntersecting){
      Object.values(navAnchors).forEach(function(a){ a.classList.remove('active'); });
      var link = navAnchors[entry.target.id];
      if(link) link.classList.add('active');
    }
  });
}, {rootMargin:'-40% 0px -50% 0px'});
sections.forEach(function(id){
  var el = document.getElementById(id);
  if(el) sectionObserver.observe(el);
});

/* ---------- CURSOR GLOW + MAGNETIC BUTTONS ---------- */
if(!isTouch && !reducedMotion){
  var glow = document.getElementById('cursorGlow');
  var gx=0, gy=0, cx=0, cy=0;
  window.addEventListener('mousemove', function(e){ gx=e.clientX; gy=e.clientY; }, {passive:true});
  (function raf(){
    cx += (gx-cx)*0.15; cy += (gy-cy)*0.15;
    glow.style.transform = 'translate('+cx+'px,'+cy+'px) translate(-50%,-50%)';
    requestAnimationFrame(raf);
  })();

  document.querySelectorAll('.btn').forEach(function(btn){
    btn.addEventListener('mousemove', function(e){
      var r = btn.getBoundingClientRect();
      var mx = e.clientX - r.left - r.width/2;
      var my = e.clientY - r.top - r.height/2;
      btn.style.transform = 'translate('+mx*0.12+'px,'+my*0.25+'px)';
    });
    btn.addEventListener('mouseleave', function(){ btn.style.transform=''; });
  });
} else {
  var glowEl = document.getElementById('cursorGlow');
  if(glowEl) glowEl.remove();
}

/* ---------- CANVAS PARTICLE NETWORK ---------- */
var canvas = document.getElementById('bgCanvas');
var ctx = canvas.getContext('2d');
var hero = document.getElementById('hero');
var particles = [];
var mouse = {x:null, y:null};
var PARTICLE_COUNT = reducedMotion ? 0 : (isMobile ? 20 : 50);
var LINK_DIST = isMobile ? 100 : 140;

function resizeCanvas(){
  var rect = hero.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}
function initParticles(){
  particles = [];
  for(var i=0;i<PARTICLE_COUNT;i++){
    particles.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      vx: (Math.random()-0.5)*0.35,
      vy: (Math.random()-0.5)*0.35,
      r: Math.random()*1.6+0.8
    });
  }
}
function drawParticles(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(var i=0;i<particles.length;i++){
    var p = particles[i];
    p.x += p.vx; p.y += p.vy;
    if(mouse.x !== null){
      var dx = mouse.x - p.x, dy = mouse.y - p.y;
      var dist = Math.sqrt(dx*dx+dy*dy);
      if(dist < 160){
        p.x += dx*0.0025; p.y += dy*0.0025;
      }
    }
    if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if(p.y < 0 || p.y > canvas.height) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle = 'rgba(255,26,26,0.55)';
    ctx.fill();

    for(var j=i+1;j<particles.length;j++){
      var q = particles[j];
      var ddx = p.x-q.x, ddy = p.y-q.y;
      var d = Math.sqrt(ddx*ddx+ddy*ddy);
      if(d < LINK_DIST){
        ctx.beginPath();
        ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y);
        ctx.strokeStyle = 'rgba(255,244,239,'+(0.18*(1-d/LINK_DIST))+')';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawParticles);
}
if(PARTICLE_COUNT > 0){
  resizeCanvas();
  initParticles();
  requestAnimationFrame(drawParticles);
  window.addEventListener('resize', function(){ resizeCanvas(); initParticles(); });
  if(!isTouch){
    hero.addEventListener('mousemove', function(e){
      var r = hero.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });
    hero.addEventListener('mouseleave', function(){ mouse.x=null; mouse.y=null; });
  }
}

/* ---------- COUNTDOWN ---------- */
var targetDate = new Date('2026-08-28T10:00:00+05:30').getTime();
function updateCountdown(){
  var now = Date.now();
  var diff = targetDate - now;
  var wrap = document.getElementById('countdown');
  if(diff <= 0){
    wrap.innerHTML = '<div class="countdown-live" style="grid-column:1/-1;">CYBERIA 2K26 IS LIVE</div>';
    clearInterval(cdInterval);
    return;
  }
  var d = Math.floor(diff/86400000);
  var h = Math.floor((diff%86400000)/3600000);
  var m = Math.floor((diff%3600000)/60000);
  var s = Math.floor((diff%60000)/1000);
  document.getElementById('cdDays').textContent = String(d).padStart(2,'0');
  document.getElementById('cdHours').textContent = String(h).padStart(2,'0');
  document.getElementById('cdMins').textContent = String(m).padStart(2,'0');
  document.getElementById('cdSecs').textContent = String(s).padStart(2,'0');
}
updateCountdown();
var cdInterval = setInterval(updateCountdown, 1000);

/* ---------- STATS COUNTER ---------- */
var statObserver = new IntersectionObserver(function(entries){
  entries.forEach(function(entry){
    if(entry.isIntersecting){
      var el = entry.target;
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.querySelector('.grad-text');
      var start = 0;
      var duration = 1400;
      var startTime = null;
      function step(ts){
        if(!startTime) startTime = ts;
        var progress = Math.min((ts-startTime)/duration, 1);
        var val = Math.floor(progress * target);
        el.childNodes[0].nodeValue = val;
        if(progress < 1) requestAnimationFrame(step);
        else el.childNodes[0].nodeValue = target;
      }
      requestAnimationFrame(step);
      statObserver.unobserve(el);
    }
  });
}, {threshold:0.5});
document.querySelectorAll('[data-count]').forEach(function(el){ statObserver.observe(el); });

/* ---------- SCROLL REVEAL ---------- */
var revealObserver = new IntersectionObserver(function(entries){
  entries.forEach(function(entry){
    if(entry.isIntersecting){
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, {threshold:0.12});
document.querySelectorAll('[data-reveal]').forEach(function(el){ revealObserver.observe(el); });

/* ---------- EVENTS DATA & RENDER ---------- */
var events = [
  {
    id:'idea-ignite', name:'Idea Ignite', type:'Technical',
    img:'assets/events/idea.jpg',
    preview:'Pitch your boldest tech idea and defend it under pressure.',
    desc:'A rapid-fire ideation and pitching challenge where teams present original tech concepts to a panel of judges.',
    team:'', duration:'', fee:'Name', coordinator:'[9080706050]', contact:'',
    rules:['Team size as per [TEAM SIZE].','Duration as per [DURATION].','Follow event-day instructions from coordinators.','Official rules to be announced in the brochure.']
  },
  {
    id:'logic-hunt', name:'Logic Hunt', type:'Technical',
    img:'assets/events/logichunt.jpg',
    preview:'Solve layered logic and programming puzzles against the clock.',
    desc:'A multi-round problem-solving event testing algorithmic thinking, debugging speed and logical reasoning.',
    team:'', duration:'', fee:'Name', coordinator:'[9080706050]', contact:'',
    rules:['Team size as per [TEAM SIZE].','Duration as per [DURATION].','No external resources unless permitted.','Official rules to be announced in the brochure.']
  },
  {
    id:'prompt-arena', name:'Prompt Arena', type:'Technical',
    img:'assets/events/prompt.jpg',
    preview:'Engineer prompts to solve creative and technical AI challenges.',
    desc:'A competitive prompt-engineering event testing precision, creativity and understanding of AI model behavior.',
    team:'', duration:'', fee:'Name', coordinator:'[9080706050]', contact:'',
    rules:['Team size as per [TEAM SIZE].','Duration as per [DURATION].','Approved tools only.','Official rules to be announced in the brochure.']
  },
  {
    id:'meme-creation', name:'Meme Creation', type:'Non-Technical',
    img:'assets/events/Memeleague.jpg',
    preview:'Turn tech culture into the funniest, sharpest memes on the floor.',
    desc:'A creative meme-making contest around technology and campus culture, judged on originality and humor.',
    team:'', duration:'', fee:'Name', coordinator:'[9080706050]', contact:'',
    rules:['Team size as per [TEAM SIZE].','Duration as per [DURATION].','No offensive or plagiarised content.','Official rules to be announced in the brochure.']
  },
  {
    id:'mystery-hunt', name:'Mystery Hunt', type:'Non-Technical',
    img:'assets/events/Mysteryhunt.jpg',
    preview:'Crack clues, chase leads and race across campus to the finish.',
    desc:'A campus-wide treasure hunt combining puzzles, riddles and physical checkpoints against the clock.',
    team:'', duration:'', fee:'Name', coordinator:'[9080706050]', contact:'',
    rules:['Team size as per [TEAM SIZE].','Duration as per [DURATION].','Stay within designated campus zones.','Official rules to be announced in the brochure.']
  },
  {
    id:'connectx', name:'ConnectX', type:'Non-Technical',
    img:'assets/events/connectx.jpg',
    preview:'A team-building relay of communication and strategy rounds.',
    desc:'A multi-round team event testing collaboration, communication and quick strategic thinking.',
    team:'', duration:'', fee:'Name', coordinator:'[9080706050]', contact:'',
    rules:['Team size as per [TEAM SIZE].','Duration as per [DURATION].','Maintain sportsmanship throughout.','Official rules to be announced in the brochure.']
  }
];

var eventsGrid = document.getElementById('eventsGrid');
events.forEach(function(ev){
  var card = document.createElement('article');
  card.className = 'event-card glass';
  card.setAttribute('data-type', ev.type);
  card.setAttribute('data-reveal','');
  var catClass = ev.type === 'Technical' ? 'technical' : 'non-technical';
  card.innerHTML =
    '<div class="event-media"><img src="'+ev.img+'" alt="'+ev.name+' event artwork" loading="lazy"><span class="event-cat '+catClass+'">'+ev.type+'</span></div>'+
    '<div class="event-body">'+
      '<h3 class="event-title">'+ev.name+'</h3>'+
      '<p class="event-desc">'+ev.preview+'</p>'+
      '<div class="event-meta"><span>&#128101; '+ev.team+'</span><span>&#9201; '+ev.duration+'</span></div>'+
      '<div class="event-actions">'+
        '<a href="#register" class="btn btn-primary">Register</a>'+
        '<button type="button" class="btn btn-ghost view-details" data-id="'+ev.id+'">View Details</button>'+
      '</div>'+
    '</div>';
  eventsGrid.appendChild(card);
  revealObserver.observe(card);
});

/* filtering */
document.querySelectorAll('.filter-row .filter-btn').forEach(function(btn){
  btn.addEventListener('click', function(){
    document.querySelectorAll('.filter-row .filter-btn').forEach(function(b){
      b.classList.remove('active'); b.setAttribute('aria-selected','false');
    });
    btn.classList.add('active'); btn.setAttribute('aria-selected','true');
    var filter = btn.getAttribute('data-filter');
    document.querySelectorAll('.event-card').forEach(function(card){
      var type = card.getAttribute('data-type');
      var show = (filter === 'all' || filter === type);
      card.style.transition = 'opacity .35s ease, transform .35s ease';
      if(show){
        card.classList.remove('hide');
        requestAnimationFrame(function(){ card.style.opacity='1'; card.style.transform='scale(1)'; });
      } else {
        card.style.opacity='0'; card.style.transform='scale(.92)';
        setTimeout(function(){ card.classList.add('hide'); }, 350);
      }
    });
  });
});

/* modal */
var eventModal = document.getElementById('eventModal');
function openEventModal(id){
  var ev = events.find(function(e){ return e.id === id; });
  if(!ev) return;
  var catClass = ev.type === 'Technical' ? 'technical' : 'non-technical';
  var cat = document.getElementById('modalCat');
  cat.textContent = ev.type;
  cat.className = 'event-cat ' + catClass;
  document.getElementById('modalTitle').textContent = ev.name;
  document.getElementById('modalDesc').textContent = ev.desc;
  document.getElementById('modalTeam').textContent = ev.team;
  document.getElementById('modalDuration').textContent = ev.duration;
  document.getElementById('modalFee').textContent = ev.fee;
  document.getElementById('modalCoord').textContent = ev.coordinator;
  document.getElementById('modalContact').textContent = ev.contact;
  document.getElementById('modalRules').innerHTML = ev.rules.map(function(r){ return '<li>'+r+'</li>'; }).join('');
  eventModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('modalCloseBtn').focus();
}
function closeEventModal(){
  eventModal.classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('click', function(e){
  var trigger = e.target.closest('.view-details');
  if(trigger){ openEventModal(trigger.getAttribute('data-id')); }
});
document.getElementById('modalCloseBtn').addEventListener('click', closeEventModal);
eventModal.addEventListener('click', function(e){ if(e.target === eventModal) closeEventModal(); });

/* ---------- GALLERY ---------- */
var galleryData = [
  {id:1, src:'assets/gallery/Gallery1.jpg', title:'Campus', cat:'Campus'},
  {id:2, src:'assets/gallery/Gallery2.jpg', title:'Cyberia', cat:'Cyberia'},
  {id:3, src:'assets/gallery/Gallery3.jpg', title:'Technical Events', cat:'Technical Events'},
  {id:4, src:'assets/gallery/Gallery4.jpg', title:'Students', cat:'Students'},
  {id:5, src:'assets/gallery/Gallery5.jpg', title:'Previous Symposiums', cat:'Previous Symposiums'},
  {id:6, src:'assets/gallery/Gallery5.jpg', title:'Campus', cat:'Campus'}
];
var galleryGrid = document.getElementById('galleryGrid');
galleryData.forEach(function(g, idx){
  var item = document.createElement('div');
  item.className = 'gallery-item';
  item.setAttribute('data-cat', g.cat);
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'button');
  item.setAttribute('aria-label', 'Open image: ' + g.title);
  item.innerHTML = '<img src="'+g.src+'" alt="'+g.title+' photo from Cyberia" loading="lazy"><div class="gallery-overlay"><span>'+g.title+'</span></div>';
  item.addEventListener('click', function(){ openLightbox(idx); });
  item.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openLightbox(idx); } });
  galleryGrid.appendChild(item);
});

document.querySelectorAll('[data-gfilter]').forEach(function(btn){
  btn.addEventListener('click', function(){
    document.querySelectorAll('[data-gfilter]').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
    var filter = btn.getAttribute('data-gfilter');
    document.querySelectorAll('.gallery-item').forEach(function(item){
      var show = (filter === 'all' || item.getAttribute('data-cat') === filter);
      item.style.display = show ? '' : 'none';
    });
  });
});

/* lightbox */
var lightbox = document.getElementById('lightbox');
var lightboxImg = document.getElementById('lightboxImg');
var currentIndex = 0;
function openLightbox(idx){
  currentIndex = idx;
  lightboxImg.src = galleryData[idx].src;
  lightboxImg.alt = galleryData[idx].title + ' photo from Cyberia';
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox(){
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}
function showNext(){ currentIndex = (currentIndex+1) % galleryData.length; lightboxImg.src = galleryData[currentIndex].src; }
function showPrev(){ currentIndex = (currentIndex-1+galleryData.length) % galleryData.length; lightboxImg.src = galleryData[currentIndex].src; }
document.getElementById('lbClose').addEventListener('click', closeLightbox);
document.getElementById('lbNext').addEventListener('click', showNext);
document.getElementById('lbPrev').addEventListener('click', showPrev);
lightbox.addEventListener('click', function(e){ if(e.target === lightbox) closeLightbox(); });

/* ---------- KEYBOARD (modal + lightbox) ---------- */
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape'){
    if(eventModal.classList.contains('open')) closeEventModal();
    if(lightbox.classList.contains('open')) closeLightbox();
  }
  if(lightbox.classList.contains('open')){
    if(e.key === 'ArrowRight') showNext();
    if(e.key === 'ArrowLeft') showPrev();
  }
});

/* ---------- LIGHTWEIGHT PARALLAX ---------- */
if(!reducedMotion && !isTouch){
  window.addEventListener('scroll', function(){
    var y = window.scrollY;
    var grid = document.querySelector('.hero-grid');
    if(grid && y < window.innerHeight) grid.style.transform = 'translateY('+(y*0.15)+'px)';
  }, {passive:true});
}

})();