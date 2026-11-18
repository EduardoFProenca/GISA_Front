import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectMenu } from './select-menu';

@Component({
  imports: [FormsModule, SelectMenu],
  template: `
    <app-select-menu id="parentesco" name="parentesco" [(ngModel)]="value" [disabled]="disabled">
      <option value="" disabled selected>Selecione</option>
      <option value="PAI">Pai</option>
      <option value="MAE">Mãe</option>
    </app-select-menu>
  `,
})
class SelectMenuHost {
  value = '';
  disabled = false;
}

describe('SelectMenu', () => {
  let fixture: ComponentFixture<SelectMenuHost>;
  let host: SelectMenuHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SelectMenuHost] }).compileComponents();
    fixture = TestBed.createComponent(SelectMenuHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('exibe as opções projetadas e propaga a opção escolhida ao ngModel', () => {
    const trigger = fixture.nativeElement.querySelector<HTMLButtonElement>('[role="combobox"]');
    trigger.click();
    fixture.detectChanges();

    const opcoes = fixture.nativeElement.querySelectorAll<HTMLElement>('[role="option"]');
    expect(opcoes.length).toBe(3);
    opcoes[1].click();
    fixture.detectChanges();

    expect(host.value).toBe('PAI');
    expect(trigger.textContent).toContain('Pai');
  });

  it('não abre quando desabilitado', () => {
    host.disabled = true;
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector<HTMLButtonElement>('[role="combobox"]');
    trigger.click();
    fixture.detectChanges();

    expect(trigger.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('[role="listbox"]')).toBeNull();
  });

  it('permite navegar pelas opções com o teclado', () => {
    const trigger = fixture.nativeElement.querySelector<HTMLButtonElement>('[role="combobox"]');
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(host.value).toBe('PAI');
    expect(trigger.textContent).toContain('Pai');
  });
});
