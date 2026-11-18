(function(){
"use strict";
var O="#E95B0F",O2="#F7A574",INK="#1F1D1B",MUT="#6B6762",LIN="#ECEAE7",RED="#B42318";
var SOC_COL={"SACRI":"#E95B0F","DEFI":"#1F1D1B","Trans-Roulements":"#8C8781","SAFIR":"#F2A65A","PST-CI":"#2F6F8F"};
var ORDER=["Groupe","SACRI","DEFI","Trans-Roulements","SAFIR","PST-CI"];
var NIV={1:{t:"Niveau 1 · rappel courtois",d:"retard de 1 à 30 jours"},2:{t:"Niveau 2 · relance ferme",d:"retard de 31 à 60 jours"},3:{t:"Niveau 3 · dernier rappel",d:"plus de 60 jours, avant décision de la direction"}};
var IC={
 ca:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
 enc:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
 imp:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
 tr:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 10h20M6 15h4"/></svg>',
 bas:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 7 6 6 4-4 8 8"/><path d="M21 11v6h-6"/></svg>'
};
var D,cur="Groupe",fNiv="",fQ="",all=false,charts={};
var nf=new Intl.NumberFormat("fr-FR",{maximumFractionDigits:0});
function fmt(v){return nf.format(Math.round(v||0)).replace(/\u202f|\u00a0| /g,"\u00a0")}
function M(v){var a=Math.abs(v);
 if(a>=1e9)return (v/1e9).toLocaleString("fr-FR",{maximumFractionDigits:2})+" Md";
 if(a>=1e6)return (v/1e6).toLocaleString("fr-FR",{maximumFractionDigits:a>=1e8?0:1})+" M";
 if(a>=1e3)return Math.round(v/1e3)+" k";return String(Math.round(v))}
function dfr(s){if(!s)return"";var p=s.split("-");return p[2]+"/"+p[1]+"/"+p[0]}
function dcourt(s){var m=["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];var p=s.split("-");return (+p[2])+" "+m[+p[1]-1]}
function dlong(s){var m=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];var p=s.split("-");return (+p[2])+" "+m[+p[1]-1]+" "+p[0]}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function $(id){return document.getElementById(id)}
function soc(n){for(var i=0;i<D.societes.length;i++)if(D.societes[i].nom===n)return D.societes[i]}
function bal(n){for(var i=0;i<D.balance.length;i++)if(D.balance[i].nom===n)return D.balance[i]}
function facts(){return D.factures.filter(function(f){return cur==="Groupe"||f.soc===cur})}
function minIdx(a){var k=0;for(var i=1;i<13;i++)if(a[i]<a[k])k=i;return k}

function renderTabs(){
 $("socs").innerHTML=ORDER.map(function(n){return '<button role="tab" data-k="'+n+'" aria-selected="'+(n===cur)+'">'+(n==="Groupe"?"Groupe":n)+'</button>'}).join("");
 Array.prototype.forEach.call($("socs").children,function(b){b.onclick=function(){set(b.getAttribute("data-k"))}});
}
function set(n){cur=n;renderAll();}

function renderIntro(){
 var s=soc(cur),F=facts(),nb=F.filter(function(f){return f.date>="2026-11-01"}).length;
 var open=F.filter(function(f){return f.reste>0});
 var n3=open.filter(function(f){return f.niveau===3}).length;
 var fin=D.treso[cur]["Solde de fin"],k=minIdx(fin);
 $("titre").textContent=cur==="Groupe"?"Groupe SACRI, cinq sociétés":cur;
 var p=(cur==="Groupe"?"Depuis le 1er novembre, le groupe a facturé ":"Depuis le 1er novembre, "+cur+" a facturé ")+"<b>"+fmt(s.ca_mois)+" F CFA HT</b> ("+nb+" facture"+(nb>1?"s":"")+"). "
  +"Les clients doivent encore <b>"+fmt(s.encours)+" F CFA</b> sur "+open.length+" factures"
  +(s.imp60>0?", dont <b>"+fmt(s.imp60)+" F</b> en retard de plus de 60 jours ("+n3+" facture"+(n3>1?"s":"")+" au dernier rappel). ":", sans retard de plus de 60 jours. ");
 if(s.sem_sous>0) p+="La trésorerie passe <b>sous le seuil d'alerte de "+fmt(s.seuil)+" F</b> pendant "+s.sem_sous+" semaine"+(s.sem_sous>1?"s":"")+" sur 13, avec un point bas de "+fmt(fin[k])+" F la semaine du "+dlong(D.semaines[k])+".";
 else p+="La trésorerie reste au-dessus du seuil d'alerte sur 13 semaines, avec un point bas de <b>"+fmt(fin[k])+" F</b> la semaine du "+dlong(D.semaines[k])+".";
 if(cur==="Groupe"){var low=D.societes.filter(function(x){return x.nom!=="Groupe"&&x.sem_sous>0});
  if(low.length)p+=" Mais "+(low.length>1?"deux sociétés passent":"une société passe").replace("deux",["","une","deux","trois","quatre","cinq"][low.length])+" sous leur propre seuil : "+low.map(function(x){return "<b>"+x.nom+"</b> ("+x.sem_sous+" semaine"+(x.sem_sous>1?"s":"")+")"}).join(" et ")+".";}
 $("phrase").innerHTML=p;
}
function kpi(ic,lab,val,sub,alert){return '<div class="kpi'+(alert?" alert":"")+'"><div class="ic">'+IC[ic]+'</div><p class="lab">'+lab+'</p><p class="val">'+val+'<small>F CFA</small></p><p class="sub">'+sub+'</p></div>'}
function renderKpis(){
 var s=soc(cur),F=facts(),open=F.filter(function(f){return f.reste>0});
 var nb=F.filter(function(f){return f.date>="2026-11-01"}).length;
 var n3=open.filter(function(f){return f.niveau===3}).length;
 var fin=D.treso[cur]["Solde de fin"],k=minIdx(fin),pct=s.encours?Math.round(s.imp60/s.encours*100):0;
 $("kpis").innerHTML=
  kpi("ca","CA facturé du mois (HT)",M(s.ca_mois),"<b>"+nb+"</b> facture"+(nb>1?"s":"")+" depuis le 1er novembre")+
  kpi("enc","Encours clients (TTC)",M(s.encours),"<b>"+open.length+"</b> factures non soldées")+
  kpi("imp","Impayés de plus de 60 jours",M(s.imp60),s.imp60>0?"<b>"+pct+" %</b> de l'encours · "+n3+" au niveau 3":"aucune facture concernée",s.imp60>0)+
  kpi("tr","Trésorerie au 19/11",M(s.treso),"seuil d'alerte : "+M(s.seuil)+" F")+
  kpi("bas","Point bas sur 13 semaines",M(fin[k]),s.sem_sous>0?'<span class="bad">'+s.sem_sous+" semaine"+(s.sem_sous>1?"s":"")+" sous le seuil</span>":(cur==="Groupe"&&lowN()?'semaine du '+dcourt(D.semaines[k])+' · <span class="bad">'+lowN()+' société'+(lowN()>1?'s':'')+' sous leur seuil</span>':"semaine du "+dcourt(D.semaines[k])),s.sem_sous>0||(cur==="Groupe"&&lowN()>0));
}
function lowN(){return D.societes.filter(function(x){return x.nom!=="Groupe"&&x.sem_sous>0}).length}
function renderSocs(){
 var h='<thead><tr><th>Société</th><th class="r">CA du mois HT</th><th class="r">Encours clients</th><th class="r">Impayés &gt; 60 j</th><th class="r hm">Trésorerie au 19/11</th><th class="r">Point bas 13 sem.</th><th class="r hm">Seuil</th><th>Alerte</th></tr></thead><tbody>';
 D.societes.forEach(function(s){
  var g=s.nom==="Groupe";
  var al=s.sem_sous>0?'<span class="pill p3">'+s.sem_sous+' sem. sous le seuil</span>':'<span class="pill pok">Au-dessus</span>';
  h+='<tr data-k="'+s.nom+'" class="'+(g?"tot ":"")+(s.nom===cur?"on":"")+'"><td>'+(g?"Groupe":s.nom)+'</td><td class="r">'+fmt(s.ca_mois)+'</td><td class="r">'+fmt(s.encours)+'</td><td class="r">'+(s.imp60?fmt(s.imp60):'<span class="dash">0</span>')+'</td><td class="r hm">'+fmt(s.treso)+'</td><td class="r">'+fmt(s.point_bas)+'</td><td class="r hm">'+fmt(s.seuil)+'</td><td>'+al+'</td></tr>';
 });
 $("t-socs").innerHTML=h+"</tbody>";
 Array.prototype.forEach.call($("t-socs").querySelectorAll("tbody tr"),function(tr){tr.onclick=function(){set(tr.getAttribute("data-k"));window.scrollTo({top:$("titre").getBoundingClientRect().top+window.scrollY-80,behavior:"smooth"})}});
}
function mk(id,cfg){if(charts[id])charts[id].destroy();charts[id]=new Chart($(id),cfg)}
var TT={backgroundColor:INK,titleFont:{weight:"600"},padding:10,cornerRadius:8,displayColors:true,boxPadding:4};
function renderBal(){
 var b=bal(cur),labs=["Non échu","0-30 j","31-60 j","61-90 j","+90 j"],v=[b.non_echu,b.t0_30,b.t31_60,b.t61_90,b.t90];
 mk("c-bal",{type:"bar",data:{labels:labs,datasets:[{data:v,backgroundColor:["#D9D6D2",O2,O,"#C2410C",RED],borderRadius:6,maxBarThickness:58}]},
  options:{maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:Object.assign({},TT,{displayColors:false,callbacks:{label:function(c){return fmt(c.raw)+" F CFA · "+(b.total?Math.round(c.raw/b.total*100):0)+" %"}}})},
   scales:{x:{grid:{display:false},ticks:{color:MUT}},y:{grid:{color:LIN},border:{display:false},ticks:{color:MUT,callback:function(x){return M(x)}}}}}});
 $("bal-foot").innerHTML="Total encours <b>"+fmt(b.total)+" F CFA</b>, dont "+fmt(b.total-b.non_echu)+" F déjà échus.";
}
function renderNiv(){
 var open=facts().filter(function(f){return f.reste>0&&f.niveau});
 $("niveaux").innerHTML=[1,2,3].map(function(n){
  var L=open.filter(function(f){return f.niveau===n}),m=L.reduce(function(a,f){return a+f.reste},0);
  return '<div class="niv'+(fNiv===String(n)?" on":"")+'" data-n="'+n+'"><div class="n p'+n+'">'+n+'</div><div><p class="t">'+NIV[n].t+'</p><p class="d">'+NIV[n].d+' · '+L.length+' facture'+(L.length>1?"s":"")+'</p></div><div class="m"><b>'+M(m)+'</b><span>F CFA</span></div></div>';
 }).join("");
 Array.prototype.forEach.call($("niveaux").children,function(e){e.onclick=function(){var n=e.getAttribute("data-n");fNiv=fNiv===n?"":n;$("f-niv").value=fNiv;renderNiv();renderReg()}});
}
function renderReg(){
 var q=fQ.trim().toLowerCase();
 var L=facts().filter(function(f){return f.reste>0})
  .filter(function(f){return fNiv===""||(fNiv==="0"?!f.niveau:String(f.niveau)===fNiv)})
  .filter(function(f){return !q||(f.client+" "+f.num).toLowerCase().indexOf(q)>=0})
  .sort(function(a,b){return (b.retard-a.retard)||(b.reste-a.reste)});
 var tot=L.reduce(function(a,f){return a+f.reste},0);
 $("t-count").textContent=L.length+" facture"+(L.length>1?"s":"")+" · "+fmt(tot)+" F CFA";
 var h='<thead><tr><th>Facture</th><th>Client</th>'+(cur==="Groupe"?"<th>Société</th>":"")+'<th>Échéance</th><th class="r">Retard</th><th class="r">Reste dû TTC</th><th>Relance</th></tr></thead><tbody>';
 if(!L.length)h+='<tr><td colspan="7" style="color:#6B6762">Aucune facture pour ce filtre.</td></tr>';
 var shown=(all||fNiv!==""||q)?L:L.slice(0,10);
 shown.forEach(function(f){
  var pill=f.niveau?'<span class="pill p'+f.niveau+'">Niveau '+f.niveau+'</span>':'<span class="pill p0">Non échue</span>';
  if(f.retard>90)pill+=' <span class="pill p0">hors prévision</span>';
  h+='<tr><td>'+esc(f.num)+'</td><td class="cl">'+esc(f.client)+'<small>'+esc(f.design)+'</small></td>'+(cur==="Groupe"?"<td>"+esc(f.soc)+"</td>":"")+'<td>'+dfr(f.ech)+'</td><td class="r retard"'+(f.retard>60?' style="color:'+RED+'"':"")+'>'+(f.retard>0?f.retard+" j":'<span class="dash">–</span>')+'</td><td class="r">'+fmt(f.reste)+'</td><td>'+pill+'</td></tr>';
 });
 $("t-reg").innerHTML=h+"</tbody>";
 var b=$("more");
 if(L.length>10&&fNiv===""&&!q){b.hidden=false;b.textContent=all?"Afficher les 10 plus anciennes":"Afficher les "+L.length+" factures";}else b.hidden=true;
}
function renderTreso(){
 var T=D.treso[cur],fin=T["Solde de fin"].slice(0,13),s=soc(cur),labs=D.semaines.map(dcourt);
 $("cap-treso").textContent="Solde de fin de semaine, "+(cur==="Groupe"?"groupe consolidé":cur);
 mk("c-treso",{type:"line",data:{labels:labs,datasets:[
   {label:"Solde de fin",data:fin,borderColor:O,backgroundColor:"rgba(233,91,15,.10)",fill:true,tension:.3,borderWidth:2.5,
    pointRadius:fin.map(function(v){return v<s.seuil?5:2.5}),pointBackgroundColor:fin.map(function(v){return v<s.seuil?RED:O}),pointBorderWidth:0},
   {label:"Seuil d'alerte",data:fin.map(function(){return s.seuil}),borderColor:RED,borderDash:[5,4],borderWidth:1.5,pointRadius:0,fill:false}]},
  options:{maintainAspectRatio:false,interaction:{mode:"index",intersect:false},
   plugins:{legend:{position:"bottom",align:"start",labels:{boxWidth:12,boxHeight:3,color:MUT,font:{size:12}}},tooltip:Object.assign({},TT,{callbacks:{title:function(c){return "Semaine du "+c[0].label},label:function(c){return " "+c.dataset.label+" : "+fmt(c.raw)+" F"}}})},
   scales:{x:{grid:{display:false},ticks:{color:MUT,maxRotation:0,autoSkip:true,maxTicksLimit:7}},y:{grid:{color:LIN},border:{display:false},ticks:{color:MUT,callback:function(x){return M(x)}}}}}});
 var k=minIdx(fin),enc=T["Total encaissements"][13],dec=T["Total décaissements"][13];
 $("treso-foot").innerHTML="Sur 13 semaines : encaissements <b>"+fmt(enc)+" F</b>, décaissements <b>"+fmt(dec)+" F</b>. Solde prévu à la fin de la semaine du "+dlong(D.semaines[12])+" : <b>"+fmt(fin[12])+" F</b>.";
 // par société
 var names=ORDER.slice(1);
 mk("c-socs",{type:"line",data:{labels:labs,datasets:names.map(function(n){var on=cur==="Groupe"||cur===n;return{label:n,data:D.treso[n]["Solde de fin"].slice(0,13),borderColor:on?SOC_COL[n]:"#E3E1DE",backgroundColor:SOC_COL[n],borderWidth:on?2.2:1.5,pointRadius:0,tension:.3,order:on?0:1}})},
  options:{maintainAspectRatio:false,interaction:{mode:"index",intersect:false},plugins:{legend:{display:false},tooltip:Object.assign({},TT,{callbacks:{title:function(c){return "Semaine du "+c[0].label},label:function(c){return " "+c.dataset.label+" : "+fmt(c.raw)+" F"}}})},
   scales:{x:{grid:{display:false},ticks:{color:MUT,maxRotation:0,autoSkip:true,maxTicksLimit:7}},y:{grid:{color:LIN},border:{display:false},ticks:{color:MUT,callback:function(x){return M(x)}}}}}});
 $("leg-socs").innerHTML=names.map(function(n){return '<span><i style="background:'+SOC_COL[n]+'"></i>'+n+(soc(n).sem_sous>0?' <b style="color:'+RED+'">· '+soc(n).sem_sous+' sem. sous le seuil</b>':'')+'</span>'}).join("");
 // détail
 $("det-scope").textContent=cur==="Groupe"?"groupe consolidé":cur;
 var rows=["Solde de début","Encaissements clients prévus (registre)","Autres encaissements (comptant, SAV)","Total encaissements","Fournisseurs","Salaires","Impôts, taxes et cotisations","Autres décaissements","Total décaissements","Solde de fin"];
 var lab={"Encaissements clients prévus (registre)":"Encaissements clients prévus","Autres encaissements (comptant, SAV)":"Autres encaissements"};
 var h="<thead><tr><th>Semaine du</th>"+D.semaines.map(function(x){return '<th class="r">'+dcourt(x)+"</th>"}).join("")+'<th class="r">13 semaines</th></tr></thead><tbody>';
 rows.forEach(function(r){var t=/^(Total|Solde)/.test(r);h+='<tr class="'+(t?"tot":"")+'"><td>'+(lab[r]||r)+"</td>"+T[r].map(function(v,i){var low=r==="Solde de fin"&&i<13&&v<s.seuil;return '<td class="r'+(low?" low":"")+'">'+fmt(v)+"</td>"}).join("")+"</tr>"});
 $("t-flux").innerHTML=h+"</tbody>";
}
function renderAll(){renderTabs();renderIntro();renderKpis();renderSocs();renderBal();renderNiv();renderReg();renderTreso()}
$("f-niv").onchange=function(){fNiv=this.value;renderNiv();renderReg()};
$("more").onclick=function(){all=!all;renderReg()};
$("f-q").oninput=function(){fQ=this.value;renderReg()};
Chart.defaults.font.family='"Inter",system-ui,sans-serif';Chart.defaults.font.size=12;Chart.defaults.color=MUT;
fetch("data/sacri.json?v=20261118a").then(function(r){return r.json()}).then(function(d){D=d;renderAll()});
})();
