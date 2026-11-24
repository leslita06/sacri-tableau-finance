/* SACRI · Finance du groupe · charte SACRI 2027 · données de démonstration */
(function(){
"use strict";
var ICO=window.ICO||{},D,T,SOCS,ALL,CH={};
var $=function(id){return document.getElementById(id);};
function ic(n){return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">'+(ICO[n]||"")+"</svg>";}
function F(x){var s=Math.round(Math.abs(x)).toString().replace(/\B(?=(\d{3})+(?!\d))/g,"\u202f");return (x<0?"\u2212":"")+s;}
function M(x,n){if(n===undefined)n=1;var v=(x/1e6).toFixed(n).replace(".",",");if(/,0+$/.test(v))v=v.replace(/,0+$/,"");if(v==="-0")v="0";return v.replace("-","\u2212");}
function fr(x,n){var v=Number(x).toFixed(n===undefined?1:n).replace(".",",");if(/,0+$/.test(v))v=v.replace(/,0+$/,"");return v.replace("-","\u2212");}
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");}
function sum(a){return a.reduce(function(x,y){return x+y;},0);}
function pl(n,s,p){return n+"\u00a0"+(n>1?(p||s+"s"):s);}
function dd(s){return new Date(s+"T12:00:00Z");}
function iso(d){return d.toISOString().slice(0,10);}
function addd(s,n){return iso(new Date(dd(s).getTime()+n*864e5));}
function days(a,b){return Math.round((dd(b)-dd(a))/864e5);}
var JOURS=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"],MOIS=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"],MC=["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
function dc(s){if(!s)return "";var d=dd(s);return d.getUTCDate()+"\u00a0"+MC[d.getUTCMonth()];}
function dfr(s){if(!s)return "";var p=s.split("-");return p[2]+"/"+p[1]+"/"+p[0];}
function flong(s){var d=dd(s);return JOURS[d.getUTCDay()]+" "+d.getUTCDate()+" "+MOIS[d.getUTCMonth()]+" "+d.getUTCFullYear();}
var ACC="#E95B0F",RED="#EF4444",SKY="#0EA5E9",GRN="#10B981",VIO="#8B5CF6",AMB="#F59E0B",SLA="#64748B",GRY="#CBD5E1";
var SC={"SACRI":ACC,"DEFI":SKY,"Trans-Roulements":GRN,"SAFIR":VIO,"PST-CI":AMB};
var BAL=[["Non échu",GRY],["1 à 30 j",SKY],["31 à 60 j",AMB],["61 à 90 j",ACC],["Plus de 90 j",RED]];
var NIV=[{k:0,l:"Non échues",d:"à échoir",c:GRY},{k:1,l:"Niveau 1",d:"1 à 30 j de retard",c:SKY},{k:2,l:"Niveau 2",d:"31 à 60 j de retard",c:AMB},{k:3,l:"Niveau 3",d:"plus de 60 j de retard",c:RED}];
var RL={3:["r","Rouge","Alerte direction"],2:["o","Orange","Échéancier"],1:["a","Jaune","À surveiller"],0:["g","Normal","Relances en cours"]};
var RLC={3:RED,2:ACC,1:AMB,0:GRN};
var MODES=[["Virement",GRN],["Chèque",SKY],["Mobile money",VIO]];
var STEPJ=[15,30,45,60];

/* ---------- état ---------- */
var SF=null,PER=30,CUR="ensemble",VF={ty:"",ri:"",rc:"",ac:""},NF="all",Q="",QR="",QN="",RST="all",FST="all",TXJ=15,TXC="email";
var SORT={en:{k:"retard",d:-1},rj:{k:"date",d:-1},fn:{k:"date",d:-1}},MORE={en:12,rj:12,fn:12};
var VNAME={ensemble:"Vue d'ensemble",encaisser:"Encaissements",tresorerie:"Trésorerie",achats:"Achats et engagements",risque:"Clients à risque",relances:"Relances",fne:"Factures FNE"};
var FMET={
  ensemble:{k:"ty",ico:"users",all:"Tous les clients",o:function(){return [["B2B","Entreprises"],["B2G","Secteur public"],["B2C","Particuliers"]];}},
  encaisser:{k:"ty",ico:"users",all:"Tous les clients",o:function(){return [["B2B","Entreprises"],["B2G","Secteur public"],["B2C","Particuliers"]];}},
  risque:{k:"ri",ico:"shield-alert",all:"Tous les niveaux",o:function(){return [["3","Rouge : alerte direction"],["2","Orange : échéancier"],["1","Jaune : à surveiller"]];}},
  relances:{k:"rc",ico:"send",all:"Tous les canaux",o:function(){return [["email","E-mail"],["whatsapp","WhatsApp"]];}},
  fne:{k:"ty",ico:"users",all:"Tous les clients",o:function(){return [["B2B","Entreprises"],["B2G","Secteur public"],["B2C","Particuliers"]];}},
  achats:{k:"ac",ico:"factory",all:"Tous les fournisseurs",o:function(){var s={};D.cmd.forEach(function(c){s[c.four]=1;});D.achats.forEach(function(a){s[a.four]=1;});return Object.keys(s).sort().map(function(x){return [x,x];});}},
  tresorerie:null
};

/* ---------- périmètre ---------- */
function inS(s){return !SF||s===SF;}
function tyOK(f){return !VF.ty||f.type===VF.ty;}
function FA(){return ALL.filter(function(f){return inS(f.soc)&&tyOK(f);});}
function OPEN(){return D.factures.filter(function(f){return inS(f.soc)&&tyOK(f)&&f.reste>0;});}
function soc(n){for(var i=0;i<D.societes.length;i++)if(D.societes[i].nom===n)return D.societes[i];}
function scope(){return SF||"Groupe";}
function fin(n){return D.treso[n]["Solde de fin"].slice(0,13);}
function cname(c){return c.replace(/\s*\((fictive|fictif|fictifs|fictives)\)\s*$/,"");}
function av(c,sz){var n=cname(c).replace(/^(Client particulier|Établissement public|Société|Exploitation|Plantation d'hévéa|Coopérative agricole|Usine agro-industrielle|Collectivité)\s+/,"$1 ").split(/\s+/).filter(function(w){return /^[A-ZÀ-ÝÊ]/i.test(w)&&w.length>1&&!/^(de|d'|du|des|la|le|SA)$/i.test(w);});
  var ini=((n[0]||"?")[0]+((n[1]||"")[0]||"")).toUpperCase(),h=0;for(var i=0;i<c.length;i++)h=(h*31+c.charCodeAt(i))%6;
  return '<span class="av'+(sz?" "+sz:"")+" c"+h+'">'+esc(ini)+"</span>";}
function tile(s){var p=D.par[s];return '<span class="ti" style="color:'+(SC[s]||SLA)+'">'+ic(p?p[1]:"building-2")+"</span>";}
function stag(s){return '<span class="stag"><span class="sdot" style="background:'+(SC[s]||SLA)+'"></span>'+esc(s)+"</span>";}
function paidAt(f,x){return sum(f.pays.filter(function(p){return p.date<=x;}).map(function(p){return p.mt;}));}
function encAt(x,L){return sum((L||FA()).filter(function(f){return f.date<=x;}).map(function(f){return Math.max(0,f.ttc-paidAt(f,x));}));}
function lateAt(x,j,L){return sum((L||FA()).filter(function(f){return f.date<=x&&days(f.ech,x)>j;}).map(function(f){return Math.max(0,f.ttc-paidAt(f,x));}));}
function caIn(a,b,L){return sum((L||FA()).filter(function(f){return f.date>=a&&f.date<=b;}).map(function(f){return f.ht;}));}
function pays(a,b,L){var o=[];(L||FA()).forEach(function(f){f.pays.forEach(function(p){if(p.date>=a&&p.date<=b)o.push({f:f,date:p.date,mt:p.mt,mode:p.mode});});});return o;}

/* fenêtres de période */
var PERL={7:"7 jours",30:"30 jours",90:"trimestre",365:"année"};
function perTxt(){return PER===7?"sur 7 jours":PER===30?"sur 30 jours":PER===90?"sur le trimestre":"sur un an";}
function vsTxt(){return PER===7?"vs 7 j avant":PER===30?"vs 30 j avant":PER===90?"vs trimestre avant":"vs il y a un an";}
function win(){return [addd(T,-(PER-1)),T];}
function prevWin(){var w=win();return [addd(w[0],-PER),addd(w[0],-1)];}
function buckets(){var B=[],i,a,b;
  if(PER===7){for(i=6;i>=0;i--){a=addd(T,-i);B.push({a:a,b:a,l:dc(a)});}}
  else if(PER===30){for(i=4;i>=0;i--){b=addd(T,-6*i);a=addd(b,-5);B.push({a:a,b:b,l:dc(a)});}}
  else if(PER===90){for(i=12;i>=0;i--){b=addd(T,-7*i);a=addd(b,-6);B.push({a:a,b:b,l:dc(a)});}}
  else{var d=dd(T);for(i=11;i>=0;i--){var y=d.getUTCFullYear(),m=d.getUTCMonth()-i;while(m<0){m+=12;y--;}a=y+"-"+("0"+(m+1)).slice(-2)+"-01";var e=new Date(Date.UTC(y,m+1,0));b=iso(e)>T?T:iso(e);B.push({a:a,b:b,l:MC[m]+(m===0||i===11?" "+String(y).slice(2):"")});}}
  return B;}
function bLab(){return PER===7?"par jour":PER===30?"par tranche de 6 jours":PER===90?"par semaine":"par mois";}

/* ---------- graphes ---------- */
function chartDefaults(){if(!window.Chart)return;var C=Chart.defaults;C.font.family='"Inter",system-ui,sans-serif';C.font.size=12;C.color="#64748B";C.animation=false;C.locale="fr-FR";C.maintainAspectRatio=false;C.responsive=true;
  C.plugins.legend.display=false;var tp=C.plugins.tooltip;tp.backgroundColor="#0F172A";tp.titleColor="#fff";tp.bodyColor="#E2E8F0";tp.padding=10;tp.cornerRadius=10;tp.boxPadding=4;tp.titleFont={weight:"600",size:12.5};tp.bodyFont={size:12.5};tp.usePointStyle=true;
  C.scale.grid.color="#EEF2F6";C.scale.border={display:false};C.elements.bar.borderRadius=5;C.elements.bar.borderSkipped=false;C.elements.line.tension=.35;C.elements.point.radius=0;C.elements.point.hoverRadius=5;}
function mk(id,cfg){if(CH[id]){CH[id].destroy();delete CH[id];}var el=$(id);if(!el||!window.Chart)return null;CH[id]=new Chart(el,cfg);return CH[id];}
function axisX(o){return Object.assign({grid:{display:false},ticks:{maxRotation:0,autoSkip:true,autoSkipPadding:10}},o||{});}
function axisY(o){return Object.assign({beginAtZero:true,ticks:{maxTicksLimit:5,callback:function(v){return fr(v);}}},o||{});}
function tipM(unit){return {callbacks:{label:function(c){var hz=c.chart.config.options.indexAxis==="y",v=hz?c.parsed.x:c.parsed.y;return " "+c.dataset.label+" : "+fr(v,1)+(unit?" "+unit:"");}}};}
function gauge(id,val,max,col,vid,vtxt,sid,stxt){var v=Math.max(0,Math.min(val,max));
  mk(id,{type:"doughnut",data:{labels:["",""],datasets:[{data:[v,(max-v)||(max?0:1)],backgroundColor:[col,"#EEF2F6"],borderWidth:0,borderRadius:[8,0]}]},options:{rotation:-90,circumference:180,cutout:"78%",plugins:{tooltip:{enabled:false}},layout:{padding:{bottom:4}}}});
  $(vid).textContent=vtxt;$(sid).textContent=stxt;}
function donut(id,labels,data,cols,unit,vid,vtxt,legid,fmt){fmt=fmt||function(x){return fr(x);};
  mk(id,{type:"doughnut",data:{labels:labels,datasets:[{data:data,backgroundColor:cols,borderWidth:2,borderColor:"#fff",hoverOffset:4}]},options:{cutout:"70%",plugins:{tooltip:{callbacks:{label:function(c){var t=sum(c.dataset.data)||1;return " "+c.label+" : "+fmt(c.parsed)+(unit?" "+unit:"")+" ("+Math.round(c.parsed/t*100)+"\u00a0%)";}}}}}});
  if(vid)$(vid).textContent=vtxt;
  if(legid)$(legid).innerHTML=labels.map(function(l,i){return '<span class="'+(data[i]?"":"dim")+'"><i style="background:'+cols[i]+'"></i><span class="lt">'+esc(l)+"</span><b>"+fmt(data[i])+"</b></span>";}).join("");}
function spark(data,col,thr){var w=84,h=34,all=thr!=null?data.concat([thr]):data,mn=Math.min.apply(null,all),mx=Math.max.apply(null,all),r=(mx-mn)||1;
  function y(v){return h-3-(v-mn)/r*(h-8);}
  var pts=data.map(function(v,i){return [i*(w/Math.max(1,data.length-1)),y(v)];});
  var d=pts.map(function(p,i){return (i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1);}).join(" ");
  var a=d+" L"+w+" "+h+" L0 "+h+" Z",l=pts[pts.length-1];
  var t=thr!=null?'<line x1="0" x2="'+w+'" y1="'+y(thr).toFixed(1)+'" y2="'+y(thr).toFixed(1)+'" stroke="'+RED+'" stroke-width="1" stroke-dasharray="3 2" vector-effect="non-scaling-stroke"/>':"";
  var lows=thr!=null?pts.filter(function(p,i){return data[i]<thr;}).map(function(p){return '<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="2.2" fill="'+RED+'"/>';}).join(""):"";
  return '<svg class="spk" viewBox="0 0 '+w+" "+h+'" preserveAspectRatio="none"><path d="'+a+'" fill="'+col+'" fill-opacity=".10"/><path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="1.8" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>'+t+lows+'<circle cx="'+l[0].toFixed(1)+'" cy="'+l[1].toFixed(1)+'" r="2.6" fill="'+col+'"/></svg>';}
function delta(a,b,goodDown,unit,dec){var p=Math.pow(10,dec===undefined?1:dec),d=Math.round((b-a)*p)/p;if(!d)return '<span class="dl nt">=</span>';
  var up=d>0,cls=goodDown===null?"nt":((up!==goodDown)?"up":"dn");
  return '<span class="dl '+cls+'">'+(up?"▲":"▼")+"\u00a0"+fr(Math.abs(d),dec===undefined?1:dec)+(unit||"")+"</span>";}
function kc(k){var dl=k.dl||"";
  return '<div class="kc'+(k.bad?" bad":"")+'"><p class="l"><span class="ic '+(k.ic||"")+'">'+ic(k.ico)+"</span>"+k.l+'</p><div class="vr"><p class="v">'+k.v+(k.u?"<small>"+k.u+"</small>":"")+"</p>"+(k.h&&k.h.length>1?spark(k.h,k.col||ACC,k.thr):"")+'</div><p class="s">'+dl+(dl&&k.vs!==false?"<span>"+vsTxt()+"</span>":"")+(k.s?"<span>"+k.s+"</span>":"")+"</p></div>";}
function hbarH(n){return Math.max(160,n*34+40);}

/* ---------- petits outils ---------- */
var tt;function toast(m){var t=$("toast");t.innerHTML=ic("circle-check-big")+"<span>"+esc(m)+"</span>";t.classList.add("on");clearTimeout(tt);tt=setTimeout(function(){t.classList.remove("on");},2600);}
function copy(txt,m){var done=function(){toast(m||"Texte copié");};if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(done,done);else done();}
function openDr(k,h,bind){$("dr-k").innerHTML=k;$("dr-b").innerHTML=h;$("dr-b").scrollTop=0;if(bind)bind();$("drawer").classList.add("on");$("scrim").classList.add("on");$("drawer").setAttribute("aria-hidden","false");}
function closeDr(){$("drawer").classList.remove("on");$("scrim").classList.remove("on");$("drawer").setAttribute("aria-hidden","true");}
$("dr-x").onclick=closeDr;$("scrim").onclick=closeDr;
function moreBtn(id,key,total,fn){var el=$(id),shown=MORE[key];if(total<=shown){el.innerHTML="";return;}
  el.innerHTML='<button class="btn sm morebtn">'+ic("chevron-down")+"Voir "+Math.min(total-shown,12)+" de plus ("+(total-shown)+" restantes)</button>";
  el.firstChild.onclick=function(){MORE[key]+=12;fn();};}
function sortTh(cols,st){return "<thead><tr>"+cols.map(function(c){var s=c[2]?' class="sortable'+(st.k===c[2]?" on "+(st.d>0?"asc":"desc"):"")+(c[3]?" l":"")+'" data-k="'+c[2]+'"':(c[3]?' class="l"':"");return "<th"+s+">"+c[0]+"</th>";}).join("")+"</tr></thead>";}
function bindSort(tid,key,fn){[].forEach.call($(tid).querySelectorAll("th[data-k]"),function(th){th.onclick=function(){var k=th.dataset.k,s=SORT[key];if(s.k===k)s.d=-s.d;else{s.k=k;s.d=(k==="client"||k==="soc"||k==="num")?1:-1;}fn();};});}
function cmp(k,d){return function(a,b){var x=a[k],y=b[k];if(x==null)x="";if(y==null)y="";return (x>y?1:x<y?-1:0)*d;};}
function pbar(v,tot,col){var p=tot?Math.max(0,Math.min(100,v/tot*100)):0;return '<span class="pbar"><span class="tr"><i style="width:'+p.toFixed(1)+"%;background:"+(col||GRN)+'"></i></span><small>'+Math.round(p)+"\u00a0%</small></span>";}
function rlPill(l){var r=RL[l]||RL[0];return '<span class="pill '+r[0]+'">'+r[1]+"</span>";}
function nivPill(f){var n=f.niveau||0;if(!n)return '<span class="pill n">À échoir</span>';return '<span class="pill '+(n===3?"r":n===2?"a":"b")+'">Niveau '+n+"</span>";}

/* ---------- risque client ---------- */
function rk(c){return D.risque[c]||{lvl:0,score:0,sig:[],trend:[]};}
function action(c){var r=rk(c),k={};r.sig.forEach(function(s){k[s.k]=1;});
  if(k.proc)return {ico:"gavel",t:"Déclarer la créance au mandataire judiciaire et bloquer les livraisons",m:"crea"};
  if(k.cheque)return {ico:"ban",t:"Bloquer les nouvelles livraisons et adresser une mise en demeure",m:"med"};
  if(r.lvl===3)return {ico:"file-signature",t:"Mise en demeure, ou échéancier signé si le délai demandé est confirmé par écrit",m:"med"};
  if(r.lvl===2)return {ico:"calendar-clock",t:"Proposer un échéancier et passer au paiement à la commande",m:"ech"};
  if(r.lvl===1)return {ico:"phone",t:"Appeler le client et suivre les prochaines échéances",m:"rel"};
  return {ico:"bell-ring",t:"Relances automatiques en cours",m:"rel"};}
var SIGI={proc:["gavel","r"],cheque:["ban","r"],delai:["calendar-clock","o"],trend:["trending-up","o"],partiel:["split","a"],r60:["clock","r"],r30:["clock","a"]};
function clients(){var o={};OPEN().forEach(function(f){var c=o[f.client]||(o[f.client]={c:f.client,L:[],ex:0,late:0,mx:0,socs:{}});c.L.push(f);c.ex+=f.reste;if(f.retard>0)c.late+=f.reste;c.mx=Math.max(c.mx,f.retard);c.socs[f.soc]=1;});
  return Object.keys(o).map(function(k){var c=o[k],r=rk(k);c.lvl=r.lvl;c.score=r.score;c.r=r;return c;});}
function riskList(){return clients().filter(function(c){return c.mx>0;}).filter(function(c){return !VF.ri||String(c.lvl)===VF.ri;}).sort(function(a,b){return (b.lvl-a.lvl)||(b.score-a.score)||(b.ex-a.ex);});}
function redClients(){return clients().filter(function(c){return c.lvl===3;}).sort(function(a,b){return b.score-a.score;});}

/* ---------- textes ---------- */
function relTxt(f,j,canal){var s=f.soc,r=F(f.reste)+" F CFA",n=f.num,de=dfr(f.date),ech=dfr(f.ech);
  if(canal==="whatsapp"){
    if(j===15)return "Bonjour, ici le service encaissements de "+s+". Sauf erreur, la facture "+n+" du "+de+" (échéance "+ech+") reste due : "+r+". Pouvez-vous nous indiquer la date de règlement ? Merci.";
    if(j===30)return "Bonjour, la facture "+n+" de "+s+" est échue depuis le "+ech+". Montant dû : "+r+". Merci de régler sous huit jours ou de nous appeler pour en parler.";
    if(j===45)return "Bonjour, malgré nos messages, la facture "+n+" reste impayée ("+r+"). Nous pouvons vous proposer un échéancier : répondez à ce message ou appelez le service encaissements de "+s+".";
    return "Bonjour, dernier rappel pour la facture "+n+" ("+r+"), échue le "+ech+". Sans règlement ni échéancier sous huit jours, le dossier passe à la direction de "+s+".";}
  if(j===15)return "Objet : Facture "+n+" · rappel\n\nBonjour,\n\nSauf erreur de notre part, la facture "+n+" du "+de+", arrivée à échéance le "+ech+", reste due pour "+r+" TTC.\n\nPourriez-vous nous indiquer la date de règlement prévue ? Si le paiement est déjà parti, merci de ne pas tenir compte de ce message.\n\nCordialement,\nService encaissements · "+s;
  if(j===30)return "Objet : Facture "+n+" · relance\n\nBonjour,\n\nLa facture "+n+" du "+de+" reste impayée trente jours après son échéance du "+ech+". Le montant dû est de "+r+" TTC.\n\nNous vous remercions de procéder au règlement sous huit jours, ou de nous appeler pour convenir d'une date.\n\nCordialement,\nService encaissements · "+s;
  if(j===45)return "Objet : Facture "+n+" · relance, proposition d'échéancier\n\nBonjour,\n\nMalgré nos deux relances, la facture "+n+" du "+de+" reste impayée pour "+r+" TTC.\n\nSi un règlement en une fois est difficile, nous pouvons étudier un échéancier. Merci de nous faire une proposition sous huit jours.\n\nCordialement,\nService encaissements · "+s;
  return "Objet : Dernier rappel · facture "+n+"\n\nBonjour,\n\nMalgré nos précédents messages, la facture "+n+" du "+de+" reste impayée soixante jours après son échéance, pour "+r+" TTC.\n\nSans règlement ou proposition d'échéancier de votre part sous huit jours, le dossier sera transmis à notre direction.\n\nCordialement,\nService encaissements · "+s;}
function actTxt(c,m){var L=c.L.slice().sort(function(a,b){return b.retard-a.retard;}),s=Object.keys(c.socs).join(", "),tot=F(c.ex)+" F CFA",lst=L.map(function(f){return "- "+f.num+" du "+dfr(f.date)+", échue le "+dfr(f.ech)+" : "+F(f.reste)+" F CFA";}).join("\n");
  var ev=(D.evts[c.c]||[]).filter(function(e){return e.k==="proc";})[0];
  if(m==="crea")return "Objet : Déclaration de créance · "+cname(c.c)+"\n\nÀ l'attention de "+(ev?ev.syndic:"Maître ⟦mandataire⟧")+"\n\nMaître,\n\nÀ la suite de l'ouverture d'une procédure de redressement judiciaire à l'encontre de "+cname(c.c)+(ev?" (jugement du "+dfr(ev.jug)+", "+ev.src+")":"")+", nous déclarons notre créance pour un montant total de "+tot+" TTC, au titre des factures suivantes :\n"+lst+"\n\nLes copies des factures et des bons de livraison sont jointes.\n\nVeuillez agréer, Maître, nos salutations distinguées.\n\nLa direction · "+s;
  if(m==="med")return "Objet : Mise en demeure de payer · "+cname(c.c)+"\n\nMadame, Monsieur,\n\nMalgré nos relances, les factures suivantes restent impayées, pour un total de "+tot+" TTC :\n"+lst+"\n\nNous vous mettons en demeure de régler cette somme dans un délai de quinze jours à compter de la réception du présent courrier. Dans l'intervalle, les nouvelles livraisons sont suspendues.\n\nSi un règlement est déjà en cours, merci de nous en adresser la preuve.\n\nVeuillez agréer, Madame, Monsieur, nos salutations distinguées.\n\nLa direction · "+s;
  if(m==="ech")return "Objet : Proposition d'échéancier · "+cname(c.c)+"\n\nBonjour,\n\nVous nous devez à ce jour "+tot+" TTC :\n"+lst+"\n\nPour vous permettre de régulariser, nous vous proposons un règlement en plusieurs versements, à convenir ensemble. Les prochaines commandes seront payables à la commande jusqu'au retour à jour.\n\nMerci de nous faire part de votre proposition sous huit jours.\n\nCordialement,\nService encaissements · "+s;
  return "Objet : Point sur vos factures · "+cname(c.c)+"\n\nBonjour,\n\nSauf erreur de notre part, "+pl(L.length,"facture")+" "+(L.length>1?"restent dues":"reste due")+" pour "+tot+" TTC :\n"+lst+"\n\nPouvez-vous nous indiquer vos dates de règlement ?\n\nCordialement,\nService encaissements · "+s;}
function dirTxt(R){return "Objet : Alerte clients · "+pl(R.length,"client")+" au niveau rouge\n\n"+R.map(function(c){var a=action(c.c),al=(D.alertes.filter(function(x){return x.client===c.c;})[0]);return "- "+cname(c.c)+" : "+F(c.ex)+" F CFA dus"+(al?", "+al.motif:"")+". Action proposée : "+a.t.toLowerCase()+".";}).join("\n")+"\n\nAucune nouvelle livraison à crédit pour ces clients sans accord de la direction.";}

/* ---------- vue d'ensemble ---------- */
function renderLede(){var s=soc(scope()),O=OPEN(),e=sum(O.map(function(f){return f.reste;})),l60=sum(O.filter(function(f){return f.retard>60;}).map(function(f){return f.reste;}));
  var mo=T.slice(0,8)+"01",ca=caIn(mo,T),R=redClients(),fv=fin(scope()),pb=Math.min.apply(null,fv),wk=D.semaines[fv.indexOf(pb)];
  var low=SOCS.filter(function(x){return soc(x).sem_sous>0&&inS(x);});
  $("h-ens").textContent=SF?"Finance de "+SF:"Finance du groupe";
  $("lede").innerHTML=(SF||"Le groupe")+" a facturé <b>"+M(ca)+" M F HT</b> depuis le 1er novembre. Les clients doivent <b>"+M(e)+" M F</b>, dont <span class=\"r\">"+M(l60)+" M F en retard de plus de 60 jours</span>. Trésorerie <b>"+M(s.treso)+" M F</b>, point bas à "+M(pb)+" M F la semaine du "+dc(wk)+"."+
    (low.length?" <span class=\"r\">"+low.join(" et ")+" "+(low.length>1?"passent":"passe")+" sous "+(low.length>1?"leur":"son")+" seuil.</span>":"")+(R.length?" "+pl(R.length,"client")+" au niveau rouge.":"");}
function alertBox(id){var R=redClients();if(!R.length){$(id).innerHTML="";return;}
  var tot=sum(R.map(function(c){return c.ex;}));
  $(id).innerHTML='<div class="alert"><span class="ai">'+ic("siren")+'</span><div><p class="at">Alerte direction : '+pl(R.length,"client")+" au niveau rouge, "+M(tot)+' M F exposés</p><p class="as">'+R.map(function(c){var al=D.alertes.filter(function(x){return x.client===c.c;})[0];return "<b>"+esc(cname(c.c))+"</b>"+(al?" ("+esc(al.motif)+", signalé le "+dc(al.date)+")":"");}).join(" ; ")+'.</p></div><div class="ab2"><button class="btn sm pri" data-dir="1">'+ic("file-text")+'Note à la direction</button>'+(id!=="alert-ri"?'<button class="btn sm" data-goto="risque">'+ic("shield-alert")+"Voir les clients</button>":"")+"</div></div>";
  $(id).querySelector("[data-dir]").onclick=function(){var t=dirTxt(R);openDr('<span class="pill r">'+ic("siren")+"Alerte direction</span>",'<h3>Note à la direction</h3><p class="why">Préparée à partir des signaux relevés. Rien ne part depuis cette page.</p><p class="lbl">Texte</p><div class="msg">'+esc(t)+'</div><div class="acts"><button class="btn pri" id="dr-copy">'+ic("copy")+"Copier la note</button></div>",function(){$("dr-copy").onclick=function(){copy(t,"Note copiée");};});};}
function renderKpis(){var n=scope(),s=soc(n),L=FA(),B=buckets(),w=win(),pw=prevWin();
  var mo=T.slice(0,8)+"01",pm=addd(mo,-1).slice(0,8)+"01",pmEnd=addd(pm,days(mo,T));
  var ca=caIn(mo,T,L),caP=caIn(pm,pmEnd,L),nF=L.filter(function(f){return f.date>=mo;}).length;
  var mB=[];for(var i=11;i>=0;i--){var d=dd(mo);d.setUTCMonth(d.getUTCMonth()-i);var a=iso(d),e=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0));mB.push(caIn(a,iso(e)>T?T:iso(e),L)/1e6);}
  var enc=encAt(T,L),encP=encAt(addd(w[0],-1),L),l60=lateAt(T,60,L),l60P=lateAt(addd(w[0],-1),60,L);
  var fv=fin(n),pb=Math.min.apply(null,fv),wk=D.semaines[fv.indexOf(pb)];
  var dca=caP?Math.round((ca-caP)/caP*100):null;
  $("kpis").innerHTML=[
    kc({l:"Chiffre d'affaires du mois",ico:"receipt",v:M(ca),u:"M F HT",h:mB,col:ACC,dl:dca===null?"":delta(0,dca,false," %",0),vs:false,s:(dca===null?"":"vs octobre à date · ")+pl(nF,"facture")}),
    kc({l:"Encours clients",ico:"hand-coins",ic:"s",v:M(enc),u:"M F",h:B.map(function(b){return encAt(b.b,L)/1e6;}),col:SKY,dl:delta(encP/1e6,enc/1e6,true," M")}),
    kc({l:"Impayés à plus de 60 j",ico:"triangle-alert",ic:"r",v:M(l60),u:"M F",h:B.map(function(b){return lateAt(b.b,60,L)/1e6;}),col:RED,dl:delta(l60P/1e6,l60/1e6,true," M"),bad:l60>0}),
    kc({l:"Trésorerie disponible",ico:"wallet",ic:"v",v:M(s.treso),u:"M F",h:fv.map(function(x){return x/1e6;}),col:VIO,thr:s.seuil/1e6,s:"au "+dfr(T)+" · prévision 13 semaines"}),
    kc({l:"Point bas sur 13 semaines",ico:"arrow-down-to-line",ic:pb<s.seuil?"r":"",v:M(pb),u:"M F",s:(pb<s.seuil?'<span class="dl dn">▼ '+M(s.seuil-pb)+" M sous le seuil</span>":'<span class="dl up">▲ '+M(pb-s.seuil)+" M au-dessus du seuil</span>")+"<span>semaine du "+dc(wk)+"</span>",bad:pb<s.seuil})
  ].join("");}
