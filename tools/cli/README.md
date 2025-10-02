# ppctl - Polyglot Playground CLI

`ppctl` is a command-line tool for interacting with the Polyglot Playground project.

## Building

To build the CLI, run the following command:
```bash
cargo build --release
```
The executable will be located at `target/release/ppctl`.

## Usage

### Start a local service
```bash
./target/release/ppctl dev --service user --impl rust
```

### Swap a runtime
```bash
./target/release/ppctl swap --service user --impl go
```

### Run a benchmark
```bash
./target/release/ppctl benchmark --service user --impl rust --duration 30
```
