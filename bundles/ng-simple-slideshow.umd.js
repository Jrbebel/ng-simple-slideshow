(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common'), require('@angular/platform-browser')) :
	typeof define === 'function' && define.amd ? define(['exports', '@angular/core', '@angular/common', '@angular/platform-browser'], factory) :
	(factory((global['ng-simple-slideshow'] = {}),global.ng.core,global.ng.common,global.ng.platformBrowser));
}(this, (function (exports,core,common,platformBrowser) { 'use strict';

var State = /** @class */ (function () {
    function State() {
        // a tag width
        this.aw = 0;
        // a tag height
        this.ah = 0;
        // actual image width
        this.w = 0;
        // actual image height
        this.h = 0;
    }
    Object.defineProperty(State.prototype, "ar", {
        /**
         * @return {?}
         */
        get: function () {
            return this.w / this.h;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(State.prototype, "diag", {
        /**
         * @return {?}
         */
        get: function () {
            return Math.sqrt((this.w * this.w) + (this.h * this.h));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(State.prototype, "valid", {
        /**
         * @return {?}
         */
        get: function () {
            return this.w > 0 && this.h > 0 && this.aw > 0 && this.ah > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(State.prototype, "widthBound", {
        /**
         * @return {?}
         */
        get: function () {
            return this.ar > (this.aw / this.ah);
        },
        enumerable: true,
        configurable: true
    });
    return State;
}());
var PointerService = /** @class */ (function () {
    /**
     * @param {?} platform_id
     */
    function PointerService(platform_id) {
        var _this = this;
        this.platform_id = platform_id;
        this._disableSwiping = false;
        this._enableZoom = false;
        this._enablePan = false;
        this._startEVCache = null;
        this._evCache = new Array();
        this._previousDiagonal = -1;
        this._originalState = new State();
        this._slideEvent = new core.EventEmitter(true);
        this._clickEvent = new core.EventEmitter(true);
        this.pointerUp = function (event) {
            _this._pointerUp(event);
        };
        this.pointerDown = function (event) {
            _this._pointerDown(event);
        };
        this.pointerMove = function (event) {
            _this._pointerMove(event);
        };
        // this._renderer = rendererFactory.createRenderer(null, null);
    }
    Object.defineProperty(PointerService.prototype, "disableSwiping", {
        /**
         * @param {?} state
         * @return {?}
         */
        set: function (state) {
            this._disableSwiping = state;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PointerService.prototype, "enableZoom", {
        /**
         * @param {?} state
         * @return {?}
         */
        set: function (state) {
            this._enableZoom = state;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PointerService.prototype, "enablePan", {
        /**
         * @param {?} state
         * @return {?}
         */
        set: function (state) {
            this._enablePan = state;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @param {?} el
     * @return {?}
     */
    PointerService.prototype.bind = function (el) {
        if (common.isPlatformBrowser(this.platform_id)) {
            el.nativeElement.addEventListener('pointerdown', this.pointerDown);
            el.nativeElement.addEventListener('pointerup', this.pointerUp);
            el.nativeElement.addEventListener('pointercancel', this.pointerUp);
            el.nativeElement.addEventListener('pointerout', this.pointerUp);
            el.nativeElement.addEventListener('pointerleave', this.pointerUp);
            el.nativeElement.addEventListener('pointermove', this.pointerMove);
        }
    };
    /**
     * @param {?} el
     * @return {?}
     */
    PointerService.prototype.unbind = function (el) {
        if (common.isPlatformBrowser(this.platform_id)) {
            el.nativeElement.removeEventListener('pointerdown', this.pointerDown);
            el.nativeElement.removeEventListener('pointerup', this.pointerUp);
            el.nativeElement.removeEventListener('pointercancel', this.pointerUp);
            el.nativeElement.removeEventListener('pointerout', this.pointerUp);
            el.nativeElement.removeEventListener('pointerleave', this.pointerUp);
            el.nativeElement.removeEventListener('pointermove', this.pointerMove);
        }
    };
    Object.defineProperty(PointerService.prototype, "slideEvent", {
        /**
         * @return {?}
         */
        get: function () {
            return this._slideEvent;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PointerService.prototype, "clickEvent", {
        /**
         * @return {?}
         */
        get: function () {
            return this._clickEvent;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @param {?} e
     * @return {?}
     */
    PointerService.prototype._pointerDown = function (e) {
        this._evCache.push(e);
        if (this._evCache.length === 1) {
            this._startEVCache = e;
            if (this._enablePan || this._enableZoom) {
                // Cache the image sizes and container sizes
                this._loadOriginalState(e);
                // Convert backgroundSize to pixels
                this._convertBGSizeToPixels(e);
                // Convert backgroundPosition to pixels
                this._convertBGPosToPixels(e);
            }
        }
    };
    /**
     * @param {?} e
     * @return {?}
     */
    PointerService.prototype._loadOriginalState = function (e) {
        if (!this._originalState.valid && e.target && ((e.target)).style && ((e.target)).style.backgroundImage) {
            var /** @type {?} */ imgUrlArr = ((e.target)).style.backgroundImage.match(/^url\(["']?(.+?)["']?\)$/);
            var /** @type {?} */ img = new Image();
            img.src = imgUrlArr[1];
            this._originalState.aw = ((e.target)).offsetWidth;
            this._originalState.ah = ((e.target)).offsetHeight;
            this._originalState.w = img.width;
            this._originalState.h = img.height;
        }
    };
    /**
     * @param {?} e
     * @return {?}
     */
    PointerService.prototype._convertBGSizeToPixels = function (e) {
        var /** @type {?} */ imgElement = ((e.target));
        var /** @type {?} */ bgSize = imgElement.style.backgroundSize;
        if (bgSize.indexOf(' ') > -1) {
            // backgroundSize pattern "auto 100px" or "100px auto" or "100px 200px"
            var /** @type {?} */ sizeTuple = bgSize.split(' ');
            bgSize = this._originalState.widthBound ? sizeTuple[0] : sizeTuple[1];
        }
        if (bgSize === 'cover') {
            bgSize = this._originalState.widthBound ? this._originalState.ah * this._originalState.ar : this._originalState.aw;
        }
        else if (bgSize.indexOf('px') > -1) {
            bgSize = bgSize.substring(0, bgSize.length - 2);
        }
        else if (bgSize.indexOf('%') > -1) {
            var /** @type {?} */ bgSizePercentage = Number(bgSize.substring(0, bgSize.length - 1)) / 100;
            bgSize = this._originalState.widthBound ? this._originalState.aw * bgSizePercentage : this._originalState.ah * bgSizePercentage * this._originalState.ar;
        }
        else if (bgSize === 'auto') {
            bgSize = this._originalState.w;
        }
        else if (bgSize === 'contain') {
            bgSize = this._originalState.widthBound ? this._originalState.aw : this._originalState.ah * this._originalState.ar;
        }
        else {
            // backgroundSize pattern "could not identify" // will be treated as contain
            bgSize = this._originalState.widthBound ? this._originalState.aw : this._originalState.ah * this._originalState.ar;
        }
        imgElement.style.backgroundSize = bgSize + 'px auto';
    };
    /**
     * @param {?} e
     * @return {?}
     */
    PointerService.prototype._convertBGPosToPixels = function (e) {
        if (this._originalState.valid) {
            var /** @type {?} */ imgElement = ((e.target));
            var /** @type {?} */ bgSize = this._currentBGSize(e);
            var /** @type {?} */ bgPosX = imgElement.style.backgroundPositionX;
            if (bgPosX.indexOf('px') === -1) {
                bgPosX = this._convertLiteralPosToPercentage(bgPosX);
                if (bgPosX.indexOf('%') > -1) {
                    var /** @type {?} */ bgPosXPercentage = Number(bgPosX.substring(0, bgPosX.length - 1)) / 100;
                    bgPosX = bgPosXPercentage * (this._originalState.aw - bgSize);
                }
                imgElement.style.backgroundPositionX = bgPosX + 'px';
            }
            var /** @type {?} */ bgPosY = imgElement.style.backgroundPositionY;
            if (bgPosY.indexOf('px') === -1) {
                bgPosY = this._convertLiteralPosToPercentage(bgPosY);
                if (bgPosY.indexOf('%') > -1) {
                    var /** @type {?} */ bgPosYPercentage = Number(bgPosY.substring(0, bgPosY.length - 1)) / 100;
                    bgPosY = bgPosYPercentage * (this._originalState.ah - (bgSize / this._originalState.ar));
                }
                imgElement.style.backgroundPositionY = bgPosY + 'px';
            }
        }
    };
    /**
     * @param {?} e
     * @return {?}
     */
    PointerService.prototype._pointerUp = function (e) {
        // Remove this event from the target's cache
        for (var /** @type {?} */ i = 0; i < this._evCache.length; i++) {
            if (this._evCache[i].pointerId === e.pointerId) {
                this._evCache.splice(i, 1);
                break;
            }
        }
        // Purge diagonal if 2 pointers are not present
        if (this._evCache.length !== 2) {
            this._previousDiagonal = -1;
        }
        // Purge start event and original state if no pointers are present
        if (this._evCache.length === 0 && this._startEVCache !== null) {
            this._checkClickOrSwipe(e);
            this._startEVCache = null;
            this._originalState = new State();
        }
    };
    /**
     * 0th Check
     * target is a slide
     *
     * 1st Check for click
     * or x movement is less than 15 px and y movement is less than 15 px
     *
     * 2nd if not click, check for swipe
     * duration < 1000 ms
     * and x movement is >= 30 px
     * and y movement is <= 100 px
     * @param {?} e
     * @return {?}
     */
    PointerService.prototype._checkClickOrSwipe = function (e) {
        if (!this._targetIsASlide(e)) {
            return;
        }
        var /** @type {?} */ duration = e.timeStamp - this._startEVCache.timeStamp;
        var /** @type {?} */ dirX = e.pageX - this._startEVCache.pageX;
        var /** @type {?} */ dirY = e.pageY - this._startEVCache.pageY;
        if (!this._enablePan // Skip click event when panning is enabled
            && Math.abs(dirX) < 15 // Very less x movement
            && Math.abs(dirY) < 15 // Very less y movement
        ) {
            // Click
            this._clickEvent.emit();
        }
        else if (duration < 1000 // Short enough
            && Math.abs(dirY) <= 100 // Horizontal enough
            && Math.abs(dirX) >= 30 // Long enough
            && !this._disableSwiping // swipe enabled
            && this._cannotPanMoreTest(e, dirX) // cannot pan in swipe direction
        ) {
            // swipe
            this._slideEvent.emit(dirX < 0 ? 1 : -1);
        }
    };
    /**
     * @param {?} e
     * @return {?}
     */
    PointerService.prototype._targetIsASlide = function (e) {
        return ((e.target)).classList.contains('slides');
    };
    /**
     * @param {?} e
     * @param {?} dirX
     * @return {?}
     */
    PointerService.prototype._cannotPanMoreTest = function (e, dirX) {
        if (!this._enablePan) {
            return true;
        }
        var /** @type {?} */ xPos = this._currentBGPosX(e);
        var /** @type {?} */ bgSize = this._currentBGSize(e);
        if (dirX < 0 && bgSize > this._originalState.aw && Math.round(this._originalState.aw - bgSize - xPos) < 0) {
            // image can be panned to the right
            return false;
        }
        else if (dirX > 0 && bgSize > this._originalState.aw && xPos < 0) {
            // image can be panned to the left
            return false;
        }
        return true;
    };
    /**
     * @param {?} e
     * @return {?}
     */
    PointerService.prototype._pointerMove = function (e) {
        // Prevent defaulted to start drag event after mouse click, else cancel event gets fired
        e.preventDefault();
        // If one pointer is down, goto 1 point action
        if (this._evCache.length === 1 && this._enablePan) {
            this._1pointMoveAction(e);
        }
        // Find this event in the cache and update its record with this event
        for (var /** @type {?} */ i = 0; i < this._evCache.length; i++) {
            if (e.pointerId === this._evCache[i].pointerId) {
                this._evCache[i] = e;
                break;
            }
        }
        // If two pointers are down, goto 2 point action
        if (this._evCache.length === 2 && this._enableZoom) {
            this._2pointMoveAction(e);
        }
    };
    /**
     * @param {?} e
     * @return {?}
     */
    PointerService.prototype._1pointMoveAction = function (e) {
        if (this._evCache[0].pointerId === e.pointerId) {
            var /** @type {?} */ dx = this._evCache[0].pageX - e.pageX;
            var /** @type {?} */ dy = this._evCache[0].pageY - e.pageY;
            if (this._originalState.valid && (dx !== 0 || dy !== 0)) {
                this._transformBGPosition(e, dx, dy);
            }
        }
    };
    /**
     * @param {?} e
     * @return {?}
     */
    PointerService.prototype._2pointMoveAction = function (e) {
        // check for pinch gestures
        // Calculate the distance between the two pointers
        var /** @type {?} */ x = Math.abs(this._evCache[0].pageX - this._evCache[1].pageX);
        var /** @type {?} */ y = Math.abs(this._evCache[0].pageY - this._evCache[1].pageY);
        var /** @type {?} */ currentDiagonal = Math.sqrt((x * x) + (y * y));
        // Start 2 point action after previous diagonal and orginal state is valid
        if (this._previousDiagonal > 0 && this._originalState.valid) {
            var /** @type {?} */ deltaX = currentDiagonal - this._previousDiagonal;
            this._transformBGSize(e, deltaX);
        }
        this._previousDiagonal = currentDiagonal;
    };
    /**
     * @param {?} e
     * @param {?} dx
     * @param {?} dy
     * @return {?}
     */
    PointerService.prototype._transformBGPosition = function (e, dx, dy) {
        var /** @type {?} */ imgElement = ((e.target));
        var /** @type {?} */ previousPosX = this._currentBGPosX(e);
        var /** @type {?} */ previousPosY = this._currentBGPosY(e);
        var /** @type {?} */ newPosX = this._newBGPosXConstraint(previousPosX - dx, e);
        var /** @type {?} */ newPosY = this._newBGPosYConstraint(previousPosY - dy, e);
        if (newPosX !== previousPosX || newPosY !== previousPosY) {
            this._setBGPos(imgElement, newPosX, newPosY);
        }
    };
    /**
     * @param {?} element
     * @param {?} x
     * @param {?} y
     * @return {?}
     */
    PointerService.prototype._setBGPos = function (element, x, y) {
        element.style.backgroundPositionX = x + 'px';
        element.style.backgroundPositionY = y + 'px';
    };
    /**
     * @param {?} e
     * @return {?}
     */
    PointerService.prototype._currentBGPosX = function (e) {
        var /** @type {?} */ bgPosX = ((e.target)).style.backgroundPositionX;
        if (bgPosX.indexOf('px') > -1) {
            bgPosX = bgPosX.substring(0, bgPosX.length - 2);
        }
        return Number(bgPosX);
    };
    /**
     * @param {?} e
     * @return {?}
     */
    PointerService.prototype._currentBGPosY = function (e) {
        var /** @type {?} */ bgPosY = ((e.target)).style.backgroundPositionY;
        if (bgPosY.indexOf('px') > -1) {
            bgPosY = bgPosY.substring(0, bgPosY.length - 2);
        }
        return Number(bgPosY);
    };
    /**
     * @param {?} literal
     * @return {?}
     */
    PointerService.prototype._convertLiteralPosToPercentage = function (literal) {
        if (literal === 'center') {
            return '50%';
        }
        else if (literal === 'top' || literal === 'left') {
            return '0%';
        }
        else if (literal === 'bottom' || literal === 'right') {
            return '100%';
        }
    };
    /**
     * @param {?} e
     * @param {?} deltaX
     * @return {?}
     */
    PointerService.prototype._transformBGSize = function (e, deltaX) {
        var /** @type {?} */ imgElement = ((e.target));
        var /** @type {?} */ currentSize = this._currentBGSize(e);
        var /** @type {?} */ newSize = this._newBGSizeConstraint(currentSize + deltaX);
        if (newSize !== currentSize) {
            this._setBGSize(imgElement, newSize);
        }
    };
    /**
     * @param {?} element
     * @param {?} size
     * @return {?}
     */
    PointerService.prototype._setBGSize = function (element, size) {
        element.style.backgroundSize = size + 'px auto';
        // stop all browser touch action after zooming slide
        element.style.touchAction = 'none';
    };
    /**
     * @param {?} e
     * @return {?}
     */
    PointerService.prototype._currentBGSize = function (e) {
        var /** @type {?} */ bgSize = ((e.target)).style.backgroundSize;
        if (bgSize.indexOf(' ') > -1) {
            // backgroundSize pattern "auto 100px" or "100px auto" or "100px 200px"
            var /** @type {?} */ sizeTuple = bgSize.split(' ');
            var /** @type {?} */ size = this._originalState.widthBound ? sizeTuple[0].substring(0, sizeTuple[0].length - 2) : sizeTuple[1].substring(0, sizeTuple[1].length - 2);
            return Number(size);
        }
        else if (bgSize.indexOf('px') > -1) {
            // backgroundSize pattern "100px"
            var /** @type {?} */ size = bgSize.substring(0, bgSize.length - 2);
            return Number(size);
        }
    };
    /**
     * @param {?} newSize
     * @return {?}
     */
    PointerService.prototype._newBGSizeConstraint = function (newSize) {
        if (this._originalState.widthBound) {
            return newSize < this._originalState.aw ? this._originalState.aw : newSize;
        }
        else {
            return newSize / this._originalState.ar < this._originalState.ah ? this._originalState.ah * this._originalState.ar : newSize;
        }
    };
    /**
     * @param {?} newX
     * @param {?} e
     * @return {?}
     */
    PointerService.prototype._newBGPosXConstraint = function (newX, e) {
        var /** @type {?} */ bgSize = this._currentBGSize(e);
        if (bgSize >= this._originalState.aw) {
            // when image width is greater than container width
            if (newX > 0) {
                return 0;
            }
            else if (newX < this._originalState.aw - bgSize) {
                return this._originalState.aw - bgSize;
            }
        }
        else {
            if (newX < 0) {
                return 0;
            }
            else if (newX > this._originalState.aw - bgSize) {
                return this._originalState.aw - bgSize;
            }
        }
        return newX;
    };
    /**
     * @param {?} newY
     * @param {?} e
     * @return {?}
     */
    PointerService.prototype._newBGPosYConstraint = function (newY, e) {
        var /** @type {?} */ bgSize = this._currentBGSize(e);
        if (bgSize / this._originalState.ar >= this._originalState.ah) {
            // when image height is greater than container height
            if (newY > 0) {
                return 0;
            }
            else if (newY < this._originalState.ah - (bgSize / this._originalState.ar)) {
                return this._originalState.ah - (bgSize / this._originalState.ar);
            }
        }
        else {
            if (newY < 0) {
                return 0;
            }
            else if (newY > this._originalState.ah - (bgSize / this._originalState.ar)) {
                return this._originalState.ah - (bgSize / this._originalState.ar);
            }
        }
        return newY;
    };
    return PointerService;
}());
PointerService.decorators = [
    { type: core.Injectable },
];
/**
 * @nocollapse
 */
PointerService.ctorParameters = function () { return [
    { type: undefined, decorators: [{ type: core.Inject, args: [core.PLATFORM_ID,] },] },
]; };
// import { SwipeService } from './swipe.service';
var FIRST_SLIDE_KEY = platformBrowser.makeStateKey("firstSlide");
var SlideshowComponent = /** @class */ (function () {
    /**
     * @param {?} _pointerService
     * @param {?} _renderer
     * @param {?} _transferState
     * @param {?} _ngZone
     * @param {?} _cdRef
     * @param {?} sanitizer
     * @param {?} platform_id
     * @param {?} document
     */
    function SlideshowComponent(_pointerService, _renderer, _transferState, _ngZone, _cdRef, sanitizer, platform_id, document) {
        this._pointerService = _pointerService;
        this._renderer = _renderer;
        this._transferState = _transferState;
        this._ngZone = _ngZone;
        this._cdRef = _cdRef;
        this.sanitizer = sanitizer;
        this.platform_id = platform_id;
        this.document = document;
        this.slideIndex = -1;
        this.slides = [];
        this.hideLeftArrow = false;
        this.hideRightArrow = false;
        this._initial = true;
        this._isHidden = false;
        this.imageUrls = [];
        this.height = "100%";
        this.showArrows = true;
        this.disableSwiping = false;
        this.autoPlay = false;
        this.autoPlayInterval = 3333;
        this.stopAutoPlayOnSlide = true;
        this.autoPlayWaitForLazyLoad = true;
        this.backgroundSize = "cover";
        this.backgroundPosition = "center center";
        this.backgroundRepeat = "no-repeat";
        this.showDots = false;
        this.dotColor = "#FFF";
        this.showCaptions = true;
        this.captionColor = "#FFF";
        this.captionBackground = "rgba(0, 0, 0, .35)";
        this.lazyLoad = false;
        this.hideOnNoSlides = false;
        this.fullscreen = false;
        this.enableZoom = false;
        this.enablePan = false;
        this.noLoop = false;
        this.onSlideLeft = new core.EventEmitter();
        this.onSlideRight = new core.EventEmitter();
        this.onSwipeLeft = new core.EventEmitter();
        this.onSwipeRight = new core.EventEmitter();
        this.onFullscreenExit = new core.EventEmitter();
        this.onIndexChanged = new core.EventEmitter();
        this.onImageLazyLoad = new core.EventEmitter();
        this.onClick = new core.EventEmitter();
    }
    Object.defineProperty(SlideshowComponent.prototype, "safeStyleDotColor", {
        /**
         * @return {?}
         */
        get: function () {
            return this.sanitizer.bypassSecurityTrustStyle("--dot-color: " + this.dotColor);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @return {?}
     */
    SlideshowComponent.prototype.ngOnInit = function () {
        var _this = this;
        if (this.debug !== undefined) {
            console.warn("[Deprecation Warning]: The debug input will be removed from ng-simple-slideshow in 1.3.0");
        }
        this._slideSub = this._pointerService.slideEvent.subscribe(function (indexDirection) {
            _this.onSlide(indexDirection, true);
        });
        this._clickSub = this._pointerService.clickEvent.subscribe(function () {
            _this._onClick();
        });
        if (this.noLoop) {
            this.hideLeftArrow = true;
        }
    };
    /**
     * @return {?}
     */
    SlideshowComponent.prototype.ngAfterViewInit = function () {
        this._pointerService.bind(this.container);
    };
    /**
     * @return {?}
     */
    SlideshowComponent.prototype.ngOnDestroy = function () {
        var _this = this;
        try {
            if (this._slideSub && !this._slideSub.closed) {
                this._slideSub.unsubscribe();
            }
        }
        catch (error) {
            console.warn("Slide Subscription error caught in ng-simple-slideshow OnDestroy:", error);
        }
        try {
            if (this._clickSub && !this._clickSub.closed) {
                this._clickSub.unsubscribe();
            }
        }
        catch (error) {
            console.warn("Click Subscription error caught in ng-simple-slideshow OnDestroy:", error);
        }
        try {
            this._pointerService.unbind(this.container);
        }
        catch (error) {
            console.warn("Pointer Service unbind error caught in ng-simple-slideshow OnDestroy:", error);
        }
        try {
            if (this._autoplayIntervalId) {
                this._ngZone.runOutsideAngular(function () { return clearInterval(_this._autoplayIntervalId); });
                this._autoplayIntervalId = null;
            }
        }
        catch (error) {
            console.warn("Autoplay cancel error caught in ng-simple-slideshow OnDestroy:", error);
        }
    };
    /**
     * @param {?} changes
     * @return {?}
     */
    SlideshowComponent.prototype.ngOnChanges = function (changes) {
        if (changes["noLoop"]) {
            if (changes["noLoop"].currentValue) {
                this.hideLeftArrow = this.slideIndex <= 0;
                this.hideRightArrow = this.slideIndex === this.slides.length - 1;
            }
            else {
                this.hideLeftArrow = false;
                this.hideRightArrow = false;
            }
            this._cdRef.detectChanges();
        }
    };
    /**
     * @return {?}
     */
    SlideshowComponent.prototype.ngDoCheck = function () {
        // if this is the first being called, create a copy of the input
        if (this.imageUrls && this.imageUrls.length > 0) {
            if (this._initial === true) {
                this._urlCache = Array.from(this.imageUrls);
            }
            if (this._isHidden === true) {
                this._renderer.removeStyle(this.container.nativeElement, "display");
                this._isHidden = false;
            }
            this.setSlides();
        }
        else if (this.hideOnNoSlides === true) {
            this._renderer.setStyle(this.container.nativeElement, "display", "none");
            this._isHidden = true;
        }
        this.setStyles();
        this.handleAutoPlay();
        this._pointerService.disableSwiping = this.disableSwiping;
        this._pointerService.enableZoom = this.enableZoom;
        this._pointerService.enablePan = this.enablePan;
    };
    /**
     * \@description this is the function that should be called to make the slides change.
     *              indexDirection to move back is -1, to move forward is 1, and to stay in place is 0.
     *              0 is taken into account for failed swipes
     * @param {?} indexDirection
     * @param {?=} isSwipe
     * @return {?}
     */
    SlideshowComponent.prototype.onSlide = function (indexDirection, isSwipe) {
        this.handleAutoPlay(this.stopAutoPlayOnSlide);
        this.slide(indexDirection, isSwipe);
    };
    /**
     * \@description Redirect to current slide "href" if defined
     * @return {?}
     */
    SlideshowComponent.prototype._onClick = function () {
        var /** @type {?} */ currentSlide = this.slides.length > 0 && this.slides[this.slideIndex];
        this.onClick.emit({ slide: currentSlide, index: this.slideIndex });
        if (currentSlide && currentSlide.image.clickAction) {
            currentSlide.image.clickAction();
        }
        else if (currentSlide && currentSlide.image.href) {
            this.document.location.href = currentSlide.image.href;
        }
    };
    /**
     * \@description set the index to the desired index - 1 and simulate a right slide
     * @param {?} index
     * @return {?}
     */
    SlideshowComponent.prototype.goToSlide = function (index) {
        var /** @type {?} */ beforeClickIndex = this.slideIndex;
        this.slideIndex = index - 1;
        this.setSlideIndex(1);
        if (this.slides[this.slideIndex] && !this.slides[this.slideIndex].loaded) {
            this.loadRemainingSlides();
        }
        this.handleAutoPlay(this.stopAutoPlayOnSlide);
        this.slideRight(beforeClickIndex);
        this.slides[beforeClickIndex].selected = false;
        this.slides[this.slideIndex].selected = true;
        this._cdRef.detectChanges();
    };
    /**
     * \@description set the index to the desired index - 1 and simulate a right slide
     * @param {?} index
     * @return {?}
     */
    SlideshowComponent.prototype.getSlideStyle = function (index) {
        var /** @type {?} */ slide = this.slides[index];
        if (slide && slide.loaded) {
            return {
                "background-image": "url(" + slide.image.url + ")",
                "background-size": slide.image.backgroundSize || this.backgroundSize,
                "background-position": slide.image.backgroundPosition || this.backgroundPosition,
                "background-repeat": slide.image.backgroundRepeat || this.backgroundRepeat
            };
        }
        else {
            // doesn't compile correctly if returning an empty object, sooooo.....
            return {
                "background-image": undefined,
                "background-size": undefined,
                "background-position": undefined,
                "background-repeat": undefined
            };
        }
    };
    /**
     * @param {?} e
     * @return {?}
     */
    SlideshowComponent.prototype.exitFullScreen = function (e) {
        e.preventDefault();
        this.fullscreen = false;
        this.onFullscreenExit.emit(true);
    };
    /**
     * \@description Set the new slide index, then make the transition happen.
     * @param {?} indexDirection
     * @param {?=} isSwipe
     * @return {?}
     */
    SlideshowComponent.prototype.slide = function (indexDirection, isSwipe) {
        var /** @type {?} */ oldIndex = this.slideIndex;
        if (this.setSlideIndex(indexDirection)) {
            if (this.slides[this.slideIndex] &&
                !this.slides[this.slideIndex].loaded) {
                this.loadRemainingSlides();
            }
            if (indexDirection === 1) {
                this.slideRight(oldIndex, isSwipe);
            }
            else {
                this.slideLeft(oldIndex, isSwipe);
            }
            this.slides[oldIndex].selected = false;
            this.slides[this.slideIndex].selected = true;
        }
        this._cdRef.detectChanges();
    };
    /**
     * \@description This is just treating the url array like a circular list.
     * @param {?} indexDirection
     * @return {?}
     */
    SlideshowComponent.prototype.setSlideIndex = function (indexDirection) {
        var /** @type {?} */ willChange = true;
        this.slideIndex += indexDirection;
        if (this.noLoop) {
            this.hideRightArrow = this.slideIndex === this.slides.length - 1;
            this.hideLeftArrow = false;
        }
        if (this.slideIndex < 0) {
            if (this.noLoop) {
                this.slideIndex -= indexDirection;
                willChange = false;
                this.hideLeftArrow = true;
            }
            else {
                this.slideIndex = this.slides.length - 1;
            }
        }
        else if (this.slideIndex >= this.slides.length) {
            if (this.noLoop) {
                this.slideIndex -= indexDirection;
                willChange = false;
                this.hideRightArrow = true;
            }
            else {
                this.slideIndex = 0;
            }
        }
        if (willChange) {
            this.onIndexChanged.emit(this.slideIndex);
        }
        return willChange;
    };
    /**
     * \@description This function handles the variables to move the CSS classes around accordingly.
     *              In order to correctly handle animations, the new slide as well as the slides to
     *              the left and right are assigned classes.
     * @param {?} oldIndex
     * @param {?=} isSwipe
     * @return {?}
     */
    SlideshowComponent.prototype.slideLeft = function (oldIndex, isSwipe) {
        if (isSwipe === true) {
            this.onSwipeLeft.emit(this.slideIndex);
        }
        else {
            this.onSlideLeft.emit(this.slideIndex);
        }
        this.slides[this.getLeftSideIndex(oldIndex)].leftSide = false;
        this.slides[oldIndex].leftSide = true;
        this.slides[oldIndex].action = "slideOutLeft";
        this.slides[this.slideIndex].rightSide = false;
        this.slides[this.getRightSideIndex()].rightSide = true;
        this.slides[this.slideIndex].action = "slideInRight";
    };
    /**
     * \@description This function handles the variables to move the CSS classes around accordingly.
     *              In order to correctly handle animations, the new slide as well as the slides to
     *              the left and right are assigned classes.
     * @param {?} oldIndex
     * @param {?=} isSwipe
     * @return {?}
     */
    SlideshowComponent.prototype.slideRight = function (oldIndex, isSwipe) {
        if (isSwipe === true) {
            this.onSwipeRight.emit(this.slideIndex);
        }
        else {
            this.onSlideRight.emit(this.slideIndex);
        }
        this.slides[this.getRightSideIndex(oldIndex)].rightSide = false;
        this.slides[oldIndex].rightSide = true;
        this.slides[oldIndex].action = "slideOutRight";
        this.slides[this.slideIndex].leftSide = false;
        this.slides[this.getLeftSideIndex()].leftSide = true;
        this.slides[this.slideIndex].action = "slideInLeft";
    };
    /**
     * \@description Check to make sure slide images have been set or haven't changed
     * @return {?}
     */
    SlideshowComponent.prototype.setSlides = function () {
        if (this.imageUrls) {
            if (this.checkCache() || this._initial === true) {
                this._initial = false;
                this._urlCache = Array.from(this.imageUrls);
                this.slides = [];
                if (this.lazyLoad === true) {
                    this.buildLazyLoadSlideArray();
                }
                else {
                    this.buildSlideArray();
                }
                this._cdRef.detectChanges();
            }
        }
    };
    /**
     * \@description create the slides without background urls, which will be added in
     *              for the "lazy load," then load only the first slide
     * @return {?}
     */
    SlideshowComponent.prototype.buildLazyLoadSlideArray = function () {
        for (var _i = 0, _a = this.imageUrls; _i < _a.length; _i++) {
            var image = _a[_i];
            this.slides.push({
                image: typeof image === "string"
                    ? { url: null }
                    : { url: null, href: image.href || "" },
                action: "",
                leftSide: false,
                rightSide: false,
                selected: false,
                loaded: false
            });
        }
        if (this.slideIndex === -1) {
            this.slideIndex = 0;
        }
        this.slides[this.slideIndex].selected = true;
        this.loadFirstSlide();
        this.onIndexChanged.emit(this.slideIndex);
    };
    /**
     * \@description create the slides with background urls all at once
     * @return {?}
     */
    SlideshowComponent.prototype.buildSlideArray = function () {
        for (var _i = 0, _a = this.imageUrls; _i < _a.length; _i++) {
            var image = _a[_i];
            this.slides.push({
                image: typeof image === "string" ? { url: image } : image,
                action: "",
                leftSide: false,
                rightSide: false,
                selected: false,
                loaded: true
            });
        }
        if (this.slideIndex === -1) {
            this.slideIndex = 0;
        }
        this.slides[this.slideIndex].selected = true;
        this.onIndexChanged.emit(this.slideIndex);
    };
    /**
     * \@description load the first slide image if lazy loading
     *              this takes server side and browser side into account
     * @return {?}
     */
    SlideshowComponent.prototype.loadFirstSlide = function () {
        var _this = this;
        var /** @type {?} */ tmpIndex = this.slideIndex;
        var /** @type {?} */ tmpImage = this.imageUrls[tmpIndex];
        // if server side, we don't need to worry about the rest of the slides
        if (common.isPlatformServer(this.platform_id)) {
            this.slides[tmpIndex].image =
                typeof tmpImage === "string" ? { url: tmpImage } : tmpImage;
            this.slides[tmpIndex].loaded = true;
            this._transferState.set(FIRST_SLIDE_KEY, this.slides[tmpIndex]);
        }
        else {
            var /** @type {?} */ firstSlideFromTransferState = this._transferState.get(FIRST_SLIDE_KEY, /** @type {?} */ (null));
            // if the first slide didn't finish loading on the server side, we need to load it
            if (firstSlideFromTransferState === null) {
                var /** @type {?} */ loadImage = new Image();
                loadImage.src = typeof tmpImage === "string" ? tmpImage : tmpImage.url;
                loadImage.addEventListener("load", function () {
                    _this.slides[tmpIndex].image =
                        typeof tmpImage === "string" ? { url: tmpImage } : tmpImage;
                    _this.slides[tmpIndex].loaded = true;
                    _this.onImageLazyLoad.emit(_this.slides[tmpIndex]);
                    _this._cdRef.detectChanges();
                });
            }
            else {
                this.slides[tmpIndex] = firstSlideFromTransferState;
                this._transferState.remove(FIRST_SLIDE_KEY);
            }
        }
    };
    /**
     * \@description if lazy loading in browser, start loading remaining slides
     * \@todo: figure out how to not show the spinner if images are loading fast enough
     * @return {?}
     */
    SlideshowComponent.prototype.loadRemainingSlides = function () {
        var _this = this;
        var _loop_1 = function (i) {
            if (!this_1.slides[i].loaded) {
                new Promise(function (resolve) {
                    var /** @type {?} */ tmpImage = _this.imageUrls[i];
                    var /** @type {?} */ loadImage = new Image();
                    loadImage.addEventListener("load", function () {
                        _this.slides[i].image =
                            typeof tmpImage === "string" ? { url: tmpImage } : tmpImage;
                        _this.slides[i].loaded = true;
                        _this._cdRef.detectChanges();
                        _this.onImageLazyLoad.emit(_this.slides[i]);
                        resolve();
                    });
                    loadImage.src =
                        typeof tmpImage === "string" ? tmpImage : tmpImage.url;
                });
            }
        };
        var this_1 = this;
        for (var /** @type {?} */ i = 0; i < this.slides.length; i++) {
            _loop_1(/** @type {?} */ i);
        }
    };
    /**
     * \@description Start or stop autoPlay, don't do it at all server side
     * @param {?=} stopAutoPlay
     * @return {?}
     */
    SlideshowComponent.prototype.handleAutoPlay = function (stopAutoPlay) {
        var _this = this;
        if (common.isPlatformServer(this.platform_id)) {
            return;
        }
        if (stopAutoPlay === true || this.autoPlay === false) {
            if (this._autoplayIntervalId) {
                this._ngZone.runOutsideAngular(function () { return clearInterval(_this._autoplayIntervalId); });
                this._autoplayIntervalId = null;
            }
        }
        else if (!this._autoplayIntervalId) {
            this._ngZone.runOutsideAngular(function () {
                _this._autoplayIntervalId = setInterval(function () {
                    if (!_this.autoPlayWaitForLazyLoad ||
                        (_this.autoPlayWaitForLazyLoad &&
                            _this.slides[_this.slideIndex] &&
                            _this.slides[_this.slideIndex].loaded)) {
                        _this._ngZone.run(function () { return _this.slide(1); });
                    }
                }, _this.autoPlayInterval);
            });
        }
    };
    /**
     * \@description Keep the styles up to date with the input
     * @return {?}
     */
    SlideshowComponent.prototype.setStyles = function () {
        if (this.fullscreen) {
            this._renderer.setStyle(this.container.nativeElement, "height", "100%");
            // Would be nice to make it configurable
            this._renderer.setStyle(this.container.nativeElement, "background-color", "white");
        }
        else {
            // Would be nice to make it configurable
            this._renderer.removeStyle(this.container.nativeElement, "background-color");
            if (this.height) {
                this._renderer.setStyle(this.container.nativeElement, "height", this.height);
            }
            if (this.minHeight) {
                this._renderer.setStyle(this.container.nativeElement, "min-height", this.minHeight);
            }
        }
        if (this.arrowSize) {
            this._renderer.setStyle(this.prevArrow.nativeElement, "height", this.arrowSize);
            this._renderer.setStyle(this.prevArrow.nativeElement, "width", this.arrowSize);
            this._renderer.setStyle(this.nextArrow.nativeElement, "height", this.arrowSize);
            this._renderer.setStyle(this.nextArrow.nativeElement, "width", this.arrowSize);
        }
    };
    /**
     * \@description compare image array to the cache, returns false if no changes
     * @return {?}
     */
    SlideshowComponent.prototype.checkCache = function () {
        var _this = this;
        return !(this._urlCache.length === this.imageUrls.length &&
            this._urlCache.every(function (cacheElement, i) { return cacheElement === _this.imageUrls[i]; }));
    };
    /**
     * \@description get the index for the slide to the left of the new slide
     * @param {?=} i
     * @return {?}
     */
    SlideshowComponent.prototype.getLeftSideIndex = function (i) {
        if (i === undefined) {
            i = this.slideIndex;
        }
        if (--i < 0) {
            i = this.slides.length - 1;
        }
        return i;
    };
    /**
     * \@description get the index for the slide to the right of the new slide
     * @param {?=} i
     * @return {?}
     */
    SlideshowComponent.prototype.getRightSideIndex = function (i) {
        if (i === undefined) {
            i = this.slideIndex;
        }
        if (++i >= this.slides.length) {
            i = 0;
        }
        return i;
    };
    /**
     * \@description a trackBy function for the ngFor loops
     * @param {?} index
     * @param {?} slide
     * @return {?}
     */
    SlideshowComponent.prototype.trackByFn = function (index, slide) {
        return slide.image;
    };
    /**
     * \@description don't let click events fire, handle in pointer service instead
     * @param {?} event
     * @return {?}
     */
    SlideshowComponent.prototype.handleClick = function (event) {
        event.preventDefault();
    };
    return SlideshowComponent;
}());
SlideshowComponent.decorators = [
    { type: core.Component, args: [{
                selector: "slideshow",
                template: "\n    <!-- fullscreen bar -->\n    <div [class.display-none]=\"!fullscreen\"\n         class=\"fs-container\"\n         (click)=\"exitFullScreen($event)\">\n      <i title=\"Back\"\n         class=\"arrow-exitfs prev\"></i>\n    </div>\n    <div #container\n         class=\"slideshow-container\"\n         [class.slideshow-container-fs]=\"fullscreen\">\n      <!-- slides -->\n      <a *ngFor=\"let slide of slides; index as i; trackBy: trackByFn\"\n         class=\"slides\"\n         href=\"#!\"\n         tabindex=\"-1\"\n         title=\"{{slide?.image?.title}}\"\n         [ngStyle]=\"getSlideStyle(i)\"\n         (click)=\"handleClick($event)\"\n         [class.selected]=\"slide?.selected\"\n         [class.hide-slide]=\"!slide?.selected && !slide?.leftSide && !slide?.rightSide\"\n         [class.left-side]=\"slide?.leftSide\"\n         [class.right-side]=\"slide?.rightSide\"\n         [class.slide-in-left]=\"slide?.action === 'slideInLeft'\"\n         [class.slide-in-right]=\"slide?.action === 'slideInRight'\"\n         [class.slide-out-left]=\"slide?.action === 'slideOutLeft'\"\n         [class.slide-out-right]=\"slide?.action === 'slideOutRight'\"\n         [class.link]=\"slide?.image?.clickAction || slide?.image?.href\">\n        <div class=\"loader\"\n             *ngIf=\"!slide?.loaded\"></div>\n        <div *ngIf=\"showCaptions && slide?.image?.caption\"\n             class=\"caption\"\n             [ngStyle]=\"{\n               'color': captionColor,\n               'background-color': captionBackground\n              }\"\n             [innerHTML]=\"slide?.image?.caption\">\n        </div>\n      </a>\n      <!-- left arrow -->\n      <div [class.display-none]=\"!showArrows || hideLeftArrow\"\n           (click)=\"onSlide(-1)\"\n           class=\"arrow-container prev\">\n        <i #prevArrow\n           title=\"Previous\"\n           class=\"arrow prev\"></i>\n      </div>\n      <!-- right arrow -->\n      <div [class.display-none]=\"!showArrows || hideRightArrow\"\n           (click)=\"onSlide(1)\"\n           class=\"arrow-container next\">\n        <i #nextArrow\n           title=\"Next\"\n           class=\"arrow next\"></i>\n      </div>\n      <!-- dots -->\n      <ul class=\"slick-dots\"\n          *ngIf=\"showDots\">\n        <li *ngFor=\"let slide of slides; index as i; trackBy: trackByFn\"\n            (click)=\"goToSlide(i)\"\n            [class.slick-active]=\"slide.selected\">\n          <button type=\"button\"\n                  [attr.style]=\"safeStyleDotColor\">\n            {{i}}\n          </button>\n        </li>\n      </ul>\n    </div>\n  ",
                styles: ["\n    /*\n     styles adapted from https://www.w3schools.com/w3css/4/w3.css\n     arrow styles adapted from https://codepen.io/minustalent/pen/Frhaw\n     */\n    .display-none {\n      display: none !important; }\n\n    .fs-container {\n      display: block;\n      cursor: pointer;\n      position: fixed;\n      z-index: 1;\n      top: 16px;\n      left: 16px;\n      width: 46px;\n      height: 46px;\n      text-align: center;\n      padding: 0;\n      background-color: rgba(0, 0, 0, 0.2);\n      -webkit-transition: all .2s ease-in-out;\n      transition: all .2s ease-in-out; }\n      .fs-container:hover {\n        background-color: rgba(0, 0, 0, 0.33); }\n      .fs-container .arrow-exitfs {\n        display: block;\n        width: 30px;\n        height: 30px;\n        background: transparent;\n        border-top: 2px solid #f2f2f2;\n        -webkit-transition: all .2s ease-in-out;\n        transition: all .2s ease-in-out; }\n        .fs-container .arrow-exitfs.prev {\n          -webkit-transform: rotate(-45deg);\n                  transform: rotate(-45deg);\n          position: relative;\n          left: 18px;\n          top: 18px; }\n        .fs-container .arrow-exitfs:after {\n          content: '';\n          width: 30px;\n          height: 30px;\n          background: transparent;\n          border-top: 2px solid #f2f2f2;\n          -webkit-transform: rotate(90deg);\n                  transform: rotate(90deg);\n          position: absolute;\n          left: -15px;\n          top: -17px; }\n\n    .slideshow-container.slideshow-container-fs {\n      position: fixed;\n      left: 0;\n      top: 0;\n      width: 100%;\n      height: 100%; }\n\n    .slideshow-container {\n      position: relative;\n      display: block;\n      margin: auto;\n      height: 100%;\n      width: 100%;\n      overflow: hidden; }\n      .slideshow-container .hide-slide {\n        visibility: hidden;\n        position: absolute;\n        top: -100vw;\n        left: -100vw;\n        opacity: 0; }\n      .slideshow-container .slides {\n        -ms-touch-action: pan-y;\n            touch-action: pan-y;\n        position: absolute;\n        top: 0;\n        height: 100%;\n        width: 100%;\n        visibility: visible;\n        opacity: 1;\n        display: block; }\n        .slideshow-container .slides.selected {\n          left: 0; }\n        .slideshow-container .slides.left-slide {\n          left: -100%; }\n        .slideshow-container .slides.right-slide {\n          left: 100%; }\n        .slideshow-container .slides.slide-in-left {\n          left: 0;\n          -webkit-animation: slideInLeft 0.5s cubic-bezier(0.42, 0, 0.58, 1);\n                  animation: slideInLeft 0.5s cubic-bezier(0.42, 0, 0.58, 1); }\n        .slideshow-container .slides.slide-in-right {\n          left: 0;\n          -webkit-animation: slideInRight 0.5s cubic-bezier(0.42, 0, 0.58, 1);\n                  animation: slideInRight 0.5s cubic-bezier(0.42, 0, 0.58, 1); }\n        .slideshow-container .slides.slide-out-left {\n          left: -100%;\n          -webkit-animation: slideOutLeft 0.5s cubic-bezier(0.42, 0, 0.58, 1);\n                  animation: slideOutLeft 0.5s cubic-bezier(0.42, 0, 0.58, 1); }\n        .slideshow-container .slides.slide-out-right {\n          left: 100%;\n          -webkit-animation: slideOutRight 0.5s cubic-bezier(0.42, 0, 0.58, 1);\n                  animation: slideOutRight 0.5s cubic-bezier(0.42, 0, 0.58, 1); }\n        .slideshow-container .slides.link {\n          cursor: pointer; }\n        .slideshow-container .slides:not(.link) {\n          cursor: default; }\n      .slideshow-container .caption {\n        position: absolute;\n        bottom: 0;\n        padding: 10px;\n        width: 100%; }\n      .slideshow-container .arrow-container {\n        display: -webkit-box;\n        display: -ms-flexbox;\n        display: flex;\n        -webkit-box-align: center;\n            -ms-flex-align: center;\n                align-items: center;\n        -webkit-box-pack: center;\n            -ms-flex-pack: center;\n                justify-content: center;\n        position: absolute;\n        top: 0;\n        height: 100%;\n        width: auto;\n        cursor: pointer;\n        background-size: 100%;\n        background-image: -webkit-gradient(linear, left top, left bottom, from(transparent), to(transparent));\n        background-image: linear-gradient(transparent, transparent);\n        z-index: 100;\n        -webkit-user-select: none;\n           -moz-user-select: none;\n            -ms-user-select: none;\n                user-select: none; }\n        .slideshow-container .arrow-container:before {\n          display: block;\n          height: 100%;\n          position: absolute;\n          top: 0;\n          left: 0;\n          opacity: 0;\n          width: 100%;\n          z-index: -100;\n          -webkit-transition: opacity 0.45s;\n          transition: opacity 0.45s; }\n        .slideshow-container .arrow-container.prev {\n          left: 0; }\n          .slideshow-container .arrow-container.prev:before {\n            background-image: -webkit-gradient(linear, right top, left top, from(transparent), to(rgba(0, 0, 0, 0.75)));\n            background-image: linear-gradient(to left, transparent, rgba(0, 0, 0, 0.75));\n            content: ''; }\n        .slideshow-container .arrow-container.next {\n          right: 0; }\n          .slideshow-container .arrow-container.next:before {\n            background-image: -webkit-gradient(linear, left top, right top, from(transparent), to(rgba(0, 0, 0, 0.75)));\n            background-image: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.75));\n            content: ''; }\n        .slideshow-container .arrow-container .arrow {\n          display: block;\n          margin: auto;\n          width: 30px;\n          height: 30px;\n          background: transparent;\n          border-top: 2px solid #f2f2f2;\n          border-left: 2px solid #f2f2f2;\n          -webkit-transition: all .2s ease-in-out;\n          transition: all .2s ease-in-out;\n          -webkit-user-select: none;\n             -moz-user-select: none;\n              -ms-user-select: none;\n                  user-select: none; }\n          .slideshow-container .arrow-container .arrow:before {\n            display: block;\n            height: 200%;\n            width: 200%;\n            margin-left: -50%;\n            margin-top: -50%;\n            content: \"\";\n            -webkit-transform: rotate(45deg);\n                    transform: rotate(45deg); }\n          .slideshow-container .arrow-container .arrow.prev {\n            -webkit-transform: rotate(-45deg);\n                    transform: rotate(-45deg);\n            position: relative;\n            left: 20px;\n            margin-right: 10px; }\n          .slideshow-container .arrow-container .arrow.next {\n            -webkit-transform: rotate(135deg);\n                    transform: rotate(135deg);\n            position: relative;\n            right: 20px;\n            margin-left: 10px; }\n      .slideshow-container .slick-dots {\n        display: block;\n        bottom: 15px;\n        z-index: 1;\n        text-align: center;\n        position: absolute;\n        padding: 0;\n        left: 0;\n        right: 0;\n        margin: 0 auto; }\n        .slideshow-container .slick-dots li {\n          display: inline;\n          margin: 0;\n          padding: 0; }\n          .slideshow-container .slick-dots li button {\n            border: none;\n            background: none;\n            text-indent: -9999px;\n            font-size: 0;\n            width: 20px;\n            height: 20px;\n            outline: none;\n            position: relative;\n            z-index: 1;\n            cursor: pointer; }\n            .slideshow-container .slick-dots li button:before {\n              content: '';\n              width: 4px;\n              height: 4px;\n              background: var(--dot-color, #FFF);\n              border-radius: 4px;\n              display: block;\n              position: absolute;\n              top: 50%;\n              left: 50%;\n              -webkit-transform: translate(-50%, -50%);\n                      transform: translate(-50%, -50%);\n              opacity: .7;\n              -webkit-transition: all .5s ease-out;\n              transition: all .5s ease-out; }\n          .slideshow-container .slick-dots li.slick-active button:before {\n            -webkit-transform: translate(-50%, -50%) scale(1.4);\n                    transform: translate(-50%, -50%) scale(1.4);\n            opacity: 1; }\n\n    @media screen and (min-width: 768px) {\n      .slideshow-container .arrow-container:hover:before {\n        opacity: 1; }\n      .slideshow-container .arrow-container:hover .arrow {\n        border-width: 4px; }\n      .slideshow-container .arrow-container .arrow:hover {\n        border-width: 4px; } }\n\n    @-webkit-keyframes slideInRight {\n      0% {\n        left: -100%; }\n      100% {\n        left: 0; } }\n\n    @keyframes slideInRight {\n      0% {\n        left: -100%; }\n      100% {\n        left: 0; } }\n\n    @-webkit-keyframes slideInLeft {\n      0% {\n        left: 100%; }\n      100% {\n        left: 0; } }\n\n    @keyframes slideInLeft {\n      0% {\n        left: 100%; }\n      100% {\n        left: 0; } }\n\n    @-webkit-keyframes slideOutRight {\n      0% {\n        left: 0; }\n      100% {\n        left: -100%; } }\n\n    @keyframes slideOutRight {\n      0% {\n        left: 0; }\n      100% {\n        left: -100%; } }\n\n    @-webkit-keyframes slideOutLeft {\n      0% {\n        left: 0; }\n      100% {\n        left: 100%; } }\n\n    @keyframes slideOutLeft {\n      0% {\n        left: 0; }\n      100% {\n        left: 100%; } }\n\n    .loader {\n      position: absolute;\n      left: 50%;\n      margin-left: -20px;\n      top: 50%;\n      margin-top: -20px;\n      border: 5px solid #f3f3f3;\n      border-top: 5px solid #555;\n      border-radius: 50%;\n      width: 50px;\n      height: 50px;\n      -webkit-animation: spin 1s linear infinite;\n              animation: spin 1s linear infinite; }\n\n    @-webkit-keyframes spin {\n      0% {\n        -webkit-transform: rotate(0deg);\n                transform: rotate(0deg); }\n      100% {\n        -webkit-transform: rotate(360deg);\n                transform: rotate(360deg); } }\n\n    @keyframes spin {\n      0% {\n        -webkit-transform: rotate(0deg);\n                transform: rotate(0deg); }\n      100% {\n        -webkit-transform: rotate(360deg);\n                transform: rotate(360deg); } }\n  "],
                providers: [PointerService],
                changeDetection: core.ChangeDetectionStrategy.OnPush
            },] },
];
/**
 * @nocollapse
 */
SlideshowComponent.ctorParameters = function () { return [
    { type: PointerService, },
    { type: core.Renderer2, },
    { type: platformBrowser.TransferState, },
    { type: core.NgZone, },
    { type: core.ChangeDetectorRef, },
    { type: platformBrowser.DomSanitizer, },
    { type: undefined, decorators: [{ type: core.Inject, args: [core.PLATFORM_ID,] },] },
    { type: undefined, decorators: [{ type: core.Inject, args: [common.DOCUMENT,] },] },
]; };
SlideshowComponent.propDecorators = {
    'imageUrls': [{ type: core.Input },],
    'height': [{ type: core.Input },],
    'minHeight': [{ type: core.Input },],
    'arrowSize': [{ type: core.Input },],
    'showArrows': [{ type: core.Input },],
    'disableSwiping': [{ type: core.Input },],
    'autoPlay': [{ type: core.Input },],
    'autoPlayInterval': [{ type: core.Input },],
    'stopAutoPlayOnSlide': [{ type: core.Input },],
    'autoPlayWaitForLazyLoad': [{ type: core.Input },],
    'debug': [{ type: core.Input },],
    'backgroundSize': [{ type: core.Input },],
    'backgroundPosition': [{ type: core.Input },],
    'backgroundRepeat': [{ type: core.Input },],
    'showDots': [{ type: core.Input },],
    'dotColor': [{ type: core.Input },],
    'showCaptions': [{ type: core.Input },],
    'captionColor': [{ type: core.Input },],
    'captionBackground': [{ type: core.Input },],
    'lazyLoad': [{ type: core.Input },],
    'hideOnNoSlides': [{ type: core.Input },],
    'fullscreen': [{ type: core.Input },],
    'enableZoom': [{ type: core.Input },],
    'enablePan': [{ type: core.Input },],
    'noLoop': [{ type: core.Input },],
    'onSlideLeft': [{ type: core.Output },],
    'onSlideRight': [{ type: core.Output },],
    'onSwipeLeft': [{ type: core.Output },],
    'onSwipeRight': [{ type: core.Output },],
    'onFullscreenExit': [{ type: core.Output },],
    'onIndexChanged': [{ type: core.Output },],
    'onImageLazyLoad': [{ type: core.Output },],
    'onClick': [{ type: core.Output },],
    'container': [{ type: core.ViewChild, args: ["container",] },],
    'prevArrow': [{ type: core.ViewChild, args: ["prevArrow",] },],
    'nextArrow': [{ type: core.ViewChild, args: ["nextArrow",] },],
};
var SlideshowModule = /** @class */ (function () {
    function SlideshowModule() {
    }
    return SlideshowModule;
}());
SlideshowModule.decorators = [
    { type: core.NgModule, args: [{
                imports: [
                    common.CommonModule,
                    platformBrowser.BrowserTransferStateModule
                ],
                declarations: [
                    SlideshowComponent
                ],
                exports: [
                    SlideshowComponent
                ]
            },] },
];
/**
 * @nocollapse
 */
SlideshowModule.ctorParameters = function () { return []; };

exports.SlideshowModule = SlideshowModule;
exports.ɵb = PointerService;
exports.ɵa = SlideshowComponent;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ng-simple-slideshow.umd.js.map
