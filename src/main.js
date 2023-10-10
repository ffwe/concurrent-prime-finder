const { fork } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

function createExecutionFolder() {
  const executionDateTime = new Date().toString().replace(/:/g, '-');
  const folderName = `execution_${executionDateTime}`;
  const logsFolderPath = path.join(__dirname, '../logs');
  const folderPath = path.join(logsFolderPath, folderName);

  return fs.mkdir(logsFolderPath, { recursive: true })  // Ensure 'logs' folder exists
    .then(() => fs.mkdir(folderPath))  // Create the execution folder
    .then(() => folderPath)
    .catch(error => {
      console.error('Error creating execution folder:', error);
      throw error;
    });
}


function findPrimesUsingWorker(workerCount, maxNumber, executionFolder) {
  const numbersPerWorker = Math.ceil(maxNumber / workerCount);
  const workers = [];
  let completedWorkers = 0;
  let primeLists = [];
  let workerRanges = [];

  let start = 2;

  for (let i = 0; i < workerCount; i++) {
    const end = Math.min(start + numbersPerWorker - 1, maxNumber);
    workerRanges.push(`Worker ${i + 1} searching range: ${start} to ${end}`);

    const worker = fork('./src/primeWorker.js');

    worker.on('message', ({ primes }) => {
      primeLists[i] = primes;
      completedWorkers++;

      if (completedWorkers === workerCount) {
        const endTime = Date.now();

        const logFileName = `log.txt`;
        const logFilePath = path.join(executionFolder, logFileName);

        return fs.writeFile(logFilePath, workerRanges.join('\n'))
          .then(() => fs.appendFile(logFilePath, `\n\nExecution Date/Time: ${new Date()}\nWorker Count: ${workerCount}\nMax Number: ${maxNumber}\nTime Taken: ${endTime - startTime}ms`))
          .then(() => {
            const primesFileName = `primes.txt`;
            const primesFilePath = path.join(executionFolder, primesFileName);

            const chunks = [];
            const chunkSize = 1000;

            for (let j = 0; j < primeLists.length; j += chunkSize) {
              chunks.push(primeLists.slice(j, j + chunkSize).join('\n'));
            }

            return Promise.all(chunks.map((chunk, index) => {
              const chunkFileName = `primes_chunk_${index}.txt`;
              const chunkFilePath = path.join(executionFolder, chunkFileName);
              return fs.writeFile(chunkFilePath, chunk);
            }));
          })
          .then(() => {
            workers.forEach(worker => worker.kill());
          })
          .catch(error => {
            console.error('Error writing to files:', error);
            return fs.appendFile(path.join(executionFolder, 'error.txt'), `${error.stack}\n`);
          });
      }
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        return fs.appendFile(path.join(executionFolder, 'error.txt'), `Worker ${worker.pid} exited with code ${code}.\n`);
      }
    });

    workers.push(worker);
    worker.send({ start, end });
    start = end + 1;
  }
}

const workerCount = parseInt(process.argv[2], 10) || 1;
const maxNumber = parseInt(process.argv[3], 10) || 10000;

const startTime = Date.now();

createExecutionFolder()
  .then(executionFolder => findPrimesUsingWorker(workerCount, maxNumber, executionFolder))
  .catch(error => {
    console.error('An error occurred:', error);
    return fs.appendFile('error.txt', `${error.stack}\n`);
  });
