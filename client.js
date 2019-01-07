!function(e){var t={};function n(o){if(t[o])return t[o].exports;var a=t[o]={i:o,l:!1,exports:{}};return e[o].call(a.exports,a,a.exports,n),a.l=!0,a.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var a in e)n.d(o,a,function(t){return e[t]}.bind(null,a));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="/",n(n.s=0)}([function(module,exports,__webpack_require__){__webpack_require__(1);const VoiceRecognition=annyang;class AlexClient{constructor(...config){config.length&&(this.commands=config[0].concat([{commands:["+","-","*","/","pi"],onMatch:(data,match,allData)=>{if(!1!==this.options.math){data=data.replace(/divided by/g,"/"),data=data.replace(/ million/g,"000000"),data=data.replace(/ billion/g,"000000000"),data=data.replace(/ trillion/g,"000000000000"),data=data.replace(/pi/g,"3.14159265359");try{this.localDispatch("calculator",parseInt(eval(data).toFixed(0),10))}catch(e){this.localDispatch("error","Sorry, I'm not able to translate "+data+" into a formula for you. Please try again.")}}}},{commands:["who is the","who are the","who is","who are","whos the","whos"],onMatch:e=>{!1!==this.options.wiki&&(e=e.replace("'",""),this.localDispatch("who is",e))}},{commands:["what is the","what are the","what is","what are","whats the","whats"],onMatch:e=>{!1!==this.options.wiki&&(e=e.replace("'",""),this.localDispatch("what is",e))}},{commands:["search for","google for","search","google"],onMatch:(e,t)=>{"string"==typeof this.options.search?this.search(e.replace(t,"").replace(/ /g,"+"),{engine:this.options.search}):"boolean"==typeof this.options.search&&!1!==this.options.search&&this.say("Only a search engine url, or false value can be passed to the search config option.")}},{commands:["find"],onMatch:(e,t)=>{this.find(e,{})}},{commands:["open"],request:(e,t)=>{this.open(e.replace(t,"").replace(/ /g,""))}}]),this.options=Object.assign({math:!0,wiki:!0,XHRUrl:"/",port:"8025",find:"/",search:"//www.google.com"},config[1]?config[1]:{}),this.commands.length?(this.latLng=[],navigator.geolocation.getCurrentPosition(e=>{this.latLng=[e.coords.latitude,e.coords.longitude]}),this.commands.length&&this.init()):this.say("Alex installed, but no commands found."))}say(e,t){"object"==typeof e&&(e=e[Math.floor(Math.random()*e.length)]),this.localDispatch("say",e,()=>{"function"==typeof t&&t()})}run(e,t,n){this.localDispatch(e,t,e=>{"function"==typeof n&&n(e)})}ask(e,t,n){this.say(e,()=>{this.listenForFeedback(t,e=>{"function"==typeof n&&(this.listenForCommands(),n(e))})})}find(e,t,n){this.localDispatch("find",e,e=>{this.say(e,()=>{this.listenForFeedback(t,e=>{"yes"===e&&this.localDispatch("batchOpen",[query,e],()=>{this.listenForCommands(),"function"==typeof n&&n()})})})})}search(e,t,n){this.localDispatch("search",e,e=>{this.say(e,()=>{"function"==typeof n&&n(e)})})}open(e,t,n){this.localDispatch("open",e,e=>{this.say(e,()=>{"function"==typeof n&&n(e)})})}localDispatch(e,t,n){const o=new XMLHttpRequest;o.open("GET","http://localhost:"+this.options.port+this.options.XHRUrl+"?task="+e+"&data="+t,!0),o.onreadystatechange=(()=>{4==o.readyState&&200==o.status&&"function"==typeof n&&n(o.responseText),VoiceRecognition.start()}),VoiceRecognition.abort(),o.send()}remoteDispatch(e,t){const n=new XMLHttpRequest;n.open("GET",e,!0),n.onreadystatechange=(()=>{4==n.readyState&&200==n.status&&"function"==typeof t&&t(n.responseText),VoiceRecognition.start()}),VoiceRecognition.abort(),n.send()}listenForCommands(e){VoiceRecognition.removeCallback("result"),VoiceRecognition.addCallback("result",e=>{let t=e[0].toLowerCase().trim();t.replace("alex","").length&&(t=t.replace("alex",""));let n=!1,o=[],a=[];Object.keys(this.commands).map(r=>{o=this.commands[r],a=o.commands,!0!==n&&Object.keys(a).map(r=>{!0!==n&&-1!==t.indexOf(a[r])&&("function"==typeof o.onMatch&&o.onMatch(t,a[r],e),n=!0)})})}),VoiceRecognition.start(),"function"==typeof e&&e()}listenForFeedback(e,t){e=Object.assign({retry:3,retryInterval:1e4,retryMessages:[],givenupMessages:["Perhaps we should try this again later."],cancels:[],cancelMessages:["Ok.","Sure.","Absolutly.","Stopped."]},e);let n=void 0;e.retryMessages.length&&(n=setTimeout(()=>{let o=e.retryMessages[Math.floor(Math.random()*e.retryMessages.length)];0===e.retry&&(o=e.givenupMessages[Math.floor(Math.random()*e.givenupMessages.length)]),this.localDispatch("error",o,()=>{e.retry>0?("int"==typeof e.retry&&(e.retry=e.retry-1),this.listenForFeedback(t,e)):(clearTimeout(n),this.listenForCommands())})},e.retryInterval)),VoiceRecognition.removeCallback("result"),VoiceRecognition.addCallback("result",o=>{o=o[0].toLowerCase().trim();let a=!1;e.cancels.length&&Object.keys(e.cancels).map(t=>{-1!==o.indexOf(e.cancels[t])&&(a=!0)}),"function"==typeof t&&(clearTimeout(n),a?this.localDispatch("error",e.cancelMessages[Math.floor(Math.random()*e.cancelMessages.length)],()=>{this.listenForCommands()}):t(o))}),VoiceRecognition.start()}init(){this.listenForCommands()}}module.exports=AlexClient},function(e,t,n){"use strict";var o,a,r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};a="undefined"!=typeof window?window:void 0,void 0===(o=function(){return a.annyang=function(e,t){var n,o=e.SpeechRecognition||e.webkitSpeechRecognition||e.mozSpeechRecognition||e.msSpeechRecognition||e.oSpeechRecognition;if(!o)return null;var a,i,s=[],c={start:[],error:[],end:[],soundstart:[],result:[],resultMatch:[],resultNoMatch:[],errorNetwork:[],errorPermissionBlocked:[],errorPermissionDenied:[]},l=0,u=0,h=!1,p="font-weight: bold; color: #00f;",f=!1,d=!1,g=/\s*\((.*?)\)\s*/g,m=/(\(\?:[^)]+\))\?/g,y=/(\(\?)?:\w+/g,b=/\*\w+/g,w=/[\-{}\[\]+?.,\\\^$|#]/g,v=function(e){for(var t=arguments.length,n=Array(1<t?t-1:0),o=1;o<t;o++)n[o-1]=arguments[o];e.forEach(function(e){e.callback.apply(e.context,n)})},M=function(){return a!==t},k=function(e,t){-1!==e.indexOf("%c")||t?console.log(e,t||p):console.log(e)},x=function(){M()||n.init({},!1)},R=function(e,t,n){s.push({command:e,callback:t,originalPhrase:n}),h&&k("Command successfully loaded: %c"+n,p)},S=function(e){var t;v(c.result,e);for(var n=0;n<e.length;n++){t=e[n].trim(),h&&k("Speech recognized: %c"+t,p);for(var o=0,a=s.length;o<a;o++){var r=s[o],i=r.command.exec(t);if(i){var l=i.slice(1);return h&&(k("command matched: %c"+r.originalPhrase,p),l.length&&k("with parameters",l)),r.callback.apply(this,l),void v(c.resultMatch,t,r.originalPhrase,e)}}}v(c.resultNoMatch,e)};return n={init:function(r){var p=!(1<arguments.length&&arguments[1]!==t)||arguments[1];a&&a.abort&&a.abort(),(a=new o).maxAlternatives=5,a.continuous="http:"===e.location.protocol,a.lang="en-US",a.onstart=function(){d=!0,v(c.start)},a.onsoundstart=function(){v(c.soundstart)},a.onerror=function(e){switch(v(c.error,e),e.error){case"network":v(c.errorNetwork,e);break;case"not-allowed":case"service-not-allowed":i=!1,(new Date).getTime()-l<200?v(c.errorPermissionBlocked,e):v(c.errorPermissionDenied,e)}},a.onend=function(){if(d=!1,v(c.end),i){var e=(new Date).getTime()-l;(u+=1)%10==0&&h&&k("Speech Recognition is repeatedly stopping and starting. See http://is.gd/annyang_restarts for tips."),e<1e3?setTimeout(function(){n.start({paused:f})},1e3-e):n.start({paused:f})}},a.onresult=function(e){if(f)return h&&k("Speech heard, but annyang is paused"),!1;for(var t=e.results[e.resultIndex],n=[],o=0;o<t.length;o++)n[o]=t[o].transcript;S(n)},p&&(s=[]),r.length&&this.addCommands(r)},start:function(e){x(),f=(e=e||{}).paused!==t&&!!e.paused,i=e.autoRestart===t||!!e.autoRestart,e.continuous!==t&&(a.continuous=!!e.continuous),l=(new Date).getTime();try{a.start()}catch(e){h&&k(e.message)}},abort:function(){i=!1,u=0,M()&&a.abort()},pause:function(){f=!0},resume:function(){n.start()},debug:function(){var e=!(0<arguments.length&&arguments[0]!==t)||arguments[0];h=!!e},setLanguage:function(e){x(),a.lang=e},addCommands:function(t){var n,o;for(var a in x(),t)if(t.hasOwnProperty(a))if("function"==typeof(n=e[t[a]]||t[a]))R((o=(o=a).replace(w,"\\$&").replace(g,"(?:$1)?").replace(y,function(e,t){return t?e:"([^\\s]+)"}).replace(b,"(.*?)").replace(m,"\\s*$1?\\s*"),new RegExp("^"+o+"$","i")),n,a);else{if(!("object"===(void 0===n?"undefined":r(n))&&n.regexp instanceof RegExp)){h&&k("Can not register command: %c"+a,p);continue}R(new RegExp(n.regexp.source,"i"),n.callback,a)}},removeCommands:function(e){e===t?s=[]:(e=Array.isArray(e)?e:[e],s=s.filter(function(t){for(var n=0;n<e.length;n++)if(e[n]===t.originalPhrase)return!1;return!0}))},addCallback:function(n,o,a){var r=e[o]||o;"function"==typeof r&&c[n]!==t&&c[n].push({callback:r,context:a||this})},removeCallback:function(e,n){var o=function(e){return e.callback!==n};for(var a in c)c.hasOwnProperty(a)&&(e!==t&&e!==a||(c[a]=n===t?[]:c[a].filter(o)))},isListening:function(){return d&&!f},getSpeechRecognizer:function(){return a},trigger:function(e){n.isListening()?(Array.isArray(e)||(e=[e]),S(e)):h&&k(d?"Speech heard, but annyang is paused":"Cannot trigger while annyang is aborted")}}}(a)}.apply(t,[]))||(e.exports=o)}]);