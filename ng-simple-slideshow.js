import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, Injectable, Input, NgModule, NgZone, Output, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { BrowserTransferStateModule, DomSanitizer, TransferState, makeStateKey } from '@angular/platform-browser';

class State {
    constructor() {
        // a tag width
        this.aw = 0;
        // a tag height
        this.ah = 0;
        // actual image width
        this.w = 0;
        // actual image height
        this.h = 0;
    }
    /**
     * @return {?}
     */
    get ar() {
        return this.w / this.h;
    }
    /**
     * @return {?}
     */
    get diag() {
        return Math.sqrt((this.w * this.w) + (this.h * this.h));
    }
    /**
     * @return {?}
     */
    get valid() {
        return this.w > 0 && this.h > 0 && this.aw > 0 && this.ah > 0;
    }
    /**
     * @return {?}
     */
    get widthBound() {
        return this.ar > (this.aw / this.ah);
    }
}
class PointerService {
    /**
     * @param {?} platform_id
     */
    constructor(platform_id) {
        this.platform_id = platform_id;
        this._disableSwiping = false;
        this._enableZoom = false;
        this._enablePan = false;
        this._startEVCache = null;
        this._evCache = new Array();
        this._previousDiagonal = -1;
        this._originalState = new State();
        this._slideEvent = new EventEmitter(true);
        this._clickEvent = new EventEmitter(true);
        this.pointerUp = (event) => {
            this._pointerUp(event);
        };
        this.pointerDown = (event) => {
            this._pointerDown(event);
        };
        this.pointerMove = (event) => {
            this._pointerMove(event);
        };
        // this._renderer = rendererFactory.createRenderer(null, null);
    }
    /**
     * @param {?} state
     * @return {?}
     */
    set disableSwiping(state) {
        this._disableSwiping = state;
    }
    /**
     * @param {?} state
     * @return {?}
     */
    set enableZoom(state) {
        this._enableZoom = state;
    }
    /**
     * @param {?} state
     * @return {?}
     */
    set enablePan(state) {
        this._enablePan = state;
    }
    /**
     * @param {?} el
     * @return {?}
     */
    bind(el) {
        if (isPlatformBrowser(this.platform_id)) {
            el.nativeElement.addEventListener('pointerdown', this.pointerDown);
            el.nativeElement.addEventListener('pointerup', this.pointerUp);
            el.nativeElement.addEventListener('pointercancel', this.pointerUp);
            el.nativeElement.addEventListener('pointerout', this.pointerUp);
            el.nativeElement.addEventListener('pointerleave', this.pointerUp);
            el.nativeElement.addEventListener('pointermove', this.pointerMove);
        }
    }
    /**
     * @param {?} el
     * @return {?}
     */
    unbind(el) {
        if (isPlatformBrowser(this.platform_id)) {
            el.nativeElement.removeEventListener('pointerdown', this.pointerDown);
            el.nativeElement.removeEventListener('pointerup', this.pointerUp);
            el.nativeElement.removeEventListener('pointercancel', this.pointerUp);
            el.nativeElement.removeEventListener('pointerout', this.pointerUp);
            el.nativeElement.removeEventListener('pointerleave', this.pointerUp);
            el.nativeElement.removeEventListener('pointermove', this.pointerMove);
        }
    }
    /**
     * @return {?}
     */
    get slideEvent() {
        return this._slideEvent;
    }
    /**
     * @return {?}
     */
    get clickEvent() {
        return this._clickEvent;
    }
    /**
     * @param {?} e
     * @return {?}
     */
    _pointerDown(e) {
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
    }
    /**
     * @param {?} e
     * @return {?}
     */
    _loadOriginalState(e) {
        if (!this._originalState.valid && e.target && ((e.target)).style && ((e.target)).style.backgroundImage) {
            const /** @type {?} */ imgUrlArr = ((e.target)).style.backgroundImage.match(/^url\(["']?(.+?)["']?\)$/);
            const /** @type {?} */ img = new Image();
            img.src = imgUrlArr[1];
            this._originalState.aw = ((e.target)).offsetWidth;
            this._originalState.ah = ((e.target)).offsetHeight;
            this._originalState.w = img.width;
            this._originalState.h = img.height;
        }
    }
    /**
     * @param {?} e
     * @return {?}
     */
    _convertBGSizeToPixels(e) {
        const /** @type {?} */ imgElement = ((e.target));
        let /** @type {?} */ bgSize = imgElement.style.backgroundSize;
        if (bgSize.indexOf(' ') > -1) {
            // backgroundSize pattern "auto 100px" or "100px auto" or "100px 200px"
            const /** @type {?} */ sizeTuple = bgSize.split(' ');
            bgSize = this._originalState.widthBound ? sizeTuple[0] : sizeTuple[1];
        }
        if (bgSize === 'cover') {
            bgSize = this._originalState.widthBound ? this._originalState.ah * this._originalState.ar : this._originalState.aw;
        }
        else if (bgSize.indexOf('px') > -1) {
            bgSize = bgSize.substring(0, bgSize.length - 2);
        }
        else if (bgSize.indexOf('%') > -1) {
            const /** @type {?} */ bgSizePercentage = Number(bgSize.substring(0, bgSize.length - 1)) / 100;
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
    }
    /**
     * @param {?} e
     * @return {?}
     */
    _convertBGPosToPixels(e) {
        if (this._originalState.valid) {
            const /** @type {?} */ imgElement = ((e.target));
            const /** @type {?} */ bgSize = this._currentBGSize(e);
            let /** @type {?} */ bgPosX = imgElement.style.backgroundPositionX;
            if (bgPosX.indexOf('px') === -1) {
                bgPosX = this._convertLiteralPosToPercentage(bgPosX);
                if (bgPosX.indexOf('%') > -1) {
                    let /** @type {?} */ bgPosXPercentage = Number(bgPosX.substring(0, bgPosX.length - 1)) / 100;
                    bgPosX = bgPosXPercentage * (this._originalState.aw - bgSize);
                }
                imgElement.style.backgroundPositionX = bgPosX + 'px';
            }
            let /** @type {?} */ bgPosY = imgElement.style.backgroundPositionY;
            if (bgPosY.indexOf('px') === -1) {
                bgPosY = this._convertLiteralPosToPercentage(bgPosY);
                if (bgPosY.indexOf('%') > -1) {
                    let /** @type {?} */ bgPosYPercentage = Number(bgPosY.substring(0, bgPosY.length - 1)) / 100;
                    bgPosY = bgPosYPercentage * (this._originalState.ah - (bgSize / this._originalState.ar));
                }
                imgElement.style.backgroundPositionY = bgPosY + 'px';
            }
        }
    }
    /**
     * @param {?} e
     * @return {?}
     */
    _pointerUp(e) {
        // Remove this event from the target's cache
        for (let /** @type {?} */ i = 0; i < this._evCache.length; i++) {
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
    }
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
    _checkClickOrSwipe(e) {
        if (!this._targetIsASlide(e)) {
            return;
        }
        const /** @type {?} */ duration = e.timeStamp - this._startEVCache.timeStamp;
        const /** @type {?} */ dirX = e.pageX - this._startEVCache.pageX;
        const /** @type {?} */ dirY = e.pageY - this._startEVCache.pageY;
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
    }
    /**
     * @param {?} e
     * @return {?}
     */
    _targetIsASlide(e) {
        return ((e.target)).classList.contains('slides');
    }
    /**
     * @param {?} e
     * @param {?} dirX
     * @return {?}
     */
    _cannotPanMoreTest(e, dirX) {
        if (!this._enablePan) {
            return true;
        }
        const /** @type {?} */ xPos = this._currentBGPosX(e);
        const /** @type {?} */ bgSize = this._currentBGSize(e);
        if (dirX < 0 && bgSize > this._originalState.aw && Math.round(this._originalState.aw - bgSize - xPos) < 0) {
            // image can be panned to the right
            return false;
        }
        else if (dirX > 0 && bgSize > this._originalState.aw && xPos < 0) {
            // image can be panned to the left
            return false;
        }
        return true;
    }
    /**
     * @param {?} e
     * @return {?}
     */
    _pointerMove(e) {
        // Prevent defaulted to start drag event after mouse click, else cancel event gets fired
        e.preventDefault();
        // If one pointer is down, goto 1 point action
        if (this._evCache.length === 1 && this._enablePan) {
            this._1pointMoveAction(e);
        }
        // Find this event in the cache and update its record with this event
        for (let /** @type {?} */ i = 0; i < this._evCache.length; i++) {
            if (e.pointerId === this._evCache[i].pointerId) {
                this._evCache[i] = e;
                break;
            }
        }
        // If two pointers are down, goto 2 point action
        if (this._evCache.length === 2 && this._enableZoom) {
            this._2pointMoveAction(e);
        }
    }
    /**
     * @param {?} e
     * @return {?}
     */
    _1pointMoveAction(e) {
        if (this._evCache[0].pointerId === e.pointerId) {
            const /** @type {?} */ dx = this._evCache[0].pageX - e.pageX;
            const /** @type {?} */ dy = this._evCache[0].pageY - e.pageY;
            if (this._originalState.valid && (dx !== 0 || dy !== 0)) {
                this._transformBGPosition(e, dx, dy);
            }
        }
    }
    /**
     * @param {?} e
     * @return {?}
     */
    _2pointMoveAction(e) {
        // check for pinch gestures
        // Calculate the distance between the two pointers
        const /** @type {?} */ x = Math.abs(this._evCache[0].pageX - this._evCache[1].pageX);
        const /** @type {?} */ y = Math.abs(this._evCache[0].pageY - this._evCache[1].pageY);
        let /** @type {?} */ currentDiagonal = Math.sqrt((x * x) + (y * y));
        // Start 2 point action after previous diagonal and orginal state is valid
        if (this._previousDiagonal > 0 && this._originalState.valid) {
            const /** @type {?} */ deltaX = currentDiagonal - this._previousDiagonal;
            this._transformBGSize(e, deltaX);
        }
        this._previousDiagonal = currentDiagonal;
    }
    /**
     * @param {?} e
     * @param {?} dx
     * @param {?} dy
     * @return {?}
     */
    _transformBGPosition(e, dx, dy) {
        const /** @type {?} */ imgElement = ((e.target));
        const /** @type {?} */ previousPosX = this._currentBGPosX(e);
        const /** @type {?} */ previousPosY = this._currentBGPosY(e);
        const /** @type {?} */ newPosX = this._newBGPosXConstraint(previousPosX - dx, e);
        const /** @type {?} */ newPosY = this._newBGPosYConstraint(previousPosY - dy, e);
        if (newPosX !== previousPosX || newPosY !== previousPosY) {
            this._setBGPos(imgElement, newPosX, newPosY);
        }
    }
    /**
     * @param {?} element
     * @param {?} x
     * @param {?} y
     * @return {?}
     */
    _setBGPos(element, x, y) {
        element.style.backgroundPositionX = x + 'px';
        element.style.backgroundPositionY = y + 'px';
    }
    /**
     * @param {?} e
     * @return {?}
     */
    _currentBGPosX(e) {
        let /** @type {?} */ bgPosX = ((e.target)).style.backgroundPositionX;
        if (bgPosX.indexOf('px') > -1) {
            bgPosX = bgPosX.substring(0, bgPosX.length - 2);
        }
        return Number(bgPosX);
    }
    /**
     * @param {?} e
     * @return {?}
     */
    _currentBGPosY(e) {
        let /** @type {?} */ bgPosY = ((e.target)).style.backgroundPositionY;
        if (bgPosY.indexOf('px') > -1) {
            bgPosY = bgPosY.substring(0, bgPosY.length - 2);
        }
        return Number(bgPosY);
    }
    /**
     * @param {?} literal
     * @return {?}
     */
    _convertLiteralPosToPercentage(literal) {
        if (literal === 'center') {
            return '50%';
        }
        else if (literal === 'top' || literal === 'left') {
            return '0%';
        }
        else if (literal === 'bottom' || literal === 'right') {
            return '100%';
        }
    }
    /**
     * @param {?} e
     * @param {?} deltaX
     * @return {?}
     */
    _transformBGSize(e, deltaX) {
        const /** @type {?} */ imgElement = ((e.target));
        const /** @type {?} */ currentSize = this._currentBGSize(e);
        const /** @type {?} */ newSize = this._newBGSizeConstraint(currentSize + deltaX);
        if (newSize !== currentSize) {
            this._setBGSize(imgElement, newSize);
        }
    }
    /**
     * @param {?} element
     * @param {?} size
     * @return {?}
     */
    _setBGSize(element, size) {
        element.style.backgroundSize = size + 'px auto';
        // stop all browser touch action after zooming slide
        element.style.touchAction = 'none';
    }
    /**
     * @param {?} e
     * @return {?}
     */
    _currentBGSize(e) {
        const /** @type {?} */ bgSize = ((e.target)).style.backgroundSize;
        if (bgSize.indexOf(' ') > -1) {
            // backgroundSize pattern "auto 100px" or "100px auto" or "100px 200px"
            const /** @type {?} */ sizeTuple = bgSize.split(' ');
            const /** @type {?} */ size = this._originalState.widthBound ? sizeTuple[0].substring(0, sizeTuple[0].length - 2) : sizeTuple[1].substring(0, sizeTuple[1].length - 2);
            return Number(size);
        }
        else if (bgSize.indexOf('px') > -1) {
            // backgroundSize pattern "100px"
            const /** @type {?} */ size = bgSize.substring(0, bgSize.length - 2);
            return Number(size);
        }
    }
    /**
     * @param {?} newSize
     * @return {?}
     */
    _newBGSizeConstraint(newSize) {
        if (this._originalState.widthBound) {
            return newSize < this._originalState.aw ? this._originalState.aw : newSize;
        }
        else {
            return newSize / this._originalState.ar < this._originalState.ah ? this._originalState.ah * this._originalState.ar : newSize;
        }
    }
    /**
     * @param {?} newX
     * @param {?} e
     * @return {?}
     */
    _newBGPosXConstraint(newX, e) {
        const /** @type {?} */ bgSize = this._currentBGSize(e);
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
    }
    /**
     * @param {?} newY
     * @param {?} e
     * @return {?}
     */
    _newBGPosYConstraint(newY, e) {
        const /** @type {?} */ bgSize = this._currentBGSize(e);
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
    }
}
PointerService.decorators = [
    { type: Injectable },
];
/**
 * @nocollapse
 */
PointerService.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [PLATFORM_ID,] },] },
];

// import { SwipeService } from './swipe.service';
const FIRST_SLIDE_KEY = makeStateKey("firstSlide");
class SlideshowComponent {
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
    constructor(_pointerService, _renderer, _transferState, _ngZone, _cdRef, sanitizer, platform_id, document) {
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
        this.onSlideLeft = new EventEmitter();
        this.onSlideRight = new EventEmitter();
        this.onSwipeLeft = new EventEmitter();
        this.onSwipeRight = new EventEmitter();
        this.onFullscreenExit = new EventEmitter();
        this.onIndexChanged = new EventEmitter();
        this.onImageLazyLoad = new EventEmitter();
        this.onClick = new EventEmitter();
    }
    /**
     * @return {?}
     */
    get safeStyleDotColor() {
        return this.sanitizer.bypassSecurityTrustStyle(`--dot-color: ${this.dotColor}`);
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        if (this.debug !== undefined) {
            console.warn("[Deprecation Warning]: The debug input will be removed from ng-simple-slideshow in 1.3.0");
        }
        this._slideSub = this._pointerService.slideEvent.subscribe((indexDirection) => {
            this.onSlide(indexDirection, true);
        });
        this._clickSub = this._pointerService.clickEvent.subscribe(() => {
            this._onClick();
        });
        if (this.noLoop) {
            this.hideLeftArrow = true;
        }
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        this._pointerService.bind(this.container);
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
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
                this._ngZone.runOutsideAngular(() => clearInterval(this._autoplayIntervalId));
                this._autoplayIntervalId = null;
            }
        }
        catch (error) {
            console.warn("Autoplay cancel error caught in ng-simple-slideshow OnDestroy:", error);
        }
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
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
    }
    /**
     * @return {?}
     */
    ngDoCheck() {
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
    }
    /**
     * \@description this is the function that should be called to make the slides change.
     *              indexDirection to move back is -1, to move forward is 1, and to stay in place is 0.
     *              0 is taken into account for failed swipes
     * @param {?} indexDirection
     * @param {?=} isSwipe
     * @return {?}
     */
    onSlide(indexDirection, isSwipe) {
        this.handleAutoPlay(this.stopAutoPlayOnSlide);
        this.slide(indexDirection, isSwipe);
    }
    /**
     * \@description Redirect to current slide "href" if defined
     * @return {?}
     */
    _onClick() {
        const /** @type {?} */ currentSlide = this.slides.length > 0 && this.slides[this.slideIndex];
        this.onClick.emit({ slide: currentSlide, index: this.slideIndex });
        if (currentSlide && currentSlide.image.clickAction) {
            currentSlide.image.clickAction();
        }
        else if (currentSlide && currentSlide.image.href) {
            this.document.location.href = currentSlide.image.href;
        }
    }
    /**
     * \@description set the index to the desired index - 1 and simulate a right slide
     * @param {?} index
     * @return {?}
     */
    goToSlide(index) {
        const /** @type {?} */ beforeClickIndex = this.slideIndex;
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
    }
    /**
     * \@description set the index to the desired index - 1 and simulate a right slide
     * @param {?} index
     * @return {?}
     */
    getSlideStyle(index) {
        const /** @type {?} */ slide = this.slides[index];
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
    }
    /**
     * @param {?} e
     * @return {?}
     */
    exitFullScreen(e) {
        e.preventDefault();
        this.fullscreen = false;
        this.onFullscreenExit.emit(true);
    }
    /**
     * \@description Set the new slide index, then make the transition happen.
     * @param {?} indexDirection
     * @param {?=} isSwipe
     * @return {?}
     */
    slide(indexDirection, isSwipe) {
        const /** @type {?} */ oldIndex = this.slideIndex;
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
    }
    /**
     * \@description This is just treating the url array like a circular list.
     * @param {?} indexDirection
     * @return {?}
     */
    setSlideIndex(indexDirection) {
        let /** @type {?} */ willChange = true;
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
    }
    /**
     * \@description This function handles the variables to move the CSS classes around accordingly.
     *              In order to correctly handle animations, the new slide as well as the slides to
     *              the left and right are assigned classes.
     * @param {?} oldIndex
     * @param {?=} isSwipe
     * @return {?}
     */
    slideLeft(oldIndex, isSwipe) {
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
    }
    /**
     * \@description This function handles the variables to move the CSS classes around accordingly.
     *              In order to correctly handle animations, the new slide as well as the slides to
     *              the left and right are assigned classes.
     * @param {?} oldIndex
     * @param {?=} isSwipe
     * @return {?}
     */
    slideRight(oldIndex, isSwipe) {
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
    }
    /**
     * \@description Check to make sure slide images have been set or haven't changed
     * @return {?}
     */
    setSlides() {
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
    }
    /**
     * \@description create the slides without background urls, which will be added in
     *              for the "lazy load," then load only the first slide
     * @return {?}
     */
    buildLazyLoadSlideArray() {
        for (let /** @type {?} */ image of this.imageUrls) {
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
    }
    /**
     * \@description create the slides with background urls all at once
     * @return {?}
     */
    buildSlideArray() {
        for (let /** @type {?} */ image of this.imageUrls) {
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
    }
    /**
     * \@description load the first slide image if lazy loading
     *              this takes server side and browser side into account
     * @return {?}
     */
    loadFirstSlide() {
        const /** @type {?} */ tmpIndex = this.slideIndex;
        const /** @type {?} */ tmpImage = this.imageUrls[tmpIndex];
        // if server side, we don't need to worry about the rest of the slides
        if (isPlatformServer(this.platform_id)) {
            this.slides[tmpIndex].image =
                typeof tmpImage === "string" ? { url: tmpImage } : tmpImage;
            this.slides[tmpIndex].loaded = true;
            this._transferState.set(FIRST_SLIDE_KEY, this.slides[tmpIndex]);
        }
        else {
            const /** @type {?} */ firstSlideFromTransferState = this._transferState.get(FIRST_SLIDE_KEY, /** @type {?} */ (null));
            // if the first slide didn't finish loading on the server side, we need to load it
            if (firstSlideFromTransferState === null) {
                let /** @type {?} */ loadImage = new Image();
                loadImage.src = typeof tmpImage === "string" ? tmpImage : tmpImage.url;
                loadImage.addEventListener("load", () => {
                    this.slides[tmpIndex].image =
                        typeof tmpImage === "string" ? { url: tmpImage } : tmpImage;
                    this.slides[tmpIndex].loaded = true;
                    this.onImageLazyLoad.emit(this.slides[tmpIndex]);
                    this._cdRef.detectChanges();
                });
            }
            else {
                this.slides[tmpIndex] = firstSlideFromTransferState;
                this._transferState.remove(FIRST_SLIDE_KEY);
            }
        }
    }
    /**
     * \@description if lazy loading in browser, start loading remaining slides
     * \@todo: figure out how to not show the spinner if images are loading fast enough
     * @return {?}
     */
    loadRemainingSlides() {
        for (let /** @type {?} */ i = 0; i < this.slides.length; i++) {
            if (!this.slides[i].loaded) {
                new Promise(resolve => {
                    const /** @type {?} */ tmpImage = this.imageUrls[i];
                    let /** @type {?} */ loadImage = new Image();
                    loadImage.addEventListener("load", () => {
                        this.slides[i].image =
                            typeof tmpImage === "string" ? { url: tmpImage } : tmpImage;
                        this.slides[i].loaded = true;
                        this._cdRef.detectChanges();
                        this.onImageLazyLoad.emit(this.slides[i]);
                        resolve();
                    });
                    loadImage.src =
                        typeof tmpImage === "string" ? tmpImage : tmpImage.url;
                });
            }
        }
    }
    /**
     * \@description Start or stop autoPlay, don't do it at all server side
     * @param {?=} stopAutoPlay
     * @return {?}
     */
    handleAutoPlay(stopAutoPlay) {
        if (isPlatformServer(this.platform_id)) {
            return;
        }
        if (stopAutoPlay === true || this.autoPlay === false) {
            if (this._autoplayIntervalId) {
                this._ngZone.runOutsideAngular(() => clearInterval(this._autoplayIntervalId));
                this._autoplayIntervalId = null;
            }
        }
        else if (!this._autoplayIntervalId) {
            this._ngZone.runOutsideAngular(() => {
                this._autoplayIntervalId = setInterval(() => {
                    if (!this.autoPlayWaitForLazyLoad ||
                        (this.autoPlayWaitForLazyLoad &&
                            this.slides[this.slideIndex] &&
                            this.slides[this.slideIndex].loaded)) {
                        this._ngZone.run(() => this.slide(1));
                    }
                }, this.autoPlayInterval);
            });
        }
    }
    /**
     * \@description Keep the styles up to date with the input
     * @return {?}
     */
    setStyles() {
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
    }
    /**
     * \@description compare image array to the cache, returns false if no changes
     * @return {?}
     */
    checkCache() {
        return !(this._urlCache.length === this.imageUrls.length &&
            this._urlCache.every((cacheElement, i) => cacheElement === this.imageUrls[i]));
    }
    /**
     * \@description get the index for the slide to the left of the new slide
     * @param {?=} i
     * @return {?}
     */
    getLeftSideIndex(i) {
        if (i === undefined) {
            i = this.slideIndex;
        }
        if (--i < 0) {
            i = this.slides.length - 1;
        }
        return i;
    }
    /**
     * \@description get the index for the slide to the right of the new slide
     * @param {?=} i
     * @return {?}
     */
    getRightSideIndex(i) {
        if (i === undefined) {
            i = this.slideIndex;
        }
        if (++i >= this.slides.length) {
            i = 0;
        }
        return i;
    }
    /**
     * \@description a trackBy function for the ngFor loops
     * @param {?} index
     * @param {?} slide
     * @return {?}
     */
    trackByFn(index, slide) {
        return slide.image;
    }
    /**
     * \@description don't let click events fire, handle in pointer service instead
     * @param {?} event
     * @return {?}
     */
    handleClick(event) {
        event.preventDefault();
    }
}
SlideshowComponent.decorators = [
    { type: Component, args: [{
                selector: "slideshow",
                template: `
    <!-- fullscreen bar -->
    <div [class.display-none]="!fullscreen"
         class="fs-container"
         (click)="exitFullScreen($event)">
      <i title="Back"
         class="arrow-exitfs prev"></i>
    </div>
    <div #container
         class="slideshow-container"
         [class.slideshow-container-fs]="fullscreen">
      <!-- slides -->
      <a *ngFor="let slide of slides; index as i; trackBy: trackByFn"
         class="slides"
         href="#!"
         tabindex="-1"
         title="{{slide?.image?.title}}"
         [ngStyle]="getSlideStyle(i)"
         (click)="handleClick($event)"
         [class.selected]="slide?.selected"
         [class.hide-slide]="!slide?.selected && !slide?.leftSide && !slide?.rightSide"
         [class.left-side]="slide?.leftSide"
         [class.right-side]="slide?.rightSide"
         [class.slide-in-left]="slide?.action === 'slideInLeft'"
         [class.slide-in-right]="slide?.action === 'slideInRight'"
         [class.slide-out-left]="slide?.action === 'slideOutLeft'"
         [class.slide-out-right]="slide?.action === 'slideOutRight'"
         [class.link]="slide?.image?.clickAction || slide?.image?.href">
        <div class="loader"
             *ngIf="!slide?.loaded"></div>
        <div *ngIf="showCaptions && slide?.image?.caption"
             class="caption"
             [ngStyle]="{
               'color': captionColor,
               'background-color': captionBackground
              }"
             [innerHTML]="slide?.image?.caption">
        </div>
      </a>
      <!-- left arrow -->
      <div [class.display-none]="!showArrows || hideLeftArrow"
           (click)="onSlide(-1)"
           class="arrow-container prev">
        <i #prevArrow
           title="Previous"
           class="arrow prev"></i>
      </div>
      <!-- right arrow -->
      <div [class.display-none]="!showArrows || hideRightArrow"
           (click)="onSlide(1)"
           class="arrow-container next">
        <i #nextArrow
           title="Next"
           class="arrow next"></i>
      </div>
      <!-- dots -->
      <ul class="slick-dots"
          *ngIf="showDots">
        <li *ngFor="let slide of slides; index as i; trackBy: trackByFn"
            (click)="goToSlide(i)"
            [class.slick-active]="slide.selected">
          <button type="button"
                  [attr.style]="safeStyleDotColor">
            {{i}}
          </button>
        </li>
      </ul>
    </div>
  `,
                styles: [`
    /*
     styles adapted from https://www.w3schools.com/w3css/4/w3.css
     arrow styles adapted from https://codepen.io/minustalent/pen/Frhaw
     */
    .display-none {
      display: none !important; }

    .fs-container {
      display: block;
      cursor: pointer;
      position: fixed;
      z-index: 1;
      top: 16px;
      left: 16px;
      width: 46px;
      height: 46px;
      text-align: center;
      padding: 0;
      background-color: rgba(0, 0, 0, 0.2);
      -webkit-transition: all .2s ease-in-out;
      transition: all .2s ease-in-out; }
      .fs-container:hover {
        background-color: rgba(0, 0, 0, 0.33); }
      .fs-container .arrow-exitfs {
        display: block;
        width: 30px;
        height: 30px;
        background: transparent;
        border-top: 2px solid #f2f2f2;
        -webkit-transition: all .2s ease-in-out;
        transition: all .2s ease-in-out; }
        .fs-container .arrow-exitfs.prev {
          -webkit-transform: rotate(-45deg);
                  transform: rotate(-45deg);
          position: relative;
          left: 18px;
          top: 18px; }
        .fs-container .arrow-exitfs:after {
          content: '';
          width: 30px;
          height: 30px;
          background: transparent;
          border-top: 2px solid #f2f2f2;
          -webkit-transform: rotate(90deg);
                  transform: rotate(90deg);
          position: absolute;
          left: -15px;
          top: -17px; }

    .slideshow-container.slideshow-container-fs {
      position: fixed;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%; }

    .slideshow-container {
      position: relative;
      display: block;
      margin: auto;
      height: 100%;
      width: 100%;
      overflow: hidden; }
      .slideshow-container .hide-slide {
        visibility: hidden;
        position: absolute;
        top: -100vw;
        left: -100vw;
        opacity: 0; }
      .slideshow-container .slides {
        -ms-touch-action: pan-y;
            touch-action: pan-y;
        position: absolute;
        top: 0;
        height: 100%;
        width: 100%;
        visibility: visible;
        opacity: 1;
        display: block; }
        .slideshow-container .slides.selected {
          left: 0; }
        .slideshow-container .slides.left-slide {
          left: -100%; }
        .slideshow-container .slides.right-slide {
          left: 100%; }
        .slideshow-container .slides.slide-in-left {
          left: 0;
          -webkit-animation: slideInLeft 0.5s cubic-bezier(0.42, 0, 0.58, 1);
                  animation: slideInLeft 0.5s cubic-bezier(0.42, 0, 0.58, 1); }
        .slideshow-container .slides.slide-in-right {
          left: 0;
          -webkit-animation: slideInRight 0.5s cubic-bezier(0.42, 0, 0.58, 1);
                  animation: slideInRight 0.5s cubic-bezier(0.42, 0, 0.58, 1); }
        .slideshow-container .slides.slide-out-left {
          left: -100%;
          -webkit-animation: slideOutLeft 0.5s cubic-bezier(0.42, 0, 0.58, 1);
                  animation: slideOutLeft 0.5s cubic-bezier(0.42, 0, 0.58, 1); }
        .slideshow-container .slides.slide-out-right {
          left: 100%;
          -webkit-animation: slideOutRight 0.5s cubic-bezier(0.42, 0, 0.58, 1);
                  animation: slideOutRight 0.5s cubic-bezier(0.42, 0, 0.58, 1); }
        .slideshow-container .slides.link {
          cursor: pointer; }
        .slideshow-container .slides:not(.link) {
          cursor: default; }
      .slideshow-container .caption {
        position: absolute;
        bottom: 0;
        padding: 10px;
        width: 100%; }
      .slideshow-container .arrow-container {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-align: center;
            -ms-flex-align: center;
                align-items: center;
        -webkit-box-pack: center;
            -ms-flex-pack: center;
                justify-content: center;
        position: absolute;
        top: 0;
        height: 100%;
        width: auto;
        cursor: pointer;
        background-size: 100%;
        background-image: -webkit-gradient(linear, left top, left bottom, from(transparent), to(transparent));
        background-image: linear-gradient(transparent, transparent);
        z-index: 100;
        -webkit-user-select: none;
           -moz-user-select: none;
            -ms-user-select: none;
                user-select: none; }
        .slideshow-container .arrow-container:before {
          display: block;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0;
          width: 100%;
          z-index: -100;
          -webkit-transition: opacity 0.45s;
          transition: opacity 0.45s; }
        .slideshow-container .arrow-container.prev {
          left: 0; }
          .slideshow-container .arrow-container.prev:before {
            background-image: -webkit-gradient(linear, right top, left top, from(transparent), to(rgba(0, 0, 0, 0.75)));
            background-image: linear-gradient(to left, transparent, rgba(0, 0, 0, 0.75));
            content: ''; }
        .slideshow-container .arrow-container.next {
          right: 0; }
          .slideshow-container .arrow-container.next:before {
            background-image: -webkit-gradient(linear, left top, right top, from(transparent), to(rgba(0, 0, 0, 0.75)));
            background-image: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.75));
            content: ''; }
        .slideshow-container .arrow-container .arrow {
          display: block;
          margin: auto;
          width: 30px;
          height: 30px;
          background: transparent;
          border-top: 2px solid #f2f2f2;
          border-left: 2px solid #f2f2f2;
          -webkit-transition: all .2s ease-in-out;
          transition: all .2s ease-in-out;
          -webkit-user-select: none;
             -moz-user-select: none;
              -ms-user-select: none;
                  user-select: none; }
          .slideshow-container .arrow-container .arrow:before {
            display: block;
            height: 200%;
            width: 200%;
            margin-left: -50%;
            margin-top: -50%;
            content: "";
            -webkit-transform: rotate(45deg);
                    transform: rotate(45deg); }
          .slideshow-container .arrow-container .arrow.prev {
            -webkit-transform: rotate(-45deg);
                    transform: rotate(-45deg);
            position: relative;
            left: 20px;
            margin-right: 10px; }
          .slideshow-container .arrow-container .arrow.next {
            -webkit-transform: rotate(135deg);
                    transform: rotate(135deg);
            position: relative;
            right: 20px;
            margin-left: 10px; }
      .slideshow-container .slick-dots {
        display: block;
        bottom: 15px;
        z-index: 1;
        text-align: center;
        position: absolute;
        padding: 0;
        left: 0;
        right: 0;
        margin: 0 auto; }
        .slideshow-container .slick-dots li {
          display: inline;
          margin: 0;
          padding: 0; }
          .slideshow-container .slick-dots li button {
            border: none;
            background: none;
            text-indent: -9999px;
            font-size: 0;
            width: 20px;
            height: 20px;
            outline: none;
            position: relative;
            z-index: 1;
            cursor: pointer; }
            .slideshow-container .slick-dots li button:before {
              content: '';
              width: 4px;
              height: 4px;
              background: var(--dot-color, #FFF);
              border-radius: 4px;
              display: block;
              position: absolute;
              top: 50%;
              left: 50%;
              -webkit-transform: translate(-50%, -50%);
                      transform: translate(-50%, -50%);
              opacity: .7;
              -webkit-transition: all .5s ease-out;
              transition: all .5s ease-out; }
          .slideshow-container .slick-dots li.slick-active button:before {
            -webkit-transform: translate(-50%, -50%) scale(1.4);
                    transform: translate(-50%, -50%) scale(1.4);
            opacity: 1; }

    @media screen and (min-width: 768px) {
      .slideshow-container .arrow-container:hover:before {
        opacity: 1; }
      .slideshow-container .arrow-container:hover .arrow {
        border-width: 4px; }
      .slideshow-container .arrow-container .arrow:hover {
        border-width: 4px; } }

    @-webkit-keyframes slideInRight {
      0% {
        left: -100%; }
      100% {
        left: 0; } }

    @keyframes slideInRight {
      0% {
        left: -100%; }
      100% {
        left: 0; } }

    @-webkit-keyframes slideInLeft {
      0% {
        left: 100%; }
      100% {
        left: 0; } }

    @keyframes slideInLeft {
      0% {
        left: 100%; }
      100% {
        left: 0; } }

    @-webkit-keyframes slideOutRight {
      0% {
        left: 0; }
      100% {
        left: -100%; } }

    @keyframes slideOutRight {
      0% {
        left: 0; }
      100% {
        left: -100%; } }

    @-webkit-keyframes slideOutLeft {
      0% {
        left: 0; }
      100% {
        left: 100%; } }

    @keyframes slideOutLeft {
      0% {
        left: 0; }
      100% {
        left: 100%; } }

    .loader {
      position: absolute;
      left: 50%;
      margin-left: -20px;
      top: 50%;
      margin-top: -20px;
      border: 5px solid #f3f3f3;
      border-top: 5px solid #555;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      -webkit-animation: spin 1s linear infinite;
              animation: spin 1s linear infinite; }

    @-webkit-keyframes spin {
      0% {
        -webkit-transform: rotate(0deg);
                transform: rotate(0deg); }
      100% {
        -webkit-transform: rotate(360deg);
                transform: rotate(360deg); } }

    @keyframes spin {
      0% {
        -webkit-transform: rotate(0deg);
                transform: rotate(0deg); }
      100% {
        -webkit-transform: rotate(360deg);
                transform: rotate(360deg); } }
  `],
                providers: [PointerService],
                changeDetection: ChangeDetectionStrategy.OnPush
            },] },
];
/**
 * @nocollapse
 */
SlideshowComponent.ctorParameters = () => [
    { type: PointerService, },
    { type: Renderer2, },
    { type: TransferState, },
    { type: NgZone, },
    { type: ChangeDetectorRef, },
    { type: DomSanitizer, },
    { type: undefined, decorators: [{ type: Inject, args: [PLATFORM_ID,] },] },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] },] },
];
SlideshowComponent.propDecorators = {
    'imageUrls': [{ type: Input },],
    'height': [{ type: Input },],
    'minHeight': [{ type: Input },],
    'arrowSize': [{ type: Input },],
    'showArrows': [{ type: Input },],
    'disableSwiping': [{ type: Input },],
    'autoPlay': [{ type: Input },],
    'autoPlayInterval': [{ type: Input },],
    'stopAutoPlayOnSlide': [{ type: Input },],
    'autoPlayWaitForLazyLoad': [{ type: Input },],
    'debug': [{ type: Input },],
    'backgroundSize': [{ type: Input },],
    'backgroundPosition': [{ type: Input },],
    'backgroundRepeat': [{ type: Input },],
    'showDots': [{ type: Input },],
    'dotColor': [{ type: Input },],
    'showCaptions': [{ type: Input },],
    'captionColor': [{ type: Input },],
    'captionBackground': [{ type: Input },],
    'lazyLoad': [{ type: Input },],
    'hideOnNoSlides': [{ type: Input },],
    'fullscreen': [{ type: Input },],
    'enableZoom': [{ type: Input },],
    'enablePan': [{ type: Input },],
    'noLoop': [{ type: Input },],
    'onSlideLeft': [{ type: Output },],
    'onSlideRight': [{ type: Output },],
    'onSwipeLeft': [{ type: Output },],
    'onSwipeRight': [{ type: Output },],
    'onFullscreenExit': [{ type: Output },],
    'onIndexChanged': [{ type: Output },],
    'onImageLazyLoad': [{ type: Output },],
    'onClick': [{ type: Output },],
    'container': [{ type: ViewChild, args: ["container",] },],
    'prevArrow': [{ type: ViewChild, args: ["prevArrow",] },],
    'nextArrow': [{ type: ViewChild, args: ["nextArrow",] },],
};

class SlideshowModule {
}
SlideshowModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule,
                    BrowserTransferStateModule
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
SlideshowModule.ctorParameters = () => [];

/**
 * Generated bundle index. Do not edit.
 */

export { SlideshowModule, PointerService as ɵb, SlideshowComponent as ɵa };
//# sourceMappingURL=ng-simple-slideshow.js.map
