import { ElementRef, EventEmitter } from '@angular/core';
export declare class PointerService {
    private platform_id;
    private _disableSwiping;
    private _enableZoom;
    private _enablePan;
    private _startEVCache;
    private _evCache;
    private _previousDiagonal;
    private _originalState;
    private _slideEvent;
    private _clickEvent;
    private pointerUp;
    private pointerDown;
    private pointerMove;
    disableSwiping: boolean;
    enableZoom: boolean;
    enablePan: boolean;
    bind(el: ElementRef): void;
    unbind(el: ElementRef): void;
    readonly slideEvent: EventEmitter<Number>;
    readonly clickEvent: EventEmitter<void>;
    constructor(platform_id: any);
    private _pointerDown(e);
    private _loadOriginalState(e);
    private _convertBGSizeToPixels(e);
    private _convertBGPosToPixels(e);
    private _pointerUp(e);
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
     */
    private _checkClickOrSwipe(e);
    private _targetIsASlide(e);
    private _cannotPanMoreTest(e, dirX);
    private _pointerMove(e);
    private _1pointMoveAction(e);
    private _2pointMoveAction(e);
    private _transformBGPosition(e, dx, dy);
    private _setBGPos(element, x, y);
    private _currentBGPosX(e);
    private _currentBGPosY(e);
    private _convertLiteralPosToPercentage(literal);
    private _transformBGSize(e, deltaX);
    private _setBGSize(element, size);
    private _currentBGSize(e);
    private _newBGSizeConstraint(newSize);
    private _newBGPosXConstraint(newX, e);
    private _newBGPosYConstraint(newY, e);
}
