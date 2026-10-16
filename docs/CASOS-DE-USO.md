# GISA — Casos de Uso

Um quadro por requisito funcional de [REQUISITOS.md](REQUISITOS.md): o caso de uso **CSnn** detalha o requisito **RFnn**.

Como os perfis são livres, o **ator** é quem tem a permissão do caso de uso. Entre parênteses vem o perfil padrão que já a possui (ex.: "Recepção"). Um perfil criado pelo administrador com a mesma permissão também atua no caso de uso.

O diagrama de casos de uso ([diagramas/casos-de-uso.drawio](diagramas/casos-de-uso.drawio) e [.png](diagramas/casos-de-uso.png)) usa os mesmos nomes e atores destes quadros:

- cada elipse azul **CSnn** é um quadro;
- **CS21 – Verificar Conflito de Horário** é o `«include»` do CS13 e tem quadro próprio;
- as elipses cinza (**Recuperar Senha**, **Cadastrar Senha no Primeiro Acesso** e **Inativar Paciente**) são `«extend»` e estão descritas como fluxo alternativo dentro do quadro do caso que estendem (CS01 e CS19);
- o **Administrativo** herda os casos da **Recepcionista**, e todos os atores herdam de **Usuário**.

---

**Quadro 1** - CS01 - Autenticar Usuário

| Campo | Descrição |
|---|---|
| **Caso de Uso** | Autenticar usuário |
| **Tarefa / Fase** | Acessar e sair do sistema (login, primeiro acesso, recuperar senha e logout) |
| **Ator Principal** | Usuário (qualquer usuário com acesso ao sistema) |
| **Ator Secundário** | Serviço de E-mail |
| **Pré-Condição** | Usuário com acesso concedido e cadastro ativo. |
| **Pós-Condição** | Usuário autenticado, no Início, vendo só o que as permissões do perfil liberam. |
| **Ações do Ator** | **Ações do Sistema** |
| 1. Acessa o sistema. | |
| | 2. Exibe a tela de login. |
| 3. Informa e-mail e senha e confirma. | |
| | 4. Valida as credenciais, carrega o perfil e as permissões do usuário e exibe o Início. |
| **Fluxo Alternativo A – Cadastrar Senha no Primeiro Acesso («extend»)** | |
| 3a. Informa o e-mail e a senha temporária recebida por e-mail. | |
| | 4a. Identifica a senha temporária e exibe a tela "Cadastrar nova senha". |
| 5a. Informa e confirma a nova senha. | |
| | 6a. Grava a senha definitiva, encerra outras sessões e exibe o Início. |
| **Fluxo Alternativo B – Recuperar Senha («extend»)** | |
| 1b. Clica em "Esqueci minha senha" e informa o e-mail. | |
| | 2b. Envia um link de redefinição (válido por 60 minutos), se o e-mail for de um usuário ativo, e informa que o envio foi feito, sem revelar se o e-mail existe. |
| 3b. Abre o link e informa a nova senha. | |
| | 4b. Grava a nova senha e exibe o Início. |
| **Fluxo Alternativo C – Sair (logout)** | |
| 1c. Clica em "Sair". | |
| | 2c. Encerra a sessão e volta para a tela de login. |
| **Exceções** | E-mail ou senha incorretos, ou cadastro inativo: exibe "Credenciais inválidas". Senha temporária vencida (7 dias): orienta usar "Esqueci minha senha". Link vencido ou já usado: oferece pedir outro. |

---

**Quadro 2** - CS02 - Alterar a Própria Senha

| Campo | Descrição |
|---|---|
| **Caso de Uso** | Alterar a própria senha |
| **Tarefa / Fase** | Manter a conta do usuário |
| **Ator Principal** | Usuário (qualquer usuário autenticado) |
| **Ator Secundário** | — |
| **Pré-Condição** | Usuário autenticado. |
| **Pós-Condição** | Senha alterada; as outras sessões do usuário são encerradas. |
| **Ações do Ator** | **Ações do Sistema** |
| 1. Acessa "Alterar minha senha" (menu ou cabeçalho). | |
| | 2. Exibe o formulário de troca de senha. |
| 3. Informa a senha atual, a nova senha e a confirmação e confirma. | |
| | 4. Valida a senha atual e a nova (8 a 30 caracteres, diferente da atual), grava a senha e mantém o usuário conectado. |
| **Exceções** | Senha atual incorreta, confirmação diferente ou nova senha igual à atual: exibe a mensagem junto ao campo. |

---

**Quadro 3** - CS03 - Gerenciar Perfis e Permissões

