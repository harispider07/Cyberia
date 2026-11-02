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
var loaderDone = false;
function finishLoader(){
  if(loaderDone) return;
  loaderDone = true;
  clearInterval(loaderInterval);
  document.getElementById('loaderStatus').textContent = loaderMsgs[loaderMsgs.length-1];
  setTimeout(function(){
    document.getElementById('loader').classList.add('hidden');
  }, 400);
}
window.addEventListener('load', function(){
  setTimeout(finishLoader, 1400);
});
/* Safety net: never let the loader hang the site if images are slow on a weak connection */
setTimeout(finishLoader, 5000);

/* ---------- BROCHURE INTRO POPUP ---------- */
var brochurePopup = document.getElementById('brochurePopup');
var brochurePopupClose = document.getElementById('brochurePopupClose');
function openBrochurePopup(){
  if(!brochurePopup) return;
  brochurePopup.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeBrochurePopup(){
  if(!brochurePopup) return;
  brochurePopup.classList.remove('open');
  document.body.style.overflow = '';
}
if(brochurePopup){
  setTimeout(openBrochurePopup, 2000);
  brochurePopupClose.addEventListener('click', closeBrochurePopup);
  brochurePopup.addEventListener('click', function(e){ if(e.target === brochurePopup) closeBrochurePopup(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && brochurePopup.classList.contains('open')) closeBrochurePopup(); });
}

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
var targetDate = new Date('2026-09-11T10:00:00+05:30').getTime();
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
    date:'11 September 2026', venue:'Conference Hall - REC', 
    team:'Max 3 Members', duration:'5 Minutes', 
    lead:{name:'ADHINA SHREE', phone:'9585620540'},
    staff:{name:'Mr.K.SIVAKUMAR', phone:'9524193027'},
    teamMembers:['JOTHIKA P','GAYATHRI S','ANITHA V','SAVITHA S','ELAVARASI R','DHARSHNI A'],
    rules:['Each team can have a maximum of 3 members.','Presentation time: 5 minutes.','Q&A session: 2 minutes.','deadline for PPT submission is 09-09-2026. Please submit accordingly.']
  },
  {
    id:'logic-hunt', name:'Logic Hunt', type:'Technical',
    img:'assets/events/logichunt.jpg',
    preview:'Solve layered logic and programming puzzles against the clock.',
    desc:'A multi-round problem-solving event testing algorithmic thinking, debugging speed and logical reasoning.',
    date:'11 September 2026', venue:'DS Lab - REC', 
    team:'Individual', duration:'30 Minutes',
    lead:{name:'RAMYA S', phone:'9597092539'},
    staff:{name:'Mrs.K.USHA NANDHINI', phone:'9094930631'},
    teamMembers:['VARADHARAJ','DIVYA D','SUBITHA T','BHUVANESHWARI','PRIYADHARSHINI'],
    rules:['Internet usage is strictly prohibited.','Any form of malpractice lead to disqualification.','Participants must complete the task within the given time limit.','Languages Python,java,C.']
  },
  {
    id:'prompt-arena', name:'Prompt Arena', type:'Technical',
    img:'assets/events/prompt.jpg',
    preview:'Engineer prompts to solve creative and technical AI challenges.',
    desc:'A competitive prompt-engineering event testing precision, creativity and understanding of AI model behavior.',
    date:'11 September 2026', venue:'Research Lab - REC',
    team:'Max 3 Members', duration:'30 Minutes',
    lead:{name:'DHANUSHRAJ P', phone:'7358816874'},
    staff:{name:'Mr.E.JEAN EDWARD ELEMENT', phone:'9655951920'},
    teamMembers:['NITHISHKUMAR N','BALA P','DEEPAK S','SUBA LAKSHMI','ANANTHI A','VINOTHA M'],
    rules:['Time Limit: 30 minutes.','Topic: Given on the spot.','Task: Create a webpage using any AI chatbot, Front-end only.','	Evaluation: Based on how well the webpage meets the given criteria.']
  },
  {
    id:'meme-creation', name:'Meme League', type:'Non-Technical',
    img:'assets/events/Memeleague.jpg',
    preview:'Turn tech culture into the funniest, sharpest memes on the floor.',
    desc:'A creative meme-making contest around technology and campus culture, judged on originality and humor.',
    date:'11 September 2026', venue:'Seminar Hall - REC',
    team:'Individual', duration:'30 Minutes',
    lead:{name:'RAGUL D', phone:'6369762414'},
    staff:{name:'Mrs.S.Vijayakumari', phone:'9944212958'},
    teamMembers:['SANJAY S','LENINKUMAR R','GOWTHAMAN'],
    rules:['🎯 Theme-based: Memes must match the given topic.',' ⌛ Time limit: 30 minutes to create and submit.','🧠  Judging Criteria: Creativity, relevance to theme, humor, and originality.','🚫  Late submissions will not be accepted.','✅  Judges decisions are final.']
  },
  {
    id:'mystery-hunt', name:'Mystery Hunt', type:'Non-Technical',
    img:'assets/events/Mysteryhunt.jpg',
    preview:'Crack clues, chase leads and race across campus to the finish.',
    desc:'A campus-wide treasure hunt combining puzzles, riddles and physical checkpoints against the clock.',
    date:'11 September 2026', venue:'Admin Block GoundFloor - REC', 
    team:'Max 4 Members', duration:'45 Minutes',
    lead:{name:'VISHAL', phone:'6383670409'},
    staff:{name:'Mrs.K.Susila Rani', phone:'9486306901'},
    teamMembers:['ANBALAGAN A','FEROSKHAN I','JOHNSY','PRAGATHI R','PRADAPMAVEEN M'],
    rules:['Finish within the given time.','Don’t use any devices.','No arguments or fighting with other groups.','Additional Rules (To be announced on the spot)']
  },
  {
    id:'connectx', name:'ConnectX', type:'Non-Technical',
    img:'assets/events/ConnectX.jpg',
    preview:'A team-building relay of communication and strategy rounds.',
    desc:'A multi-round team event testing collaboration, communication and quick strategic thinking.',
    date:'11 September 2026', venue:'OS LAB - REC',
    team:'Max 4 Members', duration:'45 Minutes',
    lead:{name:'SOWMIYA K', phone:'9894770705'},
    staff:{name:'Mrs.R.Saranya Rani', phone:'8883383724'},
    teamMembers:['SUJITHA A','YUVASRI K','SINDHUJA R','MOHANAPRIYA P','SUBASH'],
    rules:['A whistle will be used during the event.',' The participant who knows the answer first must pick up the whistle and answer.',' Participants must follow the coordinator’s instructions and maintain discipline throughout the event.']
  },
];

