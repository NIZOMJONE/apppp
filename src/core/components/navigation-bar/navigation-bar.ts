// (C) Copyright 2015 Moodle Pty Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChange } from '@angular/core';
import { Translate } from '@singletons';

/**
 * Component to show a "bar" with arrows to navigate forward/backward and an slider to move around.
 *
 * This directive will show two arrows at the left and right of the screen to navigate to previous/next item when clicked.
 * If no previous/next item is defined, that arrow won't be shown.
 *
 * Example usage:
 * <core-navigation-bar [items]="items" (action)="goTo($event)"></core-navigation-bar>
 */
@Component({
    selector: 'core-navigation-bar',
    templateUrl: 'core-navigation-bar.html',
    styleUrls: ['navigation-bar.scss'],
})
export class CoreNavigationBarComponent implements OnChanges {

    @Input() items: CoreNavigationBarItem[] = []; // List of items.
    @Input() showTitles = false; // Display titles on buttons.
    @Input() previousTranslate = 'core.previous'; // Previous translatable text, can admit $a variable.
    @Input() nextTranslate = 'core.next'; // Next translatable text, can admit $a variable.
    @Input() component?: string; // Component the bar belongs to.
    @Input() componentId?: number; // Component ID.
    @Input() contextLevel?: string; // The context level.
    @Input() contextInstanceId?: number; // The instance ID related to the context.
    @Input() courseId?: number; // Course ID the text belongs to. It can be used to improve performance with filters.

    previousTitle?: string; // Previous item title.
    nextTitle?: string; // Next item title.
    previousIndex = -1; // Previous item index. If -1, the previous arrow won't be shown.
    nextIndex = -1; // Next item index. If -1, the next arrow won't be shown.
    currentIndex = 0;

    // Function to call when arrow is clicked. Will receive as a param the item to load.
    @Output() action: EventEmitter<unknown> = new EventEmitter<unknown>();

    /**
     * @inheritdoc
     */
    ngOnChanges(changes: {[name: string]: SimpleChange}): void {
        if (!changes.items || !this.items.length) {
            return;
        }

        this.currentIndex = this.items.findIndex((item) => item.current);
        if (this.currentIndex < 0) {
            return;
        }

        this.nextIndex = this.items[this.currentIndex + 1]?.enabled ? this.currentIndex + 1 : -1;
        if (this.nextIndex >= 0) {
            this.nextTitle = Translate.instant(this.nextTranslate, { $a: this.items[this.nextIndex].title || '' });
        }

        this.previousIndex = this.items[this.currentIndex - 1]?.enabled ? this.currentIndex - 1 : -1;
        if (this.previousIndex >= 0) {
            this.previousTitle = Translate.instant(this.previousTranslate, { $a: this.items[this.previousIndex].title || '' });
        }
    }

    /**
     * Navigate to an item.
     *
     * @param itemIndex Selected item index.
     */
    navigate(itemIndex: number): void {
        if (this.currentIndex == itemIndex || !this.items[itemIndex].enabled) {
            return;
        }

        this.currentIndex = itemIndex;
        this.action.emit(this.items[itemIndex].item);
    }

    /**
     * Navigate to an item with the range component.
     *
     * @param target: Element changed.
     */
    navigateOnRange(target: HTMLIonRangeElement): void {
        const selectedIndex = target.value as number; // Single value, use number.
        if (!this.items[selectedIndex].enabled) {
            target.value = this.currentIndex;

            return;
        }

        this.navigate(selectedIndex);
    }

}

export type CoreNavigationBarItem<T = unknown> = {
    item: T;
    title?: string;
    current: boolean;
    enabled: boolean;
};
