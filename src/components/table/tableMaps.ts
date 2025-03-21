interface TableMap {
    headers: string[];
    keys: string[];
}

const TableMaps: { [key: string]: TableMap } = {
    "tecnici": {
        headers: [
            "ID",
            "Nome",
            "Cognome",
            "Ruolo"                                                      
        ],
        keys: [
            "idtecnico",
            "nometecnico",
            "cognometecnico",
            "ruolo"
        ]
    }
}

export default TableMaps;

// Esempio di utilizzo di .map al di fuori dell'oggetto TableMaps
//const headers = TableMaps["tecnici"].headers.map(header => header.toUpperCase());
//console.log(headers);