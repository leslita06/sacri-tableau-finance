(function(){
"use strict";
var ICO=window.ICO,D;
var $=function(id){return document.getElementById(id);};
var ACC="#E95B0F",RED="#C8352B",GRN="#18794E",INK="#111111",MUT="#6B6B6B",LIN="#EFEFEC";
function ic(n){return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">'+(ICO[n]||"")+'</svg>';}
function F(x){return Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g,"\u202f");}
function M(x,n){if(n===undefined)n=1;var v=(x/1e6).toFixed(n).replace(".",",");if(/,0+$/.test(v))v=v.replace(/,0+$/,"");return v.replace("-","\u2212");}
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");}
function sum(a){return a.reduce(function(x,y){return x+y;},0);}
function pl(n,s,p){return n+"\u00a0"+(n>1?(p||s+"s"):s);}
function dd(s){return new Date(s+"T12:00:00");}
var JOURS=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"],MOIS=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"],MC=["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
function dc(s){if(!s)return "";var d=dd(s);return d.getDate()+"\u00a0"+MC[d.getMonth()];}
function dfr(s){if(!s)return "";var p=s.split("-");return p[2]+"/"+p[1]+"/"+p[0];}
function flong(s){var d=dd(s);return JOURS[d.getDay()]+" "+d.getDate()+" "+MOIS[d.getMonth()]+" "+d.getFullYear();}

var SOCS,SF=null,CUR="ensemble",NF="all",Q="",ALL=false,CH={};
var VNAME={ensemble:"Vue d'ensemble",encaisser:"Encaissements",tresorerie:"Trésorerie",achats:"Achats et engagements"};
var NIV=[{k:0,l:"Non échues",c:"#BDBDB8",d:"pas encore à l'échéance"},{k:1,l:"Niveau 1 · rappel",c:"#F6B38E",d:"retard de 1 à 30 jours"},{k:2,l:"Niveau 2 · relance ferme",c:ACC,d:"retard de 31 à 60 jours"},{k:3,l:"Niveau 3 · dernier rappel",c:RED,d:"plus de 60 jours"}];
var PREP={};try{PREP=JSON.parse(localStorage.getItem("sacri-fin-prep")||"{}");}catch(e){}
function savePrep(){try{localStorage.setItem("sacri-fin-prep",JSON.stringify(PREP));}catch(e){}}
var tt;function toast(m){var t=$("toast");t.innerHTML=ic("circle-check-big")+"<span>"+esc(m)+"</span>";t.classList.add("on");clearTimeout(tt);tt=setTimeout(function(){t.classList.remove("on");},2600);}

/* ---------- données ---------- */
function scope(){return SF||"Groupe";}
function soc(n){for(var i=0;i<D.societes.length;i++)if(D.societes[i].nom===n)return D.societes[i];}
function fin(n){return D.treso[n]["Solde de fin"].slice(0,13);}
function facts(){return D.factures.filter(function(f){return !SF||f.soc===SF;});}
function open(){return facts().filter(function(f){return f.reste>0;});}
function lv(f){return f.niveau||0;}
function caPer(n,a,b){return sum(D.factures.filter(function(f){return (n==="Groupe"||f.soc===n)&&f.date>=a&&f.date<=b;}).map(function(f){return f.ht;}));}
function orders(n){var o={},L=[];D.cmd.forEach(function(c){if(n&&n!=="Groupe"&&c.soc!==n)return;var k=c.no+"|"+c.soc;
  if(!o[k]){o[k]={no:c.no,soc:c.soc,four:c.four,etape:c.etape,arr:c.arr,pay:c.pay,cde:c.cde,lines:[],mt:0,alertes:[]};L.push(o[k]);}
  o[k].lines.push(c);o[k].mt+=c.mt;if(c.alerte&&o[k].alertes.indexOf(c.alerte)<0)o[k].alertes.push(c.alerte);});return L;}
function eng(n){var oo=orders(n).filter(function(o){return o.etape!=="Reçu";});
  var route=sum(oo.filter(function(o){return o.pay;}).map(function(o){return o.mt;}));
  var apayer=sum(oo.filter(function(o){return !o.pay;}).map(function(o){return o.mt;}));
  var A=D.achats.filter(function(a){return n==="Groupe"||a.soc===n;}),lancer=sum(A.map(function(a){return a.m;}));
  var s=soc(n);return {oo:oo,A:A,route:route,apayer:apayer,lancer:lancer,du:apayer+lancer,total:route+apayer+lancer,marge:s.point_bas-apayer-lancer-s.seuil};}
function minI(a){var k=0;for(var i=1;i<a.length;i++)if(a[i]<a[k])k=i;return k;}

/* ---------- petits graphiques ---------- */
function spark(data,col,thr){var w=84,h=34,all=thr!=null?data.concat([thr]):data,mn=Math.min.apply(null,all),mx=Math.max.apply(null,all),r=(mx-mn)||1;
  function y(v){return h-3-(v-mn)/r*(h-8);}
  var pts=data.map(function(v,i){return [i*(w/(data.length-1)),y(v)];});
  var d=pts.map(function(p,i){return (i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1);}).join(" ");
  var a=d+" L"+w+" "+h+" L0 "+h+" Z",l=pts[pts.length-1];
  var t=thr!=null?'<line x1="0" x2="'+w+'" y1="'+y(thr).toFixed(1)+'" y2="'+y(thr).toFixed(1)+'" stroke="'+RED+'" stroke-width="1" stroke-dasharray="3 2" vector-effect="non-scaling-stroke"/>':"";
  var lows=thr!=null?pts.filter(function(p,i){return data[i]<thr;}).map(function(p){return '<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="2.4" fill="'+RED+'"/>';}).join(""):"";
  return '<svg class="spk" viewBox="0 0 '+w+" "+h+'" preserveAspectRatio="none"><path d="'+a+'" fill="'+col+'" fill-opacity=".08"/>'+t+'<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>'+lows+'<circle cx="'+l[0]+'" cy="'+l[1]+'" r="2.6" fill="'+col+'"/></svg>';}
function dl(cls,txt){return '<span class="dl '+cls+'">'+txt+"</span>";}
function pct(a,b){return Math.round((b-a)/a*100);}
function agebar(n){var o=D.factures.filter(function(f){return f.reste>0&&(n==="Groupe"||f.soc===n);}),t=sum(o.map(function(f){return f.reste;}))||1;
  return '<div class="agebar">'+NIV.map(function(v){var m=sum(o.filter(function(f){return lv(f)===v.k;}).map(function(f){return f.reste;}));return m?'<i style="width:'+(m/t*100).toFixed(1)+'%;background:'+v.c+'" title="'+v.l+" : "+M(m)+' M"></i>':"";}).join("")+"</div>";}
function tile(s){var p=D.par[s];return '<span class="ti">'+ic(p?p[1]:"building-2")+"</span>";}
function stag(s){return '<span class="stag">'+ic(D.par[s]?D.par[s][1]:"building-2")+esc(s)+"</span>";}

/* ---------- chiffres clés ---------- */
function renderKpis(){
  var n=scope(),s=soc(n),O=open(),f=fin(n),k=minI(f);
  var nb=facts().filter(function(x){return x.date>="2026-11-01";}).length,n3=O.filter(function(x){return lv(x)===3;}).length;
  var caO=caPer(n,"2026-10-01","2026-10-19"),months=["2026-07","2026-08","2026-09","2026-10","2026-11"].map(function(m){return caPer(n,m+"-01",m+"-31");});
  var caD=caO?pct(caO,s.ca_mois):null;
  var dTr=f[12]-s.treso;
  var K=[
    {ic:"file-text",l:"CA facturé du mois",v:M(s.ca_mois),u:"M F HT",sp:spark(months,ACC),
     s:(caD===null?dl("nt","nouveau"):dl(caD>=0?"up":"dn",(caD>=0?"▲":"▼")+"\u00a0"+Math.abs(caD)+"\u00a0%"))+"<span>vs 1–19 oct. · "+pl(nb,"facture")+"</span>"},
    {ic:"receipt",l:"Encours clients",v:M(s.encours),u:"M F TTC",bar:agebar(n),
     s:"<span><b>"+O.length+"</b> factures non soldées</span>"},
    {ic:"triangle-alert",l:"Impayés de plus de 60 jours",v:M(s.imp60),u:"M F",bad:s.imp60>0,bar:agebar(n),
     s:s.imp60>0?dl("dn","▲\u00a0"+Math.round(s.imp60/s.encours*100)+"\u00a0% de l'encours")+"<span>"+n3+" au niveau 3</span>":dl("up","aucun")},
    {ic:"landmark",l:"Trésorerie au 19/11",v:M(s.treso),u:"M F",sp:spark(f,ACC,s.seuil),
     s:dl(dTr>=0?"up":"dn",(dTr>=0?"▲":"▼")+"\u00a0"+M(Math.abs(dTr))+"\u00a0M")+"<span>à 13 semaines</span>"},
    {ic:"trending-down",l:"Point bas sur 13 semaines",v:M(f[k]),u:"M F",bad:s.sem_sous>0,sp:spark(f,s.sem_sous>0?RED:INK,s.seuil),
     s:s.sem_sous>0?dl("dn","▼\u00a0"+pl(s.sem_sous,"semaine")+" sous le seuil"):dl("up","▲\u00a0"+M(f[k]-s.seuil)+"\u00a0M de marge")+"<span>sur le seuil</span>"}
  ];
  $("kpis").innerHTML=K.map(function(x){return '<div class="kc'+(x.bad?" bad":"")+'"><p class="l">'+ic(x.ic)+x.l+'</p><div class="vr"><p class="v">'+x.v+"<small>"+x.u+"</small></p>"+(x.sp||"")+"</div>"+(x.bar||"")+'<p class="s">'+x.s+"</p></div>";}).join("");
}

/* ---------- phrase d'ouverture ---------- */
function renderLede(){
  var n=scope(),s=soc(n),f=fin(n),k=minI(f),E=eng(n),t;
  if(!SF){
    var low=SOCS.filter(function(x){return soc(x).sem_sous>0;});
    var short=SOCS.filter(function(x){return eng(x).marge<0&&eng(x).du>0;});
    t="Depuis le 1er novembre, le groupe a facturé <b>"+M(s.ca_mois)+" M F HT</b>. Les clients doivent <b>"+M(s.encours)+" M F</b>, dont <span class=\"r\">"+M(s.imp60)+" M F</span> en retard de plus de 60 jours. "+
      "La trésorerie consolidée ne descend pas sous <b>"+M(f[k])+" M F</b>, mais "+low.map(function(x){return "<b>"+x+"</b> ("+pl(soc(x).sem_sous,"semaine")+")";}).join(" et ")+" passent sous leur seuil.";
    if(short.length)t+=" Côté achats, "+short.map(function(x){var e=eng(x);return "<b>"+x+"</b> doit encore payer <b>"+M(e.du)+" M F</b> d'achats pour un point bas de "+M(soc(x).point_bas)+" M F";}).join(" ; ")+" : à financer ou à étaler.";
  } else {
    t=SF+" a facturé <b>"+M(s.ca_mois)+" M F HT</b> depuis le 1er novembre. Ses clients doivent <b>"+M(s.encours)+" M F</b>"+(s.imp60?", dont <span class=\"r\">"+M(s.imp60)+" M F</span> à plus de 60 jours.":", sans retard de plus de 60 jours.")+
      " Sa trésorerie passe de "+M(s.treso)+" à "+M(f[12])+" M F en 13 semaines"+(s.sem_sous?", <span class=\"r\">sous le seuil de "+M(s.seuil)+" M F pendant "+pl(s.sem_sous,"semaine")+"</span>.":", toujours au-dessus du seuil de "+M(s.seuil)+" M F.")+
      (E.du?" Il reste <b>"+M(E.du)+" M F</b> d'achats à payer.":" Aucun achat restant à payer.");
  }
  $("lede").innerHTML=t;
  $("h-ens").textContent=SF?SF+" · facturer, encaisser et acheter":"Facturer, encaisser et acheter";
}

/* ---------- graphiques Chart.js ---------- */
function mk(id,cfg){if(CH[id])CH[id].destroy();CH[id]=new Chart($(id),cfg);}
var TT={backgroundColor:INK,titleFont:{weight:"600"},padding:10,cornerRadius:8,boxPadding:4};
function yAx(){return {grid:{color:LIN},border:{display:false},ticks:{color:MUT,callback:function(x){return M(x,0)+" M";}}};}
function labs(){return D.semaines.map(dc);}
function renderTresoChart(){
  var n=scope(),s=soc(n),f=fin(n),k=minI(f);
  $("tc-title").textContent="Trésorerie sur 13 semaines · "+(SF||"groupe consolidé");
  $("tc-u").textContent="point bas "+M(f[k])+" M F, semaine du "+dc(D.semaines[k]);
  mk("c-treso",{type:"line",data:{labels:labs(),datasets:[
    {label:"Solde de fin",data:f,borderColor:ACC,backgroundColor:function(c){var g=c.chart.ctx.createLinearGradient(0,0,0,c.chart.height);g.addColorStop(0,"rgba(233,91,15,.16)");g.addColorStop(1,"rgba(233,91,15,0)");return g;},fill:true,tension:.35,borderWidth:2.5,
     pointRadius:f.map(function(v,i){return v<s.seuil?5:(i===k?4:0);}),pointHoverRadius:5,pointBackgroundColor:f.map(function(v){return v<s.seuil?RED:ACC;}),pointBorderColor:"#fff",pointBorderWidth:1.5},
    {label:"Seuil d'alerte",data:f.map(function(){return s.seuil;}),borderColor:RED,borderDash:[5,4],borderWidth:1.5,pointRadius:0,fill:false}]},
   options:{maintainAspectRatio:false,interaction:{mode:"index",intersect:false},plugins:{legend:{display:false},tooltip:Object.assign({},TT,{callbacks:{title:function(c){return "Semaine du "+c[0].label;},label:function(c){return " "+c.dataset.label+" : "+F(c.raw)+" F";}}})},
    scales:{x:{grid:{display:false},ticks:{color:MUT,maxRotation:0,autoSkip:true,maxTicksLimit:7}},y:Object.assign(yAx(),{beginAtZero:true})}}});
}
function renderCascade(){
  var O=open(),vals=NIV.map(function(v){return sum(O.filter(function(f){return lv(f)===v.k;}).map(function(f){return f.reste;}));}),tot=sum(vals);
  var acc=0,data=vals.map(function(v){var r=[acc,acc+v];acc+=v;return r;});data.push([0,tot]);
  var L=["Non échues","Niveau 1","Niveau 2","Niveau 3","Encours total"],C=NIV.map(function(v){return v.c;}).concat([INK]);
  mk("c-casc",{type:"bar",data:{labels:L,datasets:[{data:data,backgroundColor:C,borderRadius:6,borderSkipped:false,maxBarThickness:54}]},
   options:{maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:Object.assign({},TT,{displayColors:false,callbacks:{label:function(c){var v=c.raw[1]-c.raw[0];return F(v)+" F · "+Math.round(v/tot*100)+" %";}}})},
    scales:{x:{grid:{display:false},ticks:{color:MUT,font:{size:11.5}}},y:yAx()}}});
  var n3=O.filter(function(f){return lv(f)===3;}).length;
  $("casc-note").innerHTML="Sur <b>"+M(tot)+" M F</b> d'encours, <b>"+M(tot-vals[0])+" M F</b> sont déjà échus. Le niveau 3 compte "+pl(n3,"facture")+" pour <b>"+M(vals[3])+" M F</b> : ce sont elles qui peuvent aller jusqu'à la mise en demeure.";
}

/* ---------- cartes filiales ---------- */
function renderFil(){
  $("fil").innerHTML=SOCS.map(function(n){var s=soc(n),f=fin(n),E=eng(n),low=s.sem_sous>0;
    var st=low?'<span class="pill r">'+s.sem_sous+' sem. sous le seuil</span>':'<span class="pill g">Au-dessus</span>';
    return '<button class="fc'+(SF===n?" on":(SF?" dim":""))+'" data-soc="'+esc(n)+'"><div class="h">'+tile(n)+'<div><p class="n">'+esc(n)+'</p><p class="m">'+esc(D.par[n][0])+"</p></div></div>"+
      '<div><p class="big">'+M(s.treso)+'<small>M F</small></p><p class="bl">trésorerie au 19/11 · '+st+"</p></div>"+
      '<div class="spkw">'+spark(f,low?RED:ACC,s.seuil)+"</div>"+
      "<dl><dt>CA du mois</dt><dd>"+M(s.ca_mois,2)+" M</dd><dt>Encours clients</dt><dd>"+M(s.encours)+" M</dd>"+
      '<dt>Impayés &gt; 60 j</dt><dd class="'+(s.imp60?"bad":"")+'">'+(s.imp60?M(s.imp60)+" M":"0")+"</dd>"+
      "<dt>Point bas</dt><dd class=\""+(low?"bad":"")+"\">"+M(s.point_bas)+" M</dd>"+
      '<dt>Achats à payer</dt><dd class="'+(E.marge<0&&E.du?"bad":"")+'">'+(E.du?M(E.du)+" M":"0")+"</dd></dl></button>";}).join("");
  [].forEach.call($("fil").querySelectorAll(".fc"),function(b){b.onclick=function(){pick(SF===b.dataset.soc?null:b.dataset.soc);};});
}

/* ---------- relances ---------- */
function msg(f,kind){var s=f.soc,ttc=F(f.ttc),r=F(f.reste);
  if(kind==="med")return "Objet : Mise en demeure de payer · facture "+f.num+"\n\nMadame, Monsieur,\n\nMalgré nos relances, la facture "+f.num+" du "+dfr(f.date)+" ("+f.design+"), échue le "+dfr(f.ech)+", reste impayée pour un montant de "+r+" F CFA TTC.\n\nNous vous mettons en demeure de régler cette somme dans un délai de quinze jours à compter de la réception du présent courrier. À défaut, nous engagerons les démarches de recouvrement utiles.\n\nSi un règlement est déjà en cours, merci de nous en adresser la preuve.\n\nVeuillez agréer, Madame, Monsieur, nos salutations distinguées.\n\nLa direction · "+s;
  var n=lv(f);
  if(n<=1)return "Objet : Facture "+f.num+" · rappel\n\nBonjour,\n\nSauf erreur de notre part, la facture "+f.num+" du "+dfr(f.date)+", d'un montant de "+ttc+" F CFA TTC, "+(n?"arrivée à échéance le "+dfr(f.ech)+", reste due":"arrive à échéance le "+dfr(f.ech)+". Reste dû")+" : "+r+" F CFA.\n\nPourriez-vous nous indiquer la date de règlement prévue ? Si le paiement est déjà parti, merci de ne pas tenir compte de ce message.\n\nCordialement,\nService encaissements · "+s;
  if(n===2)return "Objet : Facture "+f.num+" · relance\n\nBonjour,\n\nLa facture "+f.num+" du "+dfr(f.date)+" reste impayée "+f.retard+" jours après son échéance du "+dfr(f.ech)+". Le montant dû est de "+r+" F CFA TTC.\n\nNous vous remercions de procéder au règlement sous huit jours, ou de nous appeler pour convenir d'un échéancier.\n\nCordialement,\nService encaissements · "+s;
  return "Objet : Dernier rappel · facture "+f.num+"\n\nBonjour,\n\nMalgré nos précédents messages, la facture "+f.num+" du "+dfr(f.date)+" reste impayée depuis "+f.retard+" jours, pour "+r+" F CFA TTC.\n\nSans règlement ou proposition d'échéancier de votre part sous huit jours, le dossier sera transmis à notre direction.\n\nCordialement,\nService encaissements · "+s;}
function acts(f,compact){var n=lv(f),k=f.num,p=PREP[k]||{};
  var a=n?'<button class="ba '+(p.rel?"done":"pri")+'" data-act="rel" data-f="'+k+'">'+ic(p.rel?"check":"send")+(p.rel?"Préparée":"Relancer")+"</button>":'<button class="ba" data-act="rel" data-f="'+k+'">'+ic("calendar")+(compact?"Rappel":"Rappeler l'échéance")+"</button>";
  if(n===3)a+='<button class="ba '+(p.med?"done":"red")+'" data-act="med" data-f="'+k+'">'+ic(p.med?"check":"gavel")+(p.med?"Préparée":"Mettre en demeure")+"</button>";
  return '<div class="ab">'+a+"</div>";}
function invRow(f){var n=lv(f),late=f.retard>60;
  return '<div class="inv"><span class="ty'+(late?" late":"")+'">'+ic(late?"triangle-alert":"file-text")+'</span><div style="min-width:0"><p class="tt">'+esc(f.client)+'</p><div class="mm"><span>'+esc(f.num)+"</span>"+(SF?"":stag(f.soc))+'</div></div><div class="sc">'+(f.prevu?'<span class="hint">paiement prévu '+dc(f.prevu)+"</span>":(f.retard>90?'<span class="pill n">hors prévision</span>':""))+'</div>'+
    '<p class="rt'+(late?" bad":"")+'">'+(f.retard>0?f.retard+" j de retard":"à échoir")+"<small>échéance "+dc(f.ech)+'</small></p><p class="mt">'+F(f.reste)+" F<small>"+(n?NIV[n].l.split(" · ")[0]:"non échue")+"</small></p>"+acts(f)+"</div>";}
function bindActs(root){[].forEach.call(root.querySelectorAll("[data-act]"),function(b){b.onclick=function(e){e.stopPropagation();openMsg(b.dataset.f,b.dataset.act);};});}
function sortO(L){return L.sort(function(a,b){return (b.retard-a.retard)||(b.reste-a.reste);});}
function renderRelMini(){var L=sortO(open().filter(function(f){return lv(f)>0;})).slice(0,5);
  $("rel-mini").innerHTML=L.length?L.map(function(f){var late=f.retard>60;return '<div class="row" style="cursor:default"><span class="ty'+(late?" late":"")+'">'+ic(late?"triangle-alert":"file-text")+'</span><div style="min-width:0"><p class="tt">'+esc(f.client)+'</p><div class="mm"><span class="due'+(late?" late":"")+'">'+ic("clock")+f.retard+" j</span><b>"+F(f.reste)+" F</b>"+(SF?"":stag(f.soc))+"</div></div>"+acts(f,true)+"</div>";}).join(""):'<p class="empty">Aucune facture en retard.</p>';
  bindActs($("rel-mini"));}
function renderNivs(){var O=open(),tot=sum(O.map(function(f){return f.reste;}))||1;
  $("nivs").innerHTML=NIV.map(function(v){var L=O.filter(function(f){return lv(f)===v.k;}),m=sum(L.map(function(f){return f.reste;}));
    return '<button class="nv'+(NF===String(v.k)?" on":"")+'" data-n="'+v.k+'"><p class="l"><i style="background:'+v.c+'"></i>'+v.l+'</p><p class="v">'+M(m)+'<small>M F</small></p><p class="s">'+pl(L.length,"facture")+" · "+v.d+'</p><div class="bar1"><i style="width:'+(m/tot*100).toFixed(1)+"%;background:"+v.c+'"></i></div></button>';}).join("");
  [].forEach.call($("nivs").children,function(b){b.onclick=function(){NF=NF===b.dataset.n?"all":b.dataset.n;renderEnc();};});
  var segs=[["all","Toutes"],["late","En retard"],["3","Niveau 3"],["2","Niveau 2"],["1","Niveau 1"],["0","Non échues"]];
  $("seg-niv").innerHTML=segs.map(function(s){var c=O.filter(function(f){return fN(f,s[0]);}).length;return '<button class="'+(NF===s[0]?"on":"")+'" data-n="'+s[0]+'">'+s[1]+' <span class="c">'+c+"</span></button>";}).join("");
  [].forEach.call($("seg-niv").children,function(b){b.onclick=function(){NF=b.dataset.n;renderEnc();};});}
function fN(f,k){return k==="all"||(k==="late"?lv(f)>0:String(lv(f))===k);}
function renderEnc(){
  var O=open(),q=Q.trim().toLowerCase();
  var L=sortO(O.filter(function(f){return fN(f,NF);}).filter(function(f){return !q||(f.client+" "+f.num).toLowerCase().indexOf(q)>=0;}));
  var late=O.filter(function(f){return lv(f)>0;}),n3=O.filter(function(f){return lv(f)===3;});
  $("en-lede").innerHTML=(SF||"Le groupe")+" attend <b>"+M(sum(O.map(function(f){return f.reste;})))+" M F</b> sur "+pl(O.length,"facture")+". <b>"+pl(late.length,"facture")+"</b> sont en retard, dont <span class=\"r\">"+n3.length+" au niveau 3 pour "+M(sum(n3.map(function(f){return f.reste;})))+" M F</span>. Chaque ligne propose le message adapté à son niveau.";
  renderNivs();
  var show=(ALL||NF!=="all"||q)?L:L.slice(0,10);
  $("reg").innerHTML=(show.length?show.map(invRow).join(""):'<p class="empty">Aucune facture pour ce filtre.</p>')+(L.length>10&&NF==="all"&&!q?'<button class="more" id="more">'+(ALL?"Afficher les 10 plus anciennes":"Afficher les "+L.length+" factures")+"</button>":"");
  bindActs($("reg"));if($("more"))$("more").onclick=function(){ALL=!ALL;renderEnc();};
}
function openMsg(num,kind){var f=D.factures.filter(function(x){return x.num===num;})[0],med=kind==="med",n=lv(f);
  $("dr-k").innerHTML=ic(med?"gavel":"mail")+(med?"Mise en demeure":"Relance")+" · "+esc(f.num);
  var props='<dl class="props"><dt>Client</dt><dd>'+esc(f.client)+"</dd><dt>Société</dt><dd>"+stag(f.soc)+"</dd><dt>Reste dû</dt><dd>"+F(f.reste)+" F CFA TTC</dd><dt>Échéance</dt><dd>"+dfr(f.ech)+(f.retard>0?' <span class="pill '+(f.retard>60?"r":"a")+'">'+f.retard+" j de retard</span>":"")+"</dd><dt>Destinataire</dt><dd>contact comptable du client, à compléter</dd></dl>";
  var warn=med?'<div class="warn">'+ic("triangle-alert")+"<span>Une mise en demeure engage la société. Elle se décide par la direction et part en recommandé avec accusé de réception, après vérification du solde.</span></div>":'<div class="warn">'+ic("info")+"<span>Rien ne part depuis cette page. Le message est à relire, puis à envoyer par le responsable des encaissements.</span></div>";
  $("dr-b").innerHTML='<div class="tags"><span class="pill '+(med?"r":(n===3?"r":n===2?"o":"a"))+'">'+(med?"Avant procédure":(n?NIV[n].l:"Rappel avant échéance"))+"</span></div><h3>"+esc(f.client)+'</h3><p class="why">'+esc(f.design)+"</p>"+props+warn+
    '<p class="acts"><span class="lbl">Message préparé</span></p><div class="msg" id="msg">'+esc(msg(f,kind))+'</div><div class="acts" style="margin-top:16px"><button class="btn pri" id="b-ok">'+ic("check")+"Marquer comme préparée</button><button class=\"btn\" id=\"b-cp\">"+ic("file-text")+"Copier le message</button></div>";
  $("b-cp").onclick=function(){try{navigator.clipboard.writeText(msg(f,kind));toast("Message copié");}catch(e){toast("Copie impossible sur cet appareil");}};
  $("b-ok").onclick=function(){PREP[num]=PREP[num]||{};PREP[num][med?"med":"rel"]=1;savePrep();closeMsg();toast((med?"Mise en demeure":"Relance")+" préparée · "+num);renderAll();};
  $("drawer").classList.add("on");$("scrim").classList.add("on");$("drawer").setAttribute("aria-hidden","false");}
function closeMsg(){$("drawer").classList.remove("on");$("scrim").classList.remove("on");$("drawer").setAttribute("aria-hidden","true");}
$("dr-x").onclick=closeMsg;$("scrim").onclick=closeMsg;

/* ---------- trésorerie ---------- */
function renderTreso(){
  var n=scope(),s=soc(n),T=D.treso[n],f=fin(n),k=minI(f);
  var low=SOCS.filter(function(x){return soc(x).sem_sous>0;});
  $("tr-lede").innerHTML=(SF?SF+" part de":"Le groupe part de")+" <b>"+M(s.treso)+" M F</b> et finit à <b>"+M(f[12])+" M F</b> la semaine du "+dc(D.semaines[12]).replace(/\.$/,"")+". Point bas : "+M(f[k])+" M F"+(k===12?"":" la semaine du "+dc(D.semaines[k]))+(s.sem_sous?", <span class=\"r\">sous le seuil de "+M(s.seuil)+" M F</span>.":", au-dessus du seuil de "+M(s.seuil)+" M F.")+(!SF&&low.length?(low.length>1?" Deux filiales passent":" Une filiale passe")+" sous "+(low.length>1?"leur propre seuil":"son propre seuil")+" : "+low.map(function(x){return "<b>"+x+"</b>";}).join(" et ")+".":"");
  $("mult").innerHTML=SOCS.map(function(x){var sx=soc(x),fx=fin(x),bad=sx.sem_sous>0;return '<div class="mc'+(SF===x?" on":(SF?" dim":""))+'" data-soc="'+esc(x)+'"><p class="h">'+tile(x)+esc(x)+'</p><p class="v">'+M(sx.treso)+'<small>M F</small></p><p class="s'+(bad?" bad":"")+'">'+(bad?pl(sx.sem_sous,"semaine")+" sous "+M(sx.seuil)+" M":"point bas "+M(sx.point_bas)+" M")+'</p><div class="cv">'+spark(fx,bad?RED:ACC,sx.seuil)+"</div></div>";}).join("");
  [].forEach.call($("mult").children,function(b){b.onclick=function(){pick(SF===b.dataset.soc?null:b.dataset.soc);};});
  $("tr2-title").textContent="Entrées, sorties et solde · "+(SF||"groupe consolidé");
  var enc=T["Total encaissements"].slice(0,13),dec=T["Total décaissements"].slice(0,13).map(function(v){return -v;});
  mk("c-treso2",{data:{labels:labs(),datasets:[
    {type:"bar",label:"Encaissements",data:enc,backgroundColor:"rgba(24,121,78,.75)",borderRadius:4,maxBarThickness:22,stack:"f",order:2},
    {type:"bar",label:"Décaissements",data:dec,backgroundColor:"#D5D5D2",borderRadius:4,maxBarThickness:22,stack:"f",order:2},
    {type:"line",label:"Solde de fin",data:f,borderColor:ACC,borderWidth:2.5,tension:.35,pointRadius:f.map(function(v){return v<s.seuil?5:0;}),pointBackgroundColor:RED,pointBorderColor:"#fff",order:0},
    {type:"line",label:"Seuil d'alerte",data:f.map(function(){return s.seuil;}),borderColor:RED,borderDash:[5,4],borderWidth:1.5,pointRadius:0,order:1}]},
   options:{maintainAspectRatio:false,interaction:{mode:"index",intersect:false},plugins:{legend:{display:false},tooltip:Object.assign({},TT,{callbacks:{title:function(c){return "Semaine du "+c[0].label;},label:function(c){return " "+c.dataset.label+" : "+F(Math.abs(c.raw))+" F";}}})},
    scales:{x:{stacked:true,grid:{display:false},ticks:{color:MUT,maxRotation:0,autoSkip:true,maxTicksLimit:7}},y:Object.assign(yAx(),{stacked:false})}}});
  var rows=[["Solde de début","Solde de début",1],["Encaissements clients prévus (registre)","Encaissements clients"],["Autres encaissements (comptant, SAV)","Autres encaissements"],["Total encaissements","Total encaissements",1],["Fournisseurs","Fournisseurs"],["Salaires","Salaires"],["Impôts, taxes et cotisations","Impôts, taxes, cotisations"],["Autres décaissements","Autres décaissements"],["Total décaissements","Total décaissements",1],["Solde de fin","Solde de fin",1]];
  $("flux-u").textContent="en F CFA · "+(SF||"groupe consolidé");
  $("t-flux").innerHTML="<thead><tr><th>Semaine du</th>"+D.semaines.map(function(x){return "<th>"+dc(x)+"</th>";}).join("")+"<th>13 semaines</th></tr></thead><tbody>"+
    rows.map(function(r){return '<tr class="'+(r[2]?"t":"")+'"><td>'+r[1]+"</td>"+T[r[0]].map(function(v,i){var lo=r[0]==="Solde de fin"&&i<13&&v<s.seuil;return '<td class="'+(lo?"low":"")+'">'+F(v)+"</td>";}).join("")+"</tr>";}).join("")+"</tbody>";
}

/* ---------- achats et engagements ---------- */
function etapePill(o){var a=o.alertes.join(" · ");
  if(o.etape==="Reçu")return '<span class="pill g">Reçue</span>';
  if(/Proforma/.test(o.etape))return '<span class="pill o">'+esc(o.etape)+"</span>";
  return '<span class="pill '+(a?"r":"b")+'">'+esc(o.etape)+(a?" · "+esc(a):"")+"</span>";}
function renderAchats(){
  var n=scope(),E=eng(n),s=soc(n);
  var short=SOCS.filter(function(x){var e=eng(x);return e.marge<0&&e.du>0;});
  $("ac-lede").innerHTML=(SF||"Le groupe")+" a <b>"+M(E.total)+" M F</b> d'engagements d'achat : "+M(E.route)+" M F de commandes déjà payées et en route, "+M(E.apayer)+" M F de commandes encore à payer et <b>"+M(E.lancer)+" M F</b> d'achats à lancer pour reconstituer le stock."+
    (short.length&&!SF?" <span class=\"r\">"+short.join(" et ")+" ne "+(short.length>1?"peuvent":"peut")+" pas tout payer sans passer sous "+(short.length>1?"leur":"son")+" seuil.</span>":(SF&&E.marge<0&&E.du?" <span class=\"r\">"+SF+" ne peut pas tout payer sans passer sous son seuil de "+M(s.seuil)+" M F.</span>":""));
  var K=[["ship","Commandes en route",E.route,"déjà payées",pl(E.oo.filter(function(o){return o.pay;}).length,"commande")],
         ["banknote","Commandes à payer",E.apayer,"proformas",pl(E.oo.filter(function(o){return !o.pay;}).length,"commande")],
         ["shopping-cart","Achats à lancer",E.lancer,"suggestions",pl(E.A.length,"article")],
         ["wallet","Reste à payer",E.du,"à financer",E.marge<0&&E.du?'<span class="dl dn">▼ '+M(-E.marge)+" M sous le seuil</span>":'<span class="dl up">▲ '+M(Math.max(E.marge,0))+" M de marge</span>"]];
  $("ac-kpis").innerHTML=K.map(function(x,i){return '<div class="kc'+(i===3&&E.marge<0&&E.du?" bad":"")+'"><p class="l">'+ic(x[0])+x[1]+'</p><div class="vr"><p class="v">'+M(x[2])+'<small>M F</small></p></div><p class="s"><span>'+x[4]+"</span></p></div>";}).join("");
  // couverture
  var mx=Math.max.apply(null,SOCS.map(function(x){return Math.max(soc(x).point_bas,soc(x).seuil);}));
  $("cover").innerHTML='<div class="cv-leg"><span><i style="background:#E3E3DF"></i>Point bas de trésorerie</span><span><i style="background:'+ACC+'"></i>Reste à payer sur achats</span><span><i style="background:'+RED+';width:2px;height:12px"></i>Seuil d\'alerte</span></div>'+
    SOCS.map(function(x){var sx=soc(x),e=eng(x),pb=sx.point_bas,w=function(v){return (Math.max(0,v)/mx*100).toFixed(2)+"%";};
      var left=Math.max(0,pb-e.du),seg=Math.min(pb,e.du),over=Math.max(0,e.du-pb);
      var res=!e.du?'<b>Aucun achat à payer</b>':(e.marge>=0?'<b class="ok">▲ '+M(e.marge)+" M de marge</b>":'<b class="bad">▼ manque '+M(-e.marge)+" M</b>");
      return '<div class="cv-r'+(SF&&SF!==x?" dim":"")+'" data-soc="'+esc(x)+'"><p class="nm">'+tile(x)+esc(x)+'</p><div class="cv-t"><div class="seg1" style="width:'+w(pb)+'"></div>'+(seg?'<div class="seg2" style="left:'+w(left)+";width:"+w(seg)+'"></div>':"")+'<div class="thr" style="left:'+w(sx.seuil)+'"></div></div><p class="res">'+res+"<span style=\"white-space:nowrap\">point bas "+M(pb)+"\u00a0M</span> · <span style=\"white-space:nowrap\">à payer "+M(e.du)+"\u00a0M</span>"+(over?" (dont "+M(over)+"\u00a0M au-delà)":"")+"</p></div>";}).join("");
  [].forEach.call($("cover").querySelectorAll(".cv-r"),function(b){b.onclick=function(){pick(SF===b.dataset.soc?null:b.dataset.soc);};});
  var oo=E.oo.slice().sort(function(a,b){return (a.arr||"9")<(b.arr||"9")?-1:1;});
  $("cm-h").textContent=pl(oo.length,"commande")+" · "+M(E.route+E.apayer)+" M F";
  $("cmds").innerHTML=oo.length?oo.map(function(o){return '<div class="row" style="cursor:default"><span class="ty">'+ic(o.pay?"ship":"banknote")+'</span><div style="min-width:0"><p class="tt">'+esc(o.four)+" · "+esc(o.no)+'</p><div class="mm">'+(SF?"":stag(o.soc))+etapePill(o)+(o.arr?'<span class="due">'+ic("calendar")+"arrivée "+dc(o.arr)+"</span>":"")+'</div></div><div class="rr"><span class="amt">'+F(o.mt)+" F</span></div></div>";}).join(""):'<p class="empty">Aucune commande en cours.</p>';
  var A=E.A.slice().sort(function(a,b){return b.m-a.m;});
  $("al-h").textContent=pl(A.length,"article")+" · "+M(E.lancer)+" M F";
  $("alancer").innerHTML=A.length?A.map(function(a){var r=a.alerte==="Rupture";return '<div class="row" style="cursor:default"><span class="ty'+(r?" late":"")+'">'+ic(r?"triangle-alert":"package")+'</span><div style="min-width:0"><p class="tt">'+esc(a.des)+'</p><div class="mm">'+(SF?"":stag(a.soc))+'<span class="pill '+(r?"r":"o")+'">'+esc(a.alerte)+"</span><span>"+a.q+" unités · "+esc(a.four)+" · "+a.delai+' j de délai</span></div></div><div class="rr"><span class="amt">'+F(a.m)+" F</span></div></div>";}).join(""):'<p class="empty">Aucun achat à lancer.</p>';
}
function renderAcMini(){
  $("ac-mini").innerHTML=SOCS.filter(function(x){return !SF||x===SF;}).map(function(x){var e=eng(x),bad=e.marge<0&&e.du>0;
    return '<div class="row" data-soc="'+esc(x)+'"><span class="ty'+(bad?" late":"")+'">'+ic(D.par[x][1])+'</span><div style="min-width:0"><p class="tt">'+esc(x)+'</p><div class="mm"><span>'+pl(e.oo.length,"commande")+" en cours</span><span>"+pl(e.A.length,"achat")+' à lancer</span></div></div><div class="rr">'+(bad?'<span class="pill r">manque '+M(-e.marge)+" M</span>":(e.du?'<span class="pill g">finançable</span>':""))+'<span class="amt">'+M(e.total)+" M F</span></div></div>";}).join("");
  [].forEach.call($("ac-mini").querySelectorAll(".row"),function(b){b.onclick=function(){SF=b.dataset.soc;renderSide();show("achats");};});
}

/* ---------- navigation ---------- */
function socState(s){var x=soc(s),e=eng(s);if(x.sem_sous>0||(e.marge<0&&e.du))return ["r","sous le seuil"];if(x.imp60>0)return ["a","impayés à plus de 60 jours"];return ["g","sans alerte"];}
function renderSide(){
  $("side-socs").innerHTML=SOCS.map(function(s){var e=socState(s);return '<button class="ni'+(SF===s?" on":"")+'" data-side="'+esc(s)+'">'+tile(s)+esc(s)+'<span class="sd '+e[0]+'" title="'+e[1]+'"></span></button>';}).join("");
  [].forEach.call(document.querySelectorAll("[data-side]"),function(b){b.onclick=function(){pick(SF===b.dataset.side?null:b.dataset.side);};});
  $("menu").innerHTML='<button class="mi'+(SF?"":" on")+'" data-pick=""><span class="ti">'+ic("building-2")+"</span><span>Toutes les sociétés<small>Groupe consolidé</small></span>"+ic("check").replace('class="i"','class="i ck"')+'</button><div class="msep"></div>'+
    SOCS.map(function(s){return '<button class="mi'+(SF===s?" on":"")+'" data-pick="'+esc(s)+'">'+tile(s)+"<span>"+esc(s)+"<small>"+esc(D.par[s][0])+"</small></span>"+ic("check").replace('class="i"','class="i ck"')+"</button>";}).join("");
  [].forEach.call(document.querySelectorAll("[data-pick]"),function(b){b.onclick=function(e){e.stopPropagation();pick(b.dataset.pick||null);};});
  $("sel-l").textContent=SF||"Toutes les sociétés";$("sel-dot").innerHTML=SF?tile(SF):"";$("sel-b").classList.toggle("on",!!SF);
}
function pick(s,quiet){SF=s||null;ALL=false;$("menu").classList.remove("on");renderAll();if(!quiet)toast(SF?"Filtré sur "+SF:"Toutes les sociétés");}
$("sel-b").onclick=function(e){e.stopPropagation();$("menu").classList.toggle("on");};
document.addEventListener("click",function(e){if(!e.target.closest(".sel"))$("menu").classList.remove("on");var g=e.target.closest("[data-goto]");if(g)show(g.dataset.goto);});
document.addEventListener("keydown",function(e){if(e.key==="Escape"){closeMsg();$("menu").classList.remove("on");}});
$("q").oninput=function(e){Q=e.target.value;renderEnc();};
function badges(){var O=open(),n3=O.filter(function(f){return lv(f)===3&&!(PREP[f.num]||{}).rel;}).length,s=soc(scope()),sh=SOCS.filter(function(x){return (!SF||x===SF)&&eng(x).marge<0&&eng(x).du>0;}).length;
  var low=SF?(s.sem_sous?1:0):SOCS.filter(function(x){return soc(x).sem_sous>0;}).length;
  $("k-enc").textContent=n3||"";$("m-enc").textContent=n3||"";$("k-tr").textContent=low||"";$("m-tr").textContent=low||"";$("k-ac").textContent=sh||"";$("m-ac").textContent=sh||"";}
function render(v){if(v==="ensemble"){renderLede();renderKpis();renderTresoChart();renderCascade();renderFil();renderRelMini();renderAcMini();}else if(v==="encaisser")renderEnc();else if(v==="tresorerie")renderTreso();else renderAchats();}
function show(v){
  CUR=v;[].forEach.call(document.querySelectorAll(".ni[data-v],.tabbar button"),function(b){b.classList.toggle("on",b.dataset.v===v);});
  [].forEach.call(document.querySelectorAll(".view"),function(s){s.classList.toggle("on",s.id==="v-"+v);});
  $("crumb-v").textContent=VNAME[v];
  if(history.replaceState)history.replaceState(null,"","#"+v);
  render(v);window.scrollTo({top:0});
}
function renderAll(){renderSide();badges();render(CUR);}
[].forEach.call(document.querySelectorAll(".ni[data-v],.tabbar button"),function(b){b.onclick=function(){show(b.dataset.v);};});

function init(d){
  D=d;SOCS=Object.keys(D.par);
  [].forEach.call(document.querySelectorAll("i[data-i]"),function(el){var w=document.createElement("span");w.innerHTML=ic(el.dataset.i);var sv=w.firstChild;if(el.className)sv.setAttribute("class","i "+el.className);el.replaceWith(sv);});
  $("date").textContent=flong(D.arrete);
  Chart.defaults.font.family='"Inter",system-ui,sans-serif';Chart.defaults.font.size=12;Chart.defaults.color=MUT;Chart.defaults.animation=false;
  var h=(location.hash||"").slice(1);
  renderSide();badges();show(VNAME[h]?h:"ensemble");
  window.__fin={pick:pick,show:show,openMsg:openMsg,closeMsg:closeMsg};
}
fetch("data/sacri.json?v=20261124f").then(function(r){return r.json();}).then(init);
})();
