import{S as fa,i as ua,s as ha,e as n,t as u,k as p,c as s,a as l,g as h,d as r,n as _,b as d,f as Pt,Q as t,I as ma,_ as ga,x as Q,j as xe,m as $e,o as ta,u as it,v as ea,w as ye,h as _t,X as pa,$ as _a,r as Ee,a4 as va,a5 as ba}from"../chunks/vendor-475ceb10.js";import{b as ya}from"../chunks/env-a13806e5.js";function aa(c,e,o){const f=c.slice();return f[6]=e[o],f}function ra(c){let e,o,f,m,i,a,P,S,k,I,A,H,R,y=c[0]&&na();return{c(){e=n("form"),o=n("label"),f=u("Enter API key to enable download"),m=p(),i=n("div"),a=n("input"),P=p(),S=n("button"),k=u("Enter"),I=p(),y&&y.c(),this.h()},l(D){e=s(D,"FORM",{id:!0,class:!0});var C=l(e);o=s(C,"LABEL",{for:!0});var J=l(o);f=h(J,"Enter API key to enable download"),J.forEach(r),m=_(C),i=s(C,"DIV",{id:!0,class:!0});var M=l(i);a=s(M,"INPUT",{class:!0,id:!0,placeholder:!0,type:!0}),P=_(M),S=s(M,"BUTTON",{type:!0,class:!0});var X=l(S);k=h(X,"Enter"),X.forEach(r),I=_(M),y&&y.l(M),M.forEach(r),C.forEach(r),this.h()},h(){d(o,"for","apiKey"),d(a,"class","form-control form-group-api-key-item svelte-1ra4b4o"),d(a,"id","apiKey"),d(a,"placeholder","secret-token:tradingstrategy-"),d(a,"type","text"),d(S,"type","submit"),d(S,"class","btn btn-primary form-group-api-key-item"),S.disabled=c[0],d(i,"id","form-group-api-key"),d(i,"class","svelte-1ra4b4o"),d(e,"id","form-api-key"),d(e,"class","form-group")},m(D,C){Pt(D,e,C),t(e,o),t(o,f),t(e,m),t(e,i),t(i,a),t(i,P),t(i,S),t(S,k),t(i,I),y&&y.m(i,null),A=!0,H||(R=ma(e,"submit",ga(c[5])),H=!0)},p(D,C){(!A||C&1)&&(S.disabled=D[0]),D[0]?y?C&1&&Q(y,1):(y=na(),y.c(),Q(y,1),y.m(i,null)):y&&(Ee(),it(y,1,1,()=>{y=null}),ye())},i(D){A||(Q(y),A=!0)},o(D){it(y),A=!1},d(D){D&&r(e),y&&y.d(),H=!1,R()}}}function na(c){let e,o;return e=new va({}),{c(){xe(e.$$.fragment)},l(f){$e(e.$$.fragment,f)},m(f,m){ta(e,f,m),o=!0},i(f){o||(Q(e.$$.fragment,f),o=!0)},o(f){it(e.$$.fragment,f),o=!1},d(f){ea(e,f)}}}function sa(c){let e,o,f;return{c(){e=n("div"),o=n("span"),f=u(c[2]),this.h()},l(m){e=s(m,"DIV",{class:!0,role:!0});var i=l(e);o=s(i,"SPAN",{class:!0});var a=l(o);f=h(a,c[2]),a.forEach(r),i.forEach(r),this.h()},h(){d(o,"class","alert-inner--text"),d(e,"class","alert alert-danger shadow-soft"),d(e,"role","alert")},m(m,i){Pt(m,e,i),t(e,o),t(o,f)},p(m,i){i&4&&_t(f,m[2])},d(m){m&&r(e)}}}function la(c){let e,o,f,m;return{c(){e=n("p"),o=u("Using API key "),f=n("strong"),m=u(c[1])},l(i){e=s(i,"P",{});var a=l(e);o=h(a,"Using API key "),f=s(a,"STRONG",{});var P=l(f);m=h(P,c[1]),P.forEach(r),a.forEach(r)},m(i,a){Pt(i,e,a),t(e,o),t(e,f),t(f,m)},p(i,a){a&2&&_t(m,i[1])},d(i){i&&r(e)}}}function oa(c){let e,o,f=c[6].name+"",m,i,a,P=c[6].designation+"",S,k,I,A=ia(c[6].entries)+"",H,R,y,D=da(c[6].size)+"",C,J,M,X=c[6].format+"",rt,K,et,U,dt,Y,V,ct,nt,Z,B,ft,W,st,lt,ut,F;return U=new ba({props:{relative:!0,timestamp:new Date(c[6].last_updated_at*1e3)}}),{c(){e=n("tr"),o=n("td"),m=u(f),i=p(),a=n("td"),S=u(P),k=p(),I=n("td"),H=u(A),R=p(),y=n("td"),C=u(D),J=p(),M=n("td"),rt=u(X),K=p(),et=n("td"),xe(U.$$.fragment),dt=p(),Y=n("td"),V=n("a"),ct=u("Documentation"),Z=p(),B=n("a"),ft=u("Download"),ut=p(),this.h()},l(E){e=s(E,"TR",{});var v=l(e);o=s(v,"TD",{});var G=l(o);m=h(G,f),G.forEach(r),i=_(v),a=s(v,"TD",{});var vt=l(a);S=h(vt,P),vt.forEach(r),k=_(v),I=s(v,"TD",{});var x=l(I);H=h(x,A),x.forEach(r),R=_(v),y=s(v,"TD",{});var bt=l(y);C=h(bt,D),bt.forEach(r),J=_(v),M=s(v,"TD",{});var yt=l(M);rt=h(yt,X),yt.forEach(r),K=_(v),et=s(v,"TD",{});var Et=l(et);$e(U.$$.fragment,Et),Et.forEach(r),dt=_(v),Y=s(v,"TD",{});var $=l(Y);V=s($,"A",{class:!0,href:!0});var kt=l(V);ct=h(kt,"Documentation"),kt.forEach(r),Z=_($),B=s($,"A",{class:!0,target:!0,href:!0,disabled:!0});var Dt=l(B);ft=h(Dt,"Download"),Dt.forEach(r),$.forEach(r),ut=_(v),v.forEach(r),this.h()},h(){d(V,"class","action-link svelte-1ra4b4o"),d(V,"href",nt=c[6].documentation),d(B,"class","action-link svelte-1ra4b4o"),d(B,"target",W=c[1]?"_blank":void 0),d(B,"href",st=c[4](c[1],c[6].download_link)),d(B,"disabled",lt=c[1]?void 0:"disabled")},m(E,v){Pt(E,e,v),t(e,o),t(o,m),t(e,i),t(e,a),t(a,S),t(e,k),t(e,I),t(I,H),t(e,R),t(e,y),t(y,C),t(e,J),t(e,M),t(M,rt),t(e,K),t(e,et),ta(U,et,null),t(e,dt),t(e,Y),t(Y,V),t(V,ct),t(Y,Z),t(Y,B),t(B,ft),t(e,ut),F=!0},p(E,v){(!F||v&8)&&f!==(f=E[6].name+"")&&_t(m,f),(!F||v&8)&&P!==(P=E[6].designation+"")&&_t(S,P),(!F||v&8)&&A!==(A=ia(E[6].entries)+"")&&_t(H,A),(!F||v&8)&&D!==(D=da(E[6].size)+"")&&_t(C,D),(!F||v&8)&&X!==(X=E[6].format+"")&&_t(rt,X);const G={};v&8&&(G.timestamp=new Date(E[6].last_updated_at*1e3)),U.$set(G),(!F||v&8&&nt!==(nt=E[6].documentation))&&d(V,"href",nt),(!F||v&2&&W!==(W=E[1]?"_blank":void 0))&&d(B,"target",W),(!F||v&10&&st!==(st=E[4](E[1],E[6].download_link)))&&d(B,"href",st),(!F||v&2&&lt!==(lt=E[1]?void 0:"disabled"))&&d(B,"disabled",lt)},i(E){F||(Q(U.$$.fragment,E),F=!0)},o(E){it(U.$$.fragment,E),F=!1},d(E){E&&r(e),ea(U)}}}function Ea(c){let e,o,f,m,i,a,P,S,k,I,A,H,R,y,D,C,J,M,X,rt,K,et,U,dt,Y,V,ct,nt,Z,B,ft,W,st,lt,ut,F,E,v,G,vt,x,bt,yt,Et,$,kt,Dt,St,Wt,Qt,at,It,ht,Jt,Zt,Lt,mt,xt,$t,qt,gt,te,ee,Ht,ae,re,jt,Vt,zt,At,ot,Ft,N,Ct,ne,se,Mt,le,oe,Kt,ie,de,Nt,ce,fe,Rt,ue,he,Ut,me,ge,Bt,pe,_e,Tt,Gt,L=!c[1]&&ra(c),O=c[2]&&sa(c),j=c[1]&&la(c),pt=c[3],T=[];for(let g=0;g<pt.length;g+=1)T[g]=oa(aa(c,pt,g));const ca=g=>it(T[g],1,1,()=>{T[g]=null});return{c(){e=n("meta"),o=p(),f=n("div"),m=n("section"),i=n("div"),a=n("div"),P=n("h1"),S=u("On-chain trading data for backtesting"),k=p(),I=n("p"),A=u(`The following on-chain trade and liquidity datasets are available for decentralised finance (DeFi) research,
					cryptocurrency algorithmic trading, automated trading strategy research and execution.`),H=p(),R=n("p"),y=u("You can download the datasets with an API key. Request an API key via Telegram or "),D=n("a"),C=u("Python client registration."),J=p(),M=n("h2"),X=u("Supported blockchains and DEXes"),rt=p(),K=n("p"),et=u(`These datasets contain trade and liquidity data from several blockchains and
					`),U=n("a"),dt=u("automatic market maker (AMM)"),Y=u(` exchanges. The supported blockchains include popular
					Ethereum, Binance Smart Chain `),V=n("span"),ct=u("Coming soon"),nt=u(", Polygon "),Z=n("span"),B=u("Coming soon"),ft=u(`
					and Avalanche `),W=n("span"),st=u("Coming soon"),lt=u("."),ut=p(),F=n("h2"),E=u("Data logistics"),v=p(),G=n("p"),vt=u("Datasets are distributed in "),x=n("a"),bt=u("Parquet"),yt=u(` file format
					designed for data research. Parquet is a columnar data format for high performance in-memory datasets from Apache Arrow project.`),Et=p(),$=n("p"),kt=u(`Datasets are large. Datasets are compressed using Parquet built-in Snappy compression and may be considerably larger when expanded to RAM.
					We expect you to download the dataset, cache the resulting file on a local disk and
					perform your own strategy specific trading pair filtering before using the data. Uncompressed one minute
					candle data takes several gigabyte of memory.`),Dt=p(),St=n("h2"),Wt=u("Learn more"),Qt=p(),at=n("ul"),It=n("li"),ht=n("a"),Jt=u("Getting started"),Zt=p(),Lt=n("li"),mt=n("a"),xt=u("Documentation"),$t=p(),qt=n("li"),gt=n("a"),te=u("Github"),ee=p(),Ht=n("h2"),ae=u("Available datasets"),re=p(),L&&L.c(),jt=p(),O&&O.c(),Vt=p(),j&&j.c(),zt=p(),At=n("div"),ot=n("table"),Ft=n("thead"),N=n("tr"),Ct=n("th"),ne=u("Name"),se=p(),Mt=n("th"),le=u("Tag"),oe=p(),Kt=n("th"),ie=u("Entry count (k)"),de=p(),Nt=n("th"),ce=u("Size (MBytes)"),fe=p(),Rt=n("th"),ue=u("Format"),he=p(),Ut=n("th"),me=u("Last updated"),ge=p(),Bt=n("th"),pe=u("Links"),_e=p(),Tt=n("tbody");for(let g=0;g<T.length;g+=1)T[g].c();this.h()},l(g){const q=pa('[data-svelte="svelte-1z0fwv1"]',document.head);e=s(q,"META",{name:!0,content:!0}),q.forEach(r),o=_(g),f=s(g,"DIV",{class:!0});var w=l(f);m=s(w,"SECTION",{class:!0});var Ot=l(m);i=s(Ot,"DIV",{class:!0});var ke=l(i);a=s(ke,"DIV",{class:!0});var b=l(a);P=s(b,"H1",{});var De=l(P);S=h(De,"On-chain trading data for backtesting"),De.forEach(r),k=_(b),I=s(b,"P",{});var Ae=l(I);A=h(Ae,`The following on-chain trade and liquidity datasets are available for decentralised finance (DeFi) research,
					cryptocurrency algorithmic trading, automated trading strategy research and execution.`),Ae.forEach(r),H=_(b),R=s(b,"P",{});var ve=l(R);y=h(ve,"You can download the datasets with an API key. Request an API key via Telegram or "),D=s(ve,"A",{href:!0,class:!0});var Te=l(D);C=h(Te,"Python client registration."),Te.forEach(r),ve.forEach(r),J=_(b),M=s(b,"H2",{});var we=l(M);X=h(we,"Supported blockchains and DEXes"),we.forEach(r),rt=_(b),K=s(b,"P",{});var tt=l(K);et=h(tt,`These datasets contain trade and liquidity data from several blockchains and
					`),U=s(tt,"A",{href:!0,class:!0});var Pe=l(U);dt=h(Pe,"automatic market maker (AMM)"),Pe.forEach(r),Y=h(tt,` exchanges. The supported blockchains include popular
					Ethereum, Binance Smart Chain `),V=s(tt,"SPAN",{class:!0});var Se=l(V);ct=h(Se,"Coming soon"),Se.forEach(r),nt=h(tt,", Polygon "),Z=s(tt,"SPAN",{class:!0});var Ie=l(Z);B=h(Ie,"Coming soon"),Ie.forEach(r),ft=h(tt,`
					and Avalanche `),W=s(tt,"SPAN",{class:!0});var Le=l(W);st=h(Le,"Coming soon"),Le.forEach(r),lt=h(tt,"."),tt.forEach(r),ut=_(b),F=s(b,"H2",{});var qe=l(F);E=h(qe,"Data logistics"),qe.forEach(r),v=_(b),G=s(b,"P",{});var Xt=l(G);vt=h(Xt,"Datasets are distributed in "),x=s(Xt,"A",{href:!0,class:!0});var He=l(x);bt=h(He,"Parquet"),He.forEach(r),yt=h(Xt,` file format
					designed for data research. Parquet is a columnar data format for high performance in-memory datasets from Apache Arrow project.`),Xt.forEach(r),Et=_(b),$=s(b,"P",{});var Fe=l($);kt=h(Fe,`Datasets are large. Datasets are compressed using Parquet built-in Snappy compression and may be considerably larger when expanded to RAM.
					We expect you to download the dataset, cache the resulting file on a local disk and
					perform your own strategy specific trading pair filtering before using the data. Uncompressed one minute
					candle data takes several gigabyte of memory.`),Fe.forEach(r),Dt=_(b),St=s(b,"H2",{});var Ce=l(St);Wt=h(Ce,"Learn more"),Ce.forEach(r),Qt=_(b),at=s(b,"UL",{});var wt=l(at);It=s(wt,"LI",{});var Me=l(It);ht=s(Me,"A",{href:!0,class:!0});var Ke=l(ht);Jt=h(Ke,"Getting started"),Ke.forEach(r),Me.forEach(r),Zt=_(wt),Lt=s(wt,"LI",{});var Ne=l(Lt);mt=s(Ne,"A",{href:!0,class:!0});var Re=l(mt);xt=h(Re,"Documentation"),Re.forEach(r),Ne.forEach(r),$t=_(wt),qt=s(wt,"LI",{});var Ue=l(qt);gt=s(Ue,"A",{href:!0,class:!0});var Be=l(gt);te=h(Be,"Github"),Be.forEach(r),Ue.forEach(r),wt.forEach(r),ee=_(b),Ht=s(b,"H2",{});var Oe=l(Ht);ae=h(Oe,"Available datasets"),Oe.forEach(r),re=_(b),L&&L.l(b),jt=_(b),O&&O.l(b),Vt=_(b),j&&j.l(b),zt=_(b),At=s(b,"DIV",{class:!0});var je=l(At);ot=s(je,"TABLE",{class:!0});var Yt=l(ot);Ft=s(Yt,"THEAD",{});var Ve=l(Ft);N=s(Ve,"TR",{});var z=l(N);Ct=s(z,"TH",{});var ze=l(Ct);ne=h(ze,"Name"),ze.forEach(r),se=_(z),Mt=s(z,"TH",{});var Ge=l(Mt);le=h(Ge,"Tag"),Ge.forEach(r),oe=_(z),Kt=s(z,"TH",{});var Xe=l(Kt);ie=h(Xe,"Entry count (k)"),Xe.forEach(r),de=_(z),Nt=s(z,"TH",{});var Ye=l(Nt);ce=h(Ye,"Size (MBytes)"),Ye.forEach(r),fe=_(z),Rt=s(z,"TH",{});var We=l(Rt);ue=h(We,"Format"),We.forEach(r),he=_(z),Ut=s(z,"TH",{});var Qe=l(Ut);me=h(Qe,"Last updated"),Qe.forEach(r),ge=_(z),Bt=s(z,"TH",{});var Je=l(Bt);pe=h(Je,"Links"),Je.forEach(r),z.forEach(r),Ve.forEach(r),_e=_(Yt),Tt=s(Yt,"TBODY",{});var Ze=l(Tt);for(let be=0;be<T.length;be+=1)T[be].l(Ze);Ze.forEach(r),Yt.forEach(r),je.forEach(r),b.forEach(r),ke.forEach(r),Ot.forEach(r),w.forEach(r),this.h()},h(){document.title="DEX trading and quantative finance datasets",d(e,"name","description"),d(e,"content","Download OHLCV and liquidity data for DEXes"),d(D,"href","https://tradingstrategy.ai/docs/"),d(D,"class","svelte-1ra4b4o"),d(U,"href","https://tradingstrategy.ai/docs/glossary.html#term-AMM"),d(U,"class","svelte-1ra4b4o"),d(V,"class","badge text-uppercase"),d(Z,"class","badge text-uppercase"),d(W,"class","badge text-uppercase"),d(x,"href","https://parquet.apache.org/"),d(x,"class","svelte-1ra4b4o"),d(ht,"href","https://tradingstrategy.ai/docs/"),d(ht,"class","svelte-1ra4b4o"),d(mt,"href","https://tradingstrategy.ai/docs/"),d(mt,"class","svelte-1ra4b4o"),d(gt,"href","https://github.com/tradingstrategy-ai/client"),d(gt,"class","svelte-1ra4b4o"),d(ot,"class","table table-datasets svelte-1ra4b4o"),d(At,"class","table-responsive"),d(a,"class","card-body svelte-1ra4b4o"),d(i,"class","card"),d(m,"class","md-12"),d(f,"class","container container-main")},m(g,q){t(document.head,e),Pt(g,o,q),Pt(g,f,q),t(f,m),t(m,i),t(i,a),t(a,P),t(P,S),t(a,k),t(a,I),t(I,A),t(a,H),t(a,R),t(R,y),t(R,D),t(D,C),t(a,J),t(a,M),t(M,X),t(a,rt),t(a,K),t(K,et),t(K,U),t(U,dt),t(K,Y),t(K,V),t(V,ct),t(K,nt),t(K,Z),t(Z,B),t(K,ft),t(K,W),t(W,st),t(K,lt),t(a,ut),t(a,F),t(F,E),t(a,v),t(a,G),t(G,vt),t(G,x),t(x,bt),t(G,yt),t(a,Et),t(a,$),t($,kt),t(a,Dt),t(a,St),t(St,Wt),t(a,Qt),t(a,at),t(at,It),t(It,ht),t(ht,Jt),t(at,Zt),t(at,Lt),t(Lt,mt),t(mt,xt),t(at,$t),t(at,qt),t(qt,gt),t(gt,te),t(a,ee),t(a,Ht),t(Ht,ae),t(a,re),L&&L.m(a,null),t(a,jt),O&&O.m(a,null),t(a,Vt),j&&j.m(a,null),t(a,zt),t(a,At),t(At,ot),t(ot,Ft),t(Ft,N),t(N,Ct),t(Ct,ne),t(N,se),t(N,Mt),t(Mt,le),t(N,oe),t(N,Kt),t(Kt,ie),t(N,de),t(N,Nt),t(Nt,ce),t(N,fe),t(N,Rt),t(Rt,ue),t(N,he),t(N,Ut),t(Ut,me),t(N,ge),t(N,Bt),t(Bt,pe),t(ot,_e),t(ot,Tt);for(let w=0;w<T.length;w+=1)T[w].m(Tt,null);Gt=!0},p(g,[q]){if(g[1]?L&&(Ee(),it(L,1,1,()=>{L=null}),ye()):L?(L.p(g,q),q&2&&Q(L,1)):(L=ra(g),L.c(),Q(L,1),L.m(a,jt)),g[2]?O?O.p(g,q):(O=sa(g),O.c(),O.m(a,Vt)):O&&(O.d(1),O=null),g[1]?j?j.p(g,q):(j=la(g),j.c(),j.m(a,zt)):j&&(j.d(1),j=null),q&26){pt=g[3];let w;for(w=0;w<pt.length;w+=1){const Ot=aa(g,pt,w);T[w]?(T[w].p(Ot,q),Q(T[w],1)):(T[w]=oa(Ot),T[w].c(),Q(T[w],1),T[w].m(Tt,null))}for(Ee(),w=pt.length;w<T.length;w+=1)ca(w);ye()}},i(g){if(!Gt){Q(L);for(let q=0;q<pt.length;q+=1)Q(T[q]);Gt=!0}},o(g){it(L),T=T.filter(Boolean);for(let q=0;q<T.length;q+=1)it(T[q]);Gt=!1},d(g){r(e),g&&r(o),g&&r(f),L&&L.d(),O&&O.d(),j&&j.d(),_a(T,g)}}}const wa=!0,Pa=ya;async function Sa({page:c,session:e,fetch:o,context:f}){const m="https://candlelightdinner.tradingstrategy.ai/datasets",i=await o(m),a=await i.json();return i.ok?{props:{datasets:a}}:{status:i.status,error:new Error(`Could not load ${m}`)}}const ka="https://candlelightdinner.tradingstrategy.ai";function ia(c){return c<=1e3?(c/1e3).toLocaleString("en",{minimumFractionDigits:3,maximumFractionDigits:3}):(c/1e3).toLocaleString("en",{minimumFractionDigits:0,maximumFractionDigits:0})}function da(c){return c<=1024*1024?(c/(1024*1024)).toLocaleString("en",{minimumFractionDigits:3,maximumFractionDigits:3}):(c/(1024*1024)).toLocaleString("en",{minimumFractionDigits:0,maximumFractionDigits:0})}function Da(c,e,o){let{datasets:f}=e,{submitting:m=!1}=e,{validApiKey:i=null}=e,{apiKeyError:a=null}=e;function P(k,I){if(!i)return"javascript:";const A=new URL(I);return A.searchParams.set("api-key",k),A.toString()}async function S(k){const I=`${ka}/validate-api-key`;let A=k.target.apiKey.value;A=A.trim(),o(2,a=null),o(0,m=!0);try{console.log("Posting to",I);const H=await fetch(I,{method:"POST",body:new URLSearchParams({key:A})});if(H.status!=200){o(2,a=`Server failure: ${H.status} ${H.statusText}`);return}const R=await H.json();console.log("Got validation response",R),R.valid||o(2,a="The API key is not valid"),o(1,i=A)}catch(H){o(2,a=H.toString())}finally{o(0,m=!1)}}return c.$$set=k=>{"datasets"in k&&o(3,f=k.datasets),"submitting"in k&&o(0,m=k.submitting),"validApiKey"in k&&o(1,i=k.validApiKey),"apiKeyError"in k&&o(2,a=k.apiKeyError)},[m,i,a,f,P,S]}class Ia extends fa{constructor(e){super();ua(this,e,Da,Ea,ha,{datasets:3,submitting:0,validApiKey:1,apiKeyError:2})}}export{Ia as default,wa as hydrate,Sa as load,Pa as router};
