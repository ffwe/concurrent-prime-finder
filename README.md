# Concurrent Prime Finder

This is a Node.js program that finds prime numbers up to a specified maximum number using a concurrent approach. It leverages multiple workers to search for prime numbers concurrently.

## Usage

1. Install the necessary dependencies using npm:

   ```sh
   npm install
   ```

2. Run the program with the desired number of workers and the maximum number:

   ```sh
   npm start <workerCount> <maxNumber>
   ```

   Replace `<workerCount>` with the desired number of workers (e.g., 3) and `<maxNumber>` with the maximum number up to which you want to find prime numbers.

## Example

To find prime numbers up to 100 using 3 workers:

```sh
npm start 3 100
```

## Folder Structure

- `src/`: Contains the source code files.
- `logs/`: Execution logs and results will be stored in this directory.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.