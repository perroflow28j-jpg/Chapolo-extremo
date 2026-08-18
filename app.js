const $ = id => document.getElementById(id);
const historyKey = 'chapolo_history_v22';
const checksKey = '#checks input[type="checkbox"]';
const tacticalFields = ['xgHome','xgAway','ppdaHome','ppdaAway','xthreatHome','xthreatAway','cornersHome','cornersAway','shotsHome','shotsAway','sotHome','sotAway','cardsHome','cardsAway'];
const contextFields = ['homeWins','homeGF','homeGA','awayWins','awayGF','awayGA','h2hHome','h2hAway','h2hDraws','refCards','homeMinutes','awayMinutes','globalGoalsHome','globalGoalsAway','firstHalfGoalsHome','firstHalfGoalsAway','secondHalfGoalsHome','secondHalfGoalsAway','foulsHome','foulsAway'];
const textFields = ['match','competition','homeTeam','awayTeam','matchDate','venue','notes','homeKeyPlayer','awayKeyPlayer','playerIssues','tacticalDuel','weatherPitch','coaches'];
const marketChecks = [...document.querySelectorAll('[data-market]')];
const num = id => { const v = Number($(id)?.value); return Number.isFinite(v) && $(id)?.value !== '' ? v : null; };
const val = id => ($(id)?.value || '').trim();
const fmt = v => v === null || v === undefined || Number.isNaN(v) ? '—' : Number(v).toFixed(2).replace(/\.00$/,'');
const getHistory = () => JSON.parse(localStorage.getItem(historyKey) || '[]');
const setHistory = items => localStorage.setItem(historyKey, JSON.stringify(items.slice(0,50)));
const getChecks = () => [...document.querySelectorAll(checksKey)].map(x=>x.checked);
const getMarkets = () => marketChecks.filter(x=>x.checked).map(x=>x.dataset.market);
function setStatus(text,error=false){ const e=$('status'); if(e){e.textContent=text;e.classList.toggle('error',error);} }
function getTactical(){ return Object.fromEntries(tacticalFields.map(id=>[id,num(id)])); }
function setTactical(t={}){ tacticalFields.forEach(id=>{if($(id)) $(id).value=t[id] ?? '';}); updateTacticalBoard(); }
function getContext(){ return Object.fromEntries(contextFields.map(id=>[id,num(id)])); }
function getTextData(){ return Object.fromEntries(textFields.map(id=>[id,val(id)])); }
function updateProfile(){
  const gh=num('globalGoalsHome'),ga=num('globalGoalsAway'),fh=num('firstHalfGoalsHome'),fa=num('firstHalfGoalsAway'),sh=num('secondHalfGoalsHome'),sa=num('secondHalfGoalsAway'),fhF=num('foulsHome'),faF=num('foulsAway');
  if($('goalProfile')) $('goalProfile').textContent=gh!==null&&ga!==null?fmt(gh+ga):'—';
  if($('halfProfile')) $('halfProfile').textContent=fh!==null&&fa!==null&&sh!==null&&sa!==null?(fh+fa>sh+sa?'1ª mitad':fh+fa<sh+sa?'2ª mitad':'equilibrada'):'—';
  if($('disciplineProfile')) $('disciplineProfile').textContent=fhF!==null&&faF!==null?fmt(fhF+faF):'—';
}
function updateTacticalBoard(){
  const pairs={xg:['xgHome','xgAway'],corners:['cornersHome','cornersAway'],shots:['shotsHome','shotsAway'],sot:['sotHome','sotAway'],cards:['cardsHome','cardsAway']};
  Object.entries(pairs).forEach(([k,ids])=>{const a=num(ids[0]),b=num(ids[1]); const e=document.querySelector(`[data-metric="${k}-total"]`); if(e)e.textContent=a!==null&&b!==null?fmt(a+b):'—';});
  const hw=num('homeWins'),aw=num('awayWins'); if($('homeForm')) $('homeForm').textContent=hw===null?'—':`${hw}/5`; if($('awayForm')) $('awayForm').textContent=aw===null?'—':`${aw}/5`; updateProfile();
}
function perroChapolo(update=true){
 const t=getTactical(),s=[]; const have=(...ids)=>ids.every(id=>num(id)!==null);
 if(have('xgHome','xgAway')){const x=t.xgHome+t.xgAway;if(x>=2.5)s.push({type:'good',title:'Entorno de gol alto',detail:`xG combinado ${fmt(x)}. Estudiar mercado de goles.`,tag:'GOLES'});else if(x<=1.7)s.push({type:'warn',title:'Entorno de gol bajo',detail:`xG combinado ${fmt(x)}. Precaución con líneas altas.`,tag:'GOLES'});}
 if(have('cornersHome','cornersAway')){const x=t.cornersHome+t.cornersAway;if(x>=9)s.push({type:'good',title:'Volumen fuerte de córners',detail:`Córners combinados ${fmt(x)}. Contrastar tendencia.`,tag:'CÓRNERS'});}
 if(have('shotsHome','shotsAway','sotHome','sotAway')){const shots=t.shotsHome+t.shotsAway,sot=t.sotHome+t.sotAway;if(shots>=22&&sot>=7)s.push({type:'good',title:'Volumen ofensivo alto',detail:`${fmt(shots)} tiros y ${fmt(sot)} a puerta combinados.`,tag:'TIROS'});if(shots>0&&sot/shots<.25)s.push({type:'warn',title:'Eficiencia de tiro baja',detail:`Solo ${(sot/shots*100).toFixed(0)}% de los tiros llegan a puerta.`,tag:'EFICIENCIA'});}
 if(have('cardsHome','cardsAway')){const x=t.cardsHome+t.cardsAway;if(x>=5)s.push({type:'good',title:'Entorno de tarjetas elevado',detail:`Tarjetas combinadas ${fmt(x)}.`,tag:'TARJETAS'});}
 if(have('globalGoalsHome','globalGoalsAway','firstHalfGoalsHome','firstHalfGoalsAway','secondHalfGoalsHome','secondHalfGoalsAway')){const f=t.globalGoalsHome+t.globalGoalsAway,h=t.firstHalfGoalsHome+t.firstHalfGoalsAway,s2=t.secondHalfGoalsHome+t.secondHalfGoalsAway;if(f>=2.5&&s2>h)s.push({type:'good',title:'Perfil de segunda mitad',detail:`Goles globales ${fmt(f)} y mayor producción tras el descanso.`,tag:'2ª MITAD'});if(h>s2&&h>=1.2)s.push({type:'good',title:'Perfil de primera mitad',detail:`La primera mitad concentra más producción ofensiva (${fmt(h)} vs ${fmt(s2)}).`,tag:'1ª MITAD'});}
 if(have('foulsHome','foulsAway','cardsHome','cardsAway')){const fouls=t.foulsHome+t.foulsAway,cards=t.cardsHome+t.cardsAway;if(fouls>=24&&cards>=4)s.push({type:'good',title:'Entorno disciplinario intenso',detail:`${fmt(fouls)} faltas y ${fmt(cards)} tarjetas combinadas.`,tag:'DISCIPLINA'});}
 if(have('xgHome','xgAway','xthreatHome','xthreatAway')){const d=Math.abs(t.xgHome-t.xgAway),xt=Math.abs(t.xthreatHome-t.xthreatAway);if(d>=.55&&xt>=.10){const leader=t.xgHome>t.xgAway?'Local':'Visitante';s.push({type:'good',title:`Dominio ofensivo ${leader}`,detail:'xG y xThreat apuntan en la misma dirección.',tag:'DOMINIO'});}}
 if(have('ppdaHome','ppdaAway')){const d=t.ppdaHome-t.ppdaAway;if(Math.abs(d)>=3)s.push({type:'good',title:`Diferencia de presión ${d<0?'local':'visitante'}`,detail:`PPDA ${fmt(t.ppdaHome)} vs ${fmt(t.ppdaAway)}. Menor PPDA implica mayor presión en este indicador.`,tag:'PPDA'});}
 const box=$('perroSignals'),state=$('perroState');if(box){box.innerHTML=s.length?s.map(x=>`<article class="signal ${x.type}"><strong>${x.title}</strong><small>${x.detail}</small><span class="tag">${x.tag}</span></article>`).join(''):'<p class="empty">Sin señal automática todavía. Faltan datos o no se activó ningún patrón.</p>';if(state)state.textContent=s.length?`${s.length} SEÑAL${s.length===1?'':'ES'}`:'SIN SEÑAL';}
 if(update)renderTopPlays(s); return s;
}
function renderTopPlays(signals){const box=$('topPlays');if(!box)return;const strong=signals.filter(x=>x.type==='good');box.innerHTML=strong.length?strong.slice(0,5).map((x,i)=>`<article class="top-play"><span class="score">${i?'CANDIDATA':'PRIORIDAD ALTA'}</span><strong>${x.title}</strong><small>${x.detail}</small><span class="tag">${x.tag}</span></article>`).join(''):'<p class="empty">Todavía no hay una jugada candidata.</p>';}
function antifalloScore(){
 const boxes=getChecks(),done=boxes.filter(Boolean).length,filled=tacticalFields.filter(id=>num(id)!==null).length;const dataScore=filled/tacticalFields.length*40,checkScore=done/6*30;const sig=perroChapolo(false),good=sig.filter(x=>x.type==='good').length,warn=sig.filter(x=>x.type==='warn').length;const signalScore=Math.min(30,good*8)-Math.min(20,warn*5);const score=Math.max(0,Math.min(100,Math.round(dataScore+checkScore+Math.max(0,signalScore))));if($('antifalloScore'))$('antifalloScore').textContent=`${score}%`;if($('antifalloBar'))$('antifalloBar').style.width=`${score}%`;if($('antifalloDetail'))$('antifalloDetail').innerHTML=`<strong>ESTADO: ${filled<8?'DATOS INSUFICIENTES':score>=80&&done>=5?'LISTO PARA VALIDACIÓN FINAL':score>=60?'PRECAUCIÓN — REQUIERE VALIDACIÓN':'NO APTO — FALTA VALIDACIÓN'}</strong><small>Datos ${filled}/14 · controles ${done}/6 · señales +${good}/⚠${warn}</small>`;return score;
}
function runFinalAudit(){
 const filled=tacticalFields.filter(id=>num(id)!==null).length,done=getChecks().filter(Boolean).length,signals=perroChapolo(false),good=signals.filter(x=>x.type==='good').length,warn=signals.filter(x=>x.type==='warn').length,score=antifalloScore(),markets=getMarkets();
 const complete=filled===14&&done===6,validated=filled>=8&&done>=5&&score>=80&&warn===0&&good>0&&markets.length>0; const verdict=validated?'APTO PARA CONSIDERAR':'NO EMITIR TODAVÍA';
 if($('finalValidation'))$('finalValidation').textContent=validated?'VALIDACIÓN SUPERADA':'PENDIENTE';if($('finalVerdict'))$('finalVerdict').textContent=verdict;if($('marketAudit'))$('marketAudit').textContent=markets.length?markets.join(' · '):'SIN MERCADO SELECCIONADO';if($('auditTrail'))$('auditTrail').textContent=`AUDITORÍA · datos ${filled}/14 · controles ${done}/6 · señales +${good}/⚠${warn} · Antifallo ${score}%`;
 if($('marketRules'))$('marketRules').textContent=complete?`Regla: datos completos. Mercados seleccionados: ${markets.length?markets.join(', '):'ninguno'}. La selección sigue requiriendo contraste externo y contexto.`:`Regla: completar evidencia. Faltan ${14-filled} métricas y ${6-done} controles.`;
 const snap={version:'V23',match:val('match'),date:val('matchDate'),tactical:getTactical(),context:getContext(),markets,signals,antifallo:score,validated,verdict};if($('analysisSnapshot'))$('analysisSnapshot').textContent=JSON.stringify(snap,null,2);
 updateCommander();return snap;
}
function updateCommander(){
 const filled=tacticalFields.filter(id=>num(id)!==null).length,done=getChecks().filter(Boolean).length,score=Number(($('antifalloScore')?.textContent||'0').replace('%',''));let state='EN ESPERA',title='Listos para recibir el partido.',text='Introduce el partido y completa lo que conozcas. El Comandante no inventa datos.';if(filled){state='ANÁLISIS EN CURSO';title='Faltan controles para cerrar la operación.';text=`Datos tácticos ${filled}/14 · controles ${done}/6 · Antifallo ${score}%.`;if(filled===14&&done>=5&&score>=80){state='LISTO PARA VEREDICTO';title='La operación está lista para validación final.';text=`Antifallo ${score}%. Revisamos señales antes de decidir.`;}else if(score<60){state='PRECAUCIÓN';title='El Comandante exige más evidencia.';text=`Antifallo ${score}%. No forzamos ninguna jugada.`;}}if($('commandState'))$('commandState').textContent=state;if($('commandTitle'))$('commandTitle').textContent=title;if($('commandText'))$('commandText').textContent=text;if($('heroCommand'))$('heroCommand').textContent=state;if($('heroCommandText'))$('heroCommandText').textContent=text;
}
function snapshotData(){return {id:crypto.randomUUID?.()||String(Date.now()),...getTextData(),context:getContext(),tactical:getTactical(),checks:getChecks(),markets:getMarkets(),players:{home:val('homeKeyPlayer'),away:val('awayKeyPlayer'),homeMinutes:num('homeMinutes'),awayMinutes:num('awayMinutes')},issues:val('playerIssues'),tacticalDuel:val('tacticalDuel'),weatherPitch:val('weatherPitch'),coaches:val('coaches'),antifallo:antifalloScore(),signals:perroChapolo(false),date:new Date().toISOString()};}
function saveAnalysis(){const data=snapshotData();if(!data.match){setStatus('FALTA PARTIDO',true);$('match')?.focus();return;}const h=getHistory();h.unshift(data);setHistory(h);renderHistory();setStatus('GUARDADO ✓');runFinalAudit();}
function renderHistory(){const box=$('historyList');if(!box)return;const h=getHistory();if(!h.length){box.innerHTML='<p class="empty">Todavía no hay análisis guardados.</p>';return;}box.innerHTML=h.map(x=>`<article class="history-item"><div><strong>${escapeHtml(x.match)}</strong><small>${escapeHtml(x.competition||'Sin competición')} · ${formatDate(x.date)} · Antifallo ${x.antifallo||0}%</small></div><div class="history-actions"><button class="ghost load" data-id="${x.id}">Abrir</button><button class="ghost danger del" data-id="${x.id}">Eliminar</button></div></article>`).join('');box.querySelectorAll('.load').forEach(b=>b.onclick=()=>loadAnalysis(b.dataset.id));box.querySelectorAll('.del').forEach(b=>b.onclick=()=>{setHistory(getHistory().filter(x=>x.id!==b.dataset.id));renderHistory();});}
function loadAnalysis(id){const x=getHistory().find(a=>a.id===id);if(!x)return;textFields.forEach(k=>{if($(k))$(k).value=x[k]??''});Object.entries(x.context||{}).forEach(([k,v])=>{if($(k))$(k).value=v??''});setTactical(x.tactical||{});document.querySelectorAll(checksKey).forEach((b,i)=>b.checked=Boolean(x.checks?.[i]));marketChecks.forEach(b=>b.checked=(x.markets||[]).includes(b.dataset.market));$('playerIssues').value=x.issues||'';$('tacticalDuel').value=x.tacticalDuel||'';$('weatherPitch').value=x.weatherPitch||'';$('coaches').value=x.coaches||'';perroChapolo();antifalloScore();runFinalAudit();setStatus('ANÁLISIS CARGADO');$('workspace').scrollIntoView({behavior:'smooth'});}
function resetAnalysis(){document.querySelectorAll('input,textarea').forEach(e=>{if(e.type==='checkbox')e.checked=false;else e.value='';});setTactical({});perroChapolo();antifalloScore();runFinalAudit();setStatus('LISTO');window.scrollTo({top:0,behavior:'smooth'});}
function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}function formatDate(v){try{return new Intl.DateTimeFormat('es-CO',{dateStyle:'short',timeStyle:'short'}).format(new Date(v));}catch{return v;}}
document.querySelectorAll('.card').forEach(()=>{});
let deferredInstall=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;const b=$('installApp');if(b)b.hidden=false;});
$('installApp')?.addEventListener('click',async()=>{if(!deferredInstall){setStatus('INSTALACIÓN DISPONIBLE AL ABRIR EN HTTPS');return;}deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;});
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));

$('startAnalysis')?.addEventListener('click',()=>$('workspace')?.scrollIntoView({behavior:'smooth'}));$('goAudit')?.addEventListener('click',()=>$('auditPanel')?.scrollIntoView({behavior:'smooth'}));$('save')?.addEventListener('click',saveAnalysis);$('newAnalysis')?.addEventListener('click',resetAnalysis);
document.querySelectorAll(checksKey).forEach(b=>b.addEventListener('change',()=>{b.closest('li')?.classList.toggle('done',b.checked);antifalloScore();runFinalAudit();}));
tacticalFields.forEach(id=>$(id)?.addEventListener('input',()=>{updateTacticalBoard();perroChapolo();antifalloScore();runFinalAudit();}));[...contextFields,...textFields].forEach(id=>$(id)?.addEventListener('input',()=>{updateTacticalBoard();runFinalAudit();}));marketChecks.forEach(b=>b.addEventListener('change',runFinalAudit));
updateTacticalBoard();perroChapolo();antifalloScore();renderHistory();runFinalAudit();
