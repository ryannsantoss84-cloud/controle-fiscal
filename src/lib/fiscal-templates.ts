// Configuração de impostos por perfil fiscal

export type RegimeTributario = "simples_nacional" | "lucro_presumido" | "lucro_real" | "mei";
export type TipoAtividade = "comercio" | "servico" | "industria" | "comercio_servico";

export interface ImpostoTemplate {
  codigo: string;
  nome: string;
  descricao: string;
  tipo: "obligation" | "tax";
  recorrencia: "monthly" | "quarterly" | "semiannual" | "annual";
  diaVencimento: number;
  mesVencimento?: number; // Para impostos anuais
  aplicavelRegimes: RegimeTributario[];
  aplicavelAtividades: TipoAtividade[];
  observacoes?: string;
}

export interface RegrasMunicipais {
  cidade: string;
  estado: string;
  issqnDia?: number;
  issqnMes?: number; // Para cidades com vencimento específico
  observacoes?: string;
}

// Base de impostos federais
export const IMPOSTOS_FEDERAIS: ImpostoTemplate[] = [
  // SIMPLES NACIONAL
  {
    codigo: "DAS",
    nome: "DAS - Simples Nacional",
    descricao: "Documento de Arrecadação do Simples Nacional",
    tipo: "tax",
    recorrencia: "monthly",
    diaVencimento: 20,
    aplicavelRegimes: ["simples_nacional"],
    aplicavelAtividades: ["comercio", "servico", "industria", "comercio_servico"],
  },
  {
    codigo: "DEFIS",
    nome: "DEFIS",
    descricao: "Declaração de Informações Socioeconômicas e Fiscais",
    tipo: "obligation",
    recorrencia: "annual",
    diaVencimento: 31,
    mesVencimento: 3, // Março
    aplicavelRegimes: ["simples_nacional"],
    aplicavelAtividades: ["comercio", "servico", "industria", "comercio_servico"],
  },

  // LUCRO PRESUMIDO - COMÉRCIO
  {
    codigo: "IRPJ_LP_COM",
    nome: "IRPJ - Lucro Presumido",
    descricao: "Imposto de Renda Pessoa Jurídica",
    tipo: "tax",
    recorrencia: "quarterly",
    diaVencimento: 31,
    aplicavelRegimes: ["lucro_presumido"],
    aplicavelAtividades: ["comercio", "comercio_servico"],
    observacoes: "Vence no último dia útil do mês seguinte ao trimestre",
  },
  {
    codigo: "CSLL_LP_COM",
    nome: "CSLL - Lucro Presumido",
    descricao: "Contribuição Social sobre o Lucro Líquido",
    tipo: "tax",
    recorrencia: "quarterly",
    diaVencimento: 31,
    aplicavelRegimes: ["lucro_presumido"],
    aplicavelAtividades: ["comercio", "comercio_servico"],
  },
  {
    codigo: "PIS_LP_COM",
    nome: "PIS - Lucro Presumido",
    descricao: "Programa de Integração Social",
    tipo: "tax",
    recorrencia: "monthly",
    diaVencimento: 25,
    aplicavelRegimes: ["lucro_presumido"],
    aplicavelAtividades: ["comercio", "comercio_servico"],
  },
  {
    codigo: "COFINS_LP_COM",
    nome: "COFINS - Lucro Presumido",
    descricao: "Contribuição para Financiamento da Seguridade Social",
    tipo: "tax",
    recorrencia: "monthly",
    diaVencimento: 25,
    aplicavelRegimes: ["lucro_presumido"],
    aplicavelAtividades: ["comercio", "comercio_servico"],
  },

  // LUCRO PRESUMIDO - SERVIÇO
  {
    codigo: "IRPJ_LP_SERV",
    nome: "IRPJ - Lucro Presumido (Serviço)",
    descricao: "Imposto de Renda Pessoa Jurídica - Serviços",
    tipo: "tax",
    recorrencia: "quarterly",
    diaVencimento: 31,
    aplicavelRegimes: ["lucro_presumido"],
    aplicavelAtividades: ["servico", "comercio_servico"],
    observacoes: "Alíquota diferenciada para serviços",
  },
  {
    codigo: "CSLL_LP_SERV",
    nome: "CSLL - Lucro Presumido (Serviço)",
    descricao: "Contribuição Social sobre o Lucro Líquido - Serviços",
    tipo: "tax",
    recorrencia: "quarterly",
    diaVencimento: 31,
    aplicavelRegimes: ["lucro_presumido"],
    aplicavelAtividades: ["servico", "comercio_servico"],
  },

  // LUCRO REAL
  {
    codigo: "IRPJ_LR",
    nome: "IRPJ - Lucro Real",
    descricao: "Imposto de Renda Pessoa Jurídica - Lucro Real",
    tipo: "tax",
    recorrencia: "monthly",
    diaVencimento: 31,
    aplicavelRegimes: ["lucro_real"],
    aplicavelAtividades: ["comercio", "servico", "industria", "comercio_servico"],
  },
  {
    codigo: "CSLL_LR",
    nome: "CSLL - Lucro Real",
    descricao: "Contribuição Social sobre o Lucro Líquido - Lucro Real",
    tipo: "tax",
    recorrencia: "monthly",
    diaVencimento: 31,
    aplicavelRegimes: ["lucro_real"],
    aplicavelAtividades: ["comercio", "servico", "industria", "comercio_servico"],
  },

  // COMUNS A TODOS (exceto MEI e Simples)
  {
    codigo: "INSS",
    nome: "GPS - INSS",
    descricao: "Guia da Previdência Social",
    tipo: "tax",
    recorrencia: "monthly",
    diaVencimento: 20,
    aplicavelRegimes: ["lucro_presumido", "lucro_real"],
    aplicavelAtividades: ["comercio", "servico", "industria", "comercio_servico"],
  },
  {
    codigo: "FGTS",
    nome: "FGTS",
    descricao: "Fundo de Garantia do Tempo de Serviço",
    tipo: "tax",
    recorrencia: "monthly",
    diaVencimento: 7,
    aplicavelRegimes: ["lucro_presumido", "lucro_real", "simples_nacional"],
    aplicavelAtividades: ["comercio", "servico", "industria", "comercio_servico"],
    observacoes: "Apenas se tiver funcionários",
  },

  // OBRIGAÇÕES ACESSÓRIAS
  {
    codigo: "SPED_FISCAL",
    nome: "SPED Fiscal",
    descricao: "Escrituração Fiscal Digital",
    tipo: "obligation",
    recorrencia: "monthly",
    diaVencimento: 20,
    aplicavelRegimes: ["lucro_presumido", "lucro_real"],
    aplicavelAtividades: ["comercio", "industria", "comercio_servico"],
  },
  {
    codigo: "SPED_CONTRIB",
    nome: "SPED Contribuições",
    descricao: "EFD-Contribuições (PIS/COFINS)",
    tipo: "obligation",
    recorrencia: "monthly",
    diaVencimento: 10,
    aplicavelRegimes: ["lucro_presumido", "lucro_real"],
    aplicavelAtividades: ["comercio", "servico", "industria", "comercio_servico"],
  },
  {
    codigo: "DCTF",
    nome: "DCTF",
    descricao: "Declaração de Débitos e Créditos Tributários Federais",
    tipo: "obligation",
    recorrencia: "monthly",
    diaVencimento: 15,
    aplicavelRegimes: ["lucro_presumido", "lucro_real"],
    aplicavelAtividades: ["comercio", "servico", "industria", "comercio_servico"],
  },
  {
    codigo: "ESOCIAL",
    nome: "eSocial",
    descricao: "Sistema de Escrituração Digital das Obrigações Fiscais",
    tipo: "obligation",
    recorrencia: "monthly",
    diaVencimento: 15,
    aplicavelRegimes: ["lucro_presumido", "lucro_real", "simples_nacional"],
    aplicavelAtividades: ["comercio", "servico", "industria", "comercio_servico"],
    observacoes: "Apenas se tiver funcionários",
  },
];