| Campo | Descrição |
|---|---|
| **Caso de Uso** | Gerenciar perfis e permissões |
| **Tarefa / Fase** | Configurar o controle de acesso |
| **Ator Principal** | Administrativo (permissão `GERENCIAR_PERFIS`) |
| **Ator Secundário** | — |
| **Pré-Condição** | Usuário autenticado com a permissão. |
| **Pós-Condição** | Perfil criado, alterado ou excluído; a mudança vale para os usuários do perfil a partir da próxima ação deles. |
| **Ações do Ator** | **Ações do Sistema** |
| 1. Acessa "Perfis de Acesso". | |
| | 2. Exibe a lista de perfis. |
| 3. Clica em "Novo perfil", informa o nome e escolhe as permissões, agrupadas por categoria. | |
| | 4. Valida o nome (único) e cadastra o perfil. |
| 5. Abre um perfil. | |
| | 6. Exibe as permissões e os usuários do perfil. |
| 7. Renomeia o perfil, adiciona permissões ("Adicionar permissões") ou remove uma permissão. | |
| | 8. Grava a alteração e atualiza a tela. |
| **Fluxo Alternativo A – Excluir perfil** | |
| 7a. Clica em "Excluir" e confirma. | |
| | 8a. Exclui o perfil, se nenhum usuário o usar. |
| **Exceções** | Nome já existente: recusa. Perfil com usuários: não exclui. Alteração que deixaria o sistema sem nenhum usuário ativo capaz de gerenciar perfis: bloqueia e explica o motivo. |

---

**Quadro 4** - CS04 - Gerenciar Usuários do Sistema

| Campo | Descrição |
|---|---|
| **Caso de Uso** | Gerenciar usuários do sistema |
| **Tarefa / Fase** | Administrar os acessos |
| **Ator Principal** | Administrativo (permissão `GERENCIAR_USUARIOS`) |
| **Ator Secundário** | Serviço de E-mail |
| **Pré-Condição** | Usuário autenticado com a permissão. |
| **Pós-Condição** | Perfil trocado, nova senha temporária enviada ou acesso retirado. |
| **Ações do Ator** | **Ações do Sistema** |
| 1. Acessa "Usuários do Sistema". | |
| | 2. Exibe a lista de usuários com acesso, com filtros por nome, CPF, perfil, tipo e status. |
| 3. Abre um usuário. | |
| | 4. Exibe o e-mail de login, o perfil e as permissões do perfil. |
| 5. Clica em "Trocar perfil" e escolhe o novo perfil. | |
| | 6. Grava o novo perfil, que vale a partir da próxima ação do usuário. |
| **Fluxo Alternativo A – Nova senha temporária** | |
| 5a. Clica em "Enviar nova senha temporária". | |
| | 6a. Gera a senha, envia por e-mail e invalida a senha anterior e as sessões abertas. |
| **Fluxo Alternativo B – Retirar acesso** | |
| 5b. Clica em "Retirar acesso" e confirma. | |
| | 6b. Apaga só o login do usuário; o cadastro da pessoa continua. |
| **Exceções** | Retirar o próprio acesso: recusa. Deixar o sistema sem usuário ativo com acesso total ou sem quem gerencie perfis: bloqueia. Falha no envio do e-mail: avisa e não altera nada. |

---

**Quadro 5** - CS05 - Visualizar Auditoria

| Campo | Descrição |
|---|---|
| **Caso de Uso** | Visualizar auditoria |
| **Tarefa / Fase** | Rastrear ações no sistema (segurança e LGPD) |
| **Ator Principal** | Administrativo (permissão `VISUALIZAR_AUDITORIA`) |
| **Ator Secundário** | — |
| **Pré-Condição** | Usuário autenticado com a permissão. |
| **Pós-Condição** | Registros consultados (a consulta não gera registro). |
| **Ações do Ator** | **Ações do Sistema** |
| 1. Acessa "Auditoria". | |
| | 2. Exibe os registros mais recentes: data e hora, usuário, ação, rota, resultado e IP. |
| 3. Filtra por CPF do usuário, tipo de ação (login com falha, criação, alteração, exclusão, consulta) e período. | |
| | 4. Exibe os registros que atendem aos filtros, paginados. |

---

**Quadro 6** - CS06 - Gerenciar Cargos

