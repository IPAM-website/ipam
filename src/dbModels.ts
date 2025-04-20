export interface IndirizziModel{
    ip: string;
    idrete: number;
    prefix : number;
    tipo_dispositivo: string;
    nome_dispositivo: string;
    brand_dispositivo: string;
    data_inserimento: Date;
    idv: number;
}

export interface ClienteModel{
    idcliente: number;
    nomecliente: string;
    telefonocliente: string;
}

export interface UtenteModel{
    idutente: number;
    mail: string;
    password: string;
    idcliente:  number;
}

export interface ReteModel{
    idrete: number;
    nomerete: string;
    descrizione: string;
    vrf: number;
    iprete: string;
    prefissorete: number;
    vid?: number;
    idretesup?: number;
}

export interface SiteModel{
    idsito : number;
    nomesito : string;
    idcitta : number;
    datacenter : boolean;
    tipologia : string;
}

export interface TecnicoModel {
    mail:string;
    admin:boolean;
    id: number;
}

export interface CittaModel{
    idcitta: number;
    nomecitta: string;
    idpaese: number;
}

export interface PaeseModel{
    idpaese: number;
    nomepaese: string;
}

export interface VRFModel{
    idvrf: number;
    nomevrf: string;
    descrizionevrf: string;
}

export interface VLANModel{
    idv: number;
    nomevlan: string;
    descrizionevlan: string;
}