import { EXAM_QUESTION } from "./EXAM_QUESTION";

export class EXAM_CHOICES {
    selected: boolean;
    constructor(
      public id: number,
      public choiceDescription: string,
      public answer: number
    ) { }
  }