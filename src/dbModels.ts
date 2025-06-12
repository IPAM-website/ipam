export interface IndirizziModel {
  ip: string;
  idrete: number;
  prefix: number;
  tipo_dispositivo: string;
  nome_dispositivo: string;
  brand_dispositivo: string;
  data_inserimento: Date;
  vid: number;
  change: string;
}

export interface ClienteModel {
  idcliente: number;
  nomecliente: string;
  telefonocliente: string;
}

export interface UtenteModel {
  idutente: number;
  mail: string;
  password: string;
  idcliente: number;
}

export interface ReteModel {
  idrete: number;
  nomerete: string;
  descrizione: string;
  vrf: number;
  iprete: string;
  prefissorete: number;
  vid?: number;
  idretesup?: number;
}

export interface SiteModel {
  idsito: number;
  nomesito: string;
  idcitta: number;
  datacenter: boolean;
  tipologia: string;
}

export interface TecnicoModel {
  mail: string;
  admin: boolean;
  id: number;
}

export interface CittaModel {
  idcitta: number;
  nomecitta: string;
  idpaese: number;
}

export interface PaeseModel {
  idpaese: number;
  nomepaese: string;
}

export interface VRFModel {
  idvrf: number;
  nomevrf: string;
  descrizionevrf: string;
}

export interface VLANModel {
  vid: number;
  nomevlan: string;
  descrizionevlan: string;
  vxlan: number;
}

export interface AggregatoModel {
  idaggregato: number;
  nomeaggregato: string;
  descrizioneaggregato: string;
  idrete: number;
}

export interface IntervalloModel {
  idintervallo: number;
  nomeintervallo: string;
  iniziointervallo: string;
  lunghezzaintervallo: number;
  fineintervallo: string;
  idrete: number;
  descrizioneintervallo: string;
}
