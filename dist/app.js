(() => {
  'use strict';
  const panels = [...document.querySelectorAll('.panel')];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const gallery = document.querySelector('.film-gallery');
  const stage = document.getElementById('rust-film');
  const slides = [
    {src:'assets/rust-menu-preview.webp',label:'主菜单'},
    {src:'assets/rust-levels-preview.webp',label:'选关'},
    {src:'assets/rust-settings-preview.webp',label:'设置'}
  ];
  const dialog = document.getElementById('image-dialog');
  const mod = value => (value + slides.length) % slides.length;
  let panelIndex = 0, galleryIndex = 0, animating = false, queuedDirection = 0;
  let suppressClickUntil = 0, lastOpener, scrollingFrame = 0;
  const cards = [];

  function updateScene() {
    const id = panels[panelIndex].id;
    document.body.dataset.panel = id;
    document.body.dataset.activeProject = id === 'boom' ? 'boom' : 'rust';
    window.portfolioAmbient.setScene({profile:4,skills:5,rust:galleryIndex,boom:3,notes:5}[id]);
    document.getElementById('page-number').textContent = String(panelIndex + 1).padStart(2,'0');
    document.querySelectorAll('.page-rail a').forEach((link,index) => {
      if(index === panelIndex) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
  }
  function syncPanel() {
    // Keep a tall section active until its content has been read.
    const focus = innerHeight * .42;
    let nearest = 0, distance = Infinity;
    panels.forEach((panel,index) => {
      const rect = panel.getBoundingClientRect();
      const d = rect.top <= focus && rect.bottom > focus ? 0 : Math.min(Math.abs(rect.top-focus),Math.abs(rect.bottom-focus));
      if(d < distance) { nearest=index; distance=d; }
    });
    if(panelIndex !== nearest) { panelIndex=nearest; updateScene(); }
  }
  function goTo(index) {
    index=Math.max(0,Math.min(panels.length-1,index));
    panels[index].scrollIntoView({behavior:reduceMotion.matches?'instant':'smooth',block:'start'});
  }
  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click',event => {
    const index=panels.findIndex(panel=>'#'+panel.id===link.getAttribute('href'));
    if(index<0) return;
    event.preventDefault();history.replaceState(null,'','#'+panels[index].id);goTo(index);
  }));
  addEventListener('scroll',() => {
    if(scrollingFrame) return;
    scrollingFrame=requestAnimationFrame(()=>{scrollingFrame=0;syncPanel();});
  },{passive:true});
  addEventListener('resize',syncPanel,{passive:true});

  // Consume one desktop wheel/trackpad gesture, including its inertial tail.
  let wheelLast=0, wheelSum=0, wheelConsumed=false, wheelLockUntil=0;
  addEventListener('wheel',event => {
    if(!finePointer.matches || event.ctrlKey || dialog.open || Math.abs(event.deltaX)>Math.abs(event.deltaY) || event.target.closest('input,textarea,select,[contenteditable]')) return;
    const now=performance.now();
    if(now-wheelLast>220 && now>wheelLockUntil) { wheelConsumed=false; wheelSum=0; }
    wheelLast=now;
    const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
    if(!delta) return;
    if(wheelConsumed || now<wheelLockUntil) { event.preventDefault(); return; }
    const rect=panels[panelIndex].getBoundingClientRect(), direction=Math.sign(delta);
    if(rect.height>innerHeight+4 && ((direction>0 && rect.bottom>innerHeight+3) || (direction<0 && rect.top < -3))) return;
    event.preventDefault();
    if(Math.sign(wheelSum)!==direction) wheelSum=0;
    wheelSum+=delta;
    if(Math.abs(wheelSum)<28) return;
    wheelConsumed=true;wheelLockUntil=now+(reduceMotion.matches?180:760);goTo(panelIndex+direction);
  },{passive:false});
  addEventListener('keydown',event => {
    if(dialog.open || event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input,textarea,select,[contenteditable]')) return;
    if(gallery.contains(event.target) && ['ArrowLeft','ArrowRight'].includes(event.key)) {
      event.preventDefault();moveFilm(event.key==='ArrowRight'?1:-1);return;
    }
    if(event.target.closest('button') && ['ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
    const next={ArrowDown:panelIndex+1,PageDown:panelIndex+1,ArrowUp:panelIndex-1,PageUp:panelIndex-1,Home:0,End:panels.length-1}[event.key];
    if(next!==undefined) {event.preventDefault();goTo(next);}
  });

  function setCard(card,offset) {
    card.dataset.offset=String(offset);
    const index=mod(galleryIndex+offset),image=card.querySelector('img');
    image.src=slides[index].src;image.alt='锈境：能源重启 · '+slides[index].label+'界面设计';
    card.tabIndex=offset===0?0:-1;
    card.setAttribute('aria-label','放大查看锈境'+slides[index].label+'界面');
    if(offset===0) card.removeAttribute('aria-hidden');else card.setAttribute('aria-hidden','true');
  }
  function updateGalleryUI() {
    document.getElementById('rust-caption').textContent=slides[galleryIndex].label;
    document.getElementById('gallery-counter').textContent=String(galleryIndex+1).padStart(2,'0')+' / 03';
    document.querySelectorAll('.gallery-ticks i').forEach((tick,index)=>tick.classList.toggle('active',index===galleryIndex));
    if(panels[panelIndex].id==='rust') window.portfolioAmbient.setScene(galleryIndex);
  }
  for(let offset=-2;offset<=2;offset++) {
    const card=document.createElement('button');card.type='button';card.className='film-card';
    const image=document.createElement('img');image.width=1672;image.height=941;image.draggable=false;
    card.append(image);setCard(card,offset);
    card.addEventListener('click',()=>{
      if(performance.now()<suppressClickUntil) return;
      const position=Number(card.dataset.offset);
      if(position) moveFilm(Math.sign(position));else openImage(slides[galleryIndex].src,'锈境 · '+slides[galleryIndex].label,card);
    });
    cards.push(card);stage.append(card);
  }
  function moveFilm(direction) {
    if(animating) {queuedDirection=direction;return;}
    const focusedCard=cards.includes(document.activeElement);
    animating=true;galleryIndex=mod(galleryIndex+direction);
    cards.forEach(card=>{
      const shifted=Number(card.dataset.offset)-direction,recycled=shifted < -2 || shifted > 2;
      const offset=shifted < -2 ? 2 : shifted > 2 ? -2 : shifted;
      if(recycled) card.classList.add('recycling');
      setCard(card,offset);
      if(recycled) {void card.offsetWidth;requestAnimationFrame(()=>card.classList.remove('recycling'));}
    });
    if(focusedCard) cards.find(card=>card.dataset.offset==='0').focus({preventScroll:true});
    updateGalleryUI();
    setTimeout(()=>{animating=false;if(queuedDirection){const next=queuedDirection;queuedDirection=0;moveFilm(next);}},reduceMotion.matches?0:570);
  }
  document.querySelector('.gallery-prev').addEventListener('click',()=>moveFilm(-1));
  document.querySelector('.gallery-next').addEventListener('click',()=>moveFilm(1));
  let pointer;
  gallery.addEventListener('pointerdown',event=>{
    if(event.button!==0 || event.target.closest('.gallery-arrow')) return;
    pointer={id:event.pointerId,x:event.clientX,y:event.clientY};
  });
  gallery.addEventListener('pointermove',event=>{
    if(!pointer || event.pointerId!==pointer.id) return;
    const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
    if(Math.abs(dx)>12 && Math.abs(dx)>Math.abs(dy)*1.3) {
      suppressClickUntil=performance.now()+500;
      if(!gallery.hasPointerCapture(event.pointerId)) gallery.setPointerCapture(event.pointerId);
    }
  });
  gallery.addEventListener('pointerup',event=>{
    if(!pointer || event.pointerId!==pointer.id) return;
    const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
    if(Math.abs(dx)>42 && Math.abs(dx)>Math.abs(dy)*1.3) {suppressClickUntil=performance.now()+500;moveFilm(dx<0?1:-1);}
    if(gallery.hasPointerCapture(event.pointerId)) gallery.releasePointerCapture(event.pointerId);
    pointer=null;
  });
  gallery.addEventListener('pointercancel',()=>{pointer=null;});
  function openImage(src,title,opener) {
    if(animating) return;
    lastOpener=opener;document.getElementById('dialog-image').src=src;
    document.getElementById('dialog-image').alt=title;document.getElementById('dialog-title').textContent=title;dialog.showModal();
  }
  document.querySelector('[data-open-boom]').addEventListener('click',event=>openImage('assets/boom-cover.svg','Who Will BOOM · 概念封面',event.currentTarget));
  document.getElementById('dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>lastOpener?.focus({preventScroll:true}));
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog) return;
    const r=dialog.getBoundingClientRect();
    if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) dialog.close();
  });
  window.__portfolioPreview={get state(){return{activePanel:panels[panelIndex].id,panelIndex,activeProject:document.body.dataset.activeProject,galleryIndex,...window.portfolioAmbient.state};}};
  updateScene();updateGalleryUI();requestAnimationFrame(syncPanel);
})();
