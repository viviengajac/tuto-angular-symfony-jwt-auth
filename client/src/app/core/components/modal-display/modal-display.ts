import { Component, Input } from '@angular/core';
import { FeedbackHandler } from '../../services/feedback-handler/feedback-handler';
import { ModalHandler } from '../../services/modal-handler/modal-handler';
import { FeedbackDisplay } from '../feedback-display/feedback-display';

@Component({
  selector: 'app-modal-display',
  imports: [
    FeedbackDisplay,
  ],
  templateUrl: './modal-display.html',
  styleUrl: './modal-display.scss',
  providers: [ModalHandler],
})
export class ModalDisplay {
  @Input() modalId!: string;

  constructor(
    protected feedback: FeedbackHandler,
    public modal: ModalHandler
  ) {}

  protected onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.modal.close();
    }
  }
}
