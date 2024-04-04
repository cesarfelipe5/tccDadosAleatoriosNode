import { faker } from "@faker-js/faker";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Criar __dirname com base em import.meta.url
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const generateData = async (numRecords) => {
  const data = [];
  for (let i = 0; i < numRecords; i++) {
    data.push({
      nome_cliente: faker.person.fullName(),
      email: faker.internet.email(),
      nascimento: faker.date
        .birthdate({ min: 18, max: 65, mode: "age" })
        .toISOString()
        .split("T")[0],
      cep: faker.location.zipCode(),
      logradouro: faker.location.streetAddress(),
      bairro: faker.location.secondaryAddress(),
      cidade: faker.location.city(),
      estado: faker.location.state(),
      pais: faker.location.country(),
    });
  }
  return data;
};

const saveDataToExcel = async (data, filename) => {
  // Garante a criação da pasta assets antes de salvar o arquivo
  const assetsPath = path.join(__dirname, "assets");
  if (!fs.existsSync(assetsPath)) {
    fs.mkdirSync(assetsPath, { recursive: true });
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Dados");

  sheet.columns = [
    { header: "Nome Cliente", key: "nome_cliente", width: 30 },
    { header: "Email", key: "email", width: 25 },
    { header: "Nascimento", key: "nascimento", width: 15 },
    { header: "CEP", key: "cep", width: 15 },
    { header: "Logradouro", key: "logradouro", width: 30 },
    { header: "Bairro", key: "bairro", width: 20 },
    { header: "Cidade", key: "cidade", width: 20 },
    { header: "Estado", key: "estado", width: 15 },
    { header: "País", key: "pais", width: 15 },
  ];

  sheet.addRows(data);

  // Salva o arquivo na pasta assets
  await workbook.xlsx.writeFile(path.join(assetsPath, filename));
  console.log(`Arquivo ${filename} salvo com sucesso.`);
};

const main = async () => {
  const totalRecords = 10000; // Ajuste conforme necessário
  const data = await generateData(totalRecords);
  const filename = `random_data_${totalRecords}.xlsx`;
  await saveDataToExcel(data, filename);
};

main().catch(console.error);
