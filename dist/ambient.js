(() => {
  'use strict';
  const scenes = [
    {src:'assets/rust-menu-preview.webp', name:'锈境 · 主菜单设计'},
    {src:'assets/rust-levels-preview.webp', name:'锈境 · 关卡选择设计'},
    {src:'assets/rust-settings-preview.webp', name:'锈境 · 设置设计'},
    {src:'assets/boom-match.webp', name:'Who Will BOOM · AI 对局'},
    {src:'assets/ambient-night.svg', name:'个人信息 · 夜色'},
    {src:'assets/ambient-notes.svg', name:'技术与记录 · 夜色'},
    {src:'assets/pkball-duel.webp', name:'PKBall · 自动决斗'},
    {src:'assets/boom-home.webp', name:'Who Will BOOM · 酒馆主菜单'},
    {src:'assets/pkball-menu.webp', name:'PKBall · 主菜单'},
    {src:'assets/rust-gameplay.webp', name:'锈境 · 平台关卡实机'},
    {src:'assets/boom-setup.webp', name:'Who Will BOOM · 角色与开局'},
    {src:'assets/boom-rules.webp', name:'Who Will BOOM · 规则说明'},
    {src:'assets/pkball-preparation.webp', name:'PKBall · 冒险准备与装备环'},
    {src:'assets/pkball-loadout.webp', name:'PKBall · 双方构筑'}
  ];
  const canvas = document.getElementById('ambient-canvas');
  const fallback = document.getElementById('ambient-fallback');
  const motionButton = document.getElementById('motion-toggle');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let motionEnabled = !reduceMotion.matches;
  let displacementEnabled = !reduceMotion.matches;
  let motionTime = 0;
  let lastMotionTimestamp = performance.now();
  let currentScene = 4;
  let fromScene = 4;
  let blendStart = 0;
  let animationFrame = 0;
  let lastDraw = 0;
  let ready = false;
  let gl, program, uniforms;
  const textures = [];
  const images = [];
  const size = {w:1,h:1};
  const fadeDuration = 950;

  function updateMotionUI() {
    motionButton.setAttribute('aria-label', motionEnabled ? '暂停背景动效' : '开启背景动效');
    motionButton.title = motionEnabled ? '暂停背景动效' : '开启背景动效';
    motionButton.setAttribute('aria-pressed', String(motionEnabled));
    document.body.classList.toggle('motion-paused', !motionEnabled);
  }
  function scenePalette(image) {
    const sample = document.createElement('canvas');
    sample.width = sample.height = 24;
    const context = sample.getContext('2d', {willReadFrequently:true});
    context.drawImage(image,0,0,24,24);
    const pixels = context.getImageData(0,0,24,24).data;
    let r=0,g=0,b=0,total=0;
    for(let i=0;i<pixels.length;i+=4) {
      if(pixels[i+3]<200) continue;
      r+=pixels[i];g+=pixels[i+1];b+=pixels[i+2];total++;
    }
    return [r,g,b].map(value=>Math.round(value/Math.max(1,total))).join(',');
  }
  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader,source);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw new Error(message);
    }
    return shader;
  }
  function initRenderer() {
    gl = canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power',preserveDrawingBuffer:false});
    if(!gl) throw new Error('WebGL unavailable');
    const vertex = compile(gl.VERTEX_SHADER,`
      attribute vec2 position; varying vec2 uv;
      void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}
    `);
    const fragment = compile(gl.FRAGMENT_SHADER,`
      precision mediump float;
      varying vec2 uv;
      uniform sampler2D imageA; uniform sampler2D imageB;
      uniform vec2 viewport; uniform vec2 aspectA; uniform vec2 aspectB;
      uniform float time; uniform float blend; uniform float strength;
      vec2 cover(vec2 p,vec2 imageSize){
        float screenRatio=viewport.x/viewport.y; float imageRatio=imageSize.x/imageSize.y;
        vec2 crop=vec2(min(screenRatio/imageRatio,1.),min(imageRatio/screenRatio,1.));
        return (p-.5)*crop+.5;
      }
      void main(){
        vec2 p=(uv-.5)*.83+.5;
        float angle=sin(time*.16+p.y*4.)*.035*strength;
        vec2 center=p-.5;
        p=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*center+.5;
        vec2 flow=vec2(sin(p.y*5.5+time*.24)+cos(p.x*3.5-time*.16),
                       cos(p.x*5.+time*.18)-sin(p.y*4.-time*.14));
        p+=flow*.026*strength;
        vec3 a=texture2D(imageA,cover(p,aspectA)).rgb;
        vec3 b=texture2D(imageB,cover(p,aspectB)).rgb;
        vec3 color=mix(a,b,blend);
        float luminance=dot(color,vec3(.2126,.7152,.0722));
        color=mix(vec3(luminance),color,1.08);
        gl_FragColor=vec4(color,1.);
      }
    `);
    program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    uniforms=Object.fromEntries(['imageA','imageB','viewport','aspectA','aspectB','time','blend','strength'].map(name=>[name,gl.getUniformLocation(program,name)]));
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
    images.forEach(image=>{
      // Blur once when the image loads; the animation only distorts this cached, small texture.
      const softened=document.createElement('canvas');softened.width=640;softened.height=Math.round(640*image.naturalHeight/image.naturalWidth);
      const ctx=softened.getContext('2d');ctx.filter='blur(28px)';
      ctx.drawImage(image,-60,-60,softened.width+120,softened.height+120);
      const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,softened);textures.push(texture);
    });
    canvas.dataset.renderer='webgl';
    resize();
  }
  function useFallback() {
    gl=null;canvas.style.display='none';fallback.style.display='block';
    fallback.style.backgroundImage=`url("${scenes[currentScene].src}")`;
    canvas.dataset.renderer='css-fallback';
  }
  function resize() {
    size.w=window.innerWidth;size.h=window.innerHeight;
    const density=Math.min(window.devicePixelRatio||1,window.innerWidth<760?1:1.25);
    canvas.width=Math.round(size.w*density);canvas.height=Math.round(size.h*density);
    if(gl) gl.viewport(0,0,canvas.width,canvas.height);
    kick();
  }
  function kick() {
    if(!animationFrame&&ready&&!document.hidden) animationFrame=requestAnimationFrame(draw);
  }
  function draw(now) {
    animationFrame=0;
    if(document.hidden||!ready) return;
    if(motionEnabled) motionTime+=(now-lastMotionTimestamp)/1000;
    lastMotionTimestamp=now;
    const fading=fromScene!==currentScene;
    const mix=reduceMotion.matches?1:Math.min(1,Math.max(0,(now-blendStart)/fadeDuration));
    if(gl&&(now-lastDraw>1000/(size.w<760?18:24)||!motionEnabled||fading)) {
      lastDraw=now;
      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,textures[fromScene]);gl.uniform1i(uniforms.imageA,0);
      gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,textures[currentScene]);gl.uniform1i(uniforms.imageB,1);
      gl.uniform2f(uniforms.viewport,size.w,size.h);
      gl.uniform2f(uniforms.aspectA,images[fromScene].naturalWidth,images[fromScene].naturalHeight);
      gl.uniform2f(uniforms.aspectB,images[currentScene].naturalWidth,images[currentScene].naturalHeight);
      gl.uniform1f(uniforms.time,motionTime);
      gl.uniform1f(uniforms.strength,displacementEnabled?.8:0);
      gl.uniform1f(uniforms.blend,mix*mix*(3-2*mix));
      gl.drawArrays(gl.TRIANGLES,0,6);
    }
    if(mix===1) fromScene=currentScene;
    if(motionEnabled||fromScene!==currentScene) kick();
  }
  function changeScene(index) {
    if(!Number.isInteger(index) || !scenes[index]) return;
    if(index===currentScene) return;
    const now=performance.now();
    if((now-blendStart)/fadeDuration>=.5) fromScene=currentScene;
    currentScene=index;blendStart=now;
    document.body.dataset.activeImage=String(index);
    if(ready) document.documentElement.style.setProperty('--ambient-rgb',scenes[index].palette);
    fallback.style.backgroundImage=`url("${scenes[index].src}")`;
    kick();
  }
  window.addEventListener('resize',resize,{passive:true});
  motionButton.addEventListener('click',()=>{motionEnabled=!motionEnabled;if(motionEnabled)displacementEnabled=true;lastMotionTimestamp=performance.now();updateMotionUI();kick();});
  reduceMotion.addEventListener('change',event=>{motionEnabled=!event.matches;displacementEnabled=!event.matches;lastMotionTimestamp=performance.now();updateMotionUI();kick();});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden&&animationFrame){cancelAnimationFrame(animationFrame);animationFrame=0;}
    else {lastMotionTimestamp=performance.now();kick();}
  });
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();useFallback();});
  window.portfolioAmbient={setScene:changeScene,get state(){return{activeImage:currentScene,motionEnabled,renderer:canvas.dataset.renderer,ready};}};
  updateMotionUI();
  Promise.all(scenes.map(scene=>new Promise((resolve,reject)=>{
    const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Preview image failed to load: '+scene.src));image.src=scene.src;
  }))).then(loaded=>{
    images.push(...loaded);
    scenes.forEach((scene,i)=>scene.palette=scenePalette(images[i]));
    document.documentElement.style.setProperty('--ambient-rgb',scenes[currentScene].palette);
    try{initRenderer();}catch{useFallback();}
    ready=true;resize();kick();
  }).catch(error=>{useFallback();ready=true;document.getElementById('scene-status').textContent='背景图片加载失败，作品内容仍可浏览。';console.error(error);});
})();