function renderEnsCharts(){var L=FA(),B=buckets(),O=OPEN();
  /* facturé et encaissé */
  var fac=B.map(function(b){return sum(L.filter(function(f){return f.date>=b.a&&f.date<=b.b;}).map(function(f){return f.ttc;}))/1e6;});
  var enc=B.map(function(b){return sum(pays(b.a,b.b,L).map(function(p){return p.mt;}))/1e6;});
  $("u-fe").textContent="En M FCFA, "+bLab()+", "+perTxt();
  mk("c-fe",{type:"bar",data:{labels:B.map(function(b){return b.l;}),datasets:[{label:"Facturé TTC",data:fac,backgroundColor:SKY,maxBarThickness:26},{label:"Encaissé",data:enc,backgroundColor:GRN,maxBarThickness:26}]},options:{plugins:{tooltip:tipM("M F")},scales:{x:axisX(),y:axisY()}}});
  /* recouvrement */
  var w=win(),E=L.filter(function(f){return f.ech>=w[0]&&f.ech<=w[1];}),due=sum(E.map(function(f){return f.ttc;})),got=sum(E.map(function(f){return paidAt(f,T);}));
  var pw=prevWin(),EP=L.filter(function(f){return f.ech>=pw[0]&&f.ech<=pw[1];}),dP=sum(EP.map(function(f){return f.ttc;})),gP=sum(EP.map(function(f){return paidAt(f,pw[1]);}));
  var tx=due?got/due*100:0,txP=dP?gP/dP*100:null;
  gauge("c-rec",tx,100,tx>=70?GRN:tx>=50?AMB:RED,"rec-v",due?fr(tx,0)+"\u00a0%":"Aucune","rec-s",due?"encaissé sur les échéances "+perTxt():"échéance "+perTxt());
  $("u-rec").innerHTML="Factures arrivées à échéance "+perTxt()+(txP!==null&&due?" · "+delta(txP,tx,false," pt",0):"");
  $("rec-leg").innerHTML='<span><i style="background:'+GRY+'"></i><span class="lt">Échu</span><b>'+M(due)+' M</b></span><span><i style="background:'+GRN+'"></i><span class="lt">Encaissé</span><b>'+M(got)+' M</b></span><span><i style="background:'+RED+'"></i><span class="lt">Reste dû</span><b>'+M(due-got)+' M</b></span><span><i style="background:'+SLA+'"></i><span class="lt">Factures</span><b>'+E.length+"</b></span>";
  /* anneau des encours */
  var lab,dat,col;
  if(!SF){lab=SOCS;dat=SOCS.map(function(s){return sum(O.filter(function(f){return f.soc===s;}).map(function(f){return f.reste;}))/1e6;});col=SOCS.map(function(s){return SC[s];});$("t-dn").textContent="Encours par société";}
  else{var by={};O.forEach(function(f){by[f.client]=(by[f.client]||0)+f.reste;});var K=Object.keys(by).sort(function(a,b){return by[b]-by[a];}),top=K.slice(0,5);lab=top.map(cname);dat=top.map(function(k){return by[k]/1e6;});col=[ACC,SKY,GRN,VIO,AMB];if(K.length>5){lab.push("Autres clients");dat.push(sum(K.slice(5).map(function(k){return by[k];}))/1e6);col.push(SLA);}$("t-dn").textContent="Encours de "+SF+" par client";}
  donut("c-dn",lab,dat,col,"M F","dn-v",M(sum(O.map(function(f){return f.reste;}))),"dn-leg",function(x){return fr(x,1);});
  /* balance âgée */
  balance("c-ba","ba-box",O,"u-ba");
  /* trésorerie */
  var n=scope(),s=soc(n),fv=fin(n).map(function(x){return x/1e6;}),thr=s.seuil/1e6;
  $("tc-title").textContent="Trésorerie sur 13 semaines · "+(SF||"groupe");
  $("tc-u").textContent="Solde de fin de semaine en M FCFA, seuil d'alerte "+M(s.seuil)+" M";
  mk("c-treso",{type:"line",data:{labels:D.semaines.map(dc),datasets:[{label:"Solde de fin",data:fv,borderColor:ACC,backgroundColor:"rgba(233,91,15,.10)",fill:true,borderWidth:2.2,pointRadius:fv.map(function(v){return v<thr?4:0;}),pointBackgroundColor:RED,pointBorderColor:"#fff",pointBorderWidth:1.5},{label:"Seuil d'alerte",data:fv.map(function(){return thr;}),borderColor:RED,borderDash:[5,4],borderWidth:1.5,fill:false,pointRadius:0}]},options:{interaction:{mode:"index",intersect:false},plugins:{tooltip:tipM("M F")},scales:{x:axisX(),y:axisY({beginAtZero:false,suggestedMin:Math.min(thr,Math.min.apply(null,fv))*0.85})}}});}