var eventsGrid = document.getElementById('eventsGrid');
events.forEach(function(ev){
  var card = document.createElement('article');
  card.className = 'event-card glass';
  card.setAttribute('data-type', ev.type);
  card.setAttribute('data-reveal','');
  var catClass = ev.type === 'Technical' ? 'technical' : 'non-technical';
  card.innerHTML =
    '<div class="event-media"><img src="'+ev.img+'" alt="'+ev.name+' event artwork" loading="lazy"><span class="event-cat '+catClass+'">'+ev.type+'</span>'+
      '<div class="event-coord-overlay"><span class="oc-label">Student Coordinator</span><span class="oc-name">'+ev.lead.name+'</span><span class="oc-phone">&#128222; '+ev.lead.phone+'</span></div>'+
    '</div>'+
    '<div class="event-body">'+
      '<h3 class="event-title">'+ev.name+'</h3>'+
      '<p class="event-desc">'+ev.preview+'</p>'+
      '<div class="event-meta"><span>&#128101; '+ev.team+'</span><span>&#9201; '+ev.duration+'</span></div>'+
      '<div class="event-actions">'+
        '<a href="https://forms.gle/amWnfjJcyrip1Zgp7" target="_blank" class="btn btn-primary">Register</a>'+
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
  document.getElementById('modalDate').textContent = ev.date || '28 August 2026';
  document.getElementById('modalVenue').textContent = ev.venue || 'Roever Engineering College';
  document.getElementById('modalDuration').textContent = ev.time ? ev.time + '  •  ' + ev.duration : ev.duration;
  document.getElementById('modalTeam').textContent = ev.team;
  document.getElementById('modalFee').textContent = ev.fee;
  var teamHtml = (ev.teamMembers && ev.teamMembers.length) ?
    '<div class="team-members-wrap"><div class="team-label">Team Members</div>'+ev.teamMembers.map(function(n){ return '<span class="team-chip">'+n+'</span>'; }).join('')+'</div>' : '';
  document.getElementById('modalCoords').innerHTML =
    '<div class="coord-block"><div class="coord-role-label">Lead Student Coordinator</div>'+
      '<div class="coord-name">'+ev.lead.name+'</div>'+
      '<div class="coord-phone">&#128222; '+ev.lead.phone+'</div></div>'+
    teamHtml+
    '<div class="coord-block staff"><div class="coord-role-label">Staff Coordinator</div>'+
      '<div class="coord-name">'+ev.staff.name+'</div>'+
      '<div class="coord-phone">&#128222; '+ev.staff.phone+'</div></div>';
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
  {id:1, src:'assets/gallery/Gallery1.jpg', title:'', cat:'Campus'},
  {id:2, src:'assets/gallery/Gallery2.jpg', title:'', cat:'Cyberia'},
  {id:3, src:'assets/gallery/Gallery3.jpg', title:'', cat:'Technical Events'},
  {id:4, src:'assets/gallery/Gallery4.jpg', title:'', cat:'Students'},
  {id:5, src:'assets/gallery/Gallery5.jpg', title:'', cat:'Previous Symposiums'},
  {id:6, src:'assets/gallery/Gallery6.jpg', title:'', cat:'Campus'}
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

/* ---------- FORCE BROCHURE DOWNLOAD (fixes Safari/in-app browsers ignoring 'download' attr) ---------- */
document.querySelectorAll('a[download]').forEach(function(link){
  link.addEventListener('click', function(e){
    e.preventDefault();
    var url = link.getAttribute('href');
    var filename = link.getAttribute('download') || 'Brochure.jpg';
    fetch(url)
      .then(function(res){ return res.blob(); })
      .then(function(blob){
        var blobUrl = URL.createObjectURL(blob);
        var tempLink = document.createElement('a');
        tempLink.href = blobUrl;
        tempLink.download = filename;
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
        setTimeout(function(){ URL.revokeObjectURL(blobUrl); }, 3000);
      })
      .catch(function(){
        // fallback: if fetch fails (e.g. CORS), just open the file normally
        window.open(url, '_blank');
      });
  });
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
