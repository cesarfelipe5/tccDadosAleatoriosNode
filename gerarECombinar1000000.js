import { faker } from "@faker-js/faker";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Criar __dirname com base em import.meta.url
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const combineExcelFiles = async (files, outputFile) => {
  const outputStream = fs.createWriteStream(outputFile);
  const workbookWriter = new ExcelJS.stream.xlsx.WorkbookWriter({
    stream: outputStream,
    useStyles: false,
    useSharedStrings: false,
  });
  const worksheet = workbookWriter.addWorksheet("Dados Combinados");

  worksheet.columns = [
    { header: "nome_cliente", key: "nome_cliente", width: 30 },
    { header: "email", key: "email", width: 25 },
    { header: "nascimento", key: "nascimento", width: 15 },
    { header: "cep", key: "cep", width: 15 },
    { header: "logradouro", key: "logradouro", width: 30 },
    { header: "bairro", key: "bairro", width: 20 },
    { header: "cidade", key: "cidade", width: 20 },
    { header: "estado", key: "estado", width: 15 },
    { header: "pais", key: "pais", width: 15 },
  ];

  for (const file of files) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file);
    const worksheetReader = workbook.getWorksheet(1);

    worksheetReader.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        // Ignora o cabeçalho dos arquivos após o primeiro
        worksheet.addRow(row.values.slice(1)).commit(); // slice(1) para remover o primeiro valor vazio
      }
    });
  }

  await workbookWriter.commit();
  console.log(`Arquivo combinado ${outputFile} foi criado com sucesso.`);
};

const generateData = async (numRecords) => {
  const data = [];
  for (let i = 0; i < numRecords; i++) {
    data.push({
      nome_cliente: faker.person.fullName(),
      email: faker.internet.email(),
      nascimento: faker.date.birthdate().toISOString().split("T")[0],
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
  // Garante a criação da pasta assets antes de salvar o arquivo
  const assetsPath = path.join(__dirname, "assets");
  if (!fs.existsSync(assetsPath)) {
    fs.mkdirSync(assetsPath, { recursive: true });
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Dados");

  sheet.columns = [
    { header: "nome_cliente", key: "nome_cliente", width: 30 },
    { header: "email", key: "email", width: 25 },
    { header: "nascimento", key: "nascimento", width: 15 },
    { header: "cep", key: "cep", width: 15 },
    { header: "logradouro", key: "logradouro", width: 30 },
    { header: "bairro", key: "bairro", width: 20 },
    { header: "cidade", key: "cidade", width: 20 },
    { header: "estado", key: "estado", width: 15 },
    { header: "pais", key: "pais", width: 15 },
  ];

  sheet.addRows(data);

  // Salva o arquivo na pasta assets
  await workbook.xlsx.writeFile(path.join(assetsPath, filename));
  console.log(`Arquivo ${filename} salvo com sucesso.`);
};

const main = async () => {
  const totalRecords = 1000000; // Total de registros desejados
  const filesToGenerate = 10; // Número de arquivos a serem gerados
  const recordsPerFile = totalRecords / filesToGenerate; // Registros por arquivo

  let files = [];

  for (let i = 0; i < filesToGenerate; i++) {
    const data = await generateData(recordsPerFile);
    const filename = `part_${i + 1}_data.xlsx`;
    await saveDataToExcel(data, filename); // Salvando os dados em arquivos temporários
    files.push(filename); // Mantém apenas o nome do arquivo para a exclusão
  }

  // Caminho do arquivo combinado
  const combinedFilePath = `random_data_${totalRecords}.xlsx`;
  await combineExcelFiles(
    files.map((file) => path.join(__dirname, "assets", file)),
    path.join(__dirname, "assets", combinedFilePath),
  );

  // Exclui os arquivos temporários da pasta assets
  files.forEach((file) => fs.unlinkSync(path.join(__dirname, "assets", file)));
  console.log("Arquivos temporários excluídos com sucesso.");
};

main().catch(console.error);
