# GISA — Requisitos do Sistema

Sistema clínico da APAE Sorocaba: cadastro e acompanhamento de pacientes, equipe e agenda de terapias.
O sistema é formado por uma API REST (`API-GISA`) e uma interface web (`GISA_Front`).

## Controle de acesso

Todos os requisitos a seguir dependem de **perfis e permissões**, que liberam cada caso de uso aos usuários cadastrados.

- **Permissão** é uma funcionalidade do sistema (ex.: `CADASTRAR_PACIENTE`). As permissões são fixas do sistema; o usuário só as combina em perfis.
- **Perfil** é um conjunto de permissões, com nome livre. Cada usuário tem exatamente um perfil.
- O **nome do perfil não interfere** no sistema: o que libera cada tela, botão, item de menu e componente da página inicial são as permissões do perfil. Assim, o administrador pode montar perfis sob medida. Exemplos:
  - **"Recepção – Estagiário":** as permissões da Recepção, menos agendar e editar terapias.
  - **"Médico":** permissão para emitir atestado e receita, que o perfil "Especialista" não tem.
- A permissão `ACESSO_TOTAL` libera tudo, **exceto emitir atestado e receita**: esses documentos são assinados por quem emite, então exigem a permissão própria (`EMITIR_ATESTADO` / `EMITIR_RECEITA`) marcada no perfil. O administrador, por ter acesso total, não ganha essa possibilidade.
- A API confere a permissão em toda requisição. O front esconde o que o usuário não pode usar, mas quem garante o acesso é a API.
- Mudanças no perfil ou nas permissões valem a partir da próxima ação do usuário, sem novo login.
- Algumas telas dependem também do **tipo de cadastro** do usuário, porque usam dados que só esse tipo tem: a agenda e as terapias do dia exigem cadastro de especialista; a lista de pacientes vinculados exige cadastro de assistente social.

Perfis que já vêm prontos (ponto de partida; podem ser alterados como qualquer outro):

| Perfil | Permissões |
|---|---|
| Administrador | `ACESSO_TOTAL` |
| Recepção | `VISUALIZAR_PACIENTES`, `EDITAR_PACIENTE`, `VISUALIZAR_HISTORICO_PACIENTE`, `VISUALIZAR_TERAPIAS`, `AGENDAR_TERAPIA`, `EDITAR_TERAPIA`, `ALTERAR_STATUS_TERAPIA`, `REGISTRAR_PRESENCA`, `EMITIR_RECUSA` |
| Especialista | `VISUALIZAR_PACIENTES`, `VISUALIZAR_HISTORICO_PACIENTE`, `EMITIR_ATESTADO`, `EMITIR_RECEITA` |
| Assistente Social | `VISUALIZAR_PACIENTES_VINCULADOS`, `VISUALIZAR_HISTORICO_PACIENTE` |

---

## Requisitos funcionais

### Resumo

| Código | Requisito | Permissões |
|---|---|---|
| RF01 | Autenticar usuário | pública |
| RF02 | Alterar a própria senha | usuário logado |
| RF03 | Gerenciar perfis e permissões | `GERENCIAR_PERFIS` |
| RF04 | Gerenciar usuários do sistema | `GERENCIAR_USUARIOS` |
| RF05 | Visualizar auditoria | `VISUALIZAR_AUDITORIA` |
| RF06 | Gerenciar cargos | `GERENCIAR_CARGOS` |
| RF07 | Gerenciar CBOs | `GERENCIAR_CARGOS` |
| RF08 | Gerenciar especialidades | `GERENCIAR_ESPECIALIDADES` |
| RF09 | Gerenciar escolas | `GERENCIAR_ESCOLAS` |
| RF10 | Gerenciar profissionais | `VISUALIZAR_PROFISSIONAIS`, `CADASTRAR_PROFISSIONAL`, `CADASTRAR_ESPECIALISTA`, `CADASTRAR_ESPECIALISTA_PJ`, `EDITAR_PROFISSIONAL`, `INATIVAR_PROFISSIONAL` |
| RF11 | Gerenciar pacientes | `VISUALIZAR_PACIENTES` ou `VISUALIZAR_PACIENTES_VINCULADOS`, `CADASTRAR_PACIENTE`, `EDITAR_PACIENTE`, `INATIVAR_PACIENTE` |
| RF12 | Visualizar histórico do paciente | `VISUALIZAR_HISTORICO_PACIENTE` |
| RF13 | Gerenciar terapias | `VISUALIZAR_TERAPIAS`, `AGENDAR_TERAPIA`, `EDITAR_TERAPIA`, `ALTERAR_STATUS_TERAPIA` |
| RF14 | Registrar presença do paciente na terapia | `VISUALIZAR_TERAPIAS`, `REGISTRAR_PRESENCA` |
| RF15 | Visualizar agenda do especialista | cadastro de especialista |
| RF16 | Consultar prontuário do paciente | `VISUALIZAR_PACIENTES` |
| RF17 | Emitir atestado | `EMITIR_ATESTADO` + cadastro de especialista |
| RF18 | Emitir receita | `EMITIR_RECEITA` + cadastro de especialista |
| RF19 | Emitir declaração de recusa | `EMITIR_RECUSA` |
| RF20 | Visualizar página inicial | usuário logado (conteúdo conforme as permissões) |

