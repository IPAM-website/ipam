 CREATE TABLE Tecnici (
     IDTecnico SERIAL,
     nomeTecnico VARCHAR(50) NOT NULL,
     cognomeTecnico VARCHAR(50) NOT NULL,
     ruolo VARCHAR(50),
     emailTecnico VARCHAR(50) NOT NULL,
     telefonoTecnico VARCHAR(50),
     pwdTecnico VARCHAR(50) NOT NULL,
     "admin" BOOLEAN NOT NULL,
     FA VARCHAR(255),
     PRIMARY KEY (IDTecnico)
 );

INSERT INTO Tecnici(nomeTecnico,cognomeTecnico,ruolo,emailTecnico,telefonoTecnico,pwdTecnico,"admin") VALUES (
    'Luigi', 'Pirandello', 'Amministratore', 'admin@network.it', '3938216657', 'adminPass','true'
);

CREATE TABLE Paesi(
    IDPaese VARCHAR(15) NOT NULL,
    nomePaese VARCHAR(50) NOT NULL,
    PRIMARY KEY (IDPaese)
);

CREATE TABLE Citta(
    IDCitta SERIAL,
    nomeCitta VARCHAR(50) NOT NULL,
    IDPaese VARCHAR(15) NOT NULL,
    PRIMARY KEY (IDCitta),
    CONSTRAINT fk_idPaese_Citta FOREIGN KEY (IDPaese) REFERENCES Paesi(IDPaese)
);

CREATE TABLE Clienti(
    IDCliente SERIAL,
    nomeCliente VARCHAR(50) NOT NULL,
    mailcliente VARCHAR(50) NOT NULL,
    telefonoCliente VARCHAR(50),
    pwdcliente VARCHAR(50) NOT NULL,
    PRIMARY KEY (IDCliente)
);

CREATE TABLE Siti(
    IDSito SERIAL,
    nomeSito VARCHAR(50) NOT NULL,
    IDCitta INTEGER NOT NULL,
    datacenter BOOLEAN NOT NULL,
    tipologia VARCHAR(50) NOT NULL,
    PRIMARY KEY (IDSito),
    CONSTRAINT fk_idCitta FOREIGN KEY (IDCitta) REFERENCES Citta(IDCitta)
);

CREATE TABLE Cliente_Tecnico(
    IDCliente INTEGER NOT NULL,
    IDTecnico INTEGER NOT NULL,
    data_assegnazione VARCHAR(50) NOT NULL,
    PRIMARY KEY (IDCliente,IDTecnico),
    CONSTRAINT fk_idCliente FOREIGN KEY (IDCliente) REFERENCES Clienti(IDCliente),
    CONSTRAINT fk_idTecnico FOREIGN KEY (IDTecnico) REFERENCES Tecnici(IDTecnico)
);

CREATE TABLE Rete(
    IDRete SERIAL,
    nomeRete VARCHAR(50) NOT NULL,
    descrizione VARCHAR(255),

    Vrf INTEGER,
    PRIMARY KEY (IDRete)
);

CREATE TABLE Siti_Rete(
    IDSito INTEGER NOT NULL,
    IDRete INTEGER NOT NULL,
    PRIMARY KEY (IDSito,IDRete),
    CONSTRAINT fk_idSito FOREIGN KEY (IDSito) REFERENCES Siti(IDSito),
    CONSTRAINT fk_idRete_Siti FOREIGN KEY (IDRete) REFERENCES Rete(IDRete)
);

CREATE TABLE VLAN(
    IDV SERIAL,
    nomeVLAN VARCHAR(50) NOT NULL,
    descrizioneVLAN VARCHAR(255),
    PRIMARY KEY (IDV)
);

CREATE TABLE VRF(
    IDVrf SERIAL,
    nomeVrf VARCHAR(50) NOT NULL,
    descrizioneVRF VARCHAR(255),
    PRIMARY KEY (IDVrf)
);

CREATE TABLE Indirizzi(
    IP VARCHAR(15) NOT NULL,
    IDRete INTEGER NOT NULL,
    N_Prefisso INTEGER NOT NULL,

    tipo_dispositivo VARCHAR(20),
    nome_dispositivo VARCHAR(40),
    brand_dispositivo VARCHAR(20),
    data_inserimento DATE,

    IDV INTEGER,
    PRIMARY KEY (IP),
    CONSTRAINT fk_idRete FOREIGN KEY (IDRete) REFERENCES Rete(IDRete)
);



-- Inserimento Paesi
--  INSERT INTO Paesi (IDPaese, nomePaese) VALUES
--  ('IT', 'Italia'),
--  ('FR', 'Francia'),
--  ('DE', 'Germania');

