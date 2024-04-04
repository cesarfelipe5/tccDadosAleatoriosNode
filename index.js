import { fakerPT_BR as faker } from "@faker-js/faker";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";

// Configura o locale do faker para "pt_BR"
// faker.locale = "pt_BR";

const generateData = async (numRecords) => {
  const data = [];
  for (let i = 0; i < numRecords; i++) {
    data.push({
      nome_cliente: faker.person.fullName(),
      email: faker.internet.email(),
      nascimento: faker.date.birthdate(),
      cep: faker.location.zipCode(),
      logradouro: faker.location.streetAddress(),
      bairro: faker.location.county(),
      cidade: faker.location.city(),
      estado: faker.location.state(),
      pais: faker.location.country(),
    });
  }
  return data;
};

const saveDataToExcel = async (data, filename) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Dados");

  // Adiciona um cabeçalho
  sheet.columns = [
    { header: "Nome Cliente", key: "nome_cliente", width: 30 },
    { header: "Email", key: "email", width: 50 },
    { header: "Nascimento", key: "nascimento", width: 10 },
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
  const assetsPath = path.join(path.resolve(), "assets");
  if (!fs.existsSync(assetsPath)) {
    fs.mkdirSync(assetsPath, { recursive: true });
  }
  await workbook.xlsx.writeFile(path.join(assetsPath, filename));
  console.log(`Arquivo ${filename} salvo com sucesso.`);
};

// Lista de quantidades de registros desejadas
const sizes = [10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000];

const main = async () => {
  for (const size of sizes) {
    const data = await generateData(size);
    const filename = `random_data_${size}.xlsx`;
    await saveDataToExcel(data, filename);
  }
};

main();
