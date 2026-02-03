import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ModalHandler {

  private isOpenSignal: WritableSignal<boolean> = signal(false);
  private isClosingSignal: WritableSignal<boolean> = signal(false);

  public open(): void {
    this.isOpenSignal.set(true);
    this.isClosingSignal.set(false);
  }

  public close(): void {
    this.isClosingSignal.set(true);
    setTimeout(() => {
      this.isOpenSignal.set(false);
      this.isClosingSignal.set(false);
    }, 250);
  }

  public isOpen(): boolean {
    return this.isOpenSignal();
  }

  public isClosing(): boolean {
    return this.isClosingSignal();
  }
}
