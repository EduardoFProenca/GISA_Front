import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { InfoAssistenteSocial } from './info-assistente-social';

describe('InfoAssistenteSocial', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InfoAssistenteSocial],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('limpa o campo de busca depois de adicionar um paciente', async () => {
    const fixture = TestBed.createComponent(InfoAssistenteSocial);
    const component = fixture.componentInstance;
    component.ehAssistenteSocial = true;
    component.edicao = false;
    fixture.detectChanges();

    component.adicionarPaciente({
      id: 7,
      label: 'Paciente Teste · CPF ***.000.000-**',
      rotuloSelecionado: 'Paciente Teste',
    });
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.selecao()).toBeNull();
    expect(component.pacientes.length).toBe(1);
    expect(component.pacientes[0].idCadastro).toBe(7);
    const input = (fixture.nativeElement as HTMLElement).querySelector('app-select-busca input') as HTMLInputElement;
    expect(input.value).toBe('');
  });
});
