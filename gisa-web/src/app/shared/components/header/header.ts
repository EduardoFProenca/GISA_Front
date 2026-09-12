import { Component, inject, Input } from '@angular/core';
import { Auth } from '../../../core/auth/auth';
import { ICONES } from '../../icons';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  auth = inject(Auth);
  icones = ICONES;

  @Input() tituloPortal: string = '';
  @Input() subtituloPortal: string = '';
}