| Campo | Descrição |
|---|---|
| **Caso de Uso** | Gerenciar cargos |
| **Tarefa / Fase** | Manter as tabelas de apoio |
| **Ator Principal** | Administrativo (permissão `GERENCIAR_CARGOS`) |
| **Ator Secundário** | — |
| **Pré-Condição** | Usuário autenticado com a permissão; CBO do cargo já cadastrado. |
| **Pós-Condição** | Cargo cadastrado, alterado ou excluído. |
| **Ações do Ator** | **Ações do Sistema** |
| 1. Acessa "Cargos". | |
| | 2. Exibe a lista de cargos, com busca por nome. |
| 3. Clica em "Novo cargo", informa o nome e escolhe o CBO. | |
| | 4. Valida o nome (único) e o CBO e cadastra o cargo. |
| 5. Abre um cargo. | |
| | 6. Exibe o CBO e os profissionais que ocupam o cargo. |
| 7. Edita o nome ou o CBO, ou exclui o cargo. | |
| | 8. Grava a alteração (vale para todos os profissionais do cargo) ou exclui o cargo. |
| **Exceções** | Nome repetido: recusa. Cargo com profissionais: não exclui. |

---

**Quadro 7** - CS07 - Gerenciar CBOs

| Campo | Descrição |
|---|---|
| **Caso de Uso** | Gerenciar CBOs |
| **Tarefa / Fase** | Manter as tabelas de apoio |
| **Ator Principal** | Administrativo (permissão `GERENCIAR_CARGOS`) |
| **Ator Secundário** | — |
| **Pré-Condição** | Usuário autenticado com a permissão. |
| **Pós-Condição** | CBO cadastrado, alterado ou excluído. |
| **Ações do Ator** | **Ações do Sistema** |
| 1. Acessa "CBOs". | |
| | 2. Exibe a lista de CBOs, com busca por código ou título. |
| 3. Clica em "Novo CBO" e digita o código ou parte do título. | |
| | 4. Sugere as ocupações da tabela oficial e completa o título. |
| 5. Confirma. | |
| | 6. Valida o código (6 dígitos, único) e cadastra o CBO. |
| 7. Abre um CBO e edita o título ou o exclui. | |
| | 8. Grava a alteração ou exclui o CBO. |
| **Exceções** | Código repetido: recusa. CBO usado por algum cargo: não exclui. O código não pode ser alterado. |

---

**Quadro 8** - CS08 - Gerenciar Especialidades

| Campo | Descrição |
|---|---|
| **Caso de Uso** | Gerenciar especialidades |
| **Tarefa / Fase** | Manter as tabelas de apoio |
| **Ator Principal** | Administrativo (permissão `GERENCIAR_ESPECIALIDADES`) |
| **Ator Secundário** | — |
| **Pré-Condição** | Usuário autenticado com a permissão. |
| **Pós-Condição** | Especialidade cadastrada, alterada ou excluída. |
| **Ações do Ator** | **Ações do Sistema** |
| 1. Acessa "Especialidades". | |
| | 2. Exibe a lista de especialidades, com a quantidade de especialistas de cada uma. |
| 3. Clica em "Nova especialidade" e informa nome e descrição. | |
| | 4. Valida o nome (único) e cadastra a especialidade. |
| 5. Abre uma especialidade e edita ou exclui. | |
| | 6. Exibe os especialistas vinculados e grava a alteração ou exclui. |
| **Exceções** | Nome repetido (sem diferenciar maiúsculas): recusa. Especialidade com especialistas: não exclui. |

---

**Quadro 9** - CS09 - Gerenciar Escolas

| Campo | Descrição |
|---|---|
| **Caso de Uso** | Gerenciar escolas |
| **Tarefa / Fase** | Manter as tabelas de apoio |
| **Ator Principal** | Administrativo (permissão `GERENCIAR_ESCOLAS`) |
| **Ator Secundário** | — |
| **Pré-Condição** | Usuário autenticado com a permissão. |
| **Pós-Condição** | Escola cadastrada, alterada ou excluída. |
| **Ações do Ator** | **Ações do Sistema** |
| 1. Acessa "Escolas". | |
| | 2. Exibe a lista de escolas, com filtro por nome e tipo. |
| 3. Clica em "Nova escola" e informa nome, tipo (pública ou particular) e telefone. | |
| | 4. Cadastra a escola. |
| 5. Abre uma escola e edita ou exclui. | |
| | 6. Exibe os pacientes da escola e grava a alteração ou exclui. |
| **Fluxo Alternativo A – Cadastro rápido no formulário do paciente (dentro do CS11)** | |
| 3a. No cadastro ou edição do paciente, busca a escola pelo nome e não a encontra. | |
| | 4a. Oferece cadastrar a escola ali mesmo e já a seleciona para o paciente. |
| **Exceções** | Escola com pacientes (inclusive inativos): não exclui. |

