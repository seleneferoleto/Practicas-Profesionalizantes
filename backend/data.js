// data.js — datos iniciales que carga init.js la primera vez

const SEDES = [
  { nombre: "Sede Ballester", direccion: "Vicente Lopez 2996", telefono: "(011) 4738 0400" },
  { nombre: "Sede Chilavert", direccion: "Lacroze 6115", telefono: "(011) 4589 8733" },
];

const ESPECIALISTAS = [
  { nombre: "Jorge Feldman", especialidad: "Clínica general y fitoterapia", sede: "Sede Ballester" },
  { nombre: "Sandra Gomez", especialidad: "Clínica general y acupuntura", sede: "Sede Chilavert" },
];

// [nombre, precio, categoría, imagen]
const PRODUCTOS = [
  ["Suero fisiológico ocular", 1500, "farmacia", "Fotos/Productos/Farmacia/SueroFisiologicoOcular.jpg"],
  ["Vendas elásticas x3", 1900, "farmacia", "Fotos/Productos/Farmacia/VandasElasticas.webp"],
  ["Colirio para ojos", 2200, "farmacia", "Fotos/Productos/Farmacia/ColirioOjos.jpg"],
  ["Antiparasitario interno x2", 2800, "farmacia", "Fotos/Productos/Farmacia/AntiparasitarioInterno.jpg"],
  ["Comprimidos antipulgas x4", 3200, "farmacia", "Fotos/Productos/Farmacia/ComprimidosAntipulgas.jpg"],
  ["Jarabe digestivo", 3700, "farmacia", "Fotos/Productos/Farmacia/JarabeDigestivo.jpg"],
  ["Vitaminas multivitamínicas", 4500, "farmacia", "Fotos/Productos/Farmacia/VitaminasMultivitaminicas.jpg"],
  ["Repelente de pulgas y garrapatas", 5200, "farmacia", "Fotos/Productos/Farmacia/RepelentePulgasGarrapatas.jpg"],
  ["Suplemento articular", 8900, "farmacia", "Fotos/Productos/Farmacia/SuplementoArticular.jpg"],
  ["Botiquín de primeros auxilios", 12500, "farmacia", "Fotos/Productos/Farmacia/BotiquinPrimerosAuxilios.jpg"],
  ["Alimento húmedo lata", 1800, "alimentos", "Fotos/Productos/Alimentos/RoyalCaninKitten.jpg"],
  ["Premios de entrenamiento", 2100, "alimentos", "Fotos/Productos/Alimentos/PremiosEntrenamiento.jpg"],
  ["Snack dental x6", 2500, "alimentos", "Fotos/Productos/Alimentos/SnackDental.jpg"],
  ["Snacks naturales de pollo", 3300, "alimentos", "Fotos/Productos/Alimentos/SnacksPollo.jpg"],
  ["Alimento para gatos 1,5kg", 7500, "alimentos", "Fotos/Productos/Alimentos/AlimentoGatos.jpg"],
  ["Alimento balanceado adulto 3kg", 9500, "alimentos", "Fotos/Productos/Alimentos/AlimentoAdulto.jpg"],
  ["Alimento balanceado cachorro 3kg", 9800, "alimentos", "Fotos/Productos/Alimentos/AlimentoCachorro.jpg"],
  ["Alimento senior 3kg", 10200, "alimentos", "Fotos/Productos/Alimentos/AlimentoSenior.jpg"],
  ["Alimento hipoalergénico 3kg", 18500, "alimentos", "Fotos/Productos/Alimentos/AlimentoHipoalergenico.jpg"],
  ["Alimento balanceado premium 7,5kg", 22000, "alimentos", "Fotos/Productos/Alimentos/AlimentoPremium.jpg"],
  ["Ratón de peluche para gatos", 1200, "juguetes", "Fotos/Productos/Juguetes/RatonGatos.png"],
  ["Pelota de goma", 1900, "juguetes", "Fotos/Productos/Juguetes/PelotaDeGoma.jpeg"],
  ["Mordillo de cuerda", 2300, "juguetes", "Fotos/Productos/Juguetes/MordilloCuerda.jpg"],
  ["Peluche con sonido", 2600, "juguetes", "Fotos/Productos/Juguetes/PelucheSonido.jpg"],
  ["Hueso de nylon", 2900, "juguetes", "Fotos/Productos/Juguetes/HuesoNylon.jpg"],
  ["Frisbee resistente", 3800, "juguetes", "Fotos/Productos/Juguetes/FrisbeeResistente.jpg"],
  ["Juguete interactivo dispensador", 6500, "juguetes", "Fotos/Productos/Juguetes/JugueteInteractivo.jpg"],
  ["Kit de juguetes surtidos x5", 7900, "juguetes", "Fotos/Productos/Juguetes/KitJuguetes.jpg"],
  ["Túnel plegable para gatos", 8200, "juguetes", "Fotos/Productos/Juguetes/TunelPlegable.jpg"],
  ["Rascador para gatos", 11000, "juguetes", "Fotos/Productos/Juguetes/RascadorGatos.jpg"],
  ["Toallitas húmedas x40", 2400, "higiene", "Fotos/Productos/Higiene/ToallitasHumedas.webp"],
  ["Cortauñas", 2700, "higiene", "Fotos/Productos/Higiene/Cortauñas.webp"],
  ["Shampoo pulgicida 250ml", 3100, "higiene", "Fotos/Productos/Higiene/ShampooPulgicida.jpg"],
  ["Perfume para mascotas", 3500, "higiene", "Fotos/Productos/Higiene/PerfumeMascotas.webp"],
  ["Cepillo removedor de pelo", 3900, "higiene", "Fotos/Productos/Higiene/CepilloRemovedor.webp"],
  ["Shampoo antipulgas 300ml", 4200, "higiene", "Fotos/Productos/Higiene/ShampooAntipulgas.webp"],
  ["Pañales descartables x10", 4800, "higiene", "Fotos/Productos/Higiene/PanalesDescartables.webp"],
  ["Kit de higiene dental", 5600, "higiene", "Fotos/Productos/Higiene/KitHigieneDental.webp"],
  ["Toallas absorbentes reutilizables", 6100, "higiene", "Fotos/Productos/Higiene/ToallasAbsorbentes.webp"],
  ["Set de aseo completo", 13400, "higiene", "Fotos/set_aseo_completo.jpg"],
];

module.exports = { SEDES, ESPECIALISTAS, PRODUCTOS };
