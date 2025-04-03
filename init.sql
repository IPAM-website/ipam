-- SQLBook: Code
-- Creazione della tabella Tecnici
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

-- Inserimento Tecnici
INSERT INTO Tecnici (nomeTecnico, cognomeTecnico, ruolo, emailTecnico, telefonoTecnico, pwdTecnico, "admin") VALUES
('Mario', 'Rossi', 'Firewall', 'mario.rossi@email.com', '333-1234567', 'tech123', 'FALSE'),
('Luca', 'Bianchi', 'PM', 'luca.bianchi@email.com', NULL, 'securePass', 'FALSE'),
('Admin', 'Super', 'admin', 'admin@network.it', '339-9876543', 'adminPass', 'TRUE');

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
    PRIMARY KEY (IDCliente)
);

CREATE TABLE Siti(
    IDSito SERIAL,
    nomeSito VARCHAR(50) NOT NULL,
    IDCitta INTEGER NOT NULL,
    IDCliente INTEGER NOT NULL,
    PRIMARY KEY (IDSito),
    CONSTRAINT fk_idCitta FOREIGN KEY (IDCitta) REFERENCES Citta(IDCitta),
    CONSTRAINT fk_idPaese_Sito FOREIGN KEY (IDCliente) REFERENCES Clienti(IDCliente)
);

CREATE TABLE Sotto_Siti(
    IDSottoSito SERIAL,
    nomeSottoSito VARCHAR(50) NOT NULL,
    IDSito INTEGER NOT NULL,
    PRIMARY KEY (IDSottoSito),
    CONSTRAINT fk_idSito FOREIGN KEY (IDSito) REFERENCES Siti(IDSito)
);

CREATE TABLE Cliente_Tecnico(
    IDCliente INTEGER NOT NULL,
    IDTecnico INTEGER NOT NULL,
    PRIMARY KEY (IDCliente,IDTecnico),
    CONSTRAINT fk_idCliente FOREIGN KEY (IDCliente) REFERENCES Clienti(IDCliente),
    CONSTRAINT fk_idTecnico FOREIGN KEY (IDTecnico) REFERENCES Tecnici(IDTecnico)
);

CREATE TABLE Rete(
    IDRete SERIAL,
    nomeRete VARCHAR(50) NOT NULL,
    descrizione VARCHAR(255),
    PRIMARY KEY (IDRete)
);

CREATE TABLE SottoSiti_Rete(
    IDSottoSito SERIAL,
    IDRete INTEGER NOT NULL,
    PRIMARY KEY (IDSottoSito,IDRete),
    CONSTRAINT fk_idSottoSito_Rete FOREIGN KEY (IDSottoSito) REFERENCES Sotto_Siti(IDSottoSito),
    CONSTRAINT fk_idRete FOREIGN KEY (IDRete) REFERENCES Rete(IDRete)
);

CREATE TABLE VLAN(
    IDV SERIAL,
    nomeVLAN VARCHAR(50) NOT NULL,
    descrizione VARCHAR(255),
    PRIMARY KEY (IDV)
);

CREATE TABLE Indirizzi(
    IP VARCHAR(15) NOT NULL,
    IDRete INTEGER NOT NULL,
    N_Prefisso INTEGER NOT NULL,
    IDV INTEGER NOT NULL,
    PRIMARY KEY (IP),
    CONSTRAINT fk_idRete FOREIGN KEY (IDRete) REFERENCES Rete(IDRete),
    CONSTRAINT fk_idVLAN FOREIGN KEY (IDV) REFERENCES VLAN(IDV)
);

-- Inserimento Paesi
--INSERT INTO Paesi (IDPaese, nomePaese) VALUES
--('IT', 'Italia'),
--('FR', 'Francia'),
--('DE', 'Germania');

-- Inserimento Città (ID auto-generato)
--INSERT INTO Citta (nomeCitta, IDPaese) VALUES
--('Roma', 'IT'),
--('Parigi', 'FR'),
--('Berlino', 'DE');

-- Inserimento Clienti
--INSERT INTO Clienti (IDCliente, nomeCliente) VALUES
--(1, 'Cliente A'),
--(2, 'Cliente B'),
--(3, 'Cliente C');

-- Inserimento Siti
--INSERT INTO Siti (IDSito, nomeSito, IDCitta, IDCliente) VALUES
--(101, 'Sede Centrale', 1, 1),
--(102, 'Filiale Paris', 2, 2),
--(103, 'HQ Berlin', 3, 3);

-- Inserimento Sotto-Siti
--INSERT INTO Sotto_Siti (IDSottoSito, nomeSottoSito, IDSito) VALUES
--(1001, 'Uffici Roma Nord', 101),
--(1002, 'DataCenter Paris', 102),
--(1003, 'Laboratorio Berlino', 103);

-- Collegamento Clienti-Tecnici
--INSERT INTO Cliente_Tecnico VALUES
--(1, 1),
--(2, 1),
--(3, 2),
--(1, 3);

-- Inserimento Reti
--INSERT INTO Rete (IDRete, nomeRete, descrizione) VALUES
--(1, 'LAN', 'Rete locale uffici'),
--(2, 'WAN', 'Rete geografica aziendale');

-- Collegamento SottoSiti-Rete
--INSERT INTO SottoSiti_Rete (IDSottoSito, IDRete) VALUES
--(1001, 1),
--(1002, 2),
--(1003, 1),
--(1003, 2);

-- Inserimento VLAN
--INSERT INTO VLAN (IDV, nomeVLAN, descrizione) VALUES
--(10, 'VLAN_Uffici', 'Rete dedicata agli uffici'),
--(20, 'VLAN_Server', 'Rete dedicata ai server');

-- Inserimento Indirizzi IP
--INSERT INTO Indirizzi (IP, IDRete, N_Prefisso, IDV) VALUES
--('192.168.1.1', 1, 24, 10),
--('10.0.0.5', 2, 16, 20),
--('172.16.0.10', 1, 22, 10);