---

**Quadro 10** - CS10 - Gerenciar Profissionais

| Campo | Descrição |
|---|---|
| **Caso de Uso** | Gerenciar profissionais |
| **Tarefa / Fase** | Montar a equipe (corpo clínico e administrativo) |
| **Ator Principal** | Administrativo (permissões `CADASTRAR_PROFISSIONAL`, `CADASTRAR_ESPECIALISTA`, `CADASTRAR_ESPECIALISTA_PJ`, `EDITAR_PROFISSIONAL` e `INATIVAR_PROFISSIONAL`) |
| **Ator Secundário** | Serviço de E-mail |
| **Pré-Condição** | Usuário autenticado com a permissão; cargo cadastrado. |
| **Pós-Condição** | Profissional cadastrado e, se for o caso, com acesso ao sistema. |
| **Ações do Ator** | **Ações do Sistema** |
| 1. Acessa "Cadastrar Profissional". | |
| | 2. Exibe o formulário: dados pessoais, cargo, acesso ao sistema, especialista, assistente social e contato/endereço. |
| 3. Preenche dados pessoais, e-mail e cargo. | |
| 4. Opcionalmente, marca "Especialista" e informa registro no conselho, especialidades e jornadas; se atuar como PJ, marca a opção e informa CNPJ e razão social. | |
| 5. Ou, opcionalmente, marca "Assistente Social" e informa o CRESS e os pacientes vinculados. | |
| 6. Opcionalmente, escolhe um perfil de acesso e salva. | |
| | 7. Valida CPF, e-mail e CNPJ, cadastra o profissional e, se houver perfil, cria o acesso e envia a senha temporária por e-mail. |
| **Fluxo Alternativo A – Consultar e editar** | |
| 1a. Acessa "Profissionais" e busca por nome ou CPF, com filtros por tipo e status. | |
| | 2a. Exibe os profissionais. |
| 3a. Abre um profissional e clica em "Editar". | |
| | 4a. Exibe o formulário com os dados atuais (CPF, data de nascimento, sexo, registro e CNPJ bloqueados) e grava as alterações. |
| **Fluxo Alternativo B – Conceder acesso depois** | |
| 3b. No detalhe de um profissional sem acesso, clica em "Conceder acesso" e escolhe o perfil. | |
| | 4b. Cria o acesso e envia a senha temporária por e-mail. |
| **Fluxo Alternativo C – Inativar ou reativar** | |
| 3c. No detalhe, clica em "Inativar" (ou "Reativar") e confirma. | |
| | 4c. Muda o status. O profissional inativo não entra no sistema; para o assistente social, os vínculos com pacientes são encerrados. |
| **Fluxo Alternativo D – Histórico do especialista** | |
| 3d. Na lista de profissionais, clica no ícone de histórico do especialista (exige `VISUALIZAR_TERAPIAS`). | |
| | 4d. Exibe as terapias do especialista, com filtro por status e período. |
| **Exceções** | CPF inválido ou repetido, e-mail ou CNPJ repetido: recusa com a mensagem no campo. Jornada nova que deixaria terapias futuras fora do horário: recusa e lista as terapias. Inativar o último usuário que gerencia perfis: bloqueia. Falha no envio do e-mail: o cadastro é feito e o sistema oferece o reenvio. |

---

**Quadro 11** - CS11 - Gerenciar Pacientes

