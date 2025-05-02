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
                "Nome",
                "Cognome",
                "Ruolo",
                "Email",
                "Telefono",
                ""
            ],
            en: [
                "Name",
                "Surname",
                "Role",
                "Email",
                "Phone",
                ""
            ]
        },
        keys: [
            "nometecnico",
            "cognometecnico",
            "ruolo",
            "emailtecnico",
            "telefonotecnico",
        ]
    },
    "clienti": {
        headers: {
            it: [
                "Nome",
                "Telefono",
                ""
            ],
            en: [
                "Name",
                "Phone",
                ""
            ]
        },
        keys: [
            "nomecliente",
            "telefonocliente"
        ]
    },
    "usercliente": {
        headers: {
            it:[
                "Nome",
                "Cognome",
                "Email",
                "Cliente",
                ""
            ],
            en:[          
                "Name",
                "Surname",
                "Email",
                "Client",
                ""
            ]
        },
        keys: [
            "nomeucliente",
            "cognomeucliente",
            "emailucliente",
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
    "usercliente": {
        keys: ["iducliente", "nomeucliente", "cognomeucliente", "emailucliente", "pwducliente", "nomecliente"]
    },
    "indirizzi": {
        keys: [ "ip", "nome_dispositivo", "brand_dispositivo", "data_inserimento", "tipo_dispositivo", "n_prefisso", "idv" ]
    },
    "rete":{
        keys: ['iprete','nomerete','descrizione','vrf','idrete']
    }
};


export default TableMaps