interface TableMap {
    headers: LanguageMap;
    keys: string[];
}

export type DBTableMap = {
    keys: string[]
};

interface LanguageMap {
    it: string[];
    en: string[];
    [key: string]: string[];
}

const TableMaps: { [key: string]: TableMap } = {
    "tecnici": {
        headers: {
            it: [
                "ID",
                "Nome",
                "Cognome",
                "Ruolo",
                ""
            ],
            en: [
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
            it: [
                "ID",
                "Nome",
                ""
            ],
            en: [
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
    "cliente_tecnico": {
        headers: {
            it:[
                "Data Assegnazione",
                "Nome Tecnico",
                "Nome Cliente",
                ""
            ],
            en:[               
                "Assignment Date",
                "Technician Name",
                "Client name",
                ""
            ]
        },
        keys: [            
            "data_assegnazione",
            "nometecnico",
            "nomecliente"
        ]
    },
    "indirizzi": {
        headers: {
            it: [
                "Indirizzo",
                "Nome",
                "Modello",
                "Data Inserimento",
                "Tipo",
                "Prefisso",
                "VLAN",
                ""
            ],
            en: [
                "Address",
                "Name",
                "Brand",
                "Insert Date",
                "Type",
                "Prefix",
                "VLAN",
                ""
            ]
        },
        keys: [
            "ip",
            "nome_dispositivo",
            "brand_dispositivo",
            "data_inserimento",
            "tipo_dispositivo",
            "n_prefisso",
            "idv"
        ]
    },
    "rete":{
        headers: {
            it:[
                "Nome",
                "Indirizzo",
                "Prefisso",
                "Descrizione",
                "VRF",
                "ID",
                ""
            ],
            en:[
                "Name",
                "Address",
                "Prefix",
                "Description",
                "VRF",
                "ID",
                ""
            ]
        },
        keys: [
            'nomerete',
            'iprete',
            'prefissorete',
            'descrizione',
            'vrf',
            'idrete'
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
    },
    "indirizzi": {
        keys: [ "ip", "nome_dispositivo", "brand_dispositivo", "data_inserimento", "tipo_dispositivo", "n_prefisso", "idv" ]
    },
    "rete":{
        keys: ['iprete','nomerete','descrizione','vrf','idrete']
    }
};


export default TableMaps