| Campo | Descrição |
|---|---|
| **Caso de Uso** | Gerenciar pacientes |
| **Tarefa / Fase** | Matricular e manter os assistidos |
| **Ator Principal** | Administrativo (cadastrar, editar e inativar), Recepcionista (consultar e editar), Especialista e Assistente Social (consultar) — permissões `CADASTRAR_PACIENTE`, `EDITAR_PACIENTE`, `INATIVAR_PACIENTE` e `VISUALIZAR_PACIENTES` (ou `VISUALIZAR_PACIENTES_VINCULADOS`, no Assistente Social) |
| **Ator Secundário** | — |
| **Pré-Condição** | Usuário autenticado com a permissão. |
| **Pós-Condição** | Paciente cadastrado como Matriculado, com responsáveis, endereço, escola, CIDs e prontuário. |
| **Ações do Ator** | **Ações do Sistema** |
| 1. Acessa "Cadastrar Paciente". | |
| | 2. Exibe o formulário: dados do paciente, responsáveis, escola, prontuário e CIDs. |
| 3. Preenche os dados pessoais e informa o CEP. | |
| | 4. Preenche o endereço a partir do CEP. |
| 5. Informa ao menos um responsável (novo ou já cadastrado, buscado por nome ou CPF), com o grau de parentesco. | |
| 6. Escolhe a escola, informa alergias, comorbidades e mobilidade e digita os CIDs; depois salva. | |
| | 7. Confere os CIDs na tabela oficial, valida o CPF, cadastra o paciente e exibe o detalhe dele. |
| **Fluxo Alternativo A – Buscar e editar** | |
| 1a. Acessa "Pacientes" e busca pelo CPF completo ou por ao menos 3 letras do nome. | |
| | 2a. Exibe os pacientes encontrados (até 20, CPF mascarado). Não há listagem completa (LGPD). |
| 3a. Abre um paciente e clica em "Editar". | |
| | 4a. Exibe os dados atuais (CPF, data de nascimento e sexo bloqueados) e grava as alterações. |
| **Fluxo Alternativo B – Adicionar responsável** | |
| 3b. Na edição do paciente, na seção "Responsáveis", adiciona um responsável novo ou busca um já cadastrado por nome ou CPF; também pode alterar o parentesco ou remover um responsável. | |
| | 4b. Grava os vínculos (o paciente precisa manter ao menos um responsável). |
| **Fluxo Alternativo C – Inativar ou reativar** | |
| 3c. No detalhe, clica em "Inativar" e confirma (exige `INATIVAR_PACIENTE`). | |
| | 4c. Inativa o cadastro, cancela as terapias individuais futuras, retira o paciente das coletivas futuras e exibe o resumo. "Reativar" volta o cadastro a ativo. |
| **Fluxo Alternativo D – Vincular assistente social** | |
| 3d. No detalhe, escolhe um assistente social e vincula (exige `EDITAR_PROFISSIONAL`). | |
| | 4d. Registra o vínculo; o assistente social passa a ver o paciente. |
| **Exceções** | CPF inválido ou já cadastrado: recusa. CID inexistente na tabela oficial: recusa. Sem responsável ou sem endereço: recusa. Quem tem só `VISUALIZAR_PACIENTES_VINCULADOS` encontra apenas os pacientes vinculados a ele. |

---

**Quadro 12** - CS12 - Visualizar Histórico do Paciente

| Campo | Descrição |
|---|---|
| **Caso de Uso** | Visualizar histórico do paciente |
| **Tarefa / Fase** | Acompanhar a trajetória do assistido |
| **Ator Principal** | Recepcionista, Especialista e Assistente Social (permissão `VISUALIZAR_HISTORICO_PACIENTE`) |
| **Ator Secundário** | — |
| **Pré-Condição** | Usuário autenticado com a permissão; paciente encontrado na busca. |
| **Pós-Condição** | Histórico consultado. |
| **Ações do Ator** | **Ações do Sistema** |
| 1. Acessa "Pacientes" e busca pelo nome ou CPF. | |
| | 2. Exibe os pacientes encontrados. |
| 3. Abre o detalhe do paciente. | |
| | 4. Exibe o bloco "Histórico de Atividades": os eventos mais recentes primeiro, com quem fez e quando, paginados. |
| **Fluxo Alternativo A – Pelo prontuário** | |
| 3a. Abre o prontuário do paciente (CS16) na aba "Histórico". | |
| | 4a. Exibe os CIDs e os eventos recentes, com opção de mostrar só terapias e presenças ou só cadastro. |
| **Observação** | O histórico nunca mostra dados de saúde nem textos livres (justificativas e motivos). |

---

**Quadro 13** - CS13 - Gerenciar Terapias

