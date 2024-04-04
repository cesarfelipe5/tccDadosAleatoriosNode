import { faker } from "@faker-js/faker";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

// Criar __dirname com base em import.meta.url
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

const combineExcelFiles = async (files, outputFile) => {
  const outputStream = fs.createWriteStream(outputFile);
  const workbookWriter = new ExcelJS.stream.xlsx.WorkbookWriter({
    stream: outputStream,
    useStyles: false,
    useSharedStrings: false,
  });
  const worksheet = workbookWriter.addWorksheet("Dados Combinados");
  worksheet.columns = [
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
  for (const file of files) {
    console.log("Combinando arquivos...");

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

const saveDataToExcel = async (data, filename) => {
  // Garante a criação da pasta assets antes de salvar o arquivo
  const assetsPath = path.join(__dirname, "assets");
  if (!fs.existsSync(assetsPath)) {
    fs.mkdirSync(assetsPath, { recursive: true });
  }

  console.log("1 - saveDataToExcel -> assetsPath", assetsPath);

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

  console.log("2 - saveDataToExcel -> assetsPath", assetsPath);

  // Correção aplicada aqui
  await workbook.xlsx.writeFile(path.join(assetsPath, filename));

  console.log("3 - saveDataToExcel -> assetsPath", assetsPath);

  console.log(`Arquivo ${filename} salvo com sucesso.`);
};

// Funções generateData, combineExcelFiles, e saveDataToExcel permanecem inalteradas

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Quantos registros você deseja gerar? ", (totalRecordsInput) => {
  const totalRecords = parseInt(totalRecordsInput);
  if (isNaN(totalRecords) || totalRecords <= 0) {
    console.error("Por favor, insira um número válido de registros.");
    rl.close();
    return;
  }

  const assetsPath = path.join(__dirname, "assets");
  if (!fs.existsSync(assetsPath)) {
    fs.mkdirSync(assetsPath, { recursive: true });
  }

  (async () => {
    if (totalRecords < 100000) {
      // Se menos de 100000 registros, gerar em um único arquivo
      const data = await generateData(totalRecords);

      const filename = `random_data_${totalRecords}.xlsx`;

      await saveDataToExcel(data, filename);

      console.log("saveDataToExcel");
    } else {
      // Se 100000 ou mais, dividir em vários arquivos de 100000 registros cada
      const filesToGenerate = Math.ceil(totalRecords / 100000);

      let files = [];

      for (let i = 0; i < filesToGenerate; i++) {
        const recordsToGenerate =
          i === filesToGenerate - 1 ? totalRecords % 100000 || 100000 : 100000;

        const data = await generateData(recordsToGenerate);

        console.log("generateData else");

        const filename = `part_${i + 1}_data.xlsx`;

        await saveDataToExcel(data, filename);

        files.push(path.join(assetsPath, filename));
      }

      const combinedFilePath = `random_data_${totalRecords}.xlsx`;

      await combineExcelFiles(files, path.join(assetsPath, combinedFilePath));

      // Exclui os arquivos temporários
      files.forEach((file) => fs.unlinkSync(file));
    }

    console.log("Operação concluída com sucesso.");
    rl.close();
  })();
});
