import { Component, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit, OnDestroy {

  protected readonly title: WritableSignal<string> = signal('client');
  protected readonly name: string = 'Angular';
  protected readonly now: WritableSignal<Date> = signal(new Date());
  private intervalId?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.now.set(new Date());
    }, 1000);
  }

  ngOnDestroy(): void {
    // Nettoyage quand le composant est détruit
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

}