### RF01 – Autenticar usuário

Permite ao usuário entrar no sistema com e-mail e senha. No primeiro acesso, ele entra com a senha temporária recebida por e-mail e precisa cadastrar uma senha definitiva antes de continuar. Se esquecer a senha, pode pedir um link de redefinição por e-mail. Depois do login, o sistema mostra só o menu, as telas e os componentes da página inicial que as permissões do perfil liberam.

- A senha temporária vale 7 dias. O link de redefinição vale 60 minutos e só pode ser usado uma vez.
- O pedido de redefinição nunca informa se o e-mail existe.
- Cadastros inativos não conseguem entrar.
- A senha tem de 8 a 30 caracteres. A sessão dura 24 horas.

### RF02 – Alterar a própria senha

Permite ao usuário logado trocar a própria senha, informando a senha atual e a nova senha com confirmação. Toda troca encerra as outras sessões abertas desse usuário.

### RF03 – Gerenciar perfis e permissões

Permite ao usuário cadastrar quantos perfis de acesso quiser, com nome livre, além de renomear e excluir perfis e adicionar ou remover as permissões de cada um. As permissões aparecem agrupadas por categoria (Segurança, Profissionais, Pacientes, Terapias, Documentos e Tabelas de apoio). A tela do perfil mostra as permissões que ele tem e os usuários que o usam.

- As permissões são fixas do sistema: o usuário só as combina nos perfis.
- O nome do perfil é único.
- Um perfil só pode ser excluído se não tiver usuários.
- O sistema impede qualquer alteração que o deixe sem ao menos um usuário ativo capaz de gerenciar perfis (`GERENCIAR_PERFIS` ou `ACESSO_TOTAL`).

### RF04 – Gerenciar usuários do sistema

Permite ao usuário listar quem tem acesso ao sistema, filtrando por nome, CPF, perfil, tipo de cadastro e status. Também permite:

- trocar o perfil de um usuário;
- gerar uma nova senha temporária, enviada por e-mail (também serve para reenviar o acesso);
- retirar o acesso, o que apaga só o login: o cadastro da pessoa continua como está e o acesso pode ser concedido de novo.

Regras:

- Ninguém pode retirar o próprio acesso.
- O sistema não deixa ficar sem um usuário ativo com acesso total, nem sem alguém que gerencie perfis.

### RF05 – Visualizar auditoria

Permite ao usuário consultar a trilha de auditoria, filtrando por CPF, tipo de ação e período. O sistema registra automaticamente data e hora, usuário, rota, resultado e IP de:

- inclusões, alterações e exclusões/inativações;
- tentativas de login que falharam, com o e-mail digitado;
- consultas aos detalhes de um paciente.

O conteúdo das requisições nunca é gravado (LGPD).

### RF06 – Gerenciar cargos

Permite ao usuário cadastrar, editar, consultar e excluir cargos (funções internas), cada um ligado a um CBO. Os detalhes do cargo mostram os profissionais que o ocupam.

- O nome do cargo é único.
- Um cargo só pode ser excluído se não tiver profissionais.

### RF07 – Gerenciar CBOs

Permite ao usuário cadastrar, editar o título, consultar e excluir CBOs (Classificação Brasileira de Ocupações). Ao cadastrar, o sistema sugere as ocupações da tabela oficial CBO 2002 e completa o título.

- O código tem 6 dígitos, é único e não pode ser alterado.
- Um CBO só pode ser excluído se nenhum cargo o usar.

### RF08 – Gerenciar especialidades

Permite ao usuário cadastrar, editar, consultar e excluir as especialidades de atendimento (Psicologia, Fonoaudiologia etc.). Os detalhes mostram os especialistas vinculados a cada uma.

- O nome é único, sem diferenciar maiúsculas e minúsculas.
- Uma especialidade só pode ser excluída se não tiver especialistas vinculados.
- Também é possível criar especialidades durante o cadastro de um especialista.

### RF09 – Gerenciar escolas

Permite ao usuário cadastrar, editar, consultar e excluir as escolas que os pacientes frequentam, informando nome, tipo (pública ou particular) e telefone. Os detalhes da escola listam os pacientes dela.

- Uma escola só pode ser excluída se não tiver pacientes.
- O formulário do paciente permite buscar a escola pelo nome e cadastrá-la ali mesmo, se ela ainda não existir.

