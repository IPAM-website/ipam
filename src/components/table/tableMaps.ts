interface TableMap {
    headers: LanguageMap;
    keys: string[];
}

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
    }
}

export default TableMaps;