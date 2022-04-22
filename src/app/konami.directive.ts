import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[konami]'
})
export class KonamiDirective {

  @Output()
  private konami: EventEmitter<void>;

  private sequence: string[];

  private konamiCode: string[];

  constructor() {
    this.konami = new EventEmitter<void>();
    this.sequence = [];
    this.konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    
    if (event.key) {
      this.sequence.push(event.key.toString());

      if (this.sequence.length > this.konamiCode.length) {
        this.sequence.shift();
      }

      if (this.isKonamiCode()) {
        this.konami.emit();
      }
    }
  }

  isKonamiCode(): boolean {
    return this.konamiCode.every((code: string, index: number) => code === this.sequence[index]);
  }

}
