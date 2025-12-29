import { Component } from '@angular/core';
import { LibroListComponent as LibroListComponent } from "./components/libro-list/libro-list";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LibroListComponent, LibroListComponent],
  template: `<app-libro-list></app-libro-list>`
})
export class AppComponent {}
