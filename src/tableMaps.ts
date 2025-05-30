interface TableMap {
  headers: LanguageMap;
  keys: string[];
}

export type DBTableMap = {
  keys: string[];
};

export type CSVInfoDBTableMaps = {
  keys: string[];
  example?: string[];
};

interface LanguageMap {
  it: string[];
  en: string[];
  [key: string]: string[];
}

const TableMaps: { [key: string]: TableMap } = {
  tecnici: {
    headers: {
      it: ["Nome", "Cognome", "Ruolo", "Email", "Telefono", ""],
      en: ["Name", "Surname", "Role", "Email", "Phone", ""],
    },
    keys: [
      "nometecnico",
      "cognometecnico",
      "ruolo",
      "emailtecnico",
      "telefonotecnico",
    ],
  },
  clienti: {
    headers: {
      it: ["Nome", "Telefono", ""],
      en: ["Name", "Phone", ""],
    },
    keys: ["nomecliente", "telefonocliente"],
  },
  usercliente: {
    headers: {
      it: ["Nome", "Cognome", "Email", "Cliente", ""],
      en: ["Name", "Surname", "Email", "Client", ""],
    },
    keys: ["nomeucliente", "cognomeucliente", "emailucliente", "nomecliente"],
  },
  indirizzi: {
    headers: {
      it: [
        "Indirizzo",
        "Prefisso",
        "Nome",
        "Modello",
        "Data Inserimento",
        "Tipo",
        "VLAN",
        "",
      ],
      en: [
        "Address",
        "Prefix",
        "Name",
        "Brand",
        "Insert Date",
        "Type",
        "VLAN",
        "",
      ],
    },
    keys: [
      "ip",
      "n_prefisso",
      "nome_dispositivo",
      "brand_dispositivo",
      "data_inserimento",
      "tipo_dispositivo",
      "vid",
    ],
  },
  rete: {
    headers: {
      it: ["Indirizzo", "Prefisso", "Nome", "Descrizione", "VRF", "ID", ""],
      en: ["Address", "Prefix", "Name", "Description", "VRF", "ID", ""],
    },
    keys: [
      "iprete",
      "prefissorete",
      "nomerete",
      "descrizione",
      "vrf",
      "idrete",
    ],
  },
  // "aggregati": {
  //     headers: {
  //         it: [
  //             'Nome',
  //             'Descrizione',
  //             'ID',
  //             'Rete',
  //             ''
  //         ],
  //         en: [
  //             'Name',
  //             'Description',
  //             'ID',
  //             'Network',
  //             ''
  //         ]
  //     },
  //     keys: [
  //         'nomeaggregato',
  //         'descrizioneaggregato',
  //         'idaggregato',
  //         'idrete'
  //     ]
  // },
  aggregati: {
    headers: {
      it: ["Indirizzo", "Prefisso"],
      en: ["Address", "Prefix"],
    },
    keys: ["iprete", "prefisso"],
  },
  prefissi: {
    headers: {
      it: ["Prefisso", ""],
      en: ["Prefix", ""],
    },
    keys: ["prefissorete"],
  },
  vlan: {
    headers: {
      it: ["VID", "Nome", "Descrizione"],
      en: ["VID", "Name", "Description"],
    },
    keys: ["vid", "nomevlan", "descrizionevlan"],
  },
  vrf: {
    headers: {
      it: ["ID", "Nome", "Descrizione"],
      en: ["ID", "Name", "Description"],
    },
    keys: ["idvrf", "nomevrf", "descrizionevrf"],
  },
  intervalli: {
    headers: {
      it: ["Nome", "IP Iniziale", "IP Finale", "Lunghezza", "ID", "Rete"],
      en: ["Name", "Start IP", "End IP", "Length", "ID", "Network"],
    },
    keys: [
      "nomeintervallo",
      "iniziointervallo",
      "fineintervallo",
      "lunghezzaintervallo",
      "idintervallo",
      "idrete",
    ],
  },
};