| Campo | Descrição |
|---|---|
| **Caso de Uso** | Gerenciar terapias |
| **Tarefa / Fase** | Criar a agenda dos médicos e terapeutas |
| **Ator Principal** | Recepcionista (permissões `AGENDAR_TERAPIA`, `EDITAR_TERAPIA`, `ALTERAR_STATUS_TERAPIA` e `VISUALIZAR_TERAPIAS`) |
| **Ator Secundário** | — |
| **Pré-Condição** | Usuário autenticado com a permissão; pacientes e especialistas ativos, com jornada de trabalho. |
| **Pós-Condição** | Terapia agendada (status Agendada; presença Pendente para cada paciente). |
| **Ações do Ator** | **Ações do Sistema** |
| 1. Acessa "Nova Terapia" (ou "Agendamentos" → "Nova"). | |
| | 2. Exibe o formulário de agendamento. |
| 3. Seleciona os pacientes, os especialistas, a data e o horário. | |
| | 4. **CS21 – Verificar Conflito de Horário** («include»): enquanto o formulário é preenchido, confere a disponibilidade e destaca conflitos (horário ocupado ou fora da jornada). |
| 5. Confirma. | |
| | 6. Executa de novo o **CS21** («include»), agenda a sessão (individual ou coletiva, pelo número de pacientes) e a exibe na agenda do especialista. |
| **Fluxo Alternativo A – Editar (remarcar)** | |
| 1a. Em "Agendamentos", abre uma terapia agendada e clica em "Editar" (exige `EDITAR_TERAPIA`). | |
| | 2a. Exibe o formulário com os dados atuais, verifica os conflitos e grava a nova data, horário ou participantes. |
| **Fluxo Alternativo B – Mudar status ou cancelar** | |
| 1b. No detalhe da terapia, clica em "Iniciar atendimento", "Concluir" ou "Cancelar terapia", informando o motivo no cancelamento (exige `ALTERAR_STATUS_TERAPIA`). | |
| | 2b. Muda o status (Agendada → Em atendimento → Concluída). O cancelamento libera o horário. |
| **Fluxo Alternativo C – Consultar** | |
| 1c. Acessa "Agendamentos" e filtra por status, período, paciente ou especialista. | |
| | 2c. Exibe as terapias e os contadores por status. |
| **Exceções** | Horário no passado: recusa. Paciente ou especialista ocupado, ou fora da jornada: recusa e lista todos os conflitos. Outro usuário ocupou o horário antes de salvar: recusa e atualiza os destaques. Terapia concluída ou cancelada: não pode ser editada nem mudar de status. |

---

**Quadro 14** - CS14 - Registrar Presença do Paciente na Terapia

| Campo | Descrição |
|---|---|
| **Caso de Uso** | Registrar presença do paciente na terapia |
| **Tarefa / Fase** | Controlar a frequência das sessões |
| **Ator Principal** | Recepcionista (permissão `REGISTRAR_PRESENCA`) |
| **Ator Secundário** | — |
| **Pré-Condição** | Usuário autenticado com a permissão; terapia não cancelada. |
| **Pós-Condição** | Presença ou falta registrada no paciente e no histórico dele. |
| **Ações do Ator** | **Ações do Sistema** |
| 1. Acessa "Terapias do Dia". | |
| | 2. Exibe as terapias de hoje com os pacientes e o resumo do dia. |
| 3. Opcionalmente, escolhe outro dia. | |
| | 4. Exibe as terapias do dia escolhido. |
| 5. Para cada paciente, clica em "Compareceu", "Falta justificada" (informando a justificativa) ou "Falta". | |
| | 6. Registra a marcação e atualiza o card. A falta justificada libera o horário do paciente e, quando todos os pacientes justificam, mostra o selo "Horário liberado". |
| **Fluxo Alternativo A – Desfazer** | |
| 5a. Clica em "Desfazer" numa marcação feita por engano. | |
| | 6a. Volta a presença para Pendente. |
| **Exceções** | Antes do dia da terapia: só permite falta justificada (aviso antecipado). Depois do fim do dia seguinte: só permite falta justificada. Os botões indisponíveis explicam o motivo. Desfazer uma falta justificada com o horário já reocupado: recusa. |

---

**Quadro 15** - CS15 - Visualizar Agenda do Especialista

| Campo | Descrição |
|---|---|
| **Caso de Uso** | Visualizar agenda do especialista |
| **Tarefa / Fase** | Organizar os próprios atendimentos |
| **Ator Principal** | Especialista (cadastro de especialista, comum ou PJ) |
| **Ator Secundário** | — |
| **Pré-Condição** | Especialista autenticado. |
| **Pós-Condição** | Agenda consultada. |
| **Ações do Ator** | **Ações do Sistema** |
| 1. Acessa "Minha Agenda". | |
| | 2. Exibe o mês atual com as terapias dele marcadas nos dias e a semana selecionada. |
| 3. Navega entre meses e escolhe um dia. | |
| | 4. Exibe as terapias do dia: horário, pacientes, modalidade e status. |
| 5. Clica numa terapia. | |
| | 6. Exibe o detalhe da sessão e o botão "Abrir prontuário". |
| **Fluxo Alternativo A – Terapias do dia** | |
| 1a. Acessa "Minhas Terapias do Dia". | |
| | 2a. Exibe as terapias de hoje com os pacientes e os outros especialistas da sessão. |
| **Observação** | Só aparecem as terapias de que o especialista participa. |

---

**Quadro 16** - CS16 - Consultar Prontuário do Paciente