function balRows(O,byClient){var rows={};O.forEach(function(f){var k=byClient?f.client:f.soc,r=rows[k]||(rows[k]={k:k,b:[0,0,0,0,0]});var i=f.retard<=0?0:f.retard<=30?1:f.retard<=60?2:f.retard<=90?3:4;r.b[i]+=f.reste;});
  var L=Object.keys(rows).map(function(k){var r=rows[k];r.t=sum(r.b);return r;});
  if(byClient)L.sort(function(a,b){return b.t-a.t;});else L.sort(function(a,b){return SOCS.indexOf(a.k)-SOCS.indexOf(b.k);});return L;}
function balance(cid,box,O,uid){var byC=!!SF,R=balRows(O,byC).slice(0,byC?8:5);
  $(box).style.height=hbarH(R.length)+"px";
  if(uid)$(uid).textContent=(byC?"Clients de "+SF+", ":"Par société, ")+"reste dû TTC en M FCFA";
  mk(cid,{type:"bar",data:{labels:R.map(function(r){return byC?cname(r.k):r.k;}),datasets:BAL.map(function(b,i){return {label:b[0],data:R.map(function(r){return r.b[i]/1e6;}),backgroundColor:b[1],maxBarThickness:22,borderRadius:3};})},options:{indexAxis:"y",interaction:{mode:"index",intersect:false},plugins:{tooltip:tipM("M F")},scales:{x:Object.assign(axisY(),{stacked:true}),y:{stacked:true,grid:{display:false},ticks:{autoSkip:false,callback:function(v){var l=this.getLabelForValue(v);return l.length>24?l.slice(0,23)+"…":l;}}}}}});}
function renderFil(){
  $("fil").innerHTML=SOCS.map(function(n){var s=soc(n),f=fin(n),low=s.sem_sous>0,E=eng(n);
    var st=low?'<span class="pill r">'+pl(s.sem_sous,"sem.","sem.")+" sous le seuil</span>":'<span class="pill g">Au-dessus du seuil</span>';
    return '<button class="fc'+(SF===n?" on":(SF?" dim":""))+'" data-soc="'+esc(n)+'"><div class="h">'+tile(n)+'<div style="min-width:0"><p class="n">'+esc(n)+'</p><p class="m">'+esc(D.par[n][0])+"</p></div></div>"+
      '<div><p class="big">'+M(s.treso)+'<small>M F</small></p><p class="bl">trésorerie · '+st+"</p></div>"+spark(f,low?RED:(SC[n]||ACC),s.seuil)+
      "<dl><dt>CA du mois</dt><dd>"+M(s.ca_mois,2)+" M</dd><dt>Encours clients</dt><dd>"+M(s.encours)+" M</dd>"+
      '<dt>Impayés &gt; 60 j</dt><dd class="'+(s.imp60?"bad":"")+'">'+(s.imp60?M(s.imp60)+" M":"0")+"</dd>"+
      '<dt>Point bas</dt><dd class="'+(low?"bad":"")+'">'+M(s.point_bas)+" M</dd>"+
      '<dt>Achats à payer</dt><dd class="'+(E.marge<0&&E.du?"bad":"")+'">'+(E.du?M(E.du)+" M":"0")+"</dd></dl></button>";}).join("");
  [].forEach.call($("fil").querySelectorAll(".fc"),function(b){b.onclick=function(){pick(SF===b.dataset.soc?null:b.dataset.soc);};});}
function renderMinis(){var R=riskList().slice(0,5);
  $("ri-mini").innerHTML=R.length?R.map(function(c){var a=action(c.c);return '<button class="row" data-cl="'+esc(c.c)+'">'+av(c.c)+'<div style="min-width:0"><p class="tt">'+esc(cname(c.c))+'</p><span class="mm">'+esc(a.t)+'</span></div><span class="rr"><span class="amt">'+M(c.ex)+" M</span>"+rlPill(c.lvl)+"</span></button>";}).join(""):'<p class="empty">Aucun client en retard pour ces filtres.</p>';
  bindCl($("ri-mini"));
  var P=D.relances.filter(function(r){return r.st!=="envoyee"&&r.date>T&&inS(r.soc);}).sort(cmp("date",1)).slice(0,5);
  $("re-mini").innerHTML=P.length?P.map(function(r){return '<button class="row" data-goto="relances"><span class="ty '+(r.st==="suspendue"?"":"b")+'">'+ic(r.canal==="whatsapp"?"message-circle":"mail")+'</span><div style="min-width:0"><p class="tt">'+esc(cname(r.client))+'</p><span class="mm">'+esc(r.num)+" · "+dc(r.date)+(r.st==="suspendue"?" · suspendue, procédure collective":"")+'</span></div><span class="rr"><span class="amt">'+M(r.du,2)+' M</span><span class="jb j'+r.j+'">J+'+r.j+"</span></span></button>";}).join(""):'<p class="empty">Aucune relance prévue.</p>';}
function bindCl(root){[].forEach.call(root.querySelectorAll("[data-cl]"),function(b){b.onclick=function(e){e.stopPropagation();openClient(b.dataset.cl);};});}

