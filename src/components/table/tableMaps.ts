interface TableMap {
    headers: LanguageMap;
    keys: string[];
}

export type DBTableMap = {
    keys: string[]
  };

interface LanguageMap{
    it: string[];
    en: string[];
    [key: string]: string[];
}

const LanguageMapTecnici: { [key: string]: LanguageMap } = {
    "headers":{
        it:[
            "ID",
            "Nome",
            "Cognome",
            "Ruolo",
            ""
        ],
        en:[
            "ID",
            "Name",
            "Surname",
            "Role",
            ""
        ]
    }
}

const TableMaps: { [key: string]: TableMap } = {
    "tecnici": {
        headers: {
            it:[
                "ID",
                "Nome",
                "Cognome",
                "Ruolo",
                ""
            ],
            en:[
                "ID",
                "Name",
                "Surname",
                "Role",
                ""
            ]                      
        },
        keys: [
            "idtecnico",
            "nometecnico",
            "cognometecnico",
            "ruolo"
        ]
    },
    "clienti": {
        headers: {
            it:[
                "ID",
                "Nome",
                ""
            ],
            en:[
                "ID",
                "Name",
                ""
            ]                               
        },
        keys: [
            "idcliente",
            "nomecliente"
        ]
    },
    "cliente_tecnico":{
        headers: {
            it:[
                "Nome Cliente",
                "Nome Tecnico",
                ""
            ],
            en:[
                "Client name",
                "Technician Name",
                ""
            ]                      
        },
        keys: [
            "idtecnico",
            "idcliente"
        ]
    },
    "indirizzi":{
        headers:{
            it:[
                "Indirizzo",
                "Prefisso",
                "VLAN",
                ""
            ],
            en:[
                "Address",
                "Prefix",
                "VLAN",
                ""
            ]
        },
        keys:[
            "ip",
            "n_prefisso",
            "idv"
        ]
    }
}

export const DBTableMaps: { [key: string]: DBTableMap } = {
    "tecnici": {
      keys: ['nometecnico', 'cognometecnico', 'ruolo', 'emailtecnico', 'telefonotecnico', 'pwdtecnico', 'admin']
    },
    "clienti": {
      keys: ["nomecliente"]
    },
    "cliente_tecnico": {
      keys: ["idcliente", "idtecnico"]
    }
  };


export default TableMaps