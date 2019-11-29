import { EXAM_CHOICES } from "./EXAM_CHOICES";

export class EXAM_QUESTION {
    answered: boolean;
    constructor(
      public id: number,
      public description: string,
      public choices: EXAM_CHOICES[]
    ) { }
  }