/* ---------- encaissements ---------- */
function renderEnc(){var L=FA(),O=OPEN(),B=buckets(),w=win(),pw=prevWin();
  var P=pays(w[0],w[1],L),PP=pays(pw[0],pw[1],L),enc=sum(P.map(function(p){return p.mt;})),encP=sum(PP.map(function(p){return p.mt;}));
  var tot=sum(O.map(function(f){return f.reste;})),late=O.filter(function(f){return f.retard>0;}),lt=sum(late.map(function(f){return f.reste;}));
  function dso(A){var a=A.map(function(p){return days(p.f.date,p.date);});return a.length?sum(a)/a.length:0;}
  var dl=dso(P),dlP=dso(PP);
  $("en-kpis").innerHTML=[
    kc({l:"Encaissé "+perTxt(),ico:"banknote",ic:"g",v:M(enc),u:"M F",h:B.map(function(b){return sum(pays(b.a,b.b,L).map(function(p){return p.mt;}))/1e6;}),col:GRN,dl:delta(encP/1e6,enc/1e6,false," M"),s:pl(P.length,"paiement")}),
    kc({l:"Reste dû par les clients",ico:"hand-coins",ic:"s",v:M(tot),u:"M F",h:B.map(function(b){return encAt(b.b,L)/1e6;}),col:SKY,dl:delta(encAt(addd(w[0],-1),L)/1e6,tot/1e6,true," M"),s:pl(O.length,"facture")}),
    kc({l:"Dont en retard",ico:"clock",ic:"r",v:M(lt),u:"M F",h:B.map(function(b){return lateAt(b.b,0,L)/1e6;}),col:RED,dl:delta(lateAt(addd(w[0],-1),0,L)/1e6,lt/1e6,true," M"),s:pl(late.length,"facture"),bad:lt>0}),
    kc({l:"Délai moyen de paiement",ico:"timer",ic:"v",v:P.length?fr(dl,0):"0",u:"jours",h:B.map(function(b){return dso(pays(b.a,b.b,L));}),col:VIO,dl:P.length&&PP.length?delta(dlP,dl,true," j",0):"",s:"de la facture au paiement"})].join("");
  var nl=sum(late.filter(function(f){return f.niveau===3;}).map(function(f){return f.reste;}));
  $("en-lede").innerHTML=(SF||"Le groupe")+" attend <b>"+M(tot)+" M F</b> sur "+pl(O.length,"facture")+". "+pl(late.length,"facture")+" "+(late.length>1?"sont":"est")+" en retard, dont <span class=\"r\">"+O.filter(function(f){return f.niveau===3;}).length+" au niveau 3 pour "+M(nl)+" M F</span>. "+M(enc)+" M F encaissés "+perTxt()+".";
  /* anneau niveaux */
  donut("c-niv",NIV.map(function(v){return v.l+" · "+v.d;}),NIV.map(function(v){return sum(O.filter(function(f){return (f.niveau||0)===v.k;}).map(function(f){return f.reste;}))/1e6;}),NIV.map(function(v){return v.c;}),"M F","niv-v",M(tot),"niv-leg",function(x){return fr(x,1);});
  /* débiteurs */
  var C=clients().sort(function(a,b){return b.ex-a.ex;}).slice(0,8);
  $("deb-box").style.height=hbarH(C.length)+"px";
  mk("c-deb",{type:"bar",data:{labels:C.map(function(c){return cname(c.c);}),datasets:[{label:"Reste dû",data:C.map(function(c){return c.ex/1e6;}),backgroundColor:C.map(function(c){return RLC[c.lvl];}),maxBarThickness:20}]},options:{indexAxis:"y",plugins:{tooltip:tipM("M F")},scales:{x:axisY(),y:{grid:{display:false},ticks:{autoSkip:false,callback:function(v){var l=this.getLabelForValue(v);return l.length>22?l.slice(0,21)+"…":l;}}}}}});
  /* modes */
  $("u-pay").textContent="Par mode de paiement, en M FCFA, "+bLab();
  mk("c-pay",{type:"bar",data:{labels:B.map(function(b){return b.l;}),datasets:MODES.map(function(m){return {label:m[0],data:B.map(function(b){return sum(pays(b.a,b.b,L).filter(function(p){return p.mode===m[0];}).map(function(p){return p.mt;}))/1e6;}),backgroundColor:m[1],maxBarThickness:26,borderRadius:3};})},options:{interaction:{mode:"index",intersect:false},plugins:{tooltip:tipM("M F")},scales:{x:Object.assign(axisX(),{stacked:true}),y:Object.assign(axisY(),{stacked:true})}}});
  renderNivs(O);renderEnTbl(O);}
function renderNivs(O){var tot=sum(O.map(function(f){return f.reste;}))||1;
  $("nivs").innerHTML=NIV.map(function(v){var L=O.filter(function(f){return (f.niveau||0)===v.k;}),m=sum(L.map(function(f){return f.reste;}));
    return '<button class="nv'+(NF===String(v.k)?" on":"")+'" data-n="'+v.k+'"><p class="l"><i style="background:'+v.c+'"></i>'+v.l+'</p><p class="v">'+M(m)+'<small>M F</small></p><p class="s">'+pl(L.length,"facture")+" · "+v.d+'</p><div class="b1"><i style="width:'+(m/tot*100).toFixed(1)+"%;background:"+v.c+'"></i></div></button>';}).join("");
  [].forEach.call($("nivs").children,function(b){b.onclick=function(){NF=NF===b.dataset.n?"all":b.dataset.n;MORE.en=12;renderEnc();};});}
function fN(f,k){return k==="all"||(k==="late"?f.retard>0:String(f.niveau||0)===k);}
function nextRel(f){var r=D.relances.filter(function(x){return x.num===f.num&&x.st!=="envoyee"&&x.date>T;}).sort(cmp("date",1))[0];return r;}
function renderEnTbl(O){var q=Q.trim().toLowerCase(),s=SORT.en;
  var segs=[["all","Toutes"],["late","En retard"],["3","Niveau 3"],["2","Niveau 2"],["1","Niveau 1"],["0","À échoir"]];
  $("seg-niv").innerHTML=segs.map(function(x){var c=O.filter(function(f){return fN(f,x[0]);}).length;return '<button class="'+(NF===x[0]?"on":"")+'" data-n="'+x[0]+'">'+x[1]+' <span class="c">'+c+"</span></button>";}).join("");
  [].forEach.call($("seg-niv").children,function(b){b.onclick=function(){NF=b.dataset.n;MORE.en=12;renderEnc();};});
  var L=O.filter(function(f){return fN(f,NF)&&(!q||(f.client+" "+f.num).toLowerCase().indexOf(q)>=0);}).sort(cmp(s.k,s.d));
  var cols=[["Client et facture",0,"client",1],["Échéance",0,"ech"],["Montant TTC",0,"ttc"],["Encaissé",0,null],["Reste dû",0,"reste"],["Retard",0,"retard"],["Niveau",0,null,1],["Prochaine relance",0,null,1],["",0,null]];
  var h=sortTh(cols,s)+"<tbody>"+L.slice(0,MORE.en).map(function(f){var r=nextRel(f);
    return '<tr class="click" data-f="'+esc(f.num)+'"><td data-l="Client"><div class="cl">'+av(f.client)+'<div style="min-width:0"><p class="nm">'+esc(cname(f.client))+'</p><p class="mt2">'+esc(f.num)+" · "+esc(f.soc)+"</p></div></div></td>"+
      '<td data-l="Échéance">'+dc(f.ech)+'</td><td data-l="Montant TTC">'+F(f.ttc)+'</td><td data-l="Encaissé">'+pbar(f.ttc-f.reste,f.ttc,GRN)+'</td><td data-l="Reste dû"><b>'+F(f.reste)+"</b></td>"+
      '<td data-l="Retard">'+(f.retard>0?'<span class="'+(f.retard>60?"r":"")+'">'+f.retard+"\u00a0j</span>":'<span class="hint">dans '+(-f.retard)+"\u00a0j</span>")+'</td><td class="l" data-l="Niveau">'+nivPill(f)+"</td>"+
      '<td class="l" data-l="Prochaine relance">'+(r?'<span class="jb j'+r.j+'">J+'+r.j+"</span> "+(r.st==="suspendue"?'<span class="hint">suspendue</span>':'<span class="hint">'+dc(r.date)+"<br>"+(r.canal==="whatsapp"?"WhatsApp":"e-mail")+"</span>"):(f.retard>60?'<span class="hint">calendrier terminé</span>':'<span class="hint">aucune</span>'))+"</td>"+
      '<td data-l=""><button class="btn sm" data-prep="'+esc(f.num)+'">'+ic(f.niveau===3?"gavel":"send")+(f.niveau===3?"Demeure":"Préparer")+"</button></td></tr>";}).join("")+(L.length?"":'<tr><td colspan="9"><p class="empty">Aucune facture pour ces filtres.</p></td></tr>')+"</tbody>";
  $("t-en").innerHTML=h;bindSort("t-en","en",renderEnc);
  [].forEach.call($("t-en").querySelectorAll("tr[data-f]"),function(tr){tr.onclick=function(){openFact(tr.dataset.f);};});
  [].forEach.call($("t-en").querySelectorAll("[data-prep]"),function(b){b.onclick=function(e){e.stopPropagation();openFact(b.dataset.prep,true);};});
  moreBtn("en-more","en",L.length,renderEnc);}
function factBy(num){for(var i=0;i<ALL.length;i++)if(ALL[i].num===num)return ALL[i];}
function openFact(num,focus){var f=factBy(num);if(!f)return;var n=f.niveau||0;
  var txt=n===3?actTxt({c:f.client,L:[f],ex:f.reste,socs:(function(){var o={};o[f.soc]=1;return o;})()},"med"):relTxt(f,n===2?30:15,"email");
  var ev=[];ev.push({d:f.date,i:"file-text",c:"b",t:"Facture émise, "+F(f.ttc)+" F TTC"+(f.fne?" · "+f.fne:"")});
  ev.push({d:f.ech,i:"calendar",c:"",t:"Échéance"});
  f.pays.forEach(function(p){ev.push({d:p.date,i:"banknote",c:"g",t:"Paiement reçu, "+F(p.mt)+" F ("+p.mode.toLowerCase()+")"});});
  D.relances.filter(function(r){return r.num===f.num;}).forEach(function(r){ev.push({d:r.date,i:r.canal==="whatsapp"?"message-circle":"mail",c:r.st==="envoyee"?"o":"",t:"Relance J+"+r.j+" par "+(r.canal==="whatsapp"?"WhatsApp":"e-mail")+(r.st==="envoyee"?", envoyée":r.st==="suspendue"?", suspendue":", prévue")});});
  ev.sort(cmp("d",1));
  var h='<h3>'+esc(cname(f.client))+'</h3><p class="why">'+esc(f.design||"")+'</p><dl class="props"><dt>Facture</dt><dd>'+esc(f.num)+"</dd><dt>Société</dt><dd>"+stag(f.soc)+"</dd><dt>Émise le</dt><dd>"+dfr(f.date)+"</dd><dt>Échéance</dt><dd>"+dfr(f.ech)+(f.retard>0?' · <span class="r">'+f.retard+" j de retard</span>":"")+"</dd><dt>Montant</dt><dd>"+F(f.ttc)+" F TTC</dd><dt>Reste dû</dt><dd><b>"+F(f.reste)+" F</b> "+nivPill(f)+"</dd><dt>Risque client</dt><dd>"+rlPill(rk(f.client).lvl)+"</dd></dl>"+
    '<span class="lbl">Historique</span><div class="tl">'+ev.map(function(e){return '<div class="tle"><span class="si '+e.c+'">'+ic(e.i)+"</span><span>"+esc(e.t)+'</span><span class="d">'+dc(e.d)+"</span></div>";}).join("")+"</div>"+
    (f.reste>0?'<span class="lbl">'+(n===3?"Mise en demeure à préparer":"Relance hors calendrier")+'</span><div class="msg">'+esc(txt)+'</div><div class="warn">'+ic("info")+"<span>"+(n===3?"La mise en demeure se décide par la direction. ":"")+'Rien ne part depuis cette page.</span></div><div class="acts"><button class="btn pri" id="dr-copy">'+ic("copy")+"Copier le texte</button></div>":"");
  openDr('<span class="pill '+(n===3?"r":"n")+'">'+ic("file-text")+esc(f.num)+"</span>",h,function(){if($("dr-copy"))$("dr-copy").onclick=function(){copy(txt);};if(focus&&$("dr-copy"))setTimeout(function(){$("dr-copy").scrollIntoView({block:"nearest"});},0);});}