// Regras municipais por cidade
export const REGRAS_MUNICIPAIS: RegrasMunicipais[] = [
  {
    cidade: "São Paulo",
    estado: "SP",
    issqnDia: 10,
    observacoes: "ISS vence dia 10 do mês seguinte",
  },
  {
    cidade: "Rio de Janeiro",
    estado: "RJ",
    issqnDia: 15,
    observacoes: "ISS vence dia 15 do mês seguinte",
  },
  {
    cidade: "Belo Horizonte",
    estado: "MG",
    issqnDia: 20,
    observacoes: "ISS vence dia 20 do mês seguinte",
  },
  {
    cidade: "Curitiba",
    estado: "PR",
    issqnDia: 10,
    observacoes: "ISS vence dia 10 do mês seguinte",
  },
  {
    cidade: "Porto Alegre",
    estado: "RS",
    issqnDia: 25,
    observacoes: "ISS vence dia 25 do mês seguinte",
  },
  // Adicione mais cidades conforme necessário
];

// Função para gerar impostos baseado no perfil
export function gerarImpostosPorPerfil(
  regime: RegimeTributario,
  atividade: TipoAtividade,
  cidade?: string,
  estado?: string
): ImpostoTemplate[] {
  // Filtrar impostos federais aplicáveis
  const impostosFederais = IMPOSTOS_FEDERAIS.filter(
    (imposto) =>
      imposto.aplicavelRegimes.includes(regime) &&
      imposto.aplicavelAtividades.includes(atividade)
  );

  const impostos = [...impostosFederais];

  // Adicionar ISS se for serviço
  if (atividade === "servico" || atividade === "comercio_servico") {
    const regraMunicipal = REGRAS_MUNICIPAIS.find(
      (r) => r.cidade === cidade && r.estado === estado
    );

    const diaISS = regraMunicipal?.issqnDia || 10; // Padrão dia 10

    impostos.push({
      codigo: "ISS",
      nome: `ISS - ${cidade || "Municipal"}`,
      descricao: "Imposto Sobre Serviços",
      tipo: "tax",
      recorrencia: "monthly",
      diaVencimento: diaISS,
      aplicavelRegimes: [regime],
      aplicavelAtividades: [atividade],
      observacoes: regraMunicipal?.observacoes,
    });
  }

  // Adicionar ICMS se for comércio ou indústria
  if (atividade === "comercio" || atividade === "industria" || atividade === "comercio_servico") {
    if (regime !== "simples_nacional") {
      impostos.push({
        codigo: "ICMS",
        nome: `ICMS - ${estado || "Estadual"}`,
        descricao: "Imposto sobre Circulação de Mercadorias e Serviços",
        tipo: "tax",
        recorrencia: "monthly",
        diaVencimento: 9, // Varia por estado, 9 é comum
        aplicavelRegimes: [regime],
        aplicavelAtividades: [atividade],
        observacoes: "Verificar calendário estadual",
      });
    }
  }

  return impostos;
}
