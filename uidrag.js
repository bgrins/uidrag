//addEventListener polyfill 1.0 / Eirik Backer / MIT Licence.
// Can remove if you don't need to support IE.
(function(win, doc){
    if(win.addEventListener)return;     //No need to polyfill

    function docHijack(p){var old = doc[p];doc[p] = function(v){return addListen(old(v))}}
    function addEvent(on, fn, self){
        return (self = this).attachEvent('on' + on, function(e){
            var e = e || win.event;
            e.preventDefault  = e.preventDefault  || function(){e.returnValue = false}
            e.stopPropagation = e.stopPropagation || function(){e.cancelBubble = true}
            fn.call(self, e);
        });
    }
    function addListen(obj, i){
        if(i = obj.length)while(i--)obj[i].addEventListener = addEvent;
        else obj.addEventListener = addEvent;
        return obj;
    }

    addListen([doc, win]);
    if('Element' in win)win.Element.prototype.addEventListener = addEvent;          //IE8
    else{       //IE < 8
        doc.attachEvent('onreadystatechange', function(){addListen(doc.all)});      //Make sure we also init at domReady
        docHijack('getElementsByTagName');
        docHijack('getElementById');
        docHijack('createElement');
        addListen(doc.all); 
    }
})(window, document);


// uidrag polyfill.
// Brian Grinstead / MIT License
(function(window, document, $) {

    var jQueryExists = typeof $ === "undefined";
    
    if (!("addEventListener" in document)) {
        return;    
    }
        
    function bind(el, name, cb) {
        if (typeof name === "object") {
            for (var i in name) {
                el.addEventListener(i, name[i], false); 
            }   
        }
        else {
             el.addEventListener(name, cb, false);   
        }
    }
    
    function unbind(el, name, cb) {
        if (typeof name === "object") {
            for (var i in name) {
                el.removeEventListener(i, name[i], false); 
            }   
        }
        else {
             el.removeEventListener(name, cb, false);   
        }
    }
    

    // window.addEventListener("load", function() {

    //     document.addEventListener("mousedown")
    //     draggable(document);



    // }, false);
        
        
        
    window.tinydrag = draggable;
        
    function draggable(element, onmove, onstart, onstop) {

        onmove = onmove || function() { };
        onstart = onstart || function() { };
        onstop = onstop || function() { };
        
        var doc = element.ownerDocument || document;
        var dragging = false;
        var offset = { };
        var maxHeight = 0;
        var maxWidth = 0;
        var IE = !!/(msie)/i.exec(navigator.userAgent);
        var hasTouch = ('ontouchstart' in window);
        
        var duringDragEvents = { };
        duringDragEvents["selectstart"] = prevent;
        duringDragEvents["dragstart"] = prevent;
        duringDragEvents[(hasTouch ? "touchmove" : "mousemove")] = move;
        duringDragEvents[(hasTouch ? "touchend" : "mouseup")] = stop;

        function prevent(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.returnValue = false;
        }
        
        function move(e) {
            if (dragging) {
                // Mouseup happened outside of window
                if (IE && !(document.documentMode >= 9) && !e.button) {
                    return stop();
                }
                
                var touches =  e.touches;
                var pageX = touches ? touches[0].pageX : e.pageX;
                var pageY = touches ? touches[0].pageY : e.pageY;
                
                var dragX = Math.max(0, Math.min(pageX - offset.left, maxWidth));
                var dragY = Math.max(0, Math.min(pageY - offset.top, maxHeight));
                
                if (hasTouch) {
                    // Stop scrolling in iOS
                    prevent(e);
                }
                
                            
                //var evt = doc.createEvent('Event');
                //evt.initEvent('uidrag', true, true);


                var evt = new CustomEvent('uidrag');
                evt.initCustomEvent('uidrag', true, true, {
                    pageX: e.pageX, 
                    pageY: e.pageY,
                    dragX: dragX,
                    dragY: dragY
                });
                element.dispatchEvent(evt);
                
                onmove.apply(element, [dragX, dragY]); 
            } 
        }
        function start(e) { 
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
            var touches =  e.touches;
            
            if (!rightclick && !dragging) { 
                
                var evt = doc.createEvent('Event');
                evt.initEvent('uidragstart', true, true);
                var allowed = element.dispatchEvent(evt);
                if (allowed && onstart.apply(element, arguments) !== false) {
                    dragging = true; 
                    maxHeight = element.clientHeight;
                    maxWidth = element.clientWidth;
                    
                    offset = { top: element.offsetTop, left: element.offsetLeft };
                    
                    bind(doc, duringDragEvents);
                    
                    if (!hasTouch) {
                        move(e);
                    }
                    else {
                        prevent(e);
                    }
                }
            }
        }
        function stop() { 


            if (dragging) { 
                unbind(doc, duringDragEvents);

                var evt = doc.createEvent('Event');
                evt.initEvent('uidragend', true, false);
                element.dispatchEvent(evt);
            }
            dragging = false; 
        }

        bind(element, hasTouch ? "touchstart" : "mousedown", start);
    }

})(window, document, window.jQuery);