/* ---------- clients à risque ---------- */
function renderRisque(){var C=clients(),R=riskList(),all=C.filter(function(c){return c.mx>0;});
  alertBox("alert-ri");
  function lv(l){return all.filter(function(c){return c.lvl===l;});}
  var r3=lv(3),r2=lv(2),r1=lv(1),ex=function(a){return sum(a.map(function(c){return c.ex;}));};
  $("ri-kpis").innerHTML=[
    kc({l:"Rouge : alerte direction",ico:"siren",ic:"r",v:String(r3.length),u:r3.length>1?"clients":"client",s:M(ex(r3))+" M F exposés",bad:r3.length>0,vs:false}),
    kc({l:"Orange : échéancier",ico:"calendar-clock",ic:"o",v:String(r2.length),u:r2.length>1?"clients":"client",s:M(ex(r2))+" M F exposés",vs:false}),
    kc({l:"Jaune : à surveiller",ico:"eye",ic:"a",v:String(r1.length),u:r1.length>1?"clients":"client",s:M(ex(r1))+" M F exposés",vs:false}),
    kc({l:"Exposition des clients en retard",ico:"hand-coins",ic:"s",v:M(ex(all)),u:"M F",s:pl(all.length,"client")+" · dont "+M(sum(all.map(function(c){return c.late;})))+" M F échus",vs:false})].join("");
  $("ri-lede").innerHTML=r3.length?"<span class=\"r\">"+pl(r3.length,"client")+" au niveau rouge</span> pour "+M(ex(r3))+" M F : "+r3.map(function(c){return esc(cname(c.c));}).join(", ")+". Le niveau se calcule sur les signaux de difficulté : retards qui s'allongent, paiements partiels, chèque rejeté, annonce légale.":"Aucun client au niveau rouge pour ces filtres. Le niveau se calcule sur les signaux de difficulté : retards qui s'allongent, paiements partiels, chèque rejeté, annonce légale.";
  /* exposition par client */
  var E=R.slice(0,10);$("exp-box").style.height=hbarH(E.length)+"px";
  var EB=[["Non échu",GRY,function(f){return f.retard<=0;}],["1 à 30 j",SKY,function(f){return f.retard>0&&f.retard<=30;}],["31 à 60 j",AMB,function(f){return f.retard>30&&f.retard<=60;}],["Plus de 60 j",RED,function(f){return f.retard>60;}]];
  mk("c-exp",{type:"bar",data:{labels:E.map(function(c){return cname(c.c);}),datasets:EB.map(function(b){return {label:b[0],data:E.map(function(c){return sum(c.L.filter(b[2]).map(function(f){return f.reste;}))/1e6;}),backgroundColor:b[1],maxBarThickness:20,borderRadius:3};})},options:{indexAxis:"y",interaction:{mode:"index",intersect:false},plugins:{tooltip:tipM("M F")},scales:{x:Object.assign(axisY(),{stacked:true}),y:{stacked:true,grid:{display:false},ticks:{autoSkip:false,callback:function(v){var l=this.getLabelForValue(v);return l.length>24?l.slice(0,23)+"…":l;}}}}}});
  donut("c-rl",["Rouge","Orange","Jaune","Normal"],[3,2,1,0].map(function(l){return ex(lv(l))/1e6;}),[RED,ACC,AMB,GRN],"M F","rl-v",M(ex(all)),"rl-leg",function(x){return fr(x,1);});
  /* tendance */
  var nM=PER===365?13:6,mo=D.mois.slice(13-nM),TC=all.filter(function(c){return c.lvl>=2;}).sort(function(a,b){return b.score-a.score;}).slice(0,5),cols=[RED,ACC,VIO,SKY,AMB];
  mk("c-trend",{type:"line",data:{labels:mo.map(function(m){var p=m.split("-");return MC[+p[1]-1]+" "+p[0].slice(2);}),datasets:TC.map(function(c,i){return {label:cname(c.c),data:c.r.trend.slice(13-nM),borderColor:cols[i],backgroundColor:cols[i],spanGaps:true,borderWidth:2,pointRadius:3};})},options:{interaction:{mode:"nearest",intersect:false},plugins:{tooltip:{callbacks:{label:function(c){return " "+c.dataset.label+" : "+(c.parsed.y==null?"pas de paiement":fr(c.parsed.y,0)+" j de retard");}}}},scales:{x:axisX(),y:axisY({ticks:{maxTicksLimit:5,callback:function(v){return v+" j";}}})}}});
  $("trend-leg").innerHTML=TC.map(function(c,i){return '<span><i style="background:'+cols[i]+'"></i>'+esc(cname(c.c))+"</span>";}).join("")||'<span>Aucun client orange ou rouge pour ces filtres.</span>';
  $("u-trend").textContent="Jours après l'échéance, par mois de paiement, "+(nM===13?"sur 13 mois":"sur les "+nM+" derniers mois");
  renderHeatR(all);
  /* cartes */
  $("ri-n").textContent=pl(R.length,"client");
  $("ri-list").innerHTML=R.length?R.map(rcard).join(""):'<p class="empty">Aucun client pour ces filtres.</p>';
  bindCl($("ri-list"));
  [].forEach.call($("ri-list").querySelectorAll(".rk"),function(el){el.onclick=function(){openClient(el.dataset.c);};});}
function admBlock(c){var ev=(D.evts[c]||[]).filter(function(e){return e.k==="proc";})[0];if(!ev)return "";
  return '<dl class="adm"><dt>Procédure</dt><dd>'+esc(ev.l)+"</dd><dt>Jugement</dt><dd>"+dfr(ev.jug)+"</dd><dt>Administrateur</dt><dd><b>"+esc(ev.syndic)+"</b></dd><dt>Source</dt><dd>"+esc(ev.src)+"</dd></dl>";}
function rcard(c){var a=action(c.c),r=c.r;
  return '<div class="rk l'+c.lvl+'" data-c="'+esc(c.c)+'"><div class="rk-h">'+av(c.c,"lg")+'<div style="min-width:0"><p class="nm">'+esc(cname(c.c))+'</p><p class="mt2">'+rlPill(c.lvl)+Object.keys(c.socs).map(stag).join("")+"<span>"+pl(c.L.length,"facture")+" · jusqu'à "+c.mx+' j</span></p></div><p class="ex"><b>'+M(c.ex)+'<small> M F</small></b><small>exposés</small></p></div>'+
    '<div class="sigs">'+(r.sig.length?r.sig.map(function(s){var g=SIGI[s.k]||["info",""];return '<div class="sg"><span class="si '+g[1]+'">'+ic(g[0])+"</span><span><b>"+esc(s.l)+"</b> · "+esc(s.d)+"</span></div>";}).join(""):'<div class="sg"><span class="si">'+ic("info")+"</span><span>Aucun signal de difficulté : retards ponctuels, relances en cours.</span></div>")+"</div>"+admBlock(c.c)+
    '<div class="rk-f"><p class="pa">'+ic(a.ico)+esc(a.t)+'</p><button class="btn sm'+(c.lvl===3?" pri":"")+'" data-cl="'+esc(c.c)+'">'+ic("file-text")+"Préparer</button></div></div>";}
function renderHeatR(all){var cl=all.slice().sort(function(a,b){return (b.lvl-a.lvl)||(b.score-a.score);}).map(function(c){return c.c;});
  var others=Object.keys(D.risque).filter(function(k){return cl.indexOf(k)<0&&(!SF||ALL.some(function(f){return f.client===k&&f.soc===SF;}));});cl=cl.concat(others);
  var SCL=["#ECFDF5","#D1FAE5","#FEF3C7","#FDE68A","#FDBA74","#F87171","#DC2626"];
  function lvl(v){return v<=0?0:v<=10?1:v<=20?2:v<=35?3:v<=50?4:v<=75?5:6;}
  var h='<div class="hmg" style="grid-template-columns:minmax(150px,1.6fr) repeat(13,minmax(34px,1fr))"><span></span>'+D.mois.map(function(m){var p=m.split("-");return '<span class="rh">'+MC[+p[1]-1].replace(".","")+(p[1]==="01"||m===D.mois[0]?" "+p[0].slice(2):"")+"</span>";}).join("");
  cl.forEach(function(c){var t=rk(c).trend;h+='<span class="rn" title="'+esc(cname(c))+'">'+esc(cname(c))+"</span>";
    t.forEach(function(v,i){var p=D.mois[i].split("-"),lab=MOIS[+p[1]-1]+" "+p[0];
      if(v==null)h+='<span class="rc na" data-tip="'+esc("<b>"+esc(cname(c))+"</b><br>"+lab+" : aucun paiement")+'"></span>';
      else{var l=lvl(v);h+='<span class="rc'+(l>=5?" dk":"")+'" style="background:'+SCL[l]+'" data-tip="'+esc("<b>"+esc(cname(c))+"</b><br>"+lab+" : "+(v<=0?"payé à l'échéance ou en avance":v+" j de retard moyen"))+'">'+(v>0?v:"")+"</span>";}});});
  $("hmr").innerHTML=h+"</div>";
  $("hmr-leg").innerHTML='<span>À l\'heure</span><span class="scale">'+SCL.map(function(c){return '<i style="background:'+c+'"></i>';}).join("")+'</span><span>Plus de 75 j</span><span style="margin-left:10px"><i class="nai"></i>Aucun paiement</span>';}
function openClient(c){var C=clients().filter(function(x){return x.c===c;})[0];
  if(!C){var L=D.factures.filter(function(f){return f.client===c&&f.reste>0;});C={c:c,L:L,ex:sum(L.map(function(f){return f.reste;})),socs:{},lvl:rk(c).lvl,r:rk(c),mx:0};L.forEach(function(f){C.socs[f.soc]=1;});}
  var a=action(c),txt=actTxt(C,a.m),ev=(D.evts[c]||[]).slice(),r=C.r;
  ALL.filter(function(f){return f.client===c;}).forEach(function(f){f.pays.forEach(function(p){if(p.date>=addd(T,-120))ev.push({date:p.date,k:"pay",l:"Paiement "+F(p.mt)+" F sur "+f.num+" ("+p.mode.toLowerCase()+")"});});});
  ev.sort(cmp("date",-1));
  var KI={proc:["gavel","r"],cheque:["ban","r"],delai:["calendar-clock","o"],pay:["banknote","g"]};
  var lab={crea:"Déclaration de créance",med:"Mise en demeure",ech:"Proposition d'échéancier",rel:"Message au client"}[a.m];
  var h='<h3>'+esc(cname(c))+'</h3><p class="why">'+esc(a.t)+'.</p><dl class="props"><dt>Niveau</dt><dd>'+rlPill(C.lvl)+" "+esc(RL[C.lvl][2])+"</dd><dt>Exposition</dt><dd><b>"+F(C.ex)+" F</b> sur "+pl(C.L.length,"facture")+"</dd><dt>Sociétés</dt><dd>"+Object.keys(C.socs).map(stag).join(" ")+"</dd><dt>Retard moyen</dt><dd>"+(r.avant!=null?r.avant+" j jusqu'en mai, "+r.depuis+" j depuis juin":"")+"</dd></dl>"+admBlock(c)+
    (r.sig.length?'<span class="lbl">Signaux de difficulté</span><div class="sigs" style="padding:0">'+r.sig.map(function(s){var g=SIGI[s.k]||["info",""];return '<div class="sg"><span class="si '+g[1]+'">'+ic(g[0])+"</span><span><b>"+esc(s.l)+"</b> · "+esc(s.d)+"</span></div>";}).join("")+"</div>":"")+
    (ev.length?'<span class="lbl">Derniers événements</span><div class="tl">'+ev.slice(0,8).map(function(e){var g=KI[e.k]||["info",""];return '<div class="tle"><span class="si '+g[1]+'">'+ic(g[0])+"</span><span>"+esc(e.l)+'</span><span class="d">'+dc(e.date)+"</span></div>";}).join("")+"</div>":"")+
    '<span class="lbl">'+lab+'</span><div class="msg">'+esc(txt)+'</div><div class="warn">'+ic("info")+"<span>"+(C.lvl===3?"Décision de la direction. ":"")+'Rien ne part depuis cette page.</span></div><div class="acts"><button class="btn pri" id="dr-copy">'+ic("copy")+"Copier le texte</button></div>";
  openDr('<span class="pill '+RL[C.lvl][0]+'">'+ic("shield-alert")+"Risque "+RL[C.lvl][1].toLowerCase()+"</span>",h,function(){$("dr-copy").onclick=function(){copy(txt);};});}

/* ---------- relances ---------- */
function RELS(){return D.relances.filter(function(r){return inS(r.soc)&&(!VF.rc||r.canal===VF.rc);});}
function renderRel(){var A=RELS(),w=win(),pw=prevWin(),B=buckets();
  var S=A.filter(function(r){return r.st==="envoyee"&&r.date>=w[0]&&r.date<=w[1];}),SP=A.filter(function(r){return r.st==="envoyee"&&r.date>=pw[0]&&r.date<=pw[1];});
  var paid=sum(S.map(function(r){return r.paye;})),paidP=sum(SP.map(function(r){return r.paye;}));
  var tx=S.length?S.filter(function(r){return r.paye>0;}).length/S.length*100:0,txP=SP.length?SP.filter(function(r){return r.paye>0;}).length/SP.length*100:null;
  var up=A.filter(function(r){return r.st!=="envoyee"&&r.date>T&&r.date<=addd(T,30);}),sus=up.filter(function(r){return r.st==="suspendue";});
  $("re-kpis").innerHTML=[
    kc({l:"Relances envoyées "+perTxt(),ico:"send",ic:"s",v:String(S.length),h:B.map(function(b){return A.filter(function(r){return r.st==="envoyee"&&r.date>=b.a&&r.date<=b.b;}).length;}),col:SKY,dl:delta(SP.length,S.length,null,"",0)}),
    kc({l:"Payé après relance",ico:"banknote",ic:"g",v:M(paid),u:"M F",h:B.map(function(b){return sum(A.filter(function(r){return r.st==="envoyee"&&r.date>=b.a&&r.date<=b.b;}).map(function(r){return r.paye;}))/1e6;}),col:GRN,dl:delta(paidP/1e6,paid/1e6,false," M")}),
    kc({l:"Relances suivies d'un paiement",ico:"circle-check-big",ic:"v",v:S.length?fr(tx,0):"0",u:"%",dl:txP!==null&&S.length?delta(txP,tx,false," pt",0):"",s:"paiement total ou partiel"}),
    kc({l:"À venir sur 30 jours",ico:"calendar-days",v:String(up.length),u:up.length>1?"relances":"relance",s:sus.length?pl(sus.length,"suspendue")+" : procédure collective":"aucune suspendue",vs:false})].join("");
  $("re-lede").innerHTML="Les relances partent seules à <b>J+15, J+30, J+45 et J+60</b> après l'échéance, par e-mail ou WhatsApp selon la fiche du client. "+pl(S.length,"relance")+" "+(S.length>1?"sont parties":"est partie")+" "+perTxt()+", suivies de <b>"+M(paid)+" M F</b> de paiements. "+pl(up.length,"relance")+" "+(up.length>1?"sont prévues":"est prévue")+" sur les 30 prochains jours.";
  /* frise */
  var ST=[["calendar","Échéance","La facture arrive à échéance",null],["mail","J+15","Rappel courtois",15],["mail-warning","J+30","Relance",30],["calendar-clock","J+45","Relance ferme, échéancier proposé",45],["siren","J+60","Dernier rappel, dossier à la direction",60]];
  var soon=OPEN().filter(function(f){return f.ech>T&&f.ech<=addd(T,30);}).length;
  $("steps").innerHTML=ST.map(function(s,i){var c=s[3]?up.filter(function(r){return r.j===s[3];}).length:soon,sent=s[3]?S.filter(function(r){return r.j===s[3];}).length:null;
    return '<div class="st s'+(i+1)+'"><span class="pt">'+ic(s[0])+'</span><p class="n">'+s[1]+'</p><p class="d">'+s[2]+'</p><p class="c"><span class="pill n">'+(s[3]?c+" à venir":c+" échéances à 30 j")+"</span>"+(sent!==null?'<span class="pill b">'+sent+" envoyées</span>":"")+"</p></div>";}).join("");
  /* entonnoir */
  var EV=A.filter(function(r){return r.st==="envoyee";}),base=EV.filter(function(r){return r.j===15;}).length||1;
  $("u-fun").textContent="Factures relancées à chaque étape, depuis "+dc(EV.length?EV.map(function(r){return r.date;}).sort()[0]:T)+" · part payée ensuite";
  var FC=[SKY,AMB,ACC,RED];
  $("fun").innerHTML=STEPJ.map(function(j,i){var X=EV.filter(function(r){return r.j===j;}),p=X.filter(function(r){return r.paye>0;}).length;
    return '<div class="fu"><span class="k">J+'+j+'</span><div><div class="b" style="width:'+Math.max(30,X.length/base*100).toFixed(1)+"%;background:"+FC[i]+'" data-tip="'+esc("<b>J+"+j+"</b><br>"+pl(X.length,"facture")+" relancée"+(X.length>1?"s":"")+"<br>"+p+" payée"+(p>1?"s":"")+" ensuite")+'"><span>'+X.length+"</span><small>"+(X.length?Math.round(p/X.length*100):0)+"\u00a0% payées</small></div></div></div>";}).join("")+'<p class="fu-n">Plus la relance est tardive, moins elle est suivie d\'un paiement : la relance de J+15 reste la plus efficace.</p>';
  /* payé après chaque relance */
  mk("c-pr",{type:"bar",data:{labels:STEPJ.map(function(j){return "J+"+j;}),datasets:[["email","E-mail",SKY],["whatsapp","WhatsApp",GRN]].map(function(c){return {label:c[1],data:STEPJ.map(function(j){return sum(S.filter(function(r){return r.j===j&&r.canal===c[0];}).map(function(r){return r.paye;}))/1e6;}),backgroundColor:c[2],maxBarThickness:28};})},options:{interaction:{mode:"index",intersect:false},plugins:{tooltip:tipM("M F")},scales:{x:axisX(),y:axisY()}}});
  $("u-pr").textContent="Relances envoyées "+perTxt()+", en M FCFA";
  var em=S.filter(function(r){return r.canal==="email";}).length,wa=S.length-em;
  $("u-can").textContent="Relances envoyées "+perTxt();
  donut("c-can",["E-mail","WhatsApp"],[em,wa],[SKY,GRN],"","can-v",String(S.length),"can-leg",function(x){return String(x);});
  renderCal(A);renderTx();renderRj(A);}
