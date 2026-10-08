const opening = document.getElementById("opening");
const stage2 = document.getElementById("stage2");
const stage3 = document.getElementById("stage3");
const startJourney = document.getElementById("startJourney");
const cards = [...document.querySelectorAll(".choice-card")];
const note = document.getElementById("selectedNote");
const continueBtn = document.getElementById("continueBtn");
const backToStage2 = document.getElementById("backToStage2");
const stage4 = document.getElementById('stage4');
const nextToStage4 = document.getElementById('nextToStage4');
const backToStage3 = document.getElementById('backToStage3');
const showRepeatedStage = document.getElementById('showRepeatedStage');

let selected = null;

function showStage(el){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active-screen"));
  el.classList.add("active-screen");
}

startJourney.addEventListener("click",()=>{
  const root=document.querySelector(".app");
  root.classList.remove("opening-mode");
  if(localStorage.getItem("probabilityLabSidebarHidden")==="1") root.classList.add("sidebar-hidden");
  if(typeof updateSidebarButton === "function") updateSidebarButton();
  opening.style.animation = "fadeOut .7s ease forwards";
  setTimeout(()=>{
    showStage(stage2);
    opening.style.animation = "";
  },650);
});

cards.forEach(card=>{
  card.addEventListener("click",()=>{
    cards.forEach(c=>c.classList.remove("selected"));
    card.classList.add("selected");
    selected = card.dataset.choice;

    if(selected === "human"){
      note.textContent = "تم اختياركِ — أنتِ من ستتوقعين الرقم.";
    }else{
      note.textContent = "تم اختيار الحاسوب — سيختار الرقم عشوائياً.";
    }

    continueBtn.disabled = false;
    continueBtn.classList.add("ready");
  });
});

continueBtn.addEventListener("click",()=>{
  if(!selected) return;
  showStage(stage3);
});

backToStage3?.addEventListener('click',()=>showStage(stage3));
showRepeatedStage?.addEventListener('click',()=>showStage(document.getElementById('stage5')));

backToStage2.addEventListener("click",()=>showStage(stage2));
backToStage3?.addEventListener('click',()=>showStage(stage3));


/* ===== Sidebar show/hide control ===== */
const appRoot = document.querySelector('.app');
const sidebarToggle = document.getElementById('sidebarToggle');
const SIDEBAR_KEY = 'probabilityLabSidebarHidden';

function updateSidebarButton(){
  if(!sidebarToggle || !appRoot) return;
  const hidden = appRoot.classList.contains('sidebar-hidden');
  sidebarToggle.textContent = hidden ? '☰' : '×';
  sidebarToggle.setAttribute('aria-expanded', String(!hidden));
  sidebarToggle.title = hidden ? 'إظهار القائمة' : 'إخفاء القائمة';
}

if(sidebarToggle){
  sidebarToggle.addEventListener('click',()=>{
    appRoot.classList.toggle('sidebar-hidden');
    localStorage.setItem(SIDEBAR_KEY, appRoot.classList.contains('sidebar-hidden') ? '1' : '0');
    updateSidebarButton();
  });
  updateSidebarButton();
}


