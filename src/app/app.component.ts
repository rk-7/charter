import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import {MediaMatcher} from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { appCopyright, appName } from './constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  public get title(): string {
    return appName;
  }
  public get appCopyright(): string {
    return appCopyright;
  }
  mobileQuery: MediaQueryList;
  navItems: {name: string, url: string }[];
  private mobileQueryListener: () => void;

  constructor(
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,
    private readonly router: Router
    ) {
    this.populateRoutes();
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this.mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this.mobileQueryListener);
  }
  populateRoutes(): void {
    this.navItems = new Array<{name: string, url: string }>();
    this.navItems.push({name: 'Scatter Plot', url: '/scatter-plot'});
  }
  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this.mobileQueryListener);
  }
}