function renderCal(A){var P=A.filter(function(r){return r.st!=="envoyee"&&r.date>T&&r.date<=addd(T,28);}).sort(cmp("date",1));
  $("u-cal").textContent=pl(P.length,"relance")+" du "+dc(addd(T,1))+" au "+dc(addd(T,28))+". Elles partent seules, sauf si la facture est soldée avant.";
  var h="";for(var k=0;k<4;k++){var a=addd(T,1+7*k),b=addd(a,6),W=P.filter(function(r){return r.date>=a&&r.date<=b;});
    h+='<div class="cw"><div class="cw-h"><b>Semaine du '+dc(a)+"</b><small>"+(W.length?M(sum(W.map(function(r){return r.du;})))+" M F · "+W.length:"0")+'</small></div><div class="cw-b">'+(W.length?W.slice(0,6).map(function(r){var d=dd(r.date);
      return '<button class="ce'+(r.st==="suspendue"?" sus":"")+'" data-f="'+esc(r.num)+'"><span class="dt">'+JOURS[d.getUTCDay()].slice(0,3)+"<b>"+d.getUTCDate()+'</b></span><span class="nm">'+esc(cname(r.client))+'</span><span class="mt2"><span class="jb j'+r.j+'">J+'+r.j+'</span><span class="tag '+(r.canal==="whatsapp"?"wa":"em")+'">'+ic(r.canal==="whatsapp"?"message-circle":"mail")+(r.canal==="whatsapp"?"WhatsApp":"E-mail")+"</span>"+(r.st==="suspendue"?"suspendue":M(r.du,2)+" M")+"</span></button>";}).join("")+(W.length>6?'<p class="cw-e">et '+(W.length-6)+" autres</p>":""):'<p class="cw-e">Aucune relance</p>')+"</div></div>";}
  $("cal").innerHTML=h;
  [].forEach.call($("cal").querySelectorAll("[data-f]"),function(b){b.onclick=function(){openFact(b.dataset.f);};});}
function renderTx(){
  $("tx-j").innerHTML=STEPJ.map(function(j){return '<button class="'+(TXJ===j?"on":"")+'" data-j="'+j+'">J+'+j+"</button>";}).join("");
  $("tx-c").innerHTML=[["email","mail","E-mail"],["whatsapp","message-circle","WhatsApp"]].map(function(c){return '<button class="'+(TXC===c[0]?"on":"")+'" data-c="'+c[0]+'">'+ic(c[1])+c[2]+"</button>";}).join("");
  [].forEach.call($("tx-j").children,function(b){b.onclick=function(){TXJ=+b.dataset.j;renderTx();};});
  [].forEach.call($("tx-c").children,function(b){b.onclick=function(){TXC=b.dataset.c;renderTx();};});
  var O=OPEN().filter(function(f){return (D.canal[f.client]||"email")===TXC;}),f=O.filter(function(x){return x.retard>=TXJ;}).sort(function(a,b){return a.retard-b.retard;})[0]||O[0]||OPEN()[0];
  if(!f){$("tx").innerHTML='<p class="empty">Aucune facture ouverte pour ces filtres.</p>';return;}
  var t=relTxt(f,TXJ,TXC),wa=TXC==="whatsapp";
  $("tx").innerHTML='<div>'+(wa?'<div class="bub">'+esc(t)+"</div>":'<div class="msg">'+esc(t)+"</div>")+'</div><div class="txm"><p>Exemple rempli avec une facture concernée. Envoi automatique, sans action de votre part.</p><dl><dt>Client</dt><dd>'+esc(cname(f.client))+"</dd><dt>Facture</dt><dd>"+esc(f.num)+"</dd><dt>Société</dt><dd>"+esc(f.soc)+"</dd><dt>Échéance</dt><dd>"+dfr(f.ech)+"</dd><dt>Part le</dt><dd>"+dfr(addd(f.ech,TXJ))+"</dd><dt>Canal</dt><dd>"+(wa?"WhatsApp":"E-mail")+'</dd></dl><button class="btn sm" id="tx-copy" style="margin-top:14px">'+ic("copy")+"Copier le modèle</button></div>";
  $("tx-copy").onclick=function(){copy(t,"Modèle copié");};}
function renderRj(A){var q=QR.trim().toLowerCase(),s=SORT.rj;
  var segs=[["all","Toutes"],["envoyee","Envoyées"],["prevue","Prévues"],["suspendue","Suspendues"]];
  $("seg-rst").innerHTML=segs.map(function(x){var c=A.filter(function(r){return x[0]==="all"||r.st===x[0];}).length;return '<button class="'+(RST===x[0]?"on":"")+'" data-s="'+x[0]+'">'+x[1]+' <span class="c">'+c+"</span></button>";}).join("");
  [].forEach.call($("seg-rst").children,function(b){b.onclick=function(){RST=b.dataset.s;MORE.rj=12;renderRj(RELS());};});
  var L=A.filter(function(r){return (RST==="all"||r.st===RST)&&(!q||(r.client+" "+r.num).toLowerCase().indexOf(q)>=0);}).sort(cmp(s.k,s.d));
  $("rj-n").textContent=pl(L.length,"relance");
  var SP={envoyee:["g","Envoyée"],prevue:["b","Prévue"],suspendue:["n","Suspendue"]};
  $("t-rj").innerHTML=sortTh([["Date",0,"date",1],["Client et facture",0,"client",1],["Société",0,"soc",1],["Étape",0,"j",1],["Canal",0,null,1],["Statut",0,null,1],["Montant dû",0,"du"],["Payé ensuite",0,"paye"]],s)+"<tbody>"+L.slice(0,MORE.rj).map(function(r){var p=SP[r.st];
    return '<tr class="click" data-f="'+esc(r.num)+'"><td class="l" data-l="Date">'+dc(r.date)+" "+r.date.slice(0,4)+'</td><td class="l" data-l="Client"><div class="cl">'+av(r.client,"sm")+'<div style="min-width:0"><p class="nm">'+esc(cname(r.client))+'</p><p class="mt2">'+esc(r.num)+'</p></div></div></td><td class="l" data-l="Société">'+stag(r.soc)+'</td><td class="l" data-l="Étape"><span class="jb j'+r.j+'">J+'+r.j+'</span></td><td class="l" data-l="Canal"><span class="tag '+(r.canal==="whatsapp"?"wa":"em")+'">'+ic(r.canal==="whatsapp"?"message-circle":"mail")+(r.canal==="whatsapp"?"WhatsApp":"E-mail")+'</span></td><td class="l" data-l="Statut"><span class="pill '+p[0]+'">'+p[1]+'</span></td><td data-l="Montant dû">'+F(r.du)+'</td><td data-l="Payé ensuite">'+(r.st==="envoyee"?(r.paye?pbar(r.paye,r.du,GRN)+'<small class="hint"> le '+dc(r.paye_le)+"</small>":'<span class="hint">rien encore</span>'):'<span class="hint">à venir</span>')+"</td></tr>";}).join("")+(L.length?"":'<tr><td colspan="8"><p class="empty">Aucune relance pour ces filtres.</p></td></tr>')+"</tbody>";
  bindSort("t-rj","rj",function(){renderRj(RELS());});
  [].forEach.call($("t-rj").querySelectorAll("tr[data-f]"),function(tr){tr.onclick=function(){openFact(tr.dataset.f);};});
  moreBtn("rj-more","rj",L.length,function(){renderRj(RELS());});}

/* ---------- FNE ---------- */
var FST_L={ok:["g","Conforme","circle-check-big"],sans:["r","Sans référence","file-x"],ecart:["o","Écart de montant","scale"],pdf:["a","PDF introuvable","file-search"]};
function fneDesc(f){if(f.fne_st==="sans")return "Aucune référence FNE trouvée pour cette facture émise dans Sage.";if(f.fne_st==="ecart")return "Montant certifié "+F(f.fne_mt)+" F, montant Sage "+F(f.ttc)+" F, écart de "+F(f.ttc-f.fne_mt)+" F.";if(f.fne_st==="pdf")return "Référence "+f.fne+" présente, PDF certifié absent du dossier Drive de la société.";return "Référence, montant et PDF vérifiés.";}
function renderFne(){var L=FA(),w=win(),pw=prevWin(),B=buckets();
  var W=L.filter(function(f){return f.date>=w[0]&&f.date<=w[1];}),WP=L.filter(function(f){return f.date>=pw[0]&&f.date<=pw[1];});
  var ok=W.filter(function(f){return f.fne_st==="ok";}).length,okP=WP.filter(function(f){return f.fne_st==="ok";}).length,pc=W.length?ok/W.length*100:0,pcP=WP.length?okP/WP.length*100:null;
  var AN=L.filter(function(f){return f.fne_st!=="ok";}),sans=AN.filter(function(f){return f.fne_st==="sans";}),oth=AN.filter(function(f){return f.fne_st!=="sans";});
  $("fn-kpis").innerHTML=[
    kc({l:"Factures émises "+perTxt(),ico:"files",ic:"s",v:String(W.length),h:B.map(function(b){return L.filter(function(f){return f.date>=b.a&&f.date<=b.b;}).length;}),col:SKY,dl:delta(WP.length,W.length,null,"",0)}),
    kc({l:"Conformes FNE",ico:"badge-check",ic:"g",v:W.length?fr(pc,0):"0",u:"%",dl:pcP!==null&&W.length?delta(pcP,pc,false," pt",0):"",s:ok+" sur "+W.length}),
    kc({l:"Sans référence FNE",ico:"file-x",ic:"r",v:String(sans.length),u:sans.length>1?"factures":"facture",s:M(sum(sans.map(function(f){return f.ttc;})),2)+" M F TTC à certifier",bad:sans.length>0,vs:false}),
    kc({l:"Écarts et PDF manquants",ico:"file-warning",ic:"o",v:String(oth.length),u:oth.length>1?"factures":"facture",s:oth.filter(function(f){return f.fne_st==="ecart";}).length+" écart"+(oth.filter(function(f){return f.fne_st==="ecart";}).length>1?"s":"")+" de montant · "+oth.filter(function(f){return f.fne_st==="pdf";}).length+" PDF",vs:false})].join("");
  $("fn-lede").innerHTML="Chaque facture émise dans Sage est comparée à la plateforme FNE : référence présente, montant certifié égal, PDF rangé dans le Drive. "+(SF||"Le groupe")+" a <span class=\""+(sans.length?"r":"")+"\">"+pl(sans.length,"facture")+" sans référence</span> et "+pl(oth.length,"autre anomalie","autres anomalies")+" à régulariser.";
  gauge("c-fg",pc,100,pc>=95?GRN:pc>=80?AMB:RED,"fg-v",W.length?fr(pc,0)+"\u00a0%":"Aucune","fg-s",W.length?ok+" conformes sur "+W.length:"facture "+perTxt());
  $("u-fg").textContent="Factures émises "+perTxt();
  var SS=SF?[SF]:SOCS;$("fs-box").style.height=hbarH(SS.length)+"px";
  mk("c-fs",{type:"bar",data:{labels:SS,datasets:[["ok",GRN],["sans",RED],["ecart",ACC],["pdf",AMB]].map(function(k){return {label:FST_L[k[0]][1],data:SS.map(function(s){return W.filter(function(f){return f.soc===s&&f.fne_st===k[0];}).length;}),backgroundColor:k[1],maxBarThickness:20,borderRadius:3};})},options:{indexAxis:"y",interaction:{mode:"index",intersect:false},plugins:{tooltip:{callbacks:{label:function(c){return " "+c.dataset.label+" : "+c.parsed.x;}}}},scales:{x:Object.assign(axisY({ticks:{precision:0,maxTicksLimit:5}}),{stacked:true}),y:{stacked:true,grid:{display:false}}}}});
  $("u-fs").textContent="Nombre de factures émises "+perTxt();
  $("u-fm").textContent="Nombre de factures, "+bLab();
  mk("c-fm",{type:"bar",data:{labels:B.map(function(b){return b.l;}),datasets:[{label:"Émises dans Sage",data:B.map(function(b){return L.filter(function(f){return f.date>=b.a&&f.date<=b.b;}).length;}),backgroundColor:GRY,maxBarThickness:24},{label:"Avec référence FNE",data:B.map(function(b){return L.filter(function(f){return f.date>=b.a&&f.date<=b.b&&f.fne;}).length;}),backgroundColor:GRN,maxBarThickness:24}]},options:{interaction:{mode:"index",intersect:false},scales:{x:axisX(),y:axisY({ticks:{precision:0,maxTicksLimit:5}})}}});
  /* anomalies */
  $("fa-n").textContent=pl(AN.length,"facture")+", toutes périodes";
  $("fn-anom").innerHTML=AN.length?AN.sort(function(a,b){return ["sans","ecart","pdf"].indexOf(a.fne_st)-["sans","ecart","pdf"].indexOf(b.fne_st)||(a.date<b.date?1:-1);}).map(function(f){var s=FST_L[f.fne_st];
    return '<button class="row" data-fn="'+esc(f.num)+'"><span class="ty '+(f.fne_st==="sans"?"late":f.fne_st==="ecart"?"o":"a")+'">'+ic(s[2])+'</span><div style="min-width:0"><p class="tt">'+esc(f.num)+" · "+esc(cname(f.client))+'</p><span class="mm">'+esc(fneDesc(f))+'</span></div><span class="rr"><span class="amt">'+F(f.ttc)+' F</span><span class="pill '+s[0]+'">'+s[1]+"</span></span></button>";}).join(""):'<p class="empty">Aucune anomalie pour ces filtres.</p>';
  [].forEach.call($("fn-anom").querySelectorAll("[data-fn]"),function(b){b.onclick=function(){openFne(b.dataset.fn);};});
  renderFnTbl(W);}
