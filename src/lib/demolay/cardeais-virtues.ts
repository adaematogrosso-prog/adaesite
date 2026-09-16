export type CardeaisVirtue = {
  id: string;
  order: number;
  label: string;
  paragraphs: string[];
  reflections: string[];
};

export const CARDEAIS_VIRTUES: CardeaisVirtue[] = [
  {
    id: "amor-filial",
    order: 1,
    label: "Amor Filial",
    paragraphs: [
      "O Amor Filial é um amor que existe antes mesmo de nascermos e que levaremos conosco por toda nossa vida. Não há amor mais incessante e sincero quanto o amor dos pais para com seus filhos e dos filhos para com seus pais.",
      "São nossos pais que deixam de fazer algo de seu interesse para ofertar algo a nós, sejam bens materiais ou, principalmente, o tempo investido em nossas criações.",
      "Por isso, devemos nos esforçar para nos tornar melhores filhos, fazendo o que for possível para demonstrar a gratidão e o reconhecimento por tudo que nossos pais fazem por nós.",
    ],
    reflections: [
      "Por que o amor e o respeito aos pais estão em primeiro lugar dentre todas?",
      "De que maneira podemos aprimorar nossa relação com nossos pais?",
      "Como posso me tornar um melhor filho?",
      "O que eu posso oferecer aos meus pais para ajudá-los em suas vidas diárias?",
    ],
  },
  {
    id: "reverencia",
    order: 2,
    label: "Reverência pelas Coisas Sagradas",
    paragraphs: [
      "Sem crença, tanto no Pai Celestial quanto nas outras coisas na vida, todos os seus movimentos na Ordem DeMolay seriam em vão e não fariam sentido algum.",
      "Um jovem que está entre as fileiras da Ordem DeMolay precisa crer em algum Ser Superior, seja ele qual for, independentemente de religião. Precisa ter fé em um Ser Superior, pois sem esta sólida fé e a crença em nosso Pai Celestial, todos os nossos esforços seriam em vão.",
      "Quando há a crença e fé no Pai Celestial, nota-se considerável mudança na personalidade e caráter de cada DeMolay. É Nele que depositamos nossa confiança e, também, é para Ele que rogamos bênçãos e proteção para todos nós e nossas famílias.",
      "Mais do que a própria fé, é importante ressaltar que todo DeMolay deve ter respeito pelas demais crenças, religiões e/ou doutrinas. Somente assim um jovem líder poderá ser reverente a tudo aquilo que, por alguém, possa ser considerado sagrado.",
    ],
    reflections: [
      "Eu possuo sólidas convicções religiosas, ou seja, tenho consciência da solidez da minha fé?",
      "Eu possuo respeito por tudo aquilo que é tido como sagrado, ou acho que «não é nada demais»?",
      "Eu trato bem pessoas de outras religiões?",
      "Eu respeito outras religiões, apesar de eventualmente não poder vir a concordar com alguns métodos?",
      "Eu apenas frequento o lugar de culto ou sou um praticante de seus ensinamentos em minha vida diária?",
    ],
  },
  {
    id: "cortesia",
    order: 3,
    label: "Cortesia",
    paragraphs: [
      "A Cortesia está por trás das pequenas atitudes do dia-a-dia e não deve faltar jamais, devendo ser exercida por todos e para todos. Esta Virtude não tem preconceito de raça, credo ou posição social. É a manifestação espontânea de um caráter habituado a tratar todos sem distinção e com delicadeza.",
      "O Jovem cortês molda o seu caráter, criando uma atmosfera de boa vontade ao seu redor.",
      "Sejamos corteses em todo e qualquer lugar que estivermos. Seja em casa, na escola, no trabalho ou na rua, uma atitude de bondade partida de nós faz com que outras pessoas possam repassar este ato.",
    ],
    reflections: [
      "Entendendo que todas as pessoas possuem pensamentos diferentes, eu respeito todos eles ou trato algum com desdém?",
      "Eu trato bem as pessoas que eu não conheço?",
      "Eu trato bem aqueles que me querem mal?",
      "Se um desconhecido não me tratar bem, eu o tratarei mal de volta?",
    ],
  },
  {
    id: "companheirismo",
    order: 4,
    label: "Companheirismo",
    paragraphs: [
      "Esta é a Virtude no centro de nossas Sete. Um DeMolay sozinho pode chegar longe, mas, com a ajuda de seus Irmãos, chegará em lugares até então inimagináveis.",
      "Dentro da Ordem DeMolay, esta Virtude é muito presente, uma vez que, quando algum Irmão precisa, existem outros vários Irmãos para auxiliá-lo no que for preciso, seja para questões ritualísticas, escolares, profissionais e inclusive pessoais.",
      "Nós prometemos, na Cerimônia de Iniciação, ser leais a todos os Irmãos da Ordem e que nunca iremos enganá-los. Ainda, prometemos que permaneceremos sempre em silêncio quando não nos seja possível falar bem de outro irmão, na presença de um não-Iniciado.",
    ],
    reflections: [
      "Sou leal aos meus amigos?",
      "Permaneço ao lado dos meus amigos em momentos de dificuldade?",
      "Em se tratando de um conflito entre duas pessoas muito amigas minhas, como me posiciono?",
      "Sou justo ao aconselhar meus amigos?",
      "Aquelas amizades as quais eu me dedico, trazem benefícios à minha vida pessoal? Eu trago a elas?",
    ],
  },
  {
    id: "fidelidade",
    order: 5,
    label: "Fidelidade",
    paragraphs: [
      "A Fidelidade não é apenas sobre ter um compromisso com uma outra pessoa, mas sim com o nosso próprio sentimento. Pois, independentemente das condições em que estivermos e dos benefícios que poderíamos ter, devemos permanecer leais às nossas promessas, aos nossos amigos e a Deus. Caso contrário, estaríamos indo contra os ideais de nosso herói Mártir, Jacques de Molay, que preferiu morrer a trair seus companheiros.",
      "Se nós não formos fiéis ao que sentimos, do que importaria o resto?",
      "Portanto, que pensemos bem antes de externar qualquer pensamento, seja por qualquer forma de comunicação, pois ali está um compromisso assumido, do qual teremos que cumprir.",
      "Para uma analogia, as palavras e os atos representam, simbolicamente, uma flecha que, após ser lançada, não temos como resgatá-la.",
    ],
    reflections: [
      "Permaneço fiel a cada palavra do meu juramento?",
      "Quando alguém me conta um segredo, eu o guardo?",
      "Quando me comprometo com algo, eu, de fato, cumpro?",
      "Como poderia me tornar uma pessoa mais confiável?",
    ],
  },
  {
    id: "pureza",
    order: 6,
    label: "Pureza",
    paragraphs: [
      "O dicionário define a Pureza como «algo que nasceu e permanece intocado».",
      "Esta Virtude refere-se à pureza de corpo a qual todos praticamos e, principalmente, à pureza de pensamento, palavra e ação.",
      "Para que nós permaneçamos «intocáveis», devemos diariamente exercitar a capacidade de mantermos firmes contra as tentações que nos tornam indignos aos olhos dos homens de bem.",
      "Diariamente surgem oportunidades, e pessoas de más intenções, que podem nos fomentar a desviar do nosso caminho da retidão que seguimos e, diante dessas situações, nosso caráter de DeMolays deve prevalecer. Afinal, «o que é errado é errado, ainda que todos estejam fazendo, e o que é certo é certo, ainda que poucos estejam fazendo».",
    ],
    reflections: [
      "Meus pensamentos são puros?",
      "Eu falo palavrões e coisas obscenas?",
      "Eu ajo sempre de maneira limpa, nunca com segundas intenções?",
      "Eu sou sempre sincero e verdadeiro com os outros ao meu redor?",
      "Ajo de maneira correta mesmo quando ninguém está olhando?",
    ],
  },
  {
    id: "patriotismo",
    order: 7,
    label: "Patriotismo",
    paragraphs: [
      "Nos dias de hoje, em que temos uma sociedade livre e com vários direitos, talvez não seja necessário que defendamos nossa Pátria em campo de batalha. Porém, todos os dias temos novas oportunidades para defendê-la, bem como para nos demonstrarmos como bons e corretos cidadãos.",
      "Quando se lê «Patriotismo», o que vem em mente é a Pátria, ou seja, em nível de nação, Brasil. Entretanto, a Virtude do Patriotismo faz menção à defesa não só da Pátria, mas sim, principalmente, a defesa de seu estado, sua cidade e seu bairro.",
      "Se não conseguir fazer algo pelo seu País, faça pelo seu bairro, pela sua cidade. Comece por onde consiga realmente ser eficaz. Seja fiscalizando nossos políticos, seja sendo voluntário em algum evento municipal ou ainda participando de ações da Associação de Moradores de sua localidade.",
      "O exercício do patriotismo depende única e exclusivamente de nós, cidadãos, mas especialmente de nós DeMolays, que permaneceremos sempre dispostos para com nossas responsabilidades civis. Então, não perguntes o que a tua pátria pode fazer por ti, e sim o que tu podes fazer por ela.",
    ],
    reflections: [
      "O que ofereço de bom ao meu país?",
      "Sou um bom cumpridor das leis da minha cidade, estado e país?",
      "Eu daria a vida pelo meu país?",
      "Estou disposto a lutar pelo seu desenvolvimento?",
    ],
  },
];

export const CARDEAIS_CEREMONY_QUOTE =
  "Em volta desses baluartes, a Ordem DeMolay coloca sete velas, simbolizando as Sete Virtudes Cardeais de um DeMolay. Como a luz dessas velas ilumina esta Sala Capitular, possa sua luz brilhar diante dos homens, a fim de que eles possam ver os seus bons trabalhos e glorificar o seu Pai que está no céu.";

export const CARDEAIS_SOURCE =
  "Supremo Conselho DeMolay Brasil, Escola de Iniciáticos, Virtudes Cardeais.";

export function getCardeaisVirtueById(id: string) {
  return CARDEAIS_VIRTUES.find((virtue) => virtue.id === id);
}
