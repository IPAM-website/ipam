CREATE TABLE Tecnici (
     IDTecnico SERIAL,
     nomeTecnico VARCHAR(50) NOT NULL,
     cognomeTecnico VARCHAR(50) NOT NULL,
     ruolo VARCHAR(50),
     emailTecnico VARCHAR(50) NOT NULL,
     telefonoTecnico VARCHAR(50),
     pwdTecnico VARCHAR(100) NOT NULL,
     "admin" BOOLEAN NOT NULL,
     FA VARCHAR(255),
     PRIMARY KEY (IDTecnico)
 );

INSERT INTO Tecnici(nomeTecnico,cognomeTecnico,ruolo,emailTecnico,telefonoTecnico,pwdTecnico,"admin") VALUES (
    'Admin', 'Admin', 'Amministratore', 'admin@network.it', '3938216657', '$2b$12$k0cWvUlLTqS7OsAW506ILuaj/wdJNoT6IDtKMEuXP8tFjxzzaVKTe','true'
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
    telefonoCliente VARCHAR(50),
    PRIMARY KEY (IDCliente)
);

CREATE TABLE UserCliente (
     IDUCliente SERIAL,
     nomeUCliente VARCHAR(50) NOT NULL,
     cognomeUCliente VARCHAR(50) NOT NULL,
     emailUCliente VARCHAR(50) NOT NULL,
     pwdUCliente VARCHAR(100) NOT NULL,
     FA VARCHAR(255),
     IDCliente INTEGER,
     PRIMARY KEY (IDUCliente),
     CONSTRAINT fk_idCliente_UserCliente FOREIGN KEY (IDCliente) REFERENCES Clienti(IDCliente)
 );