### RF10 – Gerenciar profissionais

Permite ao usuário cadastrar profissionais com dados pessoais, endereço, e-mail e cargo. O cadastro tem um de quatro tipos:

- **Profissional:** cadastro básico.
- **Especialista:** acrescenta o registro no conselho (ex.: CRP, CRM), ao menos uma especialidade e ao menos uma jornada de trabalho (dia da semana e horário).
- **Especialista PJ:** os dados do especialista mais CNPJ, razão social, nome fantasia e inscrição estadual.
- **Assistente Social:** acrescenta o registro no CRESS e os pacientes pelos quais é responsável. Os vínculos podem ser incluídos e encerrados a qualquer momento, também pela tela do paciente.

O usuário pode conceder acesso ao sistema já no cadastro ou depois, escolhendo um perfil. O sistema então gera uma senha temporária e a envia ao e-mail do profissional. Também é possível listar os profissionais (com filtros por nome, CPF, tipo e status), consultar, editar, inativar, reativar e ver o histórico de terapias de um especialista.

- CPF válido e único. E-mail único, que é o login do profissional. CNPJ com 14 dígitos e único.
- CPF, data de nascimento, sexo, registro no conselho e CNPJ não podem ser editados.
- Conceder acesso no cadastro ou trocar o perfil exige também `GERENCIAR_USUARIOS`.
- A jornada não pode ser alterada se deixar terapias futuras fora do novo horário.
- Inativar um assistente social encerra os vínculos dele com pacientes.
- Inativar não apaga o cadastro, e o profissional inativo não consegue entrar no sistema.

### RF11 – Gerenciar pacientes

Permite ao usuário cadastrar pacientes com:

- dados pessoais e ao menos um endereço (preenchido pelo CEP);
- escola, convênio e CNS;
- prontuário (alergias, comorbidades e mobilidade);
- CIDs, conferidos na tabela oficial CID-10;
- ao menos um responsável, com o grau de parentesco.

Os dados podem ser alterados, menos CPF, data de nascimento e sexo. Também é possível incluir responsáveis em um paciente já cadastrado e editar os dados de um responsável. Os pacientes só são encontrados por busca, pelo CPF completo ou por ao menos 3 letras do nome: não existe listagem completa (LGPD).

O usuário pode inativar o cadastro do paciente, e os dados são mantidos. Ao inativar:

- as terapias individuais futuras são canceladas;
- o paciente é retirado das terapias coletivas futuras;
- o sistema mostra um resumo do que foi feito;
- o paciente pode ser reativado depois.

Regras:

- O CPF precisa ser válido e único.
- Um responsável já cadastrado é reaproveitado pelo CPF.
- O status do paciente pode ser Matriculado, Alta ou Desligado.
- Quem tem só `VISUALIZAR_PACIENTES_VINCULADOS` encontra e vê apenas os pacientes vinculados a ele.

### RF12 – Visualizar histórico do paciente

Permite ao usuário ver a linha do tempo de um paciente, com os eventos mais recentes primeiro, quem fez cada ação e quando: cadastro, alterações, mudanças de status, responsáveis vinculados ou desvinculados, terapias agendadas, alteradas ou canceladas e presenças registradas. O histórico aparece em dois lugares:

- **Detalhe do paciente** (Pacientes → busca por nome ou CPF → detalhes): linha do tempo completa, paginada.
- **Prontuário** (RF16), na aba Histórico: os eventos recentes, com opção de mostrar só os de terapias e presenças ou só os de cadastro.

O histórico nunca mostra dados de saúde nem textos livres, como justificativas.

### RF13 – Gerenciar terapias

Permite ao usuário agendar terapias com um ou mais pacientes e um ou mais especialistas, em uma data e horário. A modalidade (individual ou coletiva) é definida pelo número de pacientes. Enquanto o formulário é preenchido, o sistema avisa sobre conflitos de horário.

O usuário também pode:

- editar uma terapia agendada (remarcar ou trocar participantes);
- mudar o status: Agendada → Em atendimento → Concluída, ou cancelar informando o motivo;
- listar as terapias com filtros por status, período, paciente e especialista, com contadores por status.

Regras:

- Só é possível agendar em horário futuro.
- Paciente e especialista não podem ter duas terapias no mesmo horário.
- A terapia precisa caber inteira em uma jornada de trabalho de cada especialista.
- Só participantes ativos podem ser agendados.
- Terapia cancelada libera o horário.

### RF14 – Registrar presença do paciente na terapia

Permite ao usuário ver as terapias de um dia e marcar, para cada paciente, comparecimento, falta justificada (com justificativa) ou falta. Também é possível desfazer uma marcação.

