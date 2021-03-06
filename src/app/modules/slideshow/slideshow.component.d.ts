import { ElementRef, EventEmitter, Renderer2, DoCheck, NgZone, OnInit, OnDestroy, ChangeDetectorRef, OnChanges, SimpleChanges, AfterViewInit } from "@angular/core";
import { ISlide } from "./ISlide";
import { IImage } from "./IImage";
import { DomSanitizer, TransferState, SafeStyle } from "@angular/platform-browser";
import { PointerService } from "./pointer.service";
export declare class SlideshowComponent implements OnInit, AfterViewInit, DoCheck, OnChanges, OnDestroy {
    private _pointerService;
    private _renderer;
    private _transferState;
    private _ngZone;
    private _cdRef;
    sanitizer: DomSanitizer;
    private platform_id;
    private document;
    slideIndex: number;
    slides: ISlide[];
    hideLeftArrow: boolean;
    hideRightArrow: boolean;
    private _urlCache;
    private _autoplayIntervalId;
    private _initial;
    private _isHidden;
    private _slideSub;
    private _clickSub;
    imageUrls: (string | IImage)[];
    height: string;
    minHeight: string;
    arrowSize: string;
    showArrows: boolean;
    disableSwiping: boolean;
    autoPlay: boolean;
    autoPlayInterval: number;
    stopAutoPlayOnSlide: boolean;
    autoPlayWaitForLazyLoad: boolean;
    debug: boolean;
    backgroundSize: string;
    backgroundPosition: string;
    backgroundRepeat: string;
    showDots: boolean;
    dotColor: string;
    showCaptions: boolean;
    captionColor: string;
    captionBackground: string;
    lazyLoad: boolean;
    hideOnNoSlides: boolean;
    fullscreen: boolean;
    enableZoom: boolean;
    enablePan: boolean;
    noLoop: boolean;
    onSlideLeft: EventEmitter<number>;
    onSlideRight: EventEmitter<number>;
    onSwipeLeft: EventEmitter<number>;
    onSwipeRight: EventEmitter<number>;
    onFullscreenExit: EventEmitter<boolean>;
    onIndexChanged: EventEmitter<number>;
    onImageLazyLoad: EventEmitter<ISlide>;
    onClick: EventEmitter<{
        slide: ISlide;
        index: number;
    }>;
    container: ElementRef;
    prevArrow: ElementRef;
    nextArrow: ElementRef;
    readonly safeStyleDotColor: SafeStyle;
    constructor(_pointerService: PointerService, _renderer: Renderer2, _transferState: TransferState, _ngZone: NgZone, _cdRef: ChangeDetectorRef, sanitizer: DomSanitizer, platform_id: any, document: any);
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngDoCheck(): void;
    /**
     * @param {number} indexDirection
     * @param {boolean} isSwipe
     * @description this is the function that should be called to make the slides change.
     *              indexDirection to move back is -1, to move forward is 1, and to stay in place is 0.
     *              0 is taken into account for failed swipes
     */
    onSlide(indexDirection: number, isSwipe?: boolean): void;
    /**
     * @description Redirect to current slide "href" if defined
     */
    private _onClick();
    /**
     * @param {number} index
     * @description set the index to the desired index - 1 and simulate a right slide
     */
    goToSlide(index: number): void;
    /**
     * @param {number} index
     * @description set the index to the desired index - 1 and simulate a right slide
     */
    getSlideStyle(index: number): {
        "background-image": string;
        "background-size": string;
        "background-position": string;
        "background-repeat": string;
    };
    exitFullScreen(e: Event): void;
    /**
     * @param {number} indexDirection
     * @param {boolean} isSwipe
     * @description Set the new slide index, then make the transition happen.
     */
    private slide(indexDirection, isSwipe?);
    /**
     * @param {number} indexDirection
     * @description This is just treating the url array like a circular list.
     */
    private setSlideIndex(indexDirection);
    /**
     * @param {number} oldIndex
     * @param {boolean} isSwipe
     * @description This function handles the variables to move the CSS classes around accordingly.
     *              In order to correctly handle animations, the new slide as well as the slides to
     *              the left and right are assigned classes.
     */
    private slideLeft(oldIndex, isSwipe?);
    /**
     * @param {number} oldIndex
     * @param {boolean} isSwipe
     * @description This function handles the variables to move the CSS classes around accordingly.
     *              In order to correctly handle animations, the new slide as well as the slides to
     *              the left and right are assigned classes.
     */
    private slideRight(oldIndex, isSwipe?);
    /**
     * @description Check to make sure slide images have been set or haven't changed
     */
    private setSlides();
    /**
     * @description create the slides without background urls, which will be added in
     *              for the "lazy load," then load only the first slide
     */
    private buildLazyLoadSlideArray();
    /**
     * @description create the slides with background urls all at once
     */
    private buildSlideArray();
    /**
     * @description load the first slide image if lazy loading
     *              this takes server side and browser side into account
     */
    private loadFirstSlide();
    /**
     * @description if lazy loading in browser, start loading remaining slides
     * @todo: figure out how to not show the spinner if images are loading fast enough
     */
    private loadRemainingSlides();
    /**
     * @param {boolean} stopAutoPlay
     * @description Start or stop autoPlay, don't do it at all server side
     */
    private handleAutoPlay(stopAutoPlay?);
    /**
     * @description Keep the styles up to date with the input
     */
    private setStyles();
    /**
     * @description compare image array to the cache, returns false if no changes
     */
    private checkCache();
    /**
     * @param {number} i
     * @returns {number}
     * @description get the index for the slide to the left of the new slide
     */
    private getLeftSideIndex(i?);
    /**
     * @param {number} i
     * @returns {number}
     * @description get the index for the slide to the right of the new slide
     */
    private getRightSideIndex(i?);
    /**
     * @param {number} index
     * @param {ISlide} slide
     * @returns {any}
     * @description a trackBy function for the ngFor loops
     */
    trackByFn(index: number, slide: ISlide): any;
    /**
     * @description don't let click events fire, handle in pointer service instead
     */
    handleClick(event: any): void;
}
