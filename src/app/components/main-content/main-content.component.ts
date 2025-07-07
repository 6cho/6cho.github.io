import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { TextTestComponent } from '../text-test/text-test.component';
import { CommonModule } from '@angular/common';
import { DynamicCornersComponent } from '../dynamic-corners/dynamic-corners.component';

@Component({
  selector: 'main-content',
  standalone: true,
  imports: [TextTestComponent, CommonModule, DynamicCornersComponent],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss',
})
export class MainContentComponent {
  @HostBinding('class') class = 'component main-content';
  @Input() scroll: number = 0;
  public scrolled = false;
  @Output() scrollChange: EventEmitter<number> = new EventEmitter<number>();

  @ViewChild('innerContent') innerContent!: ElementRef;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['scroll'] && changes['scroll'].previousValue) {
      this.scroll = changes['scroll'].currentValue;
      this.innerContent.nativeElement.scrollTop = this.scroll;
    }
  }

  @HostListener('window:scroll', ['$event']) // for window scroll events
  onScroll(event: any) {
    this.scroll = this.innerContent.nativeElement.scrollTop;
    this.scrolled = this.scroll >= 50;
    this.scrollChange.emit(this.scroll);
  }
}
