import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="bg-gray-100 border-t border-gray-200 text-center py-4 text-sm text-gray-500 absolute bottom-0 w-full ml-64" style="width: calc(100% - 16rem);">
      <p>&copy; 2026 Ferretería Kaños. Todos los derechos reservados.</p>
    </footer>
  `
})
export class FooterComponent {}
