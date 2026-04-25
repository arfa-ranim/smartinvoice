import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, MatIconModule, TranslateModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})

 
export class Footer {
  currentYear = new Date().getFullYear();
}