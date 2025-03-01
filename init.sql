
-- Creazione della tabella Tecnici
CREATE TABLE Tecnici (
    IDTecnico INTEGER NOT NULL,
    nomeTecnico VARCHAR(50) NOT NULL,
    cognomeTecnico VARCHAR(50) NOT NULL,
    emailTecnico VARCHAR(50) NOT NULL,
    telefonoTecnico VARCHAR(50),
    pwdTecnico VARCHAR(50) NOT NULL,
    "admin" BOOLEAN NOT NULL,
    PRIMARY KEY (IDTecnico)
);

CREATE TABLE Paesi(
    IDPaese VARCHAR(15) NOT NULL,
    nomePaese VARCHAR(50) NOT NULL,
    PRIMARY KEY (IDPaese)
);

CREATE TABLE Citta(
    IDCitta INTEGER GENERATED ALWAYS AS IDENTITY,
    nomeCitta VARCHAR(50) NOT NULL,
    IDPaese VARCHAR(15) NOT NULL,
    PRIMARY KEY (IDCitta),
    CONSTRAINT fk_idPaese_Citta FOREIGN KEY (IDPaese) REFERENCES Paesi(IDPaese)
);

CREATE TABLE Clienti(
    IDCliente INTEGER NOT NULL,
    nomeCliente VARCHAR(50) NOT NULL,
    PRIMARY KEY (IDCliente)
);

CREATE TABLE Siti(
    IDSito INTEGER NOT NULL,
    nomeSito VARCHAR(50) NOT NULL,
    IDCitta INTEGER NOT NULL,
    IDCliente INTEGER NOT NULL,
    PRIMARY KEY (IDSito),
    CONSTRAINT fk_idCitta FOREIGN KEY (IDCitta) REFERENCES Citta(IDCitta),
    CONSTRAINT fk_idPaese_Sito FOREIGN KEY (IDCliente) REFERENCES Clienti(IDCliente)
);

CREATE TABLE Cliente_Tecnico(
    IDCliente INTEGER NOT NULL,
    IDTecnico INTEGER NOT NULL,
    PRIMARY KEY (IDCliente,IDTecnico),
    CONSTRAINT fk_idCliente FOREIGN KEY (IDCliente) REFERENCES Clienti(IDCliente),
    CONSTRAINT fk_idTecnico FOREIGN KEY (IDTecnico) REFERENCES Tecnici(IDTecnico)
);

CREATE TABLE Rete(
    IDRete INTEGER NOT NULL,
    nomeRete VARCHAR(50) NOT NULL,
    descrizione VARCHAR(255),
    PRIMARY KEY (IDRete)
);

CREATE TABLE Siti_Rete(
    IDSito INTEGER NOT NULL,
    IDRete INTEGER NOT NULL,
    PRIMARY KEY (IDSito,IDRete),
    CONSTRAINT fk_idSito FOREIGN KEY (IDSito) REFERENCES Siti(IDSito),
    CONSTRAINT fk_idRete FOREIGN KEY (IDRete) REFERENCES Rete(IDRete)
);

CREATE TABLE VLAN(
    IDV INTEGER NOT NULL,
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