| Campo | Descrição |
|---|---|
| **Caso de Uso** | Consultar prontuário do paciente |
| **Tarefa / Fase** | Atender o paciente |
| **Ator Principal** | Especialista e Recepcionista (permissão `VISUALIZAR_PACIENTES`; fora do especialista, também `VISUALIZAR_TERAPIAS`) |
| **Ator Secundário** | — |
| **Pré-Condição** | Usuário autenticado com a permissão. |
| **Pós-Condição** | Prontuário consultado; a consulta fica registrada na auditoria. |
| **Ações do Ator** | **Ações do Sistema** |
| 1. No Início, em "Próximo Paciente", clica em "Abrir Prontuário" (ou na agenda, ou no detalhe do paciente). | |
| | 2. Exibe a identificação do paciente e os alertas clínicos (alergias, comorbidades e mobilidade), e a sessão de origem, se houver. |
| 3. Navega pelas abas. | |
| | 4. Exibe os CIDs e o histórico, as terapias do paciente e a frequência do mês (geral e por especialidade), com destaque quando fica abaixo de 75%. |
| 5. Opcionalmente, clica em "Emitir Atestado" ou "Emitir Receita" (CS17 e CS18 «extend» este caso de uso). | |
| | 6. Abre o documento (CS17 / CS18) já com o paciente preenchido. |
| **Observação** | O especialista vê só as terapias que ele atende; quem tem `VISUALIZAR_TERAPIAS` vê todas. |

---

**Quadro 17** - CS17 - Emitir Atestado

| Campo | Descrição |
|---|---|
| **Caso de Uso** | Emitir atestado |
| **Tarefa / Fase** | Atender o paciente (documentos clínicos) |
| **Ator Principal** | Especialista (permissão `EMITIR_ATESTADO` marcada no perfil) |
| **Ator Secundário** | — |
| **Pré-Condição** | Usuário autenticado, com cadastro de especialista e a permissão marcada no perfil (o acesso total não libera). |
| **Pós-Condição** | Atestado impresso ou salvo em PDF; nada fica guardado no sistema. |
| **Ações do Ator** | **Ações do Sistema** |
| 1. Acessa "Emitir Atestado" no menu, ou clica no botão dentro do prontuário (este caso de uso «extend» o CS16). | |
| | 2. Pede o paciente. |
| 3. Busca e seleciona o paciente. | |
| | 4. Abre o documento com os dados do paciente. |
| 5. Escolhe um modelo (comparecimento, afastamento, acompanhamento do responsável ou aptidão física) ou escreve o texto livre, completando os campos "___". | |
| | 6. Monta a folha com a assinatura do especialista (registro no conselho, especialidade e CBO). |
| 7. Clica em "Imprimir / Baixar PDF". | |
| | 8. Abre a impressão do navegador, com a opção de salvar em PDF. |

---

**Quadro 18** - CS18 - Emitir Receita

| Campo | Descrição |
|---|---|
| **Caso de Uso** | Emitir receita |
| **Tarefa / Fase** | Atender o paciente (documentos clínicos) |
| **Ator Principal** | Especialista (permissão `EMITIR_RECEITA` marcada no perfil) |
| **Ator Secundário** | — |
| **Pré-Condição** | Usuário autenticado, com cadastro de especialista e a permissão marcada no perfil (o acesso total não libera). |
| **Pós-Condição** | Receita impressa ou salva em PDF; nada fica guardado no sistema. |
| **Ações do Ator** | **Ações do Sistema** |
| 1. Acessa "Emitir Receita" no menu, ou clica no botão dentro do prontuário (este caso de uso «extend» o CS16). | |
| | 2. Pede o paciente. |
| 3. Busca e seleciona o paciente. | |
| | 4. Abre o documento com os dados do paciente. |
| 5. Escreve a prescrição. | |
| | 6. Monta a folha com a assinatura do especialista. |
| 7. Clica em "Imprimir / Baixar PDF". | |
| | 8. Abre a impressão do navegador, com a opção de salvar em PDF. |

---

**Quadro 19** - CS19 - Emitir Declaração de Recusa