-- INSERT INTO Citta (nomeCitta, IDPaese) VALUES
-- ('Roma', 'IT'),
-- ('Parigi', 'FR'),
-- ('Berlino', 'DE'),
-- ('Milano', 'IT'),
-- ('Lione', 'FR'),
-- ('Monaco', 'DE'),
-- ('Napoli', 'IT'),
-- ('Marsiglia', 'FR'),
-- ('Amburgo', 'DE'),
-- ('Torino', 'IT'),
-- ('Nizza', 'FR'),
-- ('Colonia', 'DE');

-- -- Inserimento Clienti
-- INSERT INTO Clienti (IDCliente, nomeCliente) VALUES
-- (1, 'Cliente A'),
-- (2, 'Cliente B'),
-- (3, 'Cliente C');


-- -- Inserimento Clienti
-- INSERT INTO Datacenter (idDC, nomeDC, IDCliente) VALUES
-- (1, 'Datacenter A', 3),
-- (2, 'Datacenter B', 2),
-- (3, 'Datacenter C', 1),
-- (4, 'Datacenter D', 1),
-- (5, 'Datacenter E', 1);

-- -- Inserimento Siti
-- INSERT INTO Siti (IDSito, nomeSito, IDCitta, idDC) VALUES
-- (101, 'Sede Centrale', 1, 1),
-- (102, 'Filiale Paris', 2, 2),
-- (103, 'HQ Berlin', 3, 3),
-- (104, 'Filiale Milano', 4, 1),
-- (105, 'Filiale Lione', 5, 2),
-- (106, 'Filiale Napoli', 7, 1),
-- (107, 'Filiale Marsiglia', 8, 2),
-- (108, 'Filiale Torino', 10, 1),
-- (109, 'Filiale Nizza', 11, 2),
-- (110, 'Filiale Colonia', 12, 3),
-- (111, 'Datacenter Milano', 4, 4),
-- (112, 'Datacenter Torino', 10, 5);

-- -- Inserimento Sotto-Siti
-- INSERT INTO Sotto_Siti (IDSottoSito, nomeSottoSito, IDSito) VALUES
-- (1001, 'Uffici Roma Nord', 101),
-- (1002, 'DataCenter Paris', 102),
-- (1003, 'Laboratorio Berlino', 103),
-- (1004, 'Magazzino Milano', 104),
-- (1005, 'Sede Operativa Lione', 105),
-- (1006, 'Centro Logistico Napoli', 106),
-- (1007, 'Filiale Marsiglia Est', 107),
-- (1008, 'Uffici Torino Centro', 108),
-- (1009, 'Sede Nizza Sud', 109),
-- (1010, 'Laboratorio Colonia', 110);

-- -- Inserimento Reti
-- INSERT INTO Rete (IDRete, nomeRete, descrizione) VALUES
-- (1, 'LAN', 'Rete locale uffici'),
-- (2, 'WAN', 'Rete geografica aziendale'),
-- (3, 'Stampanti 1','Rete stampanti primo piano');

-- -- Collegamento SottoSiti-Rete
-- INSERT INTO SottoSiti_Rete (IDSottoSito, IDRete) VALUES
-- (1001, 1),
-- (1001, 3),
-- (1002, 2),
-- (1003, 1),
-- (1003, 2),
-- (1004, 1),
-- (1005, 2),
-- (1006, 1),
-- (1007, 2),
-- (1008, 1),
-- (1009, 2),
-- (1010, 3);

-- -- Inserimento VLAN
-- INSERT INTO VLAN (IDV, nomeVLAN, descrizioneVLAN) VALUES
-- (1, 'Default'),
-- (10, 'VLAN_Uffici', 'Rete dedicata agli uffici'),
-- (20, 'VLAN_Server', 'Rete dedicata ai server'),
-- (30, 'VLAN_Uffici_Amministrazione', 'Rete dedicata agli uffici di amministrazione');

-- -- Inserimento Indirizzi IP
-- INSERT INTO Indirizzi (IP, IDRete, N_Prefisso, tipo_dispositivo, nome_dispositivo, brand_dispositivo, data_inserimento, IDV) VALUES
-- ('192.168.1.1', 1, 24, 'Gateway', 'Router Zona 2', 'TP-Link', '2021-03-01', 10),
-- ('10.0.0.5', 2, 16, 'Server', 'Main server 2', 'Cisco', '2022-05-09', 20),
-- ('10.10.1.10', 2, 8, 'Firewall', 'Firewall Interiore tra zona 5 e 6', 'Fortinet', '2024-09-28', 10),
-- ('192.168.2.1', 1, 24, 'Switch', 'Switch Uffici', 'Netgear', '2023-01-15', 10),
-- ('10.0.1.1', 2, 16, 'Router', 'Router Principale', 'Juniper', '2022-11-20', 20),
-- ('172.16.1.1', 3, 22, 'Access Point', 'AP Sala Riunioni', 'Ubiquiti', '2023-06-10', 30);

-- INSERT INTO Indirizzi (IP, IDRete, N_Prefisso, IDV) VALUES
-- ('172.16.0.10', 1, 22, 10);