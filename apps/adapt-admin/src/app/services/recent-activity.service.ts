import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RecentActivityService {
  constructor() {}

  public addRecentActivity(id: string, type: 'DataView' | 'Report' | 'DataSource', item: any) {
    const history = this.history;

    const filtered = history.filter((item) => item.id !== id).slice(0, 2) as {
      id: string;
      type: 'DataView' | 'Report' | 'DataSource';
      item: any;
    }[];

    filtered.unshift({ id, type, item });

    this.history = filtered;
  }

  public get history() {
    return JSON.parse(localStorage.getItem('recent-activity') || '[]');
  }

  public set history(items: { id: string; type: 'DataView' | 'Report' | 'DataSource'; item: any }[]) {
    localStorage.setItem('recent-activity', JSON.stringify(items));
  }

  public clearHistory() {
    localStorage.removeItem('recent-activity');
  }
}
