import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { RE_SUBJECT } from '@entity/RE_SUBJECT';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService {

  createDb() {
    const videos: RE_SUBJECT[] = [
      new RE_SUBJECT('Web Development', 'Angular', 'assets/SampleVideo_1280x720_2mb.mp4', 'video/mp4', 14),
      new RE_SUBJECT('Classical Music', 'Mozart Classical Music', 'assets/big-buck-bunny_trailer.webm', 'video/ogg', 32),
      new RE_SUBJECT('Movie', 'mov_bbb', 'assets/mov_bbb.mp4', 'video/mp4', 10),
      new RE_SUBJECT('Informational', 'Nissan XTerra', 'assets/Nissan Xterra Tailgate wont stay up_ Lift Support Shock Replacement video.mp4', 'video/mp4', 14),
      new RE_SUBJECT('Life Thought', 'Addiction', 'assets/Addiction.mp4', 'video/mp4', 14),
      new RE_SUBJECT('Nature Ways', 'Nature View', 'assets/nature.mp4','video/mp4',30)
    ];
    return { videos };
  }

  genId(videos: string[]): number {
    return videos.length + 1;
  }
}