/* ===== Stage 03: six real attempts ===== */
(function(){
  const grid=document.getElementById('numberGrid');
  const rollBtn=document.getElementById('rollBtn3');
  const selectedEl=document.getElementById('selectedNumber');
  const hint=document.getElementById('predictionHint');
  const die=document.getElementById('die3');
  const status=document.getElementById('dieStatus');
  const resultBox=document.getElementById('rollResult3');
  const resultNum=document.getElementById('resultNumber3');
  const resultMsg=document.getElementById('resultMessage3');
  const next=document.getElementById('nextToStage4');
  const attemptNo=document.getElementById('attemptNo');
  const attemptTrack=document.getElementById('attemptTrack');
  const logBody=document.getElementById('attemptLogBody');
  const matchCounter=document.getElementById('matchCounter');
  const modeBadge=document.getElementById('modeBadge');
  if(!grid||!rollBtn||!die) return;

  let prediction=null, rolling=false, attempt=1, matches=0;
  let attempts=[];
  const final={
    1:'rotateX(0deg) rotateY(0deg) rotateZ(0deg)',
    2:'rotateX(-90deg) rotateY(0deg) rotateZ(0deg)',
    3:'rotateY(-90deg) rotateX(0deg) rotateZ(0deg)',
    4:'rotateY(90deg) rotateX(0deg) rotateZ(0deg)',
    5:'rotateX(90deg) rotateY(0deg) rotateZ(0deg)',
    6:'rotateX(0deg) rotateY(180deg) rotateZ(0deg)'
  };
  const mode=localStorage.getItem('probabilityLabMode') || 'human';
  modeBadge.textContent=mode==='computer'?'الحاسوب يتوقع':'أنا أتوقع';

  function buildTrack(){
    attemptTrack.innerHTML='';
    for(let i=1;i<=6;i++){
      const d=document.createElement('span'); d.className='attempt-dot'+(i===1?' current':''); attemptTrack.appendChild(d);
    }
  }
  function refreshTrack(){
    [...attemptTrack.children].forEach((d,i)=>{
      d.className='attempt-dot';
      if(i<attempt-1) d.classList.add('done');
      if(i===attempt-1 && attempt<=6) d.classList.add('current');
    });
    attemptNo.textContent=Math.min(attempt,6);
  }
  function pick(n){
    if(rolling||attempt>6) return;
    prediction=n;
    document.querySelectorAll('.number-btn').forEach(x=>x.classList.toggle('chosen',Number(x.dataset.number)===n));
    selectedEl.textContent=n;
    hint.textContent=`توقع المحاولة ${attempt}: الرقم ${n}`;
    status.textContent='تم تسجيل التوقع... ارمِ النرد وشاهدي النتيجة.';
    rollBtn.disabled=false;
  }
  function computerPick(){
    const n=Math.floor(Math.random()*6)+1;
    pick(n);
    hint.textContent=`الحاسوب اختار الرقم ${n} للمحاولة ${attempt}`;
  }
  function addRow(pred,actual,hit){
    attempts.push({pred,actual,hit});
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${attempts.length}</td><td>${pred}</td><td>${actual}</td><td class="${hit?'match-yes':'match-no'}">${hit?'✓ يطابق':'✕ لا يطابق'}</td>`;
    logBody.appendChild(tr);
    matchCounter.textContent=`${matches} / 6 تطابق`;
  }
  function finish(){
    attempt=7;
    refreshTrack();
    status.textContent='اكتملت 6 محاولات. الآن نرى ماذا حدث فعلاً.';
    hint.textContent=`انتهت التجربة — ${matches} من 6 توقعات تطابقت.`;
    rollBtn.disabled=true;
    grid.querySelectorAll('button').forEach(b=>b.disabled=true);
    next.classList.remove('hidden');
    next.textContent='عرض نتيجة التجربة  ←';
    localStorage.setItem('probabilityLabExperimentDone','1');
    localStorage.setItem('probabilityLabAttempts',JSON.stringify(attempts));
    localStorage.setItem('probabilityLabPrediction',String(attempts[0]?.pred||1));
    document.querySelector('.nav-item[data-nav="stage4"]')?.classList.remove('locked');
  }
  grid.addEventListener('click',e=>{
    const btn=e.target.closest('.number-btn');
    if(btn && mode!=='computer') pick(Number(btn.dataset.number));
  });
  rollBtn.addEventListener('click',()=>{
    if(rolling||attempt>6) return;
    if(mode==='computer' && prediction===null) computerPick();
    if(prediction===null) return;
    rolling=true; rollBtn.disabled=true; resultBox.classList.add('hidden');
    status.textContent='النرد يدور... النتيجة لم تظهر بعد.';
    const actual=Math.floor(Math.random()*6)+1;
    die.classList.remove('rolling3'); void die.offsetWidth; die.classList.add('rolling3');
    setTimeout(()=>{
      die.classList.remove('rolling3'); die.style.transform=final[actual];
      resultNum.textContent=actual;
      const hit=actual===prediction; if(hit) matches++;
      resultMsg.textContent=hit?'تطابق التوقع مع النتيجة ✓':'لم يتطابق التوقع هذه المرة.';
      resultBox.classList.remove('hidden');
      addRow(prediction,actual,hit);
      status.textContent=hit?'أصبتِ! لكن تذكري: التطابق لا يعني ضمان النتيجة.':'ظهرت نتيجة مختلفة — وهذا جزء أساسي من العشوائية.';
      rolling=false;
      attempt++;
      prediction=null;
      document.querySelectorAll('.number-btn').forEach(x=>x.classList.remove('chosen'));
      if(attempt<=6){
        selectedEl.textContent='—';
        hint.textContent=mode==='computer'?'الحاسوب سيختار توقع المحاولة التالية.':'اختاري توقع المحاولة التالية.';
        rollBtn.disabled=(mode==='computer'?false:true);
      }else finish();
      refreshTrack();
    },1450);
  });
  next?.addEventListener('click',()=>{
    if(attempts.length<6) return;
    const first=attempts[0]?.pred || 1;
    const tn=document.getElementById('theoryNumber'), fn=document.getElementById('formulaNumber');
    if(tn) tn.textContent=first; if(fn) fn.textContent=first;
    showStage(document.getElementById('stage4'));
  });
  document.getElementById('backToStage2')?.addEventListener('click',()=>showStage(document.getElementById('stage2')));

  buildTrack(); refreshTrack();
  if(mode==='computer'){
    grid.querySelectorAll('button').forEach(b=>b.disabled=true);
    hint.textContent='الحاسوب سيختار توقعاً جديداً في كل محاولة.';
    rollBtn.disabled=false;
  }
})();


/* ===== Stage 05: repeated experiments ===== */
(function(){
  const stage5=document.getElementById('stage5');
  if(!stage5) return;
  const buttons=[...document.querySelectorAll('.trial-btn')];
  const run=document.getElementById('runTrials');
  const bars=document.getElementById('trialBars');
  const total=document.getElementById('trialTotal');
  const die=document.getElementById('miniRollDie');
  const status=document.getElementById('trialStatus');
  const back=document.getElementById('backToStage4');
  let selectedTrials=20, running=false;
  let prediction=Number(localStorage.getItem('probabilityLabPrediction')) || null;
  function render(counts,n){
    bars.innerHTML='';
    const max=Math.max(...counts,1);
    counts.forEach((c,i)=>{
      const pct=(c/n*100);
      const row=document.createElement('div'); row.className='trial-row';
      row.innerHTML=`<div class="trial-label"><span>${i+1}</span><b>${pct.toFixed(1)}%</b></div><div class="trial-track"><span style="width:${Math.max(3,(c/max)*100)}%"></span></div><small>${c}</small>`;
      bars.appendChild(row);
    });
    total.textContent=n.toLocaleString('en-US');
  }
  function rollAnimation(){
    die.classList.remove('mini-roll'); void die.offsetWidth; die.classList.add('mini-roll');
  }
  buttons.forEach(b=>b.addEventListener('click',()=>{
    if(running)return;
    buttons.forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); selectedTrials=Number(b.dataset.trials);
  }));
  run?.addEventListener('click',async()=>{
    if(running)return; running=true; run.disabled=true;
    buttons.forEach(b=>b.disabled=true);
    status.textContent=selectedTrials===20?'نجري الرميات واحدة تلو الأخرى...':'نجري محاكاة سريعة لعدد كبير من الرميات...';
    const counts=[0,0,0,0,0,0];
    const visible=Math.min(selectedTrials,20);
    for(let i=0;i<visible;i++){
      await new Promise(r=>setTimeout(r,90));
      rollAnimation();
      const v=Math.floor(Math.random()*6); counts[v]++;
      render(counts, Math.max(i+1,1));
    }
    if(selectedTrials>visible){
      for(let i=0;i<selectedTrials-visible;i++) counts[Math.floor(Math.random()*6)]++;
      await new Promise(r=>setTimeout(r,420)); rollAnimation(); render(counts,selectedTrials);
    }
    const target=prediction;
    localStorage.setItem('probabilityLabLastTrials',String(selectedTrials));
    localStorage.setItem('probabilityLabLastCounts',JSON.stringify(counts));
    if(target){
      const pct=counts[target-1]/selectedTrials*100;
      status.textContent=`الرقم ${target} ظهر ${counts[target-1]} مرة — ${pct.toFixed(1)}%. الاحتمال النظري له 16.67%.`;
    }else status.textContent='لاحظي كيف تتغير النسب من تجربة إلى أخرى، بينما يبقى الاحتمال النظري ثابتاً عند 16.67%.';
    running=false; run.disabled=false; buttons.forEach(b=>b.disabled=false);
    document.querySelector('.nav-item[data-nav="stage6"]')?.classList.remove('locked');
  });
  back?.addEventListener('click',()=>showStage(document.getElementById('stage4')));
  render([0,0,0,0,0,0],20);
})();

document.getElementById('nextToStage6')?.addEventListener('click',()=>showStage(document.getElementById('stage6')));

/* ===== Sidebar navigation for built stages ===== */
(function(){
  const navs=[...document.querySelectorAll('.nav-item[data-nav]')];
  const map={stage2:()=>document.getElementById('stage2'),stage4:()=>document.getElementById('stage4'),stage5:()=>document.getElementById('stage5'),stage6:()=>document.getElementById('stage6'),stage7:()=>document.getElementById('stage7'),closing:()=>document.getElementById('closing')};
  function refreshNav(id){navs.forEach(n=>n.classList.toggle('active',n.dataset.nav===id));}
  navs.forEach(n=>n.addEventListener('click',()=>{
    if(n.classList.contains('locked')) return;
    const target=map[n.dataset.nav]?.(); if(!target) return;
    showStage(target); refreshNav(n.dataset.nav);
  }));
})();

/* Store the chosen mode so the six-attempt experiment knows who predicts. */
cards.forEach(card=>card.addEventListener('click',()=>{
  localStorage.setItem('probabilityLabMode',card.dataset.choice);
}));


/* ===== Stage 06: events ===== */
(function(){
  const stage6=document.getElementById('stage6'); if(!stage6) return;
  const select=document.getElementById('eventSelect'), setEl=document.getElementById('eventSet'), formula=document.getElementById('eventFormula'), explain=document.getElementById('eventExplain');
  const run=document.getElementById('runEvent'), die=document.getElementById('eventDie'), result=document.getElementById('eventResult'), history=document.getElementById('eventHistory');
  const next=document.getElementById('nextToStage7'), back=document.getElementById('backToStage5');
  const events={
    even:{set:'A = {2, 4, 6}',count:3,explain:'الأعداد الزوجية هي 2 و4 و6، أي 3 نتائج من أصل 6.'},
    odd:{set:'A = {1, 3, 5}',count:3,explain:'الأعداد الفردية هي 1 و3 و5، أي 3 نتائج من أصل 6.'},
    greater3:{set:'A = {4, 5, 6}',count:3,explain:'الأعداد الأكبر من 3 هي 4 و5 و6، أي 3 نتائج من أصل 6.'},
    less4:{set:'A = {1, 2, 3}',count:3,explain:'الأعداد الأقل من 4 هي 1 و2 و3، أي 3 نتائج من أصل 6.'},
    prime:{set:'A = {2, 3, 5}',count:3,explain:'الأعداد الأولية على النرد هي 2 و3 و5، أي 3 نتائج من أصل 6.'}
  };
  let selected='even', trials=0, hits=0;
  function update(){const e=events[selected]; setEl.textContent=e.set; formula.innerHTML=`P(A) = ${e.count} / 6 = <strong>${(e.count/6*100).toFixed(0)}%</strong>`; explain.textContent=e.explain;}
  function isHit(n){const e=events[selected]; return e.set.match(/\{([^}]+)\}/)[1].split(',').map(x=>Number(x.trim())).includes(n)}
  select.addEventListener('change',()=>{selected=select.value;update();result.textContent='جاهز للتجربة';die.className='event-die';history.innerHTML='';trials=0;hits=0;next.disabled=true;});
  run.addEventListener('click',()=>{
    run.disabled=true; die.classList.remove('event-rolling','success','fail'); void die.offsetWidth; die.classList.add('event-rolling');
    result.textContent='النرد يختبر الحدث...';
    const n=Math.floor(Math.random()*6)+1;
    setTimeout(()=>{die.classList.remove('event-rolling');die.textContent=n;const hit=isHit(n);if(hit)hits++;trials++;die.classList.add(hit?'success':'fail');result.textContent=hit?`ظهرت ${n} — الحدث تحقق ✓`:`ظهرت ${n} — الحدث لم يتحقق`;const chip=document.createElement('span');chip.className=hit?'hit':'miss';chip.textContent=`${trials}: ${n} ${hit?'✓':'✕'}`;history.appendChild(chip);run.disabled=false;if(trials>=6){next.disabled=false;localStorage.setItem('probabilityLabEventTested','1');localStorage.setItem('probabilityLabEventHits',String(hits));localStorage.setItem('probabilityLabEventTrials',String(trials));localStorage.setItem('probabilityLabEventName',select.options[select.selectedIndex].textContent);document.querySelector('.nav-item[data-nav="stage7"]')?.classList.remove('locked');}statusText();},1150);
  });
  function statusText(){const empirical=trials?((hits/trials)*100).toFixed(1):'0.0';document.getElementById('eventStatus').textContent=trials<6?`اختبرتِ ${trials} من 6 تجارب — النتيجة التجريبية الآن ${empirical}%.`:`أكملتِ 6 تجارب: تحقق الحدث ${hits} مرات من ${trials} — ${empirical}%.`}
  back.addEventListener('click',()=>showStage(document.getElementById('stage5')));
  next.addEventListener('click',()=>{
    const matches=(JSON.parse(localStorage.getItem('probabilityLabAttempts')||'[]')).filter(x=>x.hit).length;
    const summaryMatches=document.getElementById('summaryMatches'); if(summaryMatches) summaryMatches.textContent=matches || '0';
    const trials=Number(localStorage.getItem('probabilityLabLastTrials'))||20;
    const repeat=document.getElementById('summaryRepeat'); if(repeat) repeat.textContent=trials+' رمية';
    const eventHits=Number(localStorage.getItem('probabilityLabEventHits'))||0, eventTrials=Number(localStorage.getItem('probabilityLabEventTrials'))||6;
    const eventName=localStorage.getItem('probabilityLabEventName')||'الحدث';
    const ev=document.getElementById('summaryEvent'); if(ev) ev.textContent=((eventHits/eventTrials)*100).toFixed(1)+'%';
    const evt=document.getElementById('summaryEventText'); if(evt) evt.textContent=`${eventName}: تحقق ${eventHits} من ${eventTrials} تجارب.`;
    document.querySelector('.nav-item[data-nav="stage7"]')?.classList.remove('locked');
    showStage(document.getElementById('stage7'));
  });
  update();statusText();
})();


/* ===== STAGE 07 + CLOSING ===== */
(function(){
  const summary=document.getElementById('stage7');
  if(!summary) return;
  const back=document.getElementById('backToStage6'), close=document.getElementById('toClosing'), restart=document.getElementById('restartJourney');
  function populate(){
    const attempts=JSON.parse(localStorage.getItem('probabilityLabAttempts')||'[]');
    const matches=attempts.filter(x=>x.hit).length;
    const m=document.getElementById('summaryMatches'); if(m)m.textContent=matches;
    const trials=Number(localStorage.getItem('probabilityLabLastTrials'))||20;
    const r=document.getElementById('summaryRepeat'); if(r)r.textContent=trials+' رمية';
    const eh=Number(localStorage.getItem('probabilityLabEventHits'))||0, et=Number(localStorage.getItem('probabilityLabEventTrials'))||6;
    const ep=document.getElementById('summaryEvent'); if(ep)ep.textContent=((eh/et)*100).toFixed(1)+'%';
    const en=localStorage.getItem('probabilityLabEventName')||'الحدث'; const etxt=document.getElementById('summaryEventText'); if(etxt)etxt.textContent=`${en}: تحقق ${eh} من ${et} تجارب.`;
  }
  back?.addEventListener('click',()=>showStage(document.getElementById('stage6')));
  close?.addEventListener('click',()=>{populate(); document.querySelector('.nav-item[data-nav="closing"]')?.classList.remove('locked'); showStage(document.getElementById('closing'));});
  restart?.addEventListener('click',()=>{localStorage.removeItem('probabilityLabExperimentDone');localStorage.removeItem('probabilityLabAttempts');localStorage.removeItem('probabilityLabEventHits');localStorage.removeItem('probabilityLabEventTrials');localStorage.removeItem('probabilityLabLastTrials');localStorage.removeItem('probabilityLabLastCounts'); location.reload();});
})();
