(() => {
  'use strict';
  const panels = [...document.querySelectorAll('.panel')];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const dialog = document.getElementById('image-dialog');
  let panelIndex = 0, lastOpener, scrollingFrame = 0;
  const galleries = new Map();
  // Bind dialog recovery before galleries. The close form also works without JavaScript.
  dialog.addEventListener('close',()=>{
    if(lastOpener?.isConnected) lastOpener.focus({preventScroll:true});
  });
  let backdropPointer = false;
  const outsideDialog = event => {
    const r=dialog.getBoundingClientRect();
    return event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom;
  };
  dialog.addEventListener('pointerdown',event=>{backdropPointer=event.target===dialog && outsideDialog(event);});
  dialog.addEventListener('click',event=>{
    if(backdropPointer && event.target===dialog && outsideDialog(event)) dialog.close();
    backdropPointer=false;
  });
  function openImage(src,title,opener) {
    lastOpener=opener;
    const image=document.getElementById('dialog-image');
    image.src=src;image.alt=title;
    document.getElementById('dialog-title').textContent=title;
    if(!dialog.open) dialog.showModal();
  }

  function updateScene() {
    const id = panels[panelIndex].id;
    document.body.dataset.panel = id;
    document.body.dataset.activeProject = ['boom','pkball'].includes(id) ? id : 'rust';
    window.portfolioAmbient?.setScene(galleries.get(id)?.scene ?? {profile:4,skills:5,rust:0,boom:3,pkball:6,notes:5}[id]);
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
    const gallery=[...galleries.values()].find(item=>item.element.contains(event.target));
    if(gallery && ['ArrowLeft','ArrowRight'].includes(event.key)) {
      event.preventDefault();gallery.move(event.key==='ArrowRight'?1:-1);return;
    }
    if(event.target.closest('button') && ['ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
    const next={ArrowDown:panelIndex+1,PageDown:panelIndex+1,ArrowUp:panelIndex-1,PageUp:panelIndex-1,Home:0,End:panels.length-1}[event.key];
    if(next!==undefined) {event.preventDefault();goTo(next);}
  });

  const projects = {
    rust:{title:'锈境：能源重启',slides:[
      {src:'assets/rust-menu-preview.webp',label:'主菜单 · 界面设计',scene:0},
      {src:'assets/rust-levels-preview.webp',label:'关卡选择 · 界面设计',scene:1},
      {src:'assets/rust-settings-preview.webp',label:'设置 · 界面设计',scene:2},
      {src:'assets/rust-gameplay.webp',label:'平台关卡 · 实机',scene:9}
    ]},
    boom:{title:'Who Will BOOM',slides:[
      {src:'assets/boom-match.webp',label:'棋盘与 AI 对局',scene:3},
      {src:'assets/boom-home.webp',label:'酒馆主菜单',scene:7},
      {src:'assets/boom-setup.webp',label:'角色选择与开局',scene:10},
      {src:'assets/boom-rules.webp',label:'规则与玩法说明',scene:11}
    ]},
    pkball:{title:'PKBall',slides:[
      {src:'assets/pkball-duel.webp',label:'弹珠自动决斗',scene:6},
      {src:'assets/pkball-menu.webp',label:'主菜单与角色外观',scene:8},
      {src:'assets/pkball-preparation.webp',label:'冒险准备与装备环',scene:12},
      {src:'assets/pkball-loadout.webp',label:'主播模式 · 双方构筑',scene:13}
    ]}
  };
  function createGallery(root,project) {
    const element=root.querySelector('.film-gallery'),stage=root.querySelector('.film-stage');
    const caption=root.querySelector('[data-gallery-caption]'),counter=root.querySelector('[data-gallery-counter]');
    const ticks=root.querySelector('.gallery-ticks'),cards=[];
    const mod=value=>(value%project.slides.length+project.slides.length)%project.slides.length;
    let index=0,animating=false,queuedDirection=0,suppressClickUntil=0,pointer;
    ticks.replaceChildren(...project.slides.map(()=>document.createElement('i')));
    function setCard(card,offset) {
      const slide=project.slides[mod(index+offset)],image=card.querySelector('img');
      card.dataset.offset=String(offset);image.src=slide.src;image.alt=project.title+' · '+slide.label;
      card.tabIndex=offset===0?0:-1;
      card.setAttribute('aria-label','放大查看 '+project.title+' · '+slide.label);
      if(offset===0)card.removeAttribute('aria-hidden');else card.setAttribute('aria-hidden','true');
    }
    function update() {
      caption.textContent=project.slides[index].label;
      counter.textContent=String(index+1).padStart(2,'0')+' / '+String(project.slides.length).padStart(2,'0');
      [...ticks.children].forEach((tick,i)=>tick.classList.toggle('active',i===index));
      if(panels[panelIndex].id===root.dataset.gallery) window.portfolioAmbient?.setScene(project.slides[index].scene);
    }
    function move(direction) {
      if(animating){queuedDirection=direction;return;}
      const focusedCard=cards.includes(document.activeElement);
      animating=true;index=mod(index+direction);
      cards.forEach(card=>{
        const shifted=Number(card.dataset.offset)-direction,recycled=shifted < -2 || shifted > 2;
        const offset=shifted < -2 ? 2 : shifted > 2 ? -2 : shifted;
        if(recycled)card.classList.add('recycling');
        setCard(card,offset);
        if(recycled){void card.offsetWidth;requestAnimationFrame(()=>card.classList.remove('recycling'));}
      });
      if(focusedCard)cards.find(card=>card.dataset.offset==='0').focus({preventScroll:true});
      update();
      setTimeout(()=>{animating=false;if(queuedDirection){const next=queuedDirection;queuedDirection=0;move(next);}},reduceMotion.matches?0:570);
    }
    for(let offset=-2;offset<=2;offset++) {
      const card=document.createElement('button');card.type='button';card.className='film-card';
      const image=document.createElement('img');image.width=1600;image.height=900;image.draggable=false;
      card.append(image);setCard(card,offset);
      card.addEventListener('click',()=>{
        if(performance.now()<suppressClickUntil)return;
        const position=Number(card.dataset.offset);
        if(position)move(Math.sign(position));
        else{const slide=project.slides[index];openImage(slide.src,project.title+' · '+slide.label,card);}
      });
      cards.push(card);stage.append(card);
    }
    root.querySelector('.gallery-prev').addEventListener('click',()=>move(-1));
    root.querySelector('.gallery-next').addEventListener('click',()=>move(1));
    element.addEventListener('pointerdown',event=>{
      if(event.button!==0 || event.target.closest('.gallery-arrow'))return;
      pointer={id:event.pointerId,x:event.clientX,y:event.clientY};
    });
    element.addEventListener('pointermove',event=>{
      if(!pointer || event.pointerId!==pointer.id)return;
      const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
      if(Math.abs(dx)>12 && Math.abs(dx)>Math.abs(dy)*1.3){
        suppressClickUntil=performance.now()+500;
        if(!element.hasPointerCapture(event.pointerId))element.setPointerCapture(event.pointerId);
      }
    });
    element.addEventListener('pointerup',event=>{
      if(!pointer || event.pointerId!==pointer.id)return;
      const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
      if(Math.abs(dx)>42 && Math.abs(dx)>Math.abs(dy)*1.3){suppressClickUntil=performance.now()+500;move(dx<0?1:-1);}
      if(element.hasPointerCapture(event.pointerId))element.releasePointerCapture(event.pointerId);
      pointer=null;
    });
    element.addEventListener('pointercancel',()=>{pointer=null;});
    update();
    return{element,move,get index(){return index;},get scene(){return project.slides[index].scene;}};
  }
  document.querySelectorAll('[data-gallery]').forEach(root=>{
    const project=projects[root.dataset.gallery];
    if(project)galleries.set(root.dataset.gallery,createGallery(root,project));
  });
  window.__portfolioPreview={get state(){return{
    activePanel:panels[panelIndex].id,panelIndex,activeProject:document.body.dataset.activeProject,
    galleryIndex:(galleries.get(panels[panelIndex].id)||galleries.get('rust'))?.index??0,
    galleryIndices:Object.fromEntries([...galleries].map(([id,gallery])=>[id,gallery.index])),
    ...window.portfolioAmbient?.state
  };}};
  updateScene();requestAnimationFrame(syncPanel);
})();
