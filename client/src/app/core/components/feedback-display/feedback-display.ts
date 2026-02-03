import { Component, Input } from '@angular/core';
import { WritableSignal } from '@angular/core';
import { FeedbackHandler } from '../../services/feedback-handler/feedback-handler';

@Component({
  selector: 'app-feedback-display',
  imports: [],
  templateUrl: './feedback-display.html',
  styleUrl: './feedback-display.scss',
  providers: [FeedbackHandler],
})
export class FeedbackDisplay {
  @Input({ required: true }) status!: WritableSignal<string | null>;
  @Input({ required: true }) message!: WritableSignal<string>;
}