| Campo | Descrição |
|---|---|
| **Caso de Uso** | Emitir declaração de recusa |
| **Tarefa / Fase** | Triagem / encerramento do atendimento |
| **Ator Principal** | Recepcionista (permissão `EMITIR_RECUSA`) |
| **Ator Secundário** | — |
| **Pré-Condição** | Usuário autenticado com a permissão. |
| **Pós-Condição** | Declaração impressa ou salva em PDF; nada fica guardado no sistema. |
| **Ações do Ator** | **Ações do Sistema** |
| 1. Acessa "Emitir Recusa". | |
| | 2. Exibe o formulário "Pessoa recusada" e "Motivo da recusa". |
| 3. Informa nome, CPF, data de nascimento e motivo, ou escolhe um paciente cadastrado para preencher os dados. | |
| 4. Clica em "Visualizar recusa". | |
| | 5. Valida os dados e exibe a declaração pronta. |
| 6. Clica em "Imprimir / Baixar PDF". | |
| | 7. Abre a impressão do navegador. |
| **Fluxo Alternativo A – Inativar Paciente («extend»)** | |
| | 7a. Se a recusa for de um paciente ativo e o usuário puder inativar pacientes, pergunta se deseja inativá-lo. |
| 8a. Clica em "Inativar" (ou "Manter ativo"). | |
| | 9a. Inativa o paciente (como no CS11) e exibe o resumo. |
| **Fluxo Alternativo B – Corrigir** | |
| 6b. Clica em "Voltar e editar". | |
| | 7b. Volta ao formulário com os dados preenchidos. |

---

**Quadro 20** - CS20 - Visualizar Página Inicial

| Campo | Descrição |
|---|---|
| **Caso de Uso** | Visualizar página inicial |
| **Tarefa / Fase** | Acompanhar o dia e navegar pelo sistema |
| **Ator Principal** | Usuário (qualquer usuário autenticado) |
| **Ator Secundário** | — |
| **Pré-Condição** | Usuário autenticado (CS01). |
| **Pós-Condição** | Início exibido conforme as permissões do usuário. |
| **Ações do Ator** | **Ações do Sistema** |
| 1. Entra no sistema ou clica em "Início". | |
| | 2. Monta a página conforme as permissões e o tipo de cadastro do usuário: Gestão Rápida com as telas liberadas; terapias e presenças de hoje (`VISUALIZAR_TERAPIAS`); totais de profissionais (`VISUALIZAR_PROFISSIONAIS`); meus atendimentos e próximo paciente (especialista); meus pacientes (assistente social). |
| 3. Clica num atalho da Gestão Rápida ou num item de um bloco. | |
| | 4. Abre a tela correspondente. |
| **Exceções** | Perfil sem nenhuma tela liberada: exibe o aviso para procurar o administrador. |

---

**Quadro 21** - CS21 - Verificar Conflito de Horário

| Campo | Descrição |
|---|---|
| **Caso de Uso** | Verificar conflito de horário |
| **Tarefa / Fase** | Criar a agenda dos médicos e terapeutas (incluído pelo CS13 – Gerenciar Terapias, no agendamento e na edição) |
| **Ator Principal** | Recepcionista (por meio do CS13; este caso não é acionado sozinho) |
| **Ator Secundário** | — |
| **Pré-Condição** | Formulário de agendamento ou de edição de terapia (CS13) com pacientes, especialistas, data e horário preenchidos. |
| **Pós-Condição** | Conflitos exibidos ao usuário, ou horário confirmado como livre. Nada é gravado. |
| **Ações do Ator** | **Ações do Sistema** |
| 1. No CS13, escolhe ou altera os pacientes, os especialistas, a data ou o horário. | |
| | 2. Confere se algum paciente ou especialista já tem outra terapia que se sobrepõe ao horário (o início conta, o término não: 09:00–10:00 e 10:00–11:00 não conflitam). |
| | 3. Confere se a terapia cabe inteira em uma única jornada de trabalho de cada especialista, no dia da semana da data. |
| | 4. Desconsidera as terapias canceladas, o horário de paciente com falta justificada (e do especialista, quando todos os pacientes justificaram) e, na edição, a própria terapia. |
| | 5. Se houver conflito, destaca as pessoas envolvidas e lista todos os conflitos: horário ocupado (com a terapia que ocupa) ou fora da jornada (com as jornadas do dia). Sem conflito, segue sem alertas. |
| 6. Ajusta o horário ou os participantes (volta ao passo 1) ou confirma o agendamento no CS13. | |
| **Fluxo Alternativo A – Ao salvar** | O sistema refaz a verificação no momento de gravar. Se outro usuário ocupou o horário depois da última verificação, recusa o agendamento e lista os conflitos. Em agendamentos simultâneos para o mesmo horário, só o primeiro é gravado. |
| **Exceções** | Término igual ou anterior ao início, participante inativo ou repetido: recusa antes de verificar. Horário no passado: a verificação não recusa, mas o agendamento (CS13) recusa. |
| **Observação** | A verificação é um aviso antecipado: ela não reserva o horário. |