export const DBTableMaps: { [key: string]: DBTableMap } = {
  tecnici: {
    keys: [
      "nometecnico",
      "cognometecnico",
      "ruolo",
      "emailtecnico",
      "telefonotecnico",
      "pwdtecnico",
      "admin",
    ],
  },
  clienti: {
    keys: ["nomecliente"],
  },
  usercliente: {
    keys: [
      "iducliente",
      "nomeucliente",
      "cognomeucliente",
      "emailucliente",
      "pwducliente",
      "nomecliente",
    ],
  },
  indirizzi: {
    keys: [
      "ip",
      "nome_dispositivo",
      "brand_dispositivo",
      "data_inserimento",
      "tipo_dispositivo",
      "n_prefisso",
      "vid",
    ],
  },
  rete: {
    keys: ["iprete", "nomerete", "descrizione", "vrf", "idrete"],
  },
  aggregati: {
    keys: ["nomeaggregato", "descrizioneaggregato", "idaggregato", "idrete"],
  },
  prefissi: {
    keys: ["prefisso"],
  },
  vlan: {
    keys: ["vid", "nomevlan", "descrizionevlan"],
  },
  vrf: {
    keys: ["idvrf", "nomevrf", "descrizionevrf"],
  },
  intervalli: {
    keys: [
      "idintervallo",
      "nomeintervallo",
      "iniziointervallo",
      "lunghezzaintervallo",
      "fineintervallo",
      "idrete",
    ],
  },
};

export const CSVInfoDBTableMaps: { [key: string]: CSVInfoDBTableMaps } = {
  siti: {
    keys: ["nomesito", "citta", "paese", "datacenter", "tipologia"],
    example: ["Sito di prova", "Milano", "Italia", "true", "Active"],
  },
  network: {
    keys: ["nomerete", "descrizione", "iprete", "prefissorete", "nomesito", "citta", "paese"],
    example: ["rete di prova", "descrizione di prova", "192.168.1.0", "24", "Sito di prova", "Milano", "Italia"],
  },
  ip: {
    keys: ["nomerete", "ipretenetwork", "prefissoretenetwork", "ip", "n_prefisso", "tipo_dispositivo", "nome_dispositivo", "brand_dispositivo", "data_inserimento"],
    example: ["rete di prova", "192.168.1.0", "24", "192.168.1.1", "24", "Server", "Server1", "DELL", "2023-01-01"],
  },
  tecnici: {
    keys: [
      "nometecnico",
      "cognometecnico",
      "ruolo",
      "emailtecnico",
      "telefonotecnico (opzionale)",
      "pwdtecnico"
    ],
    example: [
      "Mario",
      "Rossi",
      "Tecnico",
      "mario.rossi@example.com",
      "1234567890",
      "Password123",
    ],
  },
  clienti: {
    keys: ["nomecliente", "telefonocliente"],
    example: ["Azienda Rossi", "1234567890"],
  },
  usercliente: {
    keys: ["nomeucliente", "cognomeucliente", "emailucliente", "pwducliente", "nomecliente"],
    example: ["Mario", "Rossi", "mario.rossi@example.com", "Password123", "Azienda Rossi"],
  },
  indirizzi: {
    keys: [
      "ip",
      "nome_dispositivo",
      "brand_dispositivo",
      "tipo_dispositivo",
      "n_prefisso",
      "vlan (opzionale)",
      "nome_vlan (opzionale)"
    ],
    example: [
      "192.1678.1.1",
      "Server1",
      "DELL",
      "Server",
      "24",
      "200",
      "VLAN 200"
    ],
  },
  rete: {
    keys: ["iprete", "nomerete", "descrizione", "prefissorete"],
    example: [
      "192.168.1.0",
      "rete di prova",
      "Descrizione di prova",
      "24",
    ],
  },
  aggregati: {
    keys: ["nomeaggregato", "descrizioneaggregato", "idaggregato", "idrete"],
  },
  prefissi: {
    keys: ["prefisso"],
  },
  vlan: {
    keys: ["vid", "nomevlan", "descrizionevlan"],
  },
  vrf: {
    keys: ["idvrf", "nomevrf", "descrizionevrf"],
  },
  intervalli: {
    keys: [
      "idintervallo",
      "nomeintervallo",
      "iniziointervallo",
      "lunghezzaintervallo",
      "fineintervallo",
      "idrete",
    ],
  },
};

export default TableMaps;