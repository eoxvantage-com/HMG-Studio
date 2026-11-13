"""Build self-contained private Taruvi function source; never deploy or write data."""
from pathlib import Path
import argparse


def bundle():
    functions = Path(__file__).resolve().parents[1] / 'functions'
    domain = (functions / 'stock_ledger_domain.py').read_text(encoding='utf-8')
    adapter = (functions / 'stock_ledger.py').read_text(encoding='utf-8')
    import_line = 'from stock_ledger_domain import opening_event, prepare_command, project, canonical_hash, ledger_command'
    if adapter.count(import_line) != 1:
        raise ValueError('Unexpected adapter domain import')
    source = domain + '\n\n' + adapter.replace(import_line, '# Pure domain helpers are bundled above.')
    compile(source, '<stock-ledger-bundle>', 'exec')
    return source


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    args.output.write_text(bundle(), encoding='utf-8')


if __name__ == '__main__':
    main()
