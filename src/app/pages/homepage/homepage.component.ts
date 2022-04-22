import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import * as confetti from 'canvas-confetti';
import { Router } from '@angular/router';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit {
  count: number = 0;

  constructor(
    private renderer2: Renderer2,
    private elementRef: ElementRef,
    private router: Router
  ) {}

  ngOnInit(): void {}

  wow() {
    console.log('Try it three times.');
  }

  public surprise(): void {
    switch (this.count) {
      case 1:
        console.log('Ok one more...');
        break;
      case 2:
        console.log('Congratulations...');
        break;
      default:
        console.log('Try it three times...');
    }
    this.count += 1;

    const canvas = this.renderer2.createElement('canvas');

    this.renderer2.appendChild(this.elementRef.nativeElement, canvas);

    const myConfetti = confetti.create(canvas, {
      resize: true,
      // will fit all screen sizes
    });

    let options = {
      particleCount: this.getRandomInt(1000),
      spread: this.getRandomInt(1000),
      ticks: this.getRandomInt(1000),
    };
    myConfetti(options);

    if (this.count == 3) {
      setTimeout(() => {
        this.router.navigateByUrl('/secret');
      }, 3000);
    }
  }

  getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }
}