CREATE TABLE Siti(
    IDSito SERIAL,
    nomeSito VARCHAR(50) NOT NULL,
    IDCitta INTEGER NOT NULL,
    datacenter BOOLEAN NOT NULL,
    tipologia VARCHAR(50) NOT NULL,
    IDCliente INTEGER NOT NULL,
    PRIMARY KEY (IDSito),
    CONSTRAINT fk_idCitta FOREIGN KEY (IDCitta) REFERENCES Citta(IDCitta),
    CONSTRAINT fk_idCliente_Sito FOREIGN KEY (IDCliente) REFERENCES Clienti(IDCliente)
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
    IPrete VARCHAR(15) NOT NULL,
    prefissorete INTEGER NOT NULL,
    idretesup INTEGER,

    vid INTEGER,
    vrf INTEGER,
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

INSERT INTO vrf (nomevrf,descrizionevrf) VALUES ('default','default virtual routing table');
INSERT INTO vlan (nomevlan,descrizionevlan) VALUES ('default','global VLAN');

INSERT INTO
    paesi (idpaese, nomepaese)
VALUES
    (1, 'Åland Islands'),
    (2, 'Albania'),
    (3, 'Algeria'),
    (4, 'American Samoa'),
    (5, 'Andorra'),
    (6, 'Anguilla'),
    (7, 'Antigua and Barbuda'),
    (8, 'Argentina'),
    (9, 'Armenia'),
    (10, 'Aruba'),
    (11, 'Australia'),
    (12, 'Austria'),
    (13, 'Azerbaijan'),
    (14, 'Bahamas'),
    (15, 'Bahrain'),
    (16, 'Bangladesh'),
    (17, 'Barbados'),
    (18, 'Belarus'),
    (19, 'Belgium'),
    (20, 'Bermuda'),
    (21, 'Bhutan'),
    (22, 'Bolivia'),
    (23, 'Bosnia and Herzegovina'),
    (24, 'Botswana'),
    (25, 'Brazil'),
    (26, 'British Virgin Islands'),
    (27, 'Brunei Darussalam'),
    (28, 'Bulgaria'),
    (29, 'Burkina Faso'),
    (30, 'Burundi'),
    (31, 'Cabo Verde'),
    (32, 'Cameroon'),
    (33, 'Canada'),
    (34, 'Cayman Islands'),
    (35, 'Central African Republic'),
    (36, 'Chad'),
    (37, 'Chile'),
    (38, 'China'),
    (39, 'China, Hong Kong SAR'),
    (40, 'China, Macao SAR'),
    (41, 'Colombia'),
    (42, 'Comoros'),
    (43, 'Congo'),
    (44, 'Cook Islands'),
    (45, 'Costa Rica'),
    (46, 'Côte Ivoire'),
    (47, 'Croatia'),
    (48, 'Cuba'),
    (49, 'Czech Republic'),
    (50, 'Democratic Peoples Republic of Korea'),
    (51, 'Denmark'),
    (52, 'Dominica'),
    (53, 'Dominican Republic'),
    (54, 'Ecuador'),
    (55, 'Egypt'),
    (56, 'El Salvador'),
    (57, 'Equatorial Guinea'),
    (58, 'Eritrea'),
    (59, 'Estonia'),
    (60, 'Faeroe Islands'),
    (61, 'Falkland Islands'),
    (62, 'Fiji'),
    (63, 'Finland'),
    (64, 'France'),
    (65, 'French Guiana'),
    (66, 'French Polynesia'),
    (67, 'Gabon'),
    (68, 'Gambia'),
    (69, 'Georgia'),
    (70, 'Germany'),
    (71, 'Ghana'),
    (72, 'Gibraltar'),
    (73, 'Greece'),
    (74, 'Greenland'),
    (75, 'Grenada'),
    (76, 'Guadeloupe'),
    (77, 'Guam'),
    (78, 'Guatemala'),
    (79, 'Guernsey'),
    (80, 'Guinea'),
    (81, 'Guinea-Bissau'),
    (82, 'Guyana'),
    (83, 'Holy See'),
    (84, 'Honduras'),
    (85, 'Hungary'),
    (86, 'Iceland'),
    (87, 'India'),
    (88, 'Indonesia'),
    (89, 'Iran'),
    (90, 'Iraq'),
    (91, 'Ireland'),
    (92, 'Isle of Man'),
    (93, 'Israel'),
    (94, 'Italy'),
    (95, 'Jamaica'),
    (96, 'Japan'),
    (97, 'Jersey'),
    (98, 'Jordan'),
    (99, 'Kazakhstan'),
    (100, 'Kenya'),
    (101, 'Kiribati'),
    (102, 'Kuwait'),
    (103, 'Kyrgyzstan'),
    (104, 'Lao Peoples Democratic Republic'),
    (105, 'Latvia'),
    (106, 'Lebanon'),
    (107, 'Lesotho'),
    (108, 'Liberia'),
    (109, 'Liechtenstein'),
    (110, 'Lithuania'),
    (111, 'Luxembourg'),
    (112, 'Madagascar'),
    (113, 'Malawi'),
    (114, 'Malaysia'),
    (115, 'Maldives'),
    (116, 'Malta'),
    (117, 'Marshall Islands'),
    (118, 'Martinique'),
    (119, 'Mauritania'),
    (120, 'Mauritius'),
    (121, 'Mexico'),
    (122, 'Micronesia'),
    (123, 'Monaco'),
    (124, 'Mongolia'),
    (125, 'Montenegro'),
    (126, 'Montserrat'),
    (127, 'Mozambique'),
    (128, 'Myanmar'),
    (129, 'Namibia'),
    (130, 'Nauru'),
    (131, 'Nepal'),
    (132, 'Netherlands'),
    (133, 'New Caledonia'),
    (134, 'New Zealand'),
    (135, 'Nicaragua'),
    (136, 'Niger'),
    (137, 'Nigeria'),
    (138, 'Niue'),
    (139, 'Northern Mariana Islands'),
    (140, 'Norway'),
    (141, 'Oman'),
    (142, 'Pakistan'),
    (143, 'Palau'),
    (144, 'Papua New Guinea'),
    (145, 'Paraguay'),
    (146, 'Peru'),
    (147, 'Philippines'),
    (148, 'Pitcairn'),
    (149, 'Poland'),
    (150, 'Portugal'),
    (151, 'Puerto Rico'),
    (152, 'Qatar'),
    (153, 'Republic of Korea'),
    (154, 'Republic of Moldova'),
    (155, 'Republic of South Sudan'),
    (156, 'Réunion'),
    (157, 'Romania'),
    (158, 'Russian Federation'),
    (159, 'Rwanda'),
    (160, 'Saint Helena ex. dep.'),
    (161, 'Saint Kitts and Nevis'),
    (162, 'Saint Lucia'),
    (163, 'Saint Pierre and Miquelon'),
    (164, 'Saint Vincent and the Grenadines'),
    (165, 'Samoa'),
    (166, 'San Marino'),
    (167, 'Sao Tome and Principe'),
    (168, 'Saudi Arabia'),
    (169, 'Senegal'),
    (170, 'Serbia'),
    (171, 'Seychelles'),
    (172, 'Sierra Leone'),
    (173, 'Singapore'),
    (174, 'Slovakia'),
    (175, 'Slovenia'),
    (176, 'Solomon Islands'),
    (177, 'South Africa'),
    (178, 'Spain'),
    (179, 'Sri Lanka'),
    (180, 'State of Palestine'),
    (181, 'Suriname'),
    (182, 'Swaziland'),
    (183, 'Sweden'),
    (184, 'Switzerland'),
    (185, 'Tajikistan'),
    (186, 'TFYR of Macedonia'),
    (187, 'Thailand'),
    (188, 'Timor-Leste'),
    (189, 'Tonga'),
    (190, 'Trinidad and Tobago'),
    (191, 'Turkey'),
    (192, 'Turkmenistan'),
    (193, 'Turks and Caicos Islands'),
    (194, 'Tuvalu'),
    (195, 'Uganda'),
    (196, 'Ukraine'),
    (197, 'United Kingdom'),
    (198, 'Tanzania'),
    (199, 'United States of America'),
    (200, 'United States Virgin Islands'),
    (201, 'Uruguay'),
    (202, 'Uzbekistan'),
    (203, 'Vanuatu'),
    (204, 'Venezuela'),
    (205, 'Wallis and Futuna Islands'),
    (206, 'Yemen'),
    (207, 'Zambia'),
    (208, 'Zimbabwe');
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

-- Sample data for additional Clienti
INSERT INTO Clienti(IDCliente,nomeCliente,telefonocliente) VALUES
    (2,'Azienda Bianchi','0698765432'),
    (3,'Azienda Verdi','0623456789');

-- Sample data for additional UserCliente
INSERT INTO UserCliente(nomeUCliente,cognomeUCliente,emailUCliente,pwdUCliente,IDCliente) VALUES
    ('Giulia','Bianchi','giulia.bianchi@azienda.it','Pass1234',2),
    ('Luca','Neri','luca.neri@azienda.it','$2y$12$qF5Omkq1PIk269/GZKpk3eFjvVoq9k1e.rAGEv4rLoa.asVhL9MzO',2),
    ('Francesca','Verdi','francesca.verdi@azienda.it','Pwd7890',3);

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