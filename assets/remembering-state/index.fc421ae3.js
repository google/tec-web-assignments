import"../modulepreload-polyfill.c7c6310f.js";import{o as u}from"../index.783118d6.js";class d extends HTMLElement{constructor(){super();const t=this.attachShadow({mode:"open"}),e=document.querySelector("#comment").content.cloneNode(!0);t.append(e),this._name=this.shadowRoot.querySelector(".comment--name"),this._email=this.shadowRoot.querySelector(".comment--email"),this._body=this.shadowRoot.querySelector(".comment--body"),this._time=this.shadowRoot.querySelector(".comment--time")}static get observedAttributes(){return["name","email","body","time"]}attributeChangedCallback(t,e,s){e!==s&&this[`_${t}`]&&(this[`_${t}`].textContent=s)}}customElements.get("my-comment")===void 0&&customElements.define("my-comment",d);const f=u("my-db",1,{upgrade(o){o.createObjectStore("comments",{keyPath:"_id",autoIncrement:!0})}});class h{constructor(t={}){const e=this;this._subscribers=[],f.then(async s=>{this.db=s;const r=await s.getAll("comments");this._state.comments=r,this.filter()}),this._state=new Proxy(t,{async set(s,r,i){if(s[r]=i,e.db&&r==="comments"){const n=i[i.length-1];n&&!(n!=null&&n._id)&&await e.db.add("comments",n)}for(const n of e._subscribers)n(s);return!0}})}subscribe(t){if(typeof t!="function")throw new Error("Callback is not a function");this._subscribers.push(t),t(this._state)}addComment(t){t.date||(t.date=new Date),this._state.comments.push(t),this._state.comments=this._state.comments,this.filter()}filter(t={}){const e=Object.assign(this._state.filters||{},t);this._state.filters=e,this._state.filtered=this._state.comments.filter(s=>{const r=e.name?s.name.toLowerCase().includes(e.name.toLowerCase()):!0,i=e.email?s.email.toLowerCase().includes(e.email.toLowerCase()):!0,n=isNaN(Number(e.length))?!0:s.body.length>=Number(e.length);return r&&i&&n})}filterReset(){this._state.filters={},this.filter()}}const m=new h({comments:[],filtered:[]}),b=document.querySelectorAll("[required]"),c=document.querySelector("#comment-form"),l=document.querySelector("#comments");for(const o of b)o.closest(".form--group").querySelector("label").classList.add("required");c.addEventListener("submit",o=>{o.preventDefault();const t=Object.fromEntries(new FormData(c).entries());console.log(t),m.addComment(t),o.target.reset(),o.target.querySelector("input, textarea, button").focus()});m.subscribe(o=>{const t=o.filtered;console.log(t),l.innerHTML="";for(const e of t){const s=document.createElement("my-comment");s.setAttribute("name",e.name),s.setAttribute("email",e.email),s.setAttribute("body",e.body),s.setAttribute("time",e.date),l.append(s)}});const a=document.querySelector("#filters");a.addEventListener("submit",o=>{o.preventDefault();const t=Object.fromEntries(new FormData(a).entries()),e={name:t["name-filter"],email:t["email-filter"],length:t["length-filter"]};m.filter(e)});a.addEventListener("reset",o=>{m.filterReset(),o.target.querySelector("input, textarea, button").focus()});