- Presença e falta só podem ser marcadas a partir do dia da terapia e até o fim do dia seguinte.
- A falta justificada pode ser marcada antes do dia (aviso antecipado) ou depois do prazo (ex.: atestado entregue depois).
- A falta justificada libera o horário do paciente. Quando todos os pacientes justificam, o horário do especialista também fica livre.
- Terapias canceladas não aceitam marcação.

### RF15 – Visualizar agenda do especialista

Permite ao usuário logado que tem cadastro de especialista (comum ou PJ) ver a própria agenda no mês e na semana e as suas terapias do dia, com os pacientes, os horários e os outros especialistas de cada sessão. Mostra só as terapias de que ele participa. Aqui o que decide é o tipo de cadastro, e não uma permissão: só especialistas têm agenda.

### RF16 – Consultar prontuário do paciente

Permite ao usuário abrir o prontuário de um paciente, com:

- a identificação do paciente e os alertas clínicos (alergias, comorbidades e mobilidade);
- os CIDs e o histórico do paciente;
- as terapias do paciente (para o especialista, só as que ele atende);
- a frequência do mês (geral e por especialidade), com destaque quando fica abaixo de 75%.

A partir dessa tela também é possível emitir atestado e receita (RF17 e RF18).

### RF17 – Emitir atestado

Permite ao usuário com a permissão de emitir atestado gerar o atestado de um paciente, independentemente do nome do perfil. O `ACESSO_TOTAL` não libera esta funcionalidade: a permissão precisa estar marcada no perfil. O texto é livre ou parte de um modelo (comparecimento, afastamento, acompanhamento do responsável ou aptidão física). Como a assinatura usa o registro no conselho, a especialidade e o CBO de quem emite, o usuário precisa ter cadastro de especialista. O documento é impresso ou salvo em PDF pelo navegador e não fica guardado no sistema.

### RF18 – Emitir receita

Permite ao usuário com a permissão de emitir receita gerar a receita de um paciente, em texto livre, com os dados do paciente e a assinatura de quem emite (mesmas exigências do RF17: cadastro de especialista e permissão marcada no perfil, sem valer o `ACESSO_TOTAL`). O documento é impresso ou salvo em PDF pelo navegador e não fica guardado no sistema.

### RF19 – Emitir declaração de recusa

Permite ao usuário emitir a declaração em que a instituição informa que não pode atender uma pessoa, com nome, CPF, data de nascimento e motivo. Os dados podem ser preenchidos a partir de um paciente cadastrado. Se for um paciente ativo e o usuário puder inativar pacientes, depois da impressão o sistema oferece a inativação do cadastro (RF11). O documento não fica guardado no sistema.

### RF20 – Visualizar página inicial

Permite ao usuário ver uma página inicial montada a partir das permissões do perfil dele. Cada componente aparece só para quem pode usá-lo:

| Componente | Quando aparece |
|---|---|
| Gestão Rápida | sempre; um atalho para cada tela liberada |
| Terapias de hoje e presenças do dia | `VISUALIZAR_TERAPIAS` |
| Totais de profissionais | `VISUALIZAR_PROFISSIONAIS` |
| Meus atendimentos do dia e próximo paciente | cadastro de especialista |
| Meus pacientes vinculados | cadastro de assistente social |

Se o perfil não liberar nenhuma tela, a página avisa o usuário para procurar o administrador.

---

## Requisitos não funcionais

| Código | Requisito |
|---|---|
| RNF01 | **Segurança:** autenticação por token JWT (24 h); senhas guardadas só como hash; toda troca de senha encerra as sessões abertas. |
| RNF02 | **Autorização:** toda rota da API exige permissão (exceto login, redefinição de senha e dados do próprio usuário); a interface esconde o que o usuário não pode usar. |
| RNF03 | **Privacidade (LGPD):** pacientes sem listagem completa; CPF mascarado nas buscas; histórico do paciente sem dados de saúde; auditoria sem o conteúdo das requisições. |
| RNF04 | **Integridade dos dados:** exclusão lógica (inativação) de pessoas; tabelas de apoio só são excluídas sem vínculos; validação de CPF (dígitos verificadores) e unicidade de CPF, e-mail e CNPJ. |
| RNF05 | **Concorrência:** agendamentos e edições simultâneos para o mesmo horário não geram agendamento duplo. |
| RNF06 | **Fuso horário:** datas e horários de agenda e presença seguem o horário de Brasília (America/Sao_Paulo). |
| RNF07 | **E-mail:** senhas temporárias e links de redefinição enviados por e-mail (Brevo ou SMTP). |
| RNF08 | **Tabelas oficiais:** CID-10 (DATASUS) e CBO 2002 consultadas pelo front; endereço preenchido pelo CEP (ViaCEP). |
| RNF09 | **Usabilidade:** interface responsiva (computador e celular), mensagens de erro junto aos campos e listagens paginadas. |
| RNF10 | **Tecnologia:** API em Java 21 / Spring Boot com PostgreSQL; interface em Angular. |