function renderFnTbl(W){var q=QN.trim().toLowerCase(),s=SORT.fn;
  var segs=[["all","Toutes"],["ok","Conformes"],["sans","Sans référence"],["ecart","Écart"],["pdf","PDF introuvable"]];
  $("seg-fst").innerHTML=segs.map(function(x){var c=W.filter(function(f){return x[0]==="all"||f.fne_st===x[0];}).length;return '<button class="'+(FST===x[0]?"on":"")+'" data-s="'+x[0]+'">'+x[1]+' <span class="c">'+c+"</span></button>";}).join("");
  [].forEach.call($("seg-fst").children,function(b){b.onclick=function(){FST=b.dataset.s;MORE.fn=12;renderFne();};});
  var L=W.filter(function(f){return (FST==="all"||f.fne_st===FST)&&(!q||(f.num+" "+f.client+" "+(f.fne||"")).toLowerCase().indexOf(q)>=0);}).sort(cmp(s.k,s.d));
  $("fl-n").textContent=pl(W.length,"facture")+" "+perTxt();
  $("t-fn").innerHTML=sortTh([["Facture",0,"num",1],["Émise le",0,"date",1],["Société",0,"soc",1],["Montant Sage",0,"ttc"],["Référence FNE",0,null,1],["Montant certifié",0,null],["PDF",0,null,1],["Contrôle",0,null,1]],s)+"<tbody>"+L.slice(0,MORE.fn).map(function(f){var st=FST_L[f.fne_st];
    return '<tr class="click" data-fn="'+esc(f.num)+'"><td class="l" data-l="Facture"><div class="cl">'+av(f.client,"sm")+'<div style="min-width:0"><p class="nm">'+esc(f.num)+'</p><p class="mt2">'+esc(cname(f.client))+'</p></div></div></td><td class="l" data-l="Émise le">'+dc(f.date)+'</td><td class="l" data-l="Société">'+stag(f.soc)+'</td><td data-l="Montant Sage">'+F(f.ttc)+'</td><td class="l" data-l="Référence FNE">'+(f.fne?'<span class="ref">'+esc(f.fne)+"</span>":'<span class="ref no">'+ic("x")+"absente</span>")+'</td><td data-l="Montant certifié">'+(f.fne_mt!=null?'<span class="'+(f.fne_st==="ecart"?"r":"")+'">'+F(f.fne_mt)+"</span>":'<span class="hint">sans objet</span>')+'</td><td class="l" data-l="PDF">'+(f.fne_pdf?'<span class="tag">'+ic("file-check")+"Drive</span>":'<span class="hint">absent</span>')+'</td><td class="l" data-l="Contrôle"><span class="pill '+st[0]+'">'+st[1]+"</span></td></tr>";}).join("")+(L.length?"":'<tr><td colspan="8"><p class="empty">Aucune facture pour ces filtres.</p></td></tr>')+"</tbody>";
  bindSort("t-fn","fn",renderFne);
  [].forEach.call($("t-fn").querySelectorAll("tr[data-fn]"),function(tr){tr.onclick=function(){openFne(tr.dataset.fn);};});
  moreBtn("fn-more","fn",L.length,renderFne);}
function openFne(num){var f=factBy(num);if(!f)return;var s=FST_L[f.fne_st];
  var txt=f.fne_st==="ok"?"":"Objet : Régularisation FNE · facture "+f.num+"\n\nBonjour,\n\nLe contrôle du "+dfr(T)+" relève l'anomalie suivante sur la facture "+f.num+" du "+dfr(f.date)+" ("+cname(f.client)+", "+F(f.ttc)+" F CFA TTC) : "+fneDesc(f).toLowerCase()+"\n\nMerci de "+(f.fne_st==="sans"?"certifier la facture sur la plateforme FNE et de reporter la référence dans Sage":f.fne_st==="ecart"?"vérifier le montant et, si besoin, émettre un avoir et une nouvelle facture certifiée":"télécharger le PDF certifié depuis la plateforme FNE et le ranger dans le dossier Drive de "+f.soc)+".\n\nCordialement,\nContrôle de gestion · "+f.soc;
  var h='<h3>'+esc(f.num)+'</h3><p class="why">'+esc(fneDesc(f))+'</p><dl class="props"><dt>Client</dt><dd>'+esc(cname(f.client))+"</dd><dt>Société</dt><dd>"+stag(f.soc)+"</dd><dt>Émise le</dt><dd>"+dfr(f.date)+"</dd><dt>Montant Sage</dt><dd>"+F(f.ttc)+" F TTC</dd><dt>Référence FNE</dt><dd>"+(f.fne?esc(f.fne):'<span class="r">absente</span>')+"</dd><dt>Montant certifié</dt><dd>"+(f.fne_mt!=null?F(f.fne_mt)+" F":"sans objet")+"</dd><dt>PDF certifié</dt><dd>"+(f.fne_pdf?"rangé dans le Drive":'<span class="r">absent</span>')+"</dd><dt>Contrôle</dt><dd><span class=\"pill "+s[0]+"\">"+s[1]+"</span></dd></dl>"+
    (txt?'<span class="lbl">Demande de régularisation</span><div class="msg">'+esc(txt)+'</div><div class="warn">'+ic("info")+'<span>Rien ne part depuis cette page.</span></div><div class="acts"><button class="btn pri" id="dr-copy">'+ic("copy")+"Copier la demande</button></div>":"");
  openDr('<span class="pill '+s[0]+'">'+ic(s[2])+"FNE</span>",h,function(){if($("dr-copy"))$("dr-copy").onclick=function(){copy(txt,"Demande copiée");};});}

/* ---------- trésorerie ---------- */
function renderTreso(){var n=scope(),s=soc(n),T13=D.treso[n],fv=fin(n),pb=Math.min.apply(null,fv),wk=D.semaines[fv.indexOf(pb)];
  var low=SOCS.filter(function(x){return soc(x).sem_sous>0;});
  $("tr-lede").innerHTML=(SF||"Le groupe")+" dispose de <b>"+M(s.treso)+" M F</b> au "+dfr(T)+". Sur 13 semaines, le point bas est de <b>"+M(pb)+" M F</b> la semaine du "+dc(wk)+", pour un seuil d'alerte de "+M(s.seuil)+" M F."+(SF?(s.sem_sous?' <span class="r">'+pl(s.sem_sous,"semaine")+" sous le seuil.</span>":" Aucune semaine sous le seuil."):(low.length?' <span class="r">'+low.map(function(x){return x+" ("+pl(soc(x).sem_sous,"semaine")+")";}).join(" et ")+" sous le seuil.</span>":""))+" Les factures en retard de plus de 90 jours sont exclues de la prévision.";
  $("mult").innerHTML=["Groupe"].concat(SOCS).map(function(x){var sx=soc(x),f=fin(x),lw=sx.sem_sous>0;
    return '<button class="mc'+((SF||"Groupe")===x?" on":"")+'" data-soc="'+esc(x)+'"><p class="h">'+(x==="Groupe"?'<span class="ti">'+ic("building-2")+"</span>":tile(x))+esc(x)+'</p><p class="v">'+M(sx.treso)+'<small>M F</small></p><p class="s'+(lw?" bad":"")+'">point bas '+M(sx.point_bas)+" M"+(lw?" · "+sx.sem_sous+" sem. sous le seuil":"")+"</p>"+spark(f,lw?RED:(SC[x]||ACC),sx.seuil)+"</button>";}).join("");
  [].forEach.call($("mult").querySelectorAll(".mc"),function(b){b.onclick=function(){var x=b.dataset.soc;pick(x==="Groupe"?null:x);};});
  $("tr2-title").textContent="Encaissements, décaissements et solde · "+(SF||"groupe");
  var enc=T13["Total encaissements"].slice(0,13).map(function(x){return x/1e6;}),dec=T13["Total décaissements"].slice(0,13).map(function(x){return -x/1e6;}),thr=s.seuil/1e6;
  mk("c-treso2",{type:"bar",data:{labels:D.semaines.map(dc),datasets:[{type:"line",label:"Solde de fin",data:fv.map(function(x){return x/1e6;}),borderColor:ACC,backgroundColor:"rgba(233,91,15,.08)",fill:false,borderWidth:2.2,pointRadius:fv.map(function(v){return v<s.seuil?4:2;}),pointBackgroundColor:fv.map(function(v){return v<s.seuil?RED:ACC;}),order:0},{type:"line",label:"Seuil d'alerte",data:fv.map(function(){return thr;}),borderColor:RED,borderDash:[5,4],borderWidth:1.5,pointRadius:0,order:1},{label:"Encaissements",data:enc,backgroundColor:GRN,maxBarThickness:22,order:2},{label:"Décaissements",data:dec,backgroundColor:GRY,maxBarThickness:22,order:3}]},options:{interaction:{mode:"index",intersect:false},plugins:{tooltip:{callbacks:{label:function(c){return " "+c.dataset.label+" : "+fr(Math.abs(c.parsed.y),1)+" M F";}}}},scales:{x:axisX({stacked:true}),y:axisY({beginAtZero:true,ticks:{maxTicksLimit:6,callback:function(v){return fr(v);}}})}}});
  $("flux-u").textContent=(SF||"Groupe")+", en francs CFA";
  var rows=Object.keys(T13),tot={"Solde de début":1,"Total encaissements":1,"Total décaissements":1,"Solde de fin":1};
  $("t-flux").innerHTML="<thead><tr><th>Ligne</th>"+D.semaines.map(function(w){return "<th>"+dc(w)+"</th>";}).join("")+"<th>Total</th></tr></thead><tbody>"+rows.map(function(r){var v=T13[r];
    return '<tr class="'+(tot[r]?"t":"")+'"><td>'+esc(r)+"</td>"+v.map(function(x,i){var lw=r==="Solde de fin"&&i<13&&x<s.seuil;return '<td class="'+(lw?"low":"")+'">'+F(x)+"</td>";}).join("")+"</tr>";}).join("")+"</tbody>";}

/* ---------- achats ---------- */
function orders(n){var o={},L=[];D.cmd.forEach(function(c){if(n&&n!=="Groupe"&&c.soc!==n)return;if(VF.ac&&c.four!==VF.ac)return;var k=c.no+"|"+c.soc;
  if(!o[k]){o[k]={no:c.no,soc:c.soc,four:c.four,etape:c.etape,arr:c.arr,pay:c.pay,cde:c.cde,lines:[],mt:0,alertes:[]};L.push(o[k]);}
  o[k].lines.push(c);o[k].mt+=c.mt;if(c.alerte&&o[k].alertes.indexOf(c.alerte)<0)o[k].alertes.push(c.alerte);});return L;}
function eng(n){var oo=orders(n).filter(function(o){return o.etape!=="Reçu";});
  var route=sum(oo.filter(function(o){return o.pay;}).map(function(o){return o.mt;})),apayer=sum(oo.filter(function(o){return !o.pay;}).map(function(o){return o.mt;}));
  var A=D.achats.filter(function(a){return (n==="Groupe"||a.soc===n)&&(!VF.ac||a.four===VF.ac);}),lancer=sum(A.map(function(a){return a.m;}));
  var s=soc(n);return {oo:oo,A:A,route:route,apayer:apayer,lancer:lancer,du:apayer+lancer,total:route+apayer+lancer,marge:s.point_bas-apayer-lancer-s.seuil};}
