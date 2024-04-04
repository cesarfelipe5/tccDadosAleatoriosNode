const faker = require("faker");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

// Configura o locale do faker para "pt_BR"
faker.locale = "pt_BR";

async function generateData(numRecords) {
  const data = [];
  for (let i = 0; i < numRecords; i++) {
    data.push({
      nome_cliente: faker.name.findName(),
      cpf: faker.br.cpf(),
      cep: faker.address.zipCode(),
      logradouro: faker.address.streetAddress(),
      bairro: faker.address.county(),
      cidade: faker.address.city(),
      estado: faker.address.stateAbbr(),
      pais: "Brasil",
    });
  }
  return data;
}

async function saveDataToExcel(data, filename) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Dados");

  // Adiciona um cabeçalho
  sheet.columns = [
    { header: "Nome Cliente", key: "nome_cliente", width: 30 },
    { header: "CPF", key: "cpf", width: 20 },
    { header: "CEP", key: "cep", width: 15 },
    { header: "Logradouro", key: "logradouro", width: 30 },
    { header: "Bairro", key: "bairro", width: 25 },
    { header: "Cidade", key: "cidade", width: 25 },
    { header: "Estado", key: "estado", width: 10 },
    { header: "País", key: "pais", width: 10 },
  ];

  // Adiciona os dados
  sheet.addRows(data);

  // Salva o arquivo
  const assetsPath = path.join(__dirname, "assets");
  if (!fs.existsSync(assetsPath)) {
    fs.mkdirSync(assetsPath, { recursive: true });
  }
  await workbook.xlsx.writeFile(path.join(assetsPath, filename));
  console.log(`Arquivo ${filename} salvo com sucesso.`);
}

// Lista de quantidades de registros desejadas
const sizes = [10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000];

(async () => {
  for (const size of sizes) {
    const data = await generateData(size);
    const filename = `random_data_${size}.xlsx`;
    await saveDataToExcel(data, filename);
  }
})();