var ETP=["Proforma attendue","Proforma à payer","Payée, en préparation","Expédiée","Reçu"];
function renderAchats(){var n=scope(),E=eng(n),s=soc(n);
  var short=SOCS.filter(function(x){var e=eng(x);return e.marge<0&&e.du>0;});
  $("ac-lede").innerHTML=(SF||"Le groupe")+" a <b>"+M(E.total)+" M F</b> d'engagements d'achat"+(VF.ac?" chez "+esc(VF.ac):"")+" : "+M(E.route)+" M F de commandes payées et en route, "+M(E.apayer)+" M F de commandes encore à payer et <b>"+M(E.lancer)+" M F</b> d'achats à lancer pour reconstituer le stock."+
    (short.length&&!SF?' <span class="r">'+short.join(" et ")+" ne "+(short.length>1?"peuvent":"peut")+" pas tout payer sans passer sous "+(short.length>1?"leur":"son")+" seuil.</span>":(SF&&E.marge<0&&E.du?' <span class="r">'+SF+" ne peut pas tout payer sans passer sous son seuil de "+M(s.seuil)+" M F.</span>":""));
  $("ac-kpis").innerHTML=[
    kc({l:"Commandes en route",ico:"ship",ic:"s",v:M(E.route),u:"M F",s:pl(E.oo.filter(function(o){return o.pay;}).length,"commande")+" déjà payée"+(E.oo.filter(function(o){return o.pay;}).length>1?"s":""),vs:false}),
    kc({l:"Commandes à payer",ico:"banknote",ic:"o",v:M(E.apayer),u:"M F",s:pl(E.oo.filter(function(o){return !o.pay;}).length,"proforma"),vs:false}),
    kc({l:"Achats à lancer",ico:"shopping-cart",ic:"v",v:M(E.lancer),u:"M F",s:pl(E.A.length,"article")+" sous le seuil",vs:false}),
    kc({l:"Marge après achats",ico:"scale",ic:E.marge<0&&E.du?"r":"g",v:M(E.marge),u:"M F",s:"point bas moins reste à payer et seuil",bad:E.marge<0&&E.du,vs:false})].join("");
  var mx=Math.max.apply(null,SOCS.map(function(x){return Math.max(soc(x).point_bas,soc(x).seuil,eng(x).du);}));
  $("cover").innerHTML='<div class="cv-leg"><span><i style="background:'+GRY+'"></i>Point bas de trésorerie</span><span><i style="background:'+ACC+'"></i>Reste à payer sur achats</span><span><i style="background:'+RED+';width:2px;height:12px"></i>Seuil d\'alerte</span></div>'+
    SOCS.map(function(x){var sx=soc(x),e=eng(x),pb=sx.point_bas,w=function(v){return (Math.max(0,v)/mx*100).toFixed(2)+"%";};
      var left=Math.max(0,pb-e.du),seg=Math.min(pb,e.du);
      var res=!e.du?"<b>Aucun achat à payer</b>":(e.marge>=0?'<b class="ok">▲ '+M(e.marge)+" M de marge</b>":'<b class="bad">▼ manque '+M(-e.marge)+" M</b>");
      return '<button class="cv-r'+(SF&&SF!==x?" dim":"")+'" data-soc="'+esc(x)+'"><p class="nm">'+tile(x)+esc(x)+'</p><div class="cv-t" data-tip="'+esc("<b>"+x+"</b><br>Point bas "+M(pb)+" M F<br>Reste à payer "+M(e.du)+" M F<br>Seuil "+M(sx.seuil)+" M F")+'"><div class="seg1" style="width:'+w(left)+'"></div><div class="seg2" style="left:'+w(left)+";width:"+w(seg)+'"></div><div class="thr" style="left:'+w(sx.seuil)+'"></div></div><p class="res">'+res+"reste à payer "+M(e.du)+" M · seuil "+M(sx.seuil)+" M</p></button>";}).join("");
  [].forEach.call($("cover").querySelectorAll(".cv-r"),function(b){b.onclick=function(){pick(SF===b.dataset.soc?null:b.dataset.soc);};});
  var OO=E.oo.slice().sort(function(a,b){return (a.arr||"")<(b.arr||"")?-1:1;});
  $("cm-h").textContent=pl(OO.length,"commande");
  $("cmds").innerHTML=OO.length?OO.map(function(o){var i=ETP.indexOf(o.etape),al=o.alertes.length;
    return '<div class="row" style="cursor:default"><span class="ty '+(al?"late":o.pay?"b":"o")+'">'+ic(o.etape==="Expédiée"?"ship":o.pay?"package":"hand-coins")+'</span><div style="min-width:0"><p class="tt">'+esc(o.four)+" · "+esc(o.no)+'</p><span class="mm">'+(SF?"":esc(o.soc)+" · ")+esc(o.etape)+(o.arr?" · arrivée "+dc(o.arr):"")+(al?' · <span class="r">'+esc(o.alertes.join(", "))+"</span>":"")+'</span><span class="steps5">'+ETP.map(function(e,k){return '<i class="'+(k<=i?"on":"")+'"></i>';}).join("")+'</span></div><span class="rr"><span class="amt">'+M(o.mt,2)+' M</span><span class="pill '+(o.pay?"b":"a")+'">'+(o.pay?"Payée":"À payer")+"</span></span></div>";}).join(""):'<p class="empty">Aucune commande en cours pour ces filtres.</p>';
  var A=E.A.slice().sort(function(a,b){return b.m-a.m;});
  $("al-h").textContent=pl(A.length,"article");
  $("alancer").innerHTML=A.length?A.map(function(a){return '<div class="row" style="cursor:default"><span class="ty '+(a.alerte==="Rupture"?"late":"a")+'">'+ic("shopping-cart")+'</span><div style="min-width:0"><p class="tt">'+esc(a.des)+'</p><span class="mm">'+esc(a.ref)+" · "+esc(a.four)+(SF?"":" · "+esc(a.soc))+" · "+F(a.q)+" unités · délai "+a.delai+' j</span></div><span class="rr"><span class="amt">'+M(a.m,2)+' M</span><span class="pill '+(a.alerte==="Rupture"?"r":"a")+'">'+esc(a.alerte)+"</span></span></div>";}).join(""):'<p class="empty">Aucun achat à lancer pour ces filtres.</p>';}

/* ---------- barre latérale, filtres, navigation ---------- */
function socState(s){var x=soc(s),r=redClients().filter(function(c){return c.socs[s];}).length;return x.sem_sous>0?["r","Sous le seuil de trésorerie"]:(x.imp60>0?["a","Impayés à plus de 60 jours"]:["g","Situation normale"]);}
function renderSide(){
  $("side-socs").innerHTML=SOCS.map(function(s){var e=socState(s);return '<button class="ni'+(SF===s?" on":"")+'" data-side="'+esc(s)+'">'+tile(s)+esc(s)+'<span class="sd '+e[0]+'" title="'+e[1]+'"></span></button>';}).join("");
  [].forEach.call(document.querySelectorAll("[data-side]"),function(b){b.onclick=function(){pick(SF===b.dataset.side?null:b.dataset.side);};});
  $("menu").innerHTML='<button class="mi'+(SF?"":" on")+'" data-pick=""><span class="ti">'+ic("building-2")+"</span><span>Toutes les sociétés<small>Groupe consolidé</small></span>"+ic("check").replace('class="i"','class="i ck"')+'</button><div class="msep"></div>'+
    SOCS.map(function(s){return '<button class="mi'+(SF===s?" on":"")+'" data-pick="'+esc(s)+'">'+tile(s)+"<span>"+esc(s)+"<small>"+esc(D.par[s][0])+"</small></span>"+ic("check").replace('class="i"','class="i ck"')+"</button>";}).join("");
  [].forEach.call(document.querySelectorAll("[data-pick]"),function(b){b.onclick=function(e){e.stopPropagation();pick(b.dataset.pick||null);};});
  $("sel-l").textContent=SF||"Toutes les sociétés";$("sel-dot").innerHTML=SF?tile(SF):"";$("sel-b").classList.toggle("on",!!SF);}
function pick(s,quiet){SF=s||null;$("menu").classList.remove("on");MORE={en:12,rj:12,fn:12};renderAll();if(!quiet)toast(SF?"Filtré sur "+SF:"Toutes les sociétés");}
$("sel-b").onclick=function(e){e.stopPropagation();$("menu").classList.toggle("on");};
document.addEventListener("click",function(e){if(!e.target.closest(".sel"))$("menu").classList.remove("on");if(!e.target.closest("#more")&&!e.target.closest("#tb-more"))$("more").classList.remove("on");var g=e.target.closest("[data-goto]");if(g){$("more").classList.remove("on");show(g.dataset.goto);}});
document.addEventListener("keydown",function(e){if(e.key==="Escape"){closeDr();$("menu").classList.remove("on");$("more").classList.remove("on");}});
$("q").oninput=function(e){Q=e.target.value;MORE.en=12;renderEnTbl(OPEN());};
$("q-re").oninput=function(e){QR=e.target.value;MORE.rj=12;renderRj(RELS());};
$("q-fn").oninput=function(e){QN=e.target.value;MORE.fn=12;renderFne();};
$("tb-more").onclick=function(e){e.stopPropagation();$("more").classList.toggle("on");};
function fval(k){return VF[k]||"";}
function renderFbar(){var tr=CUR==="tresorerie";
  $("per").hidden=tr;$("hz").hidden=!tr;
  [].forEach.call($("per").children,function(b){b.classList.toggle("on",+b.dataset.p===PER);});
  var f=FMET[CUR];
  if(f){var v=fval(f.k);$("fmet").innerHTML='<label class="fs">'+ic(f.ico)+'<select id="fsel" class="'+(v?"on":"")+'" aria-label="Filtre"><option value="">'+f.all+"</option>"+f.o().map(function(o){return '<option value="'+esc(o[0])+'"'+(o[0]===v?" selected":"")+">"+esc(o[1])+"</option>";}).join("")+"</select></label>";
    $("fsel").onchange=function(e){VF[f.k]=e.target.value;MORE={en:12,rj:12,fn:12};renderAll();toast(e.target.value?"Filtre : "+e.target.options[e.target.selectedIndex].text:"Filtre retiré");};}
  else $("fmet").innerHTML="";
  $("freset").hidden=!(SF||PER!==30||VF.ty||VF.ri||VF.rc||VF.ac);}
[].forEach.call($("per").children,function(b){b.onclick=function(){PER=+b.dataset.p;MORE={en:12,rj:12,fn:12};renderAll();toast("Période : "+PERL[PER]);};});
$("freset").onclick=function(){SF=null;PER=30;VF={ty:"",ri:"",rc:"",ac:""};NF="all";RST="all";FST="all";renderAll();toast("Filtres effacés");};
function badges(){var O=OPEN(),n3=O.filter(function(f){return f.niveau===3;}).length,R=redClients().length,AN=FA().filter(function(f){return f.fne_st!=="ok";}).length;
  var tr=SOCS.filter(function(x){return inS(x)&&soc(x).sem_sous>0;}).length,ac=eng(scope()).A.length,re=D.relances.filter(function(r){return r.st==="prevue"&&inS(r.soc)&&r.date>T&&r.date<=addd(T,7);}).length;
  $("k-enc").textContent=n3||"";$("k-ri").textContent=R||"";$("k-fn").textContent=AN||"";$("k-tr").textContent=tr||"";$("k-ac").textContent=ac||"";$("k-re").textContent=re||"";
  $("m-enc").textContent=n3||"";$("m-ri").textContent=R||"";$("m-fn").textContent=AN||"";$("m-pl").textContent=tr||"";}
function render(v){renderFbar();
  if(v==="ensemble"){renderLede();alertBox("alert-ens");renderKpis();renderEnsCharts();renderFil();renderMinis();}
  else if(v==="encaisser")renderEnc();else if(v==="risque")renderRisque();else if(v==="relances")renderRel();else if(v==="fne")renderFne();else if(v==="tresorerie")renderTreso();else renderAchats();;fixDots();}
function show(v){if(!VNAME[v])v="ensemble";CUR=v;
  [].forEach.call(document.querySelectorAll(".ni[data-v],.tabbar button[data-v],.more .mi[data-v]"),function(b){b.classList.toggle("on",b.dataset.v===v);});
  $("tb-more").classList.toggle("on",v==="tresorerie"||v==="achats");
  [].forEach.call(document.querySelectorAll(".view"),function(s){s.classList.toggle("on",s.id==="v-"+v);});
  $("crumb-v").textContent=VNAME[v];
  if(history.replaceState)history.replaceState(null,"","#"+v);
  render(v);window.scrollTo({top:0});}
var lastW=innerWidth<700;window.addEventListener("resize",function(){var w=innerWidth<700;if(w!==lastW){lastW=w;render(CUR);}});
function fixDots(){var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),n;while((n=w.nextNode())){if(/[a-zé]\.\.(?!\.)/.test(n.nodeValue))n.nodeValue=n.nodeValue.replace(/([a-zé])\.\.(?!\.)/g,"$1.");}}
function renderAll(){renderSide();badges();render(CUR);}
[].forEach.call(document.querySelectorAll(".ni[data-v],.tabbar button[data-v],.more .mi[data-v]"),function(b){b.onclick=function(){$("more").classList.remove("on");show(b.dataset.v);};});
/* infobulles HTML */
document.addEventListener("mousemove",function(e){var t=e.target.closest&&e.target.closest("[data-tip]"),tp=$("tip");if(!tp)return;if(!t){tp.style.display="none";return;}tp.innerHTML=t.getAttribute("data-tip");tp.style.display="block";var x=e.clientX+14,y=e.clientY+14;if(x+270>innerWidth)x=e.clientX-270;tp.style.left=x+"px";tp.style.top=y+"px";});

function init(d){
  D=d;T=D.arrete;SOCS=Object.keys(D.par);ALL=D.factures.concat(D.hist);chartDefaults();
  [].forEach.call(document.querySelectorAll("i[data-i]"),function(el){var w=document.createElement("span");w.innerHTML=ic(el.dataset.i);var sv=w.firstChild;if(el.className)sv.setAttribute("class","i "+el.className);el.replaceWith(sv);});
  $("date").textContent=flong(T);
  var h=(location.hash||"").slice(1);renderSide();badges();show(VNAME[h]?h:"ensemble");
  window.addEventListener("hashchange",function(){var x=(location.hash||"").slice(1);if(VNAME[x]&&x!==CUR)show(x);});
  window.__fin={per:function(x){PER=x;renderAll();},pick:pick,show:show,vf:function(k,v){VF[k]=v;renderAll();},openClient:openClient,openFact:openFact,openFne:openFne,closeDr:closeDr};
}
fetch("data/finance.json?v=2027f3").then(function(r){return r.json();}).then